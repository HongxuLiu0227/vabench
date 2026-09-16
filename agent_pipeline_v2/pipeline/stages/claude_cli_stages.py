"""Pipeline stages that proxy work to the Claude CLI."""

from __future__ import annotations

import os
import re
import json
import subprocess
import uuid
from pathlib import Path
from typing import Any, Dict, List, Optional

from ...cli_runner import ClaudeDriver, ClaudeDriverError
from ...config import PipelineConfig
from ...logging_config import get_logger
from ...snippets import summarize_snippet
from ..gating import PlaceholderGate
from ..context import PipelineState
from ..stage import PipelineStage, StageOutput
from ..utils import ensure_directory, env_with_node_path, write_json

logger = get_logger(__name__)

COMMAND_SUMMARY_LIMIT = 6000
BUG_FIX_MAX_AUTOFIX_ATTEMPTS = 2


def _summarize_output(text: str, limit: int = COMMAND_SUMMARY_LIMIT) -> str:
    if len(text) <= limit:
        return text
    head = text[: limit // 2]
    tail = text[-(limit // 2) :]
    return f"{head}\n... [truncated] ...\n{tail}"


def _load_package_json(project_root: Path) -> Dict[str, Any]:
    package_json_path = project_root / "package.json"
    if not package_json_path.exists():
        return {}
    try:
        payload = json.loads(package_json_path.read_text(encoding="utf-8"))
    except Exception:
        return {}
    return payload if isinstance(payload, dict) else {}


def _has_script(project_root: Path, script_name: str) -> bool:
    package_json = _load_package_json(project_root)
    scripts = package_json.get("scripts")
    return isinstance(scripts, dict) and isinstance(scripts.get(script_name), str)


def _build_validation_follow_up(base_instruction: str, validation: Dict[str, Any], attempt_index: int) -> str:
    failures = []
    for command in validation.get("commands", []):
        if not isinstance(command, dict):
            continue
        if command.get("status") != "failed":
            continue
        failures.append(
            f"- {command.get('name')}: exit={command.get('exit_code')} category={command.get('failure_category')}\n"
            f"  stderr/stdout summary:\n{command.get('output_summary', '')}"
        )

    warning_lines = []
    if validation.get("warnings"):
        for warning in validation["warnings"]:
            warning_lines.append(f"- {warning}")

    failure_block = "\n".join(failures) if failures else "- validation failed without a categorized command failure"
    warnings_block = "\n".join(warning_lines) if warning_lines else "- none"
    return (
        f"{base_instruction}\n\n"
        f"Objective validation failed after bug_fix attempt {attempt_index}.\n"
        f"Required command failures:\n{failure_block}\n\n"
        f"Warnings observed:\n{warnings_block}\n\n"
        "Fix the concrete failures above, then make sure install/lint/build pass. "
        "If tests are configured they must pass; if no test script exists, leave it skipped and do not claim tests passed."
    )


def _run_command_validation(project_root: Path, logs_dir: Path) -> Dict[str, Any]:
    ensure_directory(logs_dir)
    package_json = _load_package_json(project_root)
    has_package_json = bool(package_json)
    has_test_script = _has_script(project_root, "test")
    has_lint_script = _has_script(project_root, "lint")
    has_build_script = _has_script(project_root, "build")

    commands: List[Dict[str, Any]] = []
    failure_categories: List[str] = []
    warnings: List[str] = []

    def run_command(
        name: str,
        command: List[str],
        *,
        required: bool,
        should_run: bool = True,
        failure_category: Optional[str] = None,
    ) -> Dict[str, Any]:
        log_path = logs_dir / f"bug_fix_{name}.log"
        result: Dict[str, Any] = {
            "name": name,
            "command": command,
            "required": required,
            "log_path": str(log_path),
            "status": "skipped",
            "exit_code": None,
            "output_summary": "",
            "failure_category": None,
        }

        if not should_run:
            result["output_summary"] = f"{name} skipped because the script is not configured."
            if name == "test":
                warnings.append("No test script configured; test validation skipped.")
            else:
                result["status"] = "failed"
                result["failure_category"] = failure_category or f"{name}_script_missing"
                result["output_summary"] = f"{name} failed because the required script is not configured."
            log_path.write_text(result["output_summary"], encoding="utf-8")
            write_json(log_path.with_suffix(".json"), result)
            return result

        try:
            completed = subprocess.run(
                command,
                cwd=str(project_root),
                capture_output=True,
                text=True,
                timeout=1800,
                env=env_with_node_path(os.environ),
            )
            output = (completed.stdout or "") + ("\n" if completed.stdout and completed.stderr else "") + (completed.stderr or "")
            log_path.write_text(output, encoding="utf-8")
            result["exit_code"] = completed.returncode
            result["output_summary"] = _summarize_output(output)
            if completed.returncode == 0:
                result["status"] = "passed"
            else:
                result["status"] = "failed"
                result["failure_category"] = failure_category or f"{name}_failed"
        except FileNotFoundError as exc:
            result["status"] = "failed"
            result["failure_category"] = failure_category or "command_missing"
            result["output_summary"] = str(exc)
            log_path.write_text(result["output_summary"], encoding="utf-8")
        except subprocess.TimeoutExpired as exc:
            combined = (exc.stdout or "") + ("\n" if exc.stdout and exc.stderr else "") + (exc.stderr or "")
            log_path.write_text(combined, encoding="utf-8")
            result["status"] = "failed"
            result["exit_code"] = -1
            result["failure_category"] = failure_category or f"{name}_timeout"
            result["output_summary"] = _summarize_output(combined or f"{name} timed out")

        if result["status"] == "failed" and result["failure_category"] and required:
            failure_categories.append(str(result["failure_category"]))
        write_json(log_path.with_suffix(".json"), result)
        return result

    if not has_package_json:
        failure_categories.append("missing_package_json")
        warnings.append("package.json missing; command validation could not verify scripts.")

    install_command = ["pnpm", "install"]
    if (project_root / "pnpm-lock.yaml").exists():
        install_command.append("--frozen-lockfile")

    commands.append(run_command("install", install_command, required=True, failure_category="install_failed"))
    commands.append(run_command("dedupe", ["pnpm", "dedupe"], required=False, failure_category="dedupe_failed"))
    commands.append(
        run_command(
            "lint",
            ["pnpm", "lint"],
            required=True,
            should_run=has_lint_script,
            failure_category="lint_failed" if has_lint_script else "lint_script_missing",
        )
    )
    commands.append(
        run_command(
            "test",
            ["pnpm", "test", "--", "--runInBand"],
            required=False,
            should_run=has_test_script,
            failure_category="test_failed",
        )
    )
    commands.append(
        run_command(
            "build",
            ["pnpm", "build"],
            required=True,
            should_run=has_build_script,
            failure_category="build_failed" if has_build_script else "build_script_missing",
        )
    )

    passed = not any(command["required"] and command["status"] != "passed" for command in commands)
    if has_test_script and any(command["name"] == "test" and command["status"] != "passed" for command in commands):
        passed = False
        if "test_failed" not in failure_categories:
            failure_categories.append("test_failed")

    validation = {
        "project_root": str(project_root),
        "has_package_json": has_package_json,
        "has_test_script": has_test_script,
        "scripts": {
            "lint": has_lint_script,
            "test": has_test_script,
            "build": has_build_script,
        },
        "commands": commands,
        "warnings": warnings,
        "passed": passed,
        "failure_categories": sorted(set(failure_categories)),
    }
    return validation


def _should_deprioritize_snippet(name: str, content: str) -> bool:
    normalized_name = name.lower()
    if "antd-components" in normalized_name or "antd" in normalized_name:
        return True

    ant_import_hits = len(re.findall(r"from\s+['\"]antd['\"]", content))
    has_many_lines = len(content.splitlines()) > 120
    return ant_import_hits > 0 and has_many_lines


def build_snippet_context(snippets: Dict[str, str], limit: int = 1) -> str:
    if not snippets:
        return ""
    summaries = []
    for name, content in snippets.items():
        if _should_deprioritize_snippet(name, content):
            continue
        summaries.append(summarize_snippet(name, content, max_lines=8))
        if len(summaries) >= limit:
            break
    return "\n\n".join(summaries)


def is_tableau_mode(state: PipelineState) -> bool:
    if state.extras.get("mode") == "tableau":
        return True
    tableau_context = state.extras.get("tableau_context")
    return isinstance(tableau_context, dict) and bool(tableau_context)


def get_tableau_data_urls(state: PipelineState, limit: int = 20) -> List[str]:
    tableau_context = state.extras.get("tableau_context")
    if not isinstance(tableau_context, dict):
        return []
    manifest = tableau_context.get("data_files_manifest")
    if not isinstance(manifest, list):
        return []
    urls: List[str] = []
    for item in manifest:
        if not isinstance(item, dict):
            continue
        fetch_url = item.get("fetch_url")
        if isinstance(fetch_url, str) and fetch_url.strip():
            urls.append(fetch_url.strip())
        if len(urls) >= limit:
            break
    return urls


def build_tableau_data_policy_block(state: PipelineState) -> str:
    urls = get_tableau_data_urls(state)
    primary = ""
    tableau_context = state.extras.get("tableau_context")
    if isinstance(tableau_context, dict):
        primary_value = tableau_context.get("primary_data_url")
        if isinstance(primary_value, str):
            primary = primary_value.strip()
    primary = primary or (urls[0] if urls else "/data/<dataset-file>")
    url_lines = "\n".join(f"- {url}" for url in urls) if urls else "- /data/<dataset-file>"

    return f"""
Tableau Data Policy (MANDATORY):
- The only runtime data source for dashboard metrics/visuals must be files under `public/data/...`.
- Load full datasets via `fetch('/data/...')`; do NOT synthesize dashboard data from sample rows.
- Do NOT place CSV/JSON files under `src/data` or `src/mocks`.
- Do NOT import dashboard dataset files from local source paths like `../data/*.csv` or `../mocks/*`.
- If any dataset files exist under `src/data` or `src/mocks`, move them to `public/data` and update references.
- Keep sample rows only in documentation/requirements; runtime charts and tables must read full data from `/data/...`.

Known dataset URLs for this run:
{url_lines}

Primary URL to start with:
- {primary}
"""


def get_tableau_spec_path(state: PipelineState) -> str:
    tableau_context = state.extras.get("tableau_context")
    if isinstance(tableau_context, dict):
        spec_path = tableau_context.get("tableau_spec_path")
        if isinstance(spec_path, str) and spec_path.strip():
            return spec_path.strip()
    fallback = state.paths.output_dir / "docs" / "tableau_spec.json"
    return str(fallback)


def build_tableau_spec_policy_block(state: PipelineState) -> str:
    spec_path = get_tableau_spec_path(state)
    summary = {}
    tableau_context = state.extras.get("tableau_context")
    if isinstance(tableau_context, dict):
        summary_value = tableau_context.get("tableau_spec_summary")
        if isinstance(summary_value, dict):
            summary = summary_value
    worksheet_count = summary.get("worksheet_count")
    dashboard_count = summary.get("dashboard_count")
    text_zone_count = summary.get("dashboard_text_zone_count")
    action_count = summary.get("dashboard_action_count")
    highlight_count = summary.get("highlight_binding_count")

    return f"""
Tableau Structured Spec Contract (MANDATORY):
- Read `{spec_path}` before editing source files.
- Treat `tableau_spec.json` as the authoritative machine-readable contract.
- Implement every worksheet according to its structured fields:
  - `chart_type`
  - `rows` and `cols`
  - `table_calc`
  - `manual_sort`
  - `filter`
  - `reference_lines`
  - `style_rule_elements`
  - `title_runs`
  - `axis_titles`
  - `legend_spec`
  - `dashboard_text_zones`
- Recreate dashboard composition strictly from `dashboard_zones` (container nesting, x/y/w/h intent, sheet placement).
- Reproduce interactions defined in `dashboard_actions` and `highlight_bindings` (selection/highlight/filter behavior).
- Render static dashboard text zones (headers/annotations/questions) from `dashboard_text_zones` with exact wording.
- If `requirements.md` conflicts with `tableau_spec.json`, the JSON spec wins.
- Do not rename worksheet titles or reorder categorical members unless `manual_sort` requires that order.
- Include a "Tableau spec compliance checklist" in your final stage summary, listing each worksheet and whether the fields above are implemented.

Spec summary for this run:
- worksheets: {worksheet_count if worksheet_count is not None else "unknown"}
- dashboards: {dashboard_count if dashboard_count is not None else "unknown"}
- dashboard_text_zones: {text_zone_count if text_zone_count is not None else "unknown"}
- dashboard_actions: {action_count if action_count is not None else "unknown"}
- highlight_bindings: {highlight_count if highlight_count is not None else "unknown"}
"""


def get_tableau_render_contract_path(state: PipelineState) -> str:
    tableau_context = state.extras.get("tableau_context")
    if isinstance(tableau_context, dict):
        value = tableau_context.get("tableau_render_contract_path")
        if isinstance(value, str) and value.strip():
            return value.strip()
    return str(state.paths.output_dir / "docs" / "tableau_render_contract.json")


def _load_tableau_render_contract(state: PipelineState) -> Dict:
    path = Path(get_tableau_render_contract_path(state))
    if not path.exists():
        return {}
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return {}
    return payload if isinstance(payload, dict) else {}


def build_tableau_render_contract_policy_block(state: PipelineState) -> str:
    path = get_tableau_render_contract_path(state)
    contract = _load_tableau_render_contract(state)
    worksheet_intents: List[str] = []
    worksheets = contract.get("worksheets") if isinstance(contract, dict) else []
    if isinstance(worksheets, list):
        for worksheet in worksheets[:20]:
            if not isinstance(worksheet, dict):
                continue
            name = str(worksheet.get("name") or "Unnamed Worksheet")
            intent = str(worksheet.get("chart_intent") or "custom_tableau_view")
            worksheet_intents.append(f"- {name}: {intent}")
    intent_lines = "\n".join(worksheet_intents) if worksheet_intents else "- (not available)"

    stacked_worksheet_names = []
    boxplot_worksheet_names = []
    if isinstance(worksheets, list):
        for worksheet in worksheets:
            if not isinstance(worksheet, dict):
                continue
            intent = str(worksheet.get("chart_intent") or "")
            if intent.endswith("_stacked_percentage_bar"):
                stacked_worksheet_names.append(str(worksheet.get("name") or "Unnamed Worksheet"))
            if intent.endswith("_box_plot"):
                boxplot_worksheet_names.append(str(worksheet.get("name") or "Unnamed Worksheet"))
    stacked_line = (
        ", ".join(stacked_worksheet_names)
        if stacked_worksheet_names
        else "none"
    )
    boxplot_line = (
        ", ".join(boxplot_worksheet_names)
        if boxplot_worksheet_names
        else "none"
    )

    summary = contract.get("summary") if isinstance(contract.get("summary"), dict) else {}
    tableau_context = state.extras.get("tableau_context")
    if isinstance(tableau_context, dict):
        summary_value = tableau_context.get("tableau_render_contract_summary")
        if isinstance(summary_value, dict):
            summary = summary_value
    worksheet_count = summary.get("worksheet_count")
    intent_counts = summary.get("intent_counts") if isinstance(summary.get("intent_counts"), dict) else {}
    legend_required = summary.get("legend_required_worksheets") if isinstance(summary.get("legend_required_worksheets"), list) else []
    legend_anchor_positions = summary.get("legend_anchor_positions") if isinstance(summary.get("legend_anchor_positions"), dict) else {}
    axis_title_worksheets = summary.get("axis_title_worksheets") if isinstance(summary.get("axis_title_worksheets"), list) else []
    interaction_worksheets = summary.get("interaction_worksheets") if isinstance(summary.get("interaction_worksheets"), list) else []
    dashboard_text_zone_count = summary.get("dashboard_text_zone_count")
    dashboard_action_count = summary.get("dashboard_action_count")
    highlight_binding_count = summary.get("highlight_binding_count")
    legend_line = ", ".join(str(item) for item in legend_required) if legend_required else "none"
    legend_anchor_line = (
        ", ".join(f"{str(name)}:{str(position)}" for name, position in legend_anchor_positions.items())
        if legend_anchor_positions
        else "none"
    )
    axis_line = ", ".join(str(item) for item in axis_title_worksheets) if axis_title_worksheets else "none"
    interaction_line = ", ".join(str(item) for item in interaction_worksheets) if interaction_worksheets else "none"
    return f"""
Tableau Render Contract (MANDATORY):
- Read `{path}` and implement worksheet intents exactly.
- Treat `tableau_render_contract.json` as the final authority for chart geometry/layout when prose in requirements is ambiguous or conflicting.
- For any worksheet whose `chart_intent` is `horizontal_stacked_percentage_bar`, render one horizontal 100% stacked bar view by category.
- For any worksheet whose `chart_intent` is `vertical_stacked_percentage_bar`, render one vertical 100% stacked bar/column view by category.
- For any worksheet whose `chart_intent` is `horizontal_box_plot`, render horizontal box-and-whisker plots by category.
- For any worksheet whose `chart_intent` is `vertical_box_plot`, render vertical box-and-whisker plots by category.
- Do NOT reinterpret stacked-percentage bar intents as heatmap matrices, table-like grids, grouped bars, or opposite-orientation bars.
- Do NOT reinterpret box-plot intents as ranked bars, stacked bars, or aggregate KPI bars.
- Do NOT infer chart type from dashboard position (top/bottom/left/right); only `chart_intent` decides rendering.
- For stacked-percentage intents, aggregate metrics by (`category`, `series_field`) before stacking; each category should render one segment per effective series value.
- For box-plot intents, compute quartiles/median/whiskers from row-level samples after filters; do not sum a measure per category and call it a boxplot.
- Preserve full y-axis/category labels and titles; no clipping, left-edge truncation, or hidden overflow cuts.
- Compute dynamic axis margins from measured label width/height so long category names remain fully visible.
- Preserve ordering from the contract (`category_order`, `series_order`) and filters (`filter_members`).
- Place worksheets according to each worksheet `zone` coordinates/aspect intent; avoid reflowing into generic card grids that break Tableau composition.
- Render dashboard-level textual zones from `dashboard_text_zones` (headers/paragraph annotations); preserve wording/case and run-level emphasis.
- For worksheets whose `legend.required` is true, render a visible legend with contract-defined series/category mapping and anchor it near the worksheet according to `legend.zone.relative_position` when available.
- For worksheets with `axis_title_rows`/`axis_title_cols`, render axis titles with exact text from the contract.
- Reproduce `dashboard_actions` and `highlight_bindings` interaction behavior (on-select highlight/filter + auto-clear); dashboard-targeted actions must propagate to all affected worksheets.
- Coerce quantitative fields to numbers before aggregation; do not aggregate raw CSV strings.
- Validate chart geometry with real data: bars/segments must have non-zero size when source metrics are non-zero.
- Avoid visual chrome not defined by Tableau: no invented app hero headers, footer watermarks, or default card shadows/borders unless explicit in workbook titles/zones.

Worksheet intents in this run:
{intent_lines}

Render contract summary:
- worksheets: {worksheet_count if worksheet_count is not None else "unknown"}
- stacked-intent worksheets: {stacked_line}
- boxplot-intent worksheets: {boxplot_line}
- intent_counts: {intent_counts if intent_counts else "unknown"}
- legend-required worksheets: {legend_line}
- legend anchor positions: {legend_anchor_line}
- axis-title worksheets: {axis_line}
- interaction worksheets: {interaction_line}
- dashboard_text_zones: {dashboard_text_zone_count if dashboard_text_zone_count is not None else "unknown"}
- dashboard_actions: {dashboard_action_count if dashboard_action_count is not None else "unknown"}
- highlight_bindings: {highlight_binding_count if highlight_binding_count is not None else "unknown"}
"""


class ClaudeCLIStage(PipelineStage):
    """Base stage that delegates heavy lifting to the Claude CLI."""

    def __init__(self, name: str, description: str, gates=None) -> None:
        super().__init__(name=name, description=description, gates=gates)
        self._runner: Optional[ClaudeDriver] = None

    @property
    def runner(self) -> ClaudeDriver:
        if self._runner is None:
            self._runner = ClaudeDriver(timeout_seconds=1800)
        return self._runner

    def get_workdir(self, state: PipelineState) -> Path:
        return state.paths.output_dir

    def build_instruction(self, state: PipelineState, config: PipelineConfig) -> str:  # pragma: no cover
        raise NotImplementedError

    def execute(self, state: PipelineState, config: PipelineConfig, knowledge_base) -> StageOutput:
        workdir = self.get_workdir(state)
        ensure_directory(workdir)
        ensure_directory(state.paths.logs_dir)
        instruction = self.build_instruction(state, config)
        session_id = str(uuid.uuid4())
        logger.info("Invoking Claude CLI for stage '%s'...", self.name)
        try:
            output = self.runner.run(instruction, workdir, session_id=session_id)
        except ClaudeDriverError as exc:
            raise RuntimeError(f"Claude CLI failed during stage '{self.name}': {exc}") from exc

        log_path = state.paths.logs_dir / f"{self.name}.log"
        log_path.write_text(output + "\n", encoding="utf-8")
        logger.info("Saved Claude CLI output for stage '%s' to %s", self.name, log_path)

        extras = dict(state.extras)
        extras[f"{self.name}_log"] = output
        extras[f"{self.name}_session"] = session_id
        return StageOutput(
            state_updates={"extras": extras},
            artifacts={f"{self.name}_output.txt": output, str(log_path): str(log_path)},
            metrics={"cli_output_chars": len(output)},
        )


class FirstGenerationStage(ClaudeCLIStage):
    """Use Claude CLI to scaffold the project and generate initial implementation."""

    def __init__(self) -> None:
        super().__init__("first_generation", "Create the initial React + TypeScript project using Vite.")

    def build_instruction(self, state: PipelineState, config: PipelineConfig) -> str:
        snippet_context = build_snippet_context(state.snippets)
        requirements_path = state.paths.output_dir / "docs" / "requirements.md"
        tableau_mode = is_tableau_mode(state)
        tableau_policy = build_tableau_data_policy_block(state) if tableau_mode else ""
        tableau_spec_policy = build_tableau_spec_policy_block(state) if tableau_mode else ""
        tableau_render_policy = build_tableau_render_contract_policy_block(state) if tableau_mode else ""

        if tableau_mode:
            return f"""
You are now responsible for generating the first working version of the project in {state.paths.output_dir}.
Steps to follow:
1. The repository already contains a pre-scaffolded Vite + React + TypeScript project copied from cache. Inspect the structure and keep existing configuration files unless updates are required.
2. Read {requirements_path} for copy/context/data semantics, but drive chart type, worksheet layout, ordering, legends, axis titles, and interactions from `tableau_spec.json` + `tableau_render_contract.json` only.
3. Build a worksheet-by-worksheet implementation checklist from the render contract before coding; if prose conflicts, the JSON contracts win.
4. Reproduce Tableau interactions, legends, and axis titles exactly (including on-select highlight behavior and auto-clear behavior).
5. Leverage snippets only for utility-level ideas when they are directly relevant. Do not mirror snippet layout/styling patterns; avoid generic card-heavy templates.
6. Ensure every route, sidebar item, button, and form submit is wired to real logic: use React Router DOM with path/hash-based routes (BrowserRouter or HashRouter), drive navigation via `Link`/`NavLink`/`useNavigate`, and update component state when actions occur. Do not implement view changes by swapping state variables without updating the URL.
7. For Tableau single-dashboard outputs, render the dashboard at `/` (you may keep `/dashboard` as redirect/alias). Do not require a separate marketing-style landing page to access the workbook view.
8. Do not rely on Tailwind utility class names unless Tailwind is explicitly installed and configured (tailwind config + PostCSS + imported directives). If Tailwind is absent, use plain CSS modules/global CSS/inline styles.
9. Implement a dedicated data-loading layer (e.g., `src/services/` or `src/lib/`) that fetches full datasets from `/data/...` and maps them into chart/table view models.
10. Parse numeric measures explicitly (`Number(...)` / `parseFloat(...)`) before aggregation; do not allow string concatenation in metrics.
11. Visualization requirement: implement chart rendering with D3 (`d3-scale`, `d3-shape`, `d3-axis`, etc.) directly or thin wrappers over D3. Do not rely on Ant Design chart wrappers.
12. Color encoding: if a worksheet contract includes `color_encoding`, use ONLY the specified field and palette type to build the color scale. When `type` is "diverging", use a diverging scale (e.g. red-white-blue or green-white-red via `d3.scaleDiverging`). When `type` is "sequential", use `d3.scaleSequential`. When `type` is "interpolated", use a continuous interpolator. If `palette` is specified (e.g. "tableau-map-blue-green"), map it to the closest D3 scheme. If only `field` is present, build a sensible default color scale for that field's data type. Always include a matching color legend when `color_encoding` is present.
13. Keep visual styling Tableau-faithful: avoid invented global hero headers/footers and avoid decorative card shadows/borders unless explicitly present in workbook zones.
14. Resolve dependencies by running `pnpm install`; treat a clean install as your signal that versions are compatible. Only adjust versions if the install reports conflicts.
15. If the app includes authentication, require the credentials username=`admin` and password=`admin`, display helper text with those values, and store them in a dedicated auth utility.
16. Run `pnpm lint -- --max-warnings 0`, `pnpm test -- --runInBand`, and `pnpm build` to confirm the scaffolded project is healthy.

{tableau_policy}
{tableau_spec_policy}
{tableau_render_policy}

Helpful snippets:
{snippet_context or 'None provided.'}

Deliverables:
- A runnable project located in {state.paths.output_dir} using React + TypeScript (any UI component approach is acceptable).
- Client-side routing implemented with `react-router-dom` using real URL paths (no state-only view switching) so external renderers can navigate pages.
- Visualization code implemented with D3 primitives or thin D3-based wrappers.
- Legends, axis titles, and highlight interactions implemented according to Tableau spec/contract fields.
- Updated package.json scripts for linting, testing, and building.
- No dashboard data files under `src/data` or `src/mocks`; full data must stay in `public/data` and be loaded via fetch.
- Source files should avoid placeholder text, use named exports only, and document the `admin` credentials in README if a login screen exists.
"""

        return f"""
You are now responsible for generating the first working version of the project in {state.paths.output_dir}.
Steps to follow:
1. The repository already contains a pre-scaffolded Vite + React + TypeScript project copied from cache. Inspect the structure and keep existing configuration files unless updates are required.
2. Read {requirements_path} and implement the described screens/components.
3. Leverage snippets only for utility-level ideas when directly relevant. Do not clone snippet layout/styling; avoid default card-heavy templates.
4. Ensure every route, sidebar item, button, and form submit is wired to real logic: use React Router DOM with path/hash-based routes (BrowserRouter or HashRouter), drive navigation via `Link`/`NavLink`/`useNavigate`, update component state when actions occur, and mock API responses with data modules stored under `src/mocks`. Do not implement view changes by swapping state variables without updating the URL.
5. Visualization requirement: implement chart rendering with D3 (`d3-scale`, `d3-shape`, `d3-axis`, etc.) directly or thin wrappers over D3.
6. Populate realistic mock datasets for charts, tables, and views. Do not leave click handlers as stubs—each interaction must produce a visible change (state update, toast, navigation, modal, etc.).
7. Resolve dependencies by running `pnpm install`; treat a clean install as your signal that versions are compatible. Only adjust versions if the install reports conflicts.
8. If the app includes authentication, require the credentials username=`admin` and password=`admin`, display helper text with those values, and store them in a dedicated auth utility.
9. Run `pnpm lint -- --max-warnings 0`, `pnpm test -- --runInBand`, and `pnpm build` to confirm the scaffolded project is healthy.

Helpful snippets:
{snippet_context or 'None provided.'}

Deliverables:
- A runnable project located in {state.paths.output_dir} using React + TypeScript (any UI component approach is acceptable).
- Client-side routing implemented with `react-router-dom` using real URL paths (no state-only view switching) so external renderers can navigate pages.
- Visualization code implemented with D3 primitives or thin D3-based wrappers.
- Updated package.json scripts for linting, testing, and building.
- Source files should avoid placeholder text, include inline mock data, use named exports only, and document the `admin` credentials in README if a login screen exists.
"""


class PlaceholderFixStage(ClaudeCLIStage):
    """Use Claude CLI to remove TODOs/placeholders and ensure rich UI data."""

    PLACEHOLDER_PATTERNS = [
        ("TODO", re.compile(r"\bTODO\b")),
        ("FIXME", re.compile(r"\bFIXME\b")),
        ("Lorem ipsum", re.compile(r"lorem\W+ipsum", re.IGNORECASE)),
        ("Placeholder", re.compile(r"placeholder", re.IGNORECASE)),
        ("Coming soon", re.compile(r"coming\s+soon", re.IGNORECASE)),
        ("Sample data", re.compile(r"sample\s+data", re.IGNORECASE)),
        ("Dummy", re.compile(r"dummy", re.IGNORECASE)),
    ]

    TEXT_EXTENSIONS = {
        ".ts",
        ".tsx",
        ".js",
        ".jsx",
        ".json",
        ".md",
        ".css",
        ".scss",
        ".less",
        ".html",
        ".txt",
    }

    IGNORED_PATH_PARTS = {
        "node_modules",
        "dist",
        "pipeline_logs",
        "screenshots",
        "__pycache__",
    }
    IGNORED_DOC_FILENAMES = {
        "requirements.md",
    }

    MAX_AUTOFIX_ATTEMPTS = 3

    def __init__(self) -> None:
        super().__init__(
            "placeholder_fix",
            "Scan and replace placeholder content throughout the project.",
            gates=[PlaceholderGate()],
        )

    def build_instruction(self, state: PipelineState, config: PipelineConfig) -> str:
        tableau_mode = is_tableau_mode(state)
        tableau_policy = build_tableau_data_policy_block(state) if tableau_mode else ""
        tableau_spec_policy = build_tableau_spec_policy_block(state) if tableau_mode else ""
        tableau_render_policy = build_tableau_render_contract_policy_block(state) if tableau_mode else ""
        if tableau_mode:
            return f"""
Working directory: {state.paths.output_dir}
Goal: eliminate placeholders/stubs and enforce strict Tableau data-source policy.
Checklist:
- Search for common placeholder tokens ("TODO", "Lorem ipsum", "Coming soon", "Sample data") and replace them with production-ready copy.
- Ensure each component renders meaningful React widgets/tables and D3-based charts fed by full dataset rows loaded from `/data/...`.
- Replace any no-op handlers with concrete logic: clicking buttons must change state, open modals, submit forms, or navigate using React Router hooks.
- Verify every Button/link invokes an onClick/href/to that performs a meaningful action (navigation, state mutation, API trigger, etc.).
- Confirm navigation/menu entries (Menu.Item, tabs, sidebar links, <a/Link>) route to real destinations—no inert placeholders or toasts saying "Coming soon".
- Ensure search inputs (especially `Input.Search`) expose an `onSearch` or submit handler that actually filters/queries data.
- Avoid placeholder toasts/log statements like `message.info("Opening Settings")`—implement the real navigation/state update instead.
- Verify primary navigation menus and tabs move between routes/sections backed by real components and data loaded from `/data/...`.
- Remove any dataset files from `src/data` or `src/mocks`; keep dataset files only in `public/data`.
- Replace local dataset imports with fetch-based loading (`fetch('/data/...')`) and parsing utilities.
- Ensure quantitative fields are converted to numbers before aggregation (`Number(...)` / `parseFloat(...)`); no string concatenation in metrics.
- Ensure long category labels and titles are fully visible (no clipping). Increase chart margins/axis label width as needed.
- If using ellipsis for long labels, only truncate on the right and provide full value in tooltip/title attribute.
- Keep dashboard composition aligned with worksheet `zone` coordinates from the render contract; avoid introducing generic card wrappers that alter Tableau layout.
- Ensure Tableau dashboard route is available at `/`; `/dashboard` can be kept only as alias/redirect.
- If Tailwind is not configured in this project, replace Tailwind-style utility class names with plain CSS/inlined styles.
- Ensure legend is visible when required by the render contract and uses the contract field/category order.
- Ensure axis titles are rendered with exact contract text when defined.
- Ensure highlight/filter interactions from contract are implemented (on-select + clear/reset behavior, including dashboard-wide propagation for dashboard-targeted actions).
- Remove invented global chrome not in Tableau (e.g., synthetic "Tableau Dashboard" hero title bars, generated footer watermarks).
- If a login/auth panel exists, hard-code the accepted credentials to username=`admin` and password=`admin`, show validation feedback, and document this in README.
- Update loading/empty states to use accessible React components (custom or library-based) instead of bare divs.
- After edits, run `pnpm install` to verify the dependency graph, then `pnpm lint`, `pnpm test -- --runInBand`, and `pnpm build` to confirm no regressions. Summarize notable replacements and interaction fixes in stdout.

{tableau_policy}
{tableau_spec_policy}
{tableau_render_policy}
"""

        return f"""
Working directory: {state.paths.output_dir}
Goal: eliminate any placeholder strings, TODOs, or stubbed UI in src/.
Checklist:
- Search for common placeholder tokens ("TODO", "Lorem ipsum", "Coming soon", "Sample data") and replace them with realistic copy and mock datasets.
- Ensure each component renders meaningful React widgets/tables and D3-based charts populated with inline mock data.
- Replace any no-op handlers with concrete logic: clicking buttons must change state, open modals, submit forms, or navigate using React Router hooks.
- Verify every Button/link invokes an onClick/href/to that performs a meaningful action (navigation, state mutation, API trigger, etc.).
- Confirm navigation/menu entries (Menu.Item, tabs, sidebar links, <a/Link>) route to real destinations—no inert placeholders or toasts saying "Coming soon".
- Ensure search inputs (especially `Input.Search`) expose an `onSearch` or submit handler that actually filters/queries data.
- Avoid placeholder toasts/log statements like `message.info("Opening Settings")`—implement the real navigation/state update instead.
- Verify primary navigation menus and tabs move between routes/sections backed by real components and mock data slices.
- If a login/auth panel exists, hard-code the accepted credentials to username=`admin` and password=`admin`, show validation feedback, and document this in README.
- Update loading/empty states to use accessible React components (custom or library-based) instead of bare divs.
- Regenerate Storybook stories or docs if they exist to reflect the richer content.
- After edits, run `pnpm install` to verify the dependency graph, then `pnpm lint`, `pnpm test -- --runInBand`, and `pnpm build` to confirm no regressions. Summarize notable replacements and interaction fixes in stdout.
"""

    def _scan_placeholders(self, project_root: Path) -> list[dict]:
        if not project_root.exists():
            return []

        matches: list[dict] = []
        for path in project_root.rglob("*"):
            if not path.is_file():
                continue
            if any(part in self.IGNORED_PATH_PARTS for part in path.parts):
                continue
            if "docs" in path.parts:
                if path.suffix.lower() == ".twb" or path.name in self.IGNORED_DOC_FILENAMES:
                    continue
            if path.suffix.lower() not in self.TEXT_EXTENSIONS:
                continue
            try:
                content = path.read_text(encoding="utf-8")
            except (UnicodeDecodeError, OSError):
                continue

            for label, pattern in self.PLACEHOLDER_PATTERNS:
                for match in pattern.finditer(content):
                    line = content.count("\n", 0, match.start()) + 1
                    snippet = content[max(match.start() - 20, 0): match.end() + 20]
                    matches.append(
                        {
                            "file": str(path),
                            "label": label,
                            "line": line,
                            "preview": snippet.strip(),
                        }
                    )

            matches.extend(self._find_interaction_issues(content, path))
        return matches

    def _find_interaction_issues(self, content: str, path: Path) -> list[dict]:
        findings: list[dict] = []

        def record(match_span, label: str, preview_extra: str = ""):
            start, end = match_span
            line = content.count("\n", 0, start) + 1
            snippet = content[max(start - 40, 0): min(end + 40, len(content))]
            findings.append(
                {
                    "file": str(path),
                    "label": label,
                    "line": line,
                    "preview": (snippet.strip() + (" " + preview_extra if preview_extra else "")).strip(),
                }
            )

        for match in re.finditer(r"<Button\b([^>]*)>", content, re.IGNORECASE):
            attrs = match.group(1)
            if not re.search(r"\b(onClick|href|to)\s*=", attrs):
                record(match.span(), "Button missing action")
            elif re.search(r"onClick\s*=\s*\{\s*\(\s*\)\s*=>\s*\{\s*\}\s*\}", attrs):
                record(match.span(), "Button has empty handler")

        for match in re.finditer(r"<button\b([^>]*)>", content, re.IGNORECASE):
            attrs = match.group(1)
            if not re.search(r"\b(onClick|type\s*=\s*\"submit\"|form|formaction|href)\s*=", attrs):
                record(match.span(), "button missing action")
            elif re.search(r"onClick\s*=\s*\{\s*\(\s*\)\s*=>\s*\{\s*\}\s*\}", attrs):
                record(match.span(), "button has empty handler")

        for match in re.finditer(r"<a\b([^>]*)>", content, re.IGNORECASE):
            attrs = match.group(1)
            if not re.search(r"\b(href|onClick|to)\s*=", attrs):
                record(match.span(), "Anchor missing navigation target")

        for match in re.finditer(r"<Menu\.Item\b([^>]*)>", content):
            attrs = match.group(1)
            if not re.search(r"\b(onClick|href|to)\s*=", attrs):
                record(match.span(), "Menu.Item missing navigation handler")

        for pattern in (r"<Input\.Search\b([^>]*)>", r"<Search\b([^>]*)>"):
            for match in re.finditer(pattern, content):
                attrs = match.group(1)
                if not re.search(r"\bonSearch\s*=", attrs):
                    record(match.span(), "Search input missing onSearch")

        for toast in re.finditer(r"message\.(info|success|warning|error)\(\s*([\"'])((?:(?!\2).)*)\2\s*\)", content):
            text = toast.group(3).strip()
            if re.search(r"\b(opening|navigating|would|coming soon|placeholder|tbd)\b", text, re.IGNORECASE):
                record(toast.span(), "Toast placeholder", text)

        for log_call in re.finditer(r"console\.(log|info|warn)\(\s*([\"'])((?:(?!\2).)*)\2\s*\)", content):
            text = log_call.group(3).strip()
            if re.search(r"\b(opening|navigating|coming soon|placeholder|tbd)\b", text, re.IGNORECASE):
                record(log_call.span(), "Console placeholder", text)

        if re.search(r"setCurrentView\s*\(", content) and re.search(r"switch\s*\(\s*currentView", content):
            switch_match = re.search(r"switch\s*\(\s*currentView[\s\S]*?\{", content)
            if switch_match:
                record(switch_match.span(), "State-driven navigation", "Replace with react-router-dom routes")

        return findings

    def _scan_tableau_data_violations(self, output_dir: Path) -> list[dict]:
        src_root = output_dir / "src"
        findings: list[dict] = []
        if not src_root.exists():
            return findings

        def append_file_finding(path: Path, label: str, line: int = 1, preview: str = "") -> None:
            findings.append(
                {
                    "file": str(path),
                    "label": label,
                    "line": line,
                    "preview": preview or label,
                }
            )

        src_data = src_root / "data"
        if src_data.exists():
            for path in src_data.rglob("*"):
                if path.is_file():
                    if path.name.startswith("."):
                        continue
                    append_file_finding(path, "Dataset file under src/data")

        src_mocks = src_root / "mocks"
        if src_mocks.exists():
            for path in src_mocks.rglob("*"):
                if not path.is_file():
                    continue
                if path.suffix.lower() in {".csv", ".json"}:
                    append_file_finding(path, "Dataset file under src/mocks")
                    continue
                if path.suffix.lower() not in self.TEXT_EXTENSIONS:
                    continue
                try:
                    content = path.read_text(encoding="utf-8")
                except (UnicodeDecodeError, OSError):
                    continue
                if re.search(r"(export\s+const|const)\s+\w+\s*=\s*\[\s*\{", content):
                    append_file_finding(path, "Potential inline mock dataset in src/mocks")

        source_texts: list[str] = []
        for path in src_root.rglob("*"):
            if not path.is_file() or path.suffix.lower() not in self.TEXT_EXTENSIONS:
                continue
            try:
                content = path.read_text(encoding="utf-8")
            except (UnicodeDecodeError, OSError):
                continue
            source_texts.append(content)

            for pattern, label in (
                (r"from\s+['\"][^'\"]*\/data\/[^'\"]+\.(csv|json)['\"]", "Local dataset import from data/"),
                (r"from\s+['\"][^'\"]*\/mocks\/[^'\"]+['\"]", "Local import from src/mocks"),
                (r"from\s+['\"]\.\.?\/data\/[^'\"]+['\"]", "Relative import from ../data"),
            ):
                for match in re.finditer(pattern, content):
                    line = content.count("\n", 0, match.start()) + 1
                    preview = content[max(match.start() - 30, 0): min(match.end() + 30, len(content))].strip()
                    append_file_finding(path, label, line=line, preview=preview)

        combined_source = "\n\n".join(source_texts)
        has_fetch_call = bool(re.search(r"\bfetch\s*\(", combined_source))
        has_data_literal = bool(re.search(r"['\"`]/data/[^'\"`]+", combined_source))
        fetch_found = bool(
            re.search(r"fetch\(\s*['\"`]/data/", combined_source)
            or re.search(r"fetch\([^)]*(dataUrl|dataURL|primaryDataUrl|primaryDataURL|csvPath|jsonPath)[^)]*\)", combined_source)
            or (has_fetch_call and has_data_literal)
        )

        if not fetch_found:
            append_file_finding(src_root / "App.tsx", "Missing fetch('/data/...') usage in src")

        return findings

    def _scan_tableau_numeric_coercion_violations(self, output_dir: Path) -> list[dict]:
        src_root = output_dir / "src"
        findings: list[dict] = []
        if not src_root.exists():
            return findings

        suspicious_add_re = re.compile(r"\+=\s*(?:row|d|datum|item)\s*(?:\.\w+|\[[^\]]+\])")
        coercion_hint_re = re.compile(
            r"(Number\s*\(|parseFloat\s*\(|parseInt\s*\(|\+\s*(?:row|d|datum|item)\s*(?:\.\w+|\[[^\]]+\]))"
        )
        code_suffixes = {".ts", ".tsx", ".js", ".jsx"}

        for path in src_root.rglob("*"):
            if not path.is_file() or path.suffix.lower() not in code_suffixes:
                continue
            try:
                content = path.read_text(encoding="utf-8")
            except (UnicodeDecodeError, OSError):
                continue

            for line_no, line_text in enumerate(content.splitlines(), start=1):
                if "+=" not in line_text:
                    continue
                if not suspicious_add_re.search(line_text):
                    continue
                if coercion_hint_re.search(line_text):
                    continue
                findings.append(
                    {
                        "file": str(path),
                        "label": "Possible string aggregation without numeric coercion",
                        "line": line_no,
                        "preview": line_text.strip(),
                    }
                )

        return findings

    def _scan_tailwind_without_setup(self, output_dir: Path) -> list[dict]:
        findings: list[dict] = []
        package_json_path = output_dir / "package.json"
        package_json = {}
        if package_json_path.exists():
            try:
                package_json = json.loads(package_json_path.read_text(encoding="utf-8"))
            except Exception:
                package_json = {}

        dependencies = package_json.get("dependencies") if isinstance(package_json.get("dependencies"), dict) else {}
        dev_dependencies = package_json.get("devDependencies") if isinstance(package_json.get("devDependencies"), dict) else {}
        all_dependencies = {**dependencies, **dev_dependencies}
        has_tailwind_dependency = any(
            dep_name in all_dependencies for dep_name in ("tailwindcss", "@tailwindcss/vite")
        )

        has_tailwind_config = any(
            (output_dir / config_name).exists()
            for config_name in (
                "tailwind.config.js",
                "tailwind.config.cjs",
                "tailwind.config.mjs",
                "tailwind.config.ts",
            )
        )

        has_tailwind_directives = False
        for css_file in output_dir.rglob("*.css"):
            try:
                css_text = css_file.read_text(encoding="utf-8")
            except (UnicodeDecodeError, OSError):
                continue
            if "@tailwind" in css_text:
                has_tailwind_directives = True
                break

        if has_tailwind_dependency and has_tailwind_config and has_tailwind_directives:
            return findings

        src_root = output_dir / "src"
        if not src_root.exists():
            return findings

        utility_token_re = re.compile(
            r"(?:"
            r"min-h-screen|max-w-(?:xs|sm|md|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl)|"
            r"text-(?:xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|gray|red|blue|green|indigo)[-\w]*|"
            r"bg-(?:white|black|gray|red|blue|green|indigo)[-\w]*|"
            r"rounded(?:-[\w]+)?|shadow(?:-[\w]+)?|"
            r"flex|grid|items-center|justify-center|mx-auto|"
            r"p-\d+|px-\d+|py-\d+|pt-\d+|pr-\d+|pb-\d+|pl-\d+|"
            r"w-full|h-full|absolute|relative|block|inline-block|transition(?:-[\w]+)?"
            r")"
        )
        class_attr_re = re.compile(r"className\s*=\s*([\"'])(.*?)\1", re.DOTALL)
        code_suffixes = {".tsx", ".jsx", ".ts", ".js"}

        for path in src_root.rglob("*"):
            if not path.is_file() or path.suffix.lower() not in code_suffixes:
                continue
            try:
                content = path.read_text(encoding="utf-8")
            except (UnicodeDecodeError, OSError):
                continue

            for class_attr in class_attr_re.finditer(content):
                class_list = class_attr.group(2)
                tokens = [token.strip() for token in class_list.split() if token.strip()]
                if not any(utility_token_re.fullmatch(token) for token in tokens):
                    continue
                line = content.count("\n", 0, class_attr.start()) + 1
                findings.append(
                    {
                        "file": str(path),
                        "label": "Tailwind utility classes used without Tailwind setup",
                        "line": line,
                        "preview": class_list.strip()[:120],
                    }
                )
                break

        return findings

    def _scan_tableau_spec_contract_violations(self, output_dir: Path) -> list[dict]:
        findings: list[dict] = []
        spec_path = output_dir / "docs" / "tableau_spec.json"
        if not spec_path.exists():
            return [
                {
                    "file": str(spec_path),
                    "label": "Missing tableau_spec.json contract",
                    "line": 1,
                    "preview": "Expected docs/tableau_spec.json in Tableau mode.",
                }
            ]

        try:
            payload = json.loads(spec_path.read_text(encoding="utf-8"))
        except Exception as exc:
            return [
                {
                    "file": str(spec_path),
                    "label": "Invalid tableau_spec.json",
                    "line": 1,
                    "preview": str(exc),
                }
            ]

        if not isinstance(payload, dict):
            return [
                {
                    "file": str(spec_path),
                    "label": "Invalid tableau_spec.json root",
                    "line": 1,
                    "preview": "Expected top-level JSON object.",
                }
            ]

        for key in ("worksheets", "dashboard_zones", "dashboard_text_zones", "dashboard_actions", "highlight_bindings"):
            if key not in payload:
                findings.append(
                    {
                        "file": str(spec_path),
                        "label": f"Missing '{key}' in tableau_spec.json",
                        "line": 1,
                        "preview": f"Top-level key '{key}' is required.",
                    }
                )

        worksheets = payload.get("worksheets")
        if isinstance(worksheets, list):
            required_keys = {
                "chart_type",
                "rows",
                "cols",
                "table_calc",
                "manual_sort",
                "filter",
                "reference_lines",
                "style_rule_elements",
                "title_runs",
                "axis_titles",
                "legend_spec",
            }
            for idx, worksheet in enumerate(worksheets):
                if not isinstance(worksheet, dict):
                    findings.append(
                        {
                            "file": str(spec_path),
                            "label": "Worksheet spec is not an object",
                            "line": 1,
                            "preview": f"worksheets[{idx}] must be an object.",
                        }
                    )
                    continue
                missing = sorted(required_keys.difference(worksheet.keys()))
                if missing:
                    findings.append(
                        {
                            "file": str(spec_path),
                            "label": "Worksheet spec missing required fields",
                            "line": 1,
                            "preview": f"{worksheet.get('name', f'worksheets[{idx}]')} missing {', '.join(missing)}",
                        }
                    )
        elif worksheets is not None:
            findings.append(
                {
                    "file": str(spec_path),
                    "label": "Invalid worksheets type",
                    "line": 1,
                    "preview": "Expected worksheets to be a list.",
                }
            )

        dashboard_zones = payload.get("dashboard_zones")
        if dashboard_zones is not None and not isinstance(dashboard_zones, list):
            findings.append(
                {
                    "file": str(spec_path),
                    "label": "Invalid dashboard_zones type",
                    "line": 1,
                    "preview": "Expected dashboard_zones to be a list.",
                }
            )
        dashboard_text_zones = payload.get("dashboard_text_zones")
        if dashboard_text_zones is not None and not isinstance(dashboard_text_zones, list):
            findings.append(
                {
                    "file": str(spec_path),
                    "label": "Invalid dashboard_text_zones type",
                    "line": 1,
                    "preview": "Expected dashboard_text_zones to be a list.",
                }
            )
        dashboard_actions = payload.get("dashboard_actions")
        if dashboard_actions is not None and not isinstance(dashboard_actions, list):
            findings.append(
                {
                    "file": str(spec_path),
                    "label": "Invalid dashboard_actions type",
                    "line": 1,
                    "preview": "Expected dashboard_actions to be a list.",
                }
            )
        highlight_bindings = payload.get("highlight_bindings")
        if highlight_bindings is not None and not isinstance(highlight_bindings, list):
            findings.append(
                {
                    "file": str(spec_path),
                    "label": "Invalid highlight_bindings type",
                    "line": 1,
                    "preview": "Expected highlight_bindings to be a list.",
                }
            )

        return findings

    def _scan_tableau_render_contract_violations(self, output_dir: Path) -> list[dict]:
        contract_path = output_dir / "docs" / "tableau_render_contract.json"
        if not contract_path.exists():
            return [
                {
                    "file": str(contract_path),
                    "label": "Missing tableau_render_contract.json",
                    "line": 1,
                    "preview": "Expected docs/tableau_render_contract.json in Tableau mode.",
                }
            ]

        try:
            payload = json.loads(contract_path.read_text(encoding="utf-8"))
        except Exception as exc:
            return [
                {
                    "file": str(contract_path),
                    "label": "Invalid tableau_render_contract.json",
                    "line": 1,
                    "preview": str(exc),
                }
            ]

        if not isinstance(payload, dict):
            return [
                {
                    "file": str(contract_path),
                    "label": "Invalid tableau_render_contract root",
                    "line": 1,
                    "preview": "Expected top-level object.",
                }
            ]

        worksheets = payload.get("worksheets")
        if not isinstance(worksheets, list):
            return [
                {
                    "file": str(contract_path),
                    "label": "Invalid render contract worksheets",
                    "line": 1,
                    "preview": "Expected worksheets to be a list.",
                }
            ]

        findings: list[dict] = []
        for idx, worksheet in enumerate(worksheets):
            if not isinstance(worksheet, dict):
                findings.append(
                    {
                        "file": str(contract_path),
                        "label": "Render contract worksheet is not object",
                        "line": 1,
                        "preview": f"worksheets[{idx}] must be object.",
                    }
                )
                continue
            for required_key in ("name", "chart_intent", "rows_field", "cols_field", "fidelity_rules"):
                if required_key not in worksheet:
                    findings.append(
                        {
                            "file": str(contract_path),
                            "label": "Render contract worksheet missing field",
                            "line": 1,
                            "preview": f"{worksheet.get('name', f'worksheets[{idx}]')} missing {required_key}",
                        }
                    )
            for required_key in (
                "legend",
                "axis_title_rows",
                "axis_title_cols",
                "interaction",
                "category_order",
                "series_order",
                "stacking",
                "zone",
            ):
                if required_key not in worksheet:
                    findings.append(
                        {
                            "file": str(contract_path),
                            "label": "Render contract worksheet missing field",
                            "line": 1,
                            "preview": f"{worksheet.get('name', f'worksheets[{idx}]')} missing {required_key}",
                        }
                    )
            legend = worksheet.get("legend")
            if legend is not None and not isinstance(legend, dict):
                findings.append(
                    {
                        "file": str(contract_path),
                        "label": "Invalid render contract legend",
                        "line": 1,
                        "preview": f"{worksheet.get('name', f'worksheets[{idx}]')} legend must be an object.",
                    }
                )
            elif isinstance(legend, dict):
                if "zone" not in legend:
                    findings.append(
                        {
                            "file": str(contract_path),
                            "label": "Render contract legend missing field",
                            "line": 1,
                            "preview": f"{worksheet.get('name', f'worksheets[{idx}]')} legend missing zone.",
                        }
                    )
                elif not isinstance(legend.get("zone"), dict):
                    findings.append(
                        {
                            "file": str(contract_path),
                            "label": "Invalid render contract legend zone",
                            "line": 1,
                            "preview": f"{worksheet.get('name', f'worksheets[{idx}]')} legend.zone must be an object.",
                        }
                    )
            stacking = worksheet.get("stacking")
            if stacking is not None and not isinstance(stacking, dict):
                findings.append(
                    {
                        "file": str(contract_path),
                        "label": "Invalid render contract stacking",
                        "line": 1,
                        "preview": f"{worksheet.get('name', f'worksheets[{idx}]')} stacking must be an object.",
                    }
                )
        for key in ("dashboard_text_zones", "dashboard_actions", "highlight_bindings"):
            if key not in payload:
                findings.append(
                    {
                        "file": str(contract_path),
                        "label": f"Missing `{key}` in render contract",
                        "line": 1,
                        "preview": f"Top-level key `{key}` is required.",
                    }
                )
                continue
            if not isinstance(payload.get(key), list):
                findings.append(
                    {
                        "file": str(contract_path),
                        "label": f"Invalid render contract {key}",
                        "line": 1,
                        "preview": f"Expected `{key}` to be a list.",
                    }
                )
        return findings

    def _summarize_placeholders(self, matches: list[dict]) -> str:
        if not matches:
            return ""
        lines = []
        for item in matches[:20]:
            relative = item["file"]
            preview = item["preview"][:80]
            lines.append(f"- {item['label']} in {relative}:{item['line']} → {preview}")
        if len(matches) > 20:
            lines.append(f"- ... {len(matches) - 20} additional occurrences")
        return "\n".join(lines)

    def execute(
        self,
        state: PipelineState,
        config: PipelineConfig,
        knowledge_base,
    ) -> StageOutput:
        workdir = self.get_workdir(state)
        ensure_directory(workdir)
        ensure_directory(state.paths.logs_dir)

        base_instruction = self.build_instruction(state, config)
        attempts: list[dict] = []
        placeholders = self._scan_placeholders(state.paths.output_dir / "src")
        if is_tableau_mode(state):
            placeholders.extend(self._scan_tableau_data_violations(state.paths.output_dir))
            placeholders.extend(self._scan_tableau_numeric_coercion_violations(state.paths.output_dir))
            placeholders.extend(self._scan_tailwind_without_setup(state.paths.output_dir))
            placeholders.extend(self._scan_tableau_spec_contract_violations(state.paths.output_dir))
            placeholders.extend(self._scan_tableau_render_contract_violations(state.paths.output_dir))
        instruction = base_instruction
        attempt_index = 0

        while attempt_index < self.MAX_AUTOFIX_ATTEMPTS:
            attempt_index += 1
            session_id = str(uuid.uuid4())
            logger.info(
                "Invoking Claude CLI for stage '%s' (attempt %s)...",
                self.name,
                attempt_index,
            )
            output = self.runner.run(instruction, workdir, session_id=session_id)
            log_path = state.paths.logs_dir / f"{self.name}_attempt{attempt_index}.log"
            log_path.write_text(output + "\n", encoding="utf-8")
            attempts.append(
                {
                    "attempt": attempt_index,
                    "session_id": session_id,
                    "log_path": str(log_path),
                }
            )

            placeholders = self._scan_placeholders(state.paths.output_dir / "src")
            if is_tableau_mode(state):
                placeholders.extend(self._scan_tableau_data_violations(state.paths.output_dir))
                placeholders.extend(self._scan_tableau_numeric_coercion_violations(state.paths.output_dir))
                placeholders.extend(self._scan_tailwind_without_setup(state.paths.output_dir))
                placeholders.extend(self._scan_tableau_spec_contract_violations(state.paths.output_dir))
                placeholders.extend(self._scan_tableau_render_contract_violations(state.paths.output_dir))
            if not placeholders:
                break

            summary = self._summarize_placeholders(placeholders)
            instruction = (
                f"{base_instruction}\n\nRemaining placeholder tokens detected after attempt {attempt_index}:\n"
                f"{summary}\n\nReplace every occurrence with production-ready copy or data and rerun the validation commands."
            )

        extras = dict(state.extras)
        extras.setdefault("placeholder_fix_attempts", []).extend(attempts)
        extras["placeholder_residuals"] = placeholders

        attempts_payload = {
            "attempts": attempts,
            "remaining_placeholders": placeholders,
        }
        attempts_path = state.paths.logs_dir / "placeholder_fix_attempts.json"
        write_json(attempts_path, attempts_payload)

        artifacts = {
            f"{self.name}_attempts.json": json.dumps(
                attempts_payload,
                ensure_ascii=False,
                indent=2,
            ),
            "placeholder_fix_attempts.json": attempts_payload,
            str(attempts_path): str(attempts_path),
        }
        for attempt in attempts:
            artifacts[attempt["log_path"]] = attempt["log_path"]

        diagnostics = []
        if placeholders:
            diagnostics.append(
                "Residual placeholder strings detected after automated cleanup. See placeholder_fix_attempts.json for details."
            )

        metrics = {
            "placeholder_fix_attempts": len(attempts),
            "placeholder_residual_count": len(placeholders),
        }

        success = not placeholders

        return StageOutput(
            success=success,
            diagnostics=diagnostics,
            artifacts=artifacts,
            metrics=metrics,
            quality={"placeholder_ratio": 0.0 if not placeholders else 1.0},
            state_updates={"extras": extras},
        )


class BugFixStage(ClaudeCLIStage):
    """Use Claude CLI to run validations and fix remaining issues."""

    def __init__(self) -> None:
        super().__init__("bug_fix", "Execute tests/build and resolve remaining errors.")

    def build_instruction(self, state: PipelineState, config: PipelineConfig) -> str:
        tableau_mode = is_tableau_mode(state)
        tableau_policy = build_tableau_data_policy_block(state) if tableau_mode else ""
        tableau_spec_policy = build_tableau_spec_policy_block(state) if tableau_mode else ""
        tableau_render_policy = build_tableau_render_contract_policy_block(state) if tableau_mode else ""
        if tableau_mode:
            return f"""
Working directory: {state.paths.output_dir}
Final polishing tasks:
1. Run `pnpm install` (with `--frozen-lockfile` if a lockfile exists) and treat a successful install as confirmation that dependencies are aligned.
2. Run `pnpm dedupe`, then `pnpm lint`, `pnpm test -- --runInBand`, and `pnpm build`.
3. Resolve any peer dependency or version conflicts surfaced by those commands; if `pnpm install` fails, adjust package.json and re-run until it succeeds cleanly.
4. Enforce Tableau data policy before finalizing:
   - Ensure no dataset files remain under `src/data` or `src/mocks`.
   - Ensure runtime dashboard data is loaded via `fetch('/data/...')`.
   - Ensure dataset references point to `public/data` URLs (`/data/...`) only.
5. Enforce Tableau render contract before finalizing:
   - Treat render contract JSON as authoritative if it conflicts with prose requirements.
   - Ensure each worksheet follows the contract `chart_intent` exactly.
   - For any `horizontal_stacked_percentage_bar` worksheet, enforce horizontal stacked 100% bars.
   - For any `vertical_stacked_percentage_bar` worksheet, enforce vertical stacked 100% bars.
   - For any `horizontal_box_plot` worksheet, enforce horizontal box-and-whisker plots.
   - For any `vertical_box_plot` worksheet, enforce vertical box-and-whisker plots.
   - For stacked-percentage worksheets, aggregate by (`category`, `series_field`) so each category has one segment per series value.
   - For box-plot worksheets, compute quartiles/median/whiskers from row-level data after filters; do not collapse to summed bars.
   - Do not force chart type by dashboard position; use worksheet intent only.
   - Align worksheet placement with contract `zone` coordinates/aspect intent and avoid introducing generic card/grid wrappers that break Tableau composition.
   - Ensure all charts preserve full category labels and title text without clipping.
   - Ensure chart ordering follows contract-defined `category_order` and `series_order`.
   - Render legends for worksheets where `legend.required` is true and anchor them using `legend.zone.relative_position` when available.
   - Render axis titles exactly for worksheets with `axis_title_rows` / `axis_title_cols`.
   - Reproduce selection/highlight interactions from `dashboard_actions` and `highlight_bindings`, including dashboard-wide propagation for dashboard-targeted actions.
   - Coerce quantitative fields to numbers before aggregation and verify bars are non-zero when source values are non-zero.
   - Remove invented global chrome not in Tableau (hero headers/footer watermarks/card shadows unless explicitly defined).
6. Ensure package.json scripts are accurate, README.md documents installation, testing, build commands, and the `admin/admin` login hint if applicable.
7. Emit a final status report summarizing commands executed, fixes applied (including dependency changes validated by `pnpm install`), data-source checks performed, interaction scenarios tested, and remaining risks.

{tableau_policy}
{tableau_spec_policy}
{tableau_render_policy}

If any command fails, address the root cause and rerun until the suite passes or you have a clear explanation of the blocking issue.
"""

        return f"""
Working directory: {state.paths.output_dir}
Final polishing tasks:
1. Run `pnpm install` (with `--frozen-lockfile` if a lockfile exists) and treat a successful install as confirmation that dependencies are aligned.
2. Run `pnpm dedupe`, then `pnpm lint`, `pnpm test -- --runInBand`, and `pnpm build`.
3. Resolve any peer dependency or version conflicts surfaced by those commands; if `pnpm install` fails, adjust package.json and re-run until it succeeds cleanly.
4. Ensure package.json scripts are accurate, README.md documents installation, testing, build commands, and the `admin/admin` login hint if applicable.
5. Emit a final status report summarizing commands executed, fixes applied (including dependency changes validated by `pnpm install`), interaction scenarios tested, and remaining risks.

If any command fails, address the root cause and rerun until the suite passes or you have a clear explanation of the blocking issue.
"""

    def execute(self, state: PipelineState, config: PipelineConfig, knowledge_base) -> StageOutput:
        workdir = self.get_workdir(state)
        ensure_directory(workdir)
        ensure_directory(state.paths.logs_dir)

        base_instruction = self.build_instruction(state, config)
        instruction = base_instruction
        attempts: List[Dict[str, Any]] = []
        validation: Dict[str, Any] = {}
        log_sections: List[str] = []

        for attempt_index in range(1, BUG_FIX_MAX_AUTOFIX_ATTEMPTS + 1):
            session_id = str(uuid.uuid4())
            logger.info("Invoking Claude CLI for stage '%s' (attempt %s)...", self.name, attempt_index)
            try:
                output = self.runner.run(instruction, workdir, session_id=session_id)
            except ClaudeDriverError as exc:
                raise RuntimeError(f"Claude CLI failed during stage '{self.name}': {exc}") from exc

            attempt_log_path = state.paths.logs_dir / f"{self.name}_attempt{attempt_index}.log"
            attempt_log_path.write_text(output + "\n", encoding="utf-8")
            log_sections.append(f"## Attempt {attempt_index}\n{output.strip()}\n")

            validation = _run_command_validation(workdir, state.paths.logs_dir)
            attempts.append(
                {
                    "attempt": attempt_index,
                    "session_id": session_id,
                    "log_path": str(attempt_log_path),
                    "validation_passed": validation.get("passed", False),
                    "failure_categories": validation.get("failure_categories", []),
                }
            )

            if validation.get("passed"):
                break

            instruction = _build_validation_follow_up(base_instruction, validation, attempt_index)

        final_log_path = state.paths.logs_dir / f"{self.name}.log"
        final_log_path.write_text("\n\n".join(section.strip() for section in log_sections if section.strip()) + "\n", encoding="utf-8")

        validation_path = state.paths.logs_dir / "bug_fix_validation.json"
        validation_payload = {
            **validation,
            "attempts": attempts,
            "stage_log_path": str(final_log_path),
        }
        write_json(validation_path, validation_payload)

        extras = dict(state.extras)
        extras[f"{self.name}_log"] = "\n\n".join(section.strip() for section in log_sections if section.strip())
        extras[f"{self.name}_attempts"] = attempts
        extras["bug_fix_validation"] = validation_payload

        diagnostics: List[str] = []
        if validation and not validation.get("passed", False):
            diagnostics.append(
                "Objective bug_fix validation failed. See bug_fix_validation.json for command-level evidence."
            )

        metrics = {
            "bug_fix_attempts": len(attempts),
            "bug_fix_passed": int(bool(validation.get("passed"))),
            "bug_fix_failure_categories": len(validation.get("failure_categories", [])),
        }

        artifacts: Dict[str, Any] = {
            "bug_fix_validation.json": validation_payload,
            str(validation_path): str(validation_path),
            str(final_log_path): str(final_log_path),
        }
        for attempt in attempts:
            artifacts[str(attempt["log_path"])] = str(attempt["log_path"])

        return StageOutput(
            success=bool(validation.get("passed")),
            diagnostics=diagnostics,
            artifacts=artifacts,
            metrics=metrics,
            state_updates={"extras": extras},
        )


__all__ = [
    "FirstGenerationStage",
    "PlaceholderFixStage",
    "BugFixStage",
]
