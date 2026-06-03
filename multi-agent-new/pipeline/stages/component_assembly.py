"""Component assembly stage leveraging local generation agents."""

from __future__ import annotations

from typing import Dict

from ...config import PipelineConfig
from ..context import ComponentAssembly, PipelineState
from ..knowledge_base import KnowledgeBase
from ..stage import PipelineStage, StageOutput
from ..utils import write_text_files
from ...agents.component_generator_agent import (
    PLACEHOLDER_PATTERN,
    generate_components,
)


class ComponentAssemblyStage(PipelineStage):
    """Generate feature-rich Ant Design components using the legacy generator."""

    def __init__(self) -> None:
        super().__init__(
            name="component_assembly",
            description="Generate React components and supporting files via the legacy component generator.",
            consumes=["workspace", "experience_plan", "data_state_plan", "product_spec"],
            produces=["components"],
        )

    def execute(
        self,
        state: PipelineState,
        config: PipelineConfig,
        knowledge_base: KnowledgeBase,
    ) -> StageOutput:
        if (
            state.workspace is None
            or state.experience_plan is None
            or state.data_state_plan is None
            or state.product_spec is None
        ):
            raise ValueError("Component assembly requires workspace, plan, routing, and requirement artifacts.")

        generated_files: Dict[str, str] = generate_components(
            str(state.workspace.root_path),
            state.experience_plan.component_manifest,
            state.data_state_plan.allowed_libraries,
            file_structure_manifest=state.workspace.file_structure_manifest,
            project_prompt=state.product_spec.enriched_prompt,
            routing_manifest=state.data_state_plan.routing_manifest,
            snippets=state.snippets,
            restrict_to_manifest=False,
        )

        if generated_files:
            write_text_files(state.workspace.root_path, generated_files)

        placeholder_hits = [
            path for path, content in generated_files.items() if PLACEHOLDER_PATTERN.search(content)
        ]
        placeholder_ratio = len(placeholder_hits) / max(len(generated_files), 1)

        assembly = ComponentAssembly(
            generated_files=generated_files,
            notes=["Generated via legacy component generator agent."],
            placeholder_ratio=placeholder_ratio,
        )

        return StageOutput(
            state_updates={"components": assembly},
            artifacts=generated_files,
            metrics={
                "generated_files": len(generated_files),
                "placeholder_hits": len(placeholder_hits),
            },
            quality={
                "placeholder_ratio": placeholder_ratio,
            },
        )


__all__ = ["ComponentAssemblyStage"]
