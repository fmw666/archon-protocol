# Archon 安装指南

> 将 Archon 框架集成到新项目的完整步骤。Archon 的可复用机制与项目无关、与平台无关；每个采用方仍需在 `.archon/` 下填入项目状态文件。

![漫画图解：Archon 安装路线](/images/setup/01-install-route.png)

安装只有一条路线：导出或复制框架、填入项目状态、安装机械守卫，然后运行第一次 plan，证明 agent 能加载到正确的上下文。

## 前置条件

![漫画图解：安装前的三个前提 —— IDE、git 仓库、任务运行器](/images/setup/05-prereqs.png)

- 一个能加载基于 markdown 的 rules、skills 和 commands 的 AI 编码平台（Cursor、Claude Code 或同类产品)
- Git 仓库（Archon 依赖 git hooks 与版本历史）
- 一个能注册单一验证命令的任务运行器 / 包管理器（npm、pip、cargo、make 等）

> **参考实现说明**：下文 §3b 中的测试夹具与 §3c 中的 pre-commit 脚本为了具体说明使用 Node.js + Vitest + Husky。所有机制都是可移植的 —— 欢迎将其等价移植到 pytest / cargo test / go test。

## 目录约定

![漫画图解：Archon 核心与平台目录](/images/setup/02-two-homes.png)

Archon 使用两层目录结构：

| 类别 | 目录 | 说明 |
|------|------|------|
| **核心 + 项目状态文件** | `.archon/` | soul 与可移植 helper，加上项目状态（manifest、drift、debt、memos、decisions）、可选 extensions 与 dashboard —— 跨平台同一路径 |
| **平台文件** | `.cursor/` 或 `.claude/` 等 | commands、agents、rules、skills —— 由平台自动加载 |

| 平台 | 平台目录 | 规则格式 |
|------|---------|---------|
| Cursor | `.cursor/` | `.mdc`（YAML frontmatter + Markdown） |
| Claude Code | `.claude/` | `.md`（Markdown） |

下文中，`{platform}/` 指代平台目录（例如 `.cursor/` 或 `.claude/`）。`.archon/` 在所有平台上都是同一路径。

## 交叉引用约定

![漫画图解：`<file> §<heading>` 是由 soul-anchor 测试机械校验的锚点](/images/setup/06-cross-ref.png)

Archon 文件之间通过 `<file> §<heading>` 语法相互引用：

```
soul.md §Autonomy Principles
soul/delivery.md §Reasoning Capsules
manifest.md §Context Budget
archon-demand §Decision Gate
```

`§` 字符绑定到目标文件中字面的 H2–H6 标题。每条这样的引用都由 Soul Anchor Consistency 测试机械校验（见 §3b Block 4）。重命名被引用的标题会让验证命令失败，直到所有引用方都更新完毕。

## 可选：导出独立的复用包（对当前项目零影响）

如果你身处 Archon 创作源仓库内，并希望为其他项目生成独立的复用包：

```bash
# Cursor 目标（默认）
npm run archon:export -- ./archon-standalone --overwrite

# Claude Code 目标
npm run archon:export -- ./archon-standalone --platform=claude-code --overwrite
```

导出目录将包含：
- 与项目无关的核心：`soul` + `domain-lenses`（含创作模板）+ `commands` + `agents` + 解耦规则 + 核心 skills（`archon-framework`、`archon-git-commit`、`blink-dispatch`、`external-agent-patterns`）
- 项目模板：`manifest.md` + `drift.md` + `debt.md` + `memos.md` + `.archon/decisions.md`
- 可移植的治理与 run-state helper：`.archon/contracts/governance-contract.yaml` + `scripts/archon-check.py` + `scripts/archon-check.sh` + `scripts/archon-run-state.mjs` + `scripts/archon-records.mjs`（ADR-22 records 文件夹再生器，用于 drift / memos / debt 的热摘要）
- 内附文档：`docs/archon/README.md` + `architecture.md` + `setup.md`（即本文）+ `decisions.md` + run-state schema/templates
- Commit hook 脚手架：`.husky/pre-commit`
- 平台入口（Claude Code 生成 `CLAUDE.md`）

然后将导出目录的内容复制到目标项目根，按下文步骤继续安装。

### 导出真源矩阵（Source-of-Truth Matrix）

修改 Archon 的导出内容时，先更新拥有该问题的真源：

| 问题 | 真源 | 由谁校验 |
|------|------|------|
| 哪些源文件会被复制进独立 kit？ | `scripts/export-archon-core.mjs` | 导出冒烟测试 + 导出清单契约 |
| 每个采用方必须收到的可移植基线文件是哪些？ | `.archon/contracts/governance-contract.yaml` `export_manifest.required_files` | `scripts/archon-check.py` + 导出清单契约 |
| 人类安装者期望看到什么？ | `docs/archon/setup.md` 导出概览 + 步骤 1 文件树 | 导出清单契约 |
| Agent 首先读什么以理解框架？ | `{platform}/skills/archon-framework/SKILL.md` | primer 导出/路由契约 |

不要只把要交付的工件加在文字描述里。先把它加到导出脚本，如果它属于可移植基线再加进治理契约，然后才更新面向采用方的文档与测试。

## 步骤 1：复制框架文件

以下文件**与项目无关** —— 直接从导出包或现有 Archon 项目复制：

