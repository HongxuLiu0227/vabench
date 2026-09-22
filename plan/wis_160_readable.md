# WIS 可读版 — Swimmers Overview（160 号 workbook）

> 由 output/wis/160_wis.json 翻译。这是解析器从 .twb 提取的"说明书"。


---
## 一、数据源（datasources）

- **vSwimmingCompetitions (SWIMMING_Comp)**（id: `federated.15oasa50fhs26j1fbots...`）
  - 共 56 个字段，对应 data/ 下的 CSV

---
## 二、视图（worksheets）

### 「Swimmers by Age」
- **图类型：bar**（文件明写，依据：declared）
- 标题：Amount of swimmers by Age
- 是否上架：是
- rows（纵轴/行）：GenderSwimmer × [CountD]SwimmerId
- cols（横轴/列）：BirthDateSwimmers (copy)_818529261980127232
- 颜色：按 GenderSwimmer，显式颜色 ['#72b966']
- 筛选：Action (RankSwimmers,RankTrainer) crossjoin []（挂在交互动作上）
- 筛选：GenderSwimmer except ['%null%']
- 筛选：Сountry level-members []
- 计算字段：**BirthDateSwimmers (age)** = `DATEDIFF('year',[BirthDateSwimmers],now())`

### 「Swimmers by Country」
- **图类型：treemap**（规则推断，依据：size_color_text_no_shelves）
- 标题：Amount of swimmers by Country
- 是否上架：是
- 颜色：按 [CountD]SwimmerId
- size：[CountD]SwimmerId
- text：Сountry
- 筛选：Action (RankSwimmers,RankTrainer) crossjoin []（挂在交互动作上）

### 「Swimmers by Rank」
- **图类型：bar**（规则推断，依据：dim_plus_measure）
- 标题：Rank by Swimmers by Trainers Rank
- 是否上架：是
- rows（纵轴/行）：RankSwimmers
- cols（横轴/列）：RankTrainer × [CountD]SwimmerId
- 筛选：[attr]RankSwimmers union ['"1"', '"2"', '"3"', '"CMS"', '"MS"', '"U1"', '"U2"', '"U3"', '%many-values%']
- 筛选：CountrySwimmers level-members []

---
## 三、仪表盘布局（dashboards）

- 画布：1169×827（fixed）

| 类型 | 关联 | 控制的字段 | 位置(x,y) | 尺寸(w,h) |
|---|---|---|---|---|
| title |  |  | (684,967) | (98632,6046) |
| sheet | Swimmers by Country |  | (599,44135) | (44825,74002) |
| sheet | Swimmers by Rank |  | (1796,7013) | (79042,35067) |
| filter | Swimmers by Rank | CountrySwimmers | (83062,7497) | (15997,6651) |
| sheet | Swimmers by Age |  | (46621,45345) | (51326,53930) |
| filter | Swimmers by Age | Сountry | (82549,43047) | (15569,6288) |
| color | Swimmers by Age | GenderSwimmer | (85287,55744) | (11976,7739) |

---
## 四、交互动作（actions）

- 在「Swimmers by Rank」上 **on-select** → `tsc:tsl-filter`
  - auto-clear：true
  - 影响的视图：Swimmers by Age, Swimmers by Country

---
## 五、统计摘要

```json
{
  "worksheet_count": 3,
  "dashboard_count": 1,
  "action_count": 1,
  "calculated_field_count": 1,
  "mark_confidence": {
    "explicit": 1,
    "inferred": 2,
    "missing": 0
  }
}
```