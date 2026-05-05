---
title: "09 · sync-clean"
test_id: sync-clean
fixture: fixtures/sandbox-node-ts (post-01)
ide: Cursor
language: Node 20 + TypeScript
stage: sync
status: pending
---

# 09 · sync-clean

## 本场景验证什么

`archon sync`（以及其无 URL 的 agent 等价命令 `hi archon, are you
healthy?`）是**只读**操作。针对未经修改的安装，它必须：

1. 拉取规范化的 manifest。
2. 遍历每个已安装文件，计算 sha256，与 manifest 进行比对。
3. 打印绿色报告：每个必需模块的文件都匹配。
4. **不写入任何内容** —— 既不写源文件，也不写运行时 ledger。

这是框架最基本的保证：那道证明"你可以随时运行 sync 而无后果"的关卡。

## 测试环境

| | |
|---|---|
| Fixture | 场景 01 的产物（干净的安装后状态） |
| IDE | Cursor |
| 被测 manifest 版本 | v0.1.0 |
| 操作系统 | 与场景 01 相同 |

## 前置条件

1. 场景 01 ✅。
2. 本场景开始前 `git status` 立即处于干净状态。

## 步骤

```text
1. In Cursor, paste exactly:
     hi archon, are you healthy?
2. Or via CLI:
     npx @archon/cli@latest sync
3. Inspect the printed report:
     - core-soul:           N/N OK
     - core-contracts:      N/N OK
     - commands:            N/N OK
     - rules:               N/N OK
     - skills:              N/N OK
     - cli (optional):      N/N OK   (or "not installed" if removed in 08)
     - extensions-demand-pool: …
4. Run `git status` immediately after — must still be clean.
```

## 预期结果

| 检查项 | 预期 |
|-------|----------|
| sync 以成功状态退出 | 是 |
| 每个必需模块报告 `N/N OK` | 是 |
| 可选模块报告 `N/N OK` 或 `not installed`（绝不能是 `0/N OK`） | 是 |
| sync 之后的 `git status` | 与之前一致（干净） |
| 不创建 `.bak` 文件 | 是 |
| `.archon/drift.md` 未发生变化 | 是 |
| 总耗时 | 暖缓存下 < 30 秒 |

## 演示录像

<VideoPlaceholder test-id="sync-clean" />

<AsciinemaPlaceholder test-id="sync-clean" />

## 运行记录

下方表格由 sandbox runner
（[`scripts/sandbox-run.mjs`](https://github.com/fmw666/archon-protocol/blob/main/scripts/sandbox-run.mjs)）
写入 `docs/testing/sandbox/runs/sync-clean/` 下的 JSON 实时渲染。要新增一行，运行：

```bash
node scripts/sandbox-run.mjs --only=sync-clean
```

<RunRecords test-id="sync-clean" />


## 已知局限

- 未测试针对从陈旧 CDN 缓存拉取的 manifest 执行 sync 的情况。
  那是 `sync-stale-manifest` —— 另一个独立场景。
- 未演练离线路径（CLI 的 `--offline` 标志）；
  请参见 protocol 页面了解该模式的预期输出。

## 交叉引用

- Protocol 页面：[`/zh/setup/sync`](/zh/setup/sync)
- Agent 文件：[`https://aaep.site/sync.md`](https://aaep.site/sync.md)
- 前置场景：[01 install-cursor-node](./install-cursor-node)
- 兄弟场景：[10 sync-modified](./sync-modified) —— 同一场景，
  但注入了一处手工编辑，使报告转红。

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
      "name": "archon sync (json)",
      "cli": "sync",
      "flags": [
        "--json"
      ]
    }
  ],
  "assertions": [
    {
      "file_exists": ".archon/VERSION"
    }
  ]
}
```

<!-- sandbox-spec:end -->