```
.archon/                              ← Archon 核心 + 项目状态（跨平台同一路径）
├── soul.md                           ← 认知核心（hot-path 段：identity、axioms、guardrails、evolution）
├── soul/
│   ├── delivery.md                   ← 交付模式扩展（由 /archon-demand 加载）
│   └── review.md                     ← 评审模式扩展（由 /archon-plan、/archon-review 加载）
├── domain-lenses/                    ← Domain Lens pre-Verdict 索引 + proceed-only lens/tool 契约
│   ├── registry.yaml                 ← lens/tool 归属、发现元数据与预算的单一索引
│   ├── lenses/                       ← Lens 契约（已安装：dev + platform + ecosystem + capability + design）
│   ├── tools/                        ← 限定到单个 lens 的原子工具卡
│   └── templates/                    ← 用于新增领域的 Lens/tool 创作骨架
│       ├── lens.md                   ← Lens 契约模板
│       └── tool.md                   ← 原子工具卡模板
└── （manifest.md · drift.md · debt.md · memos.md · decisions.md 在步骤 2 中创建）
{platform}/                           ← 平台特定文件
├── commands/
│   ├── archon.md                     ← 统一入口（wake + 意图路由）
│   ├── archon-plan.md                ← 规划模式
│   ├── archon-demand.md              ← 交付模式（Decision Gate → 自驱执行 → Validation Gate → Close-Out）
│   ├── archon-review.md              ← 完整评审模式
│   └── archon-dashboard.md           ← 治理仪表盘启动器（可选；仪表盘本身在步骤 4 激活）
├── agents/
│   ├── archon-reviewer.md            ← 完整评审子代理
│   └── archon-capture-auditor.md     ← 交付后审计子代理
├── rules/
│   ├── archon.mdc (.md)              ← 解耦规则（什么内容可 / 不可放在哪个文件）
│   └── archon-wake.mdc (.md)         ← Wake 触发器 —— "hi archon" 自然语言激活；首次使用时也将 agent 路由到 primer skill
└── skills/
    ├── archon-framework/SKILL.md     ← Agent primer —— 框架自介，按需加载
    ├── archon-git-commit/SKILL.md    ← Commit-gate skill —— 任何 commit 前先读 Run-State v2 或 legacy .archon/run.md
    ├── blink-dispatch/SKILL.md       ← 薄切片子代理派发 gate —— 决定 skip vs use:<subagent>
    └── external-agent-patterns/SKILL.md ← 外部框架评估 skill —— 借用模式前先校验角色假设
.archon/contracts/governance-contract.yaml  ← 由参考检查器与创作侧测试共享的可移植治理契约
scripts/archon-check.py               ← 给非 TS 采用方使用的零依赖 Python 参考检查器
scripts/archon-check.sh               ← 包装 Python 检查器的 POSIX shell 封装
scripts/archon-run-state.mjs           ← 零依赖 Run-State v2 helper（init/set/check/commit 解析）
scripts/archon-records.mjs             ← 零依赖 records 文件夹再生器（ADR-22；用于 drift|memos|debt 的 new/regen/check）
```

每次交付的瞬态状态：

```
.archon/runs/<run_id>/state.json       ← Run-State v2 每次交付的状态（Verdict 之后激活，commit 成功后移除）
.archon/runs/<run_id>/events.ndjson    ← 用于调试/恢复的只追加事件轨迹
.archon/run.md                         ← 迁移期间的 legacy 单文件回退
.archon/templates/run-state.schema.json ← Run-State v2 的 schema 参考
.archon/templates/run.template.md  ← `.archon/run.md` 的 legacy schema 参考
```

> **Claude Code 额外步骤**：在项目根放置 `CLAUDE.md`，含 Archon 引导指令与命令索引（由导出脚本自动生成）。

### 各规则做什么

- **`archon-wake.mdc`** 是一条 always-applied 规则（约 20 行）。它检测自然语言 wake 短语（`hi archon …`），hot-path 读入所需的 `soul.md` identity/routing 段与 `manifest.md` current-state 段，然后将后续文本路由进 `archon` 命令。没有这条规则，用户每次都要显式键入 `/archon-*` 命令。
- **`archon.mdc`** 是解耦规则。它把项目状态文件（`manifest.md`、drift 日志、debt、memos、项目 ADR）与通用框架文件分离开。编辑器规则在编辑期间提示违例；评审子代理在事后审计。
- **`archon-framework/SKILL.md`** 是面向 agent 的 primer。在以下情况按需加载：(a) agent 首次进入 Archon 治理的项目，(b) 即将修改任何 archon 文件，(c) 即将通过新增 rule/skill/extension/ADR 来扩展 Archon，(d) 被问到 "what is Archon / how does this work?"。
- **`archon-git-commit/SKILL.md`** 是 commit-gate skill。当用户在 Archon 交付活动中请求 commit 时加载。它先解析 Run-State v2（`.archon/runs/<run_id>/state.json`），回退到 legacy `.archon/run.md`，断言 permit 标志与每个 SOP 变量都已完成，然后生成 Conventional Commits 消息并调用 git。当不存在活动 run-state 时委派给普通 `git-commit` skill。
- **`blink-dispatch/SKILL.md`** 是 close-out 子代理派发 gate。它对 diff 做薄切片，并在任何子代理被启动前发出 `subagent_dispatch: skip:<reason> | use:<subagent>:<reason>`。
- **`.archon/domain-lenses/`** 提供可选的 Domain Lens 协议，在已安装时由 `/archon-demand` 使用：从 registry 元数据中分类一个 lens、读取所选 lens 的路由器、加载有边界的原子工具集，并对多领域需求做分解，而非混淆身份。描述索引位于 `.archon/domain-lenses/registry.yaml`。

### Domain Lenses 与 Extensions 的区分

适配 Archon 时使用以下规则：

| 需求 | 机制 |
|------|-----------|
| 专业聚焦、可复用能力路由或领域工具集（PM、QA、开发、设计、规划、架构、创意、艺术） | `.archon/domain-lenses/` |
| 生命周期 hook（pre-scan、close-out、review、dashboard、demand-pool、项目本地工作流） | `.archon/extensions/` |

