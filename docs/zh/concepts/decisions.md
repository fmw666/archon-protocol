# Archon 框架决策日志

> 可复用 Archon 治理 kit 的框架级 ADR。项目特定的产品或实现 ADR 应放在采用方项目的 `.archon/decisions.md`，不放在这份可移植文档包里。

![漫画图解：ADR 日志的四条推理泳道 —— 身份与所有权 · 交付生命周期 · 知识演进 · 保留](/images/decisions/01-four-lanes.png)

把这份日志读成**四条推理泳道**，不是一张平铺清单：身份与所有权（ADR-7/13/17）、交付生命周期（ADR-11/12/14/15）、知识演进（ADR-22/27）、保留（ADR-28/29）。每条泳道的第一条 ADR 配一张泳道级插图。

---

## ADR-7 · Authoring 源 + 独立 Export Kit

- **日期**：2026-04-08
- **状态**：生效
- **决策**：Archon 在 authoring 源仓库里开发，并以独立可复用 kit 的形式导出给采用方项目。导出文件是与项目无关的框架资产 + 采用方模板。
- **理由**：这保留了快的创作循环，同时避免过早进入独立 package/release 流程。导出 kit 就是兼容性边界。
- **影响**：`scripts/export-archon-core.mjs` 是已发行核心文件、平台文件、模板、可移植校验器与采用方面向文档的真相源。
- **重审条件**：当多个外部采用方项目需要带版本号的发布时，把导出 kit 提升为正式 package 或模板仓库。

## ADR-9 · Archon SRE 级治理改造

- **日期**：2026-04-17
- **状态**：生效
- **触发**：漂移压力暴露出"只靠散文的治理"在长交付周期里可以被诚实地绕过。
- **决策**：把 Archon 从原型治理升级为 SRE 级治理：漂移预检硬门、Fast-Path、漂移机械保底、分级评审、上下文预算、memos 热/冷分离、模型族分离意图、扩展生命周期、记忆层合并。
- **理由**：漂移泳道是**交付日志 + 交付后评审 + 评审压力**；它**不新增独立复盘系统**，也**不是 backlog 或 process wish list**。重复交付证据可以晋升到更强的载体；只有**重复失败、审计发现、不稳定手动步骤或可机械执行约束**才应离开漂移并**迁移到 `debt.md`、manifest 或 ADR**。
- **影响**：命令、soul 扩展、漂移格式、manifest 预算、memos 归档、reviewer/capture-auditor 期望与治理测试如今强制评审与预算边界。
- **重审条件**：如果漂移压力在有这些门的情况下仍反复达到 emergency，收紧阈值或把失败的检查提升到更强的层。

## ADR-10 · Soul 章节按需加载（核心 + 模式扩展）

- **日期**：2026-04-17
- **状态**：生效
- **决策**：把 `soul.md` 拆成紧凑的核心 + 模式扩展：`soul/delivery.md` 用于 demand 执行、`soul/review.md` 用于 plan/review 反思。
- **理由**：Soul 是热路径上下文。每次 boot 都加载 review-only 或 delivery-only 的规则会带来永久 token 成本，并模糊模式职责。
- **影响**：命令与子代理只加载它们需要的章节；soul 锚点一致性测试防止重构后 `§heading` 引用断掉。
- **重审条件**：当模式扩展反复超出预算时，按稳定职责再拆，而不是回到一份大文件。

## ADR-11 · Verdict 决策门绑定 Cursor Plan mode（平台原生能力门）

- **日期**：2026-04-19
- **状态**：生效
- **决策**：决策门 Verdict 必须在任何写侧工具调用之前产生。当平台提供只读 planning 模式时，Archon 把它当作这条规则的原生强制面。
- **理由**：平台强制的只读 planning 强于让主代理自我警惕沉没成本偏差。
- **影响**：`archon-demand.md §Decision Gate` 带 Plan-mode 绑定子句；架构文档解释结构化 gate 输出。
- **重审条件**：如果某个目标平台缺乏对等能力，规则降级为显式 L3 自律 + Close-Out 公开声明。

## ADR-12 · Forced-convergence gate 机械化（里程碑级 demand 过滤）

- **日期**：2026-04-19
- **状态**：生效
- **决策**：当 `manifest.md` 声明收敛范围时，`archon-demand` 必须在执行前把进入的 demand 分类为 in-scope 或 out-of-scope。
- **理由**：里程碑收敛如果只停留在散文提醒就会失败。它必须是决策门的输入。
- **影响**：Out-of-scope 的 demand 被拒绝，除非它命中显式豁免、或 drift 中记录的干系人覆盖。
- **重审条件**：如果覆盖变得频繁，重新校准收敛范围或 gate 措辞。

## ADR-13 · Export 分发自洽（primer skill + doc 入包 + Block 7 契约）

- **日期**：2026-04-20
- **状态**：生效
- **决策**：导出 kit 不仅发行核心治理文件，也发行理解框架所需的代理 primer 与采用方面向文档。
- **理由**：可复用性是认知层面的也是机械层面的。一组复制的文件是不够的，如果新代理没法形成正确的心智模型。
- **影响**：导出脚本、setup 指南、README、primer skill 与导出冒烟测试必须对发行物达成一致。
- **重审条件**：如果加入第三份发行文档，把文档地图升级为 schema 支撑的 manifest。

## ADR-14 · In-flight run-state + archon-git-commit skill

