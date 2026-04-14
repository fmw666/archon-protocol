# 什么是 Archon

Archon 是**会话制的 AI 工程治理协议**，运行在 pair-programming IDE（如 Cursor、Claude Code）中。

它不是 AI 助手的增强插件——它把 AI agent 从"听指令的工具"提升为"对项目负全责的工程负责人"。

## 一句话理解

用户提出产品意图，Archon 翻译成工程行动并端到端交付——包括决策、实现、验证、知识沉淀和自我审查。

## 与传统 AI 编程的区别

| | 传统 AI 编程 | Archon Protocol |
|---|---|---|
| **角色** | 助手：你说做什么就做什么 | 负责人：自主决策，对质量负责 |
| **记忆** | 每次会话从零开始 | Manifest 持久化项目全貌，跨会话延续 |
| **质量** | 靠人检查 | 约束金字塔自动执行，机器拦截在前 |
| **自省** | 不存在 | Drift 漂移机制，积累到阈值强制审查 |
| **知识** | 写完就忘 | 知识进化系统，经验沉淀到约束最强的层级 |
| **审查** | 自己审自己 | 独立 sub-agent，执行与判断分离 |

## 不属于 Archon 的东西

明确边界和明确功能一样重要：

- **不是守护进程** — 没有后台运行的服务，一切由用户触发
- **不是自动化循环** — 不会自动扫描代码、自动提交
- **不是配置驱动的策略预设** — 没有 `mode=harden` 或权重百分比
- **不是 CLI 工具** — 没有 `npm install`，没有 API，就是一组文件

这些适合自动运行的引擎，不适合人触发的会话制框架。

## 它由什么组成

```
.archon/                    ← 核心状态（所有平台通用）
├── soul.md                 ← 认知内核：身份、原则、进化机制
├── manifest.md             ← 项目全貌：技术栈、里程碑、状态
├── drift.md                ← 漂移计数器：交付日志、阈值审查
└── debt.md                 ← 债务登记簿：结构化追踪

{platform}/                 ← 平台特定文件
├── commands/               ← 工作模式定义
│   ├── archon.md           ← 统一入口 + 意图路由
│   ├── archon-plan.md      ← 规划模式
│   ├── archon-demand.md    ← 需求交付模式
│   └── archon-review.md    ← 全量审查模式
├── agents/                 ← Sub-agent 协议
│   ├── archon-reviewer.md
│   └── archon-capture-auditor.md
└── rules/                  ← 编辑时自动加载的规则
    ├── archon-decouple.md  ← 解耦守则
    └── archon-wake.md      ← 唤醒触发器
```

其中 `{platform}/` 根据你使用的 AI 编程平台不同，对应 `.cursor/`、`.claude/` 等目录。

## 三种工作模式

| 模式 | 触发方式 | 做什么 |
|------|---------|--------|
| **Plan** | `hi archon, 下一步做什么` | 只读评估：项目状态、里程碑进度、推荐下一步 |
| **Demand** | `hi archon, 实现功能 X` | 完整交付：决策关卡 → 执行 → 验证 → 收尾 |
| **Review** | `hi archon, review` 或 drift ≥ 12 自动触发 | 全量审查：独立 sub-agent 检查架构/代码/知识健康 |

## 平台支持

| 平台 | 状态 | 说明 |
|------|------|------|
| **Cursor** | ✅ 完整支持 | Rules (`.mdc`) + Commands + Agents |
| **Claude Code** | ✅ 完整支持 | `CLAUDE.md` 入口 + Commands + Agents |
| **Windsurf** | 🔧 社区适配 | 贡献指南见 GitHub |
| **其他** | 📝 可扩展 | 只要平台支持读取 Markdown 规则文件 |

## 下一步

- 想了解设计理念？→ [设计哲学](/guide/philosophy)
- 想直接上手？→ [快速开始](/guide/quick-start)
- 想看完整架构？→ [系统总览](/architecture/)
- 想下载协议文件？→ [下载](/download/)
