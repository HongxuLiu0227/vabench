# WIS — Workbook Interface Specification (wis_v1)

`.twb` → WIS JSON 的正式格式契约。由 `agent_pipeline_v2/spec/wis_parser.py` 生成。

**设计原则**
1. **忠实解析**：文件里有什么出什么，解析阶段不猜。
2. **置信度三态**：每个推断结论带 `confidence: explicit | inferred | missing` 和 `rule: <推断规则名>`。文件里明写的 = explicit；有规则可推的 = inferred；文件里没有的 = missing，**绝不编造**。
3. **字段引用全解码**：所有字段引用输出为完整对象，下游不做二次解析。

## 顶层结构

```
source       来源（文件名、Tableau 版本）
datasources  数据层：字段档案 + 计算字段公式
worksheets   视图层：每个图表的完整描述
dashboards   仪表盘层：尺寸 + zones（已拍平）
actions      交互层：动作 + 双向链接的视图
summary      统计摘要（数量 + mark_confidence 分布）
```

## datasources[]

| 字段 | 含义 |
|---|---|
| `id` | 数据源 ID（字段引用的 `[federated.xxx]` 前缀） |
| `caption` | 人类可读名（对应 CSV 文件名） |
| `fields[]` | 每列：`remote_name`（CSV 列名）、`datatype`、`default_aggregation`、`contains_null`、`ordinal`；计算字段另有 `formula` |

## FieldRef（字段引用对象，各处复用）

`.twb` 的 `[ds].[deriv:Name:type]` 暗号解码为：

| 字段 | 含义 |
|---|---|
| `raw` | 原文 |
| `datasource` | 数据源 ID |
| `derivation` | 派生方式（None/Sum/Avg/Count/CountD/Cumulative/PercentOfTotal/Year…/各日期截断） |
| `derivation_code` | 原始派生码（`ctd`、`tmn`…） |
| `name` | 字段名 |
| `field_type` | `nominal` / `ordinal` / `quantitative` / null |
| `is_action_placeholder` | `[Action (a,b)]` 交互占位字段 |
| `is_measure_names` | `[Measure Names/Values]` |
| `decoded` | 是否成功解码 |

## worksheets[]

| 字段 | 含义 |
|---|---|
| `name` / `title` | 视图名 / 标题文本 |
| `on_dashboard` | 是否被 dashboard 的 sheet zone 引用（隐藏的为 false，生成时跳过） |
| `mark` | 图类型：`declared`（原文）、`resolved`（结论）、`confidence`、`rule`；地图另有 `map_subtype: symbol/filled`、`symbol_shape` |
| `shelves.rows/cols` | `raw` 原文 + `expr` 表达式树（`cross` 嵌套 / `concat` 并列 / `field` 叶子） |
| `fields_used` | 架子上用到的全部 FieldRef |
| `encodings` | 视觉通道（color/size/text/tooltip/lod/geometry…），color 项可能带 `palette`、`palette_type`、`explicit_colors` |
| `filters[]` | `class`、`column`(FieldRef)、`function`、`members`、`linked_action`（挂到哪个 action，跨视图联动的关键） |
| `slices[]` | 切片器字段（FieldRef） |
| `style_rules[]` | 样式规则原文（element/attr/value/field/scope） |
| `calculated_fields[]` | 视图级计算字段（含 `formula`） |

### mark 推断规则表（Automatic 时）

| rule | 条件 → 结论 |
|---|---|
| `lat_long_or_geometry` | 经纬度对 / geometry 通道 → `map` |
| `temporal_plus_measure` | 时间维度 + 数值 → `line` |
| `measure_vs_measure` | 两轴皆数值 → `circle` |
| `dim_plus_measure` | 维度 + 数值 → `bar` |
| `measures_only` | 仅数值 → `bar` |
| `dims_only` | 仅维度 → `text` |
| `size_color_text_no_shelves` | 空架子 + size/color/text → `treemap` |
| `text_only_no_shelves` | 空架子 + 仅 text → `text` |
| `empty_shelves` / `unresolved_roles` | 无法判断 → `unknown`（missing） |

## dashboards[]

| 字段 | 含义 |
|---|---|
| `size` | 画布（`sizing-mode: fixed` 时 min/max 即实际尺寸） |
| `zones[]` | 拍平的区块：`type`（sheet/filter/color/text/title/bitmap/layout/layout-basic/layout-flow…）、`name`（sheet 关联的视图名）、`param_field`（filter/color 控件控制的字段，FieldRef）、`geometry`（0–100000 相对坐标 x/y/w/h）、`parent`（布局嵌套）、text zone 带 `text` |

## actions[]

| 字段 | 含义 |
|---|---|
| `activation` | `type: on-select/on-hover`、`auto-clear` |
| `source` | 触发源（worksheet/dashboard） |
| `command` | `tsc:tsl-filter`（筛选）/ `tsc:brush`（高亮刷选） |
| `params` | 命令参数（target、special-fields…） |
| `linked_worksheets` | 通过 worksheet 级 filter 的 `ui-action-filter` 反查得到的受影响视图（双向链接） |

## 已知边界

- LOD 表达式（367 处/语料）只捕获通道存在性，未展开求值语义
- 日期派生的具体计算语义（如 `tmn` 截断如何物化）在数据准备层处理，WIS 只声明
- 推断规则表基于语料抽查校准，未覆盖所有边界；错误会通过 confidence 标签显式暴露

## 用法

```bash
python -m agent_pipeline_v2.spec.cli <workbook.twb> --out wis.json
```
