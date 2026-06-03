"""Logging utilities for the single-view pipeline."""

from __future__ import annotations

from typing import Optional

from multi_agent_new.logging_config import get_logger as _shared_get_logger



def get_logger(name: Optional[str] = None):
    """Return a logger configured by the shared multi-agent logging utility."""
    return _shared_get_logger(name if name else "multi-agent-view")


__all__ = ["get_logger"]
