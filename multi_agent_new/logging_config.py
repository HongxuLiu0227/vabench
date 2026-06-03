"""Logging utilities for the new multi-agent pipeline."""

from __future__ import annotations

import logging
import os
import sys
from pathlib import Path
from typing import Optional


def _configure_file_handler(logger: logging.Logger, formatter: logging.Formatter) -> None:
    log_file = os.getenv("LOG_FILE")
    if not log_file:
        return

    path = Path(log_file).expanduser()
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        file_handler = logging.FileHandler(path, encoding="utf-8")
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
    except Exception:  # pragma: no cover - best effort fallback
        logger.warning("Unable to set up file logging for %s", path)


def get_logger(name: Optional[str] = None) -> logging.Logger:
    """Return a logger with a consistent formatter across the pipeline."""
    logger = logging.getLogger(name if name else "multi_agent_new")
    if logger.handlers:
        return logger

    formatter = logging.Formatter(
        fmt="%(asctime)s | %(levelname)8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    stream_handler = logging.StreamHandler(stream=sys.stdout)
    stream_handler.setFormatter(formatter)
    logger.addHandler(stream_handler)

    _configure_file_handler(logger, formatter)

    logger.setLevel(logging.INFO)
    logger.propagate = False
    return logger


__all__ = ["get_logger"]
