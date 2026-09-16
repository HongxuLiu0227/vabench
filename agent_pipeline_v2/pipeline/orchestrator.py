"""Pipeline orchestrator coordinating all stages."""

from __future__ import annotations

import shutil
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, List, Optional

from ..config import PipelineConfig, build_default_config, load_config
from ..logging_config import get_logger
from .context import PipelinePaths, PipelineState
from .knowledge_base import KnowledgeBase
from .metrics import PipelineMetrics
from .scheduler import PipelineScheduler
from .stage import PipelineStage, StageResult
from ..snippets import load_snippet_library
from .utils import append_jsonl, to_serializable, write_json
from .stages import (
    RequirementArchitectStage,
    ProjectScaffolderStage,
    FirstGenerationStage,
    TableauSourceComplianceStage,
    PlaceholderFixStage,
    BugFixStage,
    RenderFixStage,
    QualityAssuranceStage,
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
        validation = {}
        bug_fix_validation = self.state.extras.get("bug_fix_validation")
        if isinstance(bug_fix_validation, dict):
            validation["bug_fix"] = bug_fix_validation
        render_fix_validation = self.state.extras.get("render_fix_validation")
        if isinstance(render_fix_validation, dict):
            validation["render_fix"] = render_fix_validation
        tableau_source_validation = self.state.extras.get("tableau_source_validation")
        if isinstance(tableau_source_validation, dict):
            validation["tableau_source"] = tableau_source_validation

        summary = {
            "success": self.success,
            "output_dir": str(self.output_dir),
            "metrics": self.metrics.as_dict(),
            "stages": [result.as_dict() for result in self.stage_results],
        }
        if validation:
            summary["validation"] = validation
        if self.state.qa_report is not None:
            summary["qa_report"] = to_serializable(self.state.qa_report)
            summary["failure_categories"] = list(self.state.qa_report.failure_categories)
        return summary


class PipelineOrchestrator:
    """Coordinate stages, enforce budgets, and aggregate telemetry."""

    def __init__(self, config: Optional[PipelineConfig] = None) -> None:
        self.config = config or build_default_config()
        self.logger = logger
        self.knowledge_base = KnowledgeBase(self.config.knowledge_base_root)
        self.scheduler = PipelineScheduler(logger=self.logger)

    def build_stages(self) -> Iterable[PipelineStage]:
        """Instantiate the ordered pipeline stages."""
        return [
            RequirementArchitectStage(),
            ProjectScaffolderStage(),
            FirstGenerationStage(),
            TableauSourceComplianceStage(),
            PlaceholderFixStage(),
            BugFixStage(),
            RenderFixStage(),
            QualityAssuranceStage(),
        ]

    def initialize_state(self, output_dir: Path, seed_input: str, extras: Optional[dict] = None) -> PipelineState:
        """Create the initial pipeline state."""
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
        force: bool = False,
    ) -> PipelineRunResult:
        """Execute the pipeline for a given prompt."""
        if config_path:
            self.config = load_config(config_path)

        output_path = Path(output_dir).resolve()
        if force and output_path.exists():
            if output_path == output_path.parent:
                raise ValueError(f"Refusing to force-delete unsafe output path: {output_path}")
            self.logger.warning("Force enabled; removing existing output directory %s", output_path)
            if output_path.is_dir():
                shutil.rmtree(output_path)
            else:
                output_path.unlink()
        state = self.initialize_state(output_path, seed_input=prompt.strip(), extras=extras)

        stages = list(self.build_stages())
        run_context = {
            "output_dir": str(output_path),
            "prompt_length": len(prompt.strip()),
            "mode": state.extras.get("mode", "default"),
            "force": force,
            "extras_keys": sorted(state.extras.keys()),
            "stage_order": [stage.name for stage in stages],
            "snippet_count": len(state.snippets),
        }
        write_json(state.paths.logs_dir / "pipeline_run_context.json", run_context)
        append_jsonl(
            state.paths.logs_dir / "pipeline_events.jsonl",
            {
                "event": "pipeline_started",
                "output_dir": str(output_path),
                "stage_order": [stage.name for stage in stages],
                "mode": state.extras.get("mode", "default"),
                "force": force,
            },
        )
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

        run_result = PipelineRunResult(
            success=success,
            stage_results=stage_results,
            metrics=metrics,
            output_dir=output_path,
            state=final_state,
        )
        write_json(final_state.paths.logs_dir / "pipeline_run_summary.json", run_result.as_dict())
        append_jsonl(
            final_state.paths.logs_dir / "pipeline_events.jsonl",
            {
                "event": "pipeline_completed",
                "output_dir": str(output_path),
                "success": success,
                "total_duration_seconds": total_duration,
                "stages": [result.as_dict() for result in stage_results],
            },
        )
        return run_result


__all__ = ["PipelineOrchestrator", "PipelineRunResult"]
