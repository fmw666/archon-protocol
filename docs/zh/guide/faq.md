# 常见问题

---

### Q：Archon Protocol 和 ESLint / Prettier 有什么区别？

ESLint 检查语法和格式，Archon Protocol 约束**架构和行为**。

ESLint 能告诉你"这里有个未使用的变量"，但不能告诉你"这个页面应该用骨架屏而不是显示 0"。Archon Protocol 的禁止项覆盖架构级别的反模式——从 API 错误处理到组件拆分到测试同步。

两者互补，不互斥。

### Q：它会消耗多少 token？

| 组件 | 大小 | 何时加载 |
|------|------|---------|
| 约束 Skill（单个） | <5KB | 每次代码变更时 |
| 命令 Skill（单个） | <5KB | 用户调用时 |
| 内部 Skill（单个） | <5KB | 命令 Skill 内部调用 |

日常编码中，AI 只需加载 4 个约束 Skill（约 12KB）。触发 `/demand` 时会额外加载命令和内部 Skill，但总量仍然可控。

### Q：我需要懂编程才能维护 Archon Protocol 吗？

写约束 Skill 不需要编程——它们本质是 Markdown 文档。你只需要知道什么是好实践、什么是坏实践，用 `❌` 标记禁止项即可。

但测试是 JavaScript（Vitest），维护测试需要基本的 JS 知识。

### Q：如果我用的 AI 工具不支持 SKILL.md 怎么办？

SKILL.md 已被 27+ 工具支持（Cursor、Claude Code、Codex、Copilot、VS Code、Gemini CLI 等）。如果你的工具确实不支持，可以在对话中手动指引 AI：

> "请阅读 archon-protocol/skills/demand/SKILL.md 并按照其中的流程执行。"

因为 SKILL.md 本质是 Markdown，任何 AI 工具都能读取和理解。

### Q：为什么不用 AGENTS.md 做核心约束？

AGENTS.md 虽然有"被动注入"优势（每轮自动加载），但存在一个致命问题：**冲突**。

如果目标项目已经有自己的 AGENTS.md（定义团队的其他规则），Archon Protocol 的 AGENTS.md 会直接覆盖或冲突。

纯 Skill 架构解决了这个问题——所有内容都在 `skills/` 目录中，不触碰项目的任何现有文件。

### Q：自进化会不会导致约束膨胀？

可能会。这就是为什么有这些约束：

1. **每个 Skill <5KB**——SKILL.md 标准强制了体积限制
2. **禁止项质量测试**——每条 `❌` 必须足够具体，可用 grep 验证
3. **人类审查**——约束变更会出现在 git diff 中，人类可以在 review 时删减

建议每季度审查一次约束 Skill，合并重复项，删除不再适用的禁止项。

### Q：多人团队如何使用？

1. `archon-protocol/` 目录提交到 git 仓库
2. 运行 `install.sh` 将 Skill 部署到各工具目录
3. 每个团队成员的 AI 工具自动发现相同的约束
4. 有人发现新反模式 → 更新约束 Skill → push → 全队生效

Archon Protocol 本质上是团队的**编码标准和架构约束的自动化执行器**。以前写在 wiki 里没人看的规范，现在变成 AI 的运行时技能。

### Q：Archon Protocol 能用在非 JavaScript 项目上吗？

可以。所有 SKILL.md 都是纯 Markdown，不依赖任何语言。

你需要：
1. 修改约束 Skill 中的具体禁止项（例如把 JSX 相关的替换为你的语言/框架）
2. 修改 `archon.config.yaml` 中的 `stack` 和 `test_command`
3. 如果不需要 Vitest 测试，可以用你项目的测试框架

核心架构（纯 Skill、反馈循环、自进化）是语言无关的。
