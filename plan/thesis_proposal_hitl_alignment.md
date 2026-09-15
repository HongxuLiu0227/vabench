# 毕业论文研究方案（草案 v1）

**人机意图统一驱动的协调多视图界面生成**
*Intent-Aligned Generation of Coordinated Multi-View Interfaces via Human-in-the-Loop Contract Alignment*

> 状态：草案，供与导师讨论。基于 MV-Bench（已录用）与 5 篇相关工作的精读（CoLadder / VisEditBench / ClarifyGPT / HumanEvalComm / Urbanite）。
> 最后更新：2026-08-25

---

## 1. 研究背景与动机

### 1.1 已有工作（我们的地基）

MV-Bench（已录用）建立了协调多视图界面 image-to-code 的 benchmark：以 Tableau workbook 为 ground truth，经 TSS（Tableau Structured Specification）→ CTS（Code Translation Specification）两级中间表示生成可执行参考实现，共 1048 个实例；对 5 个前沿 MLLM 的单趟生成做了系统评测。

**核心负面结论（本研究的出发点）**：

- 所有模型 Static ≈ 75%，但 Data ≈ 21.7%、Int. ≈ 11.7%——能复现外观，不能复现数据语义和交互逻辑；
- 最多三轮的执行反馈修复（repair）只提升可执行性，**不缩小 Data/Int. 差距**，在衍生样本上甚至反而降低数据绑定正确率；
- 论文归因于 **feedback asymmetry**：编译/渲染错误是局部的、可机检的；而 data binding 与交互的错误源于模型对字段协调关系的**错误推断**——执行反馈"能标记，不能纠正"；
- 同时存在 **representation asymmetry**：布局在截图中可直接观察，数据绑定与交互逻辑是 latent 的，必须从间接线索推断。

### 1.2 核心论点（thesis statement）

把 MV-Bench 的负面结果与 VisEditBench 的正面结果（机器渲染反馈使 style adaptation 从 10% → 62.85%）并置，可得到一个可检验的边界划分：

> **机器反馈能修复在渲染结果中可观察的意图偏差（视觉/样式类）；但数据绑定与跨视图交互是 latent 的意图信息，渲染与执行都观察不到——这类偏差只能由人提供。机器反馈通道已被证明封顶，人的意图输入是尚未利用的唯一信道。**

因此本研究提出：在生成管道中引入**人-AI 意图统一模块**，让人以最低的认知成本校验并纠正 AI 对目标界面的内部理解（物化为 CTS render contract），从而缩小单趟生成在数据语义与交互上的差距。

### 1.3 为什么落在 CTS 这一层

- CTS 是管道中**已有的**中间表示：chart intent、field→axis 绑定、排序/stacking、zone 几何、interaction hooks（source-target-field 三元组）；
- 评测时模型只拿到（截图 I₀, 数据 D, 交互规格 A），**CTS 不给**——模型必须自行完成到 CTS 级承诺的推断，这正是 MV-Bench 证明它们挂掉的地方；
- 纠正 CTS 层的一个字段绑定错误，人只需一次点选；等它传导成代码错误，就是 repair 救不了的那种错误；
- CTS 结构化、字段可枚举 → 歧义可程序化检测与定位，对齐效果可客观度量（相比 ClarifyGPT 的 NL 需求和 Urbanite 的主观评测，这是结构性优势）。

---

## 2. 问题定义

沿用 MV-Bench 的形式化：benchmark 实例 b = (I₀, D, A, U)，基线生成 P = f(I₀, D, A)。

本研究将生成函数扩展为：

**P = f(I₀, D, A, H₁:ₜ)**

其中 H₁:ₜ 是 t 轮人机交互（t 由分歧驱动而非固定）。交互围绕 AI 推断出的 contract ĈTS 进行：**生成前**，系统暴露 ĈTS 中的不确定点，用户确认/纠正，产出对齐后的 contract ĈTS* 驱动受约束生成；**生成后**，用户在真实渲染界面上继续反馈，系统区分"意图错"（回写 contract 重新生成）与"实现错"（代码补丁），直至收敛。

**关键区分**（与 MV-Bench Sec 5.4 的 repair 划界）：

- repair = **执行层机器反馈**（编译错误、渲染异常），已证不足；
- 本工作 = **语义层人的反馈**，作用在代码生成之前的中间表示上。

