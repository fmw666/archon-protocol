# Archon Framework Decision Log

> Framework-level ADRs for the reusable Archon governance kit. Project-specific product or implementation ADRs belong in the adopting project's `.archon/decisions.md`, not in this portable documentation bundle.

![Comic explainer: the ADR log as four reasoning lanes — identity & ownership · delivery lifecycle · knowledge evolution · preservation](/images/decisions/01-four-lanes.png)

Read this log as **four reasoning lanes**, not a flat list: identity & ownership (ADR-7/13/17), delivery lifecycle (ADR-11/12/14/15), knowledge evolution (ADR-22/27/31/32), preservation (ADR-28/29). The first ADR of each lane carries a lane-level illustration.

---

## ADR-7 · Authoring Source + Standalone Export Kit

- **日期**：2026-04-08
- **状态**：生效
- **决策**：Archon is developed in an authoring source repository and exported as a standalone reuse kit for adopter projects. Exported files are project-agnostic framework assets plus adopter templates.
- **理由**：This preserves a fast authoring loop while avoiding a premature standalone package/release process. The exported kit is the compatibility boundary.
- **影响**：`scripts/export-archon-core.mjs` is the source of truth for shipped core files, platform files, templates, portable checkers, and adopter-facing docs.
- **重审条件**：If multiple external adopter projects require versioned releases, promote the export kit into a formal package or template repository.

## ADR-9 · Archon SRE 级治理改造

- **日期**：2026-04-17
- **状态**：生效
- **触发**：drift pressure exposed that prose-only governance can be honestly bypassed during long delivery cycles.
- **决策**：Upgrade Archon from prototype governance to SRE-grade governance: Drift Precheck hard gate, Fast-Path, drift mechanical floor, tiered review, context budgets, memos hot/cold split, model-family separation intent, extension lifecycle, and memory layer consolidation.
- **理由**：The drift lane is **delivery log + post-delivery review + review pressure**; it **不新增独立复盘系统** and is **不是 backlog 或 process wish list**. Repeated delivery evidence may promote into stronger vehicles; only **重复失败、审计发现、不稳定手动步骤或可机械执行约束** should leave drift and **迁移到 `debt.md`、manifest 或 ADR**.
- **影响**：Commands, soul extensions, drift format, manifest budget, memos archive, reviewer/capture-auditor expectations, and governance tests now enforce the review and budget boundaries.
- **重审条件**：If drift pressure repeatedly reaches emergency despite the gates, tighten thresholds or promote the failing check to a stronger layer.

## ADR-10 · Soul 章节按需加载（核心 + 模式扩展）

- **日期**：2026-04-17
- **状态**：生效
- **决策**：Split `soul.md` into a compact core plus mode extensions: `soul/delivery.md` for demand execution and `soul/review.md` for plan/review reflection.
- **理由**：Soul is hot-path context. Loading review-only or delivery-only rules on every boot creates permanent token cost and blurs mode responsibility.
- **影响**：Commands and sub-agents load only the sections they need; soul anchor consistency tests prevent broken `§heading` references after refactors.
- **重审条件**：If mode extensions repeatedly exceed their budgets, split by stable responsibility rather than returning to one large file.

## ADR-11 · Verdict 决策门绑定 Cursor Plan mode（平台原生能力门）

- **日期**：2026-04-19
- **状态**：生效
- **决策**：The Decision Gate Verdict must be produced before write-side tool invocation. When the platform provides a read-only planning mode, Archon treats it as the native enforcement surface for this rule.
- **理由**：Platform-enforced read-only planning is stronger than asking the main agent to self-police sunk-cost bias.
- **影响**：`archon-demand.md §Decision Gate` carries the Plan-mode binding clause; architecture docs explain the structured gate output.
- **重审条件**：If a target platform lacks an equivalent capability, the rule degrades to explicit L3 self-discipline with Close-Out disclosure.

## ADR-12 · Forced-convergence gate 机械化（里程碑级 demand 过滤）

- **日期**：2026-04-19
- **状态**：生效
- **决策**：When `manifest.md` declares a convergence scope, `archon-demand` must classify incoming demands as in-scope or out-of-scope before execution.
- **理由**：Milestone convergence fails if it remains a prose reminder. It must be a Decision Gate input.
- **影响**：Out-of-scope demands receive a rejection unless they match an explicit exemption or stakeholder override recorded in drift.
- **重审条件**：If overrides become frequent, recalibrate the convergence scope or gate language.

## ADR-13 · Export 分发自洽（primer skill + doc 入包 + Block 7 契约）

- **日期**：2026-04-20
- **状态**：生效
- **决策**：The export kit ships not only core governance files but also the agent primer and adopter-facing docs required to understand the framework.
- **理由**：Reusability is cognitive as well as mechanical. A copied file set is insufficient if a new agent cannot form the correct mental model.
- **影响**：The export script, setup guide, README, primer skill, and export smoke tests must agree on shipped artifacts.
- **重审条件**：If a third shipped doc is added, promote the document map into a schema-backed manifest.

## ADR-14 · In-flight run-state + archon-git-commit skill

- **日期**：2026-04-20
- **状态**：生效（legacy fallback）
- **决策**：Introduce an in-flight run-state contract and an Archon-specific commit skill that refuses commits unless the delivery is complete.
- **理由**：Chat-only Close-Out statements are not machine-readable and do not survive context loss. Commit permission needs a local proof file.
- **影响**：Run-State v2 is now preferred; legacy `.archon/run.md` remains only for adopter migration.
- **重审条件**：If legacy state is unused for a stable cycle, remove legacy creation paths and keep only v2.

## ADR-15 · User-Intent Smart Skip（status=2）

- **日期**：2026-04-20
- **状态**：生效
- **决策**：Distinguish structural skips from stakeholder-intent smart skips with a separate status token and permission list.
- **理由**：User intent is not the same as "nothing to do"; it needs a distinct audit trail.
- **影响**：Smart skips are allowed only for explicitly listed close-out rows and must be recorded in drift or Close-Out evidence.
- **重审条件**：If the same row is repeatedly smart-skipped, consider changing the default workflow for that row.

## ADR-16 · Portable Governance Contract（非 TS adopter 的基线门）

- **日期**：2026-04-25
- **状态**：生效
- **决策**：Ship `.archon/contracts/governance-contract.yaml` plus dependency-free checkers as the portable baseline for non-TS adopters.
- **理由**：The TS test suite remains the authoring reference, but adopter projects need a runnable baseline without adopting the authoring stack.
- **影响**：`archon-check.py`, `archon-check.sh`, and export tests guard the portable contract.
- **重审条件**：If adopter projects need product-specific gates, add project-local overlays rather than polluting the portable baseline.

