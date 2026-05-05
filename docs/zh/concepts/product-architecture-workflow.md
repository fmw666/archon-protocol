# Archon 产品架构工作流

> Archon 作为一款独立产品：项目如何采用它，Archon 如何理解项目状态，需求如何被路由，工程判断如何变成被验证的交付。

![漫画图解：Archon 产品架构地图](/images/product-architecture-workflow/01-product-map.png)

本文档与 [architecture.md](/zh/concepts/architecture) 互补：那一篇解释 Archon 的内部机制；这一篇从采用方角度解释产品工作流。如果你想先装上 Archon 再读产品视图，从 [adoption/quickstart.md](/zh/setup/quickstart) 开始。

## 目的

Archon 是一款仓库原生的 AI 工程治理产品。它不替代编码模型，也不作为后台守护进程运行。它给模型提供持久的项目上下文、硬性的工程门、独立评审，以及一种可重复的方式 —— 把交付经验变成更强的约束。

## 产品边界

| 边界 | Archon 拥有 | Archon 不拥有 |
|------|------|------|
| 项目采用 | 框架 kit、项目状态模板、验证与提交门 | 采用方的产品决策 |
| 运行时判断 | 路由、Verdict、验证、Close-Out、评审压力 | 盲目执行用户的技术偏好 |
| 项目记忆 | Manifest、drift、memos、debt、ADR、冷归档 | 替代 Git 历史或聊天记录存档 |
| 产品化 | 导出 kit、安装/迁移器、治理校验器、平台适配器、Dashboard | 一个独立的、自主的编码守护进程 |

产品承诺是：用户表达意图；Archon 提供工程所有权、上下文连续性、验证与学习。

## 核心产品模块

| 模块 | 产品角色 | 主要文件 |
|------|------|------|
| Core Kit | 可移植的治理运行时 | `.archon/soul.md`、`.archon/soul/`、领域透镜、契约、模板 |
| 平台适配器 | IDE 特定的激活与命令 | `{platform}/commands`、`{platform}/rules`、`{platform}/skills`、`{platform}/agents` |
| 项目状态 | 采用方特定的事实与记忆 | `manifest.md`、`drift.md`、`debt.md`、`memos.md`、`.archon/decisions.md` |
| 运行时凭证 | 每次交付的提交许可 | `.archon/runs/<run_id>/state.json`、`scripts/archon-run-state.mjs` |
| 治理校验器 | 可移植的机械强制 | `.archon/contracts/governance-contract.yaml`、`scripts/archon-check.py` |
| Dashboard | 可选的可视化层 | `.archon/dashboard/` |

## 新项目接入

![漫画图解：Archon 新项目接入](/images/product-architecture-workflow/02-new-project-onboarding.png)

新项目从一条干净的安装路径起步：

1. **复制或导出 kit**：装上与项目无关的核心、平台适配文件、模板、治理校验器、运行状态助手。
2. **填项目状态**：完成 `manifest.md`，初始化 `drift.md`、`debt.md`、`memos.md` 与 `.archon/decisions.md`。
3. **装上机械守卫**：注册 manifest 验证命令、加上治理检查、把 pre-commit 生命周期门接好。
4. **跑第一次 plan**：`/archon plan` 证明 Archon 能加载到正确的章节、并能从状态推断出项目下一步。

只有当第一次 plan 输出连贯、且验证命令能强制声明的治理契约时，接入才算完成。

## 已有项目接管

![漫画图解：Archon 已有项目接管](/images/product-architecture-workflow/03-legacy-project-intake.png)

已有项目不是空白模板。Archon 必须先理解它，再去治理它。

接管流程：

1. **先读现实**：检查源码布局、构建与测试命令、部署路径、文档、约定、CI、已有护栏。
2. **抽取持久事实**：只把当前真相写进 `manifest.md`：产品目的、技术栈、目录职责、验证命令、知识资产、当前状态。
3. **分类隐式知识**：把反复出现的约定提升到最适配的最强载体：类型、测试、lint、规则、skill、ADR、manifest、备忘或债务。
4. **保兼容**：不要为了符合 Archon 而重写项目。把缺口注册为带 deadline 的债务，让未来的需求来偿还。
5. **从低风险治理工作开始**：稳定验证、同步 manifest、索引知识资产，然后进入正常的需求交付。

兼容性规则很简单：Archon 先把自己的项目状态文件适配到真实项目；只有在 Verdict 判定改动是合理的之后，它才动项目。

## 需求执行

![漫画图解：Archon 需求执行路径](/images/product-architecture-workflow/04-demand-execution.png)

