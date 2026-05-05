# Archon 安装指南

> 将 Archon 框架集成到新项目的完整步骤。Archon 的可复用机制与项目无关、与平台无关；每个采用方仍需在 `.archon/` 下填入项目状态文件。

![漫画图解：Archon 安装路线](/images/setup/01-install-route.png)

安装只有一条路线：导出或复制框架、填入项目状态、安装机械守卫，然后运行第一次 plan，证明 agent 能加载到正确的上下文。

## 前置条件

![漫画图解：安装前的三个前提 —— IDE、git 仓库、任务运行器](/images/setup/05-prereqs.png)

- 一个能加载基于 markdown 的 rules、skills 和 commands 的 AI 编码平台（Cursor、Claude Code 或同类产品）
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

## 可选：导出独立复用包（对当前项目零影响）

如果你身处 Archon 撰写源仓库，并希望为其他项目生成一个独立的复用包：

```bash
# Cursor 目标（默认）
npm run archon:export -- ./archon-standalone --overwrite

# Claude Code 目标
npm run archon:export -- ./archon-standalone --platform=claude-code --overwrite
```

导出目录将包含：
- 项目无关的核心：`soul` + `domain-lenses`（含撰写模板） + `commands` + `agents` + 解耦规则 + 核心 skills（`archon-framework`、`archon-git-commit`、`blink-dispatch`、`external-agent-patterns`）
- 项目模板：`manifest.md` + `drift.md` + `debt.md` + `memos.md` + `.archon/decisions.md`
- 可移植治理与 run-state helper：`.archon/contracts/governance-contract.yaml` + `scripts/archon-check.py` + `scripts/archon-check.sh` + `scripts/archon-run-state.mjs` + `scripts/archon-records.mjs`（ADR-22 records-folder 重生器，用于 drift / memos / debt 热摘要）
- 内附文档：`docs/archon/README.md` + `architecture.md` + `setup.md`（本文件） + `decisions.md` + run-state schema/templates
- Commit hook 脚手架：`.husky/pre-commit`
- 平台入口（Claude Code 会生成 `CLAUDE.md`）

然后将导出目录的内容复制到目标项目根目录，继续按下文的安装步骤进行。

### 导出真源（Source-of-Truth）矩阵

修改 Archon 导出内容时，先更新拥有该问题的源：

| 问题 | 真源（Source of Truth） | 由谁校验 |
|------|------|------|
| 哪些源文件被复制进独立 kit？ | `scripts/export-archon-core.mjs` | 导出冒烟测试 + export-manifest contract |
| 每个采用方必须收到哪些可移植基线文件？ | `.archon/contracts/governance-contract.yaml` 中的 `export_manifest.required_files` | `scripts/archon-check.py` + export-manifest contract |
| 人类安装者期望看到什么？ | `docs/archon/setup.md` 导出摘要 + 步骤 1 的目录树 | export-manifest contract |
| Agent 第一时间读什么来理解框架？ | `{platform}/skills/archon-framework/SKILL.md` | primer 导出/路由 contract |

不要只把已发布产物加进散文里。先加到导出脚本，若它属于可移植基线再加进 governance contract，最后更新面向采用方的文档与测试。

## 步骤 1：复制框架文件

下列文件**与项目无关** —— 直接从导出包或现有 Archon 项目复制：

```
.archon/                              ← Archon 核心 + 项目状态（跨平台同一路径）
├── soul.md                           ← 认知核心（热路径区段：identity、axioms、guardrails、evolution）
├── soul/
│   ├── delivery.md                   ← Delivery 模式扩展（由 /archon-demand 加载）
│   └── review.md                     ← Review 模式扩展（由 /archon-plan、/archon-review 加载）
├── domain-lenses/                    ← Domain Lens 的 pre-Verdict 索引 + proceed-only lens/tool 契约
│   ├── registry.yaml                 ← lens/tool 成员、发现元数据与预算的单一索引
│   ├── lenses/                       ← Lens 契约（已安装：dev + platform + ecosystem + capability + design）
│   ├── tools/                        ← 限定到单个 lens 的原子 tool 卡
│   └── templates/                    ← 新领域使用的 lens/tool 撰写骨架
│       ├── lens.md                   ← Lens 契约模板
│       └── tool.md                   ← 原子 tool 卡模板
└── （manifest.md · drift.md · debt.md · memos.md · decisions.md 在步骤 2 创建）
{platform}/                           ← 平台特定文件
├── commands/
│   ├── archon.md                     ← 统一入口（wake + intent 路由）
│   ├── archon-plan.md                ← Planning 模式
│   ├── archon-demand.md              ← Delivery 模式（Decision Gate → 自驱执行 → Validation Gate → Close-Out）
│   ├── archon-review.md              ← 完整 review 模式
│   └── archon-dashboard.md           ← 治理仪表盘启动器（可选；仪表盘本身在步骤 4 激活）
├── agents/
│   ├── archon-reviewer.md            ← 完整 review 子 agent
│   └── archon-capture-auditor.md     ← 交付后审计子 agent
├── rules/
│   ├── archon.mdc (.md)              ← 解耦规则（每个文件可放/不可放什么）
│   └── archon-wake.mdc (.md)         ← Wake 触发器 ——「hi archon」自然语言激活；同时在首次使用时把 agent 路由到 primer skill
└── skills/
    ├── archon-framework/SKILL.md     ← Agent primer —— 按需加载的框架自我介绍
    ├── archon-git-commit/SKILL.md    ← Commit-gate skill —— 任何 commit 之前读取 Run-State v2 或 legacy .archon/run.md
    ├── blink-dispatch/SKILL.md       ← 薄切片 subagent 派发闸 —— 决定 skip vs use:<subagent>
    └── external-agent-patterns/SKILL.md ← 外部框架评估 skill —— 借鉴模式前先核查角色假设
.archon/contracts/governance-contract.yaml  ← 引用检查器与撰写测试共享的可移植治理契约
scripts/archon-check.py               ← 面向非 TS 采用方的零依赖 Python 引用检查器
scripts/archon-check.sh               ← 围绕 Python 检查器的 POSIX shell 包装
scripts/archon-run-state.mjs           ← 零依赖 Run-State v2 helper（init/set/check/commit 解析）
scripts/archon-records.mjs             ← 零依赖 records-folder 重生器（ADR-22；drift|memos|debt 的 new/regen/check）
```

每次交付的临时状态：

```
.archon/runs/<run_id>/state.json       ← Run-State v2 单次交付状态（Verdict 后激活，commit 成功后移除）
.archon/runs/<run_id>/events.ndjson    ← 用于调试/恢复的只追加事件追踪
.archon/run.md                         ← 迁移期间的 legacy 单文件回退
.archon/templates/run-state.schema.json ← Run-State v2 的 schema 参考
.archon/templates/run.template.md  ← .archon/run.md 的 legacy schema 参考
```

> **Claude Code 额外**：在项目根放置 `CLAUDE.md`，包含 Archon 启动指令与命令索引（由导出脚本自动生成）。

### 各 rule 的职责

