"""Quality gates applied to stage outputs."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Dict, Iterable, Optional

from ..config import PipelineConfig


@dataclass
class GateDecision:
    """Result of evaluating a quality gate."""

    gate: str
    passed: bool
    reason: str = ""
    details: Dict[str, Any] = field(default_factory=dict)

    def as_dict(self) -> Dict[str, Any]:
        return {
            "gate": self.gate,
            "passed": self.passed,
            "reason": self.reason,
            "details": self.details,
        }


class BaseGate:
    """Base class for gate checks."""

    name: str = "base_gate"

    def evaluate(
        self,
        stage,
        output,
        state,
        config: PipelineConfig,
        duration: float,
    ) -> GateDecision:  # pragma: no cover - to be implemented by subclasses
        raise NotImplementedError


class TimeoutGate(BaseGate):
    """Fail if a stage exceeds its configured timeout."""

    name = "timeout_gate"

    def __init__(self, timeout_seconds: int) -> None:
        self.timeout_seconds = timeout_seconds

    def evaluate(self, stage, output, state, config: PipelineConfig, duration: float) -> GateDecision:
        if self.timeout_seconds <= 0:
            return GateDecision(gate=self.name, passed=True)

        if duration > self.timeout_seconds:
            return GateDecision(
                gate=self.name,
                passed=False,
                reason=f"Stage exceeded timeout ({duration:.2f}s > {self.timeout_seconds}s)",
                details={"duration": duration, "timeout_seconds": self.timeout_seconds},
            )
        return GateDecision(
            gate=self.name,
            passed=True,
            details={"duration": duration, "timeout_seconds": self.timeout_seconds},
        )


class ComplexityGate(BaseGate):
    """Validate that a stage meets configured complexity targets."""

    name = "complexity_gate"

    def __init__(self, metric_key: str = "complexity_score") -> None:
        self.metric_key = metric_key

    def evaluate(self, stage, output, state, config: PipelineConfig, duration: float) -> GateDecision:
        value = output.quality.get(self.metric_key)
        if value is None:
            return GateDecision(
                gate=self.name,
                passed=False,
                reason=f"Stage '{stage.name}' missing '{self.metric_key}' metric.",
            )

        target = config.complexity.min_complexity_score
        if value < target:
            return GateDecision(
                gate=self.name,
                passed=False,
                reason=f"Complexity score {value:.2f} below threshold {target:.2f}",
                details={"score": value, "threshold": target},
            )

        return GateDecision(
            gate=self.name,
            passed=True,
            details={"score": value, "threshold": target},
        )


class PlaceholderGate(BaseGate):
    """Ensure no TODO/placeholder tokens slip through."""

    name = "placeholder_gate"

    def __init__(self, placeholder_tokens: Optional[Iterable[str]] = None) -> None:
        self.placeholder_tokens = set(placeholder_tokens or ["TODO", "TBD", "CHANGEME"])

    def evaluate(self, stage, output, state, config: PipelineConfig, duration: float) -> GateDecision:
        ratio = output.quality.get("placeholder_ratio")
        if ratio is not None:
            if ratio > config.complexity.max_placeholder_ratio:
                return GateDecision(
                    gate=self.name,
                    passed=False,
                    reason=f"Placeholder ratio {ratio:.2f} exceeds allowed maximum.",
                    details={"ratio": ratio, "allowed": config.complexity.max_placeholder_ratio},
                )
            return GateDecision(
                gate=self.name,
                passed=True,
                details={"ratio": ratio, "allowed": config.complexity.max_placeholder_ratio},
            )

        # Fallback: scan string artifacts.
        offending_files = []
        for path, content in output.artifacts.items():
            if not isinstance(content, str):
                continue
            if any(token in content for token in self.placeholder_tokens):
                offending_files.append(path)

        if offending_files:
            return GateDecision(
                gate=self.name,
                passed=False,
                reason="Placeholder tokens found in artifacts.",
                details={"files": offending_files},
            )

        return GateDecision(gate=self.name, passed=True)


class CoverageGate(BaseGate):
    """Check that minimum coverage metrics are met."""

    name = "coverage_gate"

    def __init__(self, metric_key: str = "coverage") -> None:
        self.metric_key = metric_key

    def evaluate(self, stage, output, state, config: PipelineConfig, duration: float) -> GateDecision:
        coverage = output.metrics.get(self.metric_key)
        if coverage is None:
            return GateDecision(
                gate=self.name,
                passed=False,
                reason=f"Coverage metric '{self.metric_key}' missing.",
            )

        if isinstance(coverage, dict) and "lines" in coverage:
            coverage_value = coverage["lines"]
        else:
            coverage_value = coverage

        threshold = 0.55  # configurable in future
        if coverage_value < threshold:
            return GateDecision(
                gate=self.name,
                passed=False,
                reason=f"Coverage {coverage_value:.2f} below threshold {threshold:.2f}",
                details={"coverage": coverage_value, "threshold": threshold},
            )

        return GateDecision(
            gate=self.name,
            passed=True,
            details={"coverage": coverage_value, "threshold": threshold},
        )


__all__ = [
    "BaseGate",
    "GateDecision",
    "TimeoutGate",
    "ComplexityGate",
    "PlaceholderGate",
    "CoverageGate",
]