## ADR-17 · Blink Dispatch（统一 subagent 薄切片调度）

- **日期**：2026-04-25
- **状态**：生效
- **决策**：Use a fast main-agent thin-slice gate before launching close-out sub-agents: `subagent_dispatch: skip:&lt;reason&gt; | use:&lt;subagent&gt;:&lt;reason&gt;`.
- **理由**：Mechanical review does not justify sub-agent latency; judgment-heavy review still needs separation.
- **影响**：Close-Out consults `blink-dispatch` before any `capture-auditor` or reviewer escalation.
- **重审条件**：If a skip causes a missed high-risk finding, promote that slice into required dispatch.

## ADR-18 · Run-State v2（并发友好的每交付状态目录）

- **日期**：2026-04-25
- **状态**：生效
- **决策**：Replace singleton run-state with `.archon/runs/&lt;run_id&gt;/state.json` plus `events.ndjson`, resolved by `scripts/archon-run-state.mjs`.
- **理由**：Per-delivery directories remove singleton bottlenecks, support concurrent deliveries, and allow staged-path ownership checks.
- **影响**：Commit resolution fails closed when multiple runs are ready unless `ARCHON_RUN_ID` is explicit.
- **重审条件**：If staged-path ownership is too noisy, add a dedicated file-claim command.

## ADR-19 · Domain Lens（单领域透镜 + 原子工具卡）

- **日期**：2026-04-26
- **状态**：生效
- **决策**：Add `.archon/domain-lenses/` as the mechanism for one delivery's professional focus. Domain Lenses are not personas and cannot override soul; `.archon/extensions/` remains reserved for lifecycle hooks.
- **理由**：Professional focus should be explicit and bounded without creating new modes, agents, or workflow pipelines. The long-term capability surface may include PM, QA, dev, design, planning, architecture, creative, and art lenses, but each delivery still selects one lens and loads only bounded atomic tools.
- **影响**：`registry.yaml` is the Level 1 index; lens router/tool cards load only after proceed; tests guard lens/tool shape, vocabulary, and Domain Lens vs Extension boundaries.
- **2026-04-30 clarification**：Reusable best-practice toolsets belong in a capability-routing lens when the demand is "which practice or skill should I load?", while provider-specific procedures stay in skills or project evidence instead of universal tool cards.
- **重审条件**：If a single lens cannot cover common demands, add a new lens or decompose the demand rather than blending identities.

## ADR-20 · Archon-native Evolution Loop（交付经验自进化）

- **日期**：2026-04-27
- **状态**：生效
- **决策**：Adopt an **Archon-native Evolution Loop**: delivery event → signal → promotion → stronger vehicle. This uses **Boundary-hard, process-soft** execution while preserving hard gates.
- **理由**：The useful lesson from external self-evolution systems is experience compression and promotion discipline, not copying a runtime. Archon explicitly is **不是复制外部 GEP/Gene/Capsule/Event 格式或引入 CLI/daemon/Hub**. Each delivery first creates an **auditable event**; post-delivery review may identify an **evolution signal**; promotion requires **重复失败、审计发现、不稳定手动步骤、可机械执行约束、可复用方法或架构理由**. The target vehicle must be the strongest fitting existing lane: **test/rule/skill/domain tool/ADR/debt/manifest**. **一次性观察留在 drift**. Direct adoption carries **license/协议/运行时假设风险** and can turn Archon into a **流程编排器**.
- **影响**：Architecture and README now describe the evolution loop, boundary-hard/process-soft execution, architecture forecast, and promotion thresholds. The design does **不削弱 Archon 的 owner 角色**.
- **边界**：No external schema, daemon, Hub/worker dependency, or new state lane; drift must not become a backlog.
- **重审条件**：If **连续 3 次 post-delivery review** record the same signal without promotion, raise the promotion check to L1. Any future external engine proposal must first pass `external-agent-patterns`.

## ADR-21 · Drift Progressive Loading（热索引 + 冷归档）

- **日期**：2026-04-27
- **状态**：生效（被 ADR-22 records-folder 扩展为"per-event 文件 + 自动重算 hot index"）
- **决策**：Turn `drift.md` into a hot index backed by `.archon/drift/archive/&lt;year&gt;-Q&lt;N&gt;.md` cold archives.
- **理由**：Drift needs stable hot-path cost without deleting old delivery evidence or relying only on git history.
- **影响**：Close-Out archives old complete rows when the hot file approaches its line budget; portable checks guard hot sections and archive shape.
- **重审条件**：If archive keyword recall misses real review queries, add structured tags or a read-only parser.

## ADR-22 · Records-Folder（事件溯源式治理记录 + 自动重算热索引）

- **日期**：2026-05-02
- **状态**：生效
- **触发**：concurrent cloud-agent deliveries 在 PR merge 时必然冲突 `.archon/{drift,memos,debt}.md`；2026-05-02 PR #3 与 main 分支并行的 Light review 触发 drift 真合并冲突，证明 append-only 单文件结构在多 agent 环境下不可持续。
- **决策**：Adopt event-sourcing for append-only governance state. Each delivery / memo / debt item / review release becomes one immutable file under `.archon/&lt;kind&gt;/records/` (drift / memos) or `.archon/debt/items/` (debts), named by ISO8601 timestamp + slug. The hot summary file (`drift.md` / `memos.md` / `debt.md`) is **regenerated** from records by `scripts/archon-records.mjs`; hand-edits to the hot file fail validation. The portable contract declares the records-folder layout, frontmatter schema, and regeneration semantics.
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
- **决策**：Decision Gate 引入 **Mechanical Radius Probe** 作为 Verdict 强制输入。pre-Verdict 阶段基于项目 manifest 声明的 Module Boundary Map（路径 glob → 模块名）+ demand 文本 / pre-scan 阶段已识别的 file/module 关键词，输出 `radius_probe: files=&lt;N&gt;|modules=&lt;N&gt;|crosses=[&lt;module,...&gt;]`，与 Verdict 同时出现。Verdict 自评 Radius 与 probe 不一致时，必须在 Verdict 同行或下一行写 `radius delta: self=&lt;N&gt;f vs probe=&lt;M&gt;f — &lt;one-line reason&gt;`（与 numeric-claim cross-check "differ → must log delta" 同模式）。Probe 是输入而非裁决；agent 仍是 owner。
- **理由**：
  1. 同 numeric-claim 同族 — 把"机械事实 vs 自评"的 differ-must-explain 模式从产出后扩展到决策前；
  2. 可降级 — manifest 未声明 Module Boundary Map 时 probe 退化为 `files=&lt;N&gt;|modules=?|crosses=[]`，仍提供文件下界；
  3. 与 mechanical floor 互补 — floor 是 close-out 后置纠正 drift 评分；probe 是 Verdict 前置 Radius 输入。两者不重复。
