"""Registerable pipeline stages."""

from .requirement_architect import RequirementArchitectStage
from .project_scaffolder import ProjectScaffolderStage
from .claude_cli_stages import FirstGenerationStage, PlaceholderFixStage, BugFixStage
from .tableau_source_compliance import TableauSourceComplianceStage
from .render_fix import RenderFixStage
from .quality_assurance import QualityAssuranceStage

__all__ = [
    "RequirementArchitectStage",
    "ProjectScaffolderStage",
    "FirstGenerationStage",
    "TableauSourceComplianceStage",
    "PlaceholderFixStage",
    "BugFixStage",
    "RenderFixStage",
    "QualityAssuranceStage",
]
