"""Packaging stage."""

from __future__ import annotations

from datetime import datetime

from ...config import PipelineConfig
from ..context import PackagingArtifact, PipelineState
from ..knowledge_base import KnowledgeBase
from ..stage import PipelineStage, StageOutput
from ..utils import ensure_directory, write_json


class PackagingStage(PipelineStage):
    """Bundle artifacts, telemetry, and metadata for downstream consumers."""

    def __init__(self) -> None:
        super().__init__(
            name="packaging",
            description="Package the project and generate metadata cards.",
            consumes=["qa_report"],
            produces=["packaging"],
        )

    def execute(
        self,
        state: PipelineState,
        config: PipelineConfig,
        knowledge_base: KnowledgeBase,
    ) -> StageOutput:
        if state.qa_report is None or state.workspace is None:
            raise ValueError("Packaging stage requires QA report and workspace.")

        bundle_dir = state.paths.output_dir / "dataset_bundle"
        ensure_directory(bundle_dir)

        enriched_prompt = state.product_spec.enriched_prompt if state.product_spec else ""
        pages = (
            state.experience_plan.component_manifest.get("pages", [])
            if state.experience_plan and isinstance(state.experience_plan.component_manifest, dict)
            else []
        )
        components = (
            state.experience_plan.component_manifest.get("components", [])
            if state.experience_plan and isinstance(state.experience_plan.component_manifest, dict)
            else []
        )

        metadata_card = {
            "generated_at": datetime.utcnow().isoformat() + "Z",
            "raw_prompt": state.product_spec.raw_prompt if state.product_spec else "",
            "enriched_prompt": enriched_prompt,
            "page_count": len(pages),
            "component_count": len(components),
            "allowed_libraries": state.data_state_plan.allowed_libraries if state.data_state_plan else [],
            "qa_passed": state.qa_report.passed,
            "placeholder_ratio": state.qa_report.placeholder_ratio,
        }

        telemetry = {
            "stages": state.telemetry.get("metrics", {}),
            "seed_summary": state.extras.get("seed_summary", {}),
            "qa_findings": state.qa_report.findings,
            "validation_metrics": state.qa_report.metrics,
        }

        metadata_path = bundle_dir / "metadata-card.json"
        write_json(metadata_path, metadata_card)
        telemetry_path = bundle_dir / "telemetry.json"
        write_json(telemetry_path, telemetry)

        packaging = PackagingArtifact(
            bundle_path=bundle_dir,
            metadata_card=metadata_card,
            telemetry=telemetry,
        )

        return StageOutput(
            state_updates={"packaging": packaging},
            artifacts={
                "metadata_card": metadata_card,
                "telemetry": telemetry,
            },
            metrics={"bundle_files": 2},
            quality={"placeholder_ratio": state.qa_report.placeholder_ratio},
        )


__all__ = ["PackagingStage"]