- **影响**：`archon-demand.md §Decision Gate` 增 `Radius probe (mechanical)` 子段；项目 manifest 增 `Module Boundary Map` 段（沿用现 `Universal Module Guard` 路径词汇）；`governance.test.ts` 加 critical-rule anchor `**Radius probe (mechanical)**` + portable contract 同步。
- **重审条件**：连续 3 demand 出现 `delta=0` → probe 太宽松，重审 path-glob 颗粒度；连续出现 `agent override probe` → 重审 algorithm 或加 reviewer 介入。

## ADR-24 · Signs Table（trigger-indexed reasoning capsules）

- **日期**：2026-05-02
- **状态**：生效
- **触发**：`reasoning capsules` 目前是 narrative 嵌入 skill 文件，**仅在加载该 skill 时复用**；pre-scan 阶段无法机械全表扫描复发故障。Borrowed concept (GitNexus eval): `Signs (Trigger → Instruction → Reason)` 三列结构，命中靠关键词 / path glob 匹配而非 LLM 主动联想。
- **决策**：项目侧引入 `.archon/signs.md` 作为 trigger-indexed 故障表。三列严格：`Trigger | Instruction | Why`。Trigger 必须可机械匹配 — 四种允许形式：`keyword:` · `path:` (glob) · `error:` (前缀) · `phrase:` (verbatim)。pre-scan 阶段 sweep Trigger 列，命中 = top-cite (同 memo cite 同形态)。Hot cap = 30 行；archive 到 `.archon/signs-archive/&lt;year&gt;-Q&lt;N&gt;.md`（首次溢出时按需建）。写入触发由 close-out evolution_triage = `stats-pass` 且 evidence 来自 auditor 或 validation 时建议；agent 在下个 demand 转化为 Signs 行（非强制）。写作纪律见 `archon-signs/SKILL.md`。
- **与 reasoning capsules 的边界**：reasoning capsules 仍住 skills，承担 hit-a-wall pivot 的 narrative 复用；Signs 承担"刺激-反应"的可机械命中类。两者不重复。
- **理由**：(1) 复发故障在 demand 入口被 trigger 命中，不依赖 agent 联想；(2) evolution loop 多一档轻量 promotion 档（drift signal → Signs row → 再升 → rule/test/skill）；(3) 三列短句易写易扫，narrative 必要时升级为 reasoning capsule 而非塞回 Signs。
- **影响**：新文件 `.archon/signs.md`（项目侧）+ `.cursor/skills/archon-signs/SKILL.md`（universal）；`archon-demand.md §Pre-Scan` 加 Signs sweep；`governance.test.ts` 加 critical-rule anchor + Signs table shape 测试（`signs.md` 缺失视为"项目尚未引入"，测试静默通过）。
- **重审条件**：连续 3 demand pre-scan 都没命中任何 Sign，但实际同类复发 ≥1 → trigger 关键词太严，重审；signs.md > 20 行且命中率 <20% → trigger 写得太抽象，回到三列规范。

## ADR-G6 · Manifest Staleness Probe（manifest 与真实仓内 parity 信号）

- **日期**：2026-05-02
- **状态**：生效
- **触发**：`numeric-claim cross-check` 已经覆盖"新写的 governance/skill 文档里的数字 vs 真值"，但 `manifest §Knowledge Assets / §Tech Stack / §Tooling Roadmap` 整体是否 stale 没有定期信号。Borrowed concept (GitNexus eval): PostToolUse 在 commit / merge 后查 stale index 的"事实层 vs 文档层一致性"内核（拒绝其自动副作用）。
- **决策**：把"manifest 表 vs 真实仓内"从人肉 audit 提升到 L1。项目侧加 `manifest-knowledge-assets-parity` 测试（`### Skills` 行 ↔ 实际 skills 目录双向 parity）；plan 模式 §State Perception 加一个 `manifest staleness probe` 提示——manifest 声明知识索引时，plan 检查 parity 测试是否绿；绿 = 静默；红 / 未实现 = 在 state summary 顶部 surface `manifest staleness: &lt;files&gt;`。
- **理由**：(1) 与 numeric-claim 同族 — 一个查"数字 vs 真值"，一个查"索引 vs 真实存在"；(2) 不引入自动副作用 — 仍是人触发 plan / validate；(3) 命中即可见 — 同 drift notice 同形态。
- **影响**：项目侧测试文件（命名建议 `manifest-knowledge-assets-parity.test.ts`）；`archon-plan.md §State Perception` 增 staleness 提示段；不需要新 critical-rule anchor — 测试本身是 L1 enforcement。
- **重审条件**：parity 红状态超过 3 个 plan 周期未修 → 提升 plan 阶段的 surface 等级到必须修才能继续；或 manifest 知识索引扩到 §Tech Stack 等更多段且都需要 parity → 把 probe 抽成独立 helper module。

## ADR-25 · Imperative Card（soul 顶部强约束卡片）

- **日期**：2026-05-02
- **状态**：生效
- **触发**：soul §Quality Discipline 与 archon-demand 多处 imperative 散落 prose；agent 必须读全文才能定位"绝对不能跨"。Borrowed concept (GitNexus eval): `Always Do / Never Do` 顶层卡片，每条 ≤1 句，肉眼一秒命中。
- **决策**：在 `soul.md` `## Core Axioms` 之后新增 `## Imperatives` 段，承载已在文档其他地方阐释过的最强约束 ≤12 条。每条 ≤1 句且 MUST 以 `→ &lt;file&gt; §&lt;anchor&gt;` 结尾。不引入新 axiom — 是密度提取层；违反等价于违反原始 anchor。后续 close-out 端的 Final Imperative 末段（G5 派生条款）以同形态嵌入 archon-demand `§Close-Out`。
- **理由**：
  1. 同 lint-rule bridge 同形（`→ Read &lt;path&gt;` 已是 L1→L2 active push 模式）；
  2. 每行的 `→ &lt;anchor&gt;` 走已有 `Soul anchor consistency` 解析，删原 anchor 会立即让 Imperatives 行红 — Imperatives 是 anchor 的活引用而非复制；
  3. cap=12 防止退化为第二段 prose。
- **影响**：`soul.md` `## Imperatives`（cap 12 行）；`governance.test.ts §Imperative card shape`（行数 ≤12 + 每条以 `→` 结尾 + anchor 可解析）；critical-rule registry + portable contract 锚定 `## Imperatives` 不被静默删。
- **重审条件**：Imperatives 行数达 cap + 出现新候选 → 评估"哪条已被项目行为内化、可下沉回原文"；3 次评估都不能下沉再讨论扩 cap。

