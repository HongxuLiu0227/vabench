"""Requirement enrichment stage for single-view generation."""

from __future__ import annotations

from pathlib import Path
from typing import Dict, List

from agent_pipeline.pipeline.context import PipelineState, ProductSpec
from agent_pipeline.pipeline.stage import PipelineStage, StageOutput
from agent_pipeline.pipeline.utils import ensure_directory

from ...config import PipelineConfig
from ...logging_config import get_logger

logger = get_logger(__name__)


class RequirementArchitectStage(PipelineStage):
    """Build a concise, single-view requirements dossier from the raw prompt."""

    def __init__(self) -> None:
        super().__init__(
            name="requirement_enrichment",
            description="Expand the prompt into a single-view implementation brief.",
            produces=["product_spec"],
        )

    def execute(self, state: PipelineState, config: PipelineConfig, knowledge_base) -> StageOutput:
        prompt_text = (state.prompt or "").strip()
        if not prompt_text:
            raise ValueError("Requirement enrichment stage requires a non-empty prompt.")

        enriched_prompt = self._build_enriched_prompt(prompt_text)
        analysis: Dict[str, object] = {
            "mode": "single_view",
            "enriched_prompt": enriched_prompt,
            "constraints": [
                "single view only",
                "single route only",
                "no multi-page navigation",
                "production-quality interactions",
                "if the view is chart-centric, use D3 for rendering",
            ],
        }

        spec = ProductSpec(
            raw_prompt=prompt_text,
            enriched_prompt=enriched_prompt,
            analysis=analysis,
            metadata={
                "domain_hint": "single_view",
                "knowledge_base_excerpt": knowledge_base.ant_patterns()[:500],
            },
        )

        requirements_path = self._write_requirements_md(state, enriched_prompt)

        extras = dict(state.extras)
        extras["enriched_prompt"] = enriched_prompt
        extras["requirements_doc"] = str(requirements_path)

        return StageOutput(
            state_updates={"product_spec": spec, "extras": extras},
            artifacts={
                "requirement_analysis.json": analysis,
                str(requirements_path): requirements_path.read_text(encoding="utf-8"),
            },
            metrics={
                "enriched_length": len(enriched_prompt),
                "expansion_ratio": len(enriched_prompt) / max(len(prompt_text), 1),
            },
            quality={"complexity_score": 0.8},
        )

    def _build_enriched_prompt(self, prompt: str) -> str:
        return f"""
You are generating a high-quality React + TypeScript + Ant Design application with STRICT single-view scope.

User request:
{prompt}

Mandatory constraints:
1. Build exactly one primary view and present it at `/`.
2. Do not create multiple pages or multi-route navigation flows.
3. Keep all features within the same view using sections, cards, tabs, drawers, modals, and progressive disclosure.
4. Use realistic structured data for charts/tables/forms.
5. Every button, filter, and form must perform meaningful state updates.
6. Deliver production-quality UI polish, responsive layout, and no placeholder text.
7. If the created single view is a data visualization/chart view, charts must be rendered with D3 (not chart wrapper libraries).
""".strip()

    def _write_requirements_md(self, state: PipelineState, summary: str) -> Path:
        docs_dir = state.paths.output_dir / "docs"
        ensure_directory(docs_dir)
        doc_path = docs_dir / "requirements.md"

        lines: List[str] = [
            "# Single-View Project Requirements",
            "",
            summary,
            "",
        ]

        doc_path.write_text("\n".join(lines), encoding="utf-8")
        logger.info("Wrote enriched requirements to %s", doc_path)
        return doc_path


__all__ = ["RequirementArchitectStage"]