---

## 3. 研究问题

- **RQ1（有效性）**：在 CTS 层引入人-AI 意图对齐，能否缩小单趟生成在 Data / Int. 上的差距？对齐后 Overall 相比 single-pass 与 +repair 基线提升多少？
- **RQ2（效率与收益结构）**：对齐的边际收益曲线——多少轮交互达到饱和？在哪类干预点（chart intent / field binding / interaction triple / color encoding）上人的纠正收益最大？**生成前（校验点 A）与生成后（校验点 B）的人介入各值多少、是否互补？**哪类 misalignment 机器反馈就够、哪类必须靠人？（对应 §1.2 的边界划分，直接验证核心论点）
- **RQ3（主动性）**：AI 能否准确定位自己的不确定点？用客观指标 **Question Targeting Precision / Recall** 度量（AI 提出的问题命中了多少真实存在的 misalignment 点）——该指标只有本设定（有 ground-truth CTS）能定义。
- **RQ4（人的体验与成本）**：真人用户研究中，对齐交互的认知负担（NASA-TLX）、可用性（UMUX-LITE）与完成质量如何？不同对齐介入形式（确认 / 选择题 / 自由文本）的成本-收益如何？

---

## 4. 贡献声明（预期）

1. **问题与边界**：提出并验证"可观察 vs latent 意图偏差需要不同反馈来源"的划分，统一解释 MV-Bench 与 VisEditBench 的结果（理论贡献）。
2. **方法**：统一的 Intent Alignment Agent 框架——一个 Agent、两个触发时机（生成前的 latent 语义对齐 + 生成后的实物 grounded 对齐）、contract 作为贯穿的单一事实源；含不确定性驱动的分歧检测、选择题式靶向提问、以及生成后反馈的"意图错/实现错"路由机制（方法贡献）。
3. **度量**：Question Targeting Precision/Recall——利用 ground-truth CTS 首次实现对"AI 提问行为"的客观评测（度量贡献）。
4. **系统与实证**：在 MV-Bench 上的大规模模拟用户实验 + 真人用户研究；workflow 骨架 + 带循环的 HITL 对齐子图的可复现实现（系统/实证贡献）。

---

## 5. 系统架构

### 5.1 总体结构：一个 Intent Alignment Agent、两个触发时机、contract 贯穿

设计核心：**意图统一由一个统一的 Intent Alignment Agent（IAA）负责，在代码生成前、后两个时机介入；contract Ĉ 是 IAA 的持久状态对象与单一事实源，两个时机的所有修订都写回同一个 Ĉ**。主生成管道保持现有确定性 workflow 不动。

```
 输入: I₀(截图) + D(数据) + A(交互规格)
   │
   ▼
 阶段0: 意图显式化 —— IAA 推断 draft Ĉ（把模型脑内的隐式推断变成可校验对象）
   │
   ▼
 ┌─ 校验点A：生成前对齐（latent 语义）◄── 循环，人在这里 ──┐
 │ ① 分歧检测: 规则标记(低置信推断/字段缺失/引用悬空)         │
 │            + 采样 k 版 Ĉ 做结构化 diff                     │
 │ ② 提问: 每个歧义点 → 选择题 + 候选渲染预览                  │
 │ ③ 用户回答（SimulatedUser ｜ RealUser，同一接口）           │
 │ ④ 修订 Ĉ（确定性写入对应字段）+ provenance 快照             │
 │ ⑤ 收敛判断: 无疑义点 ｜ 连续两轮无变更 ｜ 预算用尽           │
 └──────────────────────────────────────────────────────┘
   │ Ĉ*（人对齐过的意图）
   ▼
 受约束生成（Ĉ* 中被确认的字段锁定，模型不得更改）→ 代码 → 构建 → 渲染
   │
   ▼
 ┌─ 校验点B：生成后对齐（实物 grounded）◄── 循环 ───────────┐
 │ ① 探索: 用户直接操作渲染界面（点击/联动/查看 tooltip）     │
 │ ② 机器粗筛: 自动跑 render 验证 + interaction episode 回放，│
 │    可疑点列表先呈交用户裁决                                 │
 │ ③ 反馈: 用户点选问题元素 + 结构化反馈菜单(+NL 补充)         │
 │ ④ 路由（IAA 的核心判断）:                                  │
 │    意图错 → 回写 Ĉ 对应字段 → 重新生成受影响视图            │
 │    实现错 → 代码补丁（复用 render_fix 机制）→ 重新渲染      │
 │ ⑤ 前后对比确认 / 收敛判断                                  │
 └──────────────────────────────────────────────────────┘
   │
   ▼
 最终产物 P → MV-Bench 客观 metrics 评测
```

