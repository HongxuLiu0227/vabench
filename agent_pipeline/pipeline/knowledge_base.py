"""Lightweight knowledge base to seed agents with curated patterns."""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Optional

from ..logging_config import get_logger

logger = get_logger(__name__)


@dataclass
class KnowledgeBase:
    """Expose curated Ant Design snippets and sample specs."""

    root: Path
    _ant_patterns_cache: Optional[str] = field(default=None, init=False)
    _sample_specs_cache: Optional[Dict[str, Dict]] = field(default=None, init=False)

    def ant_patterns(self) -> str:
        """Return markdown containing curated Ant Design patterns."""
        if self._ant_patterns_cache is not None:
            return self._ant_patterns_cache

        patterns_path = self.root / "ant_patterns.md"
        if not patterns_path.exists():
            logger.warning("Ant Design pattern corpus missing at %s", patterns_path)
            self._ant_patterns_cache = ""
            return ""

        self._ant_patterns_cache = patterns_path.read_text(encoding="utf-8")
        return self._ant_patterns_cache

    def sample_specs(self) -> Dict[str, Dict]:
        """Return parsed sample specs that can be used as few-shot references."""
        if self._sample_specs_cache is not None:
            return self._sample_specs_cache

        sample_dir = self.root / "sample_specs"
        specs: Dict[str, Dict] = {}
        if not sample_dir.exists():
            logger.warning("Sample specs directory missing at %s", sample_dir)
            self._sample_specs_cache = specs
            return specs

        for path in sample_dir.glob("*.json"):
            try:
                specs[path.stem] = json.loads(path.read_text(encoding="utf-8"))
            except Exception as exc:  # pragma: no cover - defensive logging
                logger.error("Failed to parse sample spec %s: %s", path, exc)

        for path in sample_dir.glob("*.yaml"):
            try:
                import yaml  # type: ignore

                specs[path.stem] = yaml.safe_load(path.read_text(encoding="utf-8"))
            except ModuleNotFoundError:
                logger.info("PyYAML not installed; skipping YAML sample spec %s", path.name)
            except Exception as exc:
                logger.error("Failed to parse YAML sample spec %s: %s", path, exc)

        self._sample_specs_cache = specs
        return specs

    def get_sample_spec(self, name: str) -> Optional[Dict]:
        """Fetch a single sample specification by name."""
        return self.sample_specs().get(name)


__all__ = ["KnowledgeBase"]
