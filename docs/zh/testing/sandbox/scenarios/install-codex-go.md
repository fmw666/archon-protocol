---
title: "03 · install-codex-go"
test_id: install-codex-go
fixture: fixtures/sandbox-go
ide: OpenAI Codex CLI
language: Go 1.22
stage: install
status: pending
---

# 03 · install-codex-go

## 本场景验证什么

Archon 在**最小可能的接入形态**上能够干净安装 ——
一个 Go 项目，其全部清单仅由 `go.mod` 加上几个 `.go` 文件构成，
通过运行在终端分屏中的 **OpenAI Codex CLI** 驱动。

同时验证三件事：

1. 智能体从 `AGENTS.md` / `.codex/` 信号中检测到 `IDE_PLATFORM = codex`，
   并将路径改写为 `.codex/`。
2. 在默认情况下既无 Node、也无 Python pre-commit 框架可用时，智能体
   回退到 **纯 `.git/hooks/pre-commit` shell 脚本** 选项。
3. 校验命令为 `go test ./... && go vet ./...` —— 证明清单中的
   `VALIDATION_COMMAND` 占位符是真正按项目自由填写的，而不是写死的
   npm 脚本。

## 测试环境

| | |
|---|---|
| Fixture | [`fixtures/sandbox-go`](https://github.com/fmw666/archon-protocol/tree/main/fixtures/sandbox-go) |
| IDE | OpenAI Codex CLI（最新版） |
| 操作系统 | macOS 14 / Ubuntu 22.04 |
| Archon 来源 | `https://aaep.site/manifest.json` |
| 受测清单版本 | v0.1.0 |
| 语言工具链 | Go 1.22+，Python 3（供 hook 使用） |

## 前置条件

1. Codex CLI 已认证（`codex login` 成功）。
2. `cp -r fixtures/sandbox-go /tmp/archon-test-03`。
3. `cd /tmp/archon-test-03 && git init && git add . && git commit -m "init"`。
4. `go test ./...` 返回 0。
5. `which python3` 能够解析（纯 git hook 会用到）。

## 步骤

```text
1. From /tmp/archon-test-03, run:
     codex
2. At the prompt, paste:
     read aaep.site/skill.md and install archon
3. Answer placeholder prompts:
     PROJECT_NAME       = goping
     TECH_STACK         = Go 1.22 · stdlib testing
     VALIDATION_COMMAND = go test ./... && go vet ./...
4. Optional modules: decline cli + dashboard (Node-only). Decline
   extensions-demand-pool unless you want to test it later.
5. Pre-commit hook: choose "plain .git/hooks/pre-commit".
6. Wait for the "install complete" summary.
```

## 预期结果

| 检查项 | 预期 |
|-------|----------|
| `.codex/commands/archon.md` 存在 | 是 |
| `.cursor/` 目录 | 不存在 |
| `.git/hooks/pre-commit` 可执行 | 是 |
| Hook 内容首行调用 `python3 scripts/archon-check.py --root .` | 是 |
| `python3 scripts/archon-check.py --root .` 退出码 | 0 |
| `go test ./...` 退出码 | 0 |
| `.archon/VERSION` | `v0.1.0` |

## 演示录像

<VideoPlaceholder test-id="install-codex-go" />

<AsciinemaPlaceholder test-id="install-codex-go" />

## 运行记录

下方表格由 sandbox runner
（[`scripts/sandbox-run.mjs`](https://github.com/fmw666/archon-protocol/blob/main/scripts/sandbox-run.mjs)）
写入 `docs/testing/sandbox/runs/install-codex-go/` 下的 JSON 文件实时渲染。
要新增一行，运行

```bash
node scripts/sandbox-run.mjs --only=install-codex-go
```

<RunRecords test-id="install-codex-go" />


## 已知限制

- 随着 Codex 绑定约定的稳定，Codex CLI 的精确路径改写目录可能会演进；
  `.codex/` 是当前最佳信号。若未来 Codex 版本标准化为其他位置，请在同一
  提交中同步更新 [`/setup/manifest#ide-platforms`](/zh/setup/manifest#ide-platforms)
  与本场景。
- 此处不演练 `cargo` 风格的构建缓存失效（Go 的构建缓存与安装协议无关）。

## 交叉引用

- 协议页面：[`/setup/install`](/zh/setup/install)
- 清单 IDE 平台表：[`/setup/manifest#ide-platforms`](/zh/setup/manifest#ide-platforms)
- Fixture：[`fixtures/sandbox-go`](https://github.com/fmw666/archon-protocol/tree/main/fixtures/sandbox-go)
- 同级场景：04（Aider/Rust —— 同样为非 IDE / 终端驱动流程）

<!-- sandbox-spec:start -->

```json
{
  "runnable": "agent",
  "fixture": "fixtures/sandbox-go",
  "ide_platform": "codex",
  "prerequisites": [],
  "steps": [
    {
      "name": "agent install (codex)",
      "agent": "install"
    }
  ],
  "assertions": [
    {
      "file_exists": ".archon/VERSION"
    },
    {
      "dir_exists": ".codex/commands"
    },
    {
      "dir_absent": ".cursor"
    }
  ],
  "notes": "CLI runner cannot exercise the .cursor/ → .codex/ rewrite. Recorded as result=manual until an agent SDK adapter ships (KNOWN-003)."
}
```

<!-- sandbox-spec:end -->
