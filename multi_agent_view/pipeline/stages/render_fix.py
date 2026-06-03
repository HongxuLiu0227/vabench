"""Render validation stage for the single-view pipeline."""

from __future__ import annotations

import subprocess
from pathlib import Path
from typing import List

from agent_pipeline.pipeline.context import PipelineState
from agent_pipeline.pipeline.knowledge_base import KnowledgeBase
from agent_pipeline.pipeline.stage import PipelineStage, StageOutput
from agent_pipeline.pipeline.utils import ensure_directory

from ...config import PipelineConfig
from ...logging_config import get_logger

logger = get_logger(__name__)


class RenderFixStage(PipelineStage):
    """Run the Node renderer to capture the single-view screenshot."""

    def __init__(self) -> None:
        super().__init__(
            name="render_fix",
            description="Render the generated single-view project and save screenshots.",
            consumes=["workspace"],
        )

    def execute(
        self,
        state: PipelineState,
        config: PipelineConfig,
        knowledge_base: KnowledgeBase,
    ) -> StageOutput:
        if not config.flags.visual_checks_enabled:
            logger.info("Visual checks disabled; skipping render_fix stage.")
            return StageOutput(
                diagnostics=["render_fix skipped because visual checks are disabled."],
                metrics={"render_skipped": 1},
            )

        if state.workspace is None:
            raise ValueError("Render fix stage requires the scaffolded workspace artifact.")

        project_path = state.workspace.root_path
        screenshots_dir = project_path / "screenshots"
        ensure_directory(screenshots_dir)
        ensure_directory(state.paths.logs_dir)

        repo_root = Path(__file__).resolve().parents[3]
        render_script = repo_root / "project-renderer" / "render-project.js"
        if not render_script.exists():
            message = f"Render script not found at {render_script}"
            logger.error(message)
            return StageOutput(success=False, diagnostics=[message])

        command: List[str] = [
            "node",
            str(render_script),
            "--project",
            str(project_path),
            "--output",
            str(screenshots_dir),
            "--routes",
            "/",
        ]

        logger.info("Executing render command: %s", " ".join(command))
        result = subprocess.run(
            command,
            cwd=str(render_script.parent),
            capture_output=True,
            text=True,
        )

        log_path = state.paths.logs_dir / "render_fix.log"
        log_contents = (result.stdout or "") + ("\n" if result.stdout and result.stderr else "") + (result.stderr or "")
        log_path.write_text(log_contents, encoding="utf-8")

        screenshots = sorted(
            str(path.relative_to(project_path))
            for path in screenshots_dir.glob("*.png")
        )

        extras = dict(state.extras)
        extras["render_fix"] = {
            "command": command,
            "log_path": str(log_path),
            "screenshots": screenshots,
            "returncode": result.returncode,
        }

        artifacts = {
            "render_fix.log": log_contents,
            "render_log_path": str(log_path),
            "render_command": " ".join(command),
            "render_screenshots": screenshots,
        }

        metrics = {
            "render_returncode": result.returncode,
            "render_screenshots": len(screenshots),
        }

        diagnostics = []
        success = result.returncode == 0

        if not success:
            diagnostics.append("Render script exited with a non-zero status. See render_fix.log for details.")
            logger.error("Render script failed with exit code %s", result.returncode)
        elif not screenshots:
            diagnostics.append("Render completed but no screenshots were generated.")
            logger.warning("Render completed without producing screenshots.")
            success = False

        return StageOutput(
            success=success,
            diagnostics=diagnostics,
            artifacts=artifacts,
            metrics=metrics,
            state_updates={"extras": extras},
        )


__all__ = ["RenderFixStage"]
