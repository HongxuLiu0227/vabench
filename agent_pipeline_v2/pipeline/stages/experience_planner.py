"""Experience planner stage."""

from __future__ import annotations

from typing import Dict

from ...config import PipelineConfig
from ..context import ExperiencePlan, PipelineState
from ..knowledge_base import KnowledgeBase
from ..stage import PipelineStage, StageOutput
from ...agents.structure_planner_agent import plan_structure

class ExperiencePlannerStage(PipelineStage):
    """Translate the spec into navigation, screen flows, and AntD layout plan."""

    def __init__(self) -> None:
        super().__init__(
            name="experience_planner",
            description="Design the experience architecture and Ant Design layout strategy.",
            consumes=["workspace", "product_spec"],
            produces=["experience_plan"],
        )

    def execute(
        self,
        state: PipelineState,
        config: PipelineConfig,
        knowledge_base: KnowledgeBase,
    ) -> StageOutput:
        if state.product_spec is None or state.workspace is None:
            raise ValueError("Experience planner requires requirement analysis and workspace artifacts.")

        manifest = plan_structure(
            str(state.workspace.root_path),
            state.product_spec.enriched_prompt,
        )

        pages = manifest.get("pages", []) if isinstance(manifest, dict) else []
        components = manifest.get("components", []) if isinstance(manifest, dict) else []
        coverage_report: Dict[str, int] = {
            "page_count": len(pages),
            "component_count": len(components),
            "section_count": sum(len(page.get("sections", [])) for page in pages if isinstance(page, dict)),
        }

        experience_plan = ExperiencePlan(
            component_manifest=manifest,
            coverage_report=coverage_report,
        )

        return StageOutput(
            state_updates={"experience_plan": experience_plan},
            artifacts={"experience_plan": experience_plan},
            metrics=coverage_report,
        )


__all__ = ["ExperiencePlannerStage"]
