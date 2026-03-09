# 架构总览

> Archon Protocol 的纯 Skill 架构：单一格式、零冲突、27+ 工具兼容。

---

## 分层模型

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│   skills/init/SKILL.md                                         │
│   ────────────────────                                         │
│   引导层。定义整个生态：有哪些 skill、何时激活、如何关联。           │
│   用户执行 /init 后，生态即就绪。无 AGENTS.md，无 rules/，无 agents/。 │
│   特点：自举式，零侵入，不覆盖项目既有配置。                        │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│   Constraint Skills（约束技能）                                  │
│   skills/code-quality/  skills/test-sync/                       │
│   skills/async-loading/  skills/error-handling/                  │
│   ─────────────────────────────────────────                     │
│   每次代码变更时检查的硬边界。                                     │
│   文件大小、类型安全、测试同步、异步加载、错误处理规范。               │
│   特点：按需加载，每个 <5000 token，27+ 工具统一发现。               │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│   Command Skills（命令技能）                                     │
│   skills/demand/  skills/audit/  skills/refactor/               │
│   ─────────────────────────────────────────                     │
│   用户显式调用的工作流。                                          │
│   /demand 一句话需求 → 完整交付；/audit 全面审计；/refactor 渐进重构。  │
│   特点：按需激活，惰性加载。                                       │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│   Internal Skills（内部技能）                                    │
│   skills/self-auditor/  skills/test-runner/  skills/verifier/   │
│   ─────────────────────────────────────────                     │
│   由命令技能调用的子流程。                                         │
│   demand 的 Stage 3 调用 self-auditor；Stage 3.4 调用 test-runner。  │
│   特点：不直接面向用户，由命令编排。                                 │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

## 为什么要分层

一个核心约束：**上下文窗口是有限资源。**

如果把所有规则、流程、文档全部塞进 AI 的上下文窗口，会发生：
1. **token 浪费**——简单问题也要加载全部规则
2. **注意力稀释**——太多信息导致 AI 忽略关键约束
3. **工具锁定**——专用格式在其它工具中无法工作

纯 Skill 分层解决了这三个问题：

| 层 | 何时加载 | token 成本 | 作用 |
|---|---|---|---|
| init | 用户执行 /init 时 | 一次性 | 定义生态，生成配置，健康检查 |
| Constraint Skills | 每次代码变更时 | <5K/个 | 硬边界，禁止项，可验证 |
| Command Skills | 用户调用命令时 | <5K/个 | 复杂流程，按需激活 |
| Internal Skills | 命令内部调用时 | <5K/个 | 子流程，认知隔离 |

## 信息流

```
人类需求
  │
  ▼
┌─────────────────────────────────────────────────────────────────┐
│   AI Agent                                                       │
│                                                                  │
│   首次使用？ ──► 执行 /init（引导 skill）                           │
│                     │                                            │
│                     ├─► 扫描项目、生成 archon.config.yaml          │
│                     ├─► 定义 Constraint / Command / Internal 技能  │
│                     └─► 生态就绪 ✅                                 │
│                                                                  │
│   需要完整交付？ ──► 调用 /demand <需求>（命令 skill）               │
│                     │                                            │
│                     ├─► Stage 1: 实现（遵守 Constraint Skills）    │
│                     ├─► Stage 2: 性能审计                          │
│                     ├─► Stage 3: 自审（调用 self-auditor）          │
│                     │         └─► 3.4 测试同步（调用 test-runner）   │
│                     ├─► Stage 4: 修复                              │
│                     ├─► Stage 5: 重构进度                          │
│                     └─► Stage 6: 提交                             │
│                                                                  │
│   简单修改？ ──► 直接执行（遵守 Constraint Skills 中的禁止项）        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 各组件对照

所有工作流统一为 SKILL.md 格式，适配 27+ 工具：

| 类别 | Skill | 触发方式 | 作用 |
|------|-------|----------|------|
| **Constraint** | `code-quality` | 每次代码变更 | 文件大小、类型安全、禁止项 |
| | `test-sync` | 每次代码变更 | 代码变更 → 测试必须同步 |
| | `async-loading` | 编辑 UI 组件时 | 骨架屏、错误重试、视口懒加载 |
| | `error-handling` | 编辑 API/组件时 | 结构化错误、无堆栈泄露、i18n 消息 |
| **Command** | `demand` | `/demand <需求>` | 一句话需求 → 完整交付管道 |
| | `audit` | `/audit` | 全项目健康检查与评分报告 |
| | `refactor` | `/refactor` | 渐进式重构计划与里程碑 |
| **Internal** | `self-auditor` | demand Stage 3 | 六维代码审计 |
| | `test-runner` | demand Stage 3.4 | 测试发现、更新、执行 |
| | `verifier` | 按需 | 独立验证声称完成的工作 |

**单一格式**：所有 skill 均为 SKILL.md，任何支持 Anthropic 开放标准的工具（27+）都能自动发现和加载。
**零冲突**：无 AGENTS.md，不覆盖项目既有配置；无 `.cursor/rules/`、`.cursor/agents/`，不侵入工具目录。

## 跨工具兼容矩阵

| 工具 | Skills (SKILL.md) | /init 引导 | 说明 |
|------|-------------------|------------|------|
| Cursor | ✅ | ✅ | 完整支持 |
| Claude Code | ✅ | ✅ | 完整支持 |
| Codex | ✅ | ✅ | 完整支持 |
| Copilot | ✅ | ✅ | 完整支持 |
| VS Code | ✅ | ✅ | 完整支持 |
| Gemini CLI | ✅ | ✅ | 完整支持 |
| Windsurf | ✅ | ✅ | 完整支持 |
| 其他 20+ 工具 | ✅ | ✅ | 遵循 SKILL.md 标准即可 |

**纯 Skill 优势**：一种格式，处处可用。无需 AGENTS.md（避免与现有项目冲突），无需工具专属目录（`.cursor/`、`.claude/` 等），`/init` 自举一切，最大可移植性。

## 纯 Skill 架构的核心优势

| 旧架构 | 问题 |
|--------|------|
| AGENTS.md | 与项目既有 AGENTS.md 冲突 |
| .cursor/rules/*.mdc | 仅 Cursor，不可移植 |
| .cursor/agents/*.md | 仅 Cursor/Claude |
| 多种格式并存 | 4 种格式需学习维护 |

| 纯 Skill | 优势 |
|----------|------|
| 单一格式 (SKILL.md) | 学一次，处处用 |
| 27+ 工具 | Cursor、Claude Code、Codex、Copilot、VS Code、Gemini CLI… |
| 零冲突 | 无 AGENTS.md，无 .cursor/ 修改 |
| 自包含 | `/init` 引导整个生态 |
