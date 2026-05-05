---
title: 测试记录模板
outline: deep
---

# 测试记录模板

> **面向框架维护者。** [`/zh/testing/sandbox/scenarios/`](./test-matrix)
> 下的每一个 sandbox scenario 页面都遵循下面这套统一结构。
> 复制粘贴下方代码块，并填写大括号包裹的占位符。
> **不要**发布任何仍然残留 `{TODO}` 占位符的 scenario 页面。

模板正文，复制到新 scenario 文件中即可：

````md
---
title: {Scenario short title}
test_id: {e.g. install-cursor-node}
fixture: {fixtures/sandbox-node-ts | sandbox-python | sandbox-go | sandbox-rust}
ide: {Cursor | Claude Code | OpenAI Codex CLI | Aider}
language: {Node 20 + TS | Python 3.12 | Go 1.22 | Rust 1.78}
stage: {install | boot | update | sync | uninstall}
status: {pending | passing | failing}
---

# {Scenario short title}

## 此 scenario 验证什么

{一段话：正在测试 Archon 的哪一条声明，以及这套
fixture / IDE / 语言组合为何具有意义。}

## 测试环境

| | |
|---|---|
| Fixture | [`fixtures/{dir}`](https://github.com/fmw666/archon-protocol/tree/main/fixtures/) |
| IDE | {Cursor latest / Claude Code latest / Codex CLI latest} |
| 操作系统 | {macOS 14 / Ubuntu 22.04 / Windows 11 + WSL2} |
| Archon 来源 | `https://aaep.site/manifest.json`（或锁定 `?version=v0.1.x`） |
| 受测 manifest 版本 | {v0.1.x} |
| 语言工具链 | {Node 20.11 / Python 3.12 / Go 1.22 / Rust 1.78} |

## 前置条件

1. fixture 已复制到一个全新的临时目录（`/tmp/archon-test-{id}`）。
2. `git init && git add . && git commit -m "init"` —— 干净的 v0.0.0。
3. IDE 已在该全新临时目录中打开。
4. （对于 update / sync / uninstall scenario）前置 scenario
   `{id}` 已先行成功执行。

## Steps

```text
1. {操作 —— 通常是 agent prompt 或 CLI 命令}
2. {操作}
3. {验证步骤}
```

## 预期结果

| Check | 预期值 |
|-------|--------|
| 退出码（CLI）/ agent 自报告 | {0 / "install complete"} |
| `.archon/VERSION` | 与受测的 `manifest.version` 一致 |
| `.archon/drift.md` 行数 | {全新安装为 0，……} |
| `{BINDING_ROOT}/commands/archon.md` 存在 | yes |
| `scripts/archon-check.py --root .` 退出码 | 0 |
| `{validation command}` 退出码 | 0 |

## 演示录制

::: tip 录制说明 —— 见 [docs/public/videos/README.md](/zh/videos/README)
- `videos/{test-id}.mp4` —— 完整 IDE 聊天面板演示。
- `asciinema/{test-id}.cast` —— 纯终端验证。
:::

<VideoPlaceholder test-id="{test-id}" />

<AsciinemaPlaceholder test-id="{test-id}" />

## 运行记录

> 最新记录置顶。每次在某个 tagged manifest 版本上运行此 scenario
> 时，追加一行。

| 日期 | Manifest 版本 | Runner | 结果 | 备注 / 链接 |
|------|---------------|--------|------|-------------|
| YYYY-MM-DD | v0.1.x | {human or CI} | ✅ pass / ❌ fail / ⏳ pending | {commit sha · CI 链接 · 或 "manual"} |

## 已知限制

{测试 **不** 覆盖的内容。例如："不断言 IDE 规则重新加载行为，
因为那是平台特定的 UI 状态。"}

## 交叉引用

- 协议页面：[`/zh/setup/{install or update or sync or uninstall}`](/zh/setup/)
- Agent 文件：[`https://aaep.site/{install or update or sync or uninstall}.md`](https://aaep.site/)
- Fixture：[`fixtures/{dir}`](https://github.com/fmw666/archon-protocol/tree/main/fixtures/)
- 同级 scenarios：{列出共享同一 stage / IDE 的同级 test-id}
````

## 状态约定

| Status | 含义 |
|--------|------|
| `pending` | 测试已 **规划并完成文档化**，但尚未存在任何运行记录。视频 / asciinema 槽位为空。新 scenario 起始状态。 |
| `passing` | 最近一次在最新 tagged manifest 版本上的运行返回了预期结果，并且至少上传了一份录制。 |
| `failing` | 最近一次运行未匹配预期结果。运行记录表顶部一行为失败行，并在 demand pool / drift 日志中存在跟进备注。在该状态恢复为 `passing` 之前，框架版本 **不会** 发布。 |

## 为什么此模板是强制的

如果没有统一的形态，矩阵就会退化成一堆杂乱的 README 风格笔记，
没人会再读第二遍。模板强制保证三项契约，使 sandbox 作为整体可测：

1. **每个 scenario 拥有相同的元数据** —— 未来可由 front-matter 自动生成
   矩阵页面。
2. **相同的预期结果表** —— 运行记录可在不同 manifest 版本之间进行 diff。
3. **相同的录制槽位** —— 后续添加视频纯粹是上传操作，而不是文档重构。

## 填充占位符

每个大括号包裹的标记在发布前都必须被替换：

| 占位符 | 出现位置 | 示例值 |
|--------|----------|--------|
| `{Scenario short title}` | front-matter `title` + `# H1` | `01 · install-cursor-node` |
| `{test_id}` | front-matter | `install-cursor-node` |
| `{fixture}` | front-matter | `fixtures/sandbox-node-ts` |
| `{ide}` / `{language}` / `{stage}` / `{status}` | front-matter | `Cursor` / `Node 20 + TypeScript` / `install` / `pending` |
| `{BINDING_ROOT}` | 预期结果表 | `.cursor` / `.claude` / `.codex` / `.aider`（取决于 IDE） |
| `{test-id}`（在 `<VideoPlaceholder test-id="…">` 中为小写） | 演示录制章节 | 与 front-matter 中的 `test_id` 相同 |

任何在已发布正文中仍残留字面 `{...}` 占位符的 scenario，在矩阵评审中
都会被视为契约违规，必须先修复，才能从
[测试矩阵](./test-matrix) 链接到该页面。
