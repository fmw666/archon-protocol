# 五大支柱 —— 核心思想与真实设计

> 首页给出的判断是：基于会话的 agent 缺的不是*更大的模型*，而是一个**工程环境**；并列出了这个环境必须提供的五样具体东西。本页把这五样逐条展开成两层：**核心思想**（为什么存在）和**真实设计**（实际落地的文件、契约条款或脚本——不是那句营销话）。
>
> **读者**：已经看过 [10 分钟速览](/zh/concepts/overview)、想在读完整 [架构参考](/zh/concepts/architecture) 之前先看清每条承诺如何被机械兜底的人。下文每一条「真实设计」都指向一个已发布的文件，你可以在[完整源码](/source/)里打开它。

Archon 的诊断：模型提供推力，环境提供方向。五大支柱就是那个环境。每一条的设计都让*「退化成走过场」变得机械可检测*——一条「只有当 agent 记得时才能遵守」的规则被视为可靠性缺口，而不是规则。

| # | 支柱 | 一句话核心 | 实际所在 |
|---|------|-----------|---------|
| 1 | **认知循环** | 每次交付都走一个固定、机器校验的环——不是自由聊天 | [governance-contract.yaml](/source/contracts/governance-contract) 里的 `run_state` 状态账本 |
| 2 | **机械闸门** | 机器能强制的就别写散文。闸门失败即阻断 | 约束金字塔 + [archon-check](/source/scripts/archon-check-py) / 治理测试 |
| 3 | **持久状态** | 项目真相跨会话存活——且不能无声过期 | `manifest` · `drift` · `debt` · `memos` + 事件溯源记录 |
| 4 | **保全轴** | 承重规则被钉住，后续编辑无法悄悄抽干 | 契约里的 `critical_rule_substrings` 登记表 |
| 5 | **所有权契约** | agent 是负全责的工程所有者，不是建议箱 | [soul.md](/source/soul) §Ownership / §Technical Sovereignty |

---

## 1. 认知循环 —— 走的环，不是聊天

**核心思想。** 模型已经够强；它缺的是*每次交付都必须走的环*。Archon 固定了形状——`Perceive → Model → Act → Verify`——且在证据推翻当前结论时可回溯到任意更早的步骤。这是循环，不是瀑布。

**真实设计。**

- 三种唤醒**模式**对应三个命令文件：`/archon-plan`（谈*做什么*、*多大*）、[`/archon-demand`](/source/commands/archon-demand)（端到端执行一次有边界的交付）、`/archon-review`（drift 压力越过阈值时的独立全量复查）。
- 交付生命周期是一条硬序列：`Wake → Decision Gate → Plan → Execute → Validate → Close-Out → Git`。
- 这个环被**机械记账**，所以无法退化成表演。契约里的 `run_state.status_keys` 列出约 22 个状态行——`boot.soul_loaded`、`prescan.memos_scanned`、`decision.verdict_output`、`validate.validation_green`、`closeout.auditor_ran`……而 [`archon-run-state.mjs resolve-for-commit`](/source/scripts/archon-run-state) 在 commit 时以它们为闸门。`smart_skip_allowed` 白名单严格限定*唯一*可跳过的几行；跳过其余任何一行即违规。

> 一句话：把"思考流程"变成了一张有机器校验的检查表——退化成走过场的循环会在 commit 时被抓住。

## 2. 机械闸门 —— 失败即阻断，不靠散文

**核心思想。** 第二公理，*Constraints > Documentation*。文档是最弱的约束——只在被读到时有效。所以每条承重规则都被推到机器仍能强制的最低层。

**真实设计**——一座 5～6 级约束金字塔，越往下越强：

| 层 | 载体 | 失败方式 |
|---|------|---------|
| L0 | 类型系统（最严格模式） | 编译不过 = 不存在 |
| L1 | Linter / 静态扫描 | 违规 = 不能 commit |
| L2 | 测试 / editor 规则 / pre-commit | 红 = 不能交付 |
| L3+ | skill · ADR · 散文 | 只承载"为什么" |