如果该能力改变的是 **Archon 思考一个 demand 的方式**，加 Domain Lens。如果它改变的是 **Archon 何时运行额外的生命周期行为**，加 Extension。

新增 Domain Lens 时遵循 `.archon/domain-lenses/README.md §Adding a Domain`：先 registry 入口与 `tool_index` 元数据，然后 lens 契约，再之原子工具。一个正常的新领域应该在不增加自定义测试逻辑的情况下通过现有的 Domain Lens 契约测试。

## 步骤 2：创建项目状态文件

![漫画图解：Archon 项目状态文件](/images/setup/03-project-state.png)

以下五个文件**与项目相关**。通过复制创作源的模板初始化它们：

| 文件 | 路径 | 模板 |
|------|------|----------|
| 项目热上下文 | `.archon/manifest.md` | `docs/archon/templates/manifest.template.md` |
| Drift 计数器 | `.archon/drift.md` | `docs/archon/templates/drift.template.md` |
| Debt 登记册 | `.archon/debt.md` | `docs/archon/templates/debt.template.md` |
| 利益相关者 memos | `.archon/memos.md` | `docs/archon/templates/memos.template.md` |
| 项目 ADR | `.archon/decisions.md` | `docs/archon/templates/decisions.template.md` |

> **单一真源**：模板只存在于 `docs/archon/templates/`。导出脚本直接读取这些文件，因此你收到的包已经在目标路径下含有初始化副本。不要从其他文档手抄骨架 —— `templates/*.template.md` 才是规范。

打开每个文件，将 `<!-- ... -->` 占位符替换为你项目的值，然后提交。`manifest.md` 是采用方的项目热地图；这些段尤为重要：

- **§Platform** —— 把逻辑名（Rules Directory、Skills Directory 等）映射到你 AI 平台的实际路径
- **§Product** —— 一段话：产品是什么、核心流程、商业模式
- **§Tech Stack** —— 你选择的框架与版本
- **§Validation Command** —— 单一的 `npm run validate` / `make validate` / `cargo test` / 等入口，运行 lint + typecheck + test
- **§Context Budget** —— 每文件行数上限（推荐起始值在模板中）
- **§Milestones & Acceptance Criteria** —— M0 验收项 + 质量门
- **§Current State** —— 当前里程碑标记

`manifest.md` 让当前状态、用户语言别名与最新 validation 保持热；必要时把长篇 latest-review 细节移到 `.archon/manifest/archive/<year>-Q<N>.md`。按 ADR-22 records 文件夹规则，`memos.md` 由 `.archon/memos/records/`（按日期取最近 5 条）自动生成 —— 不要手编辑；通过 `node scripts/archon-records.mjs new memos --topic "..." --conclusion "..." --source ".archon/memos-archive/<year>-Q<N>.md ? keyword: ..."` 创建一条 stakeholder-conclusion 记录文件，把完整 rationale 放进对应的 `memos-archive/<year>-Q<N>.md`。
`drift.md` 以 0 起步，日志表头就绪。
`debt.md` 以热 gate 索引起步，没有活动行；登记详细 debt 时把完整 rationale 放进 `debt/archive/<year>-Q<N>.md`。

需要保留的运行契约：

- `manifest.md` 的 `Latest review` 热行保留 `Latest validation target:`、validation 命令、有 bundle 时附 bundle 证据，以及一个 archive 指针。不要在那里复制易变的 `N files / M tests` 计数；详细评审历史保留在 `.archon/manifest/archive/<year>-Q<N>.md`。
- Drift archive 是冷交付日志。其 `Rows archived:` 头部必须与表中已归档交付行的数量匹配；参考 `drift-gates` 测试守卫这一点。
- 非 fast-path 的 close-out 行包含 Architecture Forecast（`risk|next|confidence`）。把它视为下一次 pre-scan 的预测，而不是 backlog 项，更不是跳过下一次 Verdict 的许可。

## 步骤 3：结构性守卫

![漫画图解：Archon 安装的机械守卫](/images/setup/04-mechanical-guards.png)

Archon 治理的有效性依赖于机械执行。下面三层守卫按执行强度排序（最强在前）。

### 3a. 验证命令

![漫画图解：单一 validate 命令 —— lint + typecheck + tests 汇入同一个 gate](/images/setup/07-validate-command.png)

在你的任务运行器中注册**一个单一入口**的验证命令，覆盖 lint + typecheck + test。这是所有质量检查的唯一通道。

示例（Node.js / package.json）：

```json
{
  "scripts": {
    "validate": "eslint . && tsc --noEmit && vitest run"
  }
}
```

在 `manifest.md §Validation Command` 中声明该命令。

### 3b. 治理测试（预算 · 比例 · Drift Gate · Anchors · 规则保留 · Convergence · Export）

所有 hot-path 治理文件**必须**在验证 gate 携带机械执行。十个独立契约 block 覆盖文档自身无法防止的失败模式：膨胀 · 部落知识 / 膨胀失衡 · drift 累积 · 引用断裂 · 静默文字流失 · manifest↔command 脱节 · 导出包自不一致 · commit-gate 绕过 · said-vs-truth 主张漂移 · 保留轴退化。

可移植基线位于 `.archon/contracts/governance-contract.yaml`。该文件是 JSON 兼容的 YAML，因此零依赖运行器可用标准库 JSON 支持解析。TypeScript 项目可保留原生测试实现，但创作源会断言其 TS registry 与该契约一致；非 TS 采用方可运行：

```bash
python scripts/archon-check.py --root .
# 或在 POSIX shell 上：
sh scripts/archon-check.sh .
```

#### Block 1：文件预算（防止膨胀）

