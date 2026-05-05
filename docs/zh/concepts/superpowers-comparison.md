# Archon vs Superpowers —— 横向对比与采纳的纪律

> Superpowers v5.0.7（2026-03）与当前 Archon 版本的结构性对比。如果你想看完整的内部架构而不是这份比较，去读 [architecture.md](/zh/concepts/architecture)。

![漫画图解：Superpowers 是横向 skill 库，Archon 是纵向治理框架](/images/superpowers-comparison/01-skills-vs-governance.png)

两套系统解决的是问题的不同层次。Superpowers 是**横向 skill 库**（*怎么写代码*）。Archon 是**纵向治理框架**（*怎么治理*）。新加的 `capability` 领域透镜让 Archon 可以在治理流程内部路由横向能力：先决定某个 skill / 工具该不该被加载，再让主代理消费它 —— 而不是把 Archon 自身变成静态 skill 库。互补多于竞争。

## 1. 定位

本节是把"为什么这两套系统不会一对一竞争"的框架立起来。后面各节会逐项走过每条机制，记录 Archon 采纳了 Superpowers 哪些纪律、刻意拒绝了哪些。

## 2. 逐机制对比

### 2.1 工作流

| 维度 | Superpowers | Archon | 裁决 |
|-----------|-------------|--------|---------|
| 设计阶段 | brainstorm → spec → 用户审批 | Decision Gate（该不该做 / 多大）→ 执行 | SP 更严格但牺牲自主；Archon 的 gate 轻但够用 |
| 计划阶段 | writing-plans（2–5 分钟粒度，全代码） | 没有独立计划文档 | SP 适合委派给 junior agent；Archon 自身是资深，不需要教科书级计划 |
| 执行阶段 | 每任务一个 subagent + 两阶段 review | 主代理自主执行 | SP 的 subagent 隔离能保护上下文；Archon 不拆执行，靠 validate gate 兜底 |
| 评审阶段 | code-reviewer subagent（每任务） | Blink Dispatch 分诊 capture-auditor / reviewer / skip | SP 高频低深度；Archon 条件触发，保留独立判断同时控延迟 |
| 知识管理 | 无（skill 是静态文件） | drift / debt / capture-auditor / 演进机制 | **Archon 独有强项** |

### 2.2 质量保障

| 维度 | Superpowers | Archon | 裁决 |
|-----------|-------------|--------|---------|
| 测试纪律 | TDD 强制（先写测试或删了重来） | "新代码 = 新护栏"（必须有测试，不规定顺序） | SP 严格但教条；Archon 灵活但强制偏软 |
| 调试方法 | 四阶段根因分析 + 反合理化表 | 无（推理胶囊只记事后路径） | **SP 优势 → 已采纳** |
| 约束强制 | 完全依赖 L3 文档 | 约束金字塔 L0→L5 + Lint 规则桥 | **Archon 独有强项** |
| 代码评审 | 每任务一个 subagent review | 漂移阈值触发的完整 review | SP 更频繁；Archon 更经济 |
| 能力选择 | 用户或 skill 自入口 | `capability` 透镜路由 skill / 领域工具 / 测试 / ADR / manifest | Archon 有横向能力入口，但消费仍受治理把关 |

### 2.3 自我演进

