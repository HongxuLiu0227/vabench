你要为 dashboard 编写一个独立的 React 视图组件：Swimmers by Age。

## 图类型
bar。用 SVG <rect> 画柱子（d3 scaleLinear/scaleBand）。

## 数据（已算好，直接用 props.data）
- 分组字段：GenderSwimmer, BirthDateSwimmers_age
- 数值字段：countd_SwimmerId（countd SwimmerId）
- 数据样例（前 3 行）：
```json
[
 {
  "GenderSwimmer": "F",
  "BirthDateSwimmers_age": 26,
  "countd_SwimmerId": 15144
 },
 {
  "GenderSwimmer": "F",
  "BirthDateSwimmers_age": 34,
  "countd_SwimmerId": 378
 },
 {
  "GenderSwimmer": "F",
  "BirthDateSwimmers_age": 27,
  "countd_SwimmerId": 143
 }
]
```

## 视觉规范（来自 workbook 原始样式，严格遵守）
- 方向：纵向柱状图（类别在 x 轴，数值在 y 轴）。
- 分面：按 GenderSwimmer 把图拆成上下排列的多个子面板，每个面板只画该取值的数据，共享同一坐标刻度。
- 颜色：按 GenderSwimmer 字段着色（分类用 d3.schemeTableau10 或原作近似色，数值用 d3.interpolateBlues），并画图例。
- 数据标签：每个图形元素上标注其类别名和数值（数值用千分位格式，如 15,144）。
- 视图标题：Amount of swimmers by Age

## 协议与硬约束
// 组件协议（types.ts，原样照抄，不许改）：
interface ViewProps {
  data: Record<string, unknown>[];   // 已经按订单算好的行，你只管用，不许再聚合
  selection: { sourceView: string | null; field: string | null; values: unknown[] };
  onSelect?: (values: unknown[]) => void;
}
export default function 组件名(props: ViewProps) { ... }
- 用 TypeScript + D3（项目已装 d3，import * as d3 from 'd3'）。
- 组件必须撑满父容器（width/height 100%），用 SVG viewBox 自适应。
- 不许 fetch、不许聚合/过滤数据、不许 import 项目其他文件（除了 'd3'、'react'）。
- 输出**只包含这一个 .tsx 文件的完整代码**，用 ```tsx 代码块包裹。
配色规则：
- 若给了显式颜色/调色板：严格使用，并画一个简单图例。
- 若只给了颜色字段：分类字段用分类色板（如 d3.schemeTableau10），数值字段用连续色（如 d3.interpolateBlues）。
- 未给颜色要求：用 d3.schemeTableau10。


## 你在交互中的角色
你是被联动视图：当 props.selection.field === 'RankSwimmers' 且 values 非空时，高亮 props.data 中 RankSwimmers 在 values 里的行/图形（其余降低透明度到 0.25）。
