---
layout: home
title: Archon
hero:
  name: Archon
  text: AI 工程治理框架
  tagline: 一个基于会话的框架，把 AI 代理从「按指令办事的工具」抬升为「对项目负完整工程责任的所有者」。
  image:
    src: /logo.svg
    alt: Archon
  actions:
    - theme: brand
      text: 通过 Agent 安装
      link: /zh/setup/
    - theme: alt
      text: 10 分钟速览
      link: /zh/concepts/overview
    - theme: alt
      text: 5 分钟快速上手
      link: /zh/setup/quickstart
    - theme: alt
      text: 完整源码
      link: /source/
features:
  - icon: 🧭
    title: 所有权，而非辅助
    details: 代理是所有者，对端到端结果负责 —— 决策、实现、验证、知识沉淀、自我评审。用户表达产品意图；Archon 把它翻译成工程行动。
  - icon: 🔒
    title: 约束高于散文
    details: 五级金字塔（L0 运行时 → L5 习惯）把每条承重规则推到机器仍能强制执行的最低层。Linter 或测试能抓住的事，绝不写成治理散文。
  - icon: 🌀
    title: 定向演进
    details: 每次交付都喂养漂移计数器、债务登记簿与保留轴。被验证有效的机制会被提升；安静失血的散文则被锚点 + 体型测试 + 可移植契约钉死。
  - icon: 🧬
    title: 认知循环为核
    details: 六个阶段 —— Recognize → Model → Decide → Execute → Verify → Learn —— 一一映射到具体文件。每个阶段都有机器检查，循环不会沦为空喊口号。
  - icon: 🗂️
    title: 解耦、可移植
    details: .archon/ 与具体项目无关，适用于任意 AI 编码代理（Cursor / Claude Code / Codex / Continue / Aider / Windsurf）。平台特定的绑定目录通过 Universal Module Guard 接入；一份 manifest 就能为每个平台产出可即用的 kit。
  - icon: 🔍
    title: Claim Verifier
    details: ADR-27 抓「说的 vs 真的」漂移。当治理散文声称某种行为，一段可移植的校验脚本会遍历仓库去证明它 —— 否则该声明无法通过质量门。
---

<div style="max-width: 980px; margin: 3rem auto; padding: 0 2rem;">

## Archon 解决的是什么问题？

每一次新的 AI 编码会话都从零开始。代理忘记了你的产品词汇，重新发明你的架构，跳过你团队早就写好的测试，又一次把团队三周前已经否决的决策端上来。

行业的本能反应是去拿**更大的模型**或**更长的提示词**。Archon 的诊断不一样：代理需要的是**工程环境**，而不是更多的原始能力。具体来说它需要：

1. 一条**认知循环**，每次交付都必须走一遍，而不是自由聊天。
2. **会失败关闭的机械门** —— 测试、契约检查、lint 规则 —— 而不是它可以无视的可选散文。
3. **持久状态** —— manifest、漂移计数器、债务登记簿、ADR 日志 —— 跨会话、跨代理活下来。
4. 一条**保留轴**，拒绝让承重规则在好意的重构中悄悄消失。
5. 一份**所有权契约**，把代理当作负责的工程当事人，而不是需要用户盯着的建议生成器。

Archon 把这一切作为**一套统一词汇**交付 —— soul、manifest、drift、debt、memos、decisions、领域透镜（domain lenses）、signs、run-state —— 加上让所有这些机械可验证的可移植契约。

## 5 个入口

| 章节 | 你能找到什么 |
|---------|----------------|
| [**核心概念**](/zh/concepts/) | 「为什么」：身份公理 · 认知循环 · 用户旅程 · 架构参考 · 每一条 ADR · 漂移机制 |
| [**安装与启动**](/zh/setup/) | 「怎么做」：Agent 优先安装（`read aaep.site/skill.md and install archon`）· CLI · 完整生命周期（install · update · sync · uninstall）· 状态模板 |
| [**完整源码**](/source/) | 「是什么」：每一个发行的文件 —— soul · commands · agents · rules · skills · 领域透镜 · 契约 · 脚本 · CLI |
| [**测试**](/zh/testing/) | 「如何验证」：治理契约测试 · 可移植校验器 · 测试策略 · 在你自己的项目里跑那些质量门 |
| [**更新日志**](/zh/changelog/) | 「历史」：框架更新日志 · CLI 更新日志 · ADR 时间线 |

## 这是写给谁的？

- **AI 编码采用者**：你已经从「让代理加个文件」毕业了，需要一个能对结果负责的、长期的工程协作者。
- **框架构建者**：你想要一个具体的、基于会话的治理系统范例，再去发明你自己的。
- **工程负责人**：在让自主代理上代码之前，评估需要什么样的护栏。

## 从这里开始

- **第一次？给你的代理装上 Archon**：打开你的 AI 编码会话（Cursor / Claude Code / Codex / Continue / Aider / Windsurf —— 任何具备 web-fetch + write 工具的平台），说：
  **"read aaep.site/skill.md and install archon"**。代理会拉取协议、问 3-4 个问题、对每个文件做 sha256 校验、然后写入框架。各平台分步指南：
  [5 分钟快速上手](/zh/setup/quickstart#step-1-install)。
- **安装之后**，唤醒规则会在每次会话自动加载 —— 不再需要 URL。直接说 *"hi archon, update yourself"* / *"is archon healthy?"* / *"uninstall archon"*。详情：[安装与启动](/zh/setup/)。
- 想**理解设计** → [10 分钟速览](/zh/concepts/overview)。
- 想**跑 CLI**（可选，需要 Node ≥ 18）→
  [5 分钟快速上手 · 路径 B](/zh/setup/quickstart#path-b-cli-scripted-no-conversation)。
- 想**看每一个文件** → [完整源码](/source/)。

> **框架本身不依赖 Node。** Archon 的核心是纯 Markdown + 一个仅用标准库的 Python 契约校验器。Node ≥ 18 仅在可选的 `cli` 与 `dashboard` 模块时才需要。

</div>