## ADR-27 · Claim Verifier — 统一"声称-vs-现实" drift 家族

- **日期**：2026-05-02 · **状态**：生效
- **触发**：4 条同源 debt（DEBT-058 numeric · DEBT-066 borrowed · DEBT-070 self-cite · DEBT-071 missed-trig）独立追踪会重复 plumbing。融合而非堆砌。
- **决策**：单一 `scripts/archon-claim-verifier.mjs` 承载 4 个 modes，统一 `[claim-verifier:&lt;mode&gt;] &lt;FAIL|WARN&gt;: &lt;file&gt; — &lt;msg&gt;` 报告格式，wire 进 `npm run validate` (errors fail-closed, warnings surface) + `.husky/pre-commit`。**职责分离**：verifier 是 per-delivery scan（git diff / prior commit / records folder）；`archon-check.py` 仍是 portable adopter contract checker（无 Node 依赖）。
- **理由**：(1) 同根因 → 同 owner；(2) 统一前缀可 grep；(3) modes 而非 scripts，未来 family 成员加 mode 不加 script；(4) **不引入外部借鉴** — 本 ADR 是内部 4 线融合，lineage 可见于脚本头部 DEBT 映射注释。
- **影响**：新 `scripts/archon-claim-verifier.mjs` (zero-deps) · 新 `npm run archon:verify` · validate + pre-commit wire-up · 4 portable critical-rule anchors · 新 `claim-verifier-contract.test.ts` (5 assertions) · DEBT-070 + DEBT-071 resolved (self-cite + missed-trig modes = countermeasures) · capture-auditor §Hygiene capsule 保留为 human-facing reference (L1 grep 由 modeSelfCite 承担)。
- **重审条件**：mode false-positive >1/cycle → 收紧启发式；第 5 个 family 成员 → 评估加 mode 还是独立；verifier >300 行 → 拆 modes 到独立文件 + index。

## ADR-28 · Preservation Axis（evolution 双向运动：crystallize what changes + preserve what worked）

- **日期**：2026-05-02 · **状态**：生效
- **触发**：用户原话——"我做对了哪些？一定要让自己的判断始终聚焦在我做对了哪些上，这样才是进化的核心，就是重要的要维持住，不重要的要合并或者修正"。Evolution 当前完全是 correction-only loop（trigger table 全是"failed/repeated/feedback"），缺少对"为什么没坏"的对偶守护——load-bearing 规则靠人工记忆而非机械锚点。
- **决策**：把 evolution 升级为**两运动**：crystallization（既有，新知 → 更强 vehicle）+ **Preservation**（新增，已稳的 load-bearing 锚点 → 强制 pin）。Preservation 的 vehicle 是机械三件套：critical-rule registry 锚 + body-shape test + portable contract 条目。Soul §Preservation Axis 给信号表 + 边界（pin 是 tripwire 而非 wall，仍可显式删除）；Close-Out post-delivery review (d) 强制 preservation 问与 `preservation: pinned(&lt;anchor&gt;+&lt;test&gt;+&lt;contract&gt;) | none-this-cycle(&lt;evidence&gt;)` 输出；capture-auditor §Preservation Scan 独立判断（dual to Knowledge Capture）；plan §Proactive Scrutiny 第 5 问 + preservation probe；soul/review §Known Blindspot Patterns 加 "Correction-only evolution bias" 行；soul §Imperatives 加守护卡片。Soul cap 300→310 行（同 ADR-23 350→370 先例）。
- **理由**：(1) 与 crystallization 同形对偶（一个 promote 新知，一个 pin 已稳），不引入新机制类别；(2) "load-bearing 在 cycle 内稳定" 与现有 evolution_triage `stats-pass` 同分布，不需要新统计通道；(3) 三件套 pin 已是项目侧大量在用的机械锚（critical-rule registry + body-shape test + governance-contract），preservation 只是把这件事从 "事后补救"提到 "随交付节奏"；(4) 保留 soul §Knowledge Hygiene 的 "Lean > Bloat" — pin 是 tripwire，可被显式删除，不会让框架僵化。
- **影响**：`soul.md` 前置 §Preservation Axis（信号表 + boundary）+ §Imperatives 加守护卡片 + cap 300→310；`soul/review.md` Proactive Scrutiny 4→5 问 · §Known Blindspot Patterns 新增 "Correction-only evolution bias" · §Memory Layer Consolidation 信号表加 preservation→pin 行；`archon-demand.md` post-delivery review 加 (d) preservation 问 + Close-Out checklist 加 `Preservation pass:` 行；`archon-capture-auditor.md` jobs 4→5 + 输出加 §Preservation Scan 表 + Recommendation；`archon-plan.md` §Proactive Scrutiny 5 问 + Preservation probe；`architecture.md` §Knowledge Evolution System 加 §Preservation Axis 子段 + §Soul Mapping 加 Preservation axis 行；`governance.test.ts` + `governance-contract.yaml` 同步 cap + 新 critical-rule anchors（`### Preservation Axis` · post-delivery 头 · checklist 行 · auditor §Preservation Scan）。
- **不影响**：drift records / debt items / memos schema · Run-State v2 phase row 集合 · Blink Dispatch 决策模型 · Domain Lens 加载预算 · L0/L1 已有测试。
- **Hardening pass 2026-05-03**（Reviewer 残留同 demand 全闭环）：(1) **DEBT-074 closure** — `archon-claim-verifier.mjs` 加 `--mode=preservation`：substance gate（`none-this-cycle(&lt;evidence&gt;)` 必须 ≥40 chars + 扫描动词 + 扫描目标）+ first-pass degeneracy 守护（`pinned(...)` 引用同 delivery 引入的锚必须带 "first pass / introducing delivery / pinned-bootstrap" framing）；纳入 `npm run archon:verify`。(2) **DEBT-075 closure** — `soul.md §Preservation Axis` 信号表迁到 `soul/review.md §Preservation Signals`（与 §Memory Layer Consolidation 同源）；soul 现 302/310，释放 8 行头空间；body-shape 测试改为 boundary tokens + 指针双重检查。(3) **DEBT-076 closure** — Q1 vs Q5 一句 clarifier 直接合并进 §Preservation Signals 段。(4) **DEBT-077 closure** — `RuleAnchor` 类型扩 `body_shape` 字段（`'has-body-shape-test' | 'header-only' | 'token-only'`）；新 L1 lint 要求每个 header-shape 锚显式声明 body_shape；27 个既存 header-shape 锚一次回填 + 2 个新 body-shape 测试（`Known Blindspot Patterns row coverage` + `Preservation Scan body shape`）；portable contract 同步。(5) **Reviewer C1 follow-up** — 加 capture-auditor protocol step-count L1 测试，断言 numbered steps == declared jobs + 2 setup steps + 连续编号 1..N，永久防止 "insert new step + forget to renumber" 重发。所有改动同 demand `npm run validate` 全绿（742 tests）。
- **重审条件**：(a) preservation pin 数量超 60 + 90% 锚 ≥3 cycle 未触发删除 → 收紧 pin 标准；(b) 连续 3 个 Close-Out `preservation: none-this-cycle` 但 reviewer 反查发现实际有可 pin 候选 → preservation 标准过严或选择性失明；(c) 出现 "pin 之间互相约束导致框架僵化" 的具体证据（任一删除连锁 ≥3 项）→ 重审 pin 颗粒度；(d) `--mode=preservation` substance gate false-positive >1/cycle → 收紧扫描动词/目标白名单。