- **日期**：2026-04-20
- **状态**：生效（legacy fallback）
- **决策**：引入交付期 run-state 契约，以及一个拒绝在交付未完成时提交的 Archon 专用 commit skill。
- **理由**：仅写在聊天里的 Close-Out 声明不是机器可读的，也不能跨上下文丢失存活。提交许可需要本地证明文件。
- **影响**：Run-State v2 是当前首选；旧版 `.archon/run.md` 仅为采用方迁移保留。
- **重审条件**：如果一个稳定周期内都没人用 legacy 状态，移除 legacy 创建路径，只留 v2。

## ADR-15 · User-Intent Smart Skip（status=2）

- **日期**：2026-04-20
- **状态**：生效
- **决策**：用单独的 status token 与许可清单把"结构性跳过"与"干系人意图智能跳过"区分开。
- **理由**：用户意图与"无事可做"不同；它需要独立的审计轨迹。
- **影响**：智能跳过只允许在显式列出的 close-out 行使用，且必须记录在 drift 或 Close-Out 证据中。
- **重审条件**：如果同一行被反复智能跳过，考虑改默认工作流。

## ADR-16 · Portable Governance Contract（非 TS adopter 的基线门）

- **日期**：2026-04-25
- **状态**：生效
- **决策**：发行 `.archon/contracts/governance-contract.yaml` 加上零依赖校验器，作为非 TS 采用方的可移植基线。
- **理由**：TS 测试套件仍是 authoring 参考，但采用方项目需要一份不引入 authoring 栈也能运行的基线。
- **影响**：`archon-check.py`、`archon-check.sh` 与导出测试守护这份可移植契约。
- **重审条件**：如果采用方项目需要产品特定的门，加项目本地叠加，不污染可移植基线。

## ADR-17 · Blink Dispatch（统一 subagent 薄切片调度）

- **日期**：2026-04-25
- **状态**：生效
- **决策**：在启动 close-out 子代理之前，让主代理走一个快速薄切片门：`subagent_dispatch: skip:<reason> | use:<subagent>:<reason>`。
- **理由**：机械型评审值不回子代理的延迟；判断密集型评审仍需要分离。
- **影响**：Close-Out 在任何 `capture-auditor` 或 reviewer 升级前先咨询 `blink-dispatch`。
- **重审条件**：如果某次跳过导致漏掉一个高风险发现，把那一片提升为强制 dispatch。

## ADR-18 · Run-State v2（并发友好的每交付状态目录）

- **日期**：2026-04-25
- **状态**：生效
- **决策**：用 `.archon/runs/<run_id>/state.json` 与 `events.ndjson` 替代单例 run-state，由 `scripts/archon-run-state.mjs` 解析。
- **理由**：每交付一个目录消除单例瓶颈，支持并发交付，并允许 staged-path 所有权检查。
- **影响**：当多个 run 同时就绪时，提交解析在没有显式 `ARCHON_RUN_ID` 时 fail-closed。
- **重审条件**：如果 staged-path 所有权噪声太大，加一条专门的文件认领命令。

## ADR-19 · Domain Lens（单领域透镜 + 原子工具卡）

- **日期**：2026-04-26
- **状态**：生效
- **决策**：加 `.archon/domain-lenses/` 作为一次交付专业聚焦的机制。Domain Lenses 不是 personas，也不能覆盖 soul；`.archon/extensions/` 仍专属于生命周期 hook。
- **理由**：专业聚焦应当显式且有界，而不创建新模式、新代理或新工作流管道。长期能力面可包含 PM、QA、dev、design、planning、architecture、creative、art 等透镜，但每次交付仍只选一条透镜，且只加载有界的原子工具。
- **影响**：`registry.yaml` 是 Level 1 索引；lens router/工具卡仅在 proceed 后加载；测试守护透镜/工具形态、词汇与 Domain Lens vs Extension 边界。
- **2026-04-30 澄清**：当 demand 是"我应该加载哪条最佳实践或 skill？"时，可复用最佳实践工具集应放进一条能力路由透镜；而提供商特定的过程仍住在 skill 或项目证据里，不变成普适工具卡。
- **重审条件**：如果一条透镜覆盖不了常见 demand，新增透镜或拆 demand，而不是把身份混在一起。

## ADR-20 · Archon-native Evolution Loop（交付经验自进化）

- **日期**：2026-04-27
- **状态**：生效
- **决策**：采用 **Archon 原生演进循环**：交付事件 → 信号 → 晋升 → 更强载体。这采用**边界硬、过程软**的执行方式，同时保留硬门。
- **理由**：从外部自演进系统里能用的教训是经验压缩与晋升纪律，不是复制运行时。Archon 显式**不是复制外部 GEP/Gene/Capsule/Event 格式或引入 CLI/daemon/Hub**。每次交付先创建一个**可审计事件**；交付后评审可能识别出一个**演进信号**；晋升要求**重复失败、审计发现、不稳定手动步骤、可机械执行约束、可复用方法或架构理由**。目标载体必须是最适配的最强既有泳道：**test/rule/skill/domain tool/ADR/debt/manifest**。**一次性观察留在 drift**。直接采用外部系统会带来**license/协议/运行时假设风险**，并可能把 Archon 变成一个**流程编排器**。
- **影响**：架构与 README 现在描述了演进循环、边界硬/过程软的执行、架构预测与晋升阈值。设计**不削弱 Archon 的 owner 角色**。
- **边界**：不引入外部 schema、daemon、Hub/worker 依赖或新状态泳道；漂移不能变成 backlog。
- **重审条件**：如果**连续 3 次交付后评审**记录到同一信号都没被晋升，把晋升检查升到 L1。任何未来的外部引擎提案必须先过 `external-agent-patterns`。

