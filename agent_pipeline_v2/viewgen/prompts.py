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
    "treemap": "用 d3 treemap 布局；类型上叶子节点用 d3.HierarchyRectangularNode<行类型>（d3.treemap(...)(root).leaves() 的元素才有 x0/y0/x1/y1 属性）；每个块上用类别名做标签（如国家名），块足够大时再附数值。",
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


def _view_overview(spec: Dict[str, Any]) -> str:
    """生成一段连贯的中文视图概述（全部从 spec 翻译，不是创作）。"""
    mark = spec.get("mark", "unknown")
    visual = spec.get("visual") or {}
    group_fields = [g["as"] for g in spec.get("group_by", [])]
    agg_fields = [a["as"] for a in spec.get("aggregates", [])]

    mark_cn = {
        "bar": "柱状图", "line": "折线图", "circle": "散点图", "pie": "饼图",
        "treemap": "矩形树图", "square": "热力方块图", "text": "KPI 文本卡",
        "area": "面积图", "map": "地图", "unknown": "图表",
    }.get(mark, "图表")

    parts: List[str] = [f"这是一个{mark_cn}（{mark}）。"]
    if visual.get("facet_rows"):
        parts.append(f"它按 {visual['facet_rows']} 拆成上下排列的多个子面板；")
    elif visual.get("facet_cols"):
        parts.append(f"它按 {visual['facet_cols']} 拆成左右排列的多个子面板；")
    if group_fields:
        parts.append(f"每个（子）面板中，按 {'、'.join(group_fields)} 分组，")
    if agg_fields:
        parts.append(f"展示 {'、'.join(agg_fields)}。")
    if visual.get("orientation") == "horizontal":
        parts.append("柱子横向排列（类别在 y 轴）。")
    elif visual.get("orientation") == "vertical":
        parts.append("柱子纵向排列（类别在 x 轴）。")
    if visual.get("color_field"):
        parts.append(f"按 {visual['color_field']} 着色并带图例。")
    if visual.get("show_labels"):
        parts.append("每个图形元素上标注类别名和数值。")
    if visual.get("title"):
        parts.append(f"视图标题为「{visual['title']}」。")
    return "".join(parts)


def _visual_block(spec: Dict[str, Any]) -> str:
    """Render spec['visual'] (translated from WIS) into prompt instructions."""
    visual = spec.get("visual") or {}
    if not visual:
        return ""
    lines: List[str] = []
    if visual.get("orientation") == "horizontal":
        lines.append("- 方向：横向条形图（类别在 y 轴，数值在 x 轴）。")
    elif visual.get("orientation") == "vertical":
        lines.append("- 方向：纵向柱状图（类别在 x 轴，数值在 y 轴）。")
    if visual.get("facet_rows"):
        lines.append(
            f"- 分面：按 {visual['facet_rows']} 把图拆成上下排列的多个子面板，"
            f"每个面板只画该取值的数据，共享同一坐标刻度。"
        )
    if visual.get("facet_cols"):
        lines.append(
            f"- 分面：按 {visual['facet_cols']} 把图拆成左右排列的多个子面板，"
            f"每个面板只画该取值的数据，共享同一坐标刻度。"
        )
    # 颜色优先级：有颜色字段时按字段着色（显式 mark-color 多为标签/默认色，
    # 不应盖过分类色）；没有颜色字段时才用显式色当主色
    if visual.get("color_field") and visual.get("color_type") == "sequential":
        lines.append(f"- 颜色：按 {visual['color_field']} 用**连续色阶**着色（如 d3.interpolateBlues），禁止用分类色板，并配连续色图例。")
    elif visual.get("color_field"):
        lines.append(f"- 颜色：按 {visual['color_field']} **分类**着色（如 d3.schemeTableau10），并画分类图例。")
    elif visual.get("explicit_colors"):
        colors = ", ".join(visual["explicit_colors"])
        lines.append(f"- 颜色：必须使用显式颜色 {colors} 作为主色。")
    if visual.get("show_labels"):
        lines.append("- 数据标签：每个图形元素上标注其类别名和数值（数值用千分位格式，如 15,144）。")
    for at in visual.get("axis_titles", []):
        scope = "x 轴" if at.get("scope") == "cols" else "y 轴" if at.get("scope") == "rows" else "轴"
        lines.append(f"- {scope}标题：{at['title']}")
    if visual.get("title"):
        lines.append(f"- 视图标题：{visual['title']}")
    return "\n## 视觉规范（来自 workbook 原始样式，严格遵守）\n" + "\n".join(lines) + "\n" if lines else ""


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

## 视图概述
{_view_overview(spec)}

## 图类型
{mark}。{guidance}

## 数据（已算好，直接用 props.data）
- 分组字段：{group_desc}
- 数值字段：{agg_desc}
- 数据样例（前 3 行）：
```json
{json.dumps(data_sample[:3], ensure_ascii=False, indent=1, default=str)}
```
{_visual_block(spec)}
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
