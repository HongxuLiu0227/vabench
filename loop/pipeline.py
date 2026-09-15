"""Single-pass pipeline: inputs -> scaffold -> one-shot generation."""

from __future__ import annotations

import json
import os
import shutil
import uuid
from dataclasses import replace
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List

from multi_agent_new.agents.scaffold_agent import scaffold_with_vite
from multi_agent_new.config import build_default_config
from multi_agent_new.pipeline.context import PipelinePaths, PipelineState, WorkspaceArtifact
from multi_agent_new.pipeline.knowledge_base import KnowledgeBase
from multi_agent_new.pipeline.scheduler import PipelineScheduler
from multi_agent_new.pipeline.stage import StageResult

from .fix_stages import VisionBugFixStage, VisionPlaceholderFixStage, VisionRenderFixStage

from .claude_driver import ClaudeDriver
from .logging_config import get_logger
from .utils import ensure_directory, profile_csv, read_json_file, write_json

logger = get_logger(__name__)


@dataclass(frozen=True)
class PipelineInputs:
    image_path: Path
    interaction_contract_path: Path
    data_dir: Path
    output_dir: Path
    gt_root: Path
    force: bool = False


def resolve_gt_inputs(gt_dir: str) -> Dict[str, Path]:
    gt_root = Path(gt_dir).expanduser().resolve()
    docs_dir = gt_root / "docs"
    data_dir = gt_root / "public" / "data"
    image_path = docs_dir / "image.png"
    interaction_contract_path = docs_dir / "interaction_contract.json"

    if not gt_root.exists() or not gt_root.is_dir():
        raise NotADirectoryError(f"GT project directory not found: {gt_root}")
    if not docs_dir.exists() or not docs_dir.is_dir():
        raise NotADirectoryError(f"GT docs directory not found: {docs_dir}")
    if not data_dir.exists() or not data_dir.is_dir():
        raise NotADirectoryError(f"GT data directory not found: {data_dir}")
    if not image_path.exists() or not image_path.is_file():
        raise FileNotFoundError(f"GT screenshot not found: {image_path}")
    if not interaction_contract_path.exists() or not interaction_contract_path.is_file():
        raise FileNotFoundError(f"GT interaction contract not found: {interaction_contract_path}")

    return {
        "gt_root": gt_root,
        "image_path": image_path,
        "interaction_contract_path": interaction_contract_path,
        "data_dir": data_dir,
    }


def _infer_gt_root(image_path: Path, interaction_contract_path: Path, data_dir: Path) -> Path:
    common_path = Path(os.path.commonpath([image_path, interaction_contract_path, data_dir]))
    if common_path == data_dir:
        common_path = data_dir.parent
    return common_path


def _default_generation_root(gt_root: Path) -> Path:
    base_dir = gt_root.parent.parent if gt_root.parent != gt_root else gt_root.parent
    return base_dir / "generation-app"


def resolve_pipeline_paths(
    *,
    gt_dir: str | None = None,
    image_path: str | None = None,
    interaction_contract_path: str | None = None,
    data_dir: str | None = None,
) -> Dict[str, Path]:
    if gt_dir:
        return resolve_gt_inputs(gt_dir)

    if not image_path or not interaction_contract_path or not data_dir:
        raise ValueError("Provide either gt_dir or all of image_path, interaction_contract_path, and data_dir.")

    resolved_image_path = Path(image_path).expanduser().resolve()
    resolved_interaction_path = Path(interaction_contract_path).expanduser().resolve()
    resolved_data_dir = Path(data_dir).expanduser().resolve()
    gt_root = _infer_gt_root(resolved_image_path, resolved_interaction_path, resolved_data_dir)

    return {
        "gt_root": gt_root,
        "image_path": resolved_image_path,
        "interaction_contract_path": resolved_interaction_path,
        "data_dir": resolved_data_dir,
    }


def infer_output_dir(
    *,
    gt_dir: str | None = None,
    image_path: str | None = None,
    interaction_contract_path: str | None = None,
    data_dir: str | None = None,
    output_dir: str | None = None,
) -> Path:
    resolved_inputs = resolve_pipeline_paths(
        gt_dir=gt_dir,
        image_path=image_path,
        interaction_contract_path=interaction_contract_path,
        data_dir=data_dir,
    )
    gt_root = resolved_inputs["gt_root"]

    if output_dir:
        return Path(output_dir).expanduser().resolve()

    return _default_generation_root(gt_root) / gt_root.name


