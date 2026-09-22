"""Supervisor node: whole-dashboard understanding → global style guidance.

The supervisor does NOT write components. It reads the whole-dashboard
description and produces one shared guidance block injected into every view's
prompt (palette unity, label typography, spacing) — the thing per-view loops
cannot see.
"""

from __future__ import annotations

import json
from typing import Any, Dict

from .state import DashboardState, make_llm

__all__ = ["plan_node"]

_PLAN_PROMPT = """你是一个多视图 dashboard 的视觉总监。下面是这个 dashboard 的完整说明。

{wis_summary}

请给出一份简短的**全局一致性指导**（将注入每个视图组件的生成要求中），只写最影响整体观感的 3-5 条，例如：
- 统一的配色基调（结合说明里出现的显式颜色/调色板）
- 统一的数值标签样式（千分位、字号、旋转角度）
- 统一的留白/轴线风格（细灰轴线、无多余边框）
- 统一的分面/图例呈现方式

要求：直接输出条目列表，不要解释，不要泛泛而谈。"""


def plan_node(state: DashboardState) -> Dict[str, Any]:
    llm = make_llm()
    prompt = _PLAN_PROMPT.format(wis_summary=state["wis_summary"])
    guidance = llm.invoke(prompt).content
    guidance = guidance if isinstance(guidance, str) else str(guidance)

    jobs = []
    for job in state["jobs"]:
        jobs.append({**job, "global_guidance": guidance})
    return {"global_guidance": guidance, "jobs": jobs, "round_no": 1}
