# Archon

> 一个基于会话的 AI 工程治理框架。把 AI 代理从「按指令办事的工具」抬升为「对项目负完整工程责任的所有者」。

> **快速入口**
>
> - 第一次来、想 10 分钟看个全貌？→ [concepts/overview.md](/zh/concepts/overview)
> - 想 5 分钟内装上 Archon？→ [adoption/quickstart.md](/zh/setup/quickstart)
> - 想看完整参考？→ [architecture.md](/zh/concepts/architecture) + [setup.md](/zh/setup/full-guide)

## 一句话总结

![漫画图解：Archon 是所有者，不是助手](/images/readme/01-owner-not-assistant.png)

用户表达产品意图；Archon 把它翻译成工程行动并端到端交付 —— 包括决策、实现、验证、知识结晶、自我评审。

## 核心哲学

| 原则 | 含义 |
|------|------|
| 所有权 > 辅助 | Agent 是所有者，不是助手 |
| 约束 > 文档 | 机器能强制的事，不写散文 |
| 推断 > 配置 | 行为从项目状态推断，不靠模式开关 |
| 精简 > 膨胀 | 更少、更强的知识资产 |
| 分离 > 自评 | 执行者不能评判自己的工作 |

## 文档导航

### 随每个采用方项目一起发行

| 文档 | 你将学到 |
|------|-----------|
| **[architecture.md](/zh/concepts/architecture)** | 完整 Archon 架构：认知循环、交付生命周期、约束金字塔、知识演进、子代理委派、状态管理、反膨胀机制 |
| **[setup.md](/zh/setup/full-guide)** | 把 Archon 集成进新项目：文件清单、模板、结构守卫配置、验证清单 |
| `.archon/contracts/governance-contract.yaml` | 由零依赖参考校验器（`scripts/archon-check.py`、`scripts/archon-check.sh`）消费、并由 authoring-source 测试镜像的可移植治理契约 |
| **[decisions.md](/zh/concepts/decisions)** | Archon 框架 ADR：可复用治理机制（如 soul 按需加载、SRE 级门、平台能力绑定）的上下文、权衡与理由 |

### 仅在 authoring 仓里（不导出）

下列文档住在 Archon authoring 源里。它们从公共项目站点被链接到；采用方项目不会自动收到。

| 文档 | 你将学到 |
|------|-----------|
| [`user-journeys.md`](/zh/concepts/user-journeys) | AI 辅助编码的 16 个真实陷阱以及 Archon 各机制如何分别接住 —— 框架背后的「为什么」 |
| [`concepts/overview.md`](/zh/concepts/overview) | 给在深入 architecture.md 前想看大局的人 —— 10 分钟速览 |
| [`concepts/model-vs-harness.md`](/zh/concepts/model-vs-harness) | 解剖「模型 vs 鞍架」之争：六个问题暴露为何更强的模型仍需要工程环境 |
| [`mechanisms/drift-mechanism.md`](/zh/concepts/drift-mechanism) | 漂移机制深潜：分级触发（light/full/emergency）、机械保底、动态阈值（含收敛期收紧）、日志压缩 |
| [`concepts/product-architecture-workflow.md`](/zh/concepts/product-architecture-workflow) | 产品视角的 Archon 架构工作流：新项目接入、已有项目接管、需求执行、配置面以及独立产品边界 |
| [`concepts/superpowers-comparison.md`](/zh/concepts/superpowers-comparison) | 与 Superpowers 框架的对比 —— 反合理化表、系统化调试、子代理成本意识 |
| [`concepts/refactoring-adoption.md`](/zh/concepts/refactoring-adoption) | 提炼自重构纪律（两顶帽子、三次法则、渐进替换、节奏、特征化测试） |
| [`adoption/quickstart.md`](/zh/setup/quickstart) | 5 分钟安装路径：放入导出包、初始化状态、接入验证、安装 pre-commit hook、第一次 demand |
| [`adoption/dashboard-redesign-prd.md`](/zh/setup/dashboard-prd) | Archon Dashboard 的视觉 + 交互重设计 PRD（明亮体素粗犷主义、多会话、白盒化执行轨迹） |

### 工具

| 工具 | 用途 | 可用性 |
|------|---------|--------------|
| **Dashboard**（`/archon-dashboard`） | 治理状态可视化 —— 工作流驱动的布局 + 实时心跳 + schema 结构守卫 | 包含在采用方项目中（可选；保留 `.archon/dashboard/` 目录即激活） |
| **导出脚本** | 从 authoring 源为新项目生成独立 Archon kit | 仅 authoring 源 —— 采用方项目无需重新导出 |

