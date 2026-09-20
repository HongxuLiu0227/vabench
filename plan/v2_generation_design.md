# v2 生成流程设计稿

> 目标：从 WIS（可靠的 workbook 规范）生成**可运行、数据正确、交互可用**的 React dashboard。
> 核心原则：**接口在生成前钉死，LLM 只填格子**——能确定性推导的绝不让 LLM 自由发挥。
> 贯穿例子：`output_twbx_single/160`（Swimmers Overview，3 视图 + 1 筛选 action）。

---

## 1. 总览：六个阶段

```
.twb ──► ① WIS 解析（已完成）
            │
            ▼
         ② 数据准备 DataPrep        【确定性，Python】
            │   产出：enriched dataset + 每视图 query spec
            ▼
         ③ 骨架生成 Skeleton        【确定性，模板 codegen】
            │   产出：项目壳 + 数据层 + 状态总线 + 布局
            ▼
         ④ 逐视图生成 ViewGen       【LLM，每视图一次，协议化】
            │   产出：每视图一个组件文件
            ▼
         ⑤ 组装接线 Assembly        【确定性，模板 codegen】
            │   产出：Dashboard.tsx + 交互注册
            ▼
         ⑥ 验证与定向修复 Verify     【确定性检查 + LLM 定向修】
```

LLM 只出现在 ④（画单个图）和 ⑥（修错）——**②③⑤ 全是程序**。

---

## 2. 阶段 ②：数据准备（Python，确定性）

### 要解决的问题

LLM 算聚合必错（SUM/AVG 不分、字段名对不上、日期不会截断），所以**查询逻辑从 WIS 推导，不让 LLM 写**。

### 2.1 enriched dataset（物化数据层）

读 CSV → 输出 `public/data/enriched.json`：

- 清洗：三层引号表头、UTF-8 归一、空行
- 类型强转：按 WIS datasources 的 `datatype`（"64698.0"→int，`00:04:09`→时长秒，日期→ISO）
- **计算字段物化**：WIS 的 `formula`（如 `DATEDIFF('year',[BirthDate],now())`）在 Python 端求值，作为新列写入
- **日期派生物化**：按 WIS 用到的派生码预生成列（`FECHA_day`、`Order Date_month` 等）

### 2.2 每视图 query spec（视图的数据"订单"）

从 WIS 的 shelves/encodings/filters 推导，每个上架视图一份：

```json
{
  "view_id": "swimmers_by_age",
  "source": "swimming_comp",
  "rows": [
    {"field": "BirthDateSwimmers_age", "role": "dimension"},
    {"field": "GenderSwimmer", "role": "dimension"},
    {"field": "SwimmerId", "aggregation": "CountD", "role": "measure"}
  ],
  "group_by": ["BirthDateSwimmers_age", "GenderSwimmer"],
  "aggregates": [{"field": "SwimmerId", "op": "CountD", "as": "value"}],
  "filters": [{"field": "GenderSwimmer", "op": "neq", "value": null}],
  "sort": [{"field": "BirthDateSwimmers_age", "order": "asc"}]
}
```

### 2.3 查询引擎：静态模板，一次写好

`src/lib/query.ts` 是**不变的共享库**（groupBy/aggregate/filter/sort 的几十行实现），每个项目原样拷贝。LLM 永远不碰聚合代码。

> 交互需要行级数据的场景（刷选散点）：query spec 带 `row_level: true`，引擎返回物化行而非聚合行。

---

## 3. 阶段 ③：骨架生成（codegen，确定性）

### 3.1 项目结构（生成物）

```
<project>/
├── public/data/enriched.json          ← ② 产出
├── src/
│   ├── lib/query.ts                   ← 静态模板（共享库）
│   ├── specs/views.json               ← ② 产出：所有 query spec
│   ├── store/dashboardStore.ts        ← ③ 产出：交互状态总线
│   ├── views/
│   │   ├── SwimmersByAge.tsx          ← ④ LLM 生成
│   │   ├── SwimmersByCountry.tsx      ← ④ LLM 生成
│   │   └── SwimmersByRank.tsx         ← ④ LLM 生成
│   └── Dashboard.tsx                  ← ⑤ 组装：布局 + 接线
```

### 3.2 状态总线（交互的"协议"）

从 WIS actions 机械推导 store 的形状。160 号有 1 个 action（filter, on-select, auto-clear, source=Rank, targets=Age+Country）：

