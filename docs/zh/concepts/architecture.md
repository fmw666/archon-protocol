# Archon 架构

> Archon 是一个跑在结对编程 IDE（如 Cursor）里的、基于会话的 AI 工程治理框架。它不是 AI 助手增强插件 —— 它把 AI 代理从「按指令办事的工具」抬升为「对项目负完整工程责任的所有者」。
>
> **读者**：想看完整系统设计的贡献者与采用方。要 10 分钟速览，先读 [concepts/overview.md](/zh/concepts/overview)；要安装步骤，读 [setup.md](/zh/setup/full-guide)；要走一遍 Archon 处理的真实痛点，读 [user-journeys.md](/zh/concepts/user-journeys)。

## 设计哲学：五条身份公理

![漫画图解：Archon 身份公理](/images/architecture/archon-architecture-01-axioms.png)

Archon 中的每条设计决策都从这五条公理推出。任何外部实践在被采纳之前都要先过它们。

| # | 公理 | 含义 | 设计影响 |
|---|------|------|---------|
| 1 | **所有权 > 辅助** | Agent 是项目所有者，不是助手。决策、质量、后果都属于你。 | 代理自主做工程决策 —— 永远不让用户在 A 或 B 之间挑 |
| 2 | **约束 > 文档** | 类型系统 > linter > 编辑器规则 > 文档 | 机器能强制的事，不写散文 |
| 3 | **推断 > 配置** | 行为从项目状态推断，不靠模式开关 | 没有 `mode=harden` 这种配置开关 |
| 4 | **精简 > 膨胀** | 更少、更强的知识资产 | 创建新文件之前必须证明"为什么既有文件装不下" |
| 5 | **分离 > 自评** | 执行者不能评判自己的工作 | 知识捕获与完整评审委派给独立子代理 |

## 系统架构总览

![漫画图解：Archon 系统地图](/images/architecture/archon-architecture-02-system-map.png)

总览来看，Archon 有六条所有权泳道：**Soul** 定义身份，**Wake/Commands** 路由工作，**DOMAIN LENS** 聚焦一次需求并路由可复用能力需求，**Lifecycle** 强制门，**RUN-STATE v2** 证明提交就绪，**Knowledge Assets** 保留被晋升的学习。

交付生命周期摘要：`Decision Gate → Self-directed Execute → Validation Gate → Close-Out(9)` `(含 Blink Dispatch) → Git`。

### Domain Lenses vs Extensions

Domain Lenses 住在需求推理的内部；Extensions 住在生命周期边缘。

| 机制 | 范围 | 用于 |
|------|------|------|
| `.archon/domain-lenses/` | 一次交付的专业聚焦或可复用能力路由 | PM、QA、开发、设计、规划、架构、创意、艺术、最佳实践能力选择，或其他领域工具集 |
| `.archon/extensions/` | 项目本地的生命周期 hook | pre-scan、close-out、review、dashboard、demand-pool、工作流自动化 |

如果一项能力改变 **Archon 如何思考一次需求**，加 Domain Lens。如果它改变 **Archon 何时跑额外生命周期行为**，加 Extension。

### 机制边界

Archon 通过给每条机制指定一条所有权泳道来避免架构泥潭：

| 机制 | 主问题 | 边界 |
|------|------|------|
| `soul.md` + `soul/` | Archon 是怎样的所有者？ | 仅承载身份与纪律；项目事实住在 `manifest.md`、`debt.md`、`memos.md`、`.archon/decisions.md` 等项目状态文件。 |
| `.archon/domain-lenses/` | 一次需求该用哪条专业透镜或可复用能力路由？ | 每次交付一条透镜；通用工具卡内不放生命周期 hook、不变换人格、不放提供商手册、不让选择器拥有交付。 |
| `.archon/extensions/` | 项目本地生命周期行为何时跑？ | 围绕 pre-scan、close-out、review、dashboard 的 hook；不放领域推理包。 |
| `blink-dispatch` | 启动独立子代理评审值不值？ | 仅做分发决策；主代理仍拥有交付。 |
| Run-State v2 | 这次交付完整到可以提交了吗？ | 临时凭证与 staged-path 所有权；不是长期记忆。 |
| `drift.md` + `.archon/drift/archive/` | 交付了什么、学到了什么、评审压力够高了吗？ | 热交付索引、交付后评审、归档召回、评审压力；不是计划 backlog 或流程 wishlist。 |
| `governance-contract.yaml` + checkers | 哪些基线契约必须随 Archon 走？ | 仅可移植框架检查；项目特定策略归项目状态文件或本地叠加。 |

### 分层运行模型

![漫画图解：Archon 分层运行模型](/images/architecture/archon-architecture-03-layered-model.png)

Archon 最易理解的方式是把它当成一个认知操作系统：每一层接收更窄的信号，产出更强的工件，且不能从相邻层偷走职责。

| 层 | 载体 | 拥有 | 输入 | 输出 | 边界 |
|------|------|------|------|------|------|
| 思考宪章 | `soul.md` + `soul/` | 身份、公理、自主、评审纪律、演进原则 | 用户意图、已加载模式、项目状态摘要 | 判断框架与不可谈判约束 | 不能存项目事实、交付日志或领域工具集 |
| 世界模型 | `manifest.md` + `.archon/manifest/archive/` | 持久项目事实、用户语言别名、当前状态、验证命令、知识资产索引、最近评审摘要 | 已完成交付、项目变更、已校验的数值事实、干系人措辞、评审结论 | 热项目上下文 + 冷评审详情 | 不能变成流程日志或框架规则手册 |
| 记忆状态 | `drift.md`、`memos.md`、`debt.md`（热摘要），由 `.archon/{drift,memos}/records/` + `.archon/debt/items/`（事件溯源真相源，ADR-22）支撑 | 交付经验、干系人结论、未解责任、评审压力 | Close-Out、auditor/reviewer 发现、干系人决定 | 经验记录、评审触发、债务门 | 漂移不是 backlog；备忘不是日常交付日志；债务热索引必须保留门字段。热摘要由 records 自动重生 —— 并发 PR 不再在这些文件上冲突。 |
| 专业组织 | `.archon/domain-lenses/` | 一次需求的专业聚焦、可复用能力路由、有界原子工具，以及每个工具的 load-line 成本，让选择器在 `max_total_load_lines` 内完成选取 | 需求文本、registry 信号、manifest/skill 元数据候选、工具描述、透镜契约、声明的 `load_lines` 预算 | `domain_lens:`、选定工具 ID、可选的 `capability_selection` 资产包（必须含 `total_load_lines`） | 透镜不是 persona、不是生命周期 hook、不是导出的子代理、不是提供商手册、不是 soul 覆盖；工具数与 load-line 上限是 AND 关系 |
| 交付动作 | 命令、代码、文档、测试、脚本 | 对仓库的具体改动 | 判断框架、项目事实、所选透镜/工具、验证目标 | 改动的文件与 Close-Out 证据 | 执行不能自我批准或绕过验证 |
| 现实证明 | L0/L1 检查、manifest 声明的验证命令、可移植校验器 | 改动安全的机械证据 | 改动的文件与治理契约 | 绿/红验证结果 | 散文声明弱于可运行守卫 |
| 演进过滤 | Close-Out 评审 + `evolution_triage` / `evolution_evidence` | 区分噪声、统计信号与第一性原理信号 | 交付记录、验证结果、auditor/reviewer 信号 | `stats-pass`、`first-principles-pass` 或 `stay-in-drift`，附匹配证据 | 不能用统计通道晋升一次性偏好 |
| 结晶 | L0 类型、L1 测试、L2 规则、L3 skill/领域工具、L4 ADR、L5 manifest/debt | 把已学信号转化为最适配的最强载体 | 分诊结果与自测矩阵 | 更强的可复用约束或持久记录 | 不能制造平行运行时、daemon 或新状态泳道 |