**架构决策**：不引入 LangGraph 整体重构；扩展现有 orchestrator 的两项能力即可——(a) PipelineState 可序列化 + 断点恢复（复用现有 cache 机制扩展为 checkpoint，支撑"等人回答"的挂起）；(b) 两个校验点各为一个 InteractionLoopStage，内部状态机"检测→提问→回答→修订→判断"，共享同一个 IAA 实现与 Ĉ 状态。

### 5.2 校验点 A：生成前对齐（问 latent 语义）

**为什么必须在生成前**：latent 错误（字段绑错、chart type 猜错、交互接错对象）一旦传导进代码，执行反馈无法纠正（MV-Bench 已证）；而在 contract 层改一个字段，代码整体重新生成，全局一致。

**分歧检测**（何时问、问哪里；两路信号均比 ClarifyGPT 的执行式检测便宜且可定位）：

- **确定性规则**（零 LLM 成本）：解析器启发式推断自带的不确定点——低置信 chart intent、`color_encoding` 缺失、dashboard action 引用字段在目标视图编码中不存在、zone 几何异常等；MV-Bench 构造期间的已知坑（如调色板未提取导致模型编造颜色）直接转为检测规则。
- **采样分歧**：让 LLM 生成 k 版 Ĉ，对 JSON 做结构化 diff，分歧直接定位到字段。

**提问生成**（问什么、怎么问）：

- 每个歧义点生成**靶向选择题**而非开放问题（recognition >> recall；CoLadder 发现用户靠系统外化的摘要判断对齐，而不读代码）；
- 呈现素材现成：`interaction_contract.json` 的 `llm_hints.plain_language_summary`（系统理解的人话版）+ 候选方案的渲染缩略图预览；
- 提问内容锚定 Ĉ 字段：chart intent（"视图 3 是分组柱状图还是堆叠柱状图？"附两个候选渲染）、field binding（"color 通道编码的是 Region 还是 Segment？"）、interaction triple（"点击柱状图应高亮散点图还是过滤它？"）。

**设计约束**（来自 HumanEvalComm）：该问才问——需求清楚时提问反而降低成绩；问题预算需精打细算（参考 ClarifyGPT 的 ~2.85 问/歧义点）。同时注意"泄露"问题：若某歧义能从截图/数据 schema 直接推出，则提问无收益，实验设计时要区分。

### 5.3 校验点 B：生成后对齐（实物 grounded 反馈）

**设计要点：人不"审查"产物，人"使用"产物并指着错处反馈**——recognition，不是 inspection。四个子机制：

1. **探索**：用户直接操作渲染出的 dashboard。交互类错误（点了没反应、联动错视图）只在操作中暴露，静态截图给不了；
2. **反馈**：点选问题元素 + 结构化菜单（图表类型/数据数值/颜色/交互/布局/其他+NL 补充）。点选动作天然完成定位，反馈类别直接对应 MV-Bench 的四类错误；
3. **路由**（IAA 的核心判断，校验点 B 的技术贡献点）：区分*意图错*（Ĉ 层面的理解偏差 → 回写 Ĉ → 重新生成受影响视图）与*实现错*（Ĉ 对但代码没写对 → 代码补丁 → 重新渲染）。意图错只改代码会在重新生成时复发，实现错改 contract 则引入新风险——Ĉ 作为单一事实源保证两个时机修订的是同一对象；
4. **机器粗筛 + 人裁决**：render 验证与 interaction 回放（复用现有 metrics 基础设施）先标可疑点呈交用户。机器做便宜的全覆盖粗筛，人做机器做不了的语义裁决——把 MV-Bench 的 repair 机制收编为子组件，叙事上是"机器反馈与人反馈的分工"。

### 5.4 UserInterface 抽象与模拟用户

**关键抽象：UserInterface 接口**，`SimulatedUser` 与 `RealUser` 实现同一接口，pipeline 代码零改动切换。协议 = ClarifyGPT（LLM + ground-truth 测试用例）与 HumanEvalComm（LLM evaluator 同时看原始与修改后题目）的融合：