## ADR-29 · Source Modularity Probe（Decision Gate 前置预见性拆分输入）

- **日期**：2026-05-03 · **状态**：生效
- **触发**：用户原话——"一开始几百行 AI 觉得不用拆分，但其实这样不对，要一开始拆分好才方便后续 AI Coding 检索以及模块化减少多个需求并发开发的 merge 冲突可能性"。Reactive split (size-driven, "feels long now") 是 documented failure mode：单文件累积多个 concept axis (role × surface × medium) 后，后续 demands ① 检索成本上升 ② 并行 PR merge 冲突倍增 ③ AI 单次 demand 看不到全局拆分蓝图。Borrowed concept (internal lineage)：ADR-23 Mechanical Radius Probe 的 "manifest map × changed-paths × Decision-Gate probe → owner decides, machine surfaces" 模式 — 把 "拆分时机" 从 L3 size-feel 提升到 L2 mechanical input。
- **决策**：Decision Gate 引入第三个机械 probe，与 `radius_probe:` / `soul_headroom:` 同密度同位置：当本次 demand 的 changed-path candidate set 包含 (a) 新文件创建 OR (b) 命中 manifest §Source Modularity Map 已声明的 path-glob 时，输出 `modularity_probe: target=&lt;path&gt;|axes=&lt;axis-cell,...&gt;|status=&lt;aligned|fan-out-needed|undeclared&gt;` 紧贴 Verdict block 上方。`status` 三态：`aligned` = 文件内容只属于 map 声明的一个 axis-cell（健康）；`fan-out-needed` = 本次变更会把第二个 axis-cell 的内容塞进同一文件（违反预见性拆分）；`undeclared` = path 未在 map 中声明（probe 降级为 advisory，不阻断；提示 owner 是否补声明）。当 `status=fan-out-needed` 时，Decision Gate MUST 二选一：(a) 把"先拆分到每个 axis-cell 一个文件"作为独立的前置 commit（两顶帽子合规），再做本次 demand 内容；(b) 显式更新 §Source Modularity Map 声明该文件合法跨这些 axis（附 rationale），让 probe 重新计算为 `aligned`。Probe 是输入而非裁决；agent 仍是 owner。
- **理由**：(1) 与 radius_probe / soul_headroom 同形 — 把"机械事实 vs 自评"模式从 blast-radius 与 soul-cap 扩展到 source-modularity；(2) 可降级 — manifest 未声明 §Source Modularity Map 时 probe 退化为 `undeclared` 通过，不阻塞已落地的项目；(3) 与 soul §Quality Discipline "Single responsibility... If a file feels like it's growing — split it immediately" 互补 — soul 是"何时"，probe 是"在哪些 axis 上"+"在 Verdict 时被看到"；(4) 减少并发 PR 冲突 — 多个 demand 落到不同 axis-cell 文件，merge 自然不冲；(5) 不引入 daemon / 文件大小自动统计 / 后台 indexer — 仍是 demand 入口的一次性确定性 string match。
- **影响**：`archon-demand.md §Decision Gate` 增 `Modularity probe (mechanical)` 子段；项目 manifest 增 `## Source Modularity Map` 段（`Path Glob · Split Axes · Trigger` 三列）；`docs/archon/templates/manifest.template.md` 加 placeholder 段教 adopter 如何填；`governance.test.ts` 加 critical-rule anchors（`**Modularity probe (mechanical)**` header + `modularity_probe:` token + `## Source Modularity Map` 项目级 anchor）；`governance-contract.yaml` 镜像 anchors；`docs/archon/architecture.md §Decision Gate` 加 probe 行。docs/archon/decisions.md cap 300 → 312（同 ADR-28 soul 300→310 +10 精度），manifest cap 370 → 380（§Source Modularity Map 段）。
- **不影响**：drift records / debt items / memos schema · Run-State v2 phase rows · Blink Dispatch · Domain Lens · soul.md / soul/delivery.md / soul/review.md（probe 是 command-level 机制，不动 soul 哲学）· 已落地的 modularity 已合规的项目（map 留空 = probe 全 `undeclared` 通过）。
- **语言无关性 (language-agnostic)**：探针机制（command 散文 + Verdict 输出 token + portable contract anchor + `archon-check.py`）对 Py / Java / Go / Rust / iOS / Android / 任意语言等价工作 — `Path Glob × Split Axes × Fan-Out Trigger` 三列契约不假设任何构建系统、文件扩展名、包管理器或测试框架。`docs/archon/templates/manifest.template.md` 的 §Source Modularity Map 模板示例覆盖 web frontend / scripting backend / JVM / 系统语言四条占位行，adopter 按其 stack 实际概念轴改写即可。**唯一的 stack-依赖项**是 adopter 的 **test surface** — `## Source Modularity Map` 锚在 TS adopter 走 `governance.test.ts`，在非 TS adopter 走 adopter 各自原生测试框架（与 `## Module Boundary Map` ADR-23 完全同形态，非本 ADR 新增的局限）。Portable contract YAML 中 2 条 universal anchors（`**Modularity probe (mechanical)**` + `modularity_probe:`）由 `archon-check.py`（zero-deps Python）跨语言强制。
- **重审条件 (机械化已落地, 2026-05-03 closure pass)**：
  - (a) **连续 3 demand probe 全 `undeclared`** → `archon-plan.md §1 State Perception` 的 **Modularity staleness probe** 在 plan 入口扫 drift records 最近 3 行 `modularity_probe:` 输出, surface `modularity-map staleness: 3/3 recent deliveries undeclared`；与 ADR-G6 Manifest staleness probe 同形态、advisory-only 不阻断。
  - (b) **agent override `fan-out-needed`** → 走 ADR-10 Override Observability 既有通道：Verdict 必须输出 `Override (if any): class=modularity-fanout · rationale=&lt;≥60 chars&gt;`；累计 `class=modularity-fanout` 频次自动 surface 在 plan/review 同 grep 通道。`class=modularity-fanout` 已加入 archon-demand Verdict 格式枚举 + ADR-10 §Class 扩展段。