流向是有方向的，但不是瀑布：用户意图被思考宪章收窄，由世界模型 + 记忆状态接地，由专业组织聚焦，由现实检查证明，由演进过滤筛选，并被结晶成下次交付更强的上下文。

边界检查：

- 如果一条事实或用户措辞映射在 boot 时就要知道，放 `manifest.md`；如果它只解释发生了什么，留在 `drift.md`。
- 如果一项能力改变一次需求如何被推理，用 Domain Lens；如果它在生命周期某点跑，用 Extension。
- 如果一条学习能机械检查，先把它提升到 L0/L1/L2，再写更多散文。
- 如果一条学习只有一份弱样本，留在漂移里 —— 除非它证伪了核心假设并命名了最小验证实验。
- 如果一项机制需要 daemon、外部协议 schema 或额外状态泳道，那就不是 Archon 原生演进。

层间交接契约：

| 交接 | 必需输出 | 失败条件 |
|------|------|------|
| 思考宪章 → 世界模型 | 一个能在当前项目状态上接地的判断框架 | `soul.md` 试图记住项目事实，或 `manifest.md` 被跳过 |
| 世界模型 + 记忆状态 → 专业组织 | 当前事实加上相关的过往决策、债务与漂移压力 | 所选透镜忽略已知项目状态、债务或干系人记忆 |
| 专业组织 → 交付动作 | 一条 `domain_lens:` 决定加上一组有界的所选工具 ID 或所选能力资产 | 多透镜混合、透镜行为像 persona、工具创建生命周期门、或选择器包替代了主代理所有权 |
| 交付动作 → 现实证明 | 改动的文件加上目标验证 | 执行自我批准、跳过验证、或把未证实的散文当证据 |
| 现实证明 → 演进过滤 | 绿/红验证结果加上交付证据 | Close-Out 在没有验证证据或 auditor/reviewer 上下文的情况下记录学习 |
| 演进过滤 → 结晶 | 一对匹配的 `evolution_triage` + `evolution_evidence` | 弱样本被当统计晋升、第一性原理声明遗漏被打破的假设、或漂移变成 backlog |
| 结晶 → 下次交付 | 在足够低的最低层位置一个更强的可复用载体 | 一条机器可校验的规则只停在散文，或一次性笔记变成永久机制 |

## 认知循环

![漫画图解：Archon 唤醒机制与认知循环](/images/architecture/archon-architecture-04-wake-loop.png)

代理的行为模型是一个**任意阶段都可以回退的循环**，不是瀑布：`Perceive → Model → Act → Verify → Perceive`。

- **Perceive**：热路径读 soul/manifest 必需章节，仅当需求触及时才加载冷参考章节
- **Model**：拆问题、形成计划
- **Act**：执行计划（写代码、改配置、更新文档）
- **Verify**：跑验证命令，确认结果符合目标
- 验证失败 → 回到 Perceive

## 唤醒机制

Archon 的设计目标之一是**零认知负担入口** —— 用户无需记任何命令名；说一句 "hi archon" 就激活工程角色。这要两层协同：

### 双通道入口

支持三条入口路径：自然唤醒（`hi archon ...`）、显式路由（`/archon demand: ...`）、直接命令（`/archon-demand ...`）。唤醒路径在路由前热路径读必需章节；所有路径汇合到同一条模式命令。

### 架构决定：规则层 + 命令层

| 层 | 文件 | 机制 | 职责 |
|----|------|------|------|
| 触发 | `archon-wake.mdc` | always-applied rule | 检测自然语言唤醒词，引导到路由层 |
| 路由 | `archon.md` | command | 分析意图或解析显式前缀，路由到目标模式 |
| 执行 | `archon-{plan,demand,review}.md` | command | 各模式的完整工作流 |

**为什么不用纯 Commands？** Commands 要求用户键入 `/` 前缀。如果统一入口只是 Command，"hi archon" 这种自然语言永远激活不了 —— 那是从系统能力（命令机制）出发设计而不是从用户工作流出发，是一种"由内而外"的盲点。always-applied 规则给每次对话加了 ~15 行，但只做模式匹配与路由 —— 真正的路由逻辑住在命令层、按需加载。

### 漂移预检

`/archon` 路由器的第 0 步在任何路由之前读 `drift.md §Current Value` 并与分级阈值比对。这是机械门（L1 测试：`governance.test.ts §Drift gate` 在漂移越过 emergency 而无后续评审重置行时标红），不是文档约定。三种结果：

| 状态 | 动作 |
|-------|--------|
| `drift ≥ emergency` | 暂停需求接入 · 强制路由到 review · 输出 `🔴 DRIFT EMERGENCY` |
| `drift ≥ full` | 除非输入前缀是 `review`，否则停止路由 · 输出 `🟠 DRIFT GATE` |
| `drift ≥ light` | 静默继续路由 · 在下次 medium/large 需求前插入 light review · 输出 `🟡 DRIFT NOTICE` |
| `drift < light` | 静默通过 |

理由：仅依赖文档的漂移预检经验上会被绕过（历史：drift 达到 full 阈值的 108% 时需求仍在执行 —— 由 ADR-9 解决）。

## 交付生命周期

![漫画图解：Archon 交付生命周期](/images/architecture/archon-architecture-05-delivery-lifecycle.png)

完整 `/archon-demand` 流：`Boot → Pre-Scan → Fast-Path? → Decision Gate → Verdict → Self-directed Execute → Validation Gate → 9-Step Close-Out → Version Control`。

**9-Step Close-Out** 在此有意只做摘要；命令文件拥有精确清单。在架构层面，重要的拆分很简单：执行内部是灵活的，而 Verdict、validation、Run-State、Blink Dispatch、drift、memory、git 仍是硬边界。

### 边界硬、过程软的执行

Archon 不硬编码代理在 `Verdict=proceed` 之后必须如何执行交付。固定的生命周期节点是**工程边界**，不是代理内循环的菜谱。

执行内部，代理拥有计划：自选工具、定步骤顺序、加临时辅助、依据证据修订思路、把所选 Domain Lens/工具当指引而非脚本流程。这是 Browser Harness 教训翻译到 Archon 语境：给模型一个宽广的动作空间与强反馈面，再仅约束保护项目完整性的边界。

硬边界不可谈判：写之前要 Verdict、判断前要先获取选定的项目事实与记忆、交付前要跑 manifest 声明的验证、版本控制前要 Run-State/commit 凭证、风险或漂移要求时要独立评审、只有当演进过滤判定可晋升时才有持久知识捕获。

