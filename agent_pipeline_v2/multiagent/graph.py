"""Graph assembly: supervisor plan → fan-out view workers → evaluate → repair loop."""

from __future__ import annotations

from typing import Any, Dict, List

from langgraph.graph import END, StateGraph
from langgraph.types import Send

from .evaluator import evaluate_node, route_after_evaluation
from .state import DashboardState, ViewJob
from .supervisor import plan_node
from .view_worker import build_view_worker

__all__ = ["build_dashboard_graph"]

_worker = build_view_worker()


def _run_worker(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Node wrapper: run one view-worker subgraph; merge its outcome into results."""
    job: ViewJob = payload["job"]
    project_dir = payload["project_dir"]
    out = _worker.invoke({
        "job": job,
        "project_dir": project_dir,
        "code": "",
        "problems": job.get("initial_errors", []),
        "attempts": 0,
    })
    result = out["result"]
    return {"results": {job["view_id"]: result}}


def _fan_out(state: DashboardState) -> List[Send]:
    return [
        Send("view_worker", {"job": job, "project_dir": state["project_dir"]})
        for job in state["jobs"]
    ]


def build_dashboard_graph():
    graph = StateGraph(DashboardState)

    graph.add_node("plan", plan_node)
    graph.add_node("view_worker", _run_worker)
    graph.add_node("evaluate", evaluate_node)

    graph.set_entry_point("plan")
    graph.add_conditional_edges("plan", _fan_out, ["view_worker"])
    graph.add_edge("view_worker", "evaluate")
    graph.add_conditional_edges(
        "evaluate",
        route_after_evaluation,
        {"repair": "view_worker", "finish": END},
    )
    return graph.compile()
