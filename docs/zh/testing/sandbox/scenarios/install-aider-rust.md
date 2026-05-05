---
title: "04 · install-aider-rust"
test_id: install-aider-rust
fixture: fixtures/sandbox-rust
ide: Aider
language: Rust 1.78
stage: install
status: pending
---

# 04 · install-aider-rust

## 本场景验证什么

Archon 通过 **Aider**（一款仅在终端运行、没有 IDE 聊天面板的 AI 编码工具）安装到一个 **Rust** 项目。这是我们测试矩阵中最严苛的"无 Node、无 IDE"组合：

1. Aider 完全运行在终端中——没有编辑器面板可以呈现规则。
2. Rust 使用者通常既未安装 Node，也没有 Python 的 `pre-commit` 框架；agent 必须选择 **纯粹的 `.git/hooks/pre-commit`** 路径。
3. agent 必须接受 validate 命令是 `cargo test` 加 `cargo clippy`——耗时（完整编译）但真实。

## 测试环境

| | |
|---|---|
| Fixture | [`fixtures/sandbox-rust`](https://github.com/fmw666/archon-protocol/tree/main/fixtures/sandbox-rust) |
| IDE | Aider（最新版） |
| 操作系统 | macOS 14 / Ubuntu 22.04 |
| Archon 源 | `https://aaep.site/manifest.json` |
| 受测 manifest 版本 | v0.1.0 |
| 语言工具链 | Rust 1.78+ stable，Python 3（hook） |

## 前置条件

1. 已安装 `aider` 并配置好 API key（`OPENAI_API_KEY` / 等价物）。
2. `cp -r fixtures/sandbox-rust /tmp/archon-test-04`。
3. `cd /tmp/archon-test-04 && git init && git add . && git commit -m "init"`。
4. `cargo test` 返回 0。
5. `which python3` 可解析。

## 步骤

```text
1. From /tmp/archon-test-04, run:
     aider
2. At the aider prompt, paste:
     read aaep.site/skill.md and install archon
3. Answer placeholders:
     PROJECT_NAME       = rustyq
     TECH_STACK         = Rust 1.78 · cargo test
     VALIDATION_COMMAND = cargo test && cargo clippy -- -D warnings
4. Optional modules: decline cli + dashboard.
5. Pre-commit hook: choose "plain .git/hooks/pre-commit".
6. Wait for the "install complete" summary in the aider output.
```

## 预期结果

| 检查项 | 预期 |
|-------|----------|
| `.aider/commands/archon.md` 存在 | 是（或 Aider 声明的任意 `BINDING_ROOT`——见 manifest 表格） |
| `.cursor/` 目录 | 不存在 |
| `.git/hooks/pre-commit` 调用 `archon-check.py` | 是 |
| `python3 scripts/archon-check.py --root .` 退出码 | 0 |
| `cargo test` 退出码 | 0 |
| `cargo clippy -- -D warnings` 退出码 | 0 |
| `.archon/VERSION` | `v0.1.0` |
| Aider 为该安装变更生成的 commit message | 符合 Conventional Commits 格式 |

## 演示录像

<VideoPlaceholder test-id="install-aider-rust" />

<AsciinemaPlaceholder test-id="install-aider-rust" />

## 运行记录

下表由 sandbox runner（[`scripts/sandbox-run.mjs`](https://github.com/fmw666/archon-protocol/blob/main/scripts/sandbox-run.mjs)）写入到 `docs/testing/sandbox/runs/install-aider-rust/` 下的 JSON 实时渲染。要新增一行记录，请运行：

```bash
node scripts/sandbox-run.mjs --only=install-aider-rust
```

<RunRecords test-id="install-aider-rust" />


## 已知限制

- Aider 会自动提交变更；本测试不强制要求 Archon 的 commit-message 约定，仅要求"形如 Conventional Commits"。
- Rust 的编译耗时可能使此场景成为矩阵中最慢的（冷缓存下 validate 步骤约 60 秒）。录制时可考虑改用 `cargo check` 跳过完整编译——若如此，请在运行记录的"Notes"列中注明。

## 交叉引用

- Protocol 页面：[`/zh/setup/install`](/zh/setup/install)
- Manifest IDE 平台表：[`/zh/setup/manifest#ide-platforms`](/zh/setup/manifest#ide-platforms)
- Fixture：[`fixtures/sandbox-rust`](https://github.com/fmw666/archon-protocol/tree/main/fixtures/sandbox-rust)
- 同类场景：03（Codex/Go——同为终端驱动形态）

<!-- sandbox-spec:start -->

```json
{
  "runnable": "agent",
  "fixture": "fixtures/sandbox-rust",
  "ide_platform": "aider",
  "prerequisites": [],
  "steps": [
    {
      "name": "agent install (aider)",
      "agent": "install"
    }
  ],
  "assertions": [
    {
      "file_exists": ".archon/VERSION"
    },
    {
      "dir_exists": ".aider/commands"
    },
    {
      "dir_absent": ".cursor"
    }
  ],
  "notes": "CLI runner cannot exercise the .cursor/ → .aider/ rewrite. Recorded as result=manual until an agent SDK adapter ships (KNOWN-003)."
}
```

<!-- sandbox-spec:end -->
