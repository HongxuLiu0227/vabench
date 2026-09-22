你要为 dashboard 编写一个独立的 React 视图组件：Swimmers by Country。

## 图类型
treemap。用嵌套矩形（d3 treemap 或直接按面积比例布局）；每个块上用类别名做标签（如国家名），块足够大时再附数值。

## 数据（已算好，直接用 props.data）
- 分组字段：Сountry
- 数值字段：countd_SwimmerId（countd SwimmerId）
- 数据样例（前 3 行）：
```json
[
 {
  "Сountry": "Bulgaria",
  "countd_SwimmerId": 18908
 },
 {
  "Сountry": "Chile",
  "countd_SwimmerId": 18748
 },
 {
  "Сountry": "China",
  "countd_SwimmerId": 29492
 }
]
```

## 视觉规范（来自 workbook 原始样式，严格遵守）
- 颜色：按 SwimmerId 字段着色（分类用 d3.schemeTableau10 或原作近似色，数值用 d3.interpolateBlues），并画图例。
- 数据标签：每个图形元素上标注其类别名和数值（数值用千分位格式，如 15,144）。
- 视图标题：Amount of swimmers by Country

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
