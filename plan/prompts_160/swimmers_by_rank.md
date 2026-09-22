你要为 dashboard 编写一个独立的 React 视图组件：Swimmers by Rank 。

## 图类型
bar。用 SVG <rect> 画柱子（d3 scaleLinear/scaleBand）。

## 数据（已算好，直接用 props.data）
- 分组字段：RankSwimmers, RankTrainer
- 数值字段：countd_SwimmerId（countd SwimmerId）
- 数据样例（前 3 行）：
```json
[
 {
  "RankSwimmers": "1",
  "RankTrainer": "CMS",
  "countd_SwimmerId": 3
 },
 {
  "RankSwimmers": "1",
  "RankTrainer": "WMS",
  "countd_SwimmerId": 5
 },
 {
  "RankSwimmers": "1",
  "RankTrainer": "MS",
  "countd_SwimmerId": 4
 }
]
```

## 视觉规范（来自 workbook 原始样式，严格遵守）
- 方向：横向条形图（类别在 y 轴，数值在 x 轴）。
- 分面：按 RankTrainer 把图拆成左右排列的多个子面板，每个面板只画该取值的数据，共享同一坐标刻度。
- 数据标签：每个图形元素上标注其类别名和数值（数值用千分位格式，如 15,144）。
- 视图标题：Rank by Swimmers by Trainers Rank

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
你是交互源视图：用户点击你的图形元素（柱子/点/扇形）时，调用 props.onSelect([该元素的 RankSwimmers 值])，空白处点击会清除选择。
