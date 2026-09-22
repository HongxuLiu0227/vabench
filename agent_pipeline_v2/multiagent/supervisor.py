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

_PLAN_PROMPT = """你是多视图 dashboard 的视觉一致性评审。下面是这个 dashboard 的完整说明（WIS）。

{wis_summary}

你的任务：给出一份简短的**补充型**全局一致性建议（3-5 条），注入各视图组件的生成要求中。

硬性规则（必须遵守）：
1. WIS 中已明确的内容（图类型、颜色/调色板、分面、方向、布局位置）一律以 WIS 为准，你只可引用，不可更改、覆盖或另立方案；
2. 禁止指定任何颜色值或色系方案——WIS 有显式色/调色板就引用它，没有就写"用默认分类色板"；
3. 禁止出现任何绝对像素尺寸（画布宽高、面板宽度等），布局一律由组件按父容器自适应；
4. 只补充 WIS 没规定的细节，例如：数值标签格式（千分位）、字号与字重、轴线粗细与颜色（浅灰细线）、图例位置与排列、交互联动的透明度反馈、视图间留白节奏。

输出：直接列条目，每条一句话，不要解释。"""


def plan_node(state: DashboardState) -> Dict[str, Any]:
    llm = make_llm()
    prompt = _PLAN_PROMPT.format(wis_summary=state["wis_summary"])
    guidance = llm.invoke(prompt).content
    guidance = guidance if isinstance(guidance, str) else str(guidance)

    jobs = []
    for job in state["jobs"]:
        jobs.append({**job, "global_guidance": guidance})
    return {"global_guidance": guidance, "jobs": jobs, "round_no": 1}
