"""Data & state modeler stage."""

from __future__ import annotations
from typing import List

from ...config import PipelineConfig
from ..context import DataStatePlan, PipelineState
from ..knowledge_base import KnowledgeBase
from ..stage import PipelineStage, StageOutput
from ...agents.router_design_agent import design_routes
from ...agents.code_validation_agent import get_shared_project_packages


class DataStateModelerStage(PipelineStage):
    """Design routing manifest and capture dependency context."""

    def __init__(self) -> None:
        super().__init__(
            name="data_state_modeler",
            description="Model routing hierarchy and shared dependencies for downstream agents.",
            consumes=["experience_plan", "workspace", "product_spec"],
            produces=["data_state_plan"],
        )

    def execute(
        self,
        state: PipelineState,
        config: PipelineConfig,
        knowledge_base: KnowledgeBase,
    ) -> StageOutput:
        if state.product_spec is None or state.experience_plan is None or state.workspace is None:
            raise ValueError("Data & state modeler requires requirement, workspace, and experience plan artifacts.")

        routing_manifest = design_routes(
            str(state.workspace.root_path),
            state.product_spec.enriched_prompt,
            state.experience_plan.component_manifest,
        )

        package_dependencies = set(state.workspace.dependencies.keys())
        package_dependencies.update(state.workspace.dev_dependencies.keys())
        shared_packages = get_shared_project_packages()
        package_dependencies.update(shared_packages)

        plan = DataStatePlan(
            routing_manifest=routing_manifest,
            allowed_libraries=sorted(package_dependencies),
        )

        return StageOutput(
            state_updates={"data_state_plan": plan},
            artifacts={"routing_manifest": routing_manifest},
            metrics={
                "routes": len(routing_manifest.get("routes", [])) if isinstance(routing_manifest, dict) else 0,
                "allowed_libraries": len(plan.allowed_libraries),
            },
        )


__all__ = ["DataStateModelerStage"]
