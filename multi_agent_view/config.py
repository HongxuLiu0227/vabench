"""Runtime configuration for the single-view pipeline."""

from __future__ import annotations

from pathlib import Path
from typing import Dict, Optional

from agent_pipeline.config import (
    ComplexityThresholds,
    PipelineConfig,
    RuntimeFlags,
    StageSettings,
)



def build_default_config() -> PipelineConfig:
    """Return defaults tuned for single-view generation experiments."""
    stage_defaults: Dict[str, StageSettings] = {
        "requirement_enrichment": StageSettings(timeout_seconds=300, max_retries=1),
        "project_scaffolder": StageSettings(timeout_seconds=420, max_retries=1),
        "first_generation": StageSettings(timeout_seconds=3600, max_retries=1),
        "bug_fix": StageSettings(timeout_seconds=1800, max_retries=1),
        "render_fix": StageSettings(timeout_seconds=1200, max_retries=1),
    }

    complexity = ComplexityThresholds(
        min_pages=1,
        min_feature_components=6,
        min_data_models=1,
        min_test_suites=1,
        min_complexity_score=0.65,
        max_placeholder_ratio=0.0,
    )

    flags = RuntimeFlags(
        telemetry_enabled=True,
        cache_enabled=True,
        fail_fast=True,
        visual_checks_enabled=True,
    )

    return PipelineConfig(
        stage_settings=stage_defaults,
        complexity=complexity,
        flags=flags,
        output_root=Path("generated-react-app/single-view"),
        snippet_root=Path("snippets"),
    )



def load_config(config_path: Optional[str] = None) -> PipelineConfig:
    """Keep parity with existing API while deferring file-based configs for now."""
    if config_path is None:
        return build_default_config()
    raise NotImplementedError("External configuration files are not yet supported for multi_agent_view.")


__all__ = [
    "StageSettings",
    "ComplexityThresholds",
    "RuntimeFlags",
    "PipelineConfig",
    "build_default_config",
    "load_config",
]
