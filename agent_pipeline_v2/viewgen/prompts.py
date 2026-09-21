"""Prompt assembly for per-view generation.

The prompt is the *entire world* the LLM sees: the view's spec slice, a data
sample, the ViewProps protocol verbatim, its interaction role, and (on retry)
the compiler errors from the last attempt. Nothing is left for the model to
go look up — that is what keeps it on the rails.
"""

from __future__ import annotations

import json
from typing import Any, Dict, List, Optional

__all__ = ["build_view_prompt", "PROTOCOL_BLOCK", "extract_code"]

PROTOCOL_BLOCK = """// 组件协议（types.ts，原样照抄，不许改）：
interface ViewProps {
  data: Record<string, unknown>[];   // 已经按订单算好的行，你只管用，不许再聚合
  selection: { sourceView: string | null; field: string | null; values: unknown[] };
  onSelect?: (values: unknown[]) => void;
}
export default function 组件名(props: ViewProps) { ... }"""

MARK_GUIDANCE = {
    "bar": "用 SVG <rect> 画柱子（d3 scaleLinear/scaleBand）。",
    "line": "用 SVG <path> 画线（d3 line + scaleLinear/scalePoint）。",
    "circle": "用 SVG <circle> 画散点（d3 scaleLinear）。",
    "pie": "用 SVG <path> 画扇形（d3 pie + arc）。",
    "treemap": "用嵌套矩形（d3 treemap 或直接按面积比例布局）。",
    "square": "用 SVG <rect> 网格/热力色块（颜色深浅编码数值）。",
    "text": "渲染大号 KPI 数字/文本，不需要坐标轴。",
    "area": "用 SVG <path> 画面积（d3 area）。",
    "map": "地图：用经纬度把点画在 SVG 上（简单的等距投影即可，纬度取负）。",
    "unknown": "按数据特征选择最合适的简单图表。",
}

COLOR_GUIDANCE = """配色规则：
- 若给了显式颜色/调色板：严格使用，并画一个简单图例。
- 若只给了颜色字段：分类字段用分类色板（如 d3.schemeTableau10），数值字段用连续色（如 d3.interpolateBlues）。
- 未给颜色要求：用 d3.schemeTableau10。
"""


def build_view_prompt(
    spec: Dict[str, Any],
    data_sample: List[Dict[str, Any]],
    *,
    interaction_role: str = "",
    errors: Optional[List[str]] = None,
) -> str:
    mark = spec.get("mark", "unknown")
    guidance = MARK_GUIDANCE.get(mark, MARK_GUIDANCE["unknown"])

    group_desc = ", ".join(g["as"] for g in spec.get("group_by", [])) or "（无分组，数据已聚合成总计）"
    agg_desc = ", ".join(f"{a['as']}（{a['op']} {a['field']}）" for a in spec.get("aggregates", []))

    prompt = f"""你要为 dashboard 编写一个独立的 React 视图组件：{spec.get('view_name', '')}。

## 图类型
{mark}。{guidance}

## 数据（已算好，直接用 props.data）
- 分组字段：{group_desc}
- 数值字段：{agg_desc}
- 数据样例（前 3 行）：
```json
{json.dumps(data_sample[:3], ensure_ascii=False, indent=1, default=str)}
```

## 协议与硬约束
{PROTOCOL_BLOCK}
- 用 TypeScript + D3（项目已装 d3，import * as d3 from 'd3'）。
- 组件必须撑满父容器（width/height 100%），用 SVG viewBox 自适应。
- 不许 fetch、不许聚合/过滤数据、不许 import 项目其他文件（除了 'd3'、'react'）。
- 输出**只包含这一个 .tsx 文件的完整代码**，用 ```tsx 代码块包裹。
{COLOR_GUIDANCE}
"""
    if interaction_role:
        prompt += f"\n## 你在交互中的角色\n{interaction_role}\n"

    if errors:
        prompt += "\n## 上一次生成的代码编译失败，错误如下，请修正后重新输出完整组件：\n"
        prompt += "\n".join(f"- {e}" for e in errors[:10]) + "\n"

    return prompt


def extract_code(text: str) -> str:
    """Pull the tsx code block out of the model's response."""
    import re

    m = re.search(r"```(?:tsx|ts|typescript|jsx)?\s*\n(.*?)```", text, re.DOTALL)
    if m:
        return m.group(1).strip()
    return text.strip()