具体闸门全在 [`governance-contract.yaml`](/source/contracts/governance-contract) 里，由 [`archon-check.py`](/source/scripts/archon-check-py) / `archon-check.sh` / 治理测试套件执行：

- **`file_budgets`** —— 每个热路径治理文件有硬行数上限（soul ≤ 310、drift ≤ 80、memos ≤ 30……）。超预算 `validate` 直接红，和类型错误同级——没有"软超标"宽限。Context 预算被当作*性能*约束，而非愿景。
- **`forbidden_substrings`** —— 废弃语义（如 "loaded on every boot"）列入黑名单；重新出现即失败。
- **Decision Gate 探针** —— 写任何代码前先跑三个机械探针：`radius_probe`（影响半径）、`soul_headroom`（soul 容量压力）、`modularity_probe`（是否把第二个职责轴塞进同一文件）。它们不阻断 Verdict，而是把结构事实摆上台面，让 owner 的任何 override 都带显式理由。
- **Lint-Rule Bridge** —— 每条自定义 lint 报错必须以 `→ Read <规范路径>` 结尾。L2 规则是被动的（只有被加载才生效）；L1 报错是 agent 必读的通道。于是 L1 违规在违规点主动拉起完整的 L2 规范。
- **Code Validation Gate** —— manifest 声明一条覆盖 lint + typecheck + test 的命令，交付前必须绿。红了就修——"先过后修"不存在。

## 3. 持久状态 —— 跨会话的项目真相

**核心思想。** 每个会话都从白纸开始。把项目真相写进文件，agent 启动时重新加载——但这带来一个更隐蔽的隐患：*谁保证这些文件没过期？*（这正是支柱 4 的同源机制——[漂移机制](/zh/concepts/drift-mechanism)——要回答的。）

**真实设计**——4 个热状态文件 + 事件溯源记录夹：

| 文件 | 角色 |
|------|------|
| `manifest.md` | *唯一*允许放项目特定内容的文件：概念词表、用户语言别名索引、当前状态、validation 命令、技术栈 |
| `drift.md` | 记忆衰减警报——带分级阈值的计数器 |
| `memos.md` | 干系人结论：否决、决策、澄清。每次 demand 预扫都读 |
| `debt.md` | 未解决责任——里程碑闸门读它 |

承重机制是 **ADR-22 事件溯源**（契约里的 `records_folder`）：

- 每个交付 / memo / debt 是 `.archon/{kind}/records/<ISO时间>-<slug>.md` 下一个不可变文件。
- 热文件（`drift.md` 等）是由 [`archon-records.mjs`](/source/scripts/archon-records) 生成的**投影**；sentinel 之间手改即失败。
- 这让 drift 计数变成对记录的**可交换求和**——两个并行分支各写 `+5` / `-3`，合并后仍收敛，无需手工重编号，也不会在共享 append-only 文件上产生 merge 冲突。
- 超过阈值的记录由 `archon-records-fold.mjs` 折叠进季度冷归档。

> 设计要点：*快照*类状态（"当前是什么"——manifest 当前状态、收敛范围、最近复查）故意留在记录**之外**。那里的并行编辑是真正需要人解决的语义冲突，不该 CRDT 化。

## 4. 保全轴 —— 承重规则无法无声消失（ADR-28）

**核心思想。** 进化是**双动作**的纪律，不是单向纠错环。大多数演化代价不是付在"加错了东西"，而是付在"为别的目的做的编辑，悄悄抽干了那条承重规则"。只做纠错的框架会朝着"上次坏的地方"漂移，丢掉那些解释"为什么别的没坏"的规则——因为这些规则只活在 agent 记忆里、没有机械锚点，而"没有失败可观测"意味着触发表永远不会触发。