| 维度 | Superpowers | Archon | 裁决 |
|-----------|-------------|--------|---------|
| 知识捕获 | ❌ 无 | ✅ capture-auditor + 触发表 + 结晶路径 | **Archon 独有** |
| 漂移检测 | ❌ 无 | ✅ 漂移计数器 + 阈值评审 | **Archon 独有** |
| 债务跟踪 | ❌ 无 | ✅ debt.md + 里程碑门 | **Archon 独有** |
| 约束成熟度 | ❌ 无 | ✅ SHOULD → MUST 升级路径 | **Archon 独有** |
| 盲区自省 | ❌ 无 | ✅ 递归适用性 + 主动评审四问（2026-05 扩为五问） | **Archon 独有** |
| 反合理化 | ✅ 每个 skill 内置 Red Flags 表 | ⚠️ 原则在 soul 层存在，但 skill 层缺失 | **已采纳** |
| 双向演进 | ❌ 无（只有"skill = 静态文件"心智模型） | ✅ 结晶（变化 → 更强载体）+ 保留（稳定 → 三件套钉死，ADR-28） | **Archon 独有**：避免只纠错的演进偏差 |
| 声明 vs 真相守卫 | ❌ 无 | ✅ `archon-claim-verifier.mjs`，五种模式（数值 · 借用 · 自引 · 漏触发 · 保留，ADR-27+28） | **Archon 独有**：把治理散文与仓库内真相机械地交叉校对 |
| 并发交付存储 | 不适用（无治理状态） | ✅ Records-Folder 事件溯源 + 可重算热摘要（ADR-22） | **Archon 独有**：多代理并行交付不会发生文本冲突 |
| 前瞻性拆分 | ❌ 无（凭"感觉"拆，永远是事后） | ✅ Decision Gate 源码模块化探针（ADR-29）：在创建文件或命中地图时机械检测轴向扇出 | **Archon 独有**：先发制人地化解并发 PR 的合并冲突 |

### 2.4 子代理策略

| 维度 | Superpowers | Archon |
|-----------|-------------|--------|
| 数量 | 多（每任务 1 个执行 + 2 个 review） | 精简（Blink Dispatch + auditor + reviewer） |
| 触发 | 每任务 | Blink Dispatch 的薄切判定；高风险用 auditor；满足完整 review 阈值用 reviewer；低风险 skip |
| 成本 | 高（v5.0.6 实测发现 25 分钟 review 开销没换来可测的质量提升 → 已移除） | 低（仅把判断类工作精确委派） |
| 上下文隔离 | ✅ 强调（subagent 只拿到必要上下文） | ✅ 存在（子代理收到摘要） |

**关键经验数据**：Superpowers v5.0.6 用回归测试证明：把 review 机械化为 subagent 会带来 ×50 的延迟，且没有可测的质量提升。→ 记录在 `soul/delivery.md §成本意识原则`。

## 3. 采纳落地清单

![漫画图解：采纳有用的纪律，拒绝那些削弱自主或膨胀流程的](/images/superpowers-comparison/02-adopt-or-reject.png)

### ✅ 已采纳

| 项 | 来源 | 落地位置 | 适配 |
|------|--------|------------------|------------|
| **反合理化表** | SP 每个 skill 里的 Red Flags 段 | `react-19-patterns §Red Flags`（7 条）、`api-schema-guide §Red Flags`（6 条）、`systematic-debugging §Red Flags`（8 条） | 从通用教条转向项目特定场景（引用 `debt.md` 证据） |
| **系统化调试方法论** | SP `systematic-debugging` skill | `.cursor/skills/systematic-debugging/SKILL.md` | 去掉"问搭档"（自主原则）；接入推理胶囊（Archon 独有的知识结晶机制）；去掉 TDD 强制（保持执行灵活） |
| **子代理成本意识** | SP v5.0.6 经验数据 | `soul/delivery.md §何时升级到委派`（含成本意识） | 编码为决策原则而非配置 —— 与"推断 > 配置"对齐 |

### ❌ 显式拒绝

| 候选 | 拒绝理由 | 引用的 Archon 原则 |
|-----------|------------------|-----------------------|
| brainstorming 工作流 | 一来一回地丰富需求，违反"不要让用户思考" | 自主性 |
| writing-plans 计划文档 | 每次 demand 都产一份计划文件 = 治理膨胀 | 精简 > 累积 |
| TDD 强制（测试在代码后写就删除） | 代理自选最优执行路径；教条式约束损效率 | 所有权（代理判断最优执行） |
| git worktree 隔离 | 当前直接走分支模型；过早复杂化 | 演进节奏（从状态推断，不预防性引入） |
| 每任务一个 subagent 执行 | Archon 的代理是资深，不需要拆任务给 junior | 所有权 > 辅助 |

