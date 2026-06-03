"""Requirement enrichment stage (local LLM agent)."""

from __future__ import annotations

import hashlib
import json
import os
import shutil
from pathlib import Path
from typing import Any
from typing import Dict, Iterable, List

from ...agents.requirement_analysis_agent import analyze_requirements
from ...agents.tableau_requirement_generation_agent import (
    build_tableau_render_contract_prompt_block,
    derive_tableau_render_contract,
    extract_tableau_structured_spec,
    generate_tableau_requirements_template,
    post_process_tableau_prompt,
    prepare_tableau_data_assets,
)
from ...config import PipelineConfig
from ...logging_config import get_logger
from ..context import PipelineState, ProductSpec
from ..gating import ComplexityGate
from ..knowledge_base import KnowledgeBase
from ..stage import PipelineStage, StageOutput
from ..utils import ensure_directory

logger = get_logger(__name__)

TABLEAU_REQUIREMENT_CACHE_VERSION = "tableau_requirements_v2"
GENERAL_REQUIREMENT_CACHE_VERSION = "requirements_v1"


def _cache_root() -> Path:
    # Read from env at runtime so tests/callers can override without relying on import order.
    return Path(os.getenv("PIPELINE_CACHE_ROOT", ".pipeline_cache")).resolve()


class RequirementArchitectStage(PipelineStage):
    """Generate a production-ready requirements doc using the direct LLM agent."""

    def __init__(self) -> None:
        super().__init__(
            name="requirement_enrichment",
            description="Expand the raw prompt into a detailed requirements dossier.",
            produces=["product_spec"],
            gates=[ComplexityGate()],
        )

    def execute(
        self,
        state: PipelineState,
        config: PipelineConfig,
        knowledge_base: KnowledgeBase,
    ) -> StageOutput:
        prompt_text = (state.prompt or "").strip()
        if not prompt_text:
            raise ValueError("Requirement enrichment stage requires a non-empty prompt.")

        is_tableau_mode = bool(state.extras.get("tableau_input_dir")) or state.extras.get("mode") == "tableau"

        tableau_context: Dict[str, Any] = {}
        tableau_render_contract: Dict[str, Any] = {}
        if is_tableau_mode:
            tableau_input_dir_raw = state.extras.get("tableau_input_dir")
            if not tableau_input_dir_raw:
                raise ValueError("Tableau mode enabled but 'tableau_input_dir' is missing from pipeline extras.")
            tableau_input_dir = Path(str(tableau_input_dir_raw)).expanduser().resolve()
            if not tableau_input_dir.exists() or not tableau_input_dir.is_dir():
                raise NotADirectoryError(f"Invalid tableau_input_dir: {tableau_input_dir}")
            tableau_context = prepare_tableau_data_assets(
                tableau_input_dir,
                output_dir=state.paths.output_dir,
                sample_rows=10,
            )

            # Preserve the original workbook definition alongside requirements for downstream agents.
            twb_path_raw = state.extras.get("tableau_twb_path")
            if twb_path_raw:
                try:
                    twb_src = Path(str(twb_path_raw)).expanduser().resolve()
                    if twb_src.exists() and twb_src.is_file():
                        docs_dir = state.paths.output_dir / "docs"
                        ensure_directory(docs_dir)
                        twb_dest = docs_dir / twb_src.name
                        if not twb_dest.exists():
                            shutil.copy2(twb_src, twb_dest)
                        tableau_context["tableau_twb_copy"] = str(twb_dest)
                except Exception as exc:  # pragma: no cover - best effort
                    logger.warning("Failed to copy Tableau .twb into output docs: %s", exc)

            docs_dir = state.paths.output_dir / "docs"
            ensure_directory(docs_dir)
            tableau_spec_path = docs_dir / "tableau_spec.json"
            tableau_spec: Dict[str, Any]
            try:
                tableau_spec = extract_tableau_structured_spec(prompt_text)
            except Exception as exc:
                logger.warning("Failed to parse Tableau workbook into structured spec: %s", exc)
                tableau_spec = {
                    "schema_version": "tableau_spec_v1",
                    "workbook": {"tag": "workbook", "attributes": {}},
                    "worksheets": [],
                    "dashboard_zones": [],
                    "dashboard_text_zones": [],
                    "dashboards": [],
                    "dashboard_actions": [],
                    "highlight_bindings": [],
                    "summary": {
                        "worksheet_count": 0,
                        "dashboard_count": 0,
                        "dashboard_text_zone_count": 0,
                        "dashboard_action_count": 0,
                        "highlight_binding_count": 0,
                        "parse_error": str(exc),
                    },
                }
            tableau_spec_path.write_text(
                json.dumps(tableau_spec, ensure_ascii=False, indent=2),
                encoding="utf-8",
            )
            tableau_context["tableau_spec_path"] = str(tableau_spec_path)
            tableau_context["tableau_spec_summary"] = tableau_spec.get("summary", {})

            tableau_render_contract_path = docs_dir / "tableau_render_contract.json"
            try:
                tableau_render_contract = derive_tableau_render_contract(tableau_spec)
            except Exception as exc:
                logger.warning("Failed to derive Tableau render contract: %s", exc)
                tableau_render_contract = {
                    "schema_version": "tableau_render_contract_v1",
                    "dashboard_size": {},
                    "worksheets": [],
                    "dashboard_text_zones": [],
                    "dashboard_actions": [],
                    "highlight_bindings": [],
                    "summary": {
                        "worksheet_count": 0,
                        "dashboard_text_zone_count": 0,
                        "dashboard_action_count": 0,
                        "highlight_binding_count": 0,
                        "derive_error": str(exc),
                    },
                }
            tableau_render_contract_path.write_text(
                json.dumps(tableau_render_contract, ensure_ascii=False, indent=2),
                encoding="utf-8",
            )
            tableau_context["tableau_render_contract_path"] = str(tableau_render_contract_path)
            tableau_context["tableau_render_contract_summary"] = tableau_render_contract.get("summary", {})

        cache_dir = _cache_root() / "requirement_cache"
        cache_dir.mkdir(parents=True, exist_ok=True)
        if is_tableau_mode:
            manifest_for_cache = json.dumps(
                tableau_context.get("data_files_manifest") or [],
                ensure_ascii=True,
                sort_keys=True,
            )
            cache_seed = f"tableau:{TABLEAU_REQUIREMENT_CACHE_VERSION}:{prompt_text}\n{manifest_for_cache}"
        else:
            cache_seed = f"default:{GENERAL_REQUIREMENT_CACHE_VERSION}:{prompt_text}"
        cache_key = hashlib.sha256(cache_seed.encode("utf-8")).hexdigest()
        cache_path = cache_dir / f"{cache_key}.json"

        if cache_path.exists():
            analysis_base = json.loads(cache_path.read_text(encoding="utf-8"))
            logger.info("Loaded requirement analysis from cache: %s", cache_path)
        else:
            if is_tableau_mode:
                try:
                    analysis_base = generate_tableau_requirements_template(
                        prompt_text,
                        primary_data_url=tableau_context.get("primary_data_url"),
                        data_files_manifest=tableau_context.get("data_files_manifest") or [],
                    ) or {}
                except Exception as exc:
                    logger.error("Tableau requirement generation failed; falling back to a minimal template: %s", exc)
                    twb_hint = tableau_context.get("tableau_twb_copy") or state.extras.get("tableau_twb_path") or ""
                    data_hint = tableau_context.get("primary_data_url") or "/data/<your-file>"
                    analysis_base = {
                        "enriched_prompt": (
                            "Recreate the Tableau dashboard defined by the provided .twb workbook using "
                            "React + TypeScript (Vite) with D3-based charting.\n\n"
                            "Constraints:\n"
                            "- Treat the Tableau workbook as ground truth for layout, worksheets, chart types, and interactions.\n"
                            "- Do not invent new visuals or rearrange content.\n\n"
                            f"Workbook reference: {twb_hint or '(not available)'}\n"
                            f"Primary data URL: {data_hint}\n\n"
                            "## Sample Data (10 rows)\n"
                            "```json\n"
                            "{{SAMPLE_DATA}}\n"
                            "```\n\n"
                            "## Data Loading (Full Dataset)\n"
                            "Fetch the full dataset from the URLs under /data/... (Vite public folder) and parse it in the browser.\n"
                        )
                    }
            else:
                analysis_base = analyze_requirements(prompt_text) or {}
            cache_path.write_text(json.dumps(analysis_base, ensure_ascii=False, indent=2), encoding="utf-8")

        if not isinstance(analysis_base, dict):
            analysis_base = {"enriched_prompt": str(analysis_base)}

        analysis: Dict[str, Any] = dict(analysis_base)
        enriched_prompt = analysis.get("enriched_prompt") if isinstance(analysis, dict) else None
        if not isinstance(enriched_prompt, str) or not enriched_prompt.strip():
            enriched_prompt = prompt_text

        if is_tableau_mode:
            enriched_prompt = post_process_tableau_prompt(
                enriched_prompt,
                sample_data_json=str(tableau_context.get("sample_data_json") or "[]"),
                primary_data_url=tableau_context.get("primary_data_url"),
                data_files_manifest=tableau_context.get("data_files_manifest") or [],
            )
            render_contract_path = tableau_context.get("tableau_render_contract_path")
            enriched_prompt = (
                enriched_prompt.strip()
                + "\n\n"
                + build_tableau_render_contract_prompt_block(
                    tableau_render_contract,
                    contract_path=str(render_contract_path) if isinstance(render_contract_path, str) else None,
                )
            ).strip()
            analysis["enriched_prompt"] = enriched_prompt
            analysis["tableau_context"] = {
                k: v
                for k, v in tableau_context.items()
                if k in (
                    "primary_data_url",
                    "data_files_manifest",
                    "public_data_dir",
                    "tableau_twb_copy",
                    "tableau_spec_path",
                    "tableau_spec_summary",
                    "tableau_render_contract_path",
                    "tableau_render_contract_summary",
                )
            }

        personas = _coerce_list(analysis.get("personas"))
        domain = analysis.get("domain") or "general_business"

        spec = ProductSpec(
            raw_prompt=prompt_text,
            enriched_prompt=enriched_prompt,
            analysis=analysis if isinstance(analysis, dict) else {"enriched_prompt": enriched_prompt},
            metadata={
                "personas": personas,
                "domain": domain,
                "knowledge_base_excerpt": knowledge_base.ant_patterns()[:500],
            },
        )

        requirements_path = self._write_requirements_md(state, enriched_prompt, analysis)

        extras = dict(state.extras)
        extras["enriched_prompt"] = enriched_prompt
        extras["requirement_analysis"] = analysis
        if is_tableau_mode:
            extras["tableau_context"] = analysis.get("tableau_context", {})
        extras["requirements_doc"] = str(requirements_path)

        artifacts = {
            "requirement_analysis.json": analysis,
            str(requirements_path): requirements_path.read_text(encoding="utf-8"),
        }
        if is_tableau_mode:
            tableau_spec_path = analysis.get("tableau_context", {}).get("tableau_spec_path")
            if isinstance(tableau_spec_path, str):
                path_obj = Path(tableau_spec_path)
                if path_obj.exists():
                    artifacts[str(path_obj)] = path_obj.read_text(encoding="utf-8")
            tableau_contract_path = analysis.get("tableau_context", {}).get("tableau_render_contract_path")
            if isinstance(tableau_contract_path, str):
                path_obj = Path(tableau_contract_path)
                if path_obj.exists():
                    artifacts[str(path_obj)] = path_obj.read_text(encoding="utf-8")

        return StageOutput(
            state_updates={"product_spec": spec, "extras": extras},
            artifacts=artifacts,
            metrics={
                "enriched_length": len(enriched_prompt),
                "expansion_ratio": len(enriched_prompt) / max(len(prompt_text), 1),
            },
            quality={"complexity_score": 0.85},
        )

    def _write_requirements_md(self, state: PipelineState, summary: str, analysis: Dict) -> Path:
        docs_dir = state.paths.output_dir / "docs"
        ensure_directory(docs_dir)
        doc_path = docs_dir / "requirements.md"

        sections = [
            ("Executive Summary", summary.strip()),
            # ("Personas", _format_bullets(_coerce_list(analysis.get("personas")))),
            # ("Key Features", _format_bullets(_coerce_list(analysis.get("functional_requirements")))),
            # (
            #     "Screens & Components",
            #     _format_bullets(
            #         _coerce_list(analysis.get("screens"))
            #         or _coerce_list(analysis.get("components"))
            #     ),
            # ),
            # (
            #     "Data & APIs",
            #     _format_bullets(
            #         _coerce_list(analysis.get("data_models"))
            #         or _coerce_list(analysis.get("data_requirements"))
            #     ),
            # ),
            # ("Testing Strategy", _format_bullets(_coerce_list(analysis.get("testing_strategy")))),
            # (
            #     "Non-functional Requirements",
            #     _format_bullets(_coerce_list(analysis.get("non_functional_requirements"))),
            # ),
        ]

        lines: List[str] = ["# Project Requirements", ""]
        for title, body in sections:
            # lines.append(f"## {title}")
            lines.append(body or "- TBD")
            lines.append("")

        doc_path.write_text("\n".join(lines).strip() + "\n", encoding="utf-8")
        logger.info("Wrote enriched requirements to %s", doc_path)
        return doc_path


def _coerce_list(value) -> List[str]:
    if not value:
        return []
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]
    return [str(value).strip()]


def _format_bullets(items: Iterable[str]) -> str:
    items = [item for item in items if item]
    if not items:
        return "- TBD"
    return "\n".join(f"- {item}" for item in items)


__all__ = ["RequirementArchitectStage"]