治理文件每次交付都会膨胀。一旦超过上限，它们就会侵蚀 AI 的上下文预算。在 manifest 的 §Context Budget 表中声明上限；以测试形式断言它们。

```typescript
const FILE_BUDGET: Record<string, { limit: number; hint: string }> = {
  '.archon/soul.md':               { limit: 300, hint: 'Core soul — move mode-specific material to soul/<mode>.md' },
  '.archon/soul/delivery.md':      { limit: 150, hint: 'Delivery extension — move shared material back to core' },
  '.archon/soul/review.md':        { limit: 150, hint: 'Review extension — move shared material back to core' },
  '.archon/manifest.md':           { limit: 350, hint: 'Move long latest-review detail to .archon/manifest/archive/<year>-Q<N>.md' },
  '.archon/drift.md':              { limit:  70, hint: 'Move older complete rows to .archon/drift/archive/<year>-Q<N>.md' },
  '.archon/debt.md':               { limit:  40, hint: 'Keep hot gate index compact; move full rationale to .archon/debt/archive/<year>-Q<N>.md' },
  '.archon/memos.md':              { limit:  30, hint: 'Keep hot index compact; move full rationale to memos-archive/<year>-Q<N>.md' },
  '<decisions log>':               { limit: 300, hint: 'Archive superseded ADRs before any further cap raise' },
}
// 对每个文件：读取 → 计行数 → 期望 ≤ limit，错误信息携带 hint
```

#### Block 2：治理比例（同时防止膨胀和部落知识）

治理文件数 / 源文件数必须停留在 `[0.1, 0.5]` 内。低于 0.1 = 部落知识风险（隐含规则未写下来）；高于 0.5 = 治理膨胀。遍历治理目录与源目录，计算比例，断言两端边界。

#### Block 3：Drift Gate（防止 emergency 级 drift 不被审视）

解析 drift.md 的当前值与 emergency 阈值。如果 `current ≥ emergency`，尾行**必须**是 `**Review reset**` 条目 —— 否则项目处于损坏状态（已超过 emergency 上限继续执行 demand）。同一守卫还应断言渐进加载契约：热 drift 保留一个 Archive Index 与受预算约束的最近行，而 `.archon/drift/archive/*.md` 承载关键词索引的冷日志。没有这个测试，仅靠文档的 drift 预检经验上会被绕过（历史：drift 已达完整阈值的 108%，demand 仍在执行）。

#### Block 4：Soul Anchor Consistency（防止引用断裂）

当 `soul.md` 拆为核心 + 模式扩展（`soul/delivery.md`、`soul/review.md`）时，commands 与 agents 通过 §Cross-Reference Convention 中声明的 `soul[/delivery|review].md §X` 语法引用具体标题。重命名标题或在文件之间搬运内容的重构必须更新所有引用 —— 否则 agent 跟随的指针会指向一个不再存在的锚点。

扫描每个交叉引用源（commands、agents、soul 扩展）；对每个 `soul[/delivery|review].md §X` 匹配，断言目标文件存在且包含与 `§X` 匹配的标题。也断言扩展本身存在并被正确的命令加载。

#### Block 5：关键规则保留（防止静默文字流失）

段标题锚点检查（Block 4）保证标题存在，但不保证其下方实质性的规则正文仍然完整。一次后续编辑可能在锚点幸存的同时悄悄抽干一个段落 —— 没有 gate 抓得住。对于其机械强度依赖于文字本身（不仅仅是段存在）的规则，注册一条子串断言。

维护一个 `{ file, substring, rationale }` 三元组的 registry；对每条记录读文件并断言 `content.includes(substring)`。

**采用方项目以空 registry 起步。** registry 随项目 L3 起源的文字规则被提升至 L2 而有机增长 —— 每次提升加一行。当一条规则最终成为完整机械检查（例如解析器替代子串匹配）时，移除其 registry 条目。

**参考示例**（来自 Archon 创作源 —— 仅为说明，非规范）：

- `archon-demand §Decision Gate` 中的 Plan-mode binding 段 —— 关键词：`**Plan-mode binding**`、`BEFORE any write-side tool invocation`
- `archon-demand §Decision Gate` 中的 Convergence gate 子句 —— 关键词：`**Convergence gate**`、`out of convergence scope`
- `soul §Quality Discipline` 中的 two-hats 扩展子句 —— 关键词：`rename + a rule promotion on the same concept still counts as two hats`
- `soul §Knowledge Hygiene` 中的 Glossary scope 规则 —— 关键词：`Glossary scope`
- `soul/review §Proactive Scrutiny` 中的 Vocabulary-coherence 问题 —— 关键词：`**Vocabulary coherence**`

这些来自 Archon 源仓库历史中的具体交付。不要把它们逐字抄进新建的采用方项目 —— 它们会失败，因为你的 soul 文件还没有这些短语。

#### Block 6：Convergence Gate 契约（防止 manifest↔command 脱节）

**激活是有条件的**：在"开放期"（未启用强制收敛）该测试为 no-op。仅当项目选择启用里程碑级强制收敛时才生效。

如果 manifest 的 `§Current State` 声明了 `Convergence scope: [<DEBT-IDs>]` 字段（强制收敛激活），则 `archon-demand` 命令文件**必须**包含 `**Convergence gate**` 子句和 `out of convergence scope` 拒绝短语 —— 否则 Verdict 步骤就没有可对该范围执行的依据。当 `Convergence scope` 缺失时，断言提前返回，不施加任何约束。

即使非激活也把这个 block 留在测试文件里 —— 它没有成本，并在 manifest 声明 scope 的瞬间自动激活。

#### Block 7：导出清单契约（防止分发包自不一致）

