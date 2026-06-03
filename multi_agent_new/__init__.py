"""Compatibility wrapper exposing the `multi-agent-new` package under a Python-friendly name."""

from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

_INTERNAL_NAME = "multi_agent_new_internal"
_ALIAS_NAME = __name__
_ROOT = Path(__file__).resolve().parent.parent / "multi-agent-new"

if not _ROOT.exists():  # pragma: no cover - defensive
    raise ImportError("Expected 'multi-agent-new' directory to exist alongside this module.")

spec = importlib.util.spec_from_file_location(
    _INTERNAL_NAME,
    _ROOT / "__init__.py",
    submodule_search_locations=[str(_ROOT)],
)
if spec is None or spec.loader is None:  # pragma: no cover - defensive
    raise ImportError("Failed to create module spec for multi-agent-new package.")

module = importlib.util.module_from_spec(spec)
sys.modules[_INTERNAL_NAME] = module
spec.loader.exec_module(module)

globals().update(module.__dict__)

for name, submodule in list(sys.modules.items()):
    if name.startswith(f"{_INTERNAL_NAME}."):
        alias = name.replace(_INTERNAL_NAME, _ALIAS_NAME, 1)
        sys.modules[alias] = submodule

__all__ = getattr(module, "__all__", [])
