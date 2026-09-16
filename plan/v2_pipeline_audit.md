# agent_pipeline v2 逐阶段体检报告

> 目的：v2 重构前的现状盘点。逐阶段记录：干什么、产物、薄弱点、改进方向。
> 体检日期：2026-09-15；对象：`agent_pipeline`（已复制为 `agent_pipeline_v2`，后续改动在 v2 上进行）

---

## 0. 全貌：活的管道 vs 死代码

**实际在跑的 stage 链**（`orchestrator.build_stages()` 注册的 8 个）：

```
RequirementArchitect → ProjectScaffolder → FirstGeneration
→ TableauSourceCompliance → PlaceholderFix → BugFix → RenderFix → QualityAssurance
```

**死代码（从未注册、仅互相引用）**：
- 6 个 stage 文件：`seed_intake`、`data_state_modeler`、`experience_planner`、`component_assembly`、`integrator`、`packaging`
- 8 个 agent：`code_fixer_agent`、`code_validation_agent`、`component_generator_agent`、`import_resolver_agent`、`relationship_refactor_agent`、`render_agent`、`router_design_agent`、`structure_planner_agent`

→ **v2 第一批删除对象**，估算可减掉 agents/ 一半以上的文件。

---

## 1. 框架层（orchestrator / stage / scheduler / gating）

**现状**：线性执行；每个 stage 有 retries + TimeoutGate + 可选业务 gate；telemetry（events jsonl + per-stage trace）比较完善。

**薄弱点**：
- `consumes`/`produces` 声明了但**没有强制校验**——stage 间交接靠约定，不靠检查
- 无 checkpoint/resume：跑到 RenderFix 挂了，只能从头再来（25min/趟的管道这很疼）
- scheduler 支持并行但全程串行使用
- Claude CLI driver 硬编码 1800s 超时，无模型抽象

---

## 2. 逐阶段评估

### ① RequirementArchitect（需求/契约生成）
**干什么**：.twb → TSS（规则）→ CTS 草稿（规则）→ LLM 复核（限改 chart_intent/color_encoding/fidelity_rules）→ requirements.md + 数据资产（public/data + data_profile）。
**产物质量**：整条链的地基，直接决定后面所有阶段。
**薄弱点**：
- 解析器的启发式分支（`_infer_chart_intent` 兜底、颜色缺失）是已知错误源——LLM 复核只能修 3 个字段，覆盖面有限
- `plan/plan.md` 第 1 项：字段类型误判（Name 被判为数值列）的 false positive 未修
**改进方向**：解析器插桩（每个字段标注"明确/启发式/缺失"）、扩大或重构 LLM 复核的覆盖范围、修 plan.md 第 1 项。

### ② ProjectScaffolder（脚手架）
**干什么**：复制缓存的 Vite 模板 + 调 `design_file_structure`（一次 LLM 调用产出文件结构清单）。
**薄弱点**：
- `file_structure_manifest` 产出后**下游似乎没人真正消费**——这次 LLM 调用可能是纯浪费
- 模板里的 eslint/tsconfig 是否和生成代码风格匹配，无人校验
**改进方向**：砍掉或改造 file_structure 调用；模板与 FirstGeneration 的 prompt 要求对齐。

### ③ FirstGeneration（首次生成，最关键）
**干什么**：一个巨型 prompt（16 条要求 + 3 个 Tableau policy 块 + snippets）让 Claude CLI 一次性写完整个项目，自己跑 install/lint/build。
**薄弱点**：
- **单体式 prompt**：所有要求塞一轮，模型顾此失彼（MV-Bench 的错误分析：字段绑错、交互遗漏都发生在这里）
- 生成后**没有立刻验证 contract 符合度**——错误要等到 TableauSourceCompliance 甚至更晚才暴露
- prompt 里混着"业务要求"和"通用卫生要求"（auth admin/admin、Tailwind 警告），稀释注意力
**改进方向**：这是 v2 最值得重构的阶段。选项：(a) 按 worksheet 拆分多次生成再组装；(b) 生成后立即跑 contract 符合度检查，不合格当场修（而不是等到后面的 stage）。

