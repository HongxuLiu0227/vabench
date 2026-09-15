"""Utility helpers for single-pass vision pipeline."""

from __future__ import annotations

import csv
import json
import os
import shutil
from pathlib import Path
from typing import Any, Dict, List


def ensure_directory(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def read_json_file(path: Path) -> Dict[str, Any]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(payload, dict):
        raise ValueError(f"Expected JSON object in {path}")
    return payload


def profile_csv(path: Path, sample_rows: int = 30) -> Dict[str, Any]:
    with path.open("r", encoding="utf-8-sig", errors="replace", newline="") as handle:
        reader = csv.reader(handle)
        rows: List[List[str]] = []
        for idx, row in enumerate(reader):
            rows.append(row)
            if idx >= sample_rows:
                break

    headers = rows[0] if rows else []
    sample = rows[1 : 1 + sample_rows] if len(rows) > 1 else []
    return {
        "file_name": path.name,
        "path": str(path),
        "column_count": len(headers),
        "columns": headers,
        "sample_rows": sample,
    }


def write_json(path: Path, payload: Dict[str, Any]) -> None:
    ensure_directory(path.parent)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def resolve_node_executable() -> Path | None:
    direct = shutil.which("node")
    if direct:
        return Path(direct)
    return None


def env_with_node_path(base_env: Dict[str, str] | None = None) -> Dict[str, str]:
    env = dict(base_env or os.environ)
    node = resolve_node_executable()
    if node is None:
        return env
    node_dir = str(node.parent)
    current_path = env.get("PATH", "")
    if node_dir not in current_path.split(os.pathsep):
        env["PATH"] = node_dir + (os.pathsep + current_path if current_path else "")
    return env
