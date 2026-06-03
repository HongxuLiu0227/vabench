"""Single-view pipeline variant built on top of the multi-agent architecture."""

from .config import build_default_config, load_config
from .pipeline import PipelineOrchestrator, PipelineRunResult

__all__ = ["PipelineOrchestrator", "PipelineRunResult", "build_default_config", "load_config"]
