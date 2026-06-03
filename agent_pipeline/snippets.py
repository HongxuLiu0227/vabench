"""Utility helpers for loading reusable code snippets."""

from __future__ import annotations

from pathlib import Path
from typing import Dict


SNIPPET_EXTENSIONS = {".tsx", ".ts", ".jsx", ".js", ".md", ".txt"}


def load_snippet_library(root: Path) -> Dict[str, str]:
    """Return a mapping of snippet names to their content."""
    if not root.exists():
        return {}

    snippets: Dict[str, str] = {}
    for path in sorted(root.rglob("*")):
        if not path.is_file():
            continue
        if path.suffix.lower() not in SNIPPET_EXTENSIONS:
            continue
        try:
            snippets[path.relative_to(root).as_posix()] = path.read_text(encoding="utf-8")
        except Exception:
            continue
    return snippets


def summarize_snippet(name: str, content: str, max_lines: int = 24) -> str:
    """Return a truncated summary for prompt inclusion."""
    lines = [line.rstrip() for line in content.splitlines() if line.strip()]
    if len(lines) > max_lines:
        lines = lines[:max_lines] + ["…"]
    snippet_body = "\n".join(lines)
    return f"Snippet {name}:\n{snippet_body}".strip()


__all__ = ["load_snippet_library", "summarize_snippet", "SNIPPET_EXTENSIONS"]

