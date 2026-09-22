"""Shared state schemas and the LLM factory for the multiagent package."""

from __future__ import annotations

import operator
import os
from pathlib import Path
from typing import Annotated, Any, Dict, List, Optional, TypedDict

from langchain_openai import ChatOpenAI

__all__ = ["DashboardState", "WorkerState", "ViewJob", "ViewOutcome", "make_llm", "merge_dicts"]


# ---------------------------------------------------------------------------
# LLM factory (reads the same .env as viewgen)
# ---------------------------------------------------------------------------

def _load_env(env_path: str = ".env") -> None:
    path = Path(env_path)
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            key, _, value = line.partition("=")
            os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def make_llm(**kwargs: Any) -> ChatOpenAI:
    # 不传 temperature：有的模型限制取值（如 k3 只允许 1），用服务端默认
    kwargs.pop("temperature", None)
    _load_env()
    return ChatOpenAI(
        model=os.environ.get("MODEL_NAME", ""),
        api_key=os.environ.get("LLM_KEY", ""),
        base_url=os.environ.get("LLM_BASE_URL", ""),
        **kwargs,
    )


# ---------------------------------------------------------------------------
# State schemas
# ---------------------------------------------------------------------------

def merge_dicts(a: Dict[str, Any], b: Dict[str, Any]) -> Dict[str, Any]:
    return {**a, **b}


class ViewJob(TypedDict, total=False):
    view_id: str
    spec: Dict[str, Any]
    data_sample: List[Dict[str, Any]]
    role_text: str
    global_guidance: str
    initial_errors: List[str]


class ViewOutcome(TypedDict, total=False):
    view_id: str
    success: bool
    attempts: int
    problems: List[str]
    code: str


class WorkerState(TypedDict):
    """State inside one view-worker subgraph."""
    job: ViewJob
    project_dir: str
    code: str
    problems: Annotated[List[str], operator.add]
    attempts: int
    result: ViewOutcome


class DashboardState(TypedDict):
    """Top-level graph state."""
    project_dir: str
    wis_summary: str
    global_guidance: str
    jobs: List[ViewJob]
    results: Annotated[Dict[str, ViewOutcome], merge_dicts]
    round_no: int
    repair_tickets: Annotated[List[str], operator.add]
    status: str