## ADR-21 · Drift Progressive Loading（热索引 + 冷归档）

- **日期**：2026-04-27
- **状态**：生效（被 ADR-22 records-folder 扩展为"per-event 文件 + 自动重算 hot index"）
- **决策**：把 `drift.md` 变成由 `.archon/drift/archive/<year>-Q<N>.md` 冷归档支撑的热索引。
- **理由**：漂移需要稳定的热路径成本，但不能删旧交付证据，也不能只靠 git 历史。
- **影响**：当热文件接近行预算时，Close-Out 归档旧的完整行；可移植检查守护热段与归档形态。
- **重审条件**：如果归档关键词召回错过真实评审查询，加结构化 tag 或只读 parser。

## ADR-22 · Records-Folder（事件溯源式治理记录 + 自动重算热索引）

- **日期**：2026-05-02
- **状态**：生效
- **触发**：concurrent cloud-agent deliveries 在 PR merge 时必然冲突 `.archon/{drift,memos,debt}.md`；2026-05-02 PR #3 与 main 分支并行的 Light review 触发 drift 真合并冲突，证明 append-only 单文件结构在多 agent 环境下不可持续。
- **决策**：对 append-only 治理状态采用事件溯源。每次交付 / memo / debt 项 / review release 成为一个不可变文件，存于 `.archon/<kind>/records/`（drift / memos）或 `.archon/debt/items/`（debts），按 ISO8601 时间戳 + slug 命名。热摘要文件（`drift.md` / `memos.md` / `debt.md`）由 `scripts/archon-records.mjs` **重新生成**；手编热文件验证失败。可移植契约声明 records-folder 布局、frontmatter schema 与重生成语义。
- **理由**：
  1. **去文本冲突**：不同分支写不同文件名，永远不冲突。
  2. **去整数计数器歧义**：drift counter 是 commutative pn-counter，从 records 重算确定；分支并行 +5/-3 在 merge 后按时间序自然得到唯一 total，不再需要手工 renumber `Threshold: X→Y` 单元格。
  3. **保留 ADR-21 渐进加载**：hot summary 仍是单文件 hot-path 读取（生成产物），records 默认不进 hot path；archive 退化为 quarter-folded 目录、`merge=union` 即可（已在同 PR 中加上）。
  4. **范围严格**：只覆盖事件流（drift log rows · memos · debt items）；snapshot 性质的字段（manifest §Current State / §Convergence scope / §Latest review）**不**走 records — 它们是"现在的状态"，并行修改是真语义冲突，需要人判断。
  5. **同构外部样本 5 阶**：与 Cognee 拒绝项 R1 不同——Cognee 主张"向量近似检索"破坏字节级审计链；records-folder 是确定性文件 I/O，filename = primary key，可 grep + git bisect。
- **Schema**（每条 record 文件）：
  ```yaml
  ---
  id: <kind>-<ISO8601>-<slug>          # 主键，filename = id + .md
  date: <ISO8601 UTC>
  type: delivery|review-release|memo|debt-item|debt-resolved
  delta: +N|-N|0                       # drift only
  severity: Critical|Warning|Info|Observation  # debt only
  status: pending|resolved              # debt only
  deadline: <date>|<phase>|<trigger>    # debt only
  topic: <one-line>                     # memo only
  source: <archive-pointer>             # memo only
  ---
  
  [body — full prose previously written in row Summary cell]
  ```
- **影响**：
  - 新文件夹: `.archon/drift/records/`, `.archon/memos/records/`, `.archon/debt/items/`
  - 新工具: `scripts/archon-records.mjs` (init/check/regen, JSON-only, no deps)
  - `npm run validate` 加 `archon:records:check` 步骤 — 验证 hot summary 与 records 重算结果完全一致；手编 hot summary 自动红
  - Pre-commit hook 自动 `archon:records:regen` 并 stage hot summary
  - Portable contract `records_folder` 块声明 schema + 文件夹位置 + 允许 type 集合
  - `governance.test.ts §Records folder contract` 锚定不可被静默删除
  - 历史 hot rows + archive rows 一次性迁移：每行→一个 record file（迁移脚本 `scripts/archon-records-migrate.mjs` 跑完即弃）
- **不影响**：
  - manifest.md §Current State / §Convergence scope / §Latest review — 仍是 snapshot last-writer-wins
  - decisions.md / archon-{plan,review,demand}.md / soul.md — 不是事件流
  - L0/L1 测试格式 / 其他 governance 规则
- **重审条件**：
  - 如果 records 数量超过 ~500/quarter 且 quarter-fold 性能下降，引入二级月度子目录
  - 如果出现真"事件依赖序"场景（一个 record 必须 reference 另一个未来 record），重审是否需要 CRDT-style ordering vector instead of pure time order
  - 如果有 adopter 项目实测 regen 成本 >1s 影响 pre-commit 体感，引入增量 regen + cache
- **首次落地 PR**：cursor/reasoning-skills-load-budget-21ec → main（this PR）

