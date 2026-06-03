"""Telemetry and metrics helpers for the pipeline."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Dict, List


@dataclass
class StageMetrics:
    """Per-stage metrics tracked across the pipeline."""

    duration_seconds: float
    attempts: int
    custom: Dict[str, Any] = field(default_factory=dict)

    def as_dict(self) -> Dict[str, Any]:
        return {
            "duration_seconds": self.duration_seconds,
            "attempts": self.attempts,
            "custom": self.custom,
        }


@dataclass
class PipelineMetrics:
    """Aggregate metrics for a pipeline run."""

    stages: Dict[str, StageMetrics] = field(default_factory=dict)
    total_duration_seconds: float = 0.0
    success: bool = False

    def record_stage(self, name: str, duration: float, attempts: int, custom: Dict[str, Any]) -> None:
        self.stages[name] = StageMetrics(
            duration_seconds=duration,
            attempts=attempts,
            custom=custom,
        )

    def as_dict(self) -> Dict[str, Any]:
        return {
            "success": self.success,
            "total_duration_seconds": self.total_duration_seconds,
            "stages": {name: metrics.as_dict() for name, metrics in self.stages.items()},
        }


__all__ = ["StageMetrics", "PipelineMetrics"]