- **校验点 A 的模拟**：SimulatedUser 持有 ground-truth CTS/TSS（+ 可选原 dashboard 截图），回答问题时**查表对应字段**而非自由生成 → 回答几乎确定正确，且保真度可验证；
- **校验点 B 的模拟**：程序化对比 ground-truth 行为与生成结果（render 差异 + interaction episode 差异），差异点自动转为"用户反馈"——**批量实验不需要 GUI，GUI 只做给真人 study**；
- **保真度验证协议**（照 VisEditBench 的 VLM-judge 人类一致性做法）：抽取子集让真人回答同样的澄清问题，报告人机一致率；同时记录 HumanEvalComm 报告过的模拟器失误模式并主动防御；
- 防御"模拟用户太完美"的质疑：引入**回答噪声档位**（完美 / 带真实人类失误率 / 懒惰），做鲁棒性消融。

### 5.5 快照与可观测性

- 用户回答 → **确定性写入** Ĉ 对应字段（结构化修订，不走 LLM 自由改写，避免引入新错误）；
- 每轮修订产生 Ĉ 快照（借 Urbanite 的 provenance 模式）——支持回滚，且**每轮快照与 ground-truth CTS 的距离曲线就是论文里"对齐收敛图"的直接数据源**；
- 收敛判据：无剩余歧义点 ｜ 连续两轮无字段变更 ｜ 预算用尽。

---

## 6. 实验设计

### 6.1 Baseline 矩阵

**核心结构：2×2 因子设计**（校验点 A × 校验点 B，模拟用户驱动），叠加既有基线：

| 设定 | 校验点 A | 校验点 B | 回答的问题 |
|---|---|---|---|
| Single-pass | — | — | MV-Bench Table 1 原始行（已有结果） |
| +Repair（3 轮，机器反馈） | — | （机器版） | MV-Bench Table 1 repair 行（已有结果）——**关键对照：区分"轮数起作用"还是"人的语义信息起作用"** |
| **IAA：A only** | ✓ | — | 生成前对齐的独立价值 |
| **IAA：B only** | — | ✓ | 生成后对齐的独立价值；与 repair 同位对比（同样生成后介入，人 vs 机器反馈） |
| **IAA：A + B** | ✓ | ✓ | 完整系统；A、B 是否互补 |

**消融**：

| 消融维度 | 档位 | 对应 |
|---|---|---|
| 提问上限 | 1 / 2 / 3 / 不限轮 | RQ2 边际收益曲线 |
| 干预点类型 | 只问 chart intent / 只问 field binding / 只问 interaction | RQ2 收益结构 |
| 提问策略 | 不确定性驱动 vs 全量确认 vs 随机提问 | RQ3，验证"该问才问" |
| 模拟用户噪声 | 完美 / 带失误率 / 懒惰 | 模拟用户鲁棒性 |

### 6.2 评测指标

- **生成质量**（客观，复用现有 metrics）：Exec / S_static / S_data / S_int / S_overall；
- **提问行为**（本研究新设）：Question Targeting Precision / Recall（对照 ground-truth CTS 的真实 misalignment 点）、平均每实例提问数、对齐轮数；
- **对齐过程**：每轮快照与 ground-truth CTS 的字段级一致率曲线；
- **人的成本**（真人 study）：NASA-TLX、UMUX-LITE、完成时间、任务正确率（模板照 CoLadder：within-subjects + Latin square）。

### 6.3 真人用户研究（外部效度）

- 小规模（10–15 人），任务为从 MV-Bench 选出的代表性实例（覆盖不同 chart type 组合与交互模式）；
- 对照：无对齐的单趟生成工具 vs 本系统；
- 目的不是替代模拟用户实验，而是验证①模拟用户结论的外部效度②交互体验与成本（RQ4）。

### 6.4 跨模型验证

在 ≥3 个代表性模型上跑主实验（从 MV-Bench 五模型中选强/中/弱各一），检验结论的模型无关性。

---

## 7. Related Work 定位（已精读文献的角色）

