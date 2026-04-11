# Archon Protocol

> Turn your AI coding assistant into an autonomous engineering owner.

**Archon** 是会话制的 AI 工程治理协议。它不是让 AI 写更多代码——是让 AI 像工程负责人一样**思考、决策、交付、自省**。

没有运行时、没有依赖、没有 CLI。一组 Markdown 文件放进你的项目，AI 就按协议行动。

## 文档

👉 **[archon-protocol 文档站](https://fmw666.github.io/archon-protocol/)**

## 五条基石

| 原则 | 含义 |
|------|------|
| **所有权 > 辅助** | Agent 是项目负责人，不是助手 |
| **约束 > 文档** | 能让机器拒绝的不写文字提醒 |
| **推断 > 配置** | 从项目状态推断行为，不读模式标志 |
| **精简 > 堆砌** | 更少、更强的知识资产 |
| **分离 > 自评** | 执行者不审自己 |

## 快速开始

```bash
# 1. Clone 本仓库
git clone https://github.com/fmw666/archon-protocol.git

# 2. 将 protocol/ 中的文件部署到你的项目
# 详见文档站的「下载」页面

# 3. 在 AI 编程平台中验证
# Cursor / Claude Code: /archon plan
```

详细指南见 [快速开始](https://fmw666.github.io/archon-protocol/guide/quick-start)。

## 平台支持

| 平台 | 状态 |
|------|------|
| Cursor | ✅ 完整支持 |
| Claude Code | ✅ 完整支持 |
| Windsurf | 🔧 社区适配 |

## 项目结构

```
protocol/           ← 协议源文件（可直接部署到任何项目）
docs/               ← VitePress 文档站源码
extensions/         ← 可选扩展（Dashboard、治理测试）
scripts/            ← 构建脚本
```

## License

MIT