## ADR-23 · Mechanical Radius Probe（Verdict 决策门机械影响范围输入）

- **日期**：2026-05-02
- **状态**：生效
- **触发**：Verdict 的 `Radius=N files / N modules · Reversibility` 当前完全靠 agent 自评。drift 端 mechanical floor（≥3/≥6/≥10 文件 → small/medium/large）后置纠正 — 但 Verdict 已经发出。Borrowed concept (GitNexus eval): precomputed relational intelligence — 决策依赖机械事实而非 LLM 现场判断。
- **决策**：决策门引入 **Mechanical Radius Probe** 作为 Verdict 强制输入。pre-Verdict 阶段基于项目 manifest 声明的 Module Boundary Map（路径 glob → 模块名）+ demand 文本 / pre-scan 阶段已识别的 file/module 关键词，输出 `radius_probe: files=<N>|modules=<N>|crosses=[<module,...>]`，与 Verdict 同时出现。Verdict 自评 Radius 与 probe 不一致时，必须在 Verdict 同行或下一行写 `radius delta: self=<N>f vs probe=<M>f — <one-line reason>`（与 numeric-claim cross-check "differ → must log delta" 同模式）。Probe 是输入而非裁决；agent 仍是 owner。
- **理由**：
  1. 同 numeric-claim 同族 — 把"机械事实 vs 自评"的 differ-must-explain 模式从产出后扩展到决策前；
  2. 可降级 — manifest 未声明 Module Boundary Map 时 probe 退化为 `files=<N>|modules=?|crosses=[]`，仍提供文件下界；
  3. 与 mechanical floor 互补 — floor 是 close-out 后置纠正 drift 评分；probe 是 Verdict 前置 Radius 输入。两者不重复。
- **影响**：`archon-demand.md §Decision Gate` 增 `Radius probe (mechanical)` 子段；项目 manifest 增 `Module Boundary Map` 段（沿用现 `Universal Module Guard` 路径词汇）；`governance.test.ts` 加 critical-rule anchor `**Radius probe (mechanical)**` + portable contract 同步。
- **重审条件**：连续 3 demand 出现 `delta=0` → probe 太宽松，重审 path-glob 颗粒度；连续出现 `agent override probe` → 重审 algorithm 或加 reviewer 介入。

## ADR-24 · Signs Table（trigger-indexed reasoning capsules）

- **日期**：2026-05-02
- **状态**：生效
- **触发**：`reasoning capsules` 目前是 narrative 嵌入 skill 文件，**仅在加载该 skill 时复用**；pre-scan 阶段无法机械全表扫描复发故障。Borrowed concept (GitNexus eval): `Signs (Trigger → Instruction → Reason)` 三列结构，命中靠关键词 / path glob 匹配而非 LLM 主动联想。
- **决策**：项目侧引入 `.archon/signs.md` 作为 trigger-indexed 故障表。三列严格：`Trigger | Instruction | Why`。Trigger 必须可机械匹配 — 四种允许形式：`keyword:` · `path:` (glob) · `error:` (前缀) · `phrase:` (verbatim)。pre-scan 阶段 sweep Trigger 列，命中 = top-cite (同 memo cite 同形态)。Hot cap = 30 行；archive 到 `.archon/signs-archive/<year>-Q<N>.md`（首次溢出时按需建）。写入触发由 close-out evolution_triage = `stats-pass` 且 evidence 来自 auditor 或 validation 时建议；agent 在下个 demand 转化为 Signs 行（非强制）。写作纪律见 `archon-signs/SKILL.md`。
- **与 reasoning capsules 的边界**：reasoning capsules 仍住 skills，承担 hit-a-wall pivot 的 narrative 复用；Signs 承担"刺激-反应"的可机械命中类。两者不重复。
- **理由**：(1) 复发故障在 demand 入口被 trigger 命中，不依赖 agent 联想；(2) evolution loop 多一档轻量 promotion 档（drift signal → Signs row → 再升 → rule/test/skill）；(3) 三列短句易写易扫，narrative 必要时升级为 reasoning capsule 而非塞回 Signs。
- **影响**：新文件 `.archon/signs.md`（项目侧）+ `.cursor/skills/archon-signs/SKILL.md`（universal）；`archon-demand.md §Pre-Scan` 加 Signs sweep；`governance.test.ts` 加 critical-rule anchor + Signs table shape 测试（`signs.md` 缺失视为"项目尚未引入"，测试静默通过）。
- **重审条件**：连续 3 demand pre-scan 都没命中任何 Sign，但实际同类复发 ≥1 → trigger 关键词太严，重审；signs.md > 20 行且命中率 <20% → trigger 写得太抽象，回到三列规范。

## ADR-G6 · Manifest Staleness Probe（manifest 与真实仓内 parity 信号）

