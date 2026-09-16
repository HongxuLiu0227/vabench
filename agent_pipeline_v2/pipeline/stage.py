"""Base stage definitions used by the pipeline."""

from __future__ import annotations

import time
import traceback
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Sequence

from ..config import PipelineConfig
from .context import PipelineState
from .gating import BaseGate, GateDecision, TimeoutGate
from .utils import append_jsonl, safe_call, to_serializable, write_json


@dataclass
class StageOutput:
    """Artifacts returned by a successful stage execution."""

    state_updates: Dict[str, Any] = field(default_factory=dict)
    artifacts: Dict[str, Any] = field(default_factory=dict)
    diagnostics: List[str] = field(default_factory=list)
    metrics: Dict[str, Any] = field(default_factory=dict)
    quality: Dict[str, Any] = field(default_factory=dict)
    success: bool = True


@dataclass
class StageResult:
    """Aggregated result of running a stage (with retries and gating)."""

    name: str
    success: bool
    attempts: int
    duration_seconds: float
    issues: List[str]
    artifacts: Dict[str, Any]
    metrics: Dict[str, Any]
    gate_decisions: List[GateDecision]
    state: PipelineState

    def as_dict(self) -> Dict[str, Any]:
        """Return a dict representation suitable for logging or telemetry."""
        return {
            "name": self.name,
            "success": self.success,
            "attempts": self.attempts,
            "duration_seconds": self.duration_seconds,
            "issues": self.issues,
            "issue_count": len(self.issues),
            "metrics": self.metrics,
            "artifact_keys": list(self.artifacts.keys()),
            "gate_decisions": [decision.as_dict() for decision in self.gate_decisions],
        }