当项目是 Archon **创作源**（出货 `scripts/export-archon-core.mjs` 等价物）时，导出清单必须与本安装指南和 README 的文件树一致。如果 setup.md 或 README 描述了一个未导出的文件，采用方项目会收到沉默的缺口；如果导出包了一个文档没提的文件，采用方 agent 会发现孤儿文件却不知如何使用。

测试检查导出脚本的文件列表（核心文件 + 平台文件 + 模板文件 + 文档文件 + skill 文件），并对本安装指南步骤 1 文件树与 README 的 Quick Overview 双向断言覆盖。

不维护自己的导出脚本的采用方项目可以安全跳过 Block 7。

#### Block 8：Run-State 契约（防止 Commit-Gate 绕过）

Run-State v2（`.archon/runs/<run_id>/state.json`）是 Verdict + Close-Out 聊天声明的机器可读对应物。它仅在交付进行时存在 —— Verdict 之后激活、按阶段更新、由 `archon-git-commit` 在 commit 成功后移除。Legacy `.archon/run.md` 作为尚未出货 helper 的采用方项目的迁移回退保留。四个常开契约检查确保管线即使在交付间隙也保持诚实：

1. `.archon/templates/run-state.schema.json` 与 legacy `run.template.md` 存在且被打包进导出。
2. `{platform}/skills/archon-git-commit/SKILL.md` 存在并被注册到导出的平台文件中。
3. pre-commit hook 调用 `scripts/archon-run-state.mjs resolve-for-commit` 并保留 legacy `permit_commit` 回退。
4. `archon-demand.md` 包含 "Run-State Lazy Activation" 子句并文档化 v2 `permitCommit` 与 legacy `permit_commit: 1`。

第五项检查仅在存在 legacy `.archon/run.md` 时激活：YAML 头部声明 `demand` · `mode` · `started_at` · `plan_mode` · `convergence`；存在 `permit_commit: 0|1` 行；状态 token 仅使用 `1` / `0` / `2` / `skip:<reason>`；行数 ≤ 50。V2 活动状态由 `scripts/archon-run-state.mjs check` 检查。

该 block 防止五种具体的失败模式：忘记出货 schema/helper（采用方无法学习或操作此格式）、删掉 skill（commit gate 失去阅读者）、破坏 hook（commit gate 失去执行者）、让 archon-demand.md 静默抽干其 run-state 指令（agent 停止初始化状态）、把单文件并发瓶颈作为默认路径再引入。

#### Block 9：Claim Verifier（防止 Said-vs-Truth 治理漂移）

治理文字会悄悄与仓库分叉：从记忆引用的测试计数、没有溯源的借词概念、引用自身作为依据的 soul 编辑、没有证据却声称已触发的触发器，或塞着挥手证据的 Preservation 检查行。每种失败模式都被作为各自的 debt 跟踪过（DEBT-058 numeric · DEBT-066 borrowed · DEBT-070 self-cite · DEBT-071 missed-trig · DEBT-074 preservation substance）。按 ADR-27，单一 verifier 统合该家族：

```bash
npm run archon:verify        # 运行所有模式
# 或单独：
node scripts/archon-claim-verifier.mjs --mode=numeric
node scripts/archon-claim-verifier.mjs --mode=borrowed
node scripts/archon-claim-verifier.mjs --mode=self-cite
node scripts/archon-claim-verifier.mjs --mode=missed-trig
node scripts/archon-claim-verifier.mjs --mode=preservation
```

所有模式共享单一报告前缀 —— `[claim-verifier:<mode>] <FAIL|WARN>: <file> — <msg>` —— 因此一次 `grep` 无论模式如何都能浮现每条主张漂移。Verifier 已接入 `npm run validate`（错误 fail closed，警告浮现）与 `.husky/pre-commit`。可移植 `archon-check.py` 仍是采用方端契约检查器；verifier 是逐次交付针对 `git diff` 或 `.archon/*/records/` 最近条目的扫描。家族未来的成员以新模式而非新脚本的形式加入 —— 当脚本超过约 300 行时，模式被重构进索引背后的独立文件，而不是拆成并行 CLI。

**Preservation 模式**值得特别说明（按 ADR-28 强化）：它对 Close-Out Preservation 行的两种退化形态把关。`none-this-cycle(<evidence>)` 逃生阀要求 evidence ≥ 40 字符 AND 一个扫描动词（如 `scanned`、`reviewed`、`checked`）AND 一个具名扫描目标；挥手字符串 fail closed。首通退化守卫捕捉一个引入交付把自己刚加入的锚点钉为 `pinned(...)` —— 这种 pin 必须用 `first pass`、`introducing delivery` 或 `pinned-bootstrap` 框定，否则 verifier 拒绝这种自我升格，直到至少有一个后续周期落地。

#### Block 10：Preservation Axis Imperatives（演化的第二动作）

除了 Block 9 的 claim-verifier 实质 gate，ADR-28 引入的 Preservation 动作还携带三个非 verifier 契约点：

1. **Close-Out 检查行** —— `archon-demand.md §Close-Out` 包含一个 `Preservation pass:` 行，仅接受 `pinned(<anchor>+<test>+<contract>)` 或 `none-this-cycle(<evidence>)`。该行缺失会让 anchor-consistency 失败（Block 4）。
2. **Capture-auditor §Preservation Scan** —— 审计协议必须列出 5 个 jobs 与 7 个 steps（5 jobs + 2 setup），编号 1..N 连续。一个 L1 step-count 测试捕捉 "新增 step + 忘记重新编号"（如出现两个 step "4"）。
3. **Header-anchor body-shape 声明** —— 关键规则 registry 中每条 header-shape 条目**必须**声明 `body_shape: 'has-body-shape-test' | 'header-only' | 'token-only'`。声明缺失会让 L1 lint 失败；`has-body-shape-test` 条目必须配对真实的 body-shape 断言（与 Block 5 相同，但按 ADR-28 强化加入了类型级执行）。

