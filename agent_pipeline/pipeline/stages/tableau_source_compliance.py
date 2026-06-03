"""Deterministic Tableau source validation with targeted repair attempts."""

from __future__ import annotations

import json
import uuid
from pathlib import Path
from typing import Any, Dict, List

from ...config import PipelineConfig
from ...logging_config import get_logger
from ..context import PipelineState
from ..knowledge_base import KnowledgeBase
from ..stage import StageOutput
from ..tableau_source_validation import validate_tableau_source
from ..utils import ensure_directory, write_json
from .claude_cli_stages import (
    ClaudeCLIStage,
    build_tableau_data_policy_block,
    build_tableau_render_contract_policy_block,
    build_tableau_spec_policy_block,
    is_tableau_mode,
)

logger = get_logger(__name__)


def _has_blocking_validation_failures(validation: Dict[str, Any]) -> bool:
    if validation.get("passed", False):
        return False
    issues = validation.get("issues")
    if not isinstance(issues, list):
        return bool(validation.get("failure_categories"))
    return any(
        not isinstance(issue, dict) or str(issue.get("severity") or "error").lower() == "error"
        for issue in issues
    )


class TableauSourceComplianceStage(ClaudeCLIStage):
    """Validate Tableau data ingestion assumptions and repair them when possible."""

    MAX_ATTEMPTS = 3

    def __init__(self) -> None:
        super().__init__(
            name="tableau_source_compliance",
            description="Validate Tableau source parsing assumptions and fix malformed data-loader behavior.",
        )

    def build_instruction(self, state: PipelineState, config: PipelineConfig) -> str:
        tableau_policy = build_tableau_data_policy_block(state)
        tableau_spec_policy = build_tableau_spec_policy_block(state)
        tableau_render_policy = build_tableau_render_contract_policy_block(state)
        return f"""
Working directory: {state.paths.output_dir}
Goal: make Tableau source ingestion deterministic and correct before later QA/build stages.

Requirements:
- Read the current datasets under `public/data/` and ensure the runtime loader can parse them correctly.
- If a CSV contains preamble rows before the real header, update the loader/parser to detect and skip them.
- If CSV headers are quoted/dirty (for example `"Order Date"` wrapped in repeated quotes), normalize headers before field lookup.
- Ensure required Tableau fields from the render contract resolve to real columns at runtime.
- Prevent silent bad parses that lead to all-zero charts, `NaN` filters, or `Jan 1970` timelines.
- Fix build blockers directly related to source parsing/bootstrap if found (for example importing `./App.tsx` from `src/main.tsx`).
- Prefer fixing parsing/normalization logic in source code; do not delete data quality evidence from datasets.
- After edits, make sure the deterministic Tableau source validator passes.

{tableau_policy}
{tableau_spec_policy}
{tableau_render_policy}
"""

    def _validation(self, state: PipelineState) -> Dict[str, Any]:
        tableau_context = state.extras.get("tableau_context")
        if not isinstance(tableau_context, dict):
            tableau_context = {}
        return validate_tableau_source(state.paths.output_dir, tableau_context)

    def _build_follow_up_instruction(self, base_instruction: str, validation: Dict[str, Any], attempt_index: int) -> str:
        issue_lines = []
        for issue in validation.get("issues", []):
            if not isinstance(issue, dict):
                continue
            issue_lines.append(
                f"- [{issue.get('code')}] {issue.get('message')} (path: {issue.get('path')})"
            )

        issue_block = "\n".join(issue_lines) if issue_lines else "- validator failed without structured issues"
        return (
            f"{base_instruction}\n\n"
            f"Deterministic Tableau source validation failed after attempt {attempt_index}.\n"
            f"Fix these exact issues and re-run:\n{issue_block}\n\n"
            "Focus first on data-loader/header parsing correctness, then on minor bootstrap/build issues."
        )

    def execute(
        self,
        state: PipelineState,
        config: PipelineConfig,
        knowledge_base: KnowledgeBase,
    ) -> StageOutput:
        if not is_tableau_mode(state):
            return StageOutput(metrics={"tableau_source_validation_skipped": 1})

        workdir = self.get_workdir(state)
        ensure_directory(workdir)
        ensure_directory(state.paths.logs_dir)

        base_instruction = self.build_instruction(state, config)
        instruction = base_instruction
        attempts: List[Dict[str, Any]] = []
        validation = self._validation(state)

        attempt_index = 0
        while _has_blocking_validation_failures(validation) and attempt_index < self.MAX_ATTEMPTS:
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
            validation = self._validation(state)
            attempts.append(
                {
                    "attempt": attempt_index,
                    "session_id": session_id,
                    "log_path": str(log_path),
                    "validation_passed": validation.get("passed", False),
                    "failure_categories": validation.get("failure_categories", []),
                }
            )
            if not _has_blocking_validation_failures(validation):
                break
            instruction = self._build_follow_up_instruction(base_instruction, validation, attempt_index)

        validation_payload = {
            **validation,
            "attempts": attempts,
        }
        validation_path = state.paths.logs_dir / "tableau_source_validation.json"
        write_json(validation_path, validation_payload)

        extras = dict(state.extras)
        extras["tableau_source_validation"] = validation_payload
        extras["tableau_source_compliance_attempts"] = attempts

        artifacts: Dict[str, Any] = {
            "tableau_source_validation.json": validation_payload,
            str(validation_path): str(validation_path),
        }
        for attempt in attempts:
            artifacts[str(attempt["log_path"])] = str(attempt["log_path"])

        diagnostics: List[str] = []
        success = not _has_blocking_validation_failures(validation)

        if not success:
            diagnostics.append(
                "Tableau source validation failed. See tableau_source_validation.json for parser/header issues."
            )

        metrics = {
            "tableau_source_attempts": len(attempts),
            "tableau_source_failure_categories": len(validation.get("failure_categories", [])),
            "tableau_source_passed": int(success),
        }

        return StageOutput(
            success=success,
            diagnostics=diagnostics,
            artifacts=artifacts,
            metrics=metrics,
            state_updates={"extras": extras},
        )


__all__ = ["TableauSourceComplianceStage"]
