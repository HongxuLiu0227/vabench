"""Stage ④: per-view LLM generation with a constrained mini-agent loop."""

from .driver import LLMDriver, OpenAICompatDriver
from .loop import generate_view

__all__ = ["LLMDriver", "OpenAICompatDriver", "generate_view"]