- **日期**：2026-05-02
- **状态**：生效
- **触发**：`numeric-claim cross-check` 已经覆盖"新写的 governance/skill 文档里的数字 vs 真值"，但 `manifest §Knowledge Assets / §Tech Stack / §Tooling Roadmap` 整体是否 stale 没有定期信号。Borrowed concept (GitNexus eval): PostToolUse 在 commit / merge 后查 stale index 的"事实层 vs 文档层一致性"内核（拒绝其自动副作用）。
- **决策**：把"manifest 表 vs 真实仓内"从人肉 audit 提升到 L1。项目侧加 `manifest-knowledge-assets-parity` 测试（`### Skills` 行 ↔ 实际 skills 目录双向 parity）；plan 模式 §State Perception 加一个 `manifest staleness probe` 提示——manifest 声明知识索引时，plan 检查 parity 测试是否绿；绿 = 静默；红 / 未实现 = 在 state summary 顶部 surface `manifest staleness: <files>`。
- **理由**：(1) 与 numeric-claim 同族 — 一个查"数字 vs 真值"，一个查"索引 vs 真实存在"；(2) 不引入自动副作用 — 仍是人触发 plan / validate；(3) 命中即可见 — 同 drift notice 同形态。
- **影响**：项目侧测试文件（命名建议 `manifest-knowledge-assets-parity.test.ts`）；`archon-plan.md §State Perception` 增 staleness 提示段；不需要新 critical-rule anchor — 测试本身是 L1 enforcement。
- **重审条件**：parity 红状态超过 3 个 plan 周期未修 → 提升 plan 阶段的 surface 等级到必须修才能继续；或 manifest 知识索引扩到 §Tech Stack 等更多段且都需要 parity → 把 probe 抽成独立 helper module。

## ADR-25 · Imperative Card（soul 顶部强约束卡片）

- **日期**：2026-05-02
- **状态**：生效
- **触发**：soul §Quality Discipline 与 archon-demand 多处 imperative 散落 prose；agent 必须读全文才能定位"绝对不能跨"。Borrowed concept (GitNexus eval): `Always Do / Never Do` 顶层卡片，每条 ≤1 句，肉眼一秒命中。
- **决策**：在 `soul.md` `## Core Axioms` 之后新增 `## Imperatives` 段，承载已在文档其他地方阐释过的最强约束 ≤12 条。每条 ≤1 句且 MUST 以 `→ <file> §<anchor>` 结尾。不引入新 axiom — 是密度提取层；违反等价于违反原始 anchor。后续 close-out 端的 Final Imperative 末段（G5 派生条款）以同形态嵌入 archon-demand `§Close-Out`。
- **理由**：
  1. 同 lint-rule bridge 同形（`→ Read <path>` 已是 L1→L2 active push 模式）；
  2. 每行的 `→ <anchor>` 走已有 `Soul anchor consistency` 解析，删原 anchor 会立即让 Imperatives 行红 — Imperatives 是 anchor 的活引用而非复制；
  3. cap=12 防止退化为第二段 prose。
- **影响**：`soul.md` `## Imperatives`（cap 12 行）；`governance.test.ts §Imperative card shape`（行数 ≤12 + 每条以 `→` 结尾 + anchor 可解析）；critical-rule registry + portable contract 锚定 `## Imperatives` 不被静默删。
- **重审条件**：Imperatives 行数达 cap + 出现新候选 → 评估"哪条已被项目行为内化、可下沉回原文"；3 次评估都不能下沉再讨论扩 cap。

## ADR-27 · Claim Verifier — 统一"声称-vs-现实" drift 家族

- **日期**：2026-05-02 · **状态**：生效
- **触发**：4 条同源 debt（DEBT-058 numeric · DEBT-066 borrowed · DEBT-070 self-cite · DEBT-071 missed-trig）独立追踪会重复 plumbing。融合而非堆砌。
- **决策**：单一 `scripts/archon-claim-verifier.mjs` 承载 4 个 modes，统一 `[claim-verifier:<mode>] <FAIL|WARN>: <file> — <msg>` 报告格式，wire 进 `npm run validate` (errors fail-closed, warnings surface) + `.husky/pre-commit`。**职责分离**：verifier 是 per-delivery scan（git diff / prior commit / records folder）；`archon-check.py` 仍是 portable adopter contract checker（无 Node 依赖）。
- **理由**：(1) 同根因 → 同 owner；(2) 统一前缀可 grep；(3) modes 而非 scripts，未来 family 成员加 mode 不加 script；(4) **不引入外部借鉴** — 本 ADR 是内部 4 线融合，lineage 可见于脚本头部 DEBT 映射注释。
- **影响**：新 `scripts/archon-claim-verifier.mjs` (zero-deps) · 新 `npm run archon:verify` · validate + pre-commit wire-up · 4 portable critical-rule anchors · 新 `claim-verifier-contract.test.ts` (5 assertions) · DEBT-070 + DEBT-071 resolved (self-cite + missed-trig modes = countermeasures) · capture-auditor §Hygiene capsule 保留为 human-facing reference (L1 grep 由 modeSelfCite 承担)。
- **重审条件**：mode false-positive >1/cycle → 收紧启发式；第 5 个 family 成员 → 评估加 mode 还是独立；verifier >300 行 → 拆 modes 到独立文件 + index。

## ADR-28 · Preservation Axis（evolution 双向运动：crystallize what changes + preserve what worked）