每一项面向用户的特性请求、bug 修复或变更请求，进入同一条决策管道：

```text
Wake / command
→ Drift Precheck
→ Router
→ Pre-Scan
→ Domain Lens 分类
→ Fast-Path 检查
→ Verdict
→ Capability selector packet（可选，Verdict 之后）
→ 自主执行
→ Validation Gate
→ Close-Out
→ Run-State 提交许可
→ Git 策略
```

执行内部是灵活的：代理自选文件、工具、辅助脚本、测试策略、回退点。对于宽口径可复用能力请求，被选中的 `capability` 透镜可以在 `Verdict=proceed` 之后让一个通用只读选择器返回一个紧凑的资产包；这个包最多能命名几条值得加载的 skill 或领域工具，但它不能决定交付、也不能动手实施改动。边界则不灵活：Verdict 之前不准写、有文件改动时不验证不交付、没有 Run-State 许可不能 commit、需要独立评审时不能自评、没有演进信号不能永久升级规则。

## 路由与判断

| 用户输入 | 路由 | 判断 |
|------|------|------|
| 状态、下一步、不确定性 | Plan | 只读地感知状态并排优先级 |
| 特性、bug、具体改动 | Demand | 先 Verdict，仅在站得住脚时才执行 |
| 审计、质量、安全、漂移压力 | Review | 基于漂移与触发判定 Light、Full 或 Emergency |
| 意图模糊 | Plan | 安全默认；产出可操作的需求候选 |

判断是从状态推断的，而不是开关驱动的。Archon 从 manifest 里程碑、验证状态、债务 deadline 与漂移模式里推断「构建、加固、修复、评审压力」。

## 配置面

Archon 应该让人感觉「通过项目真相」可配，而不是「通过一堆模式开关」可配。

| 需求 | 通过谁来配 |
|------|------|
| 这个项目是什么 | `manifest.md §产品` 与 `§概念词汇表` |
| 如何证明安全 | `manifest.md §验证命令` |
| 多少上下文可以保持热加载 | `manifest.md §上下文预算` |
| 有哪些可复用的知识资产 | `manifest.md §知识资产` + 平台 skill 元数据 |
| 提交怎么发生 | `manifest.md §Git 策略` |
| 有哪些专业聚焦与领域工具可用 | `domain-lenses/registry.yaml` |
| 哪些项目本地 hook 在跑 | `.archon/extensions/<id>/extension.md` |
| 哪些基线契约必须成立 | `.archon/contracts/governance-contract.yaml` |

如果一项设置能从项目当前状态推断出来，优先用推断。只在状态无法可靠表达决策时才加配置。

## 产品化的交付面

把 Archon 当独立产品来看，干净的打包形态是：

| 面 | 职责 |
|------|------|
| Export Kit | 复制进采用方项目的可复用文件 |
| Installer | 建立目录形态、初始化项目状态模板 |
| Migrator | 对已有项目做只读接管，起草第一份 manifest/debt/memo |
| Checker | 在编辑源之外跑可移植治理检查 |
| 平台适配器 | 把 commands、rules、agents、skills 转成各 IDE 的文件格式 |
| Dashboard | 展示当前漂移、runs、债务、里程碑、评审压力 |

这样兼容性边界就停在仓库文件层。版本化打包可以以后再说；当前的产品单位是「导出的 kit + 机械检查」。

## Non-Goals

Archon 不该变成：

- 后台自主编码守护进程
- 聊天记录数据库
- Git 历史的替代品
- 一个重配置的策略引擎
- 让用户挑技术选项的工作流工具
- 从其他 agent 框架抄来的独立记忆协议

任何被提出的产品特性都必须保住所有权模型：Archon 在项目仓库内部仍是工程所有者，用户是产品干系人。

## 接入就绪检查表

| 检查项 | 新项目 | 已有项目 |
|------|------|------|
| Core kit 已复制 | 必需 | 必需 |
| 项目状态已初始化 | 来自模板 | 来自仓库接管 |
| 验证命令绿 | 交付前必需 | 高风险交付前确立 |
| Drift 起步可控 | `0` | 仅当合理时，初值反映已知错位 |
| 债务登记簿就绪 | 为空 | 用真实未解风险播种 |
| 知识资产已索引 | 起步索引 | 先映射好已有的 rules/docs/skills |
| 第一次 `/archon plan` 连贯 | 安装通过 | 接管通过 |

最终的接入信号不是"文件存在"；而是"Archon 能解释当前项目状态、并在不靠猜的情况下给出下一步工程动作"。