## 问题路由器

![漫画图解：Archon 问题路由器](/images/readme/02-question-router.png)

从你试图回答的问题开始：

| 问题 | 先读 | 再查 |
|------|------|------|
| Archon 在结构上是什么？ | `README.md §快速概览` | `architecture.md §系统架构总览` |
| Archon 的思考、记忆、领域、交付、验证、演进、结晶各层如何拼到一起？ | `architecture.md §分层运行模型` | `README.md §机制关系图` |
| 一条机制为什么存在？ | `docs/archon/decisions.md` | `architecture.md §机制边界` |
| 一次交付怎么跑？ | `README.md §工作流` | `{platform}/commands/archon-demand.md` |
| Archon 如何在保留硬门的同时维持执行灵活？ | `{platform}/commands/archon-demand.md §自主执行内部` | `architecture.md §边界硬-过程软的执行` |
| Archon 如何从每次交付学习？ | `.archon/drift.md` | `{platform}/commands/archon-demand.md §Close-Out` |
| Archon 如何避免已经在工作的东西被悄悄抽干？ | `architecture.md §保留轴（与结晶对偶）` | `decisions.md §ADR-28 · 保留轴` |
| Archon 如何抓治理散文与仓库现实的漂移？ | `architecture.md §声明校验` | `decisions.md §ADR-27 · Claim Verifier` |
| Archon 如何阻止并发交付撞同一个文件？ | `architecture.md §Decision Gate`（模块化探针） | `decisions.md §ADR-29 · 源码模块化探针` |
| Archon 如何在并行分支之间无冲突地存治理状态？ | `drift-mechanism.md §存储形态 —— 一事件一文件` | `decisions.md §ADR-22 · Records-Folder` |
| Archon 如何学习用户对项目对象的措辞？ | `.archon/manifest.md §用户语言索引` | `soul.md §所有权` |
| Archon 如何从交付历史演进？ | `architecture.md §交付演进循环` | `decisions.md §ADR-20 · Archon 原生演进循环（交付经验自进化）` |
| Archon 如何预测下一次架构压力？ | `architecture.md §架构预测循环` | `{platform}/commands/archon-demand.md §Close-Out` |
| Archon 如何自测一次演进升级？ | `architecture.md §演进自测矩阵` | `drift.md` 交付后评审 |
| Archon 如何从经验噪声里筛出突破信号？ | `architecture.md §演进信号分诊矩阵` | `{platform}/commands/archon-demand.md §Close-Out` |
| 一个需求该用哪条专业透镜？ | `.archon/domain-lenses/README.md` | `.archon/domain-lenses/registry.yaml` |
| 对宽口径能力请求 Archon 怎么挑可复用 skill 或工具卡？ | `.archon/domain-lenses/README.md §能力工具集与技能` | `manifest.md §知识资产` + 平台 skill 元数据 |
| 这是 Domain Lens 还是 Extension？ | `README.md §机制关系图` | `architecture.md §Domain Lenses vs Extensions` |
| 工作为什么停下来去做评审？ | `.archon/drift.md` | `architecture.md §漂移预检` |
| 一次提交为什么能/不能发生？ | Run-State v2 状态文件 | `{platform}/skills/archon-git-commit/SKILL.md` |
| 一份采用方导出包是否完整？ | `governance-contract.yaml` | `scripts/archon-check.py` |
| 项目特定上下文该住在哪里？ | `.archon/manifest.md` | `{platform}/rules/archon.mdc` |

## 快速概览

> `{platform}/` 表示当前 AI 编码平台的目录 —— Cursor 上是 `.cursor/`、Claude Code 上是 `.claude/` 等。`.archon/` 在哪个平台都是同一路径。

