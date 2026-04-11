# Agents 子代理

Archon 的 Sub-agent 是独立的 AI 代理，通过结构化协议与主 Agent 协作。它们的核心价值：**执行与判断分离**——做的人不评，评的人没做。

## capture-auditor

> 每次交付收尾时由主 Agent 委托，独立评估知识捕获价值和交付卫生。

::: tip 文件位置
`protocol/agents/archon-capture-auditor.md` → 部署到 `{platform}/agents/archon-capture-auditor.md`
:::

<<< @/../protocol/agents/archon-capture-auditor.md{md}

### 职责

| 维度 | 检查内容 |
|------|---------|
| **知识捕获** | 这次交付是否产生了值得固化的经验？推到哪个约束层级？ |
| **盲区反思** | 交付过程中有没有被忽视的问题？ |
| **交付卫生** | 新模块有测试吗？命名一致吗？manifest 需要更新吗？ |

### 输出格式

结构化建议（主 Agent 执行）：
- 沉淀建议：什么知识 → 沉淀到哪里（L0-L5）
- 卫生问题：需要修复的条目列表
- 盲区发现：被忽视的潜在问题

## archon-reviewer

> drift ≥ 12 或手动触发时，由主 Agent 委托执行全量项目审查。

::: tip 文件位置
`protocol/agents/archon-reviewer.md` → 部署到 `{platform}/agents/archon-reviewer.md`
:::

<<< @/../protocol/agents/archon-reviewer.md{md}

### 审查维度

| 维度 | 检查内容 |
|------|---------|
| **架构健康** | 模块依赖、抽象合理性、边界清晰度 |
| **代码质量** | 死代码、命名一致性、模式统一性 |
| **规格合规** | 代码实况 vs manifest 声明 |
| **知识健康** | 捕获率（有沉淀的交付 / 总交付）、规则时效性 |

### 主动审视三问

每次审查必须回答：

1. 工程全流程覆盖：覆盖了什么？**缺了什么？**
2. 原则递归：Soul 原则是否约束 Archon 自身？
3. 预判盲区：用户最可能问"你怎么没想到 X"的 X 是什么？

### 问题分级

| 级别 | 含义 | 处理方式 |
|------|------|---------|
| **Critical** | 必须立即修复 | 主 Agent 当场修 |
| **Warning** | 应该修复 | 修复或登记 debt |
| **Observation** | 记录观察 | 登记 debt 或忽略 |