这三个守卫一起把 Preservation 变成机械三元组（registry anchor + body-shape 测试 + 可移植契约条目），而非文字提醒。原因见 decisions log 中的 ADR-28。

**交付日志 + 交付后回顾**：每次完成的 demand 都写一条 drift 日志，然后**同时**追问：(a)(b)(c) 已交付的工作或交付过程本身是否应改进（结晶 / crystallization），AND (d) 此次交付是否依赖一个应被钉住的承重锚点（按 ADR-28 的保留 / preservation）。让该回顾保持轻量：把一次性观察记录在 drift 条目中，只把重复失败、auditor/reviewer 发现、不稳定的手工步骤或机械可执行的约束提升到 debt/rule/test/skill/ADR。每次回顾用 `evolution_triage=stats-pass|first-principles-pass|stay-in-drift` 给信号打标签：统计法只在出现 2-3 个相关样本后过滤常规噪声，而第一性原理仅在罕见一次性信号证伪了一项核心假设并命名最小验证实验时才允许放行。该标签也用 `evolution_evidence=stats(...)`、`evolution_evidence=first-principles(...)` 或 `evolution_evidence=drift(...)` 携带匹配的紧凑证据。Preservation 答案记为 `preservation: pinned(<anchor>+<test>+<contract>) | none-this-cycle(<evidence>)`。这能让 Archon 在每次交付后**既学习又保留**，又不至于把 Close-Out 变成不断膨胀的清单。

**参考实现**：见 `.archon/contracts/governance-contract.yaml` 加 `scripts/archon-check.py` 作为零依赖基线。Archon 创作仓库的 `governance.test.ts` 仍是 TypeScript 参考实现，并断言其可移植 registry 与 YAML 契约一致。

**关于子目录测试运行器的说明**：如果你的测试框架在子目录运行（例如 `web/`），测试文件的 `ROOT` 常量必须解析到项目根，以便它能从真实路径读取 `.archon/*`。常见模式：`const ROOT = resolve(process.cwd(), '..')`。

### 3c. Pre-commit Hook

![漫画图解：pre-commit 是两个串行的独立 gate —— 验证 gate + 生命周期 gate](/images/setup/08-pre-commit-gates.png)

git pre-commit hook 做两件事：
1. **运行验证命令**（代码质量 + 治理预算，全部由测试覆盖）
2. **生命周期 gate**（检查 git staged 状态 —— 这只能在 hook 中做）

参考实现（Husky）：

安装：
```bash
npm install -D husky
npx husky init
```

`.husky/pre-commit`：
```bash
# 把 <source-dir> 替换为你的源目录，<validate-command> 替换为 manifest.md 中的验证命令
cd <source-dir>
<validate-command>

cd ..

# ── Archon Lifecycle Gate ──
# 源代码变更必须伴随 drift 日志更新，
# 以确保交付的 close-out 流程未被跳过。
if git diff --cached --name-only | grep -q '^<source-dir>/'; then
  if ! git diff --cached --name-only | grep -q '^.archon/drift\.md$'; then
    echo ""
    echo "⛔ Archon lifecycle gate: source changed but drift.md not staged."
    echo ""
    echo "   Complete delivery closing steps before committing:"
    echo "   1. Sync manifest   2. Run Blink Dispatch/subagent steps   3. Update drift log"
    echo ""
    exit 1
  fi
fi

# ── Archon Run-State Gate (ADR-14 / v2) ──
# 活动 v2 交付必须解析到恰好一个 permitCommit=true 的 run。
node scripts/archon-run-state.mjs resolve-for-commit

# Legacy 回退：存在的 run.md 必须有 permit_commit: 1 —— 否则
# Verdict · execute · validate · close-out SOP 还有未完成步骤。
if [ -f .archon/run.md ]; then
  if ! grep -qE '^permit_commit:[[:space:]]*1[[:space:]]*$' .archon/run.md; then
    echo ""
    echo "⛔ Archon run-state gate: active delivery has pending SOP steps."
    echo ""
    echo "   Pending (first 5 rows with status=0):"
    grep -E '\|[[:space:]]*0[[:space:]]*\|' .archon/run.md | head -5 | sed 's/^/     /'
    echo ""
    echo "   Complete the remaining steps per archon-demand.md § Close-Out,"
    echo "   or 'rm .archon/run.md' to abandon this delivery."
    echo ""
    exit 1
  fi
fi
```

**关注点分离**：可测试约束放进测试（治理预算、代码标准）；依赖 git 状态的检查放进 hook（staged 文件检查）。让 hook 保持精简。

### 3d. Run-State 文件（ADR-14 / v2）

![漫画图解：Run-State 是瞬态的 —— Verdict 后出现，commit 后移除，gitignored](/images/setup/09-run-state-lifecycle.png)

Run-State v2 把每次交付一个目录存储：`.archon/runs/<run_id>/state.json` 加可选 `events.ndjson`。它是**瞬态的** —— Verdict 后激活、随每个 SOP 阶段完成而更新、`archon-git-commit` skill 在 commit 成功后移除。交付间隙没有活动 run 目录。

**必须 gitignored。** 在采用 commit gate 之前把 `.archon/runs/` 与 legacy `.archon/run.md` 加入仓库的 `.gitignore`。这些文件携带飞行中的状态，绝不应进入历史：提交它们会引发 ping-pong 的 diff，并把每会话上下文泄漏到日志中。