```
.archon/                  ← 核心 + 项目状态（在每个平台路径相同）
├── soul.md               ← 认知核心（公理 · 护栏 · 演进 · 扩展点；热路径段落）
├── soul/
│   ├── delivery.md       ← 交付模式扩展（推理胶囊 · 生命周期 hook · fast-path；由 /archon-demand 加载）
│   └── review.md         ← 评审模式扩展（反思 · 分级 · 记忆固化；由 /archon-plan、/archon-review 加载）
├── manifest.md           ← 项目热上下文（栈 · 用户语言索引 · 目录 · 里程碑 · 状态 · 最近一次验证）
├── manifest/archive/     ← 冷 manifest 评审/历史详情（关键词索引 · 按需召回）
├── drift.md              ← 漂移热索引（由 scripts/archon-records.mjs 从 drift/records/ 自动生成 · ADR-22）
├── drift/records/        ← 单交付记录文件（一个 +N/-N 事件一份 · ISO8601 命名 · YAML frontmatter）
├── drift/archive/        ← 冷交付日志归档（季度分区 · 关键词索引 · 按需召回）
├── debt.md               ← 债务热门索引（由 debt/items/ 自动生成 · ADR-22）
├── debt/items/           ← 单债务条目文件（DEBT-NNN-<slug>.md · YAML frontmatter）
├── debt/archive/         ← 冷债务理由归档（完整源 · 触发细节 · 按需召回）
├── memos.md              ← 干系人结论热索引（由 memos/records/ 自动生成 · ADR-22 · ≤5 条紧凑）
├── memos/records/        ← 单备忘记录文件（一条干系人结论一份 · YAML frontmatter）
├── memos-archive/        ← 冷归档（季度分区 · 关键词匹配 · 按需召回）
├── decisions.md          ← 项目特定 ADR 账（产品、栈、采用方本地决策）
├── domain-lenses/        ← Domain Lens 的 pre-Verdict 索引 + 仅在 proceed 后用的 lens/tool 契约
│   ├── registry.yaml     ← 单一索引：已装透镜、工具发现元数据、预算
│   ├── lenses/           ← 透镜契约
│   ├── tools/            ← 限定到一条透镜的原子工具卡
│   └── templates/        ← 新领域用的透镜/工具创作骨架
│       ├── lens.md       ← 透镜契约模板
│       └── tool.md       ← 原子工具卡模板
├── extensions/           ← 可选可插拔生命周期 hook（项目特定，不随 kit 导出）
└── dashboard/            ← 可选治理状态可视化（零依赖 Node 服务；保留目录即激活）
.archon/contracts/governance-contract.yaml ← 治理检查的可移植基线
scripts/
├── archon-check.py       ← 零依赖的 Python 参考校验器
└── archon-check.sh       ← archon-check.py 的 POSIX shell 包装

{platform}/               ← 平台特定文件（.cursor/ 或 .claude/）
├── commands/
│   ├── archon.md            ← 统一入口（唤醒 + 意图路由）
│   ├── archon-demand.md     ← 交付（决策门 → 自主执行 → 验证门 → close-out）
│   ├── archon-plan.md       ← 规划（下一步建议，只读）
│   ├── archon-review.md     ← 完整评审（漂移阈值触发）
│   └── archon-dashboard.md  ← 启动治理 dashboard
├── agents/
│   ├── archon-reviewer.md         ← 独立评审子代理
│   └── archon-capture-auditor.md  ← 交付后知识捕获子代理
├── rules/
│   ├── archon.mdc                 ← 解耦规则（每个文件可/不可装什么）
│   └── archon-wake.mdc            ← 唤醒触发器（"hi archon, ..." 自然语言激活）
└── skills/
    ├── archon-framework/SKILL.md   ← 给代理用的 primer（这整个目录的自我介绍）
    ├── archon-git-commit/SKILL.md  ← 提交门 skill（读 Run-State v2 或回退到 .archon/run.md）
    ├── blink-dispatch/SKILL.md     ← 子代理薄切分发门（决定 skip vs use:<subagent>）
    └── external-agent-patterns/SKILL.md ← 外部框架评估 skill（在借用模式前检查角色假设）
```

## 机制关系图

![漫画图解：Archon 机制泳道](/images/readme/03-mechanism-lanes.png)

Archon 保持清晰的方式是让每条机制只待在一条泳道里：

