---
title: "10 · sync-modified"
test_id: sync-modified
fixture: fixtures/sandbox-node-ts (post-01, with hand-edit injected)
ide: Cursor
language: Node 20 + TypeScript
stage: sync
status: pending
---

# 10 · sync-modified

## 本场景验证什么

当某个 canonical 文件被手工编辑后，`archon sync` 能正确**检测到漂移（drift）**，
并精确地报告（具体哪个文件、期望 sha256 vs 实际 sha256）。这是
[场景 09 sync-clean](/zh/testing/sandbox/scenarios/sync-clean) 的失败模式对照。

必须同时满足两点：

1. 报告将被修改的文件标记为漂移。
2. 被修改的文件**不会**被自动修正 —— sync 始终保持只读。
   用户必须运行 `archon update`（或手动还原文件）来解决漂移。

## 测试环境

| | |
|---|---|
| Fixture | 场景 01 的产物 + 一处刻意的手工编辑 |
| IDE | Cursor |
| 被测 manifest 版本 | v0.1.0 |
| 操作系统 | 同场景 01 |

## 前置条件

1. 场景 01 ✅。
2. 注入编辑前 `git status` 干净。

## 步骤

```text
1. Inject a deliberate hand-edit into a canonical file. Pick something
   short and unmistakable, e.g.:
     echo "" >> .cursor/commands/archon.md
     echo "<!-- DRIFT INJECTED FOR TEST 10 -->" >> .cursor/commands/archon.md
2. Confirm the file's sha256 has changed:
     sha256sum .cursor/commands/archon.md
3. In Cursor, paste exactly:
     hi archon, are you healthy?
4. Read the report — should call out
     .cursor/commands/archon.md   FAIL  expected <sha-A>  got <sha-B>
5. Confirm sync did not modify any file:
     git status
   must show ONLY the file you injected (modified), nothing extra.
6. Repair drift via update:
     hi archon, update yourself
   confirm the planned change includes restoring .cursor/commands/archon.md
   and accept.
7. Re-run sync (step 3) — should now report N/N OK again.
```

## 预期结果

| 检查项 | 预期 |
|-------|----------|
| Sync（步骤 3）打印被修改文件，标注 FAIL 与 sha 不匹配 | 是 |
| Sync 以非零状态退出（或以其他方式发出"detected drift"信号 —— 与协议页面一致） | 是 |
| Sync **不会**修改任何文件（步骤 5） | 是 |
| Update（步骤 6）还原 canonical 内容 | 是 |
| 重新运行 sync（步骤 7） | N/N OK |
| `.archon/drift.md` 行数 | 全过程不变（canonical 文件的 sync/update 在 runtime-ledger 语义下不算一次 drift 事件） |

## 演示记录

<VideoPlaceholder test-id="sync-modified" />

<AsciinemaPlaceholder test-id="sync-modified" />

## 运行记录

下表由 sandbox runner
（[`scripts/sandbox-run.mjs`](https://github.com/fmw666/archon-protocol/blob/main/scripts/sandbox-run.mjs)）
写入 `docs/testing/sandbox/runs/sync-modified/` 下的 JSON 实时渲染。要新增一行，运行

```bash
node scripts/sandbox-run.mjs --only=sync-modified
```

<RunRecords test-id="sync-modified" />


## 已知限制

- 本场景只在一个 binding-root 文件
  （`.cursor/commands/archon.md`）上注入漂移。更完整的矩阵还应在
  `.archon/soul.md`、`.archon/manifest.md` 等文件上注入漂移，
  以证明报告对 core 目录同等覆盖。按优先级补充为后续场景。
- 不测试 runtime ledger 被手工编辑的情况
  （`.archon/drift.md`）。这些文件由 project 持有，`sync` **绝不能**
  把它们报告为漂移 —— 那是一个独立的负向测试
  （`sync-ignores-runtime-ledgers`）。

## 交叉引用

- 协议页面：[`/zh/setup/sync`](/zh/setup/sync) 与 [`/zh/setup/update`](/zh/setup/update)
- 前置：[01 install-cursor-node](/zh/testing/sandbox/scenarios/install-cursor-node)
- 同级：[09 sync-clean](/zh/testing/sandbox/scenarios/sync-clean) —— 同一流程，未注入漂移

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
    },
    {
      "name": "tamper soul.md",
      "append_to_file": {
        "path": ".archon/soul.md",
        "content": "\n# tampered by sandbox runner\n"
      }
    }
  ],
  "steps": [
    {
      "name": "archon sync (expected to flag drift)",
      "cli": "sync",
      "flags": [
        "--json"
      ],
      "allow_nonzero": true
    }
  ],
  "assertions": [
    {
      "file_exists": ".archon/soul.md"
    },
    {
      "file_contains": {
        "path": ".archon/soul.md",
        "substr": "tampered by sandbox runner"
      }
    }
  ],
  "notes": "Asserts that tampering is preserved on disk and `archon sync` runs without crashing. A future enhancement could capture the JSON drift report and assert specific drift counts."
}
```

<!-- sandbox-spec:end -->