### Fast-Path（折叠仪式）

合规的 trivial 交付（≤2 文件 · 无新模式/模块/依赖 · 无治理文件 · 无基础设施/认证/schema 改动 · 无用户可见行为改动）折叠结构化门并跳过判断密集的 close-out 步骤（auditor、memos、extensions）。漂移固定 +1 并被跟踪；一个周期内 fast-path 占比 > 60% 视为规避风险。见 soul/delivery.md §Delivery Fast-Path。

### 结构化门输出（Verdict / Close-Out）

Verdict（决策门出口）与 Close-Out 声明（closeout 阶段合规清单）产出机器可校验的输出，capture-auditor 把它当成生命周期合规维度来核验。门输出缺失或畸形是阻断性发现，不是软警告。这些输出过去叫 `GATE-1` / `GATE-2`；历史日志条目仍保留旧标签。

### Run-State 门

Run-State v2 把活动交付状态存在 `.archon/runs/<run_id>/state.json`，`events.ndjson` 作为 append-only 轨迹。这替换了旧版 `.archon/run.md` 的单例瓶颈：多次交付可以有各自的 run 目录，而 commit 期解析在多个 run 同时就绪时 fail-closed —— 除非 `ARCHON_RUN_ID` 显式给出。解析器还检查 staged path 所有权：staged 文件必须列在所选 run 的 `changedPaths` 中，否则 commit 被阻断。旧版 `.archon/run.md` 仅作为尚未发行 helper 的采用方项目的迁移回退。

### 交付状态数据流

每次交付会经过若干状态载体。它们故意分开，让没有任何文件同时承载交付期凭证与长期记忆：

| 阶段 | 状态载体 | 用途 | 生命周期 |
|------|------|------|------|
| Boot → Close-Out | `.archon/runs/<run_id>/state.json` | 跟踪 SOP 完成、改动路径与提交许可 | 临时；commit 后移除 |
| Close-Out 第 ⑤ 步 | `.archon/drift.md` + `.archon/drift/archive/*.md` | 记录交付摘要、交付后评审、复杂度评分、评审压力 | 热索引保持在行预算内；旧的完整行迁移到关键词索引的冷归档 |
| Manifest 同步 | `.archon/manifest.md` + `.archon/manifest/archive/*.md` | 记录持久项目事实、最近一次验证、当前里程碑、索引知识资产、归档的最近评审详情 | 热项目上下文；长评审/历史详情迁到冷归档 |
| 满足晋升阈值 | `debt.md` + `.archon/debt/archive/*.md` / `rules` / `tests` / `skills` / `.archon/decisions.md` / `docs/archon/decisions.md` | 承载重复失败、可强制约束、可复用实践或架构理由 | 项目 ADR 留 `.archon/decisions.md`；可复用框架 ADR 留 `docs/archon/decisions.md` |

经验法则：Run-State 证明交付可提交；漂移热索引记录最近事件、当前压力与归档指针；漂移归档为按需召回保留旧行；manifest 记录持久项目状态；债务热索引保持活动门字段可见，债务归档保留理由；rules/tests/skills/ADR 只接收被晋升的发现。

**Plan-mode 绑定**（ADR-11，自 2026-04-19）：Verdict 必须在任何写侧工具调用之前输出。Cursor 原生 Plan 模式（只读 + 写工具被平台拒绝）是这条规则的平台强制实现 —— "决策先于动作"的纪律从 L3 散文约定提升到 L2 平台能力。当会话在 Agent 模式下已经开始，规则降级为 L3 自律，Close-Out 记录 `Plan mode not used: <reason>` 用于长尾审计。

### 收敛门（里程碑级 demand 过滤）

当当前里程碑处于强制收敛中，`manifest §Current State` 声明一份 `Convergence scope: [<DEBT-IDs>]` 列表，列出下一次非豁免交付必须推进的债务条目。Verdict 步骤把每条进入的 demand 分类为 in-scope 或 out-of-scope；out-of-scope demand 收到 `Verdict=reject`，rationale 为 `"out of convergence scope"` —— 除非命中四种例外之一：

- **紧急评审整改**（emergency-reset 循环内的尾部修复）
- **L0/L1 门回归修复**（坏掉的 type/lint/test 门阻塞一切，所以修它永远 in-scope）
- **解锁声明范围所需的工具**（如范围债务依赖的 codegen 脚本）
- **用户覆盖** —— demand 文本含明确覆盖措辞（"override convergence" / "framework priority" 之类）；逐字引用进 Verdict rationale 并通过 `node scripts/archon-records.mjs new drift --type delivery --delta +N --summary "..."` 创建一条覆盖记录（≥ +1 drift）（依 ADR-22；热摘要自动重生，覆盖记录本身就是审计轨迹）

门由 `governance.test.ts §Convergence gate` L2 强制 —— 如果 manifest 声明了 `Convergence scope`，`archon-demand` 命令文件必须带 `**Convergence gate**` 子句和 `out of convergence scope` 拒绝短语，否则验证失败。这把里程碑级强制收敛从 L3 manifest 散文提升为机械过滤器。记录在 ADR-12。

**范围生命周期**：里程碑进入收敛期时填入，里程碑关闭时清空。`scope=[]` = "开放期" —— 门处于惰性。

### 漂移机械保底

close-out 第 ⑤ 步的自评复杂度受文件数下界约束：≥3 文件 = small (+2)；≥6 文件 = medium (+3)；≥10 文件 或 新模块/模式/依赖 = large (+5)。以 `max(self, floor)` 应用。当 floor 抬升 ≥2 时，记录一条调整说明。见 drift.md §Rules。

### 决策门

动手前必须回答三个问题：

| 问题 | 判断准则 |
|------|---------|
| **该不该做** | 真问题还是假设？有无无代码方案？ |
| **多大** | 爆炸半径（影响文件数）+ 可逆性（回滚成本） |
| **谁来定** | 工程决策由你；产品方向交给用户 |

当评估是"不要做"时 —— **拒绝需求并附理由与替代**。这是代理的责任。

![漫画图解：源码模块化探针 —— 决策门处的前瞻式轴检查](/images/architecture/archon-architecture-14-modularity-probe.png)

决策门接受三个机械 probe 作为 Verdict 之前的**输入**；每个 probe 是对 manifest 声明的 map 加上 changed-paths 候选集的确定性匹配，紧贴 Verdict block 上方一行：

| Probe | ADR | 它揭示什么 | Map 来源 | 输出 token |
|-------|-----|------------------|------------|--------------|
| Radius | ADR-23 | 一次交付触多少文件 / 模块；跨了哪些边界 | `manifest §Module Boundary Map` | `radius_probe: files=N\|modules=N\|crosses=[...]` |
| Soul-headroom | ADR-23 扩展 | 当 changed-paths 与 soul 相交时，揭示 cap 压力（`<current>/<cap> = <pct>%`）；≥95% 强制先压缩或显式扩 cap 的 ADR | `manifest §Context Budget` 中声明的 soul cap | `soul_headroom: <current>/<cap> = <pct>% (<remaining> lines)` |
| **Modularity** | **ADR-29** | 当 changed-paths 创建新文件或命中已声明的 modularity glob 时，揭示本次变更是否会把第二条概念轴塞进一个已经承担一条的文件（`fan-out-needed` → 前置拆分提交 OR 更新 map 的 Verdict） | `manifest §Source Modularity Map` | `modularity_probe: target=<path>\|axes=<axis-cell,...>\|status=aligned\|fan-out-needed\|undeclared` |

