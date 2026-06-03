"""Runtime configuration objects for the next-generation multi-agent pipeline."""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, Optional


@dataclass(frozen=True)
class StageSettings:
    """Configuration applied to a single pipeline stage."""

    timeout_seconds: int = 600
    max_retries: int = 1
    optional: bool = False
    allow_parallel: bool = True


@dataclass(frozen=True)
class ComplexityThresholds:
    """Minimum complexity and quality expectations for generated projects."""

    min_pages: int = 5
    min_feature_components: int = 12
    min_data_models: int = 3
    min_test_suites: int = 4
    min_complexity_score: float = 0.75
    max_placeholder_ratio: float = 0.0


@dataclass(frozen=True)
class RuntimeFlags:
    """Miscellaneous runtime toggles."""

    telemetry_enabled: bool = True
    cache_enabled: bool = True
    fail_fast: bool = True
    visual_checks_enabled: bool = False


@dataclass(frozen=True)
class PipelineConfig:
    """Top-level configuration for the orchestrator."""

    stage_settings: Dict[str, StageSettings] = field(default_factory=dict)
    complexity: ComplexityThresholds = field(default_factory=ComplexityThresholds)
    flags: RuntimeFlags = field(default_factory=RuntimeFlags)
    output_root: Path = field(default_factory=lambda: Path("generated-react-app"))
    knowledge_base_root: Path = field(
        default_factory=lambda: Path(__file__).resolve().parent / "resources"
    )
    max_total_runtime_seconds: int = 3600
    snippet_root: Path = field(default_factory=lambda: Path("snippets"))

    def stage(self, name: str) -> StageSettings:
        """Return settings for the provided stage name, falling back to defaults."""
        return self.stage_settings.get(name, StageSettings())


def build_default_config() -> PipelineConfig:
    """Return a default configuration tuned for complex React dashboards."""
    stage_defaults: Dict[str, StageSettings] = {
        "requirement_enrichment": StageSettings(timeout_seconds=900, max_retries=1),
        "project_scaffolder": StageSettings(timeout_seconds=900, max_retries=1),
        "first_generation": StageSettings(timeout_seconds=3600, max_retries=2),
        "placeholder_fix": StageSettings(timeout_seconds=1800, max_retries=1),
        "bug_fix": StageSettings(timeout_seconds=1800, max_retries=1),
        "render_fix": StageSettings(timeout_seconds=1800, max_retries=1),
    }

    complexity = ComplexityThresholds(
        min_pages=6,
        min_feature_components=15,
        min_data_models=4,
        min_test_suites=5,
        min_complexity_score=0.8,
        max_placeholder_ratio=0.0,
    )

    flags = RuntimeFlags(
        telemetry_enabled=True,
        cache_enabled=True,
        fail_fast=True,
        visual_checks_enabled=True,
    )

    return PipelineConfig(stage_settings=stage_defaults, complexity=complexity, flags=flags)


def load_config(config_path: Optional[str] = None) -> PipelineConfig:
    """
    Load configuration from disk if provided, otherwise fall back to defaults.

    This keeps the API ergonomic for early prototyping while allowing future YAML/TOML
    overrides without changing orchestrator code.
    """
    if config_path is None:
        return build_default_config()

    path = Path(config_path)
    if not path.exists():
        raise FileNotFoundError(f"Config file not found: {config_path}")

    # TODO: support parsing user-provided configs (YAML/TOML/JSON) when needed.
    raise NotImplementedError("External configuration files are not yet supported.")


__all__ = [
    "StageSettings",
    "ComplexityThresholds",
    "RuntimeFlags",
    "PipelineConfig",
    "build_default_config",
    "load_config",
]
