# 协议源码

这里展示 Archon Protocol 的**完整源文件**——每个文件都是纯 Markdown，没有隐藏的魔法。

你可以在 [下载页面](/download/) 一键获取所有文件，也可以在 [GitHub](https://github.com/fmw666/archon-protocol/tree/main/protocol) 直接浏览。

## 文件总览

### 协议核心（项目无关，可直接复制）

| 文件 | 体积 | 职责 |
|------|------|------|
| [Soul 认知内核](/reference/soul) | ~290 行 | 身份基石、认知循环、自治原则、品质洁癖、进化机制 |
| [archon.md](/reference/commands) | ~46 行 | 统一入口 + 意图路由 |
| [archon-plan.md](/reference/commands#plan-规划模式) | ~75 行 | 规划模式工作流 |
| [archon-demand.md](/reference/commands#demand-需求交付模式) | ~大 | 需求交付完整工作流（最复杂的命令） |
| [archon-review.md](/reference/commands#review-全量审查模式) | ~中 | 全量审查工作流 |
| [archon-reviewer.md](/reference/agents#reviewer) | ~中 | 独立审查 sub-agent 协议 |
| [archon-capture-auditor.md](/reference/agents#capture-auditor) | ~中 | 知识捕获 sub-agent 协议 |
| [archon-decouple](/reference/rules#解耦守则) | ~小 | 解耦守则：禁止项目细节泄入通用文件 |
| [archon-wake](/reference/rules#唤醒触发器) | ~小 | 唤醒词检测 + 路由指引 |

### 项目模板（初始化后按项目实况填写）

| 文件 | 职责 |
|------|------|
| [manifest.md](/reference/templates#manifest) | 项目全貌模板 |
| [drift.md](/reference/templates#drift) | 漂移计数器模板 |
| [debt.md](/reference/templates#debt) | 债务登记簿模板 |

## 设计原则

这些文件的设计遵循几条硬性约束：

1. **Soul 是纯哲学** — 不包含任何平台路径（`.cursor/`、`.claude/`）或项目细节
2. **Commands 用桥接行** — 首行声明路径（平台适配时改一行），正文用短名称
3. **Agents 用相对描述** — "in the archon directory" 而非硬编码路径
4. **唯一放项目细节的是 Manifest** — 所有其他文件必须是项目无关的
