"""Simple scheduler that executes pipeline stages sequentially."""

from __future__ import annotations

from typing import Iterable, List

from ..config import PipelineConfig
from .context import PipelineState
from .knowledge_base import KnowledgeBase
from .stage import PipelineStage, StageResult


class PipelineScheduler:
    """Executes pipeline stages in order with optional future parallelism hooks."""

    def __init__(self, logger) -> None:
        self.logger = logger

    def run(
        self,
        stages: Iterable[PipelineStage],
        state: PipelineState,
        config: PipelineConfig,
        knowledge_base: KnowledgeBase,
    ) -> List[StageResult]:
        stage_list = list(stages)
        results: List[StageResult] = []
        current_state = state

        for index, stage in enumerate(stage_list):
            result = stage.run(
                state=current_state,
                config=config,
                knowledge_base=knowledge_base,
                logger=self.logger,
            )
            results.append(result)
            current_state = result.state
            current_state.record_metric(result.name, result.metrics)

            if not result.success and config.flags.fail_fast:
                remaining_stage_names = [item.name for item in stage_list[index + 1 :]]
                continue_for_final_qa = (
                    stage.name in {"bug_fix", "render_fix"}
                    and remaining_stage_names
                    and set(remaining_stage_names).issubset({"render_fix", "quality_assurance"})
                )
                if continue_for_final_qa:
                    self.logger.warning(
                        "Continuing after failed stage '%s' to collect final validation from remaining stages: %s",
                        stage.name,
                        ", ".join(remaining_stage_names),
                    )
                    continue
                self.logger.error("Fail-fast enabled; halting after stage '%s'", stage.name)
                break

        return results
__all__ = ["PipelineScheduler"]
