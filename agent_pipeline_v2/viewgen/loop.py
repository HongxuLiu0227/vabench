"""The mini-agent loop: generate → verify → feed errors back → retry.

The model's action space is locked to "emit this one component file".
Verification is deterministic (tsc + structural checks), and failures go back
into the next prompt verbatim.
"""

from __future__ import annotations

import json
import re
import subprocess
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional

from .driver import LLMDriver
from .prompts import build_view_prompt, extract_code

__all__ = ["generate_view", "ViewGenResult"]

MAX_ATTEMPTS = 3

# structural expectations per mark (soft check: warn if the SVG element is absent)
MARK_ELEMENTS = {
    "bar": ["rect"],
    "line": ["path"],
    "circle": ["circle"],
    "pie": ["path"],
    "area": ["path"],
    "square": ["rect"],
    "treemap": ["rect"],
    "map": ["circle"],
}

FORBIDDEN_PATTERNS = [
    (re.compile(r"fetch\s*\("), "不许 fetch（数据已由 props.data 提供）"),
    (re.compile(r"from\s+['\"]\.\./"), "不许 import 项目内其他文件"),
    (re.compile(r"\.groupBy\(|\.reduce\("), "不许自己聚合数据"),
]


@dataclass
class ViewGenResult:
    view_id: str
    success: bool
    attempts: int
    problems: List[str] = field(default_factory=list)


def _structural_check(code: str, mark: str) -> List[str]:
    problems: List[str] = []
    if "export default" not in code:
        problems.append("缺少 export default 组件")
    for pattern, msg in FORBIDDEN_PATTERNS:
        if pattern.search(code):
            problems.append(f"违反约束：{msg}")
    expected = MARK_ELEMENTS.get(mark)
    if expected and not any(f"<{el}" in code for el in expected):
        problems.append(f"结构存疑：{mark} 图应使用 <{expected[0]}> 元素")
    return problems


def _tsc_check(project_dir: Path) -> List[str]:
    try:
        proc = subprocess.run(
            ["npx", "tsc", "--noEmit"],
            cwd=project_dir, capture_output=True, text=True, timeout=300,
        )
    except (FileNotFoundError, subprocess.TimeoutExpired) as exc:
        return [f"tsc 无法运行: {exc}"]
    if proc.returncode == 0:
        return []
    errors = []
    for line in (proc.stdout + proc.stderr).splitlines():
        line = line.strip()
        if "error TS" in line:
            errors.append(line)
    return errors[:10] or ["tsc 失败但未给出 error 行"]


def generate_view(
    project_dir: str | Path,
    spec: Dict[str, Any],
    data_sample: List[Dict[str, Any]],
    driver: LLMDriver,
    *,
    interaction_role: str = "",
    max_attempts: int = MAX_ATTEMPTS,
) -> ViewGenResult:
    """Generate one view component with the mini-agent loop."""
    project_dir = Path(project_dir)
    view_id = spec["view_id"]
    comp_name = re.sub(r"[^A-Za-z0-9]", "", spec["view_id"].title().replace("_", ""))
    target = project_dir / "src" / "views" / f"{comp_name}.tsx"

    errors: Optional[List[str]] = None
    problems: List[str] = []
    for attempt in range(1, max_attempts + 1):
        prompt = build_view_prompt(spec, data_sample, interaction_role=interaction_role, errors=errors)
        raw = driver.generate(prompt)
        code = extract_code(raw)
        target.write_text(code, encoding="utf-8")

        problems = _structural_check(code, spec.get("mark", ""))
        if not problems:
            problems = _tsc_check(project_dir)
        if not problems:
            return ViewGenResult(view_id=view_id, success=True, attempts=attempt)
        errors = problems

    return ViewGenResult(view_id=view_id, success=False, attempts=max_attempts, problems=problems)
