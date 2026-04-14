# Rules 规则

Archon 自带两条规则文件，用于维护框架自身的完整性。

## 解耦守则

> 确保 Archon 的通用文件不被项目细节污染——这是跨项目可搬运性的基础。

::: tip 文件位置
`protocol/rules/archon-decouple.md` → 部署到 `{platform}/rules/archon-decouple.mdc`（Cursor）或 `.md`（Claude Code）
:::

<<< @/../protocol/rules/archon-decouple.md{md}

### 核心规则

**通用文件中禁止出现：**
- 具体技术/框架名（React、Vite、ESLint 等）
- 具体文件路径（`web/`、`src/` 等）
- 具体 shell 命令（`npm run validate` 等）
- 具体指标数字（Lighthouse ≥ 90 等）

**正确的表达方式：**

| 耦合写法 | 解耦写法 |
|---------|---------|
| TypeScript strict | 类型系统最严格模式 |
| ESLint | linter + 架构边界规则 |
| npm run validate | manifest 中声明的验证命令 |
| `.cursor/rules/` | 平台规则目录 |

## 唤醒触发器

> Always-applied 规则，检测 "hi archon" 唤醒词并引导到路由逻辑。

::: tip 文件位置
`protocol/rules/archon-wake.md` → 部署到 `{platform}/rules/archon-wake.mdc`（Cursor）或 `.md`（Claude Code）
:::

<<< @/../protocol/rules/archon-wake.md{md}

### 设计决策

**为什么不是纯 Command？** Command 需要用户主动输入 `/` 前缀。如果统一入口只做成 Command，就无法被 "hi archon" 这样的自然语言唤醒。

Always-applied rule 虽然注入每次对话，但只有十余行——仅做模式匹配和指引。真正的路由逻辑在 command 层，按需加载。
