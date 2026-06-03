"""Registerable stages for the single-view pipeline."""

from .requirement_architect import RequirementArchitectStage
from .project_scaffolder import ProjectScaffolderStage
from .claude_cli_stages import FirstGenerationStage, BugFixStage
from .render_fix import RenderFixStage

__all__ = [
    "RequirementArchitectStage",
    "ProjectScaffolderStage",
    "FirstGenerationStage",
    "BugFixStage",
    "RenderFixStage",
]
