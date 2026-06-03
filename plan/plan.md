# Pipeline 优化计划

> 基于 `tableau_dashboard_refine5_19` (Nihad NHL Dashboard) 的生成质量评审，记录待实施的优化项。

---

## 1. 修复 `tableau_source_validation.py` 的 false positive 误报

**文件**: `agent_pipeline/pipeline/tableau_source_validation.py`

**问题**: `extract_contract_field_names` 将 `Name` 错误归类为 `numeric_fields`（因为出现在 `[cnt:Name:qk]` 中），导致 `inspect_csv_dataset` 对 `Name` 列做数值解析率检查，`parse_ratio=0.00` 触发 `csv_numeric_parse_risk` 错误。实际上 `Name` 是字符串列。

**修改点 1**: `inspect_csv_dataset` 的字段统计循环中（约第 298-312 行），添加自动类型降级逻辑：
- 如果某列被标记为 `numeric` 但实际采样 `parse_ratio < 0.3`，自动将 `kind` 改为 `"string"`
- 字符串列跳过后续的 `csv_numeric_parse_risk` 检查

**修改点 2**: `extract_contract_field_names` 中对 count 聚合字段的分类逻辑（约第 179-184 行），添加明确的字符串字段名列表 `_STRING_FIELD_PATTERNS`，包含 `name`, `id`, `code`, `label` 等明显非数值的字段名。

**修改点 3**: `_parse_number` 函数显式排除 `NaN` 和 `Inf`。

---

## 2. 添加断短路机制 (Circuit Breaker)

**文件**: `agent_pipeline/pipeline/stages/tableau_source_compliance.py`

**问题**: `tableau_source_compliance` 阶段连续 3 次尝试失败在同一类错误上，但重试循环没有检测停滞，每次都用相同的 instruction 和相同的验证器，浪费了 1068s 和 3 次 API 调用。

**修改点 1**: 在重试循环中添加停滞检测——记录前一次 `failure_categories`，如果连续 2 次无变化则触发断短路。

**修改点 2**: 添加 `_are_all_categories_non_actionable` 方法，判断所有 failure 是否都是不可修复的 false positive（如字符串列被误判为数值列）。

**修改点 3**: 当检测到 non-actionable 时，自动将 error 降级为 warning 并标记成功，不再浪费 API 调用。

---

## 3. 数据加载策略：原始 CSV → 预聚合 JSON（推荐）

**涉及文件**:
- `agent_pipeline/agents/tableau_requirement_generation_agent.py`（`prepare_tableau_data_assets`）
- `agent_pipeline/pipeline/stages/requirement_architect.py`
- 生成项目的 `src/services/dataLoader.ts`
- 生成项目的 `src/hooks/useData.ts`
- 生成项目的 `src/pages/Dashboard.tsx`

**问题**: 当前 pipeline 将完整 CSV（2422 行）推给前端，前端需要 PapaParse + 手写聚合函数来计算每个图表的值。数据量大、前端代码复杂、容易出错。

**方案**: 在 Python 端（requirement_enrichment 阶段）用 pandas 预计算每个 worksheet 的聚合结果，存为一个小 JSON 文件。

**具体改动**:

1. **Python 端**：在 `prepare_tableau_data_assets` 中，读取 CSV 后用 pandas 计算每个 worksheet 需要的聚合值：
   - `count_by_position`: `df.groupby("Position").size()`
   - `avg_goals_by_position`: `df.groupby("Position")["Goals"].mean()`
   - `avg_assists_by_position`: `df.groupby("Position")["Assists"].mean()`
   - `avg_shots_by_position`: `df.groupby("Position")["Shots_on_Goal"].mean()`
   - `height_boxplot`: 每个 position 的 `describe()` + 分位数
   - `weight_boxplot`: 同上
   - 将结果存到 `public/data/aggregations.json`

2. **前端端**：简化数据加载链路：
   - 去掉 PapaParse 依赖（除非仍有 CSV 场景）
   - `dataLoader.ts` 简化为 `fetch('/data/aggregations.json')`
   - 去掉手写的 `aggregateAvgByPosition`、`aggregateCountByPosition`、`computeBoxPlotStats` 等
   - `Dashboard.tsx` 中直接使用 JSON 数据，不再需要 `useMemo` 做聚合

**预期收益**:
- CSV 2422 行 (~150KB) → JSON (~2KB)，加载从几百 ms → 瞬间
- 前端代码量减少约 60%（去掉所有解析/聚合逻辑）
- 减少 bug（不再有 NaN/类型转换/空行处理等问题）
- 更符合 "Tableau 转换" 的语义（Tableau 本身也是在后端做完聚合再渲染）

---

## 4. 布局修复

**文件**: 生成项目的 `src/pages/Dashboard.tsx`

**问题**: `aspectRatio: '1/1'`（第 167 行）假设仪表盘是正方形，实际 NHL 仪表盘不是 1:1 比例。

**方案**:
- 从 `tableau_spec.json` 的 dashboard size 推断实际宽高比，或
- 去掉 aspectRatio，改用 `min-height` 让内容自然撑开高度
- 或者根据 zone 坐标计算真实比例（100000x100000 的内部坐标映射到实际渲染尺寸）

---

## 5. 其他待评估项

- [ ] `placeholder_fix` 阶段是否对 Tableau 模式做了足够处理
- [ ] `render_fix` 阶段是否需要加入 Tableau 特定的视觉对比（与源截图对比）
- [ ] pipeline 总耗时 ~25min 偏长，考虑将 `tableau_source_compliance` 改为非阻塞 warning 而非 blocking error
- [ ] 生成代码中 title_runs / text_zones 内容写死在 `Dashboard.tsx` 中，是否应该改为从 `tableau_spec.json` 动态读取
- [ ] 对 `_NUMERIC_HINTS` 和 `_STRING_FIELD_PATTERNS` 使用更全面的数据集覆盖测试
