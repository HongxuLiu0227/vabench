"""Integrator stage that refines generated code using legacy agents."""

from __future__ import annotations

from typing import Dict, List

from ...config import PipelineConfig
from ..context import ComponentAssembly, IntegrationArtifact, PipelineState
from ..knowledge_base import KnowledgeBase
from ..stage import PipelineStage, StageOutput
from ..utils import write_text_files
from ...agents.relationship_refactor_agent import refactor_relationships
from ...agents.import_resolver_agent import resolve_imports_and_files
from ...agents.code_validation_agent import (
    check_forbidden_packages,
    validate_code,
)
from ...agents.code_fixer_agent import fix_code_issues


class IntegratorStage(PipelineStage):
    """Wire components, refine imports, and iteratively fix validation issues."""

    def __init__(self) -> None:
        super().__init__(
            name="integrator",
            description="Integrate generated code by refactoring relationships and resolving validation issues.",
            consumes=["components", "experience_plan", "workspace", "product_spec", "data_state_plan"],
            produces=["integration"],
        )

    def execute(
        self,
        state: PipelineState,
        config: PipelineConfig,
        knowledge_base: KnowledgeBase,
    ) -> StageOutput:
        if (
            state.components is None
            or state.workspace is None
            or state.experience_plan is None
            or state.product_spec is None
            or state.data_state_plan is None
        ):
            raise ValueError("Integrator requires component, workspace, plan, and routing artifacts.")

        workspace_root = state.workspace.root_path
        combined_files: Dict[str, str] = {
            **state.workspace.config_files,
            **state.components.generated_files,
        }

        refactored = refactor_relationships(
            combined_files,
            state.experience_plan.component_manifest,
            state.product_spec.enriched_prompt,
        )
        combined_files.update(refactored)
        if refactored:
            write_text_files(workspace_root, refactored)

        resolved = resolve_imports_and_files(combined_files, str(workspace_root))
        combined_files.update(resolved)
        if resolved:
            write_text_files(workspace_root, resolved)

        forbidden = check_forbidden_packages(combined_files)
        issues = validate_code(str(workspace_root), combined_files)

        fixes_applied: Dict[str, str] = {}
        final_issues: List[str] = issues
        final_forbidden = forbidden

        if issues or forbidden:
            fixes_applied = fix_code_issues(
                combined_files,
                issues,
                forbidden,
                state.data_state_plan.allowed_libraries,
                state.experience_plan.component_manifest,
                file_tree=state.workspace.file_structure_manifest,
            )
            if fixes_applied:
                combined_files.update(fixes_applied)
                write_text_files(workspace_root, fixes_applied)

            final_forbidden = check_forbidden_packages(combined_files)
            final_issues = validate_code(str(workspace_root), combined_files)

        updated_components = ComponentAssembly(
            generated_files=combined_files,
            refactored_files=refactored,
            resolved_files=resolved,
            notes=(state.components.notes or []) + ["Relationships refactored and imports resolved."],
            placeholder_ratio=state.components.placeholder_ratio,
        )

        integration = IntegrationArtifact(
            validation_issues=final_issues,
            forbidden_packages=final_forbidden,
            fixes_applied=fixes_applied,
            final_files=combined_files,
        )

        return StageOutput(
            state_updates={"integration": integration, "components": updated_components},
            artifacts={"integration": integration},
            metrics={
                "validation_issue_count": len(final_issues),
                "forbidden_package_count": len(final_forbidden),
                "files_processed": len(combined_files),
            },
        )


__all__ = ["IntegratorStage"]