三个 probe 共享一条契约：**机器检查边界，所有者来决策**。Probe 永远不阻断 Verdict —— 它在决策点把结构事实暴露出来，让覆盖带上明确理由而不是无声遗漏。Modularity 尤其是前瞻压力：它在文件累积概念轴债务之前问"如果我加这段内容，是否会把第二条轴塞进已经承担一条的文件？"，而不是等干系人开口"这是不是变得难管理了？"之后才问。

### 验证门

交付后，必须跑 manifest 声明的验证命令（一般是 lint + typecheck + test）。**红了就修绿 —— 没有"先过、后改"。**

### Close-Out 中的子代理委派

第 ② 步是 Blink Dispatch：主代理在任何 close-out 子代理启动前做确定性薄切片分诊。高风险切片 dispatch 给独立子代理；低风险切片记录 `subagent_dispatch: skip:<reason>`。这保留了 Archon 的分离原则，同时机械型低风险交付不必付子代理延迟。见 [子代理委派模型](#sub-agent-delegation-model)。

## 约束金字塔

![漫画图解：Archon 约束金字塔](/images/architecture/archon-architecture-06-constraint-pyramid.png)

Archon 的质量保障不靠文档 —— 文档是最弱的约束。每条值得遵守的规则都被推到**尽可能强的层**：

| 层 | 载体 | 强制力 |
|------|------|------|
| L0 | 类型系统 | 编译不过 = 不存在 |
| L1 | Linter / 测试 | 违规 = 提交不了 |
| L2 | 编辑器规则 | 编辑期提示 |
| L3 | Skill 文档 | 按需加载 |
| L4 | ADR | 历史可追 |
| L5 | Manifest | 上下文同步 |

**黄金法则**：机器能强制的事不写散文。文档只承载机器无法表达的"为什么"和设计意图。

### 约束成熟度与 Lint-Rule 桥

每条约束有升级路径：`Discovered → SHOULD (docs) → MUST (lint/test)`。一条本可机械校验的约束停在文档层 = 可靠性缺口。

**Lint-Rule 桥**关闭 L2 的被动性缺口：lint 错误信息含 `→ Read <rule-file-path>`，违规时强制 AI 加载完整规范。L1 主动触发 L2。完整规范见 soul.md §Guardrail System。

## 知识演进系统

![漫画图解：Archon 知识演进与预测](/images/architecture/archon-architecture-07-evolution-forecast.png)

Archon 不是静态框架 —— 它在每次交付后**累积并强化**它的知识。

### 交付演进循环

Archon 把外部自演进思想翻译进它自己的约束金字塔。它不抄外部协议格式、也不跑 daemon；它把交付经验晋升到更强的本地载体：

交付经验经过 `Delivery Event → Evolution Signal → Promotion Decision → Stronger Vehicle`。

| 阶段 | Archon 载体 | 规则 |
|------|------|------|
| Delivery Event | `drift.md` 条目 | 每次完成的需求留下可审计的交付记录 |
| Evolution Signal | 交付后评审 + auditor/reviewer 发现 + 验证失败 | 一次性观察留在漂移 |
| Promotion Decision | Close-Out 判断 | 仅晋升重复的、可强制的、可复用的或架构性的发现 |
| Stronger Vehicle | test / rule / skill / domain tool / ADR / debt / manifest | 用最适配的最强层；不创建平行演进系统 |

**翻译，不要照搬**：Archon 可以借鉴紧凑课、可审计事件、信号去重、晋升阈值的概念。它**不能**照搬外部 GEP/Gene/Capsule/Event schema、装自演进 daemon、依赖 Hub/worker 网络，或把 `drift.md` 变成 backlog。

### 保留轴（结晶的对偶）

![漫画图解：Archon 保留轴 —— 演进的双向运动（结晶 + 保留）](/images/architecture/archon-architecture-12-preservation-axis.png)

依 ADR-28，演进是**双向运动**纪律。结晶捕获该改的（新知识 → 更强载体）。保留捕获该留的（承重知识 → 钉死锚点），让后续编辑无法悄悄把它抽空。只把第一种运动当"演进"会得到一个朝最近被打破的事漂移的框架 —— 把那些解释为什么其他事没破的规则丢掉。

| 运动 | 问题 | 载体 | 哪里跑 |
|--------|----------|---------|---------------|
| 结晶 | "这次交付教会的什么应该改 Archon？" | 新/更新的 test、rule、skill、domain tool、ADR、debt、manifest 条目 | 触发表 + Close-Out 交付后评审 (a)(b)(c) + capture-auditor §Knowledge Capture |
| 保留 | "这次交付依赖了什么、不能悄悄被抽空的？" | 钉进 critical-rule registry + body-shape 测试 + 可移植契约条目 | Soul §Preservation Axis + soul/review.md §Preservation Signals + Close-Out 交付后评审 (d) + capture-auditor §Preservation Scan + plan §Proactive Scrutiny preservation probe |

保留钉是绊线，不是墙：被钉条目仍可被移除，但移除必须是**显式、可审计**的编辑（同时删钉、删测试、删契约条目），不是无声 body-drain。在散文里说"这条规则很重要"不是保留 —— 那恰是保留要防的失败模式。

#### 保留加固 —— 机械守卫（DEBT-074..077 关闭）

四条机械守卫防止保留退化为仪式，在引入交付的 Full review 暴露出缺口后注册为 L1 lint：

| 守卫 | 它捕获什么 | 实现 |
|---|---|---|
| `none-this-cycle(<evidence>)` 实质门 | 摩擦小的逃逸阀 —— Close-Out 清单上空的或挥手式证据 | `archon-claim-verifier.mjs --mode=preservation` 要求证据 ≥40 字符 + 扫描动词 + 扫描目标 |
| 首过退化守卫 | 引入交付把自己加进去的内容自分类为 `pin-worthy-now`（周期还没开始） | 同 `--mode=preservation` 要求当 pinned 锚点出现在同一 diff 中时显式带"first pass / introducing delivery / pinned-bootstrap"框架 |
| 头部锚点 body-shape 声明 | 头部级被钉而 body 是无声可抽空的（DEBT-077 rule-of-3 3/3 停滞） | critical-rule registry 中每条头部 shape 条目**必须**声明 `body_shape: 'has-body-shape-test' \| 'header-only' \| 'token-only'`；缺声明 L1 失败 |
| Capture-auditor 协议步骤对齐 | 不 renumber 就插新步骤（如两个步骤"4"） | L1 测试断言带号协议步骤 == 声明的 jobs + 2 个 setup 步骤、连号 1..N |

这些守卫不阻止保留保持简单 —— 它们防止简单形式悄悄退化。累积频率面（多个周期里多个 `none-this-cycle` Close-Out）一旦实质门到位就成为 Full review 信号；没有这道门，所有证据看起来一样，信号就崩了。

### 演进自测矩阵

把交付观察晋升到更强载体之前，Archon 自测晋升：

| 自测问题 | 必需证据 | 晋升失败条件 |
|------|------|------|
| 信号是真的吗？ | 漂移中命名了来源：交付后评审、auditor/reviewer 发现、验证失败、或重复模式 | 观察只是偏好、直觉或一次性不便 |
| 目标是最适配的最强载体吗？ | 所选载体匹配约束金字塔：可强制约束 → test/rule，可复用实践 → skill/domain tool，架构 → ADR，未解风险 → debt，持久项目事实 → manifest | 一条机器可强制的规则只停在散文，或一次性笔记变成永久资产 |
| Archon 原生边界完好吗？ | 没引入外部 schema、daemon、Hub/worker 依赖或新状态载体 | 改动抄了外部协议或把 `drift.md` 变 backlog |
| 回归被守住了吗？ | 存在 L1 test/rule，或漂移显式记录守卫为何还不适用 | 被晋升声明既无机械守卫也无理由 |

### 演进信号分诊矩阵

Archon 通过两道门过滤交付经验：统计抑制日常噪声；第一性原理保留稀有结构信号。

| 分诊结果 | 晋升规则 | 必需证据 | 默认载体 |
|------|------|------|------|
| `stats-pass` | 当信号重复、可重现、代价高、跨上下文且可机械强制时晋升 | 至少 2-3 条相关 drift/auditor/validation 样本；无单样本例外 | test / rule / skill / debt |
| `first-principles-pass` | 仅当一次性信号证伪了核心假设或暴露约束金字塔缺口时晋升 | 命名了被打破的假设、它涉及的原则、最小验证实验 | ADR / test / skill |
| `stay-in-drift` | 保留偏好、直觉、本地不便或弱证据流程噪声 | 漂移条目记录信号为何还不够强 | 仅 drift |

Close-Out 晋升决定必须把这些标签之一记录为 `evolution_triage=<stats-pass|first-principles-pass|stay-in-drift>`。一个无标签的被晋升发现视为未分诊。

仅有分诊标签还不够。Close-Out 还必须记一个紧凑证据形：

| 分诊结果 | 证据形 |
|------|------|
| `stats-pass` | `evolution_evidence=stats(samples=<n>, source=<drift\|auditor\|validation>, action=<test\|rule\|skill\|debt>)` |
| `first-principles-pass` | `evolution_evidence=first-principles(assumption=<broken assumption>, experiment=<smallest validation>)` |
| `stay-in-drift` | `evolution_evidence=drift(reason=<why not promoted yet>)` |

分诊标签与证据种类必须匹配：`stats-pass` 仅配 `stats(...)`，`first-principles-pass` 仅配 `first-principles(...)`，`stay-in-drift` 仅配 `drift(...)`。

### 架构预测循环

Archon 也在每次非 fast-path 交付之后预测下一次最可能的架构压力。预测是紧凑的，写在交付记录里，不是另一个规划系统：

预测命名三件事：最可能的下一个风险、若该风险落地下一项有用优化、置信度（`low|medium|high`）。它不是 backlog、不是 roadmap，也不是绕过下一次决策门的许可证。未来的需求仍从新鲜项目状态开始，必须先过 Verdict 才能开工。

### 动态验收准则

验收准则不是静态文书。当一次交付引入新技术、架构层、模块、模式或改变验证需求的优化时，Archon 把它当成验收契约 delta。同一次交付必须要么更新 manifest 的里程碑准则、扩展验证命令、加或更新一个 test/rule/skill 守卫，要么显式记录 `Acceptance criteria delta: no-change`。

这让契约保持动态而不变得非正式：验收标准可以演进，但演进必须落到 `manifest.md`、tests、rules、skills 或 validation，而不是仅散文意图。

### Trigger → Capture → Crystallize

触发信号包括 hit-a-wall pivots、重复模式、外部反馈、新技术、商业洞察、被发现的概念与约定。每条信号都要按约束金字塔评估，仅当存在更强载体时才晋升。

### 推理胶囊与反合理化

在 hit-a-wall pivot 上，成功调试路径（`Symptom → Root Cause → Fix`）嵌入相关 skill 文档 —— 不是单独文件。每个 skill 嵌入的反合理化表（Red Flags）在代理合理化偷工减料时即时纠错。详见 soul/delivery.md §Reasoning Capsules。

## 子代理委派模型

![漫画图解：Archon 子代理委派](/images/architecture/archon-architecture-08-subagent-delegation.png)

Archon 的核心架构原则之一：**执行与判断必须分离。**

主代理仍是项目所有者。**Blink Dispatch** 决定 close-out 是否需要 `capture-auditor`；漂移/手动评审启动 `archon-reviewer`；广能力/工具集请求可能启动只读选择器子代理，主代理加载完整 skill 或工具卡之前先返回紧凑的资产选择包。子代理建议、审计或汇总选择；它们不接管交付的所有权。

### 委派阈值与代价意识

完整委派准则与代价意识原则见 soul/delivery.md §Lifecycle Hooks。关键规则：机械检查留作自审；判断性评估（知识价值、偏差校正）值得委派。

能力选择是上下文预算委派，不是生命周期门、也不是导出的 agent 文件。仅在 `Verdict=proceed` 之后、且 Level 1 domain-tool 元数据加 manifest/平台 skill 元数据指向多个可信候选资产时，或读取完整候选资产会挤压主代理工作上下文时，使用通用只读子代理。选择器输出是建议性的；主代理仍执行 Verdict、加载所选资产、执行交付、验证结果并 close-out。

## 状态管理

![漫画图解：Archon 状态与记忆模型](/images/architecture/archon-architecture-09-state-memory.png)

Archon 用三份活文件管理项目状态，每次交付后自动更新。

![漫画图解：每事件一文件、永不冲突 —— records-folder](/images/architecture/archon-architecture-11-records-folder.png)

**依 ADR-22 records-folder**，三份事件流状态文件（`drift.md` / `memos.md` / `debt.md`）是**热摘要**，由各自 records 自动重生：

| 热摘要 | Records 真相源 | Sentinel 区段 | 帮手命令 |
|---|---|---|---|
| `.archon/drift.md` | `.archon/drift/records/<ISO8601>-<slug>.md` | `current-value`、`log` | `node scripts/archon-records.mjs new drift --type delivery --delta +N --summary "..."` 然后 `regen drift` |
| `.archon/memos.md` | `.archon/memos/records/<ISO8601>-<slug>.md` | `hot-memos` | `... new memos --topic "..." --conclusion "..." --source "..."` 然后 `regen memos` |
| `.archon/debt.md` | `.archon/debt/items/DEBT-NNN-<slug>.md` | `active-debt` | `... new debt --id DEBT-NNN --severity ... --status pending --deadline ... --source "..." --summary "..."` 然后 `regen debt` |

sentinel 之间的热行**永不手编**：创建新 record 文件，然后 `npm run archon:records:regen <kind>` 确定性重写热摘要。`npm run validate` 在热摘要与 records 文件夹不一致时标红。

这解决了**并发 PR 冲突** —— 多个云代理并行工作时，单文件 append-only 治理状态会立刻撞上：不同分支写不同文件名（无文本冲突）；合并后重生器算出唯一的热摘要（无整数计数器歧义、无 `Threshold: X→Y` 不可交换叙事）。

下面的单文件表示仍是状态的**概念模型**；records-folder 是它的物理实现：

### manifest.md —— 项目热上下文

| 区段 | 内容 |
|------|------|
| Product | 产品定义、核心流程、商业模式 |
| Concept Glossary | 产品特定术语（术语 + 项目含义 + ≠ 通用含义） |
| User Language Index | 干系人措辞、别名、昵称映射到规范的项目工件。行格式：`User Phrase(s)` ` · ` 分隔 · `Canonical Target` = 工件类 + 标识 · `Lookup` = 路由·文件·锚点指针。歧义规则：当措辞解析到不同目标时分行，而不是合并。`/archon-demand` Pre-Scan 每次需求都查这一节（见 §Stakeholder Memory） |
| Tech Stack | 框架、版本、依赖 |
| Validation Command | 具体的 lint + typecheck + test 命令 |
| Git Strategy | 提交模式（auto/prompt/off）+ 分支模型 |
| Directory Structure | 完整文件树 |
| Knowledge Asset Index | 所有 rules/skills/ADR 的索引 |
| Milestones & Acceptance | 硬验收准则 —— 全部勾选 = 完成 |
| Current State | 活动里程碑 + 已知问题 + 紧凑的最新评审指针 |
| Stakeholder Memos | 指向 `.archon/memos.md` 热索引的指针 |

长的最新评审详情归档到 `.archon/manifest/archive/<year>-Q<N>.md`；保持热 manifest 行简短，并在 `Current State` 保留最新验证目标。User Language Index 保持紧凑：它是重复干系人措辞的查表，不是对话记录。

**角色**：区段域当前状态源，仅当路由需要项目上下文时才热路径读。**唯一允许**含项目特定内容的 archon 文件。

### drift.md —— 认知漂移计数器

跟踪代理认知模型偏离项目现实的速率。每次交付按认知复杂度计 +1 到 +5，下界由机械保底约束（见上 §漂移机械保底）。**三级触发**替换原始二元门：

| 级别 | 阈值 | 范围 |
|------|-----------|-------|
| Light | drift ≥ 6 | 仅机械健康审计（无 reviewer 子代理）· 释放 2-4 点 · 会话内 |
| Full | drift ≥ 12 | 原始完整流程 · reviewer 子代理 · 重置到 0-3 |
| Emergency | drift ≥ 20 | 暂停需求接入 · full + 盲点根因 + 强制整改计划 |

**动态阈值**：随项目阶段平移（建设密集 = 容忍度更高；质量收敛 = 更紧），从 manifest Current State 推断而无需配置开关。

完整设计动机见 [mechanisms/drift-mechanism.md](/zh/concepts/drift-mechanism)。

### debt.md —— 技术债登记

`Deferral = register + deadline. Unregistered = nonexistent = unmanaged.` 每条有 ID、来源、严重度、deadline、状态。里程碑关闭前，所有 `milestone-close` deadline 项必须 `resolved`。

`debt.md` 是热门索引，不是散文档案。它让 `ID`、`Severity`、`Deadline`、`Status` 在里程碑/评审门处可见；完整来源、触发细节、处置理由住在 `.archon/debt/archive/<year>-Q<N>.md`。

## 干系人记忆

解决的问题：基于会话框架的内生缺陷 —— **每次启动都从白板开始**。一个项目所有者应记得跟干系人讨论过什么。同一问题被问两次 = 第一次的结论丢了 = 所有权失败。

### 记忆架构

例：干系人问到一次大架构迁移而 Archon 拒绝并给出理由，close-out 把结论存进 memo。后续会话 pre-scan memos，召回上次决定，避免让用户重复同样上下文。

### 三层实现

| 层 | 位置 | 职责 |
|----|------|------|
| **原则** | soul.md §Ownership | "用户不应重复自己 —— 重复 = 上下文丢失 = 失败" |
| **入口** | archon-demand §Pre-Scan | 收到需求后，在 memos、决策记录、manifest User Language Index 中搜索干系人别名；命中 → 静默解析（可选地补一句 `"我们项目里把它叫 X。"`）并主动引述历史；近似命中 → 记录 `uli_candidate: <phrase> → <target>` 供 Close-Out 晋升 |
| **出口** | archon-demand §Close-Out 第 7 步 | 把有决策价值的结论写进 memos（拒绝/延期/方向确认/优先级变化） |
| **存储** | .archon/memos.md + memos-archive/ | 热索引：紧凑指针；归档：含 `Archived On` 的完整理由 |

### 记忆分类

不同记忆类型有不同持久载体。干系人 memo 是轻量热索引，由冷归档支撑；重型决策被晋升到更强载体：

| 类型 | 载体 | 生命周期 | 启动时加载？ | 例 |
|------|------|---------|-----------------|------|
| 交付记录 | drift.md | 按周期压缩 | 是 | "质量门通过；发布压力下降" |
| 项目架构决策（正向） | `.archon/decisions.md`（ADR） | 永久 | 按需 | "首个里程碑用托管数据库平台" |
| 项目架构决策（负向） | `.archon/decisions.md`（Negative ADR） | 永久（含重审条件） | 按需 | "拒绝整体框架迁移直至证据变化" |
| 框架架构决策 | `docs/archon/decisions.md` | 永久 | 按需 | ADR-20 Archon-native Evolution Loop |
| 干系人结论（热） | memos.md | ≤5 紧凑指针 | 区段域 | "迁移被拒"、"本地化延期" |
| 干系人结论（冷） | memos-archive/`<year>-Q<N>.md` | 季度分区 · 永久归档 | 否 —— 关键词命中按需加载 | 较老的 auth 边界决策 |

### 修剪、冷归档与晋升

Memo 热上限：**5 条紧凑条目**。完整理由**迁到 `memos-archive/<year>-Q<N>.md`**（不删）。每个归档文件顶部带关键词索引；需求 pre-scan 扫关键词索引（不扫完整正文），仅在关键词命中时整文件加载该归档。

迁移前检查：

- 跨项目长期价值的结论？→ **晋升**到更强载体（ADR / skill / manifest 区段），再归档
- 过期或被取代的结论？→ 加 `superseded by <target>` 注归档

### 记忆层合并（反向结晶）

结晶把**新**知识移入资产（触发表）。合并把**累积**知识移入更强载体；在 full review Phase 4 与 reviewer 子代理 §Framework Completeness 步骤中跑。

| 来源信号 | 合并目标 |
|---------------|---------------------|
| 已解决债务带可泛化修复路径 | 新或更新的 skill |
| 周期内重复 ≥3 次的漂移日志模式 | ADR 或编辑器规则 |
| 被 ≥3 次交付引用的稳定 memo | Manifest 区段或 ADR |
| 一季内被召回 ≥2 次的归档 memo | 晋升回热 memo 或到 manifest |

### 设计边界

- **是**：结论级记忆 —— 讨论了什么、何时、决定了什么、为什么
- **不是**：对话级记忆 —— 不存对话流（那是 agent transcript 的活，按需可取）
- **不是**：完整历史 —— 例行交付记录由 drift 承载；memo 只记有决策价值的结论
- **强制**：流程级（demand 步骤），不是机械（lint 检测不到遗漏）。与 L3-L5 约束金字塔层级一致 —— 依赖执行者读且遵守

## 反膨胀机制

![漫画图解：Archon 可扩展性与卫生](/images/architecture/archon-architecture-10-extensibility-hygiene.png)

Archon 的治理文件也会膨胀。四道防线：

| 防线 | 机制 | 时机 |
|------|------|------|
| **预防** | 创建说明：创建前必须回答"既有文件能不能装下" | 创建时 |
| **预防** | 治理比下界：治理文件 / 源文件 在 **[0.1, 0.5]** · governance.test.ts 断言 | 持续（比例下界捕捉部落知识） |
| **预防** | 上下文预算表：每文件硬行上限在 manifest.md §Context Budget 声明 · governance.test.ts 断言 | 持续 |
| **回溯** | 膨胀 → 拆；冗余 → 合；陈旧 → 删 | 评审时 |
| **自动** | 漂移日志压缩：热文件超 70 行时把旧的完整行移到归档 | 评审时 |
| **自动** | Memos 冷归档：完整理由迁到 `memos-archive/<year>-Q<N>.md` 而非删除 | 热上限超出时 |

### Claim 校验 —— "said vs truth"族（ADR-27）

![漫画图解：Archon claim verifier —— 提交门处的机械事实核查](/images/architecture/archon-architecture-13-claim-verifier.png)

治理散文可能悄悄偏离仓库：凭记忆引用的测试数、缺血缘的借鉴概念、自引的 soul 编辑、悄悄触发的 trigger。依 ADR-27，单一校验器 `scripts/archon-claim-verifier.mjs` 在统一的 `[claim-verifier:<mode>] <FAIL|WARN>: <file> — <msg>` 报告格式下承载四种模式：

| 模式 | 捕获 |
|------|---------|
| `numeric` | 治理文档或 skill 散文里跟仓库不一致的数字声明（如测试数、文件数、bundle 大小） |
| `borrowed` | ADR 或漂移行里的借鉴概念声明缺血缘行（来自哪个外部样本、哪个 commit） |
| `self-cite` | 把 `soul.md` / `soul/*.md` 引为权威而无独立来源的编辑 |
| `missed-trig` | Close-Out 声称某 trigger 触发但 drift 或 records 中无对应证据 |
| `preservation` | Close-Out Preservation 行的 `none-this-cycle(<evidence>)` 缺实质扫描动词 + 扫描目标（≥40 字符），以及在同次交付钉同次锚点而无显式"first pass / introducing delivery"框架的首过退化引导 |

校验器接入 `npm run validate`（错误 fail closed、警告浮现）与 pre-commit hook。可移植 `archon-check.py` 仍是采用方契约校验器；本校验器是创作时的逐次扫描 —— 两者不重复。

## 自反思机制

Archon 不仅治理代码，还治理自身。完整机制见 soul/review.md §Reflection & Proactive Scrutiny：递归原则应用、四个强制主动问题、已知盲点模式表。

## 模块化 Soul 加载

认知核心拆为**一个区段域核心 + 两个模式特定扩展**，让永久上下文税低，同时保留每模式的完整规范深度。

| 文件 | 内容范围 | 加载者 | 预算 |
|------|---------------|-----------|--------|
| `soul.md` | Ownership · Core Axioms · Guardrail System · Knowledge Hygiene · Evolution（含 ADR-28 Preservation Axis）· Persona · Sub-Agent Independence（通用原则） | 启动与各模式按需区段热路径 | 310 行 |
| `soul/delivery.md` | Reasoning Capsules · Lifecycle Hooks · When to Escalate · Delivery Fast-Path · Debt Tracking · Product Quality | 仅 `/archon-demand` | 150 行 |
| `soul/review.md` | Reflection & Proactive Scrutiny · Review Tiering · Memory Layer Consolidation | `/archon-plan` 与 `/archon-review` | 150 行 |

**为什么拆**：`soul.md` 承载通用判断，但热路径只读当前路由所需的章节。仅一个模式用的章（交付生命周期·评审反思）变成各模式扩展。原拆分实测影响：启动路径缩 ~40%·demand 路径 ~12%·plan/review 路径 ~23%；区段域热读进一步降低稳态税而不削弱规范。

**锚点完整性**：`governance.test.ts § Soul anchor consistency` 扫命令、agents、extensions 中每条 `soul[/delivery|review].md §X` 引用，断言每个锚点解析到真实标题。重构核心或扩展时本检查自动失败直至交叉引用更新。

完整理由见 decisions log 的 ADR-10。

## 解耦模型

Archon 的通用文件可直接拷贝进任何新项目：

| 可移植文件 | 角色 | 含项目特定？ |
|---------|------|-----------|
| soul.md | 认知核心（区段域热路径） | ❌ |
| soul/delivery.md | 交付模式扩展（demand 加载） | ❌ |
| soul/review.md | 评审模式扩展（plan + review 加载） | ❌ |
| archon.md（命令） | 统一入口 + 意图路由 | ❌ |
| archon-wake.mdc（规则） | 唤醒触发 | ❌ |
| archon-demand/plan/review.md | 工作流 | ❌ |
| archon-reviewer/capture-auditor.md | 子代理 | ❌ |
| archon.mdc | 解耦规则 | ❌ |
| drift.md rules section | 漂移机制 | ❌ |
| **manifest.md** | **项目上下文** | **✅ 唯一** |
| drift.md log section | 交付记录 | ✅ |
| debt.md registry | 技术债 | ✅ |

**规则**：通用文件不得含具体技术名、文件路径、shell 命令、包名或度量数字。见平台规则目录中的 archon 解耦规则。

## 扩展点

Archon 的核心生命周期暴露**固定扩展点** —— 项目特定能力挂在这些点上，不修改核心文件。这是插件机制：建目录即装、删目录即卸。

### 架构

通用核心暴露固定 socket；项目特定扩展插进这些 socket 而不改核心文件。扩展名留在通用核心之外。

### 生命周期点

命令在以下固定点扫 `.archon/extensions/`。每个扩展声明它订阅哪些点：

| 点 ID | 命令 | 何时 | 可用上下文 |
|----------|---------|------|-------------------|
| `demand.pre-scan` | archon-demand | 加载 memos 后、决策门前 | 需求文本、memos、manifest |
| `demand.close-out` | archon-demand | 干系人 memos 后、git 前 | 交付摘要、verdict、改动文件 |
| `plan.perception` | archon-plan | 状态感知阶段 | manifest、debt、drift |
| `plan.output` | archon-plan | 优先级排序后、最终输出前 | 已排序工作项 |
| `review.health` | archon-review | 知识健康审计期 | 全部项目文件 |

**存在 = 激活。缺失 = 未装。** 最多 3 个激活扩展，每 hook ≤15 行。完整规范（发现协议、文件格式、预算规则、设计理由）见 soul.md §Extension Points。

## 其他扩展模式

### 加工作流模式

在命令目录创建 `archon-<mode>.md`：
- 开头声明所需的 soul/manifest 热路径区段
- 定义模式职责
- 结尾以 manifest + drift 更新收尾

新模式自动被唤醒层覆盖 —— `archon.md` 路由逻辑与 `archon-wake.mdc` 触发可扩展其意图映射表来识别新模式。

### 加子代理

在 agents 目录建 agent 文件。遵循：
- 通过委派阈值 + 代价意识评估
- 子代理建议；主代理执行
- 输出结构化、通过 drift log 可审计

### 加知识资产

- Rules（平台规则目录）：编辑期强制的约定
- Skills（平台 skills 目录）：按需索引的领域知识
- 遵循约束金字塔：推到尽可能强的层

### 加工具

在 archon 目录建 tool 子目录。Tools 是只读可观测扩展或工具脚本 —— 它们不改核心 Archon 工作流。

当前工具：

- **Dashboard**（`.archon/dashboard/`）：schema-first 治理状态仪表板。`schema.js` 定义文件结构并驱动解析 + 校验；`server.js` 渲染工作流驱动的可视化页。会话心跳由 heartbeat 规则注入 —— dashboard 目录存在 = 激活、移除 = 停用。结构性校验集成到 `governance.test.ts`；文件格式漂移 = 红测试。

## 特性总览

| 类别 | 特性 | 摘要 |
|------|------|------|
| **身份** | 所有权模型 | Agent = 所有者，不是助手 |
| **身份** | 5 条身份公理 | 所有权 · 约束 · 推断 · 精简 · 分离 |
| **认知** | 认知循环 | Perceive → Model → Act → Verify（任意阶段可回退） |
| **入口** | 唤醒机制 | 规则触发层 + 命令路由层 + 执行层（三层分离） |
| **入口** | 双通道 | "hi archon"（自然语言）/ `/archon`（显式命令）/ `/archon-*`（直接） |
| **入口** | 意图路由 | 自动派发 plan/demand/review + 漂移预检 |
| **治理** | 交付生命周期 | 9 步 close-out + 扩展 hook + 版本控制 + 阈值事件 |
| **治理** | Fast-path | 合规 trivial 交付折叠仪式；占比 > 60% 视为规避 |
| **治理** | 决策门 | 该不该做 / 多大 / 谁来定（结构化为 **Verdict** 输出，原 `GATE-1`） |
| **治理** | Plan-mode 绑定 | Verdict 先于任何写侧工具；Cursor Plan 模式是平台实现（ADR-11） |
| **治理** | 收敛门 | 里程碑级需求过滤 —— 范围外被拒，除非例外或用户覆盖（ADR-12） |
| **治理** | 验证门 | lint + typecheck + test —— 红就修绿 |
| **治理** | Close-out 门 | **Close-Out** 结构化清单（原 `GATE-2`）—— auditor 校核合规 |
| **治理** | 漂移计数器 | 量化认知债 + 机械保底 + 动态阈值（收敛期把 emergency 收紧到 14） |
| **治理** | 分级评审 | Light（≥6）/ Full（≥12）/ Emergency（≥20；收敛期 ≥14）—— 持续释压 |
| **治理** | 债务登记 | 结构化债务跟踪 + 里程碑门 |
| **质量** | 约束金字塔 | L0-L5 六级约束 —— 推到最强 |
| **质量** | 约束成熟度 | SHOULD → MUST 升级路径 |
| **质量** | Lint-Rule 桥 | L1 主动触发 L2 |
| **质量** | 反合理化表 | Skill 内嵌 Red Flags 即时纠错 |
| **质量** | 系统化调试 | 四阶段根因分析 + 推理胶囊 |
| **演进** | 知识捕获 | 触发表 + 结晶路径 |
| **演进** | 保留轴 | 钉住承重规则，他处编辑无法抽空（ADR-28） |
| **演进** | 推理胶囊 | Symptom → root cause → fix，嵌入 skill |
| **演进** | 递归应用 | Soul 原则约束 Archon 自身 |
| **演进** | 主动审视 | plan/review 五个强制问题 |
| **演进** | 已知盲点模式 | 模式识别 + 配套对策 |
| **记忆** | Pre-scan | 行动前搜 memos 与 decisions；命中 → 主动引述 |
| **记忆** | Concept Glossary + User Language Index | 产品特定词汇与干系人别名进入当前状态热路径；防领域术语语义漂移与工件查找 |
| **记忆** | 干系人 memos（热） | ≤5 紧凑指针指向干系人结论 |
| **记忆** | 冷归档 | 修剪后的 memo 迁到 `memos-archive/<year>-Q<N>.md`·关键词命中按需召回 |
| **记忆** | Negative ADR | 被拒架构提案持久化（带机械重审触发） |
| **记忆** | 修剪与晋升 | 最旧条目归档或晋升到更强载体 |
| **记忆** | 层合并 | Reviewer Phase 4：晋升累积知识（已解债务 → skill；重复漂移 → ADR/规则；稳定 memo → manifest） |
| **委派** | 执行-判断分离 | 子代理建议、主代理执行 |
| **委派** | 代价意识 | 机械检查自审；判断检查委派 |
| **委派** | 模型族分离 | 子代理声明 `model_family: different-from-main`·manifest 按角色分配 |
| **解耦** | 通用核心 | soul/commands/agents 可移植到任何项目 |
| **解耦** | 项目状态绑定 | 项目特定属于项目状态文件，如 manifest、漂移日志、债务、memos、项目 ADR |
| **可扩展** | 扩展点 | 核心 5 个生命周期 hook；项目特定扩展插入而不改命令 |
| **可扩展** | 可插拔安装 | mkdir = 安装、rmdir = 卸载、Status: disabled = 暂停 |
| **可扩展** | 预算约束 | 最多 3 个激活扩展、每 hook ≤15 行、不随核心导出 |
| **可扩展** | 扩展生命周期 | 晋升（≥2 项目 OR 命中 15 行 hook 预算 → 经 ADR 进核心）·废止（3 个空闲周期 → 移除并在 drift 记录） |
| **卫生** | 反膨胀防线 | 创建说明 + 预算 + 自动门 |
| **可观测** | Dashboard | schema-first 解析 + 工作流驱动布局 + SSE 实时更新 |
| **可观测** | 心跳协议 | 规则注入会话状态；dashboard 存在 = 激活 |
| **可观测** | 结构守卫 | 治理文件 schema 校验集成到 governance.test.ts |

## 相关文档

| 文档 | 内容 |
|------|------|
| [README.md](/zh/concepts/introduction) | 快速入门导航 |
| [setup.md](/zh/setup/full-guide) | 新项目完整安装步骤 |
| [mechanisms/drift-mechanism.md](/zh/concepts/drift-mechanism) | 漂移机制设计深读 |
| [decisions.md](/zh/concepts/decisions) | Archon 框架 ADR（可移植机制理由） |
| [user-journeys.md](/zh/concepts/user-journeys) | AI 辅助编码 15 个真实陷阱 → Archon 机制映射 |
| [concepts/model-vs-harness.md](/zh/concepts/model-vs-harness) | "Model vs. Harness"辩论：为什么强模型仍需要工程环境 |
| [concepts/superpowers-comparison.md](/zh/concepts/superpowers-comparison) | 与 Superpowers 的横向对比分析 |