### ④ TableauSourceCompliance（数据源合规）
**干什么**：确定性校验器（`tableau_source_validation.py`）+ 最多 3 轮 Claude CLI 修复。
**薄弱点**（plan.md 第 1、2 项，均已确诊）：
- 校验器 false positive：字符串列被当数值列检查，parse_ratio=0 报错
- 无断短路：同一类错误连续失败 3 次，用相同 instruction 空转，曾浪费 1068s
**改进方向**：按 plan.md 修复（类型降级 + 字符串字段白名单 + NaN/Inf 排除）；加停滞检测 + non-actionable 降级为 warning。

### ⑤ PlaceholderFix（占位符修复）
**干什么**：~600 行确定性扫描器（占位符 token、交互问题、Tableau 数据违规、数值强转、Tailwind 误用、spec/contract 违规）+ Claude CLI 修复 + PlaceholderGate。
**薄弱点**：
- 扫描器全是**正则**，脆且漏报/误报不可避免
- 多个 `_scan_tableau_*` 和 ④ 的校验器、QA 的检查有职责重叠
**改进方向**：扫描器保留（快、免费），但把重叠的 contract 检查收敛到一处；考虑哪些检查其实应该前置到 ③ 的即时反馈里。

### ⑥ BugFix（构建修复）
**干什么**：跑 pnpm install/lint/test/build，失败则带错误摘要让 Claude CLI 修，最多 2 轮自动修复。
**现状评价**：相对健康，命令分类和日志都清晰。

### ⑦ RenderFix（渲染修复）
**干什么**：跑渲染器截图，**用正则解析渲染日志**找致命模式（空页面、import 解析失败、SVG 几何错误、React key 错误……），失败则修。
**薄弱点**：
- 靠 regex 解析日志文本——渲染器输出格式一变就瞎
- 只查"有没有渲染崩"，**不查"渲染得像不像"**（plan.md 第 5 项：没有与源截图的视觉对比）
**改进方向**：渲染验证升级为结构化结果（DOM 检查/截图对比），而不是日志正则；视觉对比可复用 metrics 里的 SSIM/CLIP 基建。

### ⑧ QualityAssurance（终检）
**干什么**：汇总各阶段验证结果 + PlaceholderGate + 交互覆盖检查。
**薄弱点**：
- 交互"覆盖"检查是**对源码做正则**（找 `onClick`/`highlight` 字样）——源码里有这个词不代表交互真的工作
**改进方向**：交互验证应该跑真实 episode replay（metrics 里的 `interaction.py` 就是干这个的），而不是文本匹配。

---

## 3. 跨阶段主题（v2 的重构主线候选）

| 主题 | 现状 | 方向 |
|---|---|---|
| A. 死代码 | 6 stage + 8 agent 未使用 | 删除 |
| B. 校验器质量 | false positive + 无断短路 | plan.md 1、2 项 |
| C. contract 符合度检查太靠后 | ③ 生成的错误到 ④⑤⑦ 才分段暴露 | 生成后立即校验；扫描器职责收敛 |
| D. 渲染/交互验证靠正则 | ⑦ 日志正则、⑧ 源码正则 | 换成 DOM/episode 级真实检查（复用 metrics 基建） |
| E. 可恢复性 | 无 checkpoint | state 序列化 + 从失败 stage 重跑 |
| F. 单体 prompt | ③ 一轮巨型 prompt | 评估拆分（按 worksheet）或保持单轮+即时校验 |

## 4. 建议动工顺序

1. **A + B**（删死代码 + 修校验器 + 断短路）——立竿见影，风险低
2. **D**（渲染/交互验证升级）——复用现有 metrics，收益大
3. **C**（生成后即时 contract 校验）——触及主生成逻辑，需要设计
4. **E**（checkpoint）——工程改善
5. **F**（③ 的重构）——伤筋动骨，放最后，且先看 A–D 做完后错误率还剩多少再定
