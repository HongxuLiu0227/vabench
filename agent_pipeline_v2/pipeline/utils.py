"""General-purpose helpers for the pipeline."""

from __future__ import annotations

import json
import os
import shutil
import time
from contextlib import contextmanager
from dataclasses import asdict, is_dataclass
from pathlib import Path
from typing import Any, Callable, Dict, Iterable, Iterator, Optional, Tuple, TypeVar

T = TypeVar("T")


def ensure_directory(path: Path) -> None:
    """Ensure the provided directory exists."""
    path.mkdir(parents=True, exist_ok=True)


def to_serializable(data: Any) -> Any:
    """Convert dataclasses to dictionaries for JSON dumping."""
    if is_dataclass(data):
        return asdict(data)
    if isinstance(data, dict):
        return {key: to_serializable(value) for key, value in data.items()}
    if isinstance(data, (list, tuple)):
        return [to_serializable(item) for item in data]
    return data


def write_json(path: Path, data: Any) -> None:
    """Write data as formatted JSON."""
    ensure_directory(path.parent)
    path.write_text(json.dumps(to_serializable(data), indent=2, ensure_ascii=False), encoding="utf-8")


def append_jsonl(path: Path, data: Any) -> None:
    """Append a single JSON record to a JSONL file."""
    ensure_directory(path.parent)
    with path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(to_serializable(data), ensure_ascii=False) + "\n")


def write_text_files(root: Path, files: Dict[str, str]) -> None:
    """Write multiple text files relative to the provided root directory."""
    for rel_path, content in files.items():
        target_path = root / rel_path
        ensure_directory(target_path.parent)
        target_path.write_text(content, encoding="utf-8")


@contextmanager
def scoped_timer() -> Iterator[Callable[[], float]]:
    """Context manager that yields a callable returning elapsed time."""
    start = time.monotonic()

    def elapsed() -> float:
        return time.monotonic() - start

    yield elapsed


def safe_call(func: Callable[..., T], *args: Any, **kwargs: Any) -> Tuple[Optional[T], Optional[Exception]]:
    """Call a function and capture exceptions without raising."""
    try:
        return func(*args, **kwargs), None
    except Exception as exc:  # pragma: no cover - defensive
        return None, exc


def resolve_node_executable() -> Optional[Path]:
    """Resolve a usable Node.js binary even when it is not on PATH."""
    direct = shutil.which("node")
    if direct:
        return Path(direct)

    home = Path.home()
    candidates: list[Path] = [
        home / ".volta" / "bin" / "node",
        home / ".asdf" / "shims" / "node",
    ]

    nvm_root = home / ".nvm" / "versions" / "node"
    if nvm_root.exists():
        candidates.extend(sorted(nvm_root.glob("*/bin/node"), reverse=True))

    for candidate in candidates:
        if candidate.exists() and candidate.is_file():
            return candidate
    return None


def env_with_node_path(base_env: Optional[Dict[str, str]] = None) -> Dict[str, str]:
    """Return an environment with the resolved Node.js directory prepended to PATH."""
    env = dict(base_env or os.environ)
    node_executable = resolve_node_executable()
    if node_executable is None:
        return env

    node_dir = str(node_executable.parent)
    current_path = env.get("PATH", "")
    parts = [part for part in current_path.split(os.pathsep) if part]
    if node_dir not in parts:
        env["PATH"] = node_dir + (os.pathsep + current_path if current_path else "")
    return env


__all__ = [
    "append_jsonl",
    "ensure_directory",
    "write_json",
    "write_text_files",
    "scoped_timer",
    "safe_call",
    "to_serializable",
    "resolve_node_executable",
    "env_with_node_path",
]