- **日期**：2026-05-02 · **状态**：生效
- **触发**：用户原话——"我做对了哪些？一定要让自己的判断始终聚焦在我做对了哪些上，这样才是进化的核心，就是重要的要维持住，不重要的要合并或者修正"。Evolution 当前完全是 correction-only loop（trigger table 全是"failed/repeated/feedback"），缺少对"为什么没坏"的对偶守护——load-bearing 规则靠人工记忆而非机械锚点。
- **决策**：把 evolution 升级为**两运动**：crystallization（既有，新知 → 更强 vehicle）+ **Preservation**（新增，已稳的 load-bearing 锚点 → 强制 pin）。Preservation 的 vehicle 是机械三件套：critical-rule registry 锚 + body-shape test + portable contract 条目。Soul §Preservation Axis 给信号表 + 边界（pin 是 tripwire 而非 wall，仍可显式删除）；Close-Out post-delivery review (d) 强制 preservation 问与 `preservation: pinned(<anchor>+<test>+<contract>) | none-this-cycle(<evidence>)` 输出；capture-auditor §Preservation Scan 独立判断（dual to Knowledge Capture）；plan §Proactive Scrutiny 第 5 问 + preservation probe；soul/review §Known Blindspot Patterns 加 "Correction-only evolution bias" 行；soul §Imperatives 加守护卡片。Soul cap 300→310 行（同 ADR-23 350→370 先例）。
- **理由**：(1) 与 crystallization 同形对偶（一个 promote 新知，一个 pin 已稳），不引入新机制类别；(2) "load-bearing 在 cycle 内稳定" 与现有 evolution_triage `stats-pass` 同分布，不需要新统计通道；(3) 三件套 pin 已是项目侧大量在用的机械锚（critical-rule registry + body-shape test + governance-contract），preservation 只是把这件事从 "事后补救"提到 "随交付节奏"；(4) 保留 soul §Knowledge Hygiene 的 "Lean > Bloat" — pin 是 tripwire，可被显式删除，不会让框架僵化。
- **影响**：`soul.md` 前置 §Preservation Axis（信号表 + boundary）+ §Imperatives 加守护卡片 + cap 300→310；`soul/review.md` Proactive Scrutiny 4→5 问 · §Known Blindspot Patterns 新增 "Correction-only evolution bias" · §Memory Layer Consolidation 信号表加 preservation→pin 行；`archon-demand.md` post-delivery review 加 (d) preservation 问 + Close-Out checklist 加 `Preservation pass:` 行；`archon-capture-auditor.md` jobs 4→5 + 输出加 §Preservation Scan 表 + Recommendation；`archon-plan.md` §Proactive Scrutiny 5 问 + Preservation probe；`architecture.md` §Knowledge Evolution System 加 §Preservation Axis 子段 + §Soul Mapping 加 Preservation axis 行；`governance.test.ts` + `governance-contract.yaml` 同步 cap + 新 critical-rule anchors（`### Preservation Axis` · post-delivery 头 · checklist 行 · auditor §Preservation Scan）。
- **不影响**：drift records / debt items / memos schema · Run-State v2 phase row 集合 · Blink Dispatch 决策模型 · Domain Lens 加载预算 · L0/L1 已有测试。
- **Hardening pass 2026-05-03**（Reviewer 残留同 demand 全闭环）：(1) **DEBT-074 closure** — `archon-claim-verifier.mjs` 加 `--mode=preservation`：substance gate（`none-this-cycle(<evidence>)` 必须 ≥40 chars + 扫描动词 + 扫描目标）+ first-pass degeneracy 守护（`pinned(...)` 引用同 delivery 引入的锚必须带 "first pass / introducing delivery / pinned-bootstrap" framing）；纳入 `npm run archon:verify`。(2) **DEBT-075 closure** — `soul.md §Preservation Axis` 信号表迁到 `soul/review.md §Preservation Signals`（与 §Memory Layer Consolidation 同源）；soul 现 302/310，释放 8 行头空间；body-shape 测试改为 boundary tokens + 指针双重检查。(3) **DEBT-076 closure** — Q1 vs Q5 一句 clarifier 直接合并进 §Preservation Signals 段。(4) **DEBT-077 closure** — `RuleAnchor` 类型扩 `body_shape` 字段（`'has-body-shape-test' | 'header-only' | 'token-only'`）；新 L1 lint 要求每个 header-shape 锚显式声明 body_shape；27 个既存 header-shape 锚一次回填 + 2 个新 body-shape 测试（`Known Blindspot Patterns row coverage` + `Preservation Scan body shape`）；portable contract 同步。(5) **Reviewer C1 follow-up** — 加 capture-auditor protocol step-count L1 测试，断言 numbered steps == declared jobs + 2 setup steps + 连续编号 1..N，永久防止 "insert new step + forget to renumber" 重发。所有改动同 demand `npm run validate` 全绿（742 tests）。
- **重审条件**：(a) preservation pin 数量超 60 + 90% 锚 ≥3 cycle 未触发删除 → 收紧 pin 标准；(b) 连续 3 个 Close-Out `preservation: none-this-cycle` 但 reviewer 反查发现实际有可 pin 候选 → preservation 标准过严或选择性失明；(c) 出现 "pin 之间互相约束导致框架僵化" 的具体证据（任一删除连锁 ≥3 项）→ 重审 pin 颗粒度；(d) `--mode=preservation` substance gate false-positive >1/cycle → 收紧扫描动词/目标白名单。

## ADR-29 · Source Modularity Probe（Decision Gate 前置预见性拆分输入）