| 泳道 | 机制 | 拥有 | 不拥有 |
|------|-----------|------|--------------|
| 身份 | `soul.md` + `soul/` | Archon 的公理、自主、评审纪律、交付规则 | 项目事实或领域特定工具集 |
| 项目状态 | `manifest.md`、`manifest/archive/`、`debt.md`、`memos.md`、`drift.md` | 产品上下文、用户语言别名、里程碑状态、最近验证、冷评审详情、活动债务门索引、干系人结论索引、交付日志、交付后评审、漂移压力 | 通用框架规则 |
| 需求聚焦 | `.archon/domain-lenses/` | 一次交付的专业透镜、可复用能力路由、有界原子工具 | 生命周期 hook、人格变化、特定提供商手册或选择器对交付的所有权 |
| 生命周期 hook | `.archon/extensions/` | 项目本地的预扫描、close-out、评审、dashboard 或工作流 hook | 一次需求内部的领域推理 |
| 子代理分发 | `blink-dispatch` skill + `archon-reviewer` / `archon-capture-auditor` + 通用只读能力选择器 | 独立评审、捕获、紧凑能力选择何时值得花上下文/成本 | 主代理对交付的所有权 |
| 交付状态 | `.archon/runs/<run_id>/state.json` + `archon-git-commit` | 单次交付的完成证据与提交许可 | 长期项目记忆 |
| 可移植强制 | `governance-contract.yaml` + `archon-check.py` + authoring 测试 | 随框架走的基线检查 | 产品特定策略叠加 |
| 声明校验 | `scripts/archon-verify.mjs`（ADR-27）—— 5 模式：numeric-claim · borrowed-concepts · self-citation · missed-triggers · preservation-evidence | 抓治理散文与仓库状态的"说-真"漂移 | 决定一条声明本身是否值得做出 |
| 保留钉死 | Soul §保留轴 + 关键规则注册表 + `web/src/test/governance.test.ts` 体型检查 + `governance-contract.yaml` 条目（ADR-28 三件套） | 机械锚定承重规则，让演进不能悄悄抽空它们 | 压制对新规则的合法结晶 |
| 项目决策史 | `.archon/decisions.md` | 本项目为什么选某个产品、栈、本地架构路径 | 框架机制理由 |
| 框架决策史 | `docs/archon/decisions.md` | 为什么有一条可复用 Archon 机制、何时该重审 | 项目运行时真相源 |

经验法则：Domain Lenses 改变 **一次需求如何被推理**；Extensions 改变 **何时跑生命周期行为**；Run-State 证明 **本次交付已完成**；漂移热索引记录 **最近交付了什么、学到了什么**，并决定 **代理在更多工作前是否需要评审**；漂移归档只在某次 demand/review/debt/ADR 指向更早期或关键词时加载。

能力规则：部署策略、数据后端选择、前端状态管理、响应式行为、加载反馈、骨架屏策略这种宽口径请求用 `capability` 透镜。领域工具候选来自 `registry.yaml`；skill 候选来自 manifest 知识资产或平台 skill 元数据。如果一次性读完所有候选资产会挤占主上下文，主代理可以在 `Verdict=proceed` 之后向通用只读选择器要一份紧凑 `capability_selection` 包。选择器永远不输出 Verdict、不启动子代理、不动手实施。

**例：主题色板请求**

![漫画图解：Domain 工具主题色板案例](/images/readme/05-domain-tool-theme-palette-case.png)

"帮我设计一份卓越的主题色板"这种请求不只是自由风格的品味。Archon 走 `design` 透镜路由，选 `design/palette-boundary`，加载相关设计系统 skill，然后产出有界色板契约：角色、比例、对比度、状态色与拒绝规则。Domain Lens 决定 **走哪条能力路径**；工具卡定义 **需要什么形状的可复用判断**；skill 提供 **特定提供商或项目实践**；验证证明结果能指导实施。

演进规则：交付经验先以漂移事件起步，只有当它重复出现或带来强制/复用/架构价值时才晋升为演进信号，再提升到最适配的最强载体。Archon 把自演进思路借为本地约束升级；它不安装守护进程、不复制外部协议 schema、也不把漂移当 backlog 用。

预测规则：每次非 fast-path 的 close-out 会把一份紧凑的架构预测（`risk|next|confidence`）写进交付记录。预测帮助下次预扫描去检视可能的压力，但它不是 backlog、不是 roadmap、也不是跳过下次 Verdict 的许可。

每次交付的临时状态（按需创建，不在交付间版本化）：

```
.archon/runs/<run_id>/state.json       ← 每个活动交付的 Run-State v2（gitignored）
.archon/runs/<run_id>/events.ndjson    ← 仅追加的 v2 事件轨迹（gitignored）
.archon/run.md                         ← 迁移期的旧版单文件回退
.archon/templates/run-state.schema.json ← 随导出发行的 v2 schema
.archon/templates/run.template.md  ← 随导出发行的旧版 schema 参考
scripts/archon-run-state.mjs           ← v2 助手（init/set/check/resolve-for-commit/cleanup）
```

状态载体速查：

