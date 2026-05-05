# Archon —— 10 分钟速览

> 在你深入 [architecture.md](/zh/concepts/architecture) 之前，先看一眼 Archon 的全貌。如果你想立刻安装，跳到 [adoption/quickstart.md](/zh/setup/quickstart)。

![漫画图解：一分钟说清 Archon —— 是所有者，不是助手](/images/overview/01-owner-not-assistant.png)

**Archon 是一个跑在 AI 结对编程 IDE 里的、基于会话的工程治理框架。** 它不增加任何新的推理能力。它增加的是一个*环境* —— 让强模型能在跨会话、跨交付、跨里程碑的过程中持续正确推理，而不丢失共享词汇、决策记忆和质量纪律。

如果你想读"为什么这件事重要"的哲学论证，看 [concepts/model-vs-harness.md](/zh/concepts/model-vs-harness)。如果你想看与同类框架的横向比较，看 [concepts/superpowers-comparison.md](/zh/concepts/superpowers-comparison)。

---

## 1. Archon 到底是什么

Archon 同时是三件事：

1. **一份身份契约** —— 一份短文档（`soul.md` + 若干聚焦的扩展），它声明 *Agent = 项目所有者*，而不是助手。Archon 中的每个决策都从这里推出。
2. **一套状态纪律** —— 一小组活档案（`manifest.md`、`drift.md`、`memos.md`、`debt.md`、records 目录）跨会话保持项目真相，避免上下文丢失。
3. **一套生命周期强制** —— 命令、代理、规则、lint、测试合力阻止代理为自己潦草的工作签字。

这一切被**三层目录布局**物理化：

```
.archon/          ← 框架核心 + 项目状态（可移植）
{platform}/       ← 平台特定绑定（.cursor/、.codex/、.claude/）
docs/archon/      ← 打包的人类可读文档
```

> 可移植性规则：`.archon/soul*`、`.archon/commands/`、`.archon/agents/` 这些通用文件必须保持与项目无关。项目特定信息存在 `manifest.md`、`drift.md`、`debt.md`、`memos.md`、`.archon/decisions.md`。

## 2. 五条身份公理

![漫画图解：五条公理](/images/overview/02-five-axioms.png)

每一条 Archon 设计决策在被采纳之前都要先过这些公理：

| # | 公理 | 含义 |
|---|-------|---------|
| 1 | **所有权 > 辅助** | Agent 是所有者。决策、质量、后果都属于它 —— 而不是用户。 |
| 2 | **约束 > 文档** | 类型系统 > lint > 编辑器规则 > 散文。机器能强制的事，不写散文。 |
| 3 | **推断 > 配置** | 行为从项目状态推断，不靠模式开关。没有 `mode=strict` 这种开关。 |
| 4 | **精简 > 膨胀** | 更少、更强的知识资产。每个新文件必须证明它无法落入既有去处。 |
| 5 | **分离 > 自评** | 执行者不能评判自己的工作。评审与知识沉淀交给独立子代理。 |