class PipelineStage:
    """Base class for all pipeline stages."""

    def __init__(
        self,
        name: str,
        description: str,
        consumes: Optional[Sequence[str]] = None,
        produces: Optional[Sequence[str]] = None,
        gates: Optional[Iterable[BaseGate]] = None,
    ) -> None:
        self.name = name
        self.description = description
        self.consumes = list(consumes) if consumes else []
        self.produces = list(produces) if produces else []
        self.gates = list(gates) if gates else []

    def execute(
        self,
        state: PipelineState,
        config: PipelineConfig,
        knowledge_base: "KnowledgeBase",
    ) -> StageOutput:
        """
        Execute the stage and return its output.

        Subclasses must implement this method and ensure the returned `StageOutput` is
        populated with meaningful metrics and quality scores where applicable.
        """
        raise NotImplementedError

    def on_success(self, state: PipelineState, output: StageOutput) -> PipelineState:
        """Apply updates to the pipeline state after a successful run."""
        if not output.state_updates:
            return state
        return state.update(**output.state_updates)

    def _timestamp(self) -> str:
        return datetime.now(timezone.utc).isoformat()

    def _state_snapshot(self, state: PipelineState) -> Dict[str, Any]:
        consume_presence = {
            item: (hasattr(state, item) and getattr(state, item) is not None)
            for item in self.consumes
        }
        produce_presence = {
            item: (hasattr(state, item) and getattr(state, item) is not None)
            for item in self.produces
        }
        return {
            "output_dir": str(state.paths.output_dir),
            "prompt_length": len(state.prompt or ""),
            "extras_keys": sorted(state.extras.keys()),
            "telemetry_keys": sorted(state.telemetry.keys()),
            "consume_presence": consume_presence,
            "produce_presence": produce_presence,
        }

    def _artifact_manifest(self, artifacts: Dict[str, Any]) -> Dict[str, Any]:
        manifest: Dict[str, Any] = {}
        for key, value in artifacts.items():
            entry: Dict[str, Any] = {"type": type(value).__name__}
            if isinstance(value, str):
                entry["chars"] = len(value)
                potential_path = Path(value)
                if len(value) <= 500 and "\n" not in value and (
                    potential_path.is_absolute() or "/" in value or "\\" in value
                ):
                    entry["value"] = value
            elif isinstance(value, (list, tuple, set)):
                entry["size"] = len(value)
            elif isinstance(value, dict):
                entry["size"] = len(value)
                entry["keys"] = list(value.keys())[:20]
            manifest[key] = entry
        return manifest

    def _append_event(self, state: PipelineState, payload: Dict[str, Any]) -> None:
        append_jsonl(state.paths.logs_dir / "pipeline_events.jsonl", payload)

    def _write_trace(self, state: PipelineState, payload: Dict[str, Any]) -> None:
        write_json(state.paths.logs_dir / f"{self.name}_trace.json", payload)

    def run(
        self,
        state: PipelineState,
        config: PipelineConfig,
        knowledge_base: "KnowledgeBase",
        logger,
    ) -> StageResult:
        """Execute the stage with retries, gating, and timing."""
        settings = config.stage(self.name)
        attempts = 0
        issues: List[str] = []
        gate_decisions: List[GateDecision] = []
        result_output: Optional[StageOutput] = None
        start_time = time.monotonic()
        attempt_traces: List[Dict[str, Any]] = []

        self._append_event(
            state,
            {
                "timestamp": self._timestamp(),
                "event": "stage_started",
                "stage": self.name,
                "description": self.description,
                "consumes": self.consumes,
                "produces": self.produces,
                "settings": {
                    "timeout_seconds": settings.timeout_seconds,
                    "max_retries": settings.max_retries,
                    "optional": settings.optional,
                    "allow_parallel": settings.allow_parallel,
                },
                "state_before": self._state_snapshot(state),
            },
        )

        while attempts < max(settings.max_retries, 1):
            attempts += 1
            logger.info("Running stage '%s' (attempt %s)", self.name, attempts)
            attempt_started = time.monotonic()
            attempt_trace: Dict[str, Any] = {
                "attempt": attempts,
                "started_at": self._timestamp(),
                "state_before": self._state_snapshot(state),
            }
            output, error = safe_call(self.execute, state, config, knowledge_base)
            if error:
                message = f"Stage '{self.name}' failed with error: {error}"
                logger.error(message)
                issues.append(message)
                attempt_trace.update(
                    {
                        "duration_seconds": time.monotonic() - attempt_started,
                        "error": str(error),
                        "traceback": "".join(traceback.format_exception(type(error), error, error.__traceback__)),
                    }
                )
                attempt_traces.append(attempt_trace)
                self._append_event(
                    state,
                    {
                        "timestamp": self._timestamp(),
                        "event": "stage_attempt_error",
                        "stage": self.name,
                        "attempt": attempts,
                        "error": str(error),
                    },
                )
                continue

            result_output = output
            gate_decisions = self._run_gates(
                output=output,
                state=state,
                config=config,
                timeout=settings.timeout_seconds,
                duration=time.monotonic() - start_time,
            )
            attempt_trace.update(
                {
                    "duration_seconds": time.monotonic() - attempt_started,
                    "output_success": output.success,
                    "diagnostics": output.diagnostics,
                    "metrics": to_serializable(output.metrics),
                    "quality": to_serializable(output.quality),
                    "state_update_keys": sorted(output.state_updates.keys()),
                    "artifact_manifest": self._artifact_manifest(output.artifacts),
                    "gate_decisions": [decision.as_dict() for decision in gate_decisions],
                }
            )
            attempt_traces.append(attempt_trace)

            if output.success and all(decision.passed for decision in gate_decisions):
                state = self.on_success(state, output)
                duration = time.monotonic() - start_time
                logger.info(
                    "Stage '%s' succeeded in %.2fs with %d gate checks",
                    self.name,
                    duration,
                    len(gate_decisions),
                )
                result = StageResult(
                    name=self.name,
                    success=True,
                    attempts=attempts,
                    duration_seconds=duration,
                    issues=issues,
                    artifacts=output.artifacts,
                    metrics={**output.metrics, "duration_seconds": duration},
                    gate_decisions=gate_decisions,
                    state=state,
                )
                self._write_trace(
                    state,
                    {
                        "stage": self.name,
                        "description": self.description,
                        "success": True,
                        "attempts": attempts,
                        "duration_seconds": duration,
                        "consumes": self.consumes,
                        "produces": self.produces,
                        "settings": {
                            "timeout_seconds": settings.timeout_seconds,
                            "max_retries": settings.max_retries,
                            "optional": settings.optional,
                            "allow_parallel": settings.allow_parallel,
                        },
                        "issues": issues,
                        "metrics": to_serializable(result.metrics),
                        "gate_decisions": [decision.as_dict() for decision in gate_decisions],
                        "artifact_manifest": self._artifact_manifest(output.artifacts),
                        "attempt_traces": attempt_traces,
                        "state_after": self._state_snapshot(state),
                    },
                )
                self._append_event(
                    state,
                    {
                        "timestamp": self._timestamp(),
                        "event": "stage_completed",
                        "stage": self.name,
                        "success": True,
                        "attempts": attempts,
                        "duration_seconds": duration,
                    },
                )
                return result

            if not output.success:
                output_issues = output.diagnostics or [f"Stage '{self.name}' returned success=False."]
                issues.extend(output_issues)
                logger.warning(
                    "Stage '%s' reported failure: %s",
                    self.name,
                    "; ".join(output_issues),
                )

            failed_reasons = [decision.reason for decision in gate_decisions if not decision.passed]
            issues.extend(failed_reasons)
            if failed_reasons:
                logger.warning(
                    "Stage '%s' failed gate validation: %s",
                    self.name,
                    "; ".join(failed_reasons),
                )

        duration = time.monotonic() - start_time
        artifacts = result_output.artifacts if result_output else {}
        metrics = result_output.metrics if result_output else {}
        metrics = {**metrics, "duration_seconds": duration}
        if result_output and result_output.state_updates:
            state = self.on_success(state, result_output)

        result = StageResult(
            name=self.name,
            success=False,
            attempts=attempts,
            duration_seconds=duration,
            issues=issues,
            artifacts=artifacts,
            metrics=metrics,
            gate_decisions=gate_decisions,
            state=state,
        )
        self._write_trace(
            state,
            {
                "stage": self.name,
                "description": self.description,
                "success": False,
                "attempts": attempts,
                "duration_seconds": duration,
                "consumes": self.consumes,
                "produces": self.produces,
                "settings": {
                    "timeout_seconds": settings.timeout_seconds,
                    "max_retries": settings.max_retries,
                    "optional": settings.optional,
                    "allow_parallel": settings.allow_parallel,
                },
                "issues": issues,
                "metrics": to_serializable(metrics),
                "gate_decisions": [decision.as_dict() for decision in gate_decisions],
                "artifact_manifest": self._artifact_manifest(artifacts),
                "attempt_traces": attempt_traces,
                "state_after": self._state_snapshot(state),
            },
        )
        self._append_event(
            state,
            {
                "timestamp": self._timestamp(),
                "event": "stage_completed",
                "stage": self.name,
                "success": False,
                "attempts": attempts,
                "duration_seconds": duration,
                "issues": issues,
            },
        )
        return result

    def _run_gates(
        self,
        output: StageOutput,
        state: PipelineState,
        config: PipelineConfig,
        timeout: int,
        duration: float,
    ) -> List[GateDecision]:
        """Evaluate the automatic timeout gate followed by any attached gates."""
        gates = [TimeoutGate(timeout), *self.gates]

        decisions: List[GateDecision] = []
        for gate in gates:
            decision = gate.evaluate(stage=self, output=output, state=state, config=config, duration=duration)
            decisions.append(decision)
        return decisions


__all__ = ["PipelineStage", "StageOutput", "StageResult"]