- **重审条件 (显式拒绝预先实现, 2026-05-03 closure pass)**：
  - (c) **probe 误判 `aligned` 实际跨 axis** → **拒绝预先实现 axis-overlap 探测**：每语言 AST parser × 跨语言 axis 重叠模型零样本前实现完整违反 soul §Knowledge Hygiene "Lean > Bloat" + Rule of Three；ADR-26 同源先例（observe-3-demands gate 推迟 §Module Boundary Map 4 列升级）。**触发实施条件**：实际 ≥1 具体 adopter 案例（drift / auditor / reviewer 任一通道出证, 可复现）。
  - (d) **6 个月所有 adopter map 为空** → 由 (a) plan probe 覆盖, 无需独立机制。
  - (e) **某语言三列结构表达不出** → **拒绝预先实现行格式升级**：纯推测, 无 adopter 证据。**触发实施条件**：实际 ≥1 具体 adopter 案例说明哪一列表达不出该语言概念边界。
  - (f) **test-surface stack-dependency** （继承自 ADR-23）→ **不在 ADR-29 范围**：是 archon 整体 portable-vs-project 边界, 改动需重写整体边界。如必要消除, 开独立 ADR 评估"项目级锚检查搬入 portable contract"。

## ADR-30 · Formwork（结构守卫）外部框架评估 — 选择性采纳 + 边界确认