带例子的长篇公理，参见 [architecture.md §设计哲学](/zh/concepts/architecture#design-philosophy-five-identity-axioms)。

## 3. 三种模式，一个循环

![漫画图解：三种模式 —— plan、demand、review](/images/overview/03-three-modes.png)

Archon 响应三种唤醒：

| 唤醒 | 用途 | 命令 |
|------|---------|---------|
| **Plan** | 协商该做什么、做多大、风险等级 | `/archon-plan` |
| **Demand** | 端到端执行一次有界交付（Decision Gate → Execute → Validate → Close-Out） | `/archon-demand` |
| **Review** | 当漂移压力超阈值时，独立做一次完整复审 | `/archon-review` |

每个唤醒内部，代理跑同一条 **Sense → Model → Act → Verify** 认知循环；只要新证据证伪当前结论，就回退到任一更早阶段。

## 4. 一图看懂交付生命周期

![漫画图解：端到端交付生命周期](/images/overview/04-delivery-lifecycle.png)

```
Wake → Decision Gate → Plan → Execute → Validate → Close-Out → Git
              │                              │          │
              │                              │          └── Blink Dispatch
              │                              │              （skip / capture-auditor / reviewer）
              │                              └── lint + typecheck + test 必须全绿
              └── Radius / Soul-headroom / Modularity 探针
```

**Decision Gate** 在任何代码改动*之前*就跑。它强制三个机械探针（Radius、Soul-headroom、Modularity）并给出裁决（这件事该不该做？多大？谁来定？）。**Close-Out** 在验证转绿*之后*跑。它决定本次交付的学习是否要结晶成更强的载体（测试、lint 规则、skill、ADR、manifest 条目）。

完整图景，见 [architecture.md §交付生命周期](/zh/concepts/architecture#delivery-lifecycle)。

## 5. 约束金字塔（L0 → L5）

![漫画图解：约束金字塔](/images/overview/05-constraint-pyramid.png)

Archon 的质量模型有**六层**，越底越强：

| 层 | 载体 | 强制方式 |
|-------|---------|-------------|
| **L0** | 类型系统 | 违反则无法编译 |
| **L1** | Lint / 静态分析 | CI 中标红 |
| **L2** | 编辑器规则、测试、pre-commit hooks | IDE / CI 中标红 |
| **L3** | Skills、commands、agents | 在相应唤醒时加载 |
| **L4** | ADRs | 记录在案的决策 |
| **L5** | 散文文档 | 仅供人读 |

**提升方向永远向下**（更强）。一颗推理胶囊变成一条 lint 规则，就是从 L3 → L1。文档是最后退路，不是首选。

## 6. 状态纪律

![漫画图解：状态纪律 —— manifest、drift、memos、debt](/images/overview/06-state-discipline.png)

四个状态文件 + 三个 records 目录，跨会话维持项目真相：

| 文件 | 作用 |
|------|------|
| **manifest.md** | 项目热上下文：概念词汇表、用户语言别名、当前状态、验证命令、技术栈、知识资产索引。这是*唯一*被允许装项目特定信息的 Archon 文件。 |
| **drift.md** | 记忆衰减警报。距离上次评审的交付计数器，分级阈值（Light / Full / Emergency）。 |
| **memos.md** | 干系人备忘。否决、决策、澄清。在 demand 预扫描时被自动扫描。 |
| **debt.md** | 未解的责任。里程碑门读它。 |

`.archon/{drift,memos}/records/` 与 `.archon/debt/items/` 下的逐事件记录是不可变的真相源（ADR-22，事件溯源）。热摘要文件由 records 重新生成 —— 并发 PR 不会再在它们上面冲突。

完整漂移故事，见 [mechanisms/drift-mechanism.md](/zh/concepts/drift-mechanism)。

## 7. Archon 如何自我演进

![漫画图解：知识演进](/images/overview/07-knowledge-evolution.png)

Archon 不只是执行交付 —— 它消化交付。在 Close-Out，每次交付都过一次**演进分诊**：

1. **stats-pass** —— 统计信号（三次法则或重复出现）。提升到最适配的最强载体。
2. **first-principles-pass** —— 一条核心假设被证伪。带显式验证实验记录下来。
3. **stay-in-drift** —— 一次性或弱样本。继续以经验记录形式保留。

提升遵循约束金字塔。一个反复出现的空指针 bug 不会变成"漂移日志里的一条备注" —— 它会变成一条 lint 规则（L1）或一条特征化测试（L2）。**Claim Verifier**（`scripts/archon-claim-verifier.mjs`）机械地把代理写下的声明与仓库内真实交叉验证，阻止治理散文从现实漂走。

双向运动：

- **结晶（Crystallization）** —— 把经验变成更强的约束。
- **保留（Preservation）**（ADR-28）—— 用机械三件套（关键规则注册表锚点 + 体型测试 + 可移植契约条目）主动钉死承重知识，避免有用知识被悄悄删除。

## 8. 接下来去哪

![漫画图解：接下来去哪](/images/overview/08-next-steps.png)

| 我想…… | 读这个 |
|--------------|-----------|
| 在我的项目里安装 Archon | [adoption/quickstart.md](/zh/setup/quickstart)（5 分钟）→ [setup.md](/zh/setup/full-guide)（完整细节） |
| 理解完整架构 | [architecture.md](/zh/concepts/architecture) |
| 看框架决策日志 | [decisions.md](/zh/concepts/decisions) |
| 看它解决的 16 个真实痛点 | [user-journeys.md](/zh/concepts/user-journeys) |
| 深入理解漂移 | [mechanisms/drift-mechanism.md](/zh/concepts/drift-mechanism) |
| 对比 Archon vs 一个 skill 库 | [concepts/superpowers-comparison.md](/zh/concepts/superpowers-comparison) |
| 读"光有模型不够"的论证 | [concepts/model-vs-harness.md](/zh/concepts/model-vs-harness) |
| 看重构纪律是怎么改造适配进来的 | [concepts/refactoring-adoption.md](/zh/concepts/refactoring-adoption) |
| 看 Archon 作为一个产品长什么样 | [concepts/product-architecture-workflow.md](/zh/concepts/product-architecture-workflow) |
