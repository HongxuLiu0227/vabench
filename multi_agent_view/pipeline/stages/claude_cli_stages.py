"""Claude CLI-backed stages for single-view generation and hardening."""

from __future__ import annotations

import uuid
from pathlib import Path
from typing import Dict, Optional

from multi_agent_new.cli_runner import ClaudeDriver, ClaudeDriverError
from multi_agent_new.pipeline.context import PipelineState
from multi_agent_new.pipeline.stage import PipelineStage, StageOutput
from multi_agent_new.pipeline.utils import ensure_directory
from multi_agent_new.snippets import summarize_snippet

from ...config import PipelineConfig
from ...logging_config import get_logger

logger = get_logger(__name__)



def build_snippet_context(snippets: Dict[str, str], limit: int = 3) -> str:
    if not snippets:
        return ""
    summaries = []
    for idx, (name, content) in enumerate(snippets.items()):
        if idx >= limit:
            break
        summaries.append(summarize_snippet(name, content))
    return "\n\n".join(summaries)


class ClaudeCLIStage(PipelineStage):
    """Base stage delegating code edits to the Claude CLI driver."""

    def __init__(self, name: str, description: str) -> None:
        super().__init__(name=name, description=description)
        self._runner: Optional[ClaudeDriver] = None

    @property
    def runner(self) -> ClaudeDriver:
        if self._runner is None:
            self._runner = ClaudeDriver(timeout_seconds=7200)
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

        extras = dict(state.extras)
        extras[f"{self.name}_session"] = session_id
        extras[f"{self.name}_log"] = output

        return StageOutput(
            state_updates={"extras": extras},
            artifacts={f"{self.name}_output.txt": output, str(log_path): str(log_path)},
            metrics={"cli_output_chars": len(output)},
        )


class FirstGenerationStage(ClaudeCLIStage):
    """Generate the first complete single-view implementation."""

    def __init__(self) -> None:
        super().__init__("first_generation", "Create the initial single-view React app implementation.")

    def build_instruction(self, state: PipelineState, config: PipelineConfig) -> str:
        snippet_context = build_snippet_context(state.snippets)
        requirements_path = state.paths.output_dir / "docs" / "requirements.md"

        return f"""
You are responsible for generating the first working version of this project in {state.paths.output_dir}.

Project context:
- This directory already contains a fresh Vite + React + TypeScript scaffold.
- Read requirements from: {requirements_path}

Hard constraints (do not violate):
1. Build exactly ONE primary view/page and expose it at `/`.
2. Do NOT implement multi-page navigation or multiple top-level routes.
3. If you use `react-router-dom`, keep only one route (`/`) and optional fallback route rendering the same view.
4. Keep all product functionality inside this single view using sections/cards/tabs/drawers/modals.
5. Every button/filter/form must trigger meaningful behavior (state updates, filtering, sorting, modal open/close, submit flows).
6. No placeholder copy, TODO markers, or fake inert controls.
7. If this single view is chart-centric, implement chart rendering with D3.

Implementation requirements:
- Use Ant Design as the primary UI library.
- Build a polished, data-rich, responsive layout suitable for desktop and mobile.
- Keep structure maintainable (`src/components`, optional `src/hooks`, optional `src/services`).
- Use TypeScript strictness and named exports for components where practical.

Validation tasks:
- Run `pnpm install`.
- Run `pnpm lint -- --max-warnings 0`.
- Run `pnpm build`.
- If a test script exists in `package.json`, run `pnpm test -- --runInBand`.

Helpful snippets:
{snippet_context or 'None provided.'}

Deliverables:
- A runnable project in {state.paths.output_dir} implementing a single, high-quality view.
- No extra pages/routes beyond the single-view constraint.
- Updated README with run/build instructions and any login credentials if auth is implemented.
"""


class BugFixStage(ClaudeCLIStage):
    """Stabilize the generated single-view app."""

    def __init__(self) -> None:
        super().__init__("bug_fix", "Run validations and resolve remaining issues for the single-view app.")

    def build_instruction(self, state: PipelineState, config: PipelineConfig) -> str:
        return f"""
Working directory: {state.paths.output_dir}

Final polishing tasks:
1. Run `pnpm install` (use `--frozen-lockfile` if lockfile exists).
2. Run `pnpm dedupe`, then `pnpm lint`, and `pnpm build`.
3. If a test script exists, run `pnpm test -- --runInBand`.
4. Fix all reported errors/warnings that block lint/build/test.
5. Re-check single-view constraint:
   - Keep exactly one primary route/view.
   - Remove or merge any extra pages/routes into the single view.
   - Ensure navigation controls are in-view interactions (tabs/anchors/filters), not page switches.
6. Summarize fixes and final command results in stdout.

If any command fails, fix the root cause and rerun until clean or provide a concrete blocking reason.
"""


__all__ = ["FirstGenerationStage", "BugFixStage"]