| 文献 | 与本研究的关系 |
|---|---|
| **MV-Bench**（自己的前作） | 地基：benchmark、客观指标、机器反馈的边界证据 |
| **ClarifyGPT**（FSE 2024） | 提问有用性的奠基证据 + 模拟用户协议先例；我们的差异：结构化 contract（可定位、可客观评测）vs NL 需求（只能靠执行检测歧义） |
| **HumanEvalComm**（TOSEM 2025） | 提问行为的评测指标（Communication/Good Question Rate）+ 设计约束（该问才问；注意信息泄露）；Okanagan 的"生成→提问→反思"轮次结构 |
| **CoLadder**（2023） | 理论框架（Norman 鸿沟、意图形成/外化）+ 用户研究模板；我们的差异：AI 主动暴露不确定点 vs 人手动分解 |
| **VisEditBench**（2026） | 机器渲染反馈的对照系（视觉可修 / latent 不可修的边界）+ evaluator 人类一致性验证协议 |
| **Urbanite**（TVCG 2026） | 领域内最近邻居：spec 作人机中介 + Terry 三层对齐框架 + provenance；我们的差异：ground truth 客观评测、系统性"何时问"、复现任务 vs 开放构建 |

**一句话 positioning**：ClarifyGPT 一脉证明了"提问有用"但限于 NL 需求、单函数代码、无 ground truth；可视化领域的对齐工作（Urbanite 等）有框架但缺客观评测；MV-Bench 证明了纯机器反馈的边界。本研究把三者接起来：**在结构化 contract 上做不确定性驱动的意图对齐，用有 ground truth 的 benchmark 客观度量，模拟用户 + 真人 study 双轨验证。**

---

## 8. 风险与应对

| 风险 | 应对 |
|---|---|
| 模拟用户保真度被质疑 | 人类一致性子集验证（§5.4）+ 回答噪声消融 |
| "该问才问"做不好，提问过多反伤体验 | 不确定性阈值消融（§6.1 提问策略消融）；HumanEvalComm 的教训写进设计 |
| 歧义点可从截图/数据推出，提问显不出收益 | 实验前对候选歧义点做"可推性"分类，分开报告（这也回应 HumanEvalComm 的泄露问题） |
| 真人 study 招募难、周期长 | 模拟用户实验为主体（ClarifyGPT 先例支持此合法性），真人 study 聚焦外部效度 |
| 工程量大（GUI + 管道改造） | 校验点 B 的模拟用户可程序化生成反馈，批量实验不需要 GUI；GUI 极简优先（点选+菜单），只做给真人 study；架构上只加两个 InteractionLoopStage 与 checkpoint，不动主链 |

---

## 9. 下一步（建议顺序）

1. 与导师确认 RQ 与贡献声明、双校验点设计；
2. 实现校验点 A 的分歧检测（规则部分零 LLM 成本，可先在 104 个 GT 项目上离线验证：检测出的歧义点与已知解析错误的吻合度）；
3. 实现 SimulatedUser + 校验点 A 对齐循环（不接 GUI，先跑通 CLI 版）；
4. 在小样本（10–20 实例）上跑通端到端，看对齐后 Ĉ 与 ground truth 的距离是否收敛；
5. 实现校验点 B（先做模拟用户的程序化反馈版，GUI 后做）；
6. 全量 2×2 实验 + 真人 study。

---

## 附：一个具体的对齐交互示例（来自真实管道问题）

以 MV-Bench 构造期间的已知问题为例——`.twb` 未提取调色板时模型自行编造颜色：

> **系统**（不确定性检测触发）：视图 "Sales by Region" 的颜色编码在 workbook 中未找到显式调色板。我推断 color 通道编码字段为 `Region`（4 个取值）。
> **系统**（选择题）：颜色映射应为？[A] 分类调色板（蓝/橙/红/绿，按 Region） [B] 顺序调色板（蓝色渐变，按 Sales 数值） [C] 其他（请描述）
> **用户**：A
> **系统**：已更新 CTS 的 color_encoding 字段，并锁定禁止下游模型自行更改。

对应代码侧：该回答确定性写入 `tableau_render_contract.json` 的 `color_encoding` 字段，`requirement_architect` 的 prompt 注入逻辑保持不变——下游无感知。

---

## 附录 B：校验点 B 的对齐交互示例（生成后）

延续上例。代码生成并渲染后：

