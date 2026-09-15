"""Vision-specific fix stages built on top of multi_agent_new hardening logic."""

from __future__ import annotations

import json
import uuid
from typing import Any, Dict, List

from multi_agent_new.config import PipelineConfig
from multi_agent_new.pipeline.context import PipelineState
from multi_agent_new.pipeline.stage import StageOutput
from multi_agent_new.pipeline.stages.claude_cli_stages import (
    BugFixStage as BaseBugFixStage,
    PlaceholderFixStage as BasePlaceholderFixStage,
)
from multi_agent_new.pipeline.stages.render_fix import RenderFixStage as BaseRenderFixStage
from multi_agent_new.pipeline.utils import ensure_directory, write_json

from .logging_config import get_logger

logger = get_logger(__name__)


def _get_vision_context(state: PipelineState) -> Dict[str, Any]:
    context = state.extras.get("vision_context")
    return context if isinstance(context, dict) else {}


def _format_csv_paths(context: Dict[str, Any]) -> str:
    csv_paths = context.get("staged_csv_paths")
    if not isinstance(csv_paths, list) or not csv_paths:
        return "- `public/data/<file>.csv`"
    return "\n".join(f"- `{path}`" for path in csv_paths if isinstance(path, str) and path.strip())


def _format_csv_overview(context: Dict[str, Any]) -> str:
    profiles = context.get("csv_profiles")
    if not isinstance(profiles, list) or not profiles:
        return "- CSV profiles unavailable."

    lines: List[str] = []
    for item in profiles:
        if not isinstance(item, dict):
            continue
        file_name = str(item.get("file_name") or "unknown.csv")
        column_count = item.get("column_count")
        columns = item.get("columns")
        if isinstance(columns, list):
            preview = ", ".join(str(column) for column in columns[:20])
        else:
            preview = ""
        lines.append(f"- {file_name}: {column_count} columns; columns={preview}")

    return "\n".join(lines) if lines else "- CSV profiles unavailable."


class NoGateMixin:
    """Disable stage-level gate evaluation for vision_once fix stages."""

    def _run_gates(self, output, state, config, timeout, duration) -> list:
        return []


