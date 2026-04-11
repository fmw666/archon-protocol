---
layout: home

hero:
  name: "Archon Protocol"
  text: "AI 工程治理协议"
  tagline: 不是让 AI 写更多代码，是让 AI 像工程负责人一样思考、决策、交付、自省。
  image:
    src: /logo.svg
    alt: Archon Protocol
  actions:
    - theme: brand
      text: 开始了解
      link: /guide/
    - theme: alt
      text: 下载协议
      link: /download/
    - theme: alt
      text: GitHub
      link: https://github.com/fmw666/archon-protocol

features:
  - icon: "👑"
    title: 所有权 > 辅助
    details: Agent 是项目负责人，不是助手。决策、质量、后果归自己。用户提出产品意图，Agent 翻译成工程行动并端到端交付。
  - icon: "🔒"
    title: 约束 > 文档
    details: 能让机器拒绝的不写文字提醒。类型系统 > Linter > 编辑器规则 > 文档。文档只承载"为什么"和机器无法表达的设计意图。
  - icon: "🎯"
    title: 推断 > 配置
    details: 从项目状态推断行为，不读模式标志。里程碑未完成就交付功能、质量门没过就加固、债务临期就修复——信号已在文件中，不需要额外配置。
  - icon: "✂️"
    title: 精简 > 堆砌
    details: 更少、更强的知识资产。新建文件前先答辩"现有文件能否承载"。治理文件膨胀不只是组织问题，是 AI 上下文窗口的性能问题。
  - icon: "🔀"
    title: 分离 > 自评
    details: 执行者不审自己——沉没成本偏差让自审失效。知识捕获和全量审查委托给独立 sub-agent，结构化输出可被审计。
  - icon: "⚡"
    title: 文件即协议
    details: 没有运行时、没有依赖、没有 CLI。一组 Markdown 文件放进你的项目，AI 就按协议行动。支持 Cursor、Claude Code 等主流 AI 编程平台。
---

<style>
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: linear-gradient(135deg, #6d28d9 0%, #a78bfa 100%);
  --vp-home-hero-image-background-image: linear-gradient(135deg, #c4b5fd 30%, #fbcfe8 70%);
  --vp-home-hero-image-filter: blur(56px);
}
</style>

## 核心问题

> 你和 AI 结对编程了一下午，关掉编辑器去吃饭。第二天回来，AI 在新代码里用了昨天重构前的旧模式——因为**每个 session 都是一张白纸**。

AI 编程的根本矛盾不是"写代码的能力"——大模型已经很强了。矛盾是：

- **无状态**：每次启动都丢失上下文，不知道昨天发生了什么
- **无所有权**：AI 只执行指令，不对质量和架构负责
- **无自省**：连续交付不复盘，认知与项目实况脱节

Archon Protocol 解决这三个问题。它不是一个工具或插件——它是一套**文件协议**，通过结构化的 Markdown 文件赋予 AI agent 记忆、决策能力和自省机制。

## 它是怎么工作的

```
 "hi archon, 实现功能 X"
        │
        ▼
   唤醒层 ──→ 加载 Soul（工程原则）+ Manifest（项目全貌）
        │
        ▼
   决策关卡 ──→ 该不该做？做多大？有无不改代码的解法？
        │
        ▼
   执行 ──→ 写代码（遇 bug → 系统化调试；偷懒念头 → Red Flags 纠偏）
        │
        ▼
   验证门 ──→ lint + typecheck + test 全绿才通过
        │
        ▼
   收尾 ──→ 更新项目状态 → 独立 agent 评估知识捕获 → 记录漂移分
        │
   drift ≥ 12? ──→ 触发全量审查 → 重置
```

## 在你的项目中使用

三步完成接入：

```bash
# 1. 下载协议文件
curl -fsSL https://github.com/fmw666/archon-protocol/releases/latest/download/archon-core.zip -o archon-core.zip

# 2. 解压到项目根目录
unzip archon-core.zip -d .

# 3. 在 AI 编程平台中运行
# Cursor: /archon plan
# Claude Code: /archon plan
```

或 [手动下载](/download/) 并按 [快速开始](/guide/quick-start) 配置。