> **系统**（机器粗筛）：interaction episode 回放发现"点击 Sales by Region 的柱子"后视图 3 无变化，与交互规格预期不符。可疑点已标记。
> **用户**（在渲染界面上操作验证后点选视图 3）：交互不对——点了应该高亮对应散点，不是没反应。
> **IAA**（路由判断）：检查 Ĉ —— contract 中该 interaction triple（source=视图1, target=视图3, type=highlight）是**正确的**，属于*实现错* → 不走 contract 修订，转为代码补丁任务：检查视图 3 的 highlight handler 绑定。
> **系统**：补丁 → 重新构建渲染 → 请用户再次点击验证。
> **用户**：确认修复。

若路由判断为*意图错*（例如 Ĉ 里 target 写成了视图 2），则回写 Ĉ 并从受影响视图重新生成，保证 contract 与代码始终一致。

---

## 附录 C：两个对齐模块的技术实现清单（怎么加、加什么、怎么做）

> 本节是面向实现的技术方案，供向导师汇报"具体怎么做"使用。

### C.0 一个前置形式化

Ĉ（意图假设 contract）是一个 JSON 树，叶子是可枚举的**字段槽位**（slot）。所有机制都围绕 slot 操作：

```
Ĉ = {
  worksheets: [
    { name, chart_intent,          # slot: 图表类型
      field_bindings: {x, y, color, ...},   # slot: 字段绑定
      sort_order, stacking, ... },
    ...
  ],
  interactions: [ {source, target, type, fields}, ... ],  # slot: 交互三元组
  layout: {...}, color_encoding: {...}, ...
}
```

- **分歧检测** = 找出"哪些 slot 的值不确定"；
- **提问** = 把不确定 slot 转成选择题；
- **回答** = 用户给 slot 选定值；
- **写回** = JSON 确定性 patch + 锁定标记（locked: true）。

### C.1 校验点 A（生成前）：五个技术组件

| # | 组件 | 输入 → 输出 | 用什么技术实现 |
|---|---|---|---|
| A1 | **意图显式化** | (I₀, D, A) → draft Ĉ | LLM few-shot prompting：prompt 中给 Ĉ 的 JSON schema + 2-3 个手工示例，要求模型只输出 JSON；用现有 `llm_output_utils` 做解析与 schema 校验 |
| A2 | **规则分歧检测** | draft Ĉ + 数据 profile → 候选歧义 slot 列表 | 纯 Python 规则函数（零 LLM 成本），逐条扫描 |
| A3 | **采样分歧检测** | (I₀, D, A) → k 版 Ĉ → 结构化 diff → 分歧 slot + 候选值集合 | self-consistency 采样 + JSON tree diff |
| A4 | **提问生成** | 歧义 slot + 候选值 → 选择题（文本+选项+可选缩略图） | 每类 slot 一个问题模板；chart type 类问题调用现有 renderer 渲染候选缩略图 |
| A5 | **回答写回与锁定** | 用户选择 → 更新后 Ĉ | JSON patch（按路径确定性写入），该 slot 标记 locked，进入下游 prompt 时标注"此字段已确认，禁止更改" |

**A2 规则检测的具体规则清单**（初版，可扩展）：

1. chart_intent 推断置信度低（解析器启发式分支命中多个候选类型）；
2. color_encoding 缺失或 palette 未指定（已知痛点，见 issue_color_encoding）；
3. interaction triple 引用的字段在目标视图的 encodings 中不存在（悬空引用）；
4. 字段类型与通道要求不匹配（如日期字段绑到 category 轴）；
5. zone 几何异常（重叠、越界）；
6. 交互规格 A 中声明、但 Ĉ 中未实现的 action（遗漏检测）。

**A3 采样分歧检测的算法**（对应"生成 k 个 Ĉ 检测歧义"）：

```
1. 用 temperature>0 让 LLM 独立生成 k=3~5 版 Ĉ（同一输入、同一 schema）
2. 按 worksheet name / interaction id 对齐 k 棵 JSON 树
3. 逐叶子路径收集值集合：path → {v₁, v₂, ..., vₖ}
4. 值集合大小 > 1 的 path → 分歧 slot
   且该 slot 的候选值集合 = 观测到的不同值 ←—— 直接成为选择题的选项！
5. 分歧频率（k 版中出现几种值）作为优先级分数
```

