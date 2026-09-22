"""Evaluator node: program checks + LLM coherence review → repair tickets.

Program checks are deterministic (build, tsc, empty-render heuristics via the
workers' results). The LLM review judges the whole dashboard's coherence —
style unity and structural mismatches that per-view loops cannot see.
"""

from __future__ import annotations

import json
import re
import subprocess
from pathlib import Path
from typing import Any, Dict, List

from .state import DashboardState, ViewJob, make_llm

__all__ = ["evaluate_node", "route_after_evaluation"]

MAX_REPAIR_ROUNDS = 1

_REVIEW_PROMPT = """你是 dashboard 的质量评审。这个 dashboard 由多个子 agent 分别生成视图组件。

## dashboard 说明
{wis_summary}

## 全局一致性要求（生成时下发过的）
{global_guidance}

## 各视图结果
{results_summary}

请审查并只报告**跨视图的整体性问题**（配色/标签/图例风格不统一、分面结构没落实、某视图明显偏离说明）。
按 JSON 数组输出返工单，每个元素：{{"view_id": "...", "issue": "具体问题一句话"}}
没有整体性问题就输出 []。不要评价数据正确性（已由程序保证）。"""


def _summarize_results(state: DashboardState) -> str:
    lines = []
    for job in state["jobs"]:
        outcome = state["results"].get(job["view_id"], {})
        status = "成功" if outcome.get("success") else f"失败: {'; '.join((outcome.get('problems') or [])[:2])}"
        lines.append(f"- {job['spec'].get('view_name')} ({job['spec'].get('mark')}): {status}")
    return "\n".join(lines)


def evaluate_node(state: DashboardState) -> Dict[str, Any]:
    project_dir = Path(state["project_dir"])

    # 程序检查：build 必须过
    try:
        proc = subprocess.run(["npm", "run", "build"], cwd=project_dir,
                              capture_output=True, text=True, timeout=300)
        build_ok = proc.returncode == 0
    except Exception as exc:
        build_ok = False
        proc = None
    build_errors = [] if build_ok else [
        line.strip() for line in ((proc.stdout or "") + (proc.stderr or "")).splitlines()
        if "error" in line.lower()
    ][:5]

    # LLM 整体一致性评审
    review_prompt = _REVIEW_PROMPT.format(
        wis_summary=state["wis_summary"],
        global_guidance=state.get("global_guidance", ""),
        results_summary=_summarize_results(state),
    )
    raw = make_llm().invoke(review_prompt).content
    raw = raw if isinstance(raw, str) else str(raw)
    match = re.search(r"\[.*\]", raw, re.DOTALL)
    try:
        tickets = json.loads(match.group(0)) if match else []
    except json.JSONDecodeError:
        tickets = []

    repair_jobs: List[ViewJob] = []
    ticket_lines: List[str] = []
    failed = {
        **{vid: [f"build 失败: {e}" for e in build_errors]
           for vid, o in state["results"].items() if not o.get("success")},
    }
    for t in tickets if isinstance(tickets, list) else []:
        if isinstance(t, dict) and t.get("view_id"):
            failed.setdefault(t["view_id"], []).append(str(t.get("issue", "")))
            ticket_lines.append(f"{t['view_id']}: {t.get('issue', '')}")

    for job in state["jobs"]:
        vid = job["view_id"]
        if vid in failed:
            repair_jobs.append({**job, "initial_errors": failed[vid]})

    return {
        "repair_tickets": ticket_lines + build_errors,
        "jobs": repair_jobs if repair_jobs else state["jobs"],
        "status": "repair_needed" if repair_jobs else "done",
        "round_no": state.get("round_no", 0) + 1,
    }


def route_after_evaluation(state: DashboardState) -> str:
    if state.get("status") == "repair_needed" and state.get("round_no", 1) <= MAX_REPAIR_ROUNDS:
        return "repair"
    return "finish"