| 需求 | 写到 |
|------|----------|
| 证明这条进行中的交付可以提交 | `.archon/runs/<run_id>/state.json` |
| 把干系人措辞或别名解析到项目工件 | `.archon/manifest.md §用户语言索引` |
| 记录交付了什么、学到了什么 | `node scripts/archon-records.mjs new drift --type delivery --delta +N --summary "..."` → `.archon/drift/records/*.md`（热摘要自动重生）+ `.archon/drift/archive/*.md` 冷日志 |
| 更新持久项目事实或最近验证 | `.archon/manifest.md` 热上下文 + `.archon/manifest/archive/*.md` 冷评审详情 |
| 跟踪未解工作或晋升的后续 | `node scripts/archon-records.mjs new debt --id DEBT-NNN --severity ... --status pending --deadline ... --source "..." --summary "..."` → `.archon/debt/items/*.md`（热索引自动重生）+ `.archon/debt/archive/*.md` 冷理由 |
| 捕获干系人结论 | `node scripts/archon-records.mjs new memos --topic "..." --conclusion "..." --source "..."` → `.archon/memos/records/*.md`（热索引自动重生）+ `.archon/memos-archive/*.md` 冷归档 |
| 解释一条可复用 Archon 机制为何存在 | `docs/archon/decisions.md` |
| 记录项目特定的产品或栈决策 | `.archon/decisions.md` |

如果一条笔记只是一次性观察，留在 `drift.md` 就好；只有在它变得重复、可强制、可复用或具架构性时才晋升。

保留规则（ADR-28 双向运动）：每次 Close-Out 的交付后评审同时问 (a)(b)(c) 什么应该 **改变**（结晶）和 (d) 什么 **已经在工作** 应该被钉住防止悄悄抽干（保留）。一颗钉是绊线，不是墙 —— 三件机械组件（锚 + 体型测试 + 可移植契约条目），只能作为显式、可审计的编辑被移除。

## 工作流

![漫画图解：Archon 交付路线](/images/readme/04-delivery-route.png)

```
 /archon-demand "implement feature X"    [当平台支持时，从 Plan 模式调用]
        │
        ▼
 Step 0 · 漂移预检 ──→ 硬门：emergency → 停 · full → 阻 · light → 提示
        │
        ▼
   Pre-Scan ──→ memos + 归档关键词匹配 + ADRs + 用户语言索引别名扫描 + extension 预扫描 hook
        │
        ▼
   Domain Lens ──→ 可选单透镜 + 有界原子工具，或对多领域需求做拆分
        │
        ▼
   Fast-Path? ──→ 合规的 trivial（≤2 文件 · 无新模式）→ 折叠仪式
        │ 否
        ▼
   Decision Gate ──→ **Verdict**：裁决 + 半径 + 可逆性 + 理由
        │             ├─ Plan 模式绑定：Verdict 在任何写侧工具调用之前
        │             └─ 收敛门（manifest 声明收敛范围时）：
        │                范围外需求 → 拒绝，除非豁免或被用户覆盖
        │
        ├─ Capability 选择器? ──→ 当能力资产含糊时，可选只读包
        │
        ▼
   自主执行 ──→ Agent 自定工具、辅助代码、顺序、回退点
        │             └─ 边界硬/过程软：Verdict、验证、Run-State、
        │                独立评审、演进过滤仍是硬门
        │
        ▼
   验证门 ──→ lint + typecheck + test 全绿
        │
        ▼
   Close-Out ──→ manifest · capture(子) · drift（机械保底 + 架构预测）· memos(+归档) · extensions · git → **Close-Out** 合规清单
        │             ├─ Run-state 门：v2 permitCommit=true 或旧版 permit_commit: 1
        │             └─ archon-git-commit skill 处理提交；pre-commit hook 强制门
        │
        ├→ drift ≥ light 阈值      ──→ 下次 medium/large 需求前做 light 评审
        ├→ drift ≥ full 阈值       ──→ /archon-review (full) → 重置
        └→ drift ≥ emergency 阈值  ──→ /archon-review (emergency) → 暂停 + 重置 + 整改计划
             （阈值在里程碑收敛期收紧 —— 见 drift-mechanism.md）
```

## 接下来去哪

| 读者 | 从这里开始 |
|--------|------------|
| 第一次接管 Archon 治理项目的 AI 代理 | `{platform}/skills/archon-framework/SKILL.md` → 本 README → 仅在需要更深细节时读 `architecture.md` |
| 探索某个采用方项目的人类开发者 | 本 README → `architecture.md` 看设计理由 → `docs/archon/decisions.md` 看框架权衡 → `.archon/decisions.md` 看项目权衡 |
| 把 Archon 装进新项目的集成者 | 完整跑一遍 `setup.md` |
| 演进框架本身的贡献者 | 仅 authoring 源：`user-journeys.md` + `drift-mechanism.md` + `model-vs-harness.md` + `docs/archon/decisions.md` |