**关键设计：采样得到的候选值直接就是选择题选项**——问题"视图3是折线图还是面积图？"的两个选项，就是 k 版 Ĉ 里实际出现过的两种值。提问不需要模型再自由发挥，可控、可验证。

**A2+A3 的融合**：最终歧义 slot 列表 = 规则标记 ∪ 采样分歧，按（规则权重, 分歧频率）排序，超过阈值才提问（实现"该问才问"，HumanEvalComm 的教训）。

### C.2 校验点 B（生成后）：四个技术组件

| # | 组件 | 输入 → 输出 | 用什么技术实现 |
|---|---|---|---|
| B1 | **机器粗筛** | 生成项目 → 可疑点列表（含元素定位） | **完全复用现有 metrics 基础设施**：`playwright_runner.py`（渲染+截图）、`interaction.py`（episode 回放）、`data_binding.py`（数值抽查）；任何验证失败项 → 可疑点 |
| B2 | **元素点选反馈** | 用户操作渲染界面 → (元素选择器, 反馈类别, NL补充) | 渲染页注入 element picker（类 DevTools inspect，高亮 hover 元素，点击返回 DOM selector）；反馈菜单类别 = MV-Bench 四类错误 |
| B3 | **反馈路由** | (元素, 反馈, 用户期望) → {意图错→改Ĉ重新生成 ｜ 实现错→代码补丁} | 判定过程：由元素 selector 定位到 Ĉ 中对应 slot → 比对"Ĉ 当前值"与"用户期望值"→ 不一致=意图错，一致=实现错 |
| B4 | **修复与确认** | 路由结果 → 修复 → 前后对比 | 意图错：锁定新值后**局部重新生成**受影响视图组件；实现错：复用现有 `render_fix` / bugfix stage 的补丁机制；重新渲染后展示 before/after 截图请用户确认 |

**B3 路由的判定伪代码**：

```
def route(feedback, Ĉ):
    slot = localize(feedback.element_selector, Ĉ)   # DOM 元素 → Ĉ 路径
    if slot is None:
        return 实现错(代码补丁)          # contract 里没有对应意图，纯实现问题
    if Ĉ[slot].value != feedback.expected_value:
        return 意图错(写回 Ĉ[slot] = feedback.expected_value,
                      重新生成 slot 所属视图)
    else:
        return 实现错(代码补丁)          # 意图本来就对，是代码没写对
```

`localize` 的可行性基础：生成代码时每个视图组件的 props/命名由 Ĉ 驱动，DOM 元素与 worksheet 的映射在现有 `dom_snapshot.py` 里已经建立（评测时就是靠它提取各视图的渲染值）。

### C.3 模拟用户怎么自动化这两个校验点

| 校验点 | SimulatedUser 的实现 | 保真度来源 |
|---|---|---|
| A（选择题） | 收到问题 → 取出 slot 路径 → **查 ground-truth CTS 同路径的值** → 匹配选项作答 | 答案是查表而非生成，几乎不会错 |
| B（点选反馈） | 不模拟"人眼"，改为**程序化对比**：interaction episode 在 GT 参考实现与候选实现上各回放一遍，行为差异 + 数据绑定差异自动转成结构化反馈 | 反馈就是现有 metrics 的中间产物 |

### C.4 工程改动清单（对现有仓库）

| 改动 | 位置 | 量级 |
|---|---|---|
| 新增 `intent_alignment/` 包（IAA 主逻辑、分歧检测、提问模板、路由） | 新目录 | 主要工作量 |
| 新增 `UserInterface` 抽象 + `SimulatedUser` / `CLIUser` / `GUIUser` 三个实现 | `intent_alignment/` 内 | 中 |
| orchestrator 增加 checkpoint/resume（PipelineState 序列化） | `pipeline/orchestrator.py`、`pipeline/context.py` | 中 |
| 新增两个 `InteractionLoopStage`（校验点 A/B 各一） | `pipeline/stages/` | 小 |
| 生成 prompt 支持 locked 字段注入 | `kimi_vision_once/pipeline.py` 的 `_build_instruction` | 小 |
| GUI：渲染页 element picker + 反馈菜单（仅真人 study 需要） | 新前端小组件 | 中 |
| 复用不改：`playwright_runner` / `interaction` / `data_binding` / `dom_snapshot` / `render_fix` | `metric_results/metrics/`、`agent_pipeline/pipeline/stages/` | 零改动 |