def _validate_inputs(inputs: PipelineInputs) -> List[Path]:
    if not inputs.image_path.exists() or not inputs.image_path.is_file():
        raise FileNotFoundError(f"Image not found: {inputs.image_path}")
    if not inputs.interaction_contract_path.exists() or not inputs.interaction_contract_path.is_file():
        raise FileNotFoundError(f"Interaction contract not found: {inputs.interaction_contract_path}")
    if not inputs.data_dir.exists() or not inputs.data_dir.is_dir():
        raise NotADirectoryError(f"Data directory not found: {inputs.data_dir}")

    csv_files = sorted(inputs.data_dir.glob("*.csv"))
    if not csv_files:
        raise FileNotFoundError(f"No CSV files found under: {inputs.data_dir}")
    return csv_files


def _prepare_workspace(output_dir: Path, force: bool) -> None:
    if output_dir.exists() and force:
        shutil.rmtree(output_dir)
    ensure_directory(output_dir)

    package_json = output_dir / "package.json"
    if package_json.exists():
        return

    logger.info("Scaffolding Vite React+TS workspace in %s", output_dir)
    scaffold_with_vite(output_dir.name, cwd=str(output_dir.parent))
    if not package_json.exists():
        raise RuntimeError(f"Scaffold failed; package.json missing in {output_dir}")

    index_css = output_dir / "src" / "index.css"
    if index_css.exists():
        index_css.write_text("", encoding="utf-8")


def _stage_inputs(
    inputs: PipelineInputs,
    csv_files: List[Path],
    docs_dir: Path,
    public_data_dir: Path,
) -> Dict[str, Any]:
    ensure_directory(docs_dir)
    ensure_directory(public_data_dir)

    copied_contract = docs_dir / "interaction_contract.json"
    if copied_contract.resolve() != inputs.interaction_contract_path:
        copied_contract.write_text(
            inputs.interaction_contract_path.read_text(encoding="utf-8"),
            encoding="utf-8",
        )

    copied_image = docs_dir / inputs.image_path.name
    if copied_image.resolve() != inputs.image_path:
        copied_image.write_bytes(inputs.image_path.read_bytes())

    copied_csv_files: List[Path] = []
    for source_csv in csv_files:
        target_csv = public_data_dir / source_csv.name
        if target_csv.resolve() != source_csv:
            target_csv.write_bytes(source_csv.read_bytes())
        copied_csv_files.append(target_csv)

    return {
        "image_path": copied_image,
        "interaction_contract_path": copied_contract,
        "csv_files": copied_csv_files,
    }


def _build_instruction(
    inputs: PipelineInputs,
    interaction_contract: Dict[str, Any],
    csv_profiles: List[Dict[str, Any]],
    staged_inputs: Dict[str, Any],
) -> str:
    worksheets = interaction_contract.get("catalog", {}).get("worksheets", [])
    bindings = interaction_contract.get("interactions", {}).get("highlight_bindings", [])
    dashboard_actions = interaction_contract.get("interactions", {}).get("dashboard_actions", [])
    worksheet_actions = interaction_contract.get("interactions", {}).get("worksheet_actions", [])

    csv_summary_lines = []
    for item in csv_profiles:
        columns = ", ".join(item["columns"][:20])
        csv_summary_lines.append(f"- {item['file_name']}: {item['column_count']} columns; columns={columns}")

    staged_image_path = Path(staged_inputs["image_path"]).relative_to(inputs.output_dir).as_posix()
    staged_contract_path = Path(staged_inputs["interaction_contract_path"]).relative_to(inputs.output_dir).as_posix()
    staged_csv_paths = [
        Path(path).relative_to(inputs.output_dir).as_posix()
        for path in staged_inputs["csv_files"]
    ]
    staged_csv_lines = "\n".join(f"- `{path}`" for path in staged_csv_paths)

    return f"""
Working directory: {inputs.output_dir}
You are generating the FINAL React+TypeScript code in a single pass.
Do not output plans. Perform edits directly.

Before making edits, inspect the provided inputs from the workspace using the Read tool:
- Read the screenshot at `{staged_image_path}`. This image is the visual source of truth and must be treated as a real image input, not as a filename hint.
- Read the interaction contract at `{staged_contract_path}`.
- Read the staged CSV files in `public/data`:
{staged_csv_lines}

Input provenance:
- GT root: {inputs.gt_root}
- Original screenshot path: {inputs.image_path}
- Original interaction contract path: {inputs.interaction_contract_path}
- Original CSV directory: {inputs.data_dir}

Visual requirements:
- Read and interpret the screenshot from `{staged_image_path}` before implementing the UI.
- Recreate layout, chart composition, typography hierarchy, spacing, and color feeling as closely as possible.
- Build a single-dashboard experience at `/`.

Interaction requirements (source of truth = interaction contract):
- Worksheet count from contract: {len(worksheets)}
- Highlight bindings: {len(bindings)}
- Dashboard actions: {len(dashboard_actions)}
- Worksheet actions: {len(worksheet_actions)}
- Implement contract-defined highlight/linkage behavior. If interaction and screenshot conflict, keep contract behavior.

Data requirements:
- Use ONLY real CSV data from `public/data`.
- Do not create fake datasets in `src/mocks` or `src/data`.
- Load CSV files via `fetch('/data/<file>.csv')`, parse in browser, and coerce numeric measures before aggregation.
- Use the staged files already present in `public/data`; do not assume any other data files exist.
- CSV overview:
{chr(10).join(csv_summary_lines)}

Engineering requirements:
- Keep project on React + TypeScript + Vite.
- Use D3 primitives (or thin wrappers around D3) for chart rendering.
- Ensure routes, controls, and selections trigger real state updates.
- Use named exports where practical.

Deliverables:
- A runnable React project in this workspace.
- README with how to run (`pnpm install`, `pnpm dev`, `pnpm build`).
""".strip()


