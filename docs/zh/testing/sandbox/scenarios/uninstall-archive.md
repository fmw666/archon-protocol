---
title: "12 · uninstall-archive"
test_id: uninstall-archive
fixture: fixtures/sandbox-node-ts (post-01 + post-05)
ide: Cursor
language: Node 20 + TypeScript
stage: uninstall
status: pending
---

# 12 · uninstall-archive

## 本场景验证什么

**Archive ledgers**（归档账本）选项会在彻底删除 `.archon/` 之前，
将运行时账本（`drift.md` / `debt.md` / `memos.md` / `runs/`）
打包成一个带时间戳的 tarball 或 zip，放到 `.archon/` 之外
（例如项目根目录下的 `.archon-archive-2026-05-05.tar.gz`）。

该选项适用于以下项目：

- 希望仓库保持干净（不保留 `.archon/`），
- 但同时希望保留一份可移植的治理历史记录，便于将来重新接入或回溯审计。

## 测试环境

| | |
|---|---|
| Fixture | 场景 01 + 至少一条 boot-cursor-node (05) drift 记录后的输出 |
| IDE | Cursor |
| 被测 manifest 版本 | v0.1.0 |
| 操作系统 | 与场景 01 相同 |

## 前置条件

1. 场景 01 + 05 均 ✅。
2. `.archon/drift.md` 至少有一条真实记录。
3. `git status` 干净。

## 步骤

```text
1. In Cursor, paste exactly:
     hi archon, uninstall yourself and archive my ledgers
2. The agent should print a planned-removal table that includes a
   line like:
     ARCHIVE  .archon/drift.md, .archon/debt.md, ...
       → .archon-archive-<YYYY-MM-DD-HHmm>.tar.gz
     DELETE   <every other canonical and ledger file>
3. Confirm.
4. Verify on disk:
     - .archon/  — gone entirely
     - .cursor/  — gone (binding dir removed; if you keep .cursor/
       for non-Archon settings, only Archon's contributed files are
       removed)
     - scripts/archon-check.py — gone
     - .archon-archive-<timestamp>.tar.gz — exists at project root
5. Inspect the archive contents:
     tar -tzf .archon-archive-<timestamp>.tar.gz
   should list every preserved ledger plus a small README
   explaining how to restore.
6. Verify the project's own validate still works:
     npm run validate     # exit 0
```

## 预期结果

| 检查项 | 预期 |
|-------|----------|
| 项目根目录存在归档 tarball | 是 |
| 归档包含 `.archon/drift.md`、`.archon/debt.md`、`.archon/memos.md` 以及任意 `runs/` 内容 | 是 |
| 归档包含一份说明恢复步骤的 README | 是 |
| `.archon/` 目录被移除 | 是 |
| `.cursor/` 中由 Archon 注入的文件被移除（其他 Cursor 设置保留） | 是 |
| `npm run validate` 退出码 | 0 |
| 卸载后的 `git status` | 显示归档 tarball 为未跟踪 + Archon 文件被删除 |
| 通过解压归档到全新的 `.archon/` 目录后运行 install 进行恢复 | 可行（手动验证可选） |

## 演示录像

<VideoPlaceholder test-id="uninstall-archive" />

<AsciinemaPlaceholder test-id="uninstall-archive" />

## 运行记录

下表由 sandbox runner
（[`scripts/sandbox-run.mjs`](https://github.com/fmw666/archon-protocol/blob/main/scripts/sandbox-run.mjs)）
写入 `docs/testing/sandbox/runs/uninstall-archive/` 下的 JSON 实时渲染。
要添加新一行，请运行：

```bash
node scripts/sandbox-run.mjs --only=uninstall-archive
```

<RunRecords test-id="uninstall-archive" />


## 已知局限

- 归档文件名的具体形式（`.tar.gz` 还是 `.zip`、时间戳精度）以协议页面声明为准 ——
  本场景断言的是归档**存在且可恢复**，而非文件名的精确形态。
- 这里的"从归档恢复"是手动验证；专门的 `restore-from-archive` 场景可进一步收紧该保证。

## 交叉引用

- 协议页面：[`/zh/setup/uninstall`](/zh/setup/uninstall) § "Archive ledgers"
- 前置场景：[01 install-cursor-node](/zh/testing/sandbox/scenarios/install-cursor-node) +
  [05 boot-cursor-node](/zh/testing/sandbox/scenarios/boot-cursor-node)
- 同级场景：[11 uninstall-preserve](/zh/testing/sandbox/scenarios/uninstall-preserve) —— 保留
  `.archon/` 账本而非归档。

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
      "name": "archon uninstall --archive-ledgers",
      "cli": "uninstall",
      "flags": [
        "--archive-ledgers"
      ]
    }
  ],
  "assertions": [
    {
      "file_absent": ".cursor/commands/archon.md"
    },
    {
      "file_absent": "tools/archon-cli/bin/archon.mjs"
    },
    {
      "file_absent": ".archon/soul.md"
    }
  ],
  "notes": "--archive-ledgers moves runtime ledgers under .archon-history-<ts>/. We assert .archon/soul.md is gone (moved). A more rigorous check could glob-match .archon-history-*/soul.md."
}
```

<!-- sandbox-spec:end -->