**真实设计**——保全是结晶的*对偶*，且是**机械的、不是叙事的**：

- **结晶**问"这次交付教了什么该改 Archon？"→ 提升到更强载体（测试 / 规则 / skill / ADR）。
- **保全**问"这次依赖了什么不能被悄悄抽干？"→ 用**机械三件套**钉住锚点：① 临界规则登记表条目，② body-shape 测试，③ 可移植契约条款。
- 这张登记表是真实存在的：[`governance-contract.yaml`](/source/contracts/governance-contract) 里的 `critical_rule_substrings` 数组持有 40+ 条钉死的 substring，每条带 rationale，说明删了它会重现哪个失败模式。钉住的 substring 一旦缺失，`archon-check` 直接红。
- **Close-Out 强制给出保全答案**，二选一：`preservation: pinned(<锚点>+<测试>+<契约>)` 或 `preservation: none-this-cycle(<证据>)`——后者的证据必须写明扫描目标和动词。[`archon-claim-verifier.mjs`](/source/scripts/archon-claim-verifier) `--mode=preservation` 在 L1 校验它。
- **边界**：钉子是*绊线，不是墙*。你仍然可以删除一条钉住的规则——但删除必须是显式的（锚点、测试、契约条目一起删），绝不能无声 body-drain。这正是*进化*与*朝着上次修复漂移*之间的界线。

## 5. 所有权契约 —— 负责的所有者，不是建议箱

**核心思想。** 第一公理，*Ownership > Assistance*。项目是 agent 的，不是用户的。用户是表达意图的产品干系人；agent 是唯一的工程所有者——架构、技术选型、质量、后果全是它的责任。

**真实设计**——[`soul.md`](/source/soul) 的 §Ownership / §Autonomy Principles / §Technical Sovereignty 三节，配套机械保障：

- **自主原则**：不让用户思考。不提问、不摆选项菜单、坏了直接修而不是上报等指令。唯一例外是*产品方向*歧义（确认意图）——*技术*歧义永远不算。
- **技术主权**：用户说的是产品意图，不是技术指令。"用技术 X" 先在*本项目*评估其是否成立；不成立就带替代方案否决。绝不因为"用户说了"就交付已知技术债——烂摊子是所有者来收。唯一让步对象是声明的硬约束，而非偏好。
- **记忆即所有权**：每个干系人结论（批准 / 否决 / 推迟 / 转向）都成为一条 `memos` 记录，热索引在每次 demand 预扫加载。用户永远不该重复自己——重复意味着丢了上下文，那是所有权的失败。
- **分离 > 自审**（第五公理，且带牙齿）：执行者不能审自己的活。代码由主 agent 写，但复查交给独立的 **reviewer** 子 agent、知识捕获交给独立的 **capture-auditor**——因为在同一上下文窗口里，作者会合理化自己的产出（沉没成本偏见）。规则甚至要求子 agent 用*不同的模型家族*（`model_family: different-from-main`），因为同家族先验会把"独立判断"塌缩成"换个说法的自审"。[Blink Dispatch](/source/skills/blink-dispatch) 决定*何时*某个切片风险高到值得花一个子 agent。
- **沟通契约**：用户只看结果——交付时给产品结果、工作时静默、唯一主动通道是确认有歧义的产品意图。

---

## 下一步去哪

| 你现在想… | 阅读 |
|----------|------|
| 看完整结构参考 | [架构参考](/zh/concepts/architecture) |
| 深入理解 drift + 复查 | [漂移机制](/zh/concepts/drift-mechanism) |
| 通过真实的坑感受问题契合度 | [用户旅程](/zh/concepts/user-journeys) |
| 看每个决策及其权衡 | [架构决策（ADR）](/zh/concepts/decisions) |
| 读「为什么更强的模型并不能消除这种需要」 | [模型 vs 框架](/zh/concepts/model-vs-harness) |