- **日期**：2026-06-08 · **状态**：生效
- **触发**：[EvoMap/formwork](https://github.com/EvoMap/formwork)（"结构守卫"）是一套方法论 + 可移植 Agent Skills，主张"整库静态扫描守卫 = 无状态自我改写 AI 维护者的外化、再执行记忆"，并补上 grandfather/ratchet 元治理与 AI 维护者叙事。其承重叙事与 Archon 高度同构，需按 5 公理评估采纳/拒绝边界，避免重复造轮或边界外扩。
- **决策**：把 Formwork 作为外部框架按 5 公理过滤评估（同 Superpowers / Fowler 先例），全过程写入 `docs/concepts/formwork-adoption.md`。核心发现——**Formwork 的承重思想已被 Archon 既有机制覆盖**：「不可静默修改、scar 而非 wall」≡ ADR-28 Preservation Axis（pin = tripwire not wall）；Forbidden Pattern ≡ governance-contract `forbidden_substrings` + Universal Module Guard；said-vs-truth 全库扫描 ≡ ADR-27 Claim Verifier；body-shape / 存在性 pin ≡ critical-rule structural guard；「机器能强制就别写散文」≡ Constraint Pyramid；bug→守卫 ≡ ADR-24 Signs + "new code = new guardrails"。因此**不引入新运行时 / 后台 daemon / 新 mode / 新 agent / persona**（同 ADR-20 "不做流程编排器" 边界 + ADR-19 Domain Lens 非人格边界）——评估确认 Formwork 内核已落在既有机制内。真正的增量是 Formwork 把守卫一般化到**采用方任意语言的产品代码**（Archon 现有守卫只覆盖 `.archon/` 自治文件），连同 grandfather+ratchet 豁免纪律、六类配方 taxonomy、constraint-pruner 删除仪式。**初版（2026-06-08）把这些登记为未来演化向量；同日经 stakeholder 明确指示（方案 2/3）即时落地，不再等 adopter 证据触发——见下方「Landing pass」附记。**
- **理由**：(1) 同 Superpowers / Fowler 同形——翻译而非复制，承重定义住既有 soul / contract / ADR，本 ADR + 概念文档只承载 Why+How；(2) 不预先实现产品代码守卫工具链——零 adopter 证据前实现多语言守卫脚手架违反 soul §Knowledge Hygiene "Lean > Bloat" + Rule of Three（同 ADR-26 observe-3-demands、ADR-29 (c)(e) observe-before-build 先例）；(3) 思想高度同构本身是验证信号——Formwork 独立到达 Archon 的 preservation / claim-verifier 内核，强化而非替换现有设计。
- **影响**（含同日 Landing pass）：新增 `docs/concepts/formwork-adoption.md`（5 公理 adopt / reject + 落地映射 + 未来向量）；`docs/concepts/index.md` + `docs/.vitepress/config.ts` 侧栏各加一行。机制层落地：新增 dev 透镜原子工具 `.archon/domain-lenses/tools/dev/structural-guard.md`（registry.yaml tool_index + dev.tools + dev.md 同步，`export_manifest.required_files` 登记）；`governance-contract.yaml` 新增 `structural_guard` 约定块（六类配方 + 五件套 anatomy + sentinel 规则 + exemption ratchet：cap==current + bind-to-ground-truth，无 `file:` 键以满足 lint-distribution 对称性）；`soul/delivery.md §New Code = New Guardrails` 加一条 cross-file invariant → structural guard 项（114→116 行，预算 150）。分发层：Formwork 四技能 vendored 为可选 manifest 模块 `skills-formwork`（`build-manifest.mjs` MODULE_DEFS 置于 `skills` 之前、required:false；generate-source-pages OVERRIDES 加 renderAs:code 4 条；NOTICE 加 MIT 归属）。**不影响**：drift / debt / memos schema · Run-State v2 · Blink Dispatch · 既有透镜加载预算 · 必需核心模块（core skills 仍 5 文件，无泄漏）· L0/L1 既有测试。
- **边界**：仍**不引入** Formwork 的多语言模板库（`templates/` + `docs/language-adapters.md` 留在上游，技能内改指 github.com/EvoMap/formwork）、**不引入** CI 守卫调度运行时 / daemon、**不把**守卫做成新 mode / agent / persona。`skills-formwork` 为 opt-in，核心 `.archon/` 不依赖它；`structural_guard` 契约块是面向 adopter 自有 test surface 的约定（语言无关，同 ADR-29），Archon 自身的 archon-check.py 不执行产品代码守卫。
- **Landing pass（2026-06-08，stakeholder 指示）**：方案 2 落地向量 #1（dev/structural-guard 工具）+ #2（contract ratchet 约定）+ soul 接线；方案 3 落地可选 `skills-formwork` 模块（四技能）。`npm run prebuild` 重建 manifest（15 模块 / 89 文件）+ lint-distribution `0 违规` + lint-links `854/0` + lint-encoding `0` 全绿。formwork-adoption.md §3.2/§3.3/§6/§7 同步标注为「已落地」以免 ADR-27 said-vs-truth 漂移。
- **重审条件**：(a) `skills-formwork` 六个月内零 adopter 启用，且 `dev/structural-guard` 在 drift 中零引用 → 评估降级为纯文档（撤回技能模块，保留概念）；(b) 某 adopter 守卫 / 规则豁免集连续 3 个 review cycle 不缩 → 由 constraint-pruner 技能 + soul §Lean>Bloat 介入（向量 #4 的删除仪式已随技能落地）；(c) `dev/structural-guard` 工具卡随六类配方膨胀 > load_lines 容差 → 按 registry load_lines_tolerance 拆分或精简。

## ADR-26 · Project Module Boundary Map（manifest §Module Boundary Map 升级路径）

- **日期**：2026-05-02
- **状态**：Draft（observe-3-demands gate）
- **决策候选**：当前 ADR-23 已经在项目 manifest 落地最小形态的 `§Module Boundary Map`（`Module · Path Globs · Depends-On` 三列）。本 ADR 候选把它升级为正式的 `Module · Path Globs · Public Surface · Depends-On` 四列，并加一个独立的 cross-module-edge inventory 子段。
- **不立即升级 Active 的理由**：等 ADR-23 在真实 demand 中跑过 ≥3 次后，看 probe 是否真的需要 `public surface` 字段；如果三列已够用，不要为不必要的精细度付维护成本（违反 soul §Knowledge Hygiene）。
- **重审条件**：(a) ADR-23 落地后 3 个 demand 内出现 ≥1 次"probe 仅靠 path 数文件无法识别 module 跨边界" → 升级 ADR-26 为 Active；(b) 否则保留 Draft 并在下次 cycle review 重评；(c) 6 个月内未升级 → 转 Negative ADR 关闭。

## ADR-31 · 落地接管期码库自扫描 + 随包发行状态模板

- **日期**：2026-06-08 · **状态**：生效
- **触发**：本周期对 Claude Code 项目级 memory（CLAUDE.md 层级 · auto-memory `MEMORY.md` 200 行/25KB 热索引 + 按需 topic · `/init` 扫码库自举）与 ADR 实践做了对照研究（与 ADR-32 同源）。对照发现 Archon 安装仅靠向用户问 3-4 个问题播种 manifest，新装项目得到一个全是 `<!-- hint -->` 占位的空壳——与 soul §Ownership「owner 主动建立项目认知、不询问用户」存在落差；而 Claude `/init` 通过扫码库自动生成初版。
- **决策**：(1) 把 `manifest.template.md` 与 `decisions.template.md` 提升为**随包发行的真实文件**（`.archon/templates/`，core-templates 模块，`export_manifest.required_files` 登记），install Step 7 从模板而非临时 stub 播种；(2) install 新增 **Step 7b 码库自扫描**——接管期 agent 只读扫描 package 清单 / 目录布局 / README 术语，预填 manifest 的 Tech Stack · Directory Structure · Concept Glossary 候选 · Source Modularity Map 种子，monorepo 则提议初始 manifest 切片（见 ADR-32）。
- **理由**：(1) 与 Claude `/init` 同形——所有权要求 agent 自己建立项目模型而非问用户；(2) 纯只读推断、provisional 标注，不确定项保留 `<!-- hint -->`，不制造自信的错值；(3) 模板随包发行让每个 adopter 从 canonical 段落集起步，消除 ad-hoc stub 漂移。
- **影响**：新增 `.archon/templates/{manifest,decisions}.template.md`（manifest 模板含 `## Manifest Slices` 段）；`governance-contract.yaml export_manifest.required_files` +2；`install.md` 重写 Step 7 + 新增 Step 7b + 版本注记 0.1.0→0.2.0；`skill.md` 加自扫描说明；VERSION 0.1.0→0.2.0。**不影响**：sha256 校验流程（模板照常校验）· 占位符目录（仍 0 占位）· runtime ledger 播种顺序。
- **重审条件**：(a) 自扫描预填在 adopter 反馈中频繁产生错值需用户大改 → 收紧为"仅填高置信字段（tech stack / 目录），术语/模块图留空"；(b) 模板随框架演化与 install Step 7b 指令漂移 → 把模板段落集与 self-scan 步骤用 critical_rule_substrings 互锚。
- **扩展（2026-06-09）**：v0.2.0 只把 `manifest` / `decisions` 两个模板随包发行，`drift` / `debt` / `memos` 三个 ledger 仍由 install Step 7 散文手工播种。真实 agent 沙箱跑（`install-agent-cursor`）显示 LLM 会 under-seed 这三者——drift 漏 `**drift: 0**` 哨兵、memos 漏 `## Archive Index`、debt 漏 `<!-- no-active-debt -->` 标记——导致 fresh install FAIL `archon-check.py`。补全本 ADR「从 canonical 模板播种」论点：把 `drift.template.md` / `debt.template.md` / `memos.template.md` 也提升为 `.archon/templates/` 真实文件（core-templates 模块自动归桶 + `export_manifest.required_files` +3；内容源自 `docs/setup/templates/`，并把 `&lt;…&gt;` 转为 run.template.md 式裸 `<…>`），install Step 7 改为五个状态 ledger（manifest · debt · drift · memos · decisions）全部从 `.archon/templates/*.template.md` 逐字播种。散文弱于确定性模板——此扩展把 under-seed 失败面彻底消除（signs.md 无 schema 约束，仍散文播种）。

## ADR-32 · 路径作用域 manifest 切片（大型 / monorepo 项目状态分域）

- **日期**：2026-06-08 · **状态**：生效
- **触发**：对照 Claude Code 项目级 memory 发现：其按子树懒加载的嵌套 CLAUDE.md 是 Archon 唯一缺失的真实记忆维度——Archon 的 manifest 是单一项目作用域，monorepo 里一个 manifest 被跨包术语撑爆热路径。（同批对照的其余借鉴项：org 托管层、`@import` transclusion 经 5 公理评估记为 Negative ADR-N7 / ADR-N6。）
- **决策**：引入**可选**的路径作用域 manifest 切片：`.archon/manifest/slices/<slug>.md`，每片在 body 声明 `scope: <glob>`，只承载该子树局部的 Concept Glossary / User Language Index / Source Modularity Map 增量；根 manifest 加一个小热索引 `## Manifest Slices`（slug → glob → 一行用途），切片 body 冷加载。demand pre-scan 把目标/变更路径与切片 glob 匹配，只加载命中的切片 body（复用 memos-archive「热索引 + 按需 body」模式）；`modularity_probe` 折入命中切片的 §Source Modularity Map 行。缺 `slices/` 目录 = 单作用域（向后兼容）。
- **理由**：(1) 唯一真实记忆 gap，且符合公理——切片**减少**热路径（大仓库不再被无关子包术语撑爆 context），契合 Lean>Bloat；作用域由"改了哪些路径"推断，契合 Inference>Configuration；(2) 复用既有模式——热索引 + 冷 body（ADR-21）、独立文件并发可合并（ADR-22 spirit：不同子树的并行交付编辑不同切片文件，零冲突）、条件契约块（records_folder / repo_self_check 先例）；(3) 切片是 domain lens 的对偶——lens 给推理工具分域，slice 给项目状态分域。
- **影响**：`governance-contract.yaml` 新增条件块 `manifest_slices`（≤120 行 · 必声明 `scope:` · 必被 `## Manifest Slices` 索引），soul.md cap 310→315；`archon-check.py` 新增条件 `assert_manifest_slices`（缺目录即跳过，fresh install 恒绿）；切片目录已被 `.archon/manifest/` runtime_ledger_path 覆盖（build-manifest 无需改）；`soul.md §Knowledge Hygiene` 加 Path-scoped slices 一条；`archon-demand.md` pre-scan 加 Manifest slice scan 段 + `modularity_probe` 加 slice-aware 句（不触动任何 pinned substring）；manifest 模板加 `## Manifest Slices` 段。**不影响**：drift/debt/memos schema · Run-State status keys（不新增）· Verdict 输出 token（不新增）· universal_module_guard（切片是项目状态，不扫描）。
- **重审条件**：(a) 发行 6 个月内零 adopter 创建切片 → 评估降级为纯文档说明（保留契约块为 no-op 条件块）；(b) 切片数量膨胀或与根 manifest 内容重复漂移 → 加 governance-docs / claim-verifier 互锚或引入切片去重检查；(c) 出现切片需声明跨切片依赖的真实压力 → 单开 ADR 评估切片间引用（当前刻意不做，避免 ADR-26 式过早精细度）。

---

## Negative ADRs

> Framework-level rejections. Project-specific product rejections belong in the adopter project's `.archon/decisions.md`.

## ADR-N2 · [否决] 引入 memsearch 作为 Archon 记忆层

- **日期**：2026-04-07
- **状态**：否决
- **提案**：Introduce Markdown-first vector memory (memsearch / Milvus style) as Archon's cross-session memory layer.
- **否决理由**：Archon uses deterministic progressive loading: manifest index → targeted skill/doc/archive read. A vector runtime adds heavyweight infrastructure and weakens source-of-truth clarity.
- **替代路径**：Use hot indexes plus keyworded cold archives; add structured tags only when recall evidence proves they are needed.
- **重审条件**：Knowledge assets exceed indexed recall capacity, or a target project already needs vector infrastructure for product reasons.

## ADR-N3 · [否决] 立即将 Archon 拆为独立仓库

- **日期**：2026-04-08
- **状态**：否决
- **提案**：Immediately split Archon into an independent repository.
- **否决理由**：The current bottleneck is reuse distribution, not copyability. Export provides a lower-risk compatibility boundary.
- **替代路径**：Keep authoring-source development plus standalone export until external adopter pressure justifies package governance.
- **重审条件**：At least two external adopter projects rely on the export and require versioned compatibility.

## ADR-N4 · [否决] 引入三级文档流水线（Idea → Design → SDD）

- **日期**：2026-04-14
- **状态**：否决
- **提案**：Adopt an SDD-style three-tier doc pipeline with idea/design/task commands.
- **否决理由**：The SDD workflow duplicates `archon-demand` (`Decision Gate → self-directed Execute → Validation Gate → Close-Out`) and creates competing sources of truth for design context, backlog, and executable task planning.
- **替代路径**：Stakeholder conclusions go to memos, architecture rationale to ADRs, unresolved work to debt, and executable work directly to `archon-demand`.
- **重审条件**：A multi-person team needs asynchronous design review and existing memos/debt/ADR lanes cannot carry the load.

## ADR-N5 · [否决] 借鉴 / 迁移到 wow-harness (vNext)

- **日期**：2026-04-19
- **状态**：否决
- **提案**：Borrow or migrate to wow-harness vNext.
- **否决理由**：wow-harness depends on Claude Code-specific hooks, slash-command modes, plugin installation, and precompact mechanics. Those assumptions are not portable to Archon's session-based, platform-agnostic governance model.
- **替代路径**：Evaluate each compatible idea separately. Plan-mode Verdict binding became ADR-11; export clean-bootstrap work stayed in Archon's export lane; precompact-style checkpointing remains a separate risk observation.
- **重审条件**：Cursor or a cross-platform protocol ships equivalent PreToolUse / permission-deny / session lifecycle APIs, or harness demonstrates portable measurable advantage in an actual adopter context.

## ADR-N6 · [否决] CLAUDE.md 式 `@import` transclusion 用于治理文件

- **日期**：2026-06-08
- **状态**：否决
- **提案**：借鉴 Claude Code 的 `@path` import 语法（4 跳递归、code-span 安全），让 soul / manifest / 命令文件用显式 transclusion 组合，替代当前的按需分节加载。
- **否决理由**：Archon 已用 `soul/*.md` 模式扩展（命令各自 `load` 其扩展）+ manifest 分节作用域达成模块化；再加一套 import 解析语法收益边际、增加解析面与失败模式（循环、深度、跨平台路径重写），违反 Lean>Bloat。Claude 需要 `@import` 是因为 CLAUDE.md 启动全量加载；Archon 本就不全量加载，前提不成立。
- **替代路径**：继续用 soul 模式扩展 + manifest 分节 +（本批次）路径作用域切片（ADR-32）做组合；切片已覆盖"按子树组合项目状态"这一 import 最有价值的用例。
- **重审条件**：某平台移除 Archon 的分节/扩展加载能力，迫使治理文件回退到全量加载；或出现 soul/扩展机制无法表达的真实跨文件组合需求。

## ADR-N7 · [否决/推迟] 组织级托管继承约束层

- **日期**：2026-06-08
- **状态**：否决（推迟）
- **提案**：借鉴 Claude Code 的不可覆盖企业托管策略层，给 Archon 加一层 adopter 不能弱化的组织级继承约束（org 尺度的保全轴）。
- **否决理由**：Archon 当前是单项目、会话内框架；零多仓库 / 团队治理证据前实现继承约束层属过度设计（违反 Lean>Bloat + observe-before-build 先例 ADR-26/29）。该思想与 ADR-28 Preservation Axis 同构（org 尺度的"绊线非墙"），但内核已被既有保全机制覆盖，差的只是"跨仓库继承"这一分发维度。
- **替代路径**：单项目内继续用 critical_rule_substrings + 保全三件套；跨项目复用走 export kit / manifest 分发。
- **重审条件**：≥2 个团队/组织把 Archon 部署到多仓库并要求统一、不可在子项目弱化的治理基线（与 ADR-N3「拆独立仓库」的 versioned-compat 触发器相邻）。