**并发模型**：v2 移除了单例瓶颈。每次交付有不同的 `run_id`，commit-time 解析在存在多个 commit-ready run 时 fail closed，除非 `ARCHON_RUN_ID` 显式给出。解析器还拒绝未列在被选 run 的 `changedPaths` 中的 staged 文件，防止第二会话的文件被扫进错误的 commit。Git worktree 仍是真正并发编辑的推荐方式，因为对同一文件的重叠编辑仍是源代码控制问题，而非 run-state 问题。Legacy `.archon/run.md` 仅出于迁移目的保留旧的 demand-mismatch 回退。

**Schema**（见 `.archon/templates/run-state.schema.json`）：

```json
{
  "schemaVersion": 2,
  "runId": "20260425-abc123",
  "demand": "...",
  "status": { "validate.validation_green": "1" },
  "changedPaths": ["..."],
  "permitCommit": true
}
```

状态值不变：`1`（已完成）、`0`（待办/进行中）、`2`（**用户意图智能跳过**，ADR-15 —— 仅在 permission-list 行上，需要 drift rationale）、`skip:<reason>`（模式驱动 bypass）。`permitCommit: true` 是最终 gate，仅当每个所需状态完成后才被设置。

**`2` vs `skip:*` —— 审计强度不同。** `skip:*` 在 token 自身携带其原因（结构性 / 模式驱动）并通过静态检查。`2` 表示一个人选择 bypass；原因外置于 drift.md 中，形如 `smart-skip: <phase>.<variable> — <reason>`，由 governance.test.ts Block 8 交叉引用。仅当用户明确请求时使用 `2`（祈使句、对 agent 提案的肯定回复，或 demand 级 `[trivial] / [quick patch] / [docs-only]` 提示）。Agent 自己判断某步骤不需要属于模式类 skip（`skip:no-change` / `skip:no-decision-value` / `skip:no-extensions`）—— 不要把它走私进 `2`。permission list（六行：`prescan.archive_scanned`，所有五个非终结的 `closeout.*` 审计行）是硬限制 —— soul 强制行（validate / drift_updated / statement_output 等）从不接受 `2`。

**模式特定形态**：
- **Standard**（默认）：约 21 行，跨越 boot · prescan · decision · execute · validate · closeout。
- **Fast-path**：四行 `decision.verdict_output` · `execute.changes_applied` · `validate.validation_green` · `closeout.drift_updated`（+ `closeout.manifest_synced` · `closeout.statement_output`）保持 `1`；其他全部为 `skip:fast-path`。
- **Rejected**（`Verdict=reject`）：`decision.verdict_output` + `closeout.drift_updated` + `closeout.statement_output` 保持 `1`；execute / validate 与多数 closeout 行变为 `skip:rejected`。

**为何使用独立的运行时目录**（vs. 内联进 drift.md 或 memos.md）：`drift.md` 是只追加历史日志 —— 飞行中状态会污染它。Close-Out 声明活在聊天里，compact 后消失。`.archon/runs/<run_id>/state.json` 是飞行中进度的机械账本，也是 pre-commit hook 在放行 commit 之前唯一应该咨询的工件。

### 3e. 破坏性 Git 守护栏（B4 L1 拦截）

Soul §Constraints 携带一条 "no destructive git without drift rationale" 规则。只要它仅以文字存在，人与 agent 都可能用一条 `git push --force` 或 `git reset --hard` 静默违反。B4 通过**两个独立的机械拦截器**把这条规则从 L3 提升到 L1，二者一起覆盖每条客户端路径：

1. **`.husky/pre-push` hook** —— 客户端无关，对*任何*到达 git 的 push（CLI、VS Code、JetBrains、Cursor、GUI 客户端）触发。阻断 `--force` / `--force-with-lease` 与非 fast-forward 的 push。因为它运行在 git 内部，无法通过选择不同终端或编辑器绕过。
2. **Cursor `beforeShellExecution` hook**（`.cursor/hooks/archon-destructive-guard.mjs`）—— agent-shell 守卫，在 agent 执行任何 shell 命令前触发。在 `git reset --hard`、`git branch -D`、`git clean -f*`、`git checkout -B` 触及工作树前拦截。**解析失败 fail closed** —— 不可解析的命令被拒绝，绝不静默放行。

**Bypass 必须显式**：`ARCHON_ALLOW_DESTRUCTIVE=1 <command>` 让一次调用通过，但下一次 Close-Out **必须**记录一条 drift 行说明命令与原因。原因缺失会在下一次交付触发 claim-verifier 的 `missed-trig` 模式。

**跨平台说明**：`.gitattributes` 把 `*.sh` 与 `.husky/*` 钉为 LF，防止 Windows `core.autocrlf` 损坏 hook 的 shebang。Cursor hook 用 Node（`*.mjs`）实现，正是因为 Cursor 在 Windows 上把 `/bin/sh` 解析为 WSL，会破坏 POSIX shell hook —— Node 在三个平台上运行一致。

**治理锚定**：3 条可移植契约条目（`governance-contract.yaml`）+ 3 条关键规则子串（Block 5 registry）+ 导出清单包含守卫脚本与 hook 配置。移除其中任意一个锚点而不配套编辑会导致 Block 4（anchor 一致性）或 Block 7（导出清单）失败。

不使用 Cursor 的采用方项目可以只出货 pre-push hook，跳过 `.cursor/hooks/` 那一半。希望把破坏性操作作为常态许可的采用方项目可以完全移除 pre-push hook —— 但接着 soul §Constraints 也必须删去 no-destructive-git 规则，让文字与机制保持一致。

## 步骤 4：可选增强

按需添加 —— 初始安装并不要求，但每一项都随项目成长封堵一个具体的治理缺口。

### Lint 规则桥

让 linter 错误信息指向平台 rules 目录中的规则文件，形成 L1→L2 的活动触发回路。

**约定**：自定义 lint 规则错误信息格式 = 自包含修复指导 + `→ Read <rule-file-path>`。

