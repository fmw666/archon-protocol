---
title: "08 · update-cli-without-cli"
test_id: update-cli-without-cli
fixture: fixtures/sandbox-node-ts (post-01, with cli installed)
ide: Cursor
language: Node 20 + TypeScript
stage: update
status: pending
---

# 08 · update-cli-without-cli

## 本场景验证什么

`--without={module}` 标志（及其等价的 agent prompt 形式）在 update
时**真的会移除**一个可选模块——包括删除该模块在磁盘上的文件，
而不仅仅是把它标记为"今后跳过"。

这是针对最常见用户诉求的回归测试：

> "我上周安装 Archon 时带上了 cli 模块，但我们的 CI 镜像不能装
> Node。能不能只把 CLI 卸掉，而不必把 Archon 整个卸载？"

可以。本场景就是证明。

## 测试环境

| | |
|---|---|
| Fixture | 场景 01 的产物（已安装 cli 模块） |
| IDE | Cursor |
| OS | 与场景 01 相同 |
| Archon 来源 | `https://aaep.site/manifest.json` |
| 受测 manifest 版本 | v0.1.0（不需要版本号上调） |

## 前置条件

1. 场景 01 ✅，且包含 `cli` 模块（默认）。
2. `tools/archon-cli/` 已在磁盘上存在。
3. `git status` 干净。

## 操作步骤

```text
1. In Cursor, paste exactly:
     hi archon, update yourself but without the cli module
2. Or equivalently via CLI:
     npx @archon/cli@latest update --without=cli --yes
3. The agent / CLI prints a planned-changes table that should include:
     - REMOVE  tools/archon-cli/...        (every cli file)
     - KEEP    .archon/...                  (core unchanged)
     - KEEP    .cursor/...                  (binding unchanged)
4. Confirm.
5. Verify tools/archon-cli/ no longer exists.
6. Verify .archon/manifest.md or wherever opted-in modules are
   tracked reflects "cli: not installed".
```

## 预期结果

| 检查项 | 期望 |
|-------|----------|
| `tools/archon-cli/` 已被移除 | yes |
| 其他模块未被触动 | yes |
| `.archon/drift.md` 行 | 未变化 |
| `.archon/VERSION` | 未变化 |
| 后续 `archon sync`（场景 09）将 cli 报告为 "not installed"——**而不是** "0/N ok" | yes |
| `python3 scripts/archon-check.py --root .` 退出码 | 0 |
| `npm run validate` 退出码 | 0 |

## Demo 录制

<VideoPlaceholder test-id="update-cli-without-cli" />

<AsciinemaPlaceholder test-id="update-cli-without-cli" />

## 运行记录

下表由 sandbox runner
（[`scripts/sandbox-run.mjs`](https://github.com/fmw666/archon-protocol/blob/main/scripts/sandbox-run.mjs)）
写入 `docs/testing/sandbox/runs/update-cli-without-cli/` 的 JSON
实时渲染。要新增一行，请运行

```bash
node scripts/sandbox-run.mjs --only=update-cli-without-cli
```

<RunRecords test-id="update-cli-without-cli" />


## 已知局限

- 未测试稍后通过 `--with=cli` 把 cli 加回来。这是一个值得单独添加的
  场景（`update-add-cli-back`），等基础的移除路径绿了再补。
- 未测试移除一个 *required*（必需）模块——那种情况应当大声失败。
  负向场景 `update-without-required-fails` 是不错的后续补充。

## 交叉引用

- 协议页面：[`/zh/setup/update`](/zh/setup/update) §
  "Module selection (--with / --without)"
- Manifest：[`/zh/setup/manifest`](/zh/setup/manifest) — required 与
  optional 模块对照表
- 前置：[01 install-cursor-node](./install-cursor-node)
- 后续：任何后续的 [09 sync-clean](./sync-clean) 运行都应当
  把 cli 反映为 "not installed"。

<!-- sandbox-spec:start -->

```json
{
  "runnable": "cli",
  "fixture": "fixtures/sandbox-node-ts",
  "ide_platform": "cursor",
  "prerequisites": [
    {
      "name": "archon install (no cli)",
      "cli": "install",
      "flags": [
        "--without=cli"
      ]
    }
  ],
  "steps": [
    {
      "name": "archon update with cli",
      "cli": "update",
      "flags": [
        "--with=cli"
      ]
    }
  ],
  "assertions": [
    {
      "dir_exists": "tools/archon-cli"
    },
    {
      "file_exists": "tools/archon-cli/bin/archon.mjs"
    }
  ]
}
```

<!-- sandbox-spec:end -->
