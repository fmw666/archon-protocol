---
title: "07 · update-cursor-node"
test_id: update-cursor-node
fixture: fixtures/sandbox-node-ts (post-01, then a real demand committed)
ide: Cursor
language: Node 20 + TypeScript
stage: update
status: pending
---

# 07 · update-cursor-node

## 本场景验证什么

将 Archon 从一个标签版本升级到下一个版本时，**不得覆盖运行时账本**
（`drift.md`、`debt.md`、`memos.md`、`run/state` 文件），并且**只更新
那些 sha256 已发生变化的规范文件**。

具体来说：

1. 代理从 `aaep.site` 拉取一份新的 `manifest.json`（或为了可复现而钉到
   `?version=` 查询参数）。
2. 它将本地文件与新的 sha256 列表进行 diff。
3. 它只写入发生变化的文件，对任何非平凡的覆盖保留一份 `.bak`。
4. manifest 中的 `runtime_ledger_paths` 在整个过程中保持**只读**。
5. `.archon/VERSION` 文件在最后**恰好移动一次**到新版本，并保留原有的
   行结束符。

## 测试环境

| | |
|---|---|
| Fixture | 场景 01 + 场景 05 的输出（即已经存在 1 条真实 drift 记录） |
| IDE | Cursor |
| Manifest 起始版本 | v0.1.0 |
| Manifest 目标版本 | v0.1.1（或运行时任意更新的标签） |
| OS | 同场景 01 |

## 前置条件

1. 场景 01 + 05 均 ✅。
2. `git status` 干净 —— 待提交的变更会干扰 diff 的判断。
3. 在 `aaep.site/manifest.json?version=v0.1.1` 存在一个更新的标签 manifest
   （若尚未发布则跳过 —— 待发布后重跑）。

## 步骤

```text
1. In Cursor, paste exactly:
     hi archon, update yourself
   (URL-less; the wake rule routes this to the update protocol.)
2. The agent should:
   - fetch the new manifest
   - print a planned-changes table (file, old-sha, new-sha, action)
   - ask for confirmation
3. Confirm.
4. Watch it write changed files + create .bak siblings for any
   overwrite that isn't byte-identical to the prior canonical bytes.
5. Inspect `.archon/VERSION` — should match the new version.
6. Inspect `git diff` — only the planned files should appear changed.
7. Run `npm run validate` — should still be 0.
```

## 预期结果

| 检查项 | 预期 |
|-------|----------|
| 代理在写入前打印一份计划变更表 | 是 |
| `.archon/drift.md` 行数 | 不变（保留） |
| `.archon/debt.md` 内容 | 不变 |
| `.archon/memos.md` 内容 | 不变 |
| `.archon/VERSION` | 匹配"目标"manifest 版本 |
| `python3 scripts/archon-check.py --root .` 退出码 | 0 |
| 任何 Cursor commands / rules / skills 文件，仅当其 sha256 与新 manifest 不同才被改写 | 是 |
| `npm run validate` 退出码 | 0 |
| 对每个被非平凡覆盖的文件，存在对应的 `<file>.bak` | 是（或按协议清理掉所有 bak 文件 —— 以协议页面规定为准） |

## 演示录像

<VideoPlaceholder test-id="update-cursor-node" />

<AsciinemaPlaceholder test-id="update-cursor-node" />

## 运行记录

下表由 sandbox runner
（[`scripts/sandbox-run.mjs`](https://github.com/fmw666/archon-protocol/blob/main/scripts/sandbox-run.mjs)）
写入 `docs/testing/sandbox/runs/update-cursor-node/` 下的 JSON 实时渲染。
要新增一条记录，请运行

```bash
node scripts/sandbox-run.mjs --only=update-cursor-node
```

<RunRecords test-id="update-cursor-node" />


## 已知限制

- 在 `aaep.site` 上至少存在两个连续的标签 manifest 版本之前，本场景无法
  执行。在此之前其状态保持 ⏳，并在运行记录中带有 "awaiting tag" 备注。
- 不测试回滚。如果回滚被纳入协议，可以另起一个 `update-rollback` 场景。

## 交叉引用

- 协议页面：[`/zh/setup/update`](/zh/setup/update)
- Agent 文件：[`https://aaep.site/update.md`](https://aaep.site/update.md)
- 前置条件：[01](/zh/testing/sandbox/scenarios/install-cursor-node) + [05](/zh/testing/sandbox/scenarios/boot-cursor-node)
- 同级场景：[08 update-cli-without-cli](/zh/testing/sandbox/scenarios/update-cli-without-cli)

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
      "name": "archon update (self-update)",
      "cli": "update",
      "flags": []
    }
  ],
  "assertions": [
    {
      "file_exists": ".archon/VERSION"
    },
    {
      "file_exists": ".archon/soul.md"
    },
    {
      "dir_exists": "tools/archon-cli"
    }
  ],
  "notes": "Same-version self-update (manifest only ships v0.1.0). Proves the update path is non-destructive. Extend when v0.2.0 ships to install a pinned older version first."
}
```

<!-- sandbox-spec:end -->