- **日期**：2026-05-03 · **状态**：生效
- **触发**：用户原话——"一开始几百行 AI 觉得不用拆分，但其实这样不对，要一开始拆分好才方便后续 AI Coding 检索以及模块化减少多个需求并发开发的 merge 冲突可能性"。Reactive split (size-driven, "feels long now") 是 documented failure mode：单文件累积多个 concept axis (role × surface × medium) 后，后续 demands ① 检索成本上升 ② 并行 PR merge 冲突倍增 ③ AI 单次 demand 看不到全局拆分蓝图。Borrowed concept (internal lineage)：ADR-23 Mechanical Radius Probe 的 "manifest map × changed-paths × Decision-Gate probe → owner decides, machine surfaces" 模式 — 把 "拆分时机" 从 L3 size-feel 提升到 L2 mechanical input。
- **决策**：决策门引入第三个机械 probe，与 `radius_probe:` / `soul_headroom:` 同密度同位置：当本次 demand 的 changed-path candidate set 包含 (a) 新文件创建 OR (b) 命中 manifest §Source Modularity Map 已声明的 path-glob 时，输出 `modularity_probe: target=<path>|axes=<axis-cell,...>|status=<aligned|fan-out-needed|undeclared>` 紧贴 Verdict block 上方。`status` 三态：`aligned` = 文件内容只属于 map 声明的一个 axis-cell（健康）；`fan-out-needed` = 本次变更会把第二个 axis-cell 的内容塞进同一文件（违反预见性拆分）；`undeclared` = path 未在 map 中声明（probe 降级为 advisory，不阻断；提示 owner 是否补声明）。当 `status=fan-out-needed` 时，决策门 MUST 二选一：(a) 把"先拆分到每个 axis-cell 一个文件"作为独立的前置 commit（两顶帽子合规），再做本次 demand 内容；(b) 显式更新 §Source Modularity Map 声明该文件合法跨这些 axis（附 rationale），让 probe 重新计算为 `aligned`。Probe 是输入而非裁决；agent 仍是 owner。
- **理由**：(1) 与 radius_probe / soul_headroom 同形 — 把"机械事实 vs 自评"模式从 blast-radius 与 soul-cap 扩展到 source-modularity；(2) 可降级 — manifest 未声明 §Source Modularity Map 时 probe 退化为 `undeclared` 通过，不阻塞已落地的项目；(3) 与 soul §Quality Discipline "Single responsibility... If a file feels like it's growing — split it immediately" 互补 — soul 是"何时"，probe 是"在哪些 axis 上"+"在 Verdict 时被看到"；(4) 减少并发 PR 冲突 — 多个 demand 落到不同 axis-cell 文件，merge 自然不冲；(5) 不引入 daemon / 文件大小自动统计 / 后台 indexer — 仍是 demand 入口的一次性确定性 string match。
- **影响**：`archon-demand.md §Decision Gate` 增 `Modularity probe (mechanical)` 子段；项目 manifest 增 `## Source Modularity Map` 段（`Path Glob · Split Axes · Trigger` 三列）；`docs/archon/templates/manifest.template.md` 加 placeholder 段教 adopter 如何填；`governance.test.ts` 加 critical-rule anchors（`**Modularity probe (mechanical)**` header + `modularity_probe:` token + `## Source Modularity Map` 项目级 anchor）；`governance-contract.yaml` 镜像 anchors；`docs/archon/architecture.md §Decision Gate` 加 probe 行。docs/archon/decisions.md cap 300 → 312（同 ADR-28 soul 300→310 +10 精度），manifest cap 370 → 380（§Source Modularity Map 段）。
- **不影响**：drift records / debt items / memos schema · Run-State v2 phase rows · Blink Dispatch · Domain Lens · soul.md / soul/delivery.md / soul/review.md（probe 是 command-level 机制，不动 soul 哲学）· 已落地的 modularity 已合规的项目（map 留空 = probe 全 `undeclared` 通过）。
- **语言无关性 (language-agnostic)**：探针机制（command 散文 + Verdict 输出 token + portable contract anchor + `archon-check.py`）对 Py / Java / Go / Rust / iOS / Android / 任意语言等价工作 — `Path Glob × Split Axes × Fan-Out Trigger` 三列契约不假设任何构建系统、文件扩展名、包管理器或测试框架。`docs/archon/templates/manifest.template.md` 的 §Source Modularity Map 模板示例覆盖 web frontend / scripting backend / JVM / 系统语言四条占位行，adopter 按其 stack 实际概念轴改写即可。**唯一的 stack-依赖项**是 adopter 的 **test surface** — `## Source Modularity Map` 锚在 TS adopter 走 `governance.test.ts`，在非 TS adopter 走 adopter 各自原生测试框架（与 `## Module Boundary Map` ADR-23 完全同形态，非本 ADR 新增的局限）。Portable contract YAML 中 2 条 universal anchors（`**Modularity probe (mechanical)**` + `modularity_probe:`）由 `archon-check.py`（zero-deps Python）跨语言强制。
- **重审条件 (机械化已落地, 2026-05-03 closure pass)**：
  - (a) **连续 3 demand probe 全 `undeclared`** → `archon-plan.md §1 State Perception` 的 **Modularity staleness probe** 在 plan 入口扫 drift records 最近 3 行 `modularity_probe:` 输出, surface `modularity-map staleness: 3/3 recent deliveries undeclared`；与 ADR-G6 Manifest staleness probe 同形态、advisory-only 不阻断。
  - (b) **agent override `fan-out-needed`** → 走 ADR-10 Override Observability 既有通道：Verdict 必须输出 `Override (if any): class=modularity-fanout · rationale=<≥60 chars>`；累计 `class=modularity-fanout` 频次自动 surface 在 plan/review 同 grep 通道。`class=modularity-fanout` 已加入 archon-demand Verdict 格式枚举 + ADR-10 §Class 扩展段。
