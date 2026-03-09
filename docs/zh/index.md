---
layout: home
hero:
  name: Archon Protocol
  text: AI 架构师进化协议
  tagline: "将 AI 代理转变为可靠架构师的治理体系——通过约束、自审计与定向进化。"
  actions:
    - theme: brand
      text: 快速上手
      link: /zh/guide/getting-started
    - theme: alt
      text: 设计哲学
      link: /zh/guide/design-philosophy
    - theme: alt
      text: 架构总览
      link: /zh/architecture/overview
features:
  - icon: 🧬
    title: "AAEP：定向进化"
    details: "每次任务都强化约束系统。反模式变成禁止项，最佳实践变成默认行为。代码质量单调递增。"
  - icon: 🏛️
    title: "单代理治理"
    details: "一个代理，完整权限，完全负责。无多代理协调开销。约束技能替代监督者。"
  - icon: 🚫
    title: "可验证的禁止项"
    details: "每条规则使用 ❌ 标记 + 可 grep 的代码模式 + 正向替代方案。由 CI 测试强制执行，不是模糊的最佳实践。"
  - icon: 🔧
    title: "环境感知"
    details: "自动检测 Cursor、Claude Code、Codex、Copilot、Windsurf、Gemini CLI。按环境部署正确的文件到正确的路径。"
  - icon: 🛡️
    title: "协议 + 工具双层防线"
    details: "约束层拦截架构问题，Linter 拦截语法问题。Stage 1.5 自动运行项目 Linter。两层缺一不可。"
  - icon: 🔄
    title: "4 个命令，覆盖全生命周期"
    details: "/archon-init → /archon-demand → /archon-audit → /archon-refactor。一句话需求，完整交付 + 六维审计。"
---

<div class="vp-doc" style="max-width: 800px; margin: 0 auto; padding: 2rem;">

## 什么是 AAEP？

**AAEP**（AI Architect Evolution Protocol / AI 架构师进化协议）定义了 AI 代理如何通过持续的**约束 → 执行 → 进化**循环，进化为项目的架构师。

AI 编程工具提供的是**能力**——代码生成、文件操作、终端执行。它们不提供**方法论**——工作流治理、质量保障、经验积累。

AAEP 就是方法论层。

### 四层架构

| 层 | 是什么 | 怎么做 |
|----|--------|--------|
| **约束层** | 塑造代码生成的硬边界 | 约束技能中的 `❌` 禁止项，注入代理上下文窗口 |
| **工作流层** | 标准化的交付序列 | `/archon-demand` 7 阶段流水线，支持 opt-out |
| **进化层** | 每次任务都让系统更强 | Stage 3.6 发现模式 → 隔离区审查 → 批准 → 新约束 |
| **知识层** | 跨会话持久的项目记忆 | `archon.config.yaml`、约束技能、架构文档 |

### 正反馈闭环

```
任务 1 → 代理在约束下写代码
       → 六维自审计发现问题 X
       → 提议：❌ 禁止 X
       → 用户批准 → 约束入库

任务 2 → 代理无法犯错误 X（已在约束集中）
       → 审计发现问题 Y → 同样的循环

任务 N → 约束系统趋于完备
       → 代码质量单调递增
       → 修复变少 → 交付更快
```

**更多任务 → 更好的约束 → 更高的质量。** 这是定向进化——始终朝着更少的 bug、更好的性能、更一致的架构方向演进。

### 为什么不只用 ESLint？

| 维度 | ESLint | AAEP |
|------|--------|------|
| 禁止 `any` 类型 | ✅ | ✅ |
| 文件大小限制 | ⚠️ | ✅ |
| 异步：骨架屏 + 错误 + 重试 | ❌ | ✅ |
| 签名变更后测试同步 | ❌ | ✅ |
| 模块边界违规 | ❌ | ✅ |
| 视口外懒加载 | ❌ | ✅ |

ESLint 拦截语法，AAEP 拦截架构。**两层同时激活——Stage 1.5 自动运行你的 Linter。**

### 跨工具兼容

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

</div>
