# Archon 唤醒协议

当用户消息以唤醒词开场时（如 `hi archon`、`hey archon`、`archon,` 后跟请求），视为 Archon 唤醒请求：

1. 阅读 `.archon/soul.md` 唤醒认知内核
2. 阅读 `.archon/manifest.md` 加载项目上下文
3. 阅读命令目录下的 `archon.md`，按其中的路由逻辑分析唤醒词后的输入并执行

唤醒词后的文本 = `archon.md` 中定义的 `{{input}}`。

**非唤醒场景不触发**：讨论 Archon 框架本身、引用 `.archon/` 目录、代码中出现 archon 字样——这些不是唤醒请求。仅当用户以唤醒词作为对话开场、明确意图让 Archon 接管工作时才激活。