class VisionPlaceholderFixStage(NoGateMixin, BasePlaceholderFixStage):
    """Remove placeholders while preserving screenshot fidelity and real-data usage."""

    MAX_AUTOFIX_ATTEMPTS = 1

    def build_instruction(self, state: PipelineState, config: PipelineConfig) -> str:
        context = _get_vision_context(state)
        image_path = context.get("staged_image_path", "docs/image.png")
        contract_path = context.get("staged_interaction_contract_path", "docs/interaction_contract.json")
        csv_paths = _format_csv_paths(context)
        csv_overview = _format_csv_overview(context)

        return f"""
Working directory: {state.paths.output_dir}

Before editing, inspect these staged inputs from the workspace:
- Screenshot: `{image_path}`
- Interaction contract: `{contract_path}`
- CSV files under `public/data`:
{csv_paths}

Goal: eliminate placeholder/stub logic and harden the generated dashboard while preserving the screenshot layout and interaction contract.

Checklist:
- Treat the screenshot as the visual source of truth for layout, chart composition, spacing, typography hierarchy, and overall color feeling.
- Treat `interaction_contract.json` as the interaction source of truth for worksheet structure, highlight bindings, dashboard actions, and worksheet actions.
- Search for placeholder tokens (`TODO`, `Lorem ipsum`, `Coming soon`, `Sample data`, `Dummy`, `Placeholder`) and replace them with production-ready copy and behavior.
- Remove inert handlers. Buttons, links, menus, tabs, filters, and form submits must trigger meaningful state updates, filtering, highlighting, navigation, or modal flows.
- Use ONLY the real CSV files already staged in `public/data`.
- Do NOT keep or create runtime datasets under `src/data` or `src/mocks`.
- Load CSV files via `fetch('/data/...')`, parse them in browser code, and coerce numeric fields with `Number(...)` / `parseFloat(...)` before aggregation.
- Keep the dashboard experience accessible at `/`.
- Preserve contract-defined linkage/highlight behavior. If screenshot and contract conflict, keep the contract behavior.
- If Tailwind is not actually installed and configured, replace Tailwind utility classes with plain CSS or inline styles.
- After edits, run `pnpm install`, `pnpm lint`, `pnpm test -- --runInBand` when a test script exists, and `pnpm build`.
- Summarize the concrete placeholder removals, interaction fixes, and data-loading fixes you applied.

CSV overview:
{csv_overview}
""".strip()

    def _scan_vision_findings(self, output_dir) -> list[dict]:
        findings = self._scan_placeholders(output_dir / "src")
        findings.extend(self._scan_tableau_data_violations(output_dir))
        findings.extend(self._scan_tableau_numeric_coercion_violations(output_dir))
        findings.extend(self._scan_tailwind_without_setup(output_dir))
        return findings

    def execute(self, state: PipelineState, config: PipelineConfig, knowledge_base) -> StageOutput:
        workdir = self.get_workdir(state)
        ensure_directory(workdir)
        ensure_directory(state.paths.logs_dir)

        base_instruction = self.build_instruction(state, config)
        attempts: list[dict] = []
        findings = self._scan_vision_findings(state.paths.output_dir)
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

            findings = self._scan_vision_findings(state.paths.output_dir)
            if not findings:
                break

            summary = self._summarize_placeholders(findings)
            instruction = (
                f"{base_instruction}\n\nRemaining placeholder or data-policy issues after attempt {attempt_index}:\n"
                f"{summary}\n\nFix every remaining issue above, then rerun install/lint/test/build validation."
            )

        extras = dict(state.extras)
        extras.setdefault("placeholder_fix_attempts", []).extend(attempts)
        extras["placeholder_residuals"] = findings

        attempts_payload = {
            "attempts": attempts,
            "remaining_placeholders": findings,
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
        if findings:
            diagnostics.append(
                "Residual placeholder or real-data policy issues remain after automated cleanup. "
                "See placeholder_fix_attempts.json for details."
            )

        metrics = {
            "placeholder_fix_attempts": len(attempts),
            "placeholder_residual_count": len(findings),
        }

        return StageOutput(
            success=not findings,
            diagnostics=diagnostics,
            artifacts=artifacts,
            metrics=metrics,
            quality={"placeholder_ratio": 0.0 if not findings else 1.0},
            state_updates={"extras": extras},
        )


class VisionBugFixStage(NoGateMixin, BaseBugFixStage):
    """Run objective validations with vision-specific fidelity constraints."""

    MAX_AUTOFIX_ATTEMPTS = 1

    def execute(self, state: PipelineState, config: PipelineConfig, knowledge_base) -> StageOutput:
        from multi_agent_new.pipeline.stages import claude_cli_stages as bug_fix_module

        previous = bug_fix_module.BUG_FIX_MAX_AUTOFIX_ATTEMPTS
        bug_fix_module.BUG_FIX_MAX_AUTOFIX_ATTEMPTS = self.MAX_AUTOFIX_ATTEMPTS
        try:
            return super().execute(state, config, knowledge_base)
        finally:
            bug_fix_module.BUG_FIX_MAX_AUTOFIX_ATTEMPTS = previous

    def build_instruction(self, state: PipelineState, config: PipelineConfig) -> str:
        context = _get_vision_context(state)
        image_path = context.get("staged_image_path", "docs/image.png")
        contract_path = context.get("staged_interaction_contract_path", "docs/interaction_contract.json")
        csv_paths = _format_csv_paths(context)
        csv_overview = _format_csv_overview(context)

        return f"""
Working directory: {state.paths.output_dir}

Before editing, inspect these staged inputs from the workspace:
- Screenshot: `{image_path}`
- Interaction contract: `{contract_path}`
- CSV files under `public/data`:
{csv_paths}

Final polishing tasks:
1. Run `pnpm install` (use `--frozen-lockfile` if a lockfile exists), then run `pnpm dedupe`, `pnpm lint`, `pnpm test -- --runInBand` when available, and `pnpm build`.
2. Fix every dependency, lint, test, type, and build failure until the objective validation is clean or there is a concrete blocking reason.
3. Re-check real-data policy:
   - Runtime dashboard data must come only from the staged CSV files in `public/data`.
   - No dataset files should remain under `src/data` or `src/mocks`.
   - CSV loading must use `fetch('/data/...')`.
   - Quantitative fields must be coerced to numbers before aggregation.
4. Re-check behavior and fidelity:
   - Preserve the screenshot's dashboard composition, chart intent, spacing, typography hierarchy, and color feel.
   - Preserve interaction-contract behavior for highlight/linkage/filter actions.
   - Every visible control must perform a real action; remove any no-op handlers or fake toasts.
   - Keep the dashboard experience available at `/`.
5. Update README if the run/build steps or caveats changed.
6. Emit a final status report summarizing commands executed, fixes applied, interaction scenarios validated, and remaining risks.

CSV overview:
{csv_overview}

If any command fails, fix the root cause and rerun until the suite passes or you can explain the remaining blocker precisely.
""".strip()


class VisionRenderFixStage(NoGateMixin, BaseRenderFixStage):
    """Render validation stage without gate checks."""

    MAX_RENDER_ATTEMPTS = 1


__all__ = ["VisionPlaceholderFixStage", "VisionBugFixStage", "VisionRenderFixStage"]