- **重审条件 (显式拒绝预先实现, 2026-05-03 closure pass)**：
  - (c) **probe 误判 `aligned` 实际跨 axis** → **拒绝预先实现 axis-overlap 探测**：每语言 AST parser × 跨语言 axis 重叠模型零样本前实现完整违反 soul §Knowledge Hygiene "Lean > Bloat" + Rule of Three；ADR-26 同源先例（observe-3-demands gate 推迟 §Module Boundary Map 4 列升级）。**触发实施条件**：实际 ≥1 具体 adopter 案例（drift / auditor / reviewer 任一通道出证, 可复现）。
  - (d) **6 个月所有 adopter map 为空** → 由 (a) plan probe 覆盖, 无需独立机制。
  - (e) **某语言三列结构表达不出** → **拒绝预先实现行格式升级**：纯推测, 无 adopter 证据。**触发实施条件**：实际 ≥1 具体 adopter 案例说明哪一列表达不出该语言概念边界。
  - (f) **test-surface stack-dependency** （继承自 ADR-23）→ **不在 ADR-29 范围**：是 archon 整体 portable-vs-project 边界, 改动需重写整体边界。如必要消除, 开独立 ADR 评估"项目级锚检查搬入 portable contract"。

## ADR-26 · Project Module Boundary Map（manifest §Module Boundary Map 升级路径）

- **日期**：2026-05-02
- **状态**：Draft（observe-3-demands gate）
- **决策候选**：当前 ADR-23 已经在项目 manifest 落地最小形态的 `§Module Boundary Map`（`Module · Path Globs · Depends-On` 三列）。本 ADR 候选把它升级为正式的 `Module · Path Globs · Public Surface · Depends-On` 四列，并加一个独立的 cross-module-edge inventory 子段。
- **不立即升级 Active 的理由**：等 ADR-23 在真实 demand 中跑过 ≥3 次后，看 probe 是否真的需要 `public surface` 字段；如果三列已够用，不要为不必要的精细度付维护成本（违反 soul §Knowledge Hygiene）。
- **重审条件**：(a) ADR-23 落地后 3 个 demand 内出现 ≥1 次"probe 仅靠 path 数文件无法识别 module 跨边界" → 升级 ADR-26 为 Active；(b) 否则保留 Draft 并在下次 cycle review 重评；(c) 6 个月内未升级 → 转 Negative ADR 关闭。

---

## Negative ADRs

> 框架级拒绝。项目特定的产品拒绝放在采用方项目的 `.archon/decisions.md`。

## ADR-N2 · [否决] 引入 memsearch 作为 Archon 记忆层

- **日期**：2026-04-07
- **状态**：否决
- **提案**：引入 Markdown-first 向量记忆（memsearch / Milvus 风格）作为 Archon 跨会话记忆层。
- **否决理由**：Archon 用确定性渐进加载：manifest 索引 → 定向 skill/doc/archive 读取。向量运行时引入重型基础设施，并削弱真相源清晰度。
- **替代路径**：用热索引 + 关键词冷归档；只在召回证据证明需要时再加结构化 tag。
- **重审条件**：知识资产超过索引召回容量；或目标项目因产品原因已经需要向量基础设施。

## ADR-N3 · [否决] 立即将 Archon 拆为独立仓库

- **日期**：2026-04-08
- **状态**：否决
- **提案**：立即把 Archon 拆为独立仓库。
- **否决理由**：当前瓶颈是复用分发，不是可复制性。Export 提供更低风险的兼容性边界。
- **替代路径**：保留 authoring-source 开发 + 独立 export，直到外部采用方压力足以撑起 package 治理。
- **重审条件**：至少两个外部采用方项目依赖 export 并需要带版本号的兼容性。

## ADR-N4 · [否决] 引入三级文档流水线（Idea → Design → SDD）

- **日期**：2026-04-14
- **状态**：否决
- **提案**：采用 SDD 风格的三级文档流水线，附 idea/design/task 命令。
- **否决理由**：SDD 工作流复制了 `archon-demand`（`Decision Gate → 自主执行 → Validation Gate → Close-Out`），并为设计上下文、backlog、可执行任务计划制造彼此竞争的真相源。
- **替代路径**：干系人结论走 memos、架构理由走 ADR、未解工作走 debt、可执行工作直接走 `archon-demand`。
- **重审条件**：多人团队需要异步设计评审，且现有 memos/debt/ADR 泳道承接不下。

## ADR-N5 · [否决] 借鉴 / 迁移到 wow-harness (vNext)

- **日期**：2026-04-19
- **状态**：否决
- **提案**：借鉴或迁移到 wow-harness vNext。
- **否决理由**：wow-harness 依赖 Claude Code 特有的 hooks、slash-command 模式、插件安装、precompact 机制。这些假设无法移植到 Archon 这种基于会话、平台无关的治理模型。
- **替代路径**：把每个兼容的想法分别评估。Plan-mode Verdict 绑定变成了 ADR-11；export clean-bootstrap 工作留在 Archon 的 export 泳道；precompact 风格的 checkpoint 仍是一个独立风险观察。
- **重审条件**：Cursor 或某个跨平台协议发布等价的 PreToolUse / permission-deny / session 生命周期 API；或 harness 在真实采用方上下文中展示了可移植的可测优势。
