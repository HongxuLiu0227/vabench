"""Single-pass pipeline: inputs -> scaffold -> one-shot generation."""

from __future__ import annotations

import os
import shutil
import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List

from agent_pipeline.agents.scaffold_agent import scaffold_with_vite

from .kimi_driver import KimiDriver
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


def _build_data_policy_block(csv_profiles: List[Dict[str, Any]]) -> str:
    fetch_urls = [
        str(item["fetch_url"])
        for item in csv_profiles
        if isinstance(item.get("fetch_url"), str) and item["fetch_url"].strip()
    ]
    primary = fetch_urls[0] if fetch_urls else "/data/<dataset-file>"
    url_lines = "\n".join(f"- {url}" for url in fetch_urls) if fetch_urls else "- /data/<dataset-file>"

    return f"""
Data Policy (MANDATORY):
- The only runtime data source for dashboard metrics/visuals must be files under `public/data/...`.
- Load full datasets via `fetch('/data/...')`; do NOT synthesize dashboard data from sample rows.
- Do NOT place CSV/JSON files under `src/data` or `src/mocks`.
- Do NOT import dashboard dataset files from local source paths like `../data/*.csv` or `../mocks/*`.
- Sample rows in `docs/data_profile.json` are for schema awareness only; runtime charts and tables must read full data from `/data/...`.
- Do NOT use the Read tool on full CSV files under `public/data/` (they are too large).

Known dataset URLs for this run:
{url_lines}

Primary URL to start with:
- {primary}
"""


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
    staged_data_profile_path = (inputs.output_dir / "docs" / "data_profile.json").relative_to(
        inputs.output_dir
    ).as_posix()
    fetch_url_lines = []
    for item in csv_profiles:
        fetch_url = item.get("fetch_url")
        if isinstance(fetch_url, str) and fetch_url.strip():
            fetch_url_lines.append(f"- `{fetch_url}` ({item['file_name']})")
    runtime_fetch_lines = (
        "\n".join(fetch_url_lines) if fetch_url_lines else "- `/data/<dataset-file>`"
    )
    data_policy = _build_data_policy_block(csv_profiles)

    return f"""
Working directory: {inputs.output_dir}
You are generating the FINAL React+TypeScript code in a single pass.
Do not output plans. Perform edits directly.

Before making edits, inspect the provided inputs from the workspace using the Read tool:
- Read the screenshot at `{staged_image_path}`. This image is the visual source of truth and must be treated as a real image input, not as a filename hint.
- Read the interaction contract at `{staged_contract_path}`.
- Read `{staged_data_profile_path}` for CSV column names and sample rows (schema awareness only).
- Do NOT read full CSV files under `public/data/` with the Read tool.

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

{data_policy}
Data requirements:
- Use ONLY real CSV data from `public/data`.
- Implement a dedicated data-loading layer (e.g., `src/services/` or `src/lib/`) that fetches full datasets from `/data/...` and maps them into chart/table view models.
- Parse numeric measures explicitly before aggregation; do not allow string concatenation in metrics.
- Runtime fetch URLs for this run (do not Read these files with the Read tool):
{runtime_fetch_lines}
- CSV overview:
{chr(10).join(csv_summary_lines)}

Engineering requirements:
- Keep project on React + TypeScript + Vite.
- Use D3 primitives (`d3-scale`, `d3-shape`, `d3-axis`, etc.) or thin wrappers around D3 for chart rendering.
- Ensure routes, controls, and selections trigger real state updates.
- Use named exports where practical.
- Do not rely on Tailwind utility class names unless Tailwind is explicitly installed and configured (tailwind config + PostCSS + imported directives). If Tailwind is absent, use plain CSS modules/global CSS/inline styles.

Steps to follow:
1. The repository already contains a pre-scaffolded Vite + React + TypeScript project. Inspect the structure and keep existing configuration files unless updates are required.
2. Build a worksheet-by-worksheet implementation checklist from the interaction contract before coding; if prose conflicts with the contract, the contract wins.
3. Implement the dashboard layout and charts from the screenshot plus contract-defined interactions.
4. Render the dashboard at `/` (you may keep `/dashboard` as redirect/alias). Do not require a separate marketing-style landing page.
5. Implement a dedicated data-loading layer (e.g., `src/services/` or `src/lib/`) that fetches full datasets from `/data/...` and maps them into chart/table view models.
6. Parse numeric measures explicitly (`Number(...)` / `parseFloat(...)`) before aggregation; do not allow string concatenation in metrics.
7. Keep visual styling faithful to the screenshot: avoid invented global hero headers/footers and decorative card chrome unless present in the image.
8. After adding or changing dependencies (e.g. `d3`, `@types/d3`), run `pnpm install`; treat a clean install as confirmation that versions are compatible. Only adjust `package.json` if install reports conflicts.
9. Run `pnpm lint -- --max-warnings 0`, `pnpm test -- --runInBand`, and `pnpm build` to confirm the project is healthy.
10. If any command fails, fix the root cause and rerun until the suite passes or you have a clear explanation of the blocking issue.
11. Emit a final status report summarizing commands executed, fixes applied (including dependency changes validated by `pnpm install`), and remaining risks.

Deliverables:
- A runnable project in this workspace using React + TypeScript + Vite.
- Visualization code implemented with D3 primitives or thin D3-based wrappers.
- Updated `package.json` scripts for linting, testing, and building.
- No dashboard data files under `src/data` or `src/mocks`; full data must stay in `public/data` and be loaded via fetch.
- Source files should avoid placeholder text and use named exports where practical.
- README documenting `pnpm install`, `pnpm dev`, `pnpm build`, and how to preview the dashboard.
""".strip()


def run_pipeline(
    *,
    gt_dir: str | None = None,
    image_path: str | None = None,
    interaction_contract_path: str | None = None,
    data_dir: str | None = None,
    output_dir: str | None = None,
    force: bool = False,
    timeout_seconds: int = 7200,
    model: str = "gpt5",
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
    staged_inputs = _stage_inputs(inputs, csv_files, docs_dir, public_data_dir)
    csv_profiles: List[Dict[str, Any]] = []
    for staged_csv in staged_inputs["csv_files"]:
        rel_to_public = staged_csv.relative_to(public_data_dir)
        fetch_url = f"/data/{rel_to_public.as_posix()}"
        csv_profiles.append(profile_csv(staged_csv, fetch_url=fetch_url))
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
    logger.info("Running single-pass first generation with Kimi CLI")
    driver = KimiDriver(timeout_seconds=timeout_seconds, model=model)
    output = driver.run(instruction, inputs.output_dir, session_id=session_id)
    (logs_dir / "first_generation.log").write_text(output + "\n", encoding="utf-8")

    summary = {
        "success": True,
        "mode": "single_pass_vision",
        "model": model,
        "session_id": session_id,
        "gt_name": inputs.gt_root.name,
        "output_dir": str(inputs.output_dir),
        "artifacts": {
            "instruction": str(logs_dir / "first_generation_instruction.txt"),
            "log": str(logs_dir / "first_generation.log"),
            "input_manifest": str(docs_dir / "input_manifest.json"),
            "data_profile": str(docs_dir / "data_profile.json"),
        },
    }
    write_json(logs_dir / "pipeline_run_summary.json", summary)
    return summary