- **`archon-wake.mdc`** 是 always-applied 规则（约 20 行）。它检测自然语言 wake 短语（`hi archon …`），热路径读取必需的 `soul.md` identity/routing 区段以及 `manifest.md` current-state 区段，然后把后续文本路由到 `archon` 命令。没有这条规则时，用户每次都得显式键入 `/archon-*` 命令。
- **`archon.mdc`** 是解耦规则。它把项目状态文件（`manifest.md`、drift logs、debt、memos、项目 ADRs）与通用框架文件分开。编辑器规则在编辑期暴露违规；review 子 agent 事后审计。
- **`archon-framework/SKILL.md`** 是面向 agent 的 primer。在以下情况按需加载：(a) agent 首次遇到 Archon 治理的项目；(b) 即将修改任何 archon 文件；(c) 即将用新 rule/skill/extension/ADR 扩展 Archon；或 (d) 被问到「Archon 是什么 / 这个项目怎么用它？」。
- **`archon-git-commit/SKILL.md`** 是 commit-gate skill。当用户在一次活跃的 Archon 交付中要求 commit 时加载。它先解析 Run-State v2（`.archon/runs/<run_id>/state.json`），回退到 legacy `.archon/run.md`，断言 permit 标志与每个 SOP 变量已完成，然后生成 Conventional Commits 消息并调用 git。当无活跃 run-state 时，委派给普通的 `git-commit` skill。
- **`blink-dispatch/SKILL.md`** 是 close-out subagent 派发闸。它对 diff 做薄切片，并在任何 subagent 启动前发出 `subagent_dispatch: skip:<reason> | use:<subagent>:<reason>`。
- **`.archon/domain-lenses/`** 提供可选的 Domain Lens 协议，由 `/archon-demand` 在已安装时使用：从 registry 元数据分类一个 lens、读取所选 lens 路由器、加载受限的原子工具集、并对多领域需求做分解，而不是混合身份。描述索引位于 `.archon/domain-lenses/registry.yaml`。

### Domain Lenses 与 Extensions 的对比

适配 Archon 时使用此规则：

| 需求 | 机制 |
|------|-----------|
| 专业聚焦、可复用能力路由或领域工具箱（PM、QA、开发、设计、规划、架构、创意、艺术） | `.archon/domain-lenses/` |
| 生命周期钩子（pre-scan、close-out、review、dashboard、demand-pool、项目本地工作流） | `.archon/extensions/` |

如果该能力改变了 **Archon 如何思考一次需求**，加 Domain Lens。如果它改变了 **Archon 何时运行额外的生命周期行为**，加 Extension。

新增 Domain Lens 时，遵循 `.archon/domain-lenses/README.md §Adding a Domain`：先 registry 条目与 `tool_index` 元数据，然后 lens 契约，最后原子 tools。一个正常的新领域应当无需新增自定义测试逻辑就通过现有的 Domain Lens contract 测试。

## 步骤 2：创建项目状态文件

![漫画图解：Archon 项目状态文件](/images/setup/03-project-state.png)

下列五个文件**与项目相关**。通过复制撰写源的模板来初始化：

| 文件 | 路径 | 模板 |
|------|------|----------|
| 项目热上下文 | `.archon/manifest.md` | `docs/archon/templates/manifest.template.md` |
| Drift 计数器 | `.archon/drift.md` | `docs/archon/templates/drift.template.md` |
| Debt 注册表 | `.archon/debt.md` | `docs/archon/templates/debt.template.md` |
| 干系人 memos | `.archon/memos.md` | `docs/archon/templates/memos.template.md` |
| 项目 ADRs | `.archon/decisions.md` | `docs/archon/templates/decisions.template.md` |

> **唯一真源**：模板只存在于 `docs/archon/templates/`。导出脚本直接读取这些文件，所以你收到的包在目标路径上已经包含初始化好的副本。不要从其他文档手工复制骨架 —— `templates/*.template.md` 是规范。

打开每个文件，把 `<!-- ... -->` 占位符替换为项目的取值并提交。`manifest.md` 是采用方的项目热地图；以下区段最重要：

- **§Platform** —— 把逻辑名（Rules Directory、Skills Directory 等）映射到你的 AI 平台的实际路径
- **§Product** —— 一段话：产品是什么、核心流程、商业模式
- **§Tech Stack** —— 你选择的框架与版本
- **§Validation Command** —— 跑 lint + typecheck + test 的单一入口点（`npm run validate` / `make validate` / `cargo test` 等）
- **§Context Budget** —— 单文件行数上限（模板里有推荐起始值）
- **§Milestones & Acceptance Criteria** —— M0 验收项 + 质量门
- **§Current State** —— 当前里程碑标记

`manifest.md` 让 current state、用户语言别名以及最新一次 validation 保持热；需要时把长篇 latest-review 细节移到 `.archon/manifest/archive/<year>-Q<N>.md`。按 ADR-22 records-folder，`memos.md` 由 `.archon/memos/records/`（按日期最近 5 条）自动生成 —— 不要手工编辑；通过 `node scripts/archon-records.mjs new memos --topic "..." --conclusion "..." --source ".archon/memos-archive/<year>-Q<N>.md ? keyword: ..."` 创建一条干系人结论 record，并把完整理由放进对应的 `memos-archive/<year>-Q<N>.md`。
`drift.md` 以 0 起步，准备好日志表头。
`debt.md` 以无 active 行的热闸索引起步；登记详细 debt 时，把完整理由放进 `debt/archive/<year>-Q<N>.md`。

需要保留的运行契约：

- `manifest.md` 的 `Latest review` 热行保留 `Latest validation target:`、validation 命令、可获得时的 bundle 证据，以及一个归档指针。不要在此处复述易变的 `N files / M tests` 计数；详细 review 历史保留在 `.archon/manifest/archive/<year>-Q<N>.md`。
- Drift archives 是冷的交付日志。其 `Rows archived:` 表头必须与表中已归档的交付行数一致；参考的 `drift-gates` 测试守护这一点。
- 非 fast-path 的 close-out 行包含一条 Architecture Forecast（`risk|next|confidence`）。把它当作对下一次 pre-scan 的预测，而非待办项或跳过下一次 Verdict 的许可。

## 步骤 3：结构化守卫

![漫画图解：Archon 安装的机械守卫](/images/setup/04-mechanical-guards.png)

Archon 治理的有效性依赖机械执行。下列三层守卫按执行强度排序（最强在前）。

### 3a. 验证命令

![漫画图解：单一 validate 命令 —— lint + typecheck + tests 汇入单一闸](/images/setup/07-validate-command.png)

在你的任务运行器里注册一条**单一入口**的验证命令，覆盖 lint + typecheck + test。这是所有质量检查的唯一通道。

示例（Node.js / package.json）：

```json
{
  "scripts": {
    "validate": "eslint . && tsc --noEmit && vitest run"
  }
}
```

在 `manifest.md §Validation Command` 中声明此命令。

### 3b. 治理测试（Budget · Ratio · Drift Gate · Anchors · Rule Preservation · Convergence · Export）

所有热路径治理文件 **必须** 在 validation 闸携带机械执行。十个相互独立的 contract block 覆盖了文档本身无法防止的失败模式：膨胀 · 部落知识/膨胀平衡 · drift 累积 · 交叉引用断裂 · 散文静默流失 · manifest↔command 失同步 · 导出包自不一致 · commit-gate 绕过 · 所言-与-实情治理偏移 · Preservation 轴退化。

可移植基线在 `.archon/contracts/governance-contract.yaml`。该文件是 JSON 兼容的 YAML，所以零依赖 runner 也能用标准库 JSON 支持解析它。TypeScript 项目可以保留原生测试实现，但撰写源会断言其 TS registry 与该 contract 一致；非 TS 采用方可以运行：