def _load_package_json(project_root: Path) -> Dict[str, Any]:
    package_json_path = project_root / "package.json"
    if not package_json_path.exists():
        return {}

    try:
        payload = json.loads(package_json_path.read_text(encoding="utf-8"))
    except Exception:
        return {}
    return payload if isinstance(payload, dict) else {}


def _build_workspace_artifact(project_root: Path) -> WorkspaceArtifact:
    package_json = _load_package_json(project_root)
    dependencies = package_json.get("dependencies")
    dev_dependencies = package_json.get("devDependencies")

    return WorkspaceArtifact(
        root_path=project_root,
        package_manager="pnpm",
        config_files={},
        file_structure_manifest=[],
        package_json=package_json,
        dependencies=dependencies if isinstance(dependencies, dict) else {},
        dev_dependencies=dev_dependencies if isinstance(dev_dependencies, dict) else {},
    )


def _build_fix_state(
    *,
    inputs: PipelineInputs,
    staged_inputs: Dict[str, Any],
    csv_profiles: List[Dict[str, Any]],
    session_id: str,
) -> PipelineState:
    staged_image_path = Path(staged_inputs["image_path"]).relative_to(inputs.output_dir).as_posix()
    staged_contract_path = Path(staged_inputs["interaction_contract_path"]).relative_to(inputs.output_dir).as_posix()
    staged_csv_paths = [
        Path(path).relative_to(inputs.output_dir).as_posix()
        for path in staged_inputs["csv_files"]
    ]

    extras = {
        "mode": "single_pass_vision",
        "first_generation_session": session_id,
        "vision_context": {
            "gt_root": str(inputs.gt_root),
            "gt_name": inputs.gt_root.name,
            "image_path": str(inputs.image_path),
            "interaction_contract_path": str(inputs.interaction_contract_path),
            "data_dir": str(inputs.data_dir),
            "staged_image_path": staged_image_path,
            "staged_interaction_contract_path": staged_contract_path,
            "staged_csv_paths": staged_csv_paths,
            "csv_profiles": csv_profiles,
        },
    }

    return PipelineState(
        paths=PipelinePaths.from_output_dir(inputs.output_dir),
        prompt=f"Single-pass vision generation for {inputs.gt_root.name}",
        workspace=_build_workspace_artifact(inputs.output_dir),
        extras=extras,
    )


def _run_fix_pipeline(state: PipelineState) -> List[StageResult]:
    config = build_default_config()
    updated_stage_settings = dict(config.stage_settings)
    for stage_name in ("placeholder_fix", "bug_fix", "render_fix"):
        settings = updated_stage_settings.get(stage_name)
        if settings is None:
            continue
        updated_stage_settings[stage_name] = replace(settings, timeout_seconds=0)
    config = replace(
        config,
        stage_settings=updated_stage_settings,
        flags=replace(config.flags, fail_fast=False, visual_checks_enabled=False),
    )

    scheduler = PipelineScheduler(logger=logger)
    knowledge_base = KnowledgeBase(config.knowledge_base_root)
    stages = [
        VisionPlaceholderFixStage(),
        VisionBugFixStage(),
        VisionRenderFixStage(),
    ]

    write_json(
        state.paths.logs_dir / "fix_stage_run_context.json",
        {
            "output_dir": str(state.paths.output_dir),
            "mode": state.extras.get("mode"),
            "stage_order": [stage.name for stage in stages],
            "visual_checks_enabled": config.flags.visual_checks_enabled,
            "gate_checks_enabled": False,
            "fail_fast": config.flags.fail_fast,
            "stage_timeouts": {
                stage.name: config.stage(stage.name).timeout_seconds
                for stage in stages
            },
        },
    )
    return scheduler.run(
        stages=stages,
        state=state,
        config=config,
        knowledge_base=knowledge_base,
    )


