"""Pipeline orchestrator coordinating the single-view stages."""

from __future__ import annotations

import time
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, List, Optional

from agent_pipeline.pipeline.context import PipelinePaths, PipelineState
from agent_pipeline.pipeline.knowledge_base import KnowledgeBase
from agent_pipeline.pipeline.metrics import PipelineMetrics
from agent_pipeline.pipeline.scheduler import PipelineScheduler
from agent_pipeline.pipeline.stage import PipelineStage, StageResult
from agent_pipeline.snippets import load_snippet_library

from ..config import PipelineConfig, build_default_config, load_config
from ..logging_config import get_logger
from .stages import (
    BugFixStage,
    FirstGenerationStage,
    ProjectScaffolderStage,
    RenderFixStage,
    RequirementArchitectStage,
)

logger = get_logger(__name__)


@dataclass
class PipelineRunResult:
    """Outcome of a single orchestrated pipeline run."""

    success: bool
    stage_results: List[StageResult]
    metrics: PipelineMetrics
    output_dir: Path
    state: PipelineState

    def as_dict(self):
        return {
            "success": self.success,
            "output_dir": str(self.output_dir),
            "metrics": self.metrics.as_dict(),
            "stages": [result.as_dict() for result in self.stage_results],
        }


class PipelineOrchestrator:
    """Coordinate stages, enforce budgets, and aggregate telemetry."""

    def __init__(self, config: Optional[PipelineConfig] = None) -> None:
        self.config = config or build_default_config()
        self.logger = logger
        self.knowledge_base = KnowledgeBase(self.config.knowledge_base_root)
        self.scheduler = PipelineScheduler(logger=self.logger)

    def build_stages(self) -> Iterable[PipelineStage]:
        return [
            RequirementArchitectStage(),
            ProjectScaffolderStage(),
            FirstGenerationStage(),
            BugFixStage(),
            RenderFixStage(),
        ]

    def initialize_state(self, output_dir: Path, seed_input: str, extras: Optional[dict] = None) -> PipelineState:
        paths = PipelinePaths.from_output_dir(output_dir)
        snippets = load_snippet_library(self.config.snippet_root)
        state = PipelineState(paths=paths, prompt=seed_input, extras=extras or {}, snippets=snippets)
        if snippets:
            self.logger.info("Loaded %d reusable snippets", len(snippets))
        return state

    def run(
        self,
        prompt: str,
        output_dir: str,
        config_path: Optional[str] = None,
        extras: Optional[dict] = None,
    ) -> PipelineRunResult:
        if config_path:
            self.config = load_config(config_path)

        output_path = Path(output_dir).resolve()
        state = self.initialize_state(output_path, seed_input=prompt.strip(), extras=extras)

        stages = list(self.build_stages())
        start_time = time.monotonic()
        stage_results = self.scheduler.run(
            stages=stages,
            state=state,
            config=self.config,
            knowledge_base=self.knowledge_base,
        )
        total_duration = time.monotonic() - start_time

        final_state = stage_results[-1].state if stage_results else state
        metrics = PipelineMetrics()
        metrics.total_duration_seconds = total_duration
        metrics.success = all(result.success for result in stage_results)

        for result in stage_results:
            custom_metrics = {k: v for k, v in result.metrics.items() if k != "duration_seconds"}
            metrics.record_stage(
                name=result.name,
                duration=result.duration_seconds,
                attempts=result.attempts,
                custom=custom_metrics,
            )

        success = bool(stage_results) and stage_results[-1].success

        return PipelineRunResult(
            success=success,
            stage_results=stage_results,
            metrics=metrics,
            output_dir=output_path,
            state=final_state,
        )


__all__ = ["PipelineOrchestrator", "PipelineRunResult"]
