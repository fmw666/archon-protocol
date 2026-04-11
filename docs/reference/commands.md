# Commands 命令

Archon 的三种工作模式通过命令文件定义，每个文件是一套完整的工作流协议。

## 统一入口：archon.md

> 唤醒后的第一站——分析用户意图，路由到正确的工作模式。

::: tip 文件位置
`protocol/commands/archon.md` → 部署到 `{platform}/commands/archon.md`
:::

<<< @/../protocol/commands/archon.md{md}

### 设计要点

- **显式优先**：`plan`、`review`、`demand:` 前缀直接路由，省 token
- **隐式兜底**：无前缀时从语义判断，不明确偏向 plan（只读安全）
- **Drift 前置检查**：路由到 demand 前先检查 drift，≥ 阈值强制先审查

## Plan 规划模式

> 只读模式——不写代码、不改文件，只输出评估和计划。

::: tip 文件位置
`protocol/commands/archon-plan.md` → 部署到 `{platform}/commands/archon-plan.md`
:::

<<< @/../protocol/commands/archon-plan.md{md}

### 设计要点

- **状态感知**：从 manifest、drift、debt 中提取项目现状
- **主动审视三问**：强制回答工程覆盖、原则递归、用户盲区
- **优先级规则**：drift ≥ 阈值 > 里程碑未完成 > 基础设施瓶颈 > 产品价值 > 低风险
- **可执行输出**：每个推荐项可直接粘贴进 `/archon-demand` 执行

## Demand 需求交付模式

> 完整的端到端交付工作流——从决策到实现到验证到收尾。

::: tip 文件位置
`protocol/commands/archon-demand.md` → 部署到 `{platform}/commands/archon-demand.md`
:::

<<< @/../protocol/commands/archon-demand.md{md}

### 设计要点

这是 Archon 最复杂的命令，包含完整的交付生命周期。核心阶段：

1. **前置扫描** — 检索对话备忘和架构决策，避免重复讨论
2. **决策关卡** — 该不该做？做多大？否决也是合法输出
3. **执行** — 按方案实施
4. **验证门** — lint + typecheck + test 必须全绿
5. **六步收尾** — manifest 同步 → 知识捕获(sub) → 沉淀执行 → drift 记分 → 里程碑门禁 → 对话备忘

## Review 全量审查模式

> drift ≥ 12 时自动触发，或用户手动运行。委托独立的 reviewer sub-agent 执行审查。

::: tip 文件位置
`protocol/commands/archon-review.md` → 部署到 `{platform}/commands/archon-review.md`
:::

<<< @/../protocol/commands/archon-review.md{md}

### 设计要点

- **执行与判断分离**：审查由独立 sub-agent 完成，主 Agent 根据报告修复
- **分级问题列表**：Critical（必须立即修复）/ Warning（应该修复）/ Observation（记录观察）
- **审查后重置**：drift 归零或写入残留值
