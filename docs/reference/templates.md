# Templates 模板

这三个文件是**项目特定**的——用模板初始化后，按你的项目实况填写。Archon 在交付过程中会自动维护它们。

## Manifest

> 项目全貌文件。Archon 每次启动时加载此文件获取上下文。**唯一允许放项目细节的 Archon 文件。**

::: tip 文件位置
`protocol/templates/manifest.md` → 部署到 `.archon/manifest.md`
:::

<<< @/../protocol/templates/manifest.md{md}

### 各区块说明

| 区块 | 内容 | 由谁更新 |
|------|------|---------|
| 产品 | 产品定义、核心流程、商业模式 | 手动（初始化时填写） |
| 技术栈 | 框架、版本、依赖 | 手动 + Archon 补充 |
| 验证命令 | lint + typecheck + test 的具体命令 | 手动 |
| Git 策略 | 提交模式 + 分支模型 | 手动 |
| 目录结构 | 完整文件树 | Archon 每次交付后更新 |
| 知识资产 | 所有 rules/skills/ADR 的索引 | Archon 每次沉淀后更新 |
| 里程碑 | 硬验收条件 | 手动定义，Archon 勾选 |
| 当前状态 | 进行中的里程碑 + 已知问题 | Archon 每次交付后更新 |
| 对话备忘 | Stakeholder 结论滚动表 | Archon 自动维护（≤10 条） |

## Drift

> 认知漂移计数器。每次交付后由 Archon 评估复杂度并累加。达到阈值时触发全量审查。

::: tip 文件位置
`protocol/templates/drift.md` → 部署到 `.archon/drift.md`
:::

<<< @/../protocol/templates/drift.md{md}

### 日志格式

每条交付记录包含 `沉淀` 列：

- 有捕获：`Lx: 资产名`（如 `L2: frontend.mdc`）
- 无捕获：`—`

审查时通过 `沉淀` 列统计**捕获率**（有沉淀的交付 / 总交付），< 0.3 标记知识流失风险。

## Debt

> 技术债务登记簿。结构化追踪所有推迟的修复项。

::: tip 文件位置
`protocol/templates/debt.md` → 部署到 `.archon/debt.md`
:::

<<< @/../protocol/templates/debt.md{md}

### 核心原则

> 推迟可以，遗忘不行。推迟 = 登记 + 截止日期。不登记 = 不存在 = 没人管。

里程碑关闭前，所有 `milestone-close` 截止的条目必须 `resolved`。
