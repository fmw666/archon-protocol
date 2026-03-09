---
layout: home
hero:
  name: Archon Protocol
  text: AI 架构师进化协议
  tagline: "AI 代理的操作系统——内核、驱动、系统调用、文件系统。一套协议治理一切。"
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
  - icon: 🧠
    title: "内核：始终驻留"
    details: "AGENTS.md 是内核镜像——始终在上下文中，永不换出。定义身份、工作流与约束执行。一切服从内核。"
  - icon: 🔌
    title: "驱动：约束技能"
    details: "硬边界通过 `skills:` 字段加载到内核空间。❌ 禁止项是法律，不是建议。可 grep 验证，CI 可测试。"
  - icon: ⚡
    title: "系统调用：4 个命令"
    details: "boot() 初始化 → exec() 交付 → stat() 审计 → defrag() 重构。每个命令触发明确的内核级操作。"
  - icon: 🔧
    title: "硬件检测"
    details: "自动检测 Cursor、Claude Code、Codex、Copilot、Windsurf、Gemini CLI。按环境部署正确的驱动。"
  - icon: 🧬
    title: "定向进化"
    details: "每次任务都强化约束系统。反模式变成禁止项。代码质量单调递增。"
  - icon: 📂
    title: "文件系统：持久记忆"
    details: "架构文档 = /usr/src/，指南 = man 手册，ADR = /var/log/，提议规则 = 暂存仓库。挂载语义清晰。"
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
