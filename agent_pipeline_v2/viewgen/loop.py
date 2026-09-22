"""The mini-agent loop: generate → verify → feed errors back → retry.

The model's action space is locked to "emit this one component file".
Verification is deterministic (tsc + structural checks), and failures go back
into the next prompt verbatim.

Batch mode (generate_views_batch): views are generated concurrently; tsc runs
once per round on the whole project, and its errors are routed back to the
offending view by filename.
"""

from __future__ import annotations

import json
import re
import subprocess
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional

from .driver import LLMDriver
from .prompts import build_view_prompt, extract_code

__all__ = ["generate_view", "generate_views_batch", "ViewGenResult", "view_comp_name"]

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
    # .reduce 是通用工具，只禁止"手写聚合"的典型形态
    (re.compile(r"\.reduce\(\s*\(\s*(sum|total|acc)\s*,", re.IGNORECASE), "不许自己聚合数据"),
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
    result = generate_views_batch(
        project_dir,
        [{"spec": spec, "data_sample": data_sample, "interaction_role": interaction_role}],
        driver,
        max_attempts=max_attempts,
        workers=1,
    )
    return result[0]


def view_comp_name(spec: Dict[str, Any]) -> str:
    name = re.sub(r"[^A-Za-z0-9]", "", spec["view_id"].title().replace("_", ""))
    # JS 标识符不能以数字开头（如 9a_min_age_position）
    if name and name[0].isdigit():
        name = "View" + name
    return name


def _tsc_errors_by_file(project_dir: Path) -> Dict[str, List[str]]:
    """Run tsc once; route each error to the view file it belongs to."""
    try:
        proc = subprocess.run(
            ["npx", "tsc", "--noEmit"],
            cwd=project_dir, capture_output=True, text=True, timeout=300,
        )
    except (FileNotFoundError, subprocess.TimeoutExpired) as exc:
        return {"__all__": [f"tsc 无法运行: {exc}"]}
    if proc.returncode == 0:
        return {}
    by_file: Dict[str, List[str]] = {}
    for line in (proc.stdout + proc.stderr).splitlines():
        m = re.match(r"(src/[^(]+\.tsx?)\((\d+),(\d+)\):\s*(error TS\d+.*)", line.strip())
        if m:
            by_file.setdefault(m.group(1), []).append(line.strip())
        elif "error TS" in line:
            by_file.setdefault("__all__", []).append(line.strip())
    return by_file


def generate_views_batch(
    project_dir: str | Path,
    jobs: List[Dict[str, Any]],
    driver: LLMDriver,
    *,
    max_attempts: int = MAX_ATTEMPTS,
    workers: int = 4,
) -> List[ViewGenResult]:
    """Generate many views concurrently with shared tsc rounds.

    jobs: [{spec, data_sample, interaction_role}]
    Round-based: concurrent generation → one tsc pass → per-view errors → retry.
    """
    project_dir = Path(project_dir)
    pending = {j["spec"]["view_id"]: j for j in jobs}
    done: Dict[str, ViewGenResult] = {}
    errors: Dict[str, List[str]] = {}

    for attempt in range(1, max_attempts + 1):
        def work(job: Dict[str, Any]) -> tuple[str, List[str], str]:
            spec = job["spec"]
            prompt = build_view_prompt(
                spec, job["data_sample"],
                interaction_role=job.get("interaction_role", ""),
                errors=errors.get(spec["view_id"]),
            )
            code = extract_code(driver.generate(prompt))
            comp = view_comp_name(spec)
            (project_dir / "src" / "views" / f"{comp}.tsx").write_text(code, encoding="utf-8")
            problems = _structural_check(code, spec.get("mark", ""))
            return spec["view_id"], problems, code

        with ThreadPoolExecutor(max_workers=workers) as pool:
            for view_id, problems, _ in pool.map(work, pending.values()):
                if problems:
                    errors[view_id] = problems
                else:
                    errors.pop(view_id, None)

        # 全项目统一 tsc，一次跑完按文件名分发错误
        tsc_by_file = _tsc_errors_by_file(project_dir)
        for view_id, job in pending.items():
            comp = view_comp_name(job["spec"])
            file_errors = tsc_by_file.get(f"src/views/{comp}.tsx", [])
            if file_errors:
                errors[view_id] = (errors.get(view_id) or []) + file_errors

        still = [vid for vid in pending if vid in errors]
        for vid in list(pending):
            if vid not in errors:
                done[vid] = ViewGenResult(view_id=vid, success=True, attempts=attempt)
                del pending[vid]
        if not pending:
            break
        # 没过的进入下一轮，带着 errors
        for vid in still:
            if attempt == max_attempts:
                done[vid] = ViewGenResult(view_id=vid, success=False, attempts=attempt,
                                          problems=errors.get(vid, []))
                pending.pop(vid, None)

    for vid, job in pending.items():
        done.setdefault(vid, ViewGenResult(view_id=vid, success=False,
                                           attempts=max_attempts, problems=errors.get(vid, [])))
    return [done[j["spec"]["view_id"]] for j in jobs]
