---
title: "02 · install-claude-python"
test_id: install-claude-python
fixture: fixtures/sandbox-python
ide: Claude Code
language: Python 3.12
stage: install
status: pending
---

# 02 · install-claude-python

## 本场景验证什么

Archon **并未绑定 Node**。一个没有 `package.json`、也没有 Node 工具链的
Python 项目，只要 PATH 上存在 Python 3 用于契约检查器，就能通过 Claude Code
端到端地接入 Archon。

本场景强制验证三种平台中立行为：

1. agent 必须检测出 `IDE_PLATFORM = claude`（信号：`.claude/`
   或 `CLAUDE.md`），并将 manifest 中所有路径从 `.cursor/`
   **改写**为 `.claude/`。
2. agent 必须为 hook 选择 Python `pre-commit` 框架路径——*而非* husky。
3. agent 必须默认跳过 `cli` 与 `dashboard` 模块
   （它们是仅 Node 可用的可选模块）。

失败即意味着 Archon 在跨平台 / 跨语言支持方面存在虚假宣传。

## 测试环境

| | |
|---|---|
| Fixture | [`fixtures/sandbox-python`](https://github.com/fmw666/archon-protocol/tree/main/fixtures/sandbox-python) |
| IDE | Claude Code（最新版） |
| 操作系统 | macOS 14 / Ubuntu 22.04 |
| Archon 源 | `https://aaep.site/manifest.json` |
| 被测 manifest 版本 | v0.1.0 |
| 语言工具链 | Python 3.10+，附带 `pip` 与 `pre-commit` |

## 前置条件

1. Claude Code 已配置 web-fetch + write 工具。
2. `cp -r fixtures/sandbox-python /tmp/archon-test-02`。
3. `cd /tmp/archon-test-02 && git init && git add . && git commit -m "init"`。
4. `python -m pip install -e ".[dev]" && python -m pytest` 返回 0。
5. `which python3` 可解析（agent 将用它执行 hook）。

## 步骤

```text
1. Open Claude Code in /tmp/archon-test-02.
2. In the chat panel, paste:
     read aaep.site/skill.md and install archon
3. When the agent asks for placeholders, answer:
     PROJECT_NAME      = pyflux
     TECH_STACK        = Python 3.12 · pytest · ruff
     VALIDATION_COMMAND= python -m pytest && ruff check .
4. When asked about optional modules, decline cli + dashboard
   (they require Node). Accept extensions-demand-pool if asked.
5. When asked about the pre-commit hook, choose
   "Python pre-commit framework".
6. Wait for the "install complete" summary.
```

## 预期结果

| 检查项 | 预期 |
|-------|----------|
| agent 自报告应包含 | "IDE_PLATFORM = claude · BINDING_ROOT = .claude/" |
| `.archon/VERSION` | `v0.1.0` |
| `.cursor/` 目录 | **不存在**（路径已被改写） |
| 存在 `.claude/commands/archon.md` | 是 |
| 存在 `.claude/rules/archon-wake.md` | 是（注意：Claude 用 `.md` 而非 `.mdc`） |
| `.pre-commit-config.yaml` 引用 `archon-check.py` | 是 |
| 不存在 `.husky/` 目录 | 是 |
| 安装 diff 中无 `node_modules/` 引用 | 是 |
| `python3 scripts/archon-check.py --root .` 退出码 | 0 |
| `python -m pytest` 退出码 | 0 |

## 演示录像

<VideoPlaceholder test-id="install-claude-python" />

<AsciinemaPlaceholder test-id="install-claude-python" />

## 运行记录

下表由 sandbox runner
（[`scripts/sandbox-run.mjs`](https://github.com/fmw666/archon-protocol/blob/main/scripts/sandbox-run.mjs)）
写入 `docs/testing/sandbox/runs/install-claude-python/` 的 JSON 实时渲染。
要新增一行，请运行

```bash
node scripts/sandbox-run.mjs --only=install-claude-python
```

<RunRecords test-id="install-claude-python" />


## 已知限制

- Claude Code 上规则文件的具体扩展名（`.md` 还是 `.mdc`）取决于
  Claude Code 不断演进的规则加载约定；如果 agent 选择了不同的扩展名
  且 wake 规则仍能加载，视为 ✅。此时请同步更新本节的预期结果一行。
- 未测试在 Python 3.9 或更早版本上运行 Archon；Python 3.10+ 是文档规定的最低版本。

## 交叉引用

- 协议页面：[`/zh/setup/install`](/zh/setup/install) §
  "Install IDE binding surface"
- agent 文件：[`https://aaep.site/install.md`](https://aaep.site/install.md)
- manifest IDE 平台表：[`/zh/setup/manifest#ide-platforms`](/zh/setup/manifest#ide-platforms)
- Fixture：[`fixtures/sandbox-python`](https://github.com/fmw666/archon-protocol/tree/main/fixtures/sandbox-python)
- 后续场景：06、11

<!-- sandbox-spec:start -->

```json
{
  "runnable": "agent",
  "fixture": "fixtures/sandbox-python",
  "ide_platform": "claude",
  "prerequisites": [],
  "steps": [
    {
      "name": "agent install (claude)",
      "agent": "install"
    }
  ],
  "assertions": [
    {
      "file_exists": ".archon/VERSION"
    },
    {
      "dir_exists": ".claude/commands"
    },
    {
      "dir_absent": ".cursor"
    }
  ],
  "notes": "CLI runner cannot exercise the .cursor/ → .claude/ rewrite. Recorded as result=manual until an agent SDK adapter ships (KNOWN-003)."
}
```

<!-- sandbox-spec:end -->