示例（ESLint `no-restricted-imports`，Cursor 平台）：

```javascript
{
  message: 'Pages import from @/lib/api directly. Use hooks instead. → Read .cursor/rules/frontend.mdc',
}
```

### 项目规则（Rules 目录）

编码标准、架构边界、设计系统规范以及其他项目特定的编辑器规则。对每条规则，自问"由谁保证它被遵守？" —— 如果答案是"读到的人"，考虑把它推到 lint 规则上去。

### Skill 文档（Skills 目录）

可复用的领域知识：设计系统、API 规范、框架最佳实践、组件指南等。在 `manifest.md §Knowledge Assets` 维护索引。预装的 `archon-framework` skill 作为可工作示例，永久保留。

### 架构决策记录

`.archon/decisions.md` —— 采用方项目的项目特定 ADR。每条记录日期、状态、决策、依据、影响和重新评估触发器。`docs/archon/decisions.md` 是另一回事：它解释随可复用 kit 出货的 Archon 框架决策。

### Extensions（`.archon/extensions/`）

Extensions 是项目特定能力，挂入 Archon 固定生命周期点而不修改核心文件。它们实现插件模式：安装 = 创建带 `extension.md` 的目录；卸载 = 删除目录。

**生命周期点** extensions 可以挂入（在 `soul.md §Extension Points` 中声明）：

| 点 | 命令 | 何时 |
|-------|---------|------|
| `demand.pre-scan` | archon-demand | 加载 memos 之后，decision gate 之前 |
| `demand.close-out` | archon-demand | 利益相关者 memos 之后，git 之前 |
| `plan.perception` | archon-plan | 状态感知阶段中 |
| `plan.output` | archon-plan | 优先级排序之后，最终输出之前 |
| `review.health` | archon-review | 知识健康审计中 |

**预算规则**：每项目最多 3 个活动 extensions，每个 hook 声明 ≤ 15 行。Extensions **不**与核心 kit 一起导出 —— 它们始终是项目本地的。完整的发现协议与 `extension.md` 文件格式见 `soul.md §Extension Points`。

### Dashboard（`.archon/dashboard/`）

一个零依赖 Node.js dashboard，通过直接解析 `.archon/*.md` 来可视化治理状态（里程碑、drift 日志、debt 登记册、ADR 时间线、交付节奏）。

- **安装**：dashboard 是可选的，默认不被导出。需要治理可视化时从创作源复制 `.archon/dashboard/`。
- **启动**：运行 `/archon-dashboard` 或 `node .archon/dashboard/server.js`。
- **停用**：删除 `.archon/dashboard/`。`archon-dashboard` 命令在目录回归之前会 no-op。
- **可选 heartbeat 规则**（`{platform}/rules/archon-heartbeat.mdc`）：通过在交付期间写瞬态 heartbeat 文件提供更精准的会话状态推断。完全可选 —— heartbeat 缺失时，dashboard 回退到从 transcript 被动推断。

## 步骤 5：验证安装

运行 `/archon plan`（或 `/archon-plan`）。Archon 会 hot-path 读取所需的 `soul.md`、`soul/review.md`、`manifest.md` 和 `drift.md` 段，然后基于项目状态输出下一步建议。如果它产出连贯的总结与计划，框架就成功加载。

此外，agent 应在该会话首次与 Archon 相关的动作上咨询 `archon-framework` skill —— `archon-wake.mdc` 会引导它过去。如果你想手动测试 primer 流程，问 agent "what is Archon and how does this project use it?" —— 它应当引用 `{platform}/skills/archon-framework/SKILL.md`。

## 检查表

| 步骤 | 工件 | 验证 |
|------|------|----------|
| 复制框架文件 | `.archon/soul.md` + `.archon/soul/{delivery,review}.md` + `{platform}/{commands,agents,rules,skills}/archon*` | 所有文件存在；rules 中含 `archon-wake.mdc` 与 `archon.mdc`；skills 中含 `archon-framework/SKILL.md` + `archon-git-commit/SKILL.md` + `blink-dispatch/SKILL.md` |
| 创建 manifest | `.archon/manifest.md` | 平台映射 + 所有 `<!-- -->` 占位符已填；§Context Budget、§Validation Command、§Milestones 存在 |
| 创建 drift | `.archon/drift.md` | `drift: 0`，日志表头就绪 |
| 创建 debt | `.archon/debt.md` | 模板已复制，Archive Index + Active Debt Index 段就绪 |
| 创建 memos | `.archon/memos.md` | 模板已复制，Archive Index + Hot Memos 段就绪 |
| Run-state schema/helper | `.archon/templates/run-state.schema.json` + `scripts/archon-run-state.mjs` | 文件存在；`.archon/runs/` 与 legacy `.archon/run.md` 已 gitignored 且**未**在此创建 —— 它们只在活动交付期间出现 |
| 注册验证命令 | package.json / Makefile 等 | 命令运行并通过绿色 |
| 治理测试（6-8 个 block） | 测试文件 | Validation 运行：预算（≥7 个文件）+ 比例 [0.1, 0.5] + drift gate + manifest/memos/debt 热索引/归档契约 + soul anchors + 关键规则子串（registry 可起步为空）+ convergence-gate 契约（可为 no-op）+ 导出清单契约（仅创作源）+ run-state 契约（template + skill + hook + demand-cmd 子句） |
| Pre-commit hook | `.husky/pre-commit` 或等价 | `git commit` 触发 validation + lifecycle gate + run-state gate（当 `.archon/run.md` 存在时） |
| 第一次 plan | `/archon plan` 或 `/archon-plan` 输出 | Archon 正确加载所需 soul/manifest 段；首个 archon 相关动作上咨询 `archon-framework` skill |