```ts
// dashboardStore.ts（codegen 生成）
interface SelectionState {
  sourceView: string | null;
  field: string | null;        // 联动字段（WIS action 的 field）
  values: (string|number)[];   // 选中的值
}
interface DashboardStore {
  selection: SelectionState;
  select: (view: string, field: string, values: any[]) => void;
  clear: () => void;           // auto-clear=true 时生成
}
```

**这就是"接口钉死"**：所有视图组件只认这套接口，交互一致性不由 LLM 保证，由 store 保证。

### 3.3 视图组件协议（ViewProps）

每个 LLM 生成的组件必须实现同一接口：

```ts
interface ViewProps<T = any> {
  data: T[];                    // query.ts 已按 spec 算好的行
  selection: SelectionState;    // 当前选择（用于高亮/过滤自己）
  onSelect: (values: any[]) => void;  // 上报选择（仅 action 源视图用）
}
```

---

## 4. 阶段 ④：逐视图生成（LLM，协议化）

### 每个视图的 prompt 只含

1. **该视图的 WIS 切片**：mark（bar/treemap/map…）、shelves 解码后的字段（含聚合）、颜色（字段 + 显式色/调色板）、标题
2. **数据形状**：`data` 的列名和 3 行样例（来自 query spec 的实际执行结果）
3. **协议**：ViewProps 接口 + 它在交互中的角色（"你是 action 源，点击柱子调 onSelect([gender])" / "你被联动，按 selection.field==='GenderSwimmer' 时高亮匹配行"）
4. **硬约束**：D3 渲染、禁止自己 fetch/聚合、禁止使用协议外 props

### 确定性验收（生成后立即跑，不过就重生成）

- 组件导出存在、实现 ViewProps、无 `fetch('/data'` 以外的 IO、无聚合函数（groupBy/reduce-sum 等黑名单）
- 标记的 chart type 与 WIS.resolved 一致（结构匹配：bar→rect、line→path、map→投影点）

---

## 5. 阶段 ⑤：组装接线（codegen，确定性）

### 5.1 布局

WIS zones（0–100000 相对坐标）→ 固定画布绝对定位：

```tsx
// 160: size 1169×827
<div style={{position:'relative', width:1169, height:827}}>
  <div style={{position:'absolute', left:'46.6%', top:'45.3%', width:'51.3%', height:'53.9%'}}>
    <SwimmersByAge ... />
  </div>
  ...
</div>
```

filter/color/text zone 同样生成对应控件（下拉筛选器、图例、文本块）。

### 5.2 交互接线（逐 action 模板化）

```
对 WIS 的每个 action：
  源视图：注入 onSelect = (values) => store.select(source, field, values)
  目标视图：数据查询追加 selection 过滤（filter 类）或渲染高亮（brush 类）
  auto-clear=true → 空白点击调用 store.clear()
```

**接线代码是模板替换，不是 LLM 写作**——交互对不错的根本保证。

---

## 6. 阶段 ⑥：验证与定向修复

轻量（评测 metric 不在本阶段范围）：

1. `pnpm install && pnpm build` 必须过
2. 渲染冒烟：截图非空、每视图容器内有 SVG 子元素（复用 metrics 的 Playwright 基建）
3. 修复按失败域定向：哪个视图挂了只重生成哪个视图（骨架不动）

---

## 7. 与旧管道的对照

| | 旧 | 新 |
|---|---|---|
| 聚合 | LLM 手写，必错 | query spec 从 WIS 推导 + 静态引擎 |
| 计算字段 | 没人管，数值对不上 | Python 物化进 enriched.json |
| 交互 | LLM 自由发挥，12% | store 协议 + 模板接线 |
| 布局 | LLM 估，比例错 | zone 几何精确映射 |
| 视图生成 | 一次写整个项目 | 逐视图小 prompt，独立验收/重生成 |
| 颜色 | LLM 编 | WIS 显式色/调色板注入 |

## 8. 实施顺序建议

1. ② 数据准备（Python：CSV 清洗 + 计算字段 + query spec 推导）——**地基，先跑通 160**
2. ③ 骨架 + ⑤ 组装（模板 codegen）——拿假视图（占位组件）先验证布局/交互接线
3. ④ 逐视图生成（LLM 协议）——替换占位组件
4. ⑥ 验证与修复
5. 全量 171 个 workbook 试跑，统计通过率
