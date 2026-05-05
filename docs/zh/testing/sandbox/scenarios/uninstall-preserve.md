---
title: "11 · uninstall-preserve"
test_id: uninstall-preserve
fixture: fixtures/sandbox-python (post-02 + post-06)
ide: Claude Code
language: Python 3.12
stage: uninstall
status: pending
---

# 11 · uninstall-preserve

## 本场景验证什么

以 **Preserve ledgers**（保留台账）选项卸载 Archon 时，应删除所有
canonical 文件（soul / manifest / commands / rules / skills /
contracts / scripts / 绑定目录），**但保留运行时台账**
（`drift.md` / `debt.md` / `memos.md` / `run/state.json` /
records 目录）原封不动地留在 `.archon/` 中。

用户重新获得一个干净的编辑器界面，项目的治理历史仍保存在磁盘上，
日后重新安装时将从同一台账状态恢复。

## 测试环境

| | |
|---|---|
| Fixture | 场景 02 的输出 + 至少一条 boot-claude-python（06）的 drift 记录 |
| IDE | Claude Code |
| 受测 manifest 版本 | v0.1.0 |
| 操作系统 | 与场景 02 相同 |

## 前置条件

1. 场景 02 + 06 均已 ✅。
2. `.archon/drift.md` 中至少存在一条真实记录。
3. `git status` 干净。

## 步骤

```text
1. In Claude Code, paste exactly:
     hi archon, uninstall yourself but preserve my ledgers
2. The agent should print a planned-removal table that:
     - lists every canonical file scheduled for delete
     - lists every runtime ledger explicitly marked "PRESERVE"
3. Confirm.
4. Verify on disk:
     - .archon/soul.md, .archon/manifest.md, etc. — gone
     - .claude/commands/, .claude/rules/, etc. — gone
     - .archon/drift.md, .archon/debt.md, .archon/memos.md — STILL
       present, unchanged byte-for-byte
     - .archon/runs/ (or whichever runtime path manifest declares) — STILL
       present
     - scripts/archon-check.py — gone (it's part of the canonical kit)
     - .pre-commit-config.yaml — preserved (project-owned config)
5. Verify the project's own validate command still works:
     python -m pytest      # exit 0
```

## 预期结果

| 检查项 | 预期 |
|-------|----------|
| Canonical 文件被删除 | 是 |
| 运行时台账（`drift.md` / `debt.md` / `memos.md` / runs） | 保留，逐字节一致 |
| `.claude/` 绑定目录 | 为空或被完全删除 |
| 项目自身的 `python -m pytest` | 退出码 0 |
| 卸载后的 `git status` | 仅可见 canonical 文件的删除项；台账未被修改 |
| 重装（`hi archon, install yourself` + URL bootstrap） | 复用已保留的台账，不会覆盖 |

## 演示录像

<VideoPlaceholder test-id="uninstall-preserve" />

<AsciinemaPlaceholder test-id="uninstall-preserve" />

## 运行记录

下表由 sandbox runner
（[`scripts/sandbox-run.mjs`](https://github.com/fmw666/archon-protocol/blob/main/scripts/sandbox-run.mjs)）
写入 `docs/testing/sandbox/runs/uninstall-preserve/` 下的 JSON 实时渲染。
要添加新一行，请运行：

```bash
node scripts/sandbox-run.mjs --only=uninstall-preserve
```

<RunRecords test-id="uninstall-preserve" />


## 已知局限

- 卸载（保留台账）后的重装在此处第 6 步以人工方式验证，但若有
  专门的 `reinstall-after-preserve` 场景可更清晰地隔离该流程。
  按优先级安排时再添加。

## 交叉引用

- 协议页面：[`/zh/setup/uninstall`](/zh/setup/uninstall) §
  "Preserve / Archive / Delete"
- Agent 文件：[`https://aaep.site/uninstall.md`](https://aaep.site/uninstall.md)
- 前置：[02 install-claude-python](/zh/testing/sandbox/scenarios/install-claude-python) +
  [06 boot-claude-python](/zh/testing/sandbox/scenarios/boot-claude-python)
- 同级：[12 uninstall-archive](/zh/testing/sandbox/scenarios/uninstall-archive) ——
  同一流程，但使用 Archive 选项替代 Preserve。

<!-- sandbox-spec:start -->

```json
{
  "runnable": "cli",
  "fixture": "fixtures/sandbox-node-ts",
  "ide_platform": "cursor",
  "prerequisites": [
    {
      "name": "archon install",
      "cli": "install",
      "flags": [
        "--with=cli"
      ]
    }
  ],
  "steps": [
    {
      "name": "archon uninstall (preserve ledgers)",
      "cli": "uninstall",
      "flags": []
    }
  ],
  "assertions": [
    {
      "file_absent": "tools/archon-cli/bin/archon.mjs"
    },
    {
      "file_absent": ".cursor/commands/archon.md"
    },
    {
      "file_absent": ".archon/soul.md"
    },
    {
      "file_exists": ".archon/manifest.md"
    }
  ]
}
```

<!-- sandbox-spec:end -->
