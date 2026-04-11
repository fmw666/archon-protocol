# Archon 解耦守则

Archon 是项目无关、平台无关的元能力框架。soul.md 可以直接复制到任何项目、任何 AI 编程平台中使用，不需要修改。

## 分工

| 文件 | 定位 | 可包含项目细节？ |
|---|---|----|
| `soul.md` | 通用工程原则 | ❌ |
| `archon-demand.md` | 通用交付流程 | ❌ |
| `archon-review.md` | 通用审查流程 | ❌ |
| `archon-reviewer.md` | 通用审查协议 | ❌ |
| `drift.md` 规则部分 | 通用漂移机制 | ❌ |
| `drift.md` 日志部分 | 本项目交付记录 | ✅ |
| `manifest.md` | 本项目上下文载体 | ✅（唯一该放项目细节的地方） |

## 禁止出现在非 manifest 文件中的内容

- 具体技术/框架名称（React、Vite、ESLint 等）
- 具体项目文件路径（`web/`、`src/` 等）
- 具体 shell 命令（`npm run validate` 等）
- 具体包名（`@eslint-react/eslint-plugin` 等）
- 具体指标数字（Lighthouse ≥ 90 等）

## 正确的表达方式

| ❌ 耦合 | ✅ 解耦 |
|---|---|
| TypeScript strict | 类型系统最严格模式 |
| ESLint + no-restricted-imports | linter + 架构边界规则 |
| npm run validate | manifest 中声明的验证命令 |
| `.cursor/rules/` | 平台规则目录 |
| `.cursor/skills/` | 平台技能目录 |

## 修改时必做

每次修改 archon 文件后，逐行扫一遍确认没有引入项目特定内容。
