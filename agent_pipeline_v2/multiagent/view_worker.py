"""View-worker subgraph: one LangGraph state machine per view.

generate → structural check → tsc → conditional edge (pass / retry / give up).
Written framework-native; the mini-loop in viewgen is NOT used.
"""

from __future__ import annotations

import re
from pathlib import Path
from typing import Any, Dict

from langgraph.graph import END, StateGraph

from ..viewgen.loop import _structural_check, _tsc_errors_by_file, view_comp_name
from ..viewgen.prompts import build_view_prompt, extract_code
from .state import WorkerState, make_llm

__all__ = ["build_view_worker"]

MAX_ATTEMPTS = 3


def _generate(state: WorkerState) -> Dict[str, Any]:
    job = state["job"]
    llm = make_llm()
    errors = state.get("problems") or job.get("initial_errors") or None
    prompt = build_view_prompt(
        job["spec"],
        job["data_sample"],
        interaction_role=job.get("role_text", ""),
        errors=errors,
    )
    if job.get("global_guidance"):
        prompt += (
            "\n## 全局一致性建议（补充参考，非强制）\n"
            "以下建议用于统一各视图的观感细节。凡与 WIS 视觉规范冲突的，"
            "一律以 WIS 为准；本建议不得推翻 WIS 已明确的颜色、图类型与布局。\n"
            f"{job['global_guidance']}\n"
        )

    raw = llm.invoke(prompt).content
    code = extract_code(raw if isinstance(raw, str) else str(raw))

    project_dir = Path(state["project_dir"])
    comp = view_comp_name(job["spec"])
    (project_dir / "src" / "views" / f"{comp}.tsx").write_text(code, encoding="utf-8")

    problems = _structural_check(code, job["spec"].get("mark", ""))
    return {"code": code, "problems": problems, "attempts": state.get("attempts", 0) + 1}


def _verify(state: WorkerState) -> Dict[str, Any]:
    """One tsc pass for the project; keep only this view's errors."""
    project_dir = Path(state["project_dir"])
    comp = view_comp_name(state["job"]["spec"])
    by_file = _tsc_errors_by_file(project_dir)
    file_errors = by_file.get(f"src/views/{comp}.tsx", [])
    return {"problems": file_errors}


def _route(state: WorkerState) -> str:
    if not state.get("problems"):
        return "pass"
    if state.get("attempts", 0) >= MAX_ATTEMPTS:
        return "giveup"
    return "retry"


def _finish(state: WorkerState) -> Dict[str, Any]:
    view_id = state["job"]["view_id"]
    success = not state.get("problems")
    return {
        "result": {
            "view_id": view_id,
            "success": success,
            "attempts": state.get("attempts", 0),
            "problems": state.get("problems", []),
            "code": state.get("code", ""),
        }
    }


def build_view_worker():
    """The per-view subgraph factory."""
    graph = StateGraph(WorkerState)
    graph.add_node("generate", _generate)
    graph.add_node("verify", _verify)
    graph.add_node("finish", _finish)

    graph.set_entry_point("generate")
    graph.add_edge("generate", "verify")
    graph.add_conditional_edges(
        "verify",
        _route,
        {"pass": "finish", "retry": "generate", "giveup": "finish"},
    )
    graph.add_edge("finish", END)
    return graph.compile()