## 4. Archon 完整架构

![漫画图解：Blink Dispatch 只委派判断类工作](/images/superpowers-comparison/03-blink-dispatch-cost.png)

> 完整架构文档：**[architecture.md](/zh/concepts/architecture)**（系统总览、交付生命周期、约束金字塔、知识演进系统、子代理委派模型）。
>
> 下方清单只是为对比参考用的特性总览。核心模式不变：机械检查自己跑；判断检查交给委派。Blink Dispatch 分诊 capture-auditor / reviewer / skip。

## 5. 采纳后 Archon 特性总览

![漫画图解：Archon 的动态知识系统持续从交付中演进](/images/superpowers-comparison/04-dynamic-knowledge.png)

| 类别 | 特性 | 来源 |
|----------|---------|--------|
| **身份** | 项目所有权模型（Agent = Owner，不是 Assistant） | 原生 |
| **身份** | 五条身份公理（所有权 > 辅助 · 约束 > 文档 · 推断 > 配置 · 精简 > 累积 · 分离 > 自评） | 原生 |
| **认知** | Sense → Model → Act → Verify 循环（允许任意回退） | 原生 |
| **治理** | 交付生命周期（7 阶段 + 版本控制 + 阈值事件） | 原生 |
| **治理** | Decision Gate（该不该做 / 多大 / 谁定） | 原生 |
| **治理** | Validate gate（lint + typecheck + test；不绿不放过） | 原生 |
| **治理** | 漂移计数器 + 阈值强制评审 | 原生 |
| **治理** | 债务登记簿 + 里程碑门 | 原生 |
| **质量** | 约束金字塔 L0–L5 | 原生 |
| **质量** | 约束成熟度（SHOULD → MUST 升级路径） | 采自 archon-protocol |
| **质量** | Lint 规则桥（L1 主动触发 L2） | 原生 |
| **能力** | Capability 透镜：把 deploy、data-platform、state-management、reactivity、skeleton-UI 等请求路由到 skill / 领域工具 / 测试 / ADR / manifest | 原生 |
| **质量** | skill 内置反合理化表（Red Flags） | ✨ 采自 Superpowers |
| **质量** | 系统化调试方法论（四阶段根因分析） | ✨ 采自 Superpowers |
| **演进** | 知识捕获（触发表 + 结晶路径） | 原生 |
| **演进** | 双向演进：结晶（变化）+ 保留（稳定，三件套钉死，ADR-28） | 原生 |
| **演进** | Claim Verifier，五种模式（numeric / borrowed / self-cite / missed-trig / preservation，ADR-27+28） | 原生 |
| **演进** | 推理胶囊（症状 → 根因 → 修复，嵌入 skill） | 原生 |
| **演进** | 递归适用性（soul 原则约束 Archon 自身） | 原生 |
| **演进** | 主动评审五问（plan/review 必填；ADR-28 加了一条保留问题） | 原生 |
| **演进** | 已知盲区模式表（含只纠错的演进偏差，ADR-28） | 原生 |
| **状态** | Records-Folder 事件溯源 + 可重算热摘要（drift/memos/debt，ADR-22） | 原生 |
| **治理** | Decision-Gate 三探针（Radius ADR-23 · Soul-headroom · Modularity ADR-29）；裁决前先喂机械事实 | 原生 |
| **委派** | 执行/判断分离（子代理建议；主代理执行） | 原生 |
| **委派** | 成本意识原则（机械检查自己跑；判断检查交委派） | ✨ 采自 Superpowers v5.0.6 经验数据 |
| **解耦** | soul / commands / agents 与项目无关；可移植到任何新项目 | 原生 |
| **解耦** | manifest 是项目特定信息的唯一处所 | 原生 |
| **卫生** | 创建即守护 + 治理预算 + 上下文预算 | 原生 |
| **卫生** | 治理文件行数门（governance.test.ts） | 原生 |