```bash
python scripts/archon-check.py --root .
# 或者，在 POSIX shell 中：
sh scripts/archon-check.sh .
```

#### Block 1：File Budget（防止膨胀）

治理文件随每次交付膨胀。当超出上限时，会侵蚀 AI 的上下文预算。在 manifest 的 §Context Budget 表中声明上限；以测试形式断言。

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
// For each file: read → count lines → expect ≤ limit with hint in error message
```

#### Block 2：Governance Ratio（同时防膨胀与部落知识）

治理文件数 / 源文件数必须保持在 `[0.1, 0.5]`。低于 0.1 = 部落知识风险（隐式规则未写下来）；高于 0.5 = 治理膨胀。遍历治理目录与源目录、计算比例，断言上下界。

#### Block 3：Drift Gate（防止 emergency 级别 drift 未审）

解析 drift.md 的 current 与 emergency 阈值。若 `current ≥ emergency`，尾行 **必须** 是 `**Review reset**` 条目 —— 否则项目处于损坏状态（需求在 emergency 上限之后仍在执行而未做审查）。同一守卫还应断言渐进加载契约：热 drift 保持 Archive Index 与最新行在预算之内，而 `.archon/drift/archive/*.md` 携带按关键词索引的冷日志。没有这条测试时，仅靠文档的 drift 预检经验上会被绕过（历史：drift 达到完整阈值的 108% 时需求仍在执行）。

#### Block 4：Soul Anchor Consistency（防止断裂的交叉引用）

当 `soul.md` 拆为 core + 模式扩展（`soul/delivery.md`、`soul/review.md`）时，commands 与 agents 通过 §Cross-Reference Convention 中声明的 `soul[/delivery|review].md §X` 语法引用具体标题。重命名标题或在文件间移动内容的重构必须更新所有引用 —— 否则 agent 会跟随一个已不存在锚点的指针。

扫描每条交叉引用源（commands、agents、soul 扩展）；对每个 `soul[/delivery|review].md §X` 匹配，断言目标文件存在且包含一个匹配 `§X` 的标题。同时断言扩展本身存在且被正确的命令加载。

#### Block 5：Critical Rule Preservation（防止散文静默流失）

区段锚点检查（Block 4）保证标题存在，但不保证其下的实质规则正文完好。未来某次编辑可能在锚点存活的同时静默地抽干一段话 —— 没有闸能抓到这种情况。对任何机械强度依赖于散文措辞本身（而非区段存在）的规则，注册一条子串断言。

维护一个 `{ file, substring, rationale }` 三元组的 registry；对每条记录读取文件并断言 `content.includes(substring)`。

**采用方项目以空 registry 起步。** Registry 随项目 L3 起源的散文规则被晋升到 L2 而有机生长 —— 每次晋升新增一行。当某规则最终成为完整的机械检查（例如用解析器替代子串匹配），把它从 registry 移除。

**参考示例**（来自 Archon 撰写源 —— 仅作示意，非规定）：

- `archon-demand §Decision Gate` 中的 Plan-mode binding 段落 —— 关键词：`**Plan-mode binding**`、`BEFORE any write-side tool invocation`
- `archon-demand §Decision Gate` 中的 Convergence gate 子句 —— 关键词：`**Convergence gate**`、`out of convergence scope`
- `soul §Quality Discipline` 中的 Two-hats 扩展子句 —— 关键词：`rename + a rule promotion on the same concept still counts as two hats`
- `soul §Knowledge Hygiene` 中的 Glossary scope 规则 —— 关键词：`Glossary scope`
- `soul/review §Proactive Scrutiny` 中的 Vocabulary-coherence 问题 —— 关键词：`**Vocabulary coherence**`

它们来自 Archon 源仓库历史中的具体交付。不要把它们逐字复制进新的采用方项目 —— 因为你的 soul 文件还没有这些短语，会失败标红。

#### Block 6：Convergence Gate Contract（防止 manifest↔command 失同步）

**激活是有条件的**：在「open period」（无强制 convergence 激活）时该测试为 no-op。它仅在项目选择启用里程碑级强制 convergence 时触发。

如果 manifest 的 `§Current State` 声明了 `Convergence scope: [<DEBT-IDs>]` 字段（强制 convergence 激活），`archon-demand` 命令文件 **必须** 包含 `**Convergence gate**` 子句以及 `out of convergence scope` 拒绝短语 —— 否则 Verdict 步骤无可对照执行的范围。当 `Convergence scope` 缺席时，断言早返回，不施加约束。

即使在 inactive 期间也把这块保留在测试文件 —— 它没有任何成本，并且在 manifest 声明 scope 的瞬间自动激活。

#### Block 7：Export Manifest Contract（防止分发自不一致）

当项目是 Archon **撰写源**（出货 `scripts/export-archon-core.mjs` 之类的脚本）时，导出 manifest 必须与本安装指南以及 README 的文件树一致。如果 setup.md 或 README 描述了未导出的文件，采用方项目会收到悄无声息的缺失；如果导出运送了任何文档都没提到的文件，采用方 agent 会发现孤立文件、不知如何使用。

测试检查导出脚本的文件清单（核心文件 + 平台文件 + 模板文件 + 文档文件 + skill 文件），并断言其与本安装指南步骤 1 的文件树以及 README 的 Quick Overview 双向覆盖。

不维护自己导出脚本的采用方项目可以安全跳过 Block 7。

#### Block 8：Run-State Contract（防止 commit-gate 绕过）

Run-State v2（`.archon/runs/<run_id>/state.json`）是 Verdict + Close-Out 聊天陈述的机器可读对应物。它仅在交付进行中存在 —— Verdict 后激活、按阶段更新、由 `archon-git-commit` 在成功 commit 后移除。Legacy `.archon/run.md` 作为尚未出货 helper 的采用方项目的迁移回退保留。四条始终在线的 contract 检查确保管线即使在两次交付之间也保持诚实：

1. `.archon/templates/run-state.schema.json` 与 legacy `run.template.md` 存在且在导出中出货。
2. `{platform}/skills/archon-git-commit/SKILL.md` 存在并注册到导出的平台文件中。
3. Pre-commit hook 调用 `scripts/archon-run-state.mjs resolve-for-commit` 并保留 legacy `permit_commit` 回退。
4. `archon-demand.md` 包含「Run-State Lazy Activation」子句，并同时记录 v2 `permitCommit` 与 legacy `permit_commit: 1`。

第五条检查仅当 legacy `.archon/run.md` 存在时激活：YAML 前置元数据声明 `demand` · `mode` · `started_at` · `plan_mode` · `convergence`；存在一行 `permit_commit: 0|1`；状态 token 仅使用 `1` / `0` / `2` / `skip:<reason>`；行数 ≤ 50。V2 active 状态由 `scripts/archon-run-state.mjs check` 检查。

这块阻止五种特定失败模式：忘记出货 schema/helper（采用方既学不到也无法操作格式）、删除 skill（commit gate 失去其读者）、破坏 hook（commit gate 失去其执行者）、让 archon-demand.md 静默流失其 run-state 指令（agent 停止初始化状态），以及把单文件并发瓶颈作为默认路径重新引入。

#### Block 9：Claim Verifier（防止所言-与-实情的治理偏移）

治理散文可能悄然偏离仓库：凭记忆引用的测试计数、未注明谱系的借用概念、把自己当作权威的 soul 编辑、声称已触发但无证据的触发器、或被手摆证据填塞的 Preservation 校验行。每种失败模式都曾各自作为债务跟踪过（DEBT-058 numeric · DEBT-066 borrowed · DEBT-070 self-cite · DEBT-071 missed-trig · DEBT-074 preservation substance）。按 ADR-27，单一 verifier 统一这一族：

```bash
npm run archon:verify        # runs all modes
# or individually:
node scripts/archon-claim-verifier.mjs --mode=numeric
node scripts/archon-claim-verifier.mjs --mode=borrowed
node scripts/archon-claim-verifier.mjs --mode=self-cite
node scripts/archon-claim-verifier.mjs --mode=missed-trig
node scripts/archon-claim-verifier.mjs --mode=preservation
```

所有 mode 共享同一个报告前缀 —— `[claim-verifier:<mode>] <FAIL|WARN>: <file> — <msg>` —— 因此一个 `grep` 就能浮出每条 claim 偏移，不论 mode。Verifier 接入了 `npm run validate`（错误失败-关闭，警告浮出）以及 `.husky/pre-commit`。可移植的 `archon-check.py` 仍是采用方侧的契约检查器；verifier 是面向 `git diff` 或 `.archon/*/records/` 近期条目的逐次交付扫描。未来的家族成员以新 mode 而非新脚本加入 —— 当脚本超过约 300 行，把 mode 重构到索引后的独立文件，而不是拆成并行 CLI。

**Preservation mode** 值得特别说明（按 ADR-28 加固）：它守护 Close-Out Preservation 行的两种不同退化形态。`none-this-cycle(<evidence>)` 逃生阀要求证据 ≥40 字符 **且** 含一个扫描类动词（如 `scanned`、`reviewed`、`checked`）**且** 命名了一个被扫目标；手摆字符串失败-关闭。First-pass-degeneracy 守卫抓住一次引入式交付把自己新增的锚点钉为 `pinned(...)` —— 这种钉必须被框为 `first pass`、`introducing delivery` 或 `pinned-bootstrap`，否则 verifier 拒绝这种自我晋升，直到至少有一个后续周期落地。

#### Block 10：Preservation Axis Imperatives（演进的第二运动）

除 Block 9 中的 claim-verifier 实质闸之外，ADR-28 引入的 Preservation 运动还携带三条非 verifier 的契约点：

1. **Close-Out 校验行** —— `archon-demand.md §Close-Out` 含一个 `Preservation pass:` 行，仅接受 `pinned(<anchor>+<test>+<contract>)` 或 `none-this-cycle(<evidence>)`。该行缺席会失败 anchor-consistency（Block 4）。
2. **Capture-auditor §Preservation Scan** —— 审计协议必须列出 5 个 jobs 与 7 个 steps（5 jobs + 2 setup），编号 1..N 连续。L1 step 计数测试抓住「插入新 step + 忘记重编号」（例如两个 step「4」）。
3. **Header-anchor body-shape 声明** —— critical-rule registry 中每个 header-shape 条目 **必须** 声明 `body_shape: 'has-body-shape-test' | 'header-only' | 'token-only'`。声明缺席会失败 L1 lint；`has-body-shape-test` 条目必须配对一个真正的 body-shape 断言（与 Block 5 相同，但按 ADR-28 加固加入了类型级强制）。

这三条守卫共同把 Preservation 做成一个机械三元组（registry anchor + body-shape test + 可移植 contract 条目），而非散文提醒。理由见 decisions log 中的 ADR-28。

**交付日志 + 交付后审查**：每次完成的需求都写一条 drift 日志条目，然后同时提问：(a)(b)(c) 已交付的工作或交付过程本身是否应改进（结晶化），**以及**(d) 这次交付是否依赖了一个应该被钉住的承重锚点（preservation，按 ADR-28）。让此审查保持轻量：在 drift 条目里记录一次性观察，仅把重复失败、auditor/reviewer 发现、不稳定的手工步骤或可机械执行的约束晋升到 debt/rule/test/skill/ADR。每次审查给信号打上 `evolution_triage=stats-pass|first-principles-pass|stay-in-drift`：统计仅在出现 2-3 个相关样本之后过滤常规噪声，而 first principles 仅当某个一次性信号证伪了核心假设并命名了最小验证实验时才允许它通过。该标签通过 `evolution_evidence=stats(...)`、`evolution_evidence=first-principles(...)` 或 `evolution_evidence=drift(...)` 携带匹配的紧凑证据。Preservation 答案记为 `preservation: pinned(<anchor>+<test>+<contract>) | none-this-cycle(<evidence>)`。这让 Archon 在每次交付后既学习 **又** 守持，而不会把 Close-Out 变成不断扩张的 checklist。

**参考实现**：见 `.archon/contracts/governance-contract.yaml` 加 `scripts/archon-check.py` 提供零依赖基线。Archon 撰写仓库的 `governance.test.ts` 仍是 TypeScript 参考实现，并断言其可移植 registry 与 YAML contract 一致。

**关于子目录测试 runner 的备注**：如果你的测试框架在子目录运行（例如 `web/`），测试文件的 `ROOT` 常量必须解析到项目根，才能在真实路径读取 `.archon/*`。常见模式：`const ROOT = resolve(process.cwd(), '..')`。



### 3c. Pre-commit Hook

![æ¼«ç”»å›¾è§£ï¼špre-commit æ˜¯ä¸²è”çš„ä¸¤ä¸ªç‹¬ç«‹é—¸ â€”â€” validation gate + lifecycle gate](/images/setup/08-pre-commit-gates.png)

git pre-commit hook åšä¸¤ä»¶äº‹ï¼š
1. **è¿è¡Œ validation å‘½ä»¤**ï¼ˆä»£ç è´¨é‡ + æ²»ç†é¢„ç®—ï¼Œå…¨éƒ¨ç”±æµ‹è¯•è¦†ç›–ï¼‰
2. **ç”Ÿå‘½å‘¨æœŸé—¸**ï¼ˆæ£€æŸ¥ git staged çŠ¶æ€ â€”â€” è¿™åªèƒ½åœ¨ hook ä¸­å®Œæˆï¼‰

å‚è€ƒå®žçŽ°ï¼ˆHuskyï¼‰ï¼š

å®‰è£…ï¼š
```bash
npm install -D husky
npx husky init
```

`.husky/pre-commit`ï¼š
```bash
# Replace <source-dir> with your source directory and <validate-command> with the validation command from manifest.md
cd <source-dir>
<validate-command>

cd ..

# â”€â”€ Archon Lifecycle Gate â”€â”€
# Source changes must be accompanied by drift log updates,
# ensuring the delivery close-out process is not skipped.
if git diff --cached --name-only | grep -q '^<source-dir>/'; then
  if ! git diff --cached --name-only | grep -q '^.archon/drift\.md$'; then
    echo ""
    echo "â›” Archon lifecycle gate: source changed but drift.md not staged."
    echo ""
    echo "   Complete delivery closing steps before committing:"
    echo "   1. Sync manifest   2. Run Blink Dispatch/subagent steps   3. Update drift log"
    echo ""
    exit 1
  fi
fi

# â”€â”€ Archon Run-State Gate (ADR-14 / v2) â”€â”€
# Active v2 delivery must resolve to exactly one permitCommit=true run.
node scripts/archon-run-state.mjs resolve-for-commit

# Legacy fallback: run.md present must have permit_commit: 1 â€” otherwise the
# Verdict Â· execute Â· validate Â· close-out SOP has pending steps.
if [ -f .archon/run.md ]; then
  if ! grep -qE '^permit_commit:[[:space:]]*1[[:space:]]*$' .archon/run.md; then
    echo ""
    echo "â›” Archon run-state gate: active delivery has pending SOP steps."
    echo ""
    echo "   Pending (first 5 rows with status=0):"
    grep -E '\|[[:space:]]*0[[:space:]]*\|' .archon/run.md | head -5 | sed 's/^/     /'
    echo ""
    echo "   Complete the remaining steps per archon-demand.md Â§ Close-Out,"
    echo "   or 'rm .archon/run.md' to abandon this delivery."
    echo ""
    exit 1
  fi
fi
```

**å…³æ³¨ç‚¹åˆ†ç¦»**ï¼šå¯æµ‹è¯•çš„çº¦æŸæ”¾è¿›æµ‹è¯•ï¼ˆæ²»ç†é¢„ç®—ã€ä»£ç æ ‡å‡†ï¼‰ï¼›ä¾èµ– git çŠ¶æ€çš„æ£€æŸ¥æ”¾è¿› hookï¼ˆstaged æ–‡ä»¶æ£€æŸ¥ï¼‰ã€‚è®© hook ä¿æŒè–„ã€‚

### 3d. Run-State æ–‡ä»¶ï¼ˆADR-14 / v2ï¼‰

![æ¼«ç”»å›¾è§£ï¼šRun-State æ˜¯ä¸´æ—¶çš„ â€”â€” Verdict åŽå‡ºçŽ°ã€commit åŽç§»é™¤ã€è¢« gitignore](/images/setup/09-run-state-lifecycle.png)

Run-State v2 æ¯æ¬¡äº¤ä»˜æŒ‰ç›®å½•å­˜å‚¨ä¸€ä»½ï¼š`.archon/runs/<run_id>/state.json` åŠ ä¸Šå¯é€‰çš„ `events.ndjson`ã€‚å®ƒæ˜¯ **ä¸´æ—¶çš„** â€”â€” Verdict åŽæ¿€æ´»ã€éšæ¯ä¸ª SOP é˜¶æ®µå®Œæˆè€Œæ›´æ–°ã€ç”± `archon-git-commit` skill åœ¨æˆåŠŸ commit åŽç§»é™¤ã€‚ä¸¤æ¬¡äº¤ä»˜ä¹‹é—´æ²¡æœ‰æ´»è·ƒçš„ run ç›®å½•ã€‚

**å¿…é¡»è¢« gitignoreã€‚** åœ¨é‡‡ç”¨ commit é—¸ä¹‹å‰æŠŠ `.archon/runs/` ä¸Ž legacy `.archon/run.md` æ·»åŠ åˆ°ä»“åº“çš„ `.gitignore`ã€‚è¿™äº›æ–‡ä»¶æºå¸¦è¿è¡Œä¸­çš„çŠ¶æ€ï¼Œç»ä¸èƒ½è¿›å…¥åŽ†å²ï¼šcommit å®ƒä»¬ä¼šå¯¼è‡´ ping-pong diffs å¹¶æŠŠ per-session ä¸Šä¸‹æ–‡æ³„æ¼è¿›æ—¥å¿—ã€‚

**å¹¶å‘æ¨¡åž‹**ï¼šv2 ç§»é™¤äº†å•ä¾‹ç“¶é¢ˆã€‚æ¯æ¬¡äº¤ä»˜æœ‰ä¸€ä¸ªä¸åŒçš„ `run_id`ï¼Œcommit æ—¶åˆ»çš„è§£æžåœ¨å¤šä¸ª commit-ready run åŒæ—¶å­˜åœ¨ä¸”æœªæ˜¾å¼è®¾ç½® `ARCHON_RUN_ID` æ—¶å¤±è´¥-å…³é—­ã€‚è§£æžå™¨è¿˜ä¼šæ‹’ç»æœªåˆ—åœ¨æ‰€é€‰ run çš„ `changedPaths` ä¸­çš„ staged æ–‡ä»¶ï¼Œé˜²æ­¢æŠŠç¬¬äºŒä¼šè¯çš„æ–‡ä»¶è¢«å·è¿›é”™è¯¯çš„ commitã€‚Git worktrees ä»æ˜¯çœŸæ­£å¹¶å‘ç¼–è¾‘çš„æŽ¨èæ–¹å¼ï¼Œå› ä¸ºå¯¹åŒä¸€æ–‡ä»¶çš„é‡å ç¼–è¾‘ä»å±žæºä»£ç æŽ§åˆ¶é—®é¢˜ï¼Œè€Œéž run-state é—®é¢˜ã€‚Legacy `.archon/run.md` ä»…ä¸ºè¿ç§»ä¿ç•™æ—§çš„ demand-mismatch å›žé€€ã€‚

**Schema**ï¼ˆè§ `.archon/templates/run-state.schema.json`ï¼‰ï¼š

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

çŠ¶æ€å€¼ä¿æŒä¸å˜ï¼š`1`ï¼ˆå·²å®Œæˆï¼‰ã€`0`ï¼ˆå¾…åŠž/è¿›è¡Œä¸­ï¼‰ã€`2`ï¼ˆ**ç”¨æˆ·æ„å›¾çš„ smart-skip**ï¼ŒADR-15 â€”â€” ä»…åœ¨ permission-list è¡Œä¸Šï¼Œéœ€è¦ drift ç†ç”±ï¼‰ã€`skip:<reason>`ï¼ˆæ¨¡å¼é©±åŠ¨çš„ç»•è¿‡ï¼‰ã€‚`permitCommit: true` æ˜¯ç»ˆæžé—¸ï¼Œä»…åœ¨æ‰€æœ‰å¿…éœ€çŠ¶æ€å®ŒæˆåŽè®¾ç½®ã€‚

**`2` ä¸Ž `skip:*` â€”â€” å®¡è®¡å¼ºåº¦ä¸åŒã€‚** `skip:*` åœ¨ token è‡ªèº«æºå¸¦åŽŸå› ï¼ˆç»“æž„æ€§ / æ¨¡å¼é©±åŠ¨ï¼‰å¹¶é€šè¿‡é™æ€æ£€æŸ¥ã€‚`2` è¡¨ç¤ºäººç±»é€‰æ‹©ç»•è¿‡ï¼›åŽŸå› å¤–éƒ¨å­˜æ”¾åœ¨ drift.md ä¸­ä½œä¸º `smart-skip: <phase>.<variable> â€” <reason>`ï¼Œç”± governance.test.ts Block 8 äº¤å‰å¼•ç”¨ã€‚ä»…å½“ç”¨æˆ·æ˜¾å¼è¦æ±‚æ—¶ä½¿ç”¨ `2`ï¼ˆç¥ˆä½¿å¥ã€å¯¹ agent æè®®çš„è‚¯å®šå›žå¤ï¼Œæˆ– demand çº§åˆ«çš„ `[trivial] / [quick patch] / [docs-only]` æç¤ºï¼‰ã€‚Agent è‡ªèº«åˆ¤æ–­æŸæ­¥æ— éœ€æ‰§è¡Œå±žäºŽ mode-class skipï¼ˆ`skip:no-change` / `skip:no-decision-value` / `skip:no-extensions`ï¼‰â€”â€” ä¸è¦æŠŠå®ƒå·å·å¡žè¿› `2`ã€‚Permission åˆ—è¡¨ï¼ˆå…­è¡Œï¼š`prescan.archive_scanned`ï¼Œå…¨éƒ¨äº”ä¸ªéžç»ˆæ€ `closeout.*` å®¡è®¡è¡Œï¼‰æ˜¯ç¡¬çº¦æŸ â€”â€” soul å¼ºåˆ¶çš„è¡Œï¼ˆvalidate / drift_updated / statement_output / ç­‰ï¼‰ä»Žä¸æŽ¥å— `2`ã€‚

**æ¨¡å¼ç‰¹å®šå½¢æ€**ï¼š
- **Standard**ï¼ˆé»˜è®¤ï¼‰ï¼šçº¦ 21 è¡Œï¼Œè·¨è¶Š boot Â· prescan Â· decision Â· execute Â· validate Â· closeoutã€‚
- **Fast-path**ï¼šå››è¡Œ `decision.verdict_output` Â· `execute.changes_applied` Â· `validate.validation_green` Â· `closeout.drift_updated`ï¼ˆ+ `closeout.manifest_synced` Â· `closeout.statement_output`ï¼‰ä¿æŒ `1`ï¼›å…¶ä»–å…¨éƒ¨ä¸º `skip:fast-path`ã€‚
- **Rejected**ï¼ˆ`Verdict=reject`ï¼‰ï¼š`decision.verdict_output` + `closeout.drift_updated` + `closeout.statement_output` ä¿æŒ `1`ï¼›execute / validate ä¸Žå¤šæ•° closeout è¡Œå˜ä¸º `skip:rejected`ã€‚

**ä¸ºä»€ä¹ˆç”¨å•ç‹¬çš„è¿è¡Œæ—¶ç›®å½•**ï¼ˆç›¸å¯¹äºŽå†…è”è¿› drift.md æˆ– memos.mdï¼‰ï¼š`drift.md` æ˜¯åªè¿½åŠ çš„åŽ†å²æ—¥å¿— â€”â€” ä¸­é€”çŠ¶æ€ä¼šæ±¡æŸ“å®ƒã€‚Close-Out é™ˆè¿°å­˜åœ¨äºŽ chat ä¸­å¹¶åœ¨ compact åŽæ¶ˆå¤±ã€‚`.archon/runs/<run_id>/state.json` æ˜¯é£žè¡Œä¸­è¿›åº¦çš„æœºæ¢° ledgerï¼Œä¹Ÿæ˜¯ pre-commit hook åœ¨æ”¾è¡Œ commit å‰å”¯ä¸€åº”è¯¥å’¨è¯¢çš„äº§ç‰©ã€‚

### 3e. Destructive-Git é˜²æŠ¤æ ï¼ˆB4 L1 æ‹¦æˆªï¼‰

Soul Â§Constraints æºå¸¦ã€Œæ—  drift ç†ç”±ä¸å¾—æ‰§è¡Œç ´åæ€§ gitã€è§„åˆ™ã€‚åªè¦å®ƒä»…ä»¥æ•£æ–‡å½¢å¼å­˜åœ¨ï¼Œäººç±»ä¸Ž agent éƒ½å¯èƒ½ç”¨ä¸€æ¡å¼ºåˆ¶ push æˆ– `git reset --hard` é™é»˜è¿åã€‚B4 é€šè¿‡ **ä¸¤ä¸ªç‹¬ç«‹çš„æœºæ¢°æ‹¦æˆªå™¨** æŠŠè¿™æ¡è§„åˆ™ä»Ž L3 æ™‹å‡åˆ° L1ï¼ŒäºŒè€…å…±åŒè¦†ç›–æ¯æ¡å®¢æˆ·ç«¯è·¯å¾„ï¼š

1. **`.husky/pre-push` hook** â€”â€” ä¸Žå®¢æˆ·ç«¯æ— å…³ï¼Œå¯¹ *ä»»ä½•* æŠµè¾¾ git çš„ push éƒ½è§¦å‘ï¼ˆCLIã€VS Codeã€JetBrainsã€Cursorã€GUI å®¢æˆ·ç«¯ï¼‰ã€‚é˜»æŒ¡ `--force` / `--force-with-lease` ä¸Žéžå¿«è¿› pushã€‚å› ä¸ºå®ƒåœ¨ git å†…éƒ¨è¿è¡Œï¼Œæ— æ³•é€šè¿‡æ¢ç»ˆç«¯æˆ–ç¼–è¾‘å™¨ç»•è¿‡ã€‚
2. **Cursor `beforeShellExecution` hook**ï¼ˆ`.cursor/hooks/archon-destructive-guard.mjs`ï¼‰â€”â€” Agent-shell å®ˆå«ï¼Œåœ¨ agent æ‰§è¡Œä»»ä½• shell å‘½ä»¤ä¹‹å‰è§¦å‘ã€‚åœ¨ `git reset --hard`ã€`git branch -D`ã€`git clean -f*` ä¸Ž `git checkout -B` è§¦åŠå·¥ä½œæ ‘ä¹‹å‰æ‹¦æˆªå®ƒä»¬ã€‚**è§£æžå¤±è´¥æ—¶å¤±è´¥-å…³é—­** â€”â€” æ— æ³•è§£æžçš„å‘½ä»¤ä¼šè¢«æ‹’ç»ï¼Œç»ä¸é™é»˜æ”¾è¡Œã€‚

**ç»•è¿‡æ˜¯æ˜¾å¼çš„**ï¼š`ARCHON_ALLOW_DESTRUCTIVE=1 <command>` è®©å•æ¬¡è°ƒç”¨é€šè¿‡ï¼Œä½†ä¸‹æ¬¡ Close-Out **å¿…é¡»** è®°å½•ä¸€è¡Œ driftï¼Œå‘½åå‘½ä»¤ä¸Žç†ç”±ã€‚ç†ç”±ç¼ºå¤±ä¼šè§¦å‘ä¸‹æ¬¡äº¤ä»˜çš„ claim-verifier `missed-trig` modeã€‚

**è·¨å¹³å°å¤‡æ³¨**ï¼š`.gitattributes` æŠŠ `*.sh` ä¸Ž `.husky/*` é’‰ä¸º LFï¼Œé˜²æ­¢ Windows çš„ `core.autocrlf` æŸå hook shebangsã€‚Cursor hook ç”¨ Nodeï¼ˆ`*.mjs`ï¼‰å®žçŽ°ï¼Œä¸“é—¨æ˜¯å› ä¸º Cursor on Windows æŠŠ `/bin/sh` è§£æžåˆ° WSLï¼Œä¼šç ´å POSIX shell hook â€”â€” Node åœ¨ä¸‰ä¸ªå¹³å°ä¸Šè¿è¡Œä¸€è‡´ã€‚

**æ²»ç†é”šå®š**ï¼š3 æ¡å¯ç§»æ¤å¥‘çº¦æ¡ç›®ï¼ˆ`governance-contract.yaml`ï¼‰ + 3 æ¡ critical-rule å­ä¸²ï¼ˆBlock 5 registryï¼‰ + export-manifest åŒ…å«å®ˆå«è„šæœ¬ä¸Ž hook é…ç½®ã€‚ç§»é™¤ä»»ä¸€é”šç‚¹è€Œæœªé…å¥—ä¿®æ”¹ä¼šå¤±è´¥ Block 4ï¼ˆanchor consistencyï¼‰æˆ– Block 7ï¼ˆexport manifestï¼‰ã€‚

ä¸ä½¿ç”¨ Cursor çš„é‡‡ç”¨æ–¹é¡¹ç›®å¯ä»¥åªå‡ºè´§ pre-push hookï¼Œè·³è¿‡ `.cursor/hooks/` é‚£ä¸€åŠã€‚å¸Œæœ›é»˜è®¤å…è®¸ç ´åæ€§æ“ä½œçš„é‡‡ç”¨æ–¹é¡¹ç›®å¯ä»¥å®Œå…¨ç§»é™¤ pre-push hook â€”â€” ä½†é‚£æ—¶ soul Â§Constraints ä¹Ÿå¿…é¡»ä¸¢å¼ƒ no-destructive-git è§„åˆ™ï¼Œä½¿æ•£æ–‡ä¸Žæœºåˆ¶ä¿æŒä¸€è‡´ã€‚

## æ­¥éª¤ 4ï¼šå¯é€‰å¢žå¼º

æŒ‰éœ€æ·»åŠ  â€”â€” åˆå§‹å®‰è£…å¹¶ä¸éœ€è¦ï¼Œä½†æ¯ä¸€é¡¹éƒ½å…³é—­äº†ä¸€ä¸ªéšé¡¹ç›®æˆé•¿ä¼šå‡ºçŽ°çš„ç‰¹å®šæ²»ç†ç¼ºå£ã€‚

### Lint-Rule Bridge

è®© linter é”™è¯¯æ¶ˆæ¯æŒ‡å‘å¹³å° rules ç›®å½•ä¸­çš„ rule æ–‡ä»¶ï¼Œå½¢æˆ L1â†’L2 çš„æ´»è·ƒè§¦å‘å›žè·¯ã€‚

**çº¦å®š**ï¼šè‡ªå®šä¹‰ lint è§„åˆ™é”™è¯¯æ¶ˆæ¯æ ¼å¼ = è‡ªåŒ…å«çš„ä¿®å¤æŒ‡å¼• + `â†’ Read <rule-file-path>`ã€‚

ç¤ºä¾‹ï¼ˆESLint `no-restricted-imports`ï¼ŒCursor å¹³å°ï¼‰ï¼š

```javascript
{
  message: 'Pages import from @/lib/api directly. Use hooks instead. â†’ Read .cursor/rules/frontend.mdc',
}
```

### é¡¹ç›®è§„åˆ™ï¼ˆRules Directoryï¼‰

ç¼–ç è§„èŒƒã€æž¶æž„è¾¹ç•Œã€è®¾è®¡ç³»ç»Ÿè§„çº¦ä»¥åŠå…¶ä»–é¡¹ç›®ç‰¹å®šçš„ç¼–è¾‘å™¨è§„åˆ™ã€‚å¯¹æ¯æ¡è§„åˆ™é—®ã€Œè°æ¥ç¡®ä¿å®ƒè¢«éµå®ˆï¼Ÿã€â€”â€” å¦‚æžœç­”æ¡ˆæ˜¯ã€Œè¯»åˆ°çš„äººã€ï¼Œè€ƒè™‘æŠŠå®ƒæŽ¨åˆ° lint è§„åˆ™ã€‚

### Skill æ–‡æ¡£ï¼ˆSkills Directoryï¼‰

å¯å¤ç”¨çš„é¢†åŸŸçŸ¥è¯†ï¼šè®¾è®¡ç³»ç»Ÿã€API è§„çº¦ã€æ¡†æž¶æœ€ä½³å®žè·µã€ç»„ä»¶æŒ‡å—ç­‰ã€‚åœ¨ `manifest.md Â§Knowledge Assets` ä¸­ç»´æŠ¤ç´¢å¼•ã€‚é¢„è£…çš„ `archon-framework` skill ä½œä¸ºå¯å·¥ä½œç¤ºä¾‹å¹¶æ°¸ä¹…ä¿ç•™ã€‚

### æž¶æž„å†³ç­–è®°å½•

`.archon/decisions.md` â€”â€” é‡‡ç”¨æ–¹é¡¹ç›®çš„é¡¹ç›®ç‰¹å®š ADRsã€‚æ¯æ¡è®°å½•ç™»è®°æ—¥æœŸã€çŠ¶æ€ã€å†³ç­–ã€ç†ç”±ã€å½±å“ä»¥åŠå†è¯„ä¼°è§¦å‘å™¨ã€‚`docs/archon/decisions.md` æ˜¯å¦å¤–ä¸€ä»½ï¼šå®ƒè§£é‡Šéšå¯å¤ç”¨ kit ä¸€åŒå‡ºè´§çš„ Archon æ¡†æž¶å†³ç­–ã€‚

### Extensionsï¼ˆ`.archon/extensions/`ï¼‰

Extensions æ˜¯é¡¹ç›®ç‰¹å®šçš„èƒ½åŠ›ï¼ŒæŒ‚å…¥ Archon å›ºå®šçš„ç”Ÿå‘½å‘¨æœŸç‚¹è€Œä¸ä¿®æ”¹æ ¸å¿ƒæ–‡ä»¶ã€‚å®ƒä»¬å®žçŽ°æ’ä»¶æ¨¡å¼ï¼šå®‰è£… = åˆ›å»ºä¸€ä¸ªå« `extension.md` çš„ç›®å½•ï¼›å¸è½½ = åˆ é™¤è¯¥ç›®å½•ã€‚

**ç”Ÿå‘½å‘¨æœŸç‚¹**ï¼ˆåœ¨ `soul.md Â§Extension Points` ä¸­å£°æ˜Žï¼‰â€”â€” extensions å¯ä»¥æŒ‚å…¥ï¼š

| ç‚¹ | å‘½ä»¤ | ä½•æ—¶ |
|-------|---------|------|
| `demand.pre-scan` | archon-demand | åŠ è½½ memos ä¹‹åŽã€decision gate ä¹‹å‰ |
| `demand.close-out` | archon-demand | å¹²ç³»äºº memos ä¹‹åŽã€git ä¹‹å‰ |
| `plan.perception` | archon-plan | çŠ¶æ€æ„ŸçŸ¥é˜¶æ®µä¸­ |
| `plan.output` | archon-plan | ä¼˜å…ˆçº§æŽ’åºä¹‹åŽã€æœ€ç»ˆè¾“å‡ºä¹‹å‰ |
| `review.health` | archon-review | çŸ¥è¯†å¥åº·å®¡è®¡ä¸­ |

**é¢„ç®—è§„åˆ™**ï¼šæ¯ä¸ªé¡¹ç›®æœ€å¤š 3 ä¸ªæ´»è·ƒ extensionsã€æ¯ä¸ª hook å£°æ˜Ž â‰¤ 15 è¡Œã€‚Extensions **ä¸** éšæ ¸å¿ƒ kit å¯¼å‡º â€”â€” å®ƒä»¬å§‹ç»ˆæ˜¯é¡¹ç›®æœ¬åœ°çš„ã€‚å®Œæ•´å‘çŽ°åè®®ä¸Ž `extension.md` æ–‡ä»¶æ ¼å¼è§ `soul.md Â§Extension Points`ã€‚

### Dashboardï¼ˆ`.archon/dashboard/`ï¼‰

ä¸€ä¸ªé›¶ä¾èµ–çš„ Node.js ä»ªè¡¨ç›˜ï¼Œé€šè¿‡ç›´æŽ¥è§£æž `.archon/*.md` æ¥å¯è§†åŒ–æ²»ç†çŠ¶æ€ï¼ˆé‡Œç¨‹ç¢‘ã€drift æ—¥å¿—ã€debt æ³¨å†Œè¡¨ã€ADR æ—¶é—´çº¿ã€äº¤ä»˜èŠ‚å¥ï¼‰ã€‚

- **å®‰è£…**ï¼šä»ªè¡¨ç›˜æ˜¯å¯é€‰çš„ï¼Œé»˜è®¤ä¸å¯¼å‡ºã€‚éœ€è¦æ²»ç†å¯è§†åŒ–æ—¶ä»Žæ’°å†™æºå¤åˆ¶ `.archon/dashboard/`ã€‚
- **å¯åŠ¨**ï¼šè¿è¡Œ `/archon-dashboard` æˆ– `node .archon/dashboard/server.js`ã€‚
- **åœç”¨**ï¼šåˆ é™¤ `.archon/dashboard/`ã€‚`archon-dashboard` å‘½ä»¤åœ¨è¯¥ç›®å½•å›žå½’ä¹‹å‰ä¼š no-opã€‚
- **å¯é€‰ heartbeat è§„åˆ™**ï¼ˆ`{platform}/rules/archon-heartbeat.mdc`ï¼‰ï¼šé€šè¿‡åœ¨äº¤ä»˜æœŸé—´å†™ä¸´æ—¶ heartbeat æ–‡ä»¶æ¥æä¾›æ›´ç²¾ç¡®çš„ä¼šè¯çŠ¶æ€æŽ¨æ–­ã€‚å®Œå…¨å¯é€‰ â€”â€” æ²¡æœ‰ heartbeat æ—¶ä»ªè¡¨ç›˜å›žé€€åˆ°ä»Ž transcripts è¢«åŠ¨æŽ¨æ–­ã€‚

## æ­¥éª¤ 5ï¼šéªŒè¯å®‰è£…

è¿è¡Œ `/archon plan`ï¼ˆæˆ– `/archon-plan`ï¼‰ã€‚Archon ä¼šçƒ­è·¯å¾„è¯»å–å¿…éœ€çš„ `soul.md`ã€`soul/review.md`ã€`manifest.md` ä¸Ž `drift.md` åŒºæ®µï¼Œç„¶åŽåŸºäºŽé¡¹ç›®çŠ¶æ€è¾“å‡ºä¸‹ä¸€æ­¥å»ºè®®ã€‚å¦‚æžœå®ƒäº§å‡ºè¿žè´¯çš„æ‘˜è¦ä¸Žè®¡åˆ’ï¼Œæ¡†æž¶å°±æˆåŠŸåŠ è½½ã€‚

æ­¤å¤–ï¼Œagent åº”å½“åœ¨ä¼šè¯ä¸­ç¬¬ä¸€ä¸ª Archon ç›¸å…³åŠ¨ä½œæ—¶å’¨è¯¢ `archon-framework` skill â€”â€” `archon-wake.mdc` ä¼šå¼•å¯¼å®ƒè¿‡åŽ»ã€‚å¦‚æžœä½ æƒ³æ‰‹å·¥æµ‹è¯• primer æµç¨‹ï¼Œé—® agentã€ŒArchon æ˜¯ä»€ä¹ˆï¼Œè¿™ä¸ªé¡¹ç›®æ€Žä¹ˆç”¨å®ƒï¼Ÿã€â€”â€” å®ƒåº”å½“å¼•ç”¨ `{platform}/skills/archon-framework/SKILL.md`ã€‚

## Checklist

| æ­¥éª¤ | äº§ç‰© | éªŒè¯ |
|------|------|----------|
| å¤åˆ¶æ¡†æž¶æ–‡ä»¶ | `.archon/soul.md` + `.archon/soul/{delivery,review}.md` + `{platform}/{commands,agents,rules,skills}/archon*` | æ‰€æœ‰æ–‡ä»¶å­˜åœ¨ï¼›rules ä¸­å­˜åœ¨ `archon-wake.mdc` ä¸Ž `archon.mdc`ï¼›skills ä¸­å­˜åœ¨ `archon-framework/SKILL.md` + `archon-git-commit/SKILL.md` + `blink-dispatch/SKILL.md` |
| åˆ›å»º manifest | `.archon/manifest.md` | å¹³å°æ˜ å°„ + æ‰€æœ‰ `<!-- -->` å ä½ç¬¦å·²å¡«ï¼›Â§Context Budgetã€Â§Validation Commandã€Â§Milestones å­˜åœ¨ |
| åˆ›å»º drift | `.archon/drift.md` | `drift: 0`ï¼Œæ—¥å¿—è¡¨å¤´å°±ç»ª |
| åˆ›å»º debt | `.archon/debt.md` | æ¨¡æ¿å·²å¤åˆ¶ï¼ŒArchive Index + Active Debt Index åŒºæ®µå°±ç»ª |
| åˆ›å»º memos | `.archon/memos.md` | æ¨¡æ¿å·²å¤åˆ¶ï¼ŒArchive Index + Hot Memos åŒºæ®µå°±ç»ª |
| Run-state schema/helper | `.archon/templates/run-state.schema.json` + `scripts/archon-run-state.mjs` | æ–‡ä»¶å­˜åœ¨ï¼›`.archon/runs/` ä¸Ž legacy `.archon/run.md` å·² gitignoreï¼Œä¸”ä¸åœ¨æ­¤åˆ›å»º â€”â€” å®ƒä»¬ä»…åœ¨æ´»è·ƒäº¤ä»˜æœŸé—´å‡ºçŽ° |
| æ³¨å†Œ validation å‘½ä»¤ | package.json / Makefile / ç­‰ | å‘½ä»¤è¿è¡Œå¹¶é€šè¿‡ green |
| æ²»ç†æµ‹è¯•ï¼ˆ6-8 ä¸ª blockï¼‰ | æµ‹è¯•æ–‡ä»¶ | Validation è¿è¡Œï¼šbudgetï¼ˆâ‰¥7 æ–‡ä»¶ï¼‰ + ratio [0.1, 0.5] + drift gate + manifest/memos/debt çƒ­ç´¢å¼•/å½’æ¡£å¥‘çº¦ + soul anchors + critical-rule å­ä¸²ï¼ˆregistry å¯èµ·æ­¥ä¸ºç©ºï¼‰ + convergence-gate contractï¼ˆå¯ä¸º no-opï¼‰ + export-manifest contractï¼ˆä»…æ’°å†™æºï¼‰ + run-state contractï¼ˆtemplate + skill + hook + demand-cmd å­å¥ï¼‰ |
| Pre-commit hook | `.husky/pre-commit` æˆ–ç­‰ä»·ç‰© | `git commit` è§¦å‘ validation + lifecycle gate + run-state gateï¼ˆå½“ `.archon/run.md` å­˜åœ¨æ—¶ï¼‰ |
| ç¬¬ä¸€æ¬¡ plan | `/archon plan` æˆ– `/archon-plan` è¾“å‡º | Archon æ­£ç¡®åŠ è½½æ‰€éœ€çš„ soul/manifest åŒºæ®µï¼›`archon-framework` skill åœ¨ç¬¬ä¸€ä¸ª archon ç›¸å…³åŠ¨ä½œæ—¶è¢«å’¨è¯¢ |
