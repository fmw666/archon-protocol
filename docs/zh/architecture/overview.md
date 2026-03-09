# 架构总览

Archon Protocol 是一个 **AI 代理的操作系统**，采用双层架构：**Agent 为主**（隔离上下文），**Skill 为辅**（27+ 工具兼容）。每个文件都精确映射到一个 OS 概念——详见 [操作系统模型](./os-model.md)。

## 双层模型

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  Agents（主力）                                            │
│  ──────────────                                            │
│  .cursor/agents/ + .claude/agents/                         │
│  仅 Cursor 和 Claude Code 支持。                            │
│                                                            │
│  ✅ 隔离上下文窗口（不污染主对话）                            │
│  ✅ 通过 `skills` 字段预加载约束技能                          │
│  ✅ 支持只读模式、模型选择                                    │
│  ✅ 通过 /archon-demand、/archon-audit 等调用                │
│                                                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Skills（回退）                                             │
│  ────────────────                                          │
│  .cursor/skills/ + .claude/skills/ + .codex/skills/        │
│  27+ 工具支持（Codex、Copilot、VS Code、Gemini CLI 等）      │
│                                                            │
│  ✅ 与 Agent 版本内容相同                                    │
│  ✅ 可移植的 SKILL.md 格式（开放标准）                        │
│  ✅ 兼容工具自动发现                                         │
│                                                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  约束技能（Constraint Skills）                               │
│  ────────────────────────────                               │
│  archon-code-quality、archon-test-sync、                    │
│  archon-async-loading、archon-error-handling                │
│                                                            │
│  ✅ 定义硬边界（❌ 禁止项）                                   │
│  ✅ Agent 启动时自动注入上下文                                │
│  ✅ Skill-only 工具也能自动发现                               │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## 为什么要分层

核心约束：**上下文窗口是有限资源。**

| 层 | 何时加载 | token 成本 | 作用 |
|----|----------|-----------|------|
| 约束技能 | Agent 启动时预加载 | ~126 行（4 个约束） | 硬边界，禁止项 |
| 命令 Agent/Skill | 用户调用时 | 按需 | 复杂工作流 |
| 内部 Agent/Skill | 命令内部调用时 | 隔离上下文 | 认知聚焦 |

约束技能极轻量（4 个合计 ~126 行），在 128K+ 上下文窗口中占比 0.1%。工作流 Agent 按需调用，使用隔离上下文——这本身就是 JIT（即时加载）。

## 命名空间：`archon-` 前缀

所有 Agent 和 Skill 以 `archon-` 为前缀，避免与项目已有文件冲突：

- `archon-demand` 不会与项目的 `demand` agent 冲突
- `archon-code-quality` 不会与项目的 `code-quality` skill 冲突

## 各组件对照

### 命令 Agent/Skill（用户调用）

| 名称 | 作用 |
|------|------|
| `archon-init` | 初始化生态、环境检测、健康检查 |
| `archon-demand` | 完整交付流水线 |
| `archon-audit` | 全项目健康审计（只读） |
| `archon-refactor` | 渐进式重构计划 |
| `archon-verifier` | 独立验证 |

### 内部 Agent/Skill（命令调用）

| 名称 | 调用者 | 作用 |
|------|--------|------|
| `archon-self-auditor` | demand Stage 3 | 六维代码审计 |
| `archon-test-runner` | demand Stage 3.4 | 测试同步与执行 |

### 约束技能（无 Agent 对应版本）

| 名称 | 激活时机 |
|------|----------|
| `archon-code-quality` | 每次代码变更 |
| `archon-test-sync` | 每次代码变更 |
| `archon-async-loading` | 编辑 UI 组件时 |
| `archon-error-handling` | 编辑 API 路由或组件时 |

## 环境感知部署

`/archon-init` 检测执行环境并部署文件到正确路径。如果检测不确定，会要求用户确认。

### 环境能力矩阵

| 能力 | Cursor | Claude Code | Codex | Copilot | Windsurf | Gemini CLI |
|------|--------|-------------|-------|---------|----------|------------|
| Agent | `.cursor/agents` | `.claude/agents` | — | — | — | — |
| Skill | `.cursor/skills` | `.claude/skills` | `.codex/skills` | `.cursor/skills` | `.cursor/skills` | `.claude/skills` |
| Rules 文件 | `.cursor/rules/` | `CLAUDE.md` | — | — | `.windsurfrules` | — |
| 子 Agent | ✅ | ✅ | — | — | — | — |
| 约束预加载 | ✅ | ✅ | — | — | — | — |

### 环境差异的影响

- **支持 Agent**（Cursor、Claude Code）：完整双层架构。Agent 通过子 Agent 执行隔离审计阶段。约束通过 `skills:` 前置字段预加载。
- **仅支持 Skill**（Codex、Copilot、Windsurf、Gemini CLI）：Skill-only 模式。工作流通过 SKILL.md 发现机制加载。约束需在任务开始时显式读取。所有阶段内联执行。

环境配置存储在 `archon.config.yaml` 的 `environment:` 段中。

## 跨工具兼容矩阵

| 工具 | Agent 支持 | Skill 支持 | 约束预加载 |
|------|-----------|-----------|-----------|
| Cursor | ✅（主力） | ✅ | ✅ |
| Claude Code | ✅（主力） | ✅ | ✅ |
| Codex | — | ✅ | ✅ |
| Copilot | — | ✅ | ✅ |
| Windsurf | — | ✅ | ✅ |
| Gemini CLI | — | ✅ | ✅ |
| 其他 20+ 工具 | — | ✅ | ✅ |

一套协议，所有工具通用。支持 Agent 的工具优先用 Agent，其余全部走 Skill 回退。