def _collect_validation(state: PipelineState) -> Dict[str, Any]:
    validation: Dict[str, Any] = {}
    placeholder_residuals = state.extras.get("placeholder_residuals")
    if isinstance(placeholder_residuals, list):
        validation["placeholder_fix"] = {
            "passed": len(placeholder_residuals) == 0,
            "remaining_placeholders": placeholder_residuals,
        }

    for summary_key, validation_key in (
        ("bug_fix", "bug_fix_validation"),
        ("render_fix", "render_fix_validation"),
    ):
        payload = state.extras.get(validation_key)
        if isinstance(payload, dict):
            validation[summary_key] = payload
    return validation


def run_pipeline(
    *,
    gt_dir: str | None = None,
    image_path: str | None = None,
    interaction_contract_path: str | None = None,
    data_dir: str | None = None,
    output_dir: str | None = None,
    force: bool = False,
) -> Dict[str, Any]:
    resolved_inputs = resolve_pipeline_paths(
        gt_dir=gt_dir,
        image_path=image_path,
        interaction_contract_path=interaction_contract_path,
        data_dir=data_dir,
    )
    resolved_output_dir = infer_output_dir(
        gt_dir=gt_dir,
        image_path=image_path,
        interaction_contract_path=interaction_contract_path,
        data_dir=data_dir,
        output_dir=output_dir,
    )

    inputs = PipelineInputs(
        image_path=resolved_inputs["image_path"],
        interaction_contract_path=resolved_inputs["interaction_contract_path"],
        data_dir=resolved_inputs["data_dir"],
        output_dir=resolved_output_dir,
        gt_root=resolved_inputs["gt_root"],
        force=force,
    )

    csv_files = _validate_inputs(inputs)
    _prepare_workspace(inputs.output_dir, inputs.force)

    docs_dir = inputs.output_dir / "docs"
    logs_dir = inputs.output_dir / "pipeline_logs"
    public_data_dir = inputs.output_dir / "public" / "data"
    ensure_directory(docs_dir)
    ensure_directory(logs_dir)
    ensure_directory(public_data_dir)

    interaction_contract = read_json_file(inputs.interaction_contract_path)
    csv_profiles = [profile_csv(path) for path in csv_files]
    staged_inputs = _stage_inputs(inputs, csv_files, docs_dir, public_data_dir)
    write_json(docs_dir / "input_manifest.json", {
        "gt_root": str(inputs.gt_root),
        "gt_name": inputs.gt_root.name,
        "image_path": str(inputs.image_path),
        "interaction_contract_path": str(inputs.interaction_contract_path),
        "data_dir": str(inputs.data_dir),
        "csv_files": [str(path) for path in csv_files],
        "staged_image_path": str(staged_inputs["image_path"]),
        "staged_interaction_contract_path": str(staged_inputs["interaction_contract_path"]),
        "staged_csv_files": [str(path) for path in staged_inputs["csv_files"]],
        "output_dir": str(inputs.output_dir),
    })
    write_json(docs_dir / "data_profile.json", {"files": csv_profiles})

    instruction = _build_instruction(inputs, interaction_contract, csv_profiles, staged_inputs)
    (logs_dir / "first_generation_instruction.txt").write_text(instruction + "\n", encoding="utf-8")

    session_id = str(uuid.uuid4())
    logger.info("Running single-pass first generation with Claude SDK")
    driver = ClaudeDriver(timeout_seconds=7200)
    output = driver.run(instruction, inputs.output_dir, session_id=session_id)
    (logs_dir / "first_generation.log").write_text(output + "\n", encoding="utf-8")

    fix_state = _build_fix_state(
        inputs=inputs,
        staged_inputs=staged_inputs,
        csv_profiles=csv_profiles,
        session_id=session_id,
    )
    stage_results = _run_fix_pipeline(fix_state)
    final_state = stage_results[-1].state if stage_results else fix_state
    fix_success = all(result.success for result in stage_results)

    summary = {
        "success": fix_success,
        "mode": "single_pass_vision",
        "session_id": session_id,
        "gt_name": inputs.gt_root.name,
        "output_dir": str(inputs.output_dir),
        "stage_order": ["first_generation", *[result.name for result in stage_results]],
        "stages": [
            {
                "name": "first_generation",
                "success": True,
                "issues": [],
                "artifact_keys": ["instruction", "log"],
            },
            *[result.as_dict() for result in stage_results],
        ],
        "artifacts": {
            "instruction": str(logs_dir / "first_generation_instruction.txt"),
            "log": str(logs_dir / "first_generation.log"),
            "input_manifest": str(docs_dir / "input_manifest.json"),
            "data_profile": str(docs_dir / "data_profile.json"),
            "fix_run_context": str(logs_dir / "fix_stage_run_context.json"),
        },
        "validation": _collect_validation(final_state),
    }
    write_json(logs_dir / "pipeline_run_summary.json", summary)
    return summary
