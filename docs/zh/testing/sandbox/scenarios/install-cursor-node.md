---
title: "01 · install-cursor-node"
test_id: install-cursor-node
fixture: fixtures/sandbox-node-ts
ide: Cursor
language: Node 20 + TypeScript
stage: install
status: pending
---

# 01 · install-cursor-node

## 本场景验证什么

最常见的接入形态：一位开发者在一个全新的
**Vite/Next/Express 风格的 Node + TypeScript 仓库** 中打开 **Cursor**，
请求 agent 安装 Archon。Agent 遵循
[`aaep.site/install.md`](https://aaep.site/install.md)，将 Cursor 识别为
`IDE_PLATFORM`，将绑定文件落在 `.cursor/` 下，选择基于 `husky` 的
pre-commit hook，并产出一棵首次运行即可通过
`scripts/archon-check.py` 的目录树。

如果这里失败，意味着 Archon 在它的 #1 目标技术栈上是损坏的。

## 测试环境

| | |
|---|---|
| Fixture | [`fixtures/sandbox-node-ts`](https://github.com/fmw666/archon-protocol/tree/main/fixtures/sandbox-node-ts) |
| IDE | Cursor（最新稳定版） |
| 操作系统 | macOS 14 / Ubuntu 22.04 / Windows 11 + WSL2 |
| Archon 来源 | `https://aaep.site/manifest.json` |
| 受测 manifest 版本 | v0.1.0 |
| 语言工具链 | Node 20.11+, npm 10+ |

## 前置条件

1. Cursor 已登录，agent 拥有 web-fetch 和 write 工具。
2. 已复制 fixture：`cp -r fixtures/sandbox-node-ts /tmp/archon-test-01`。
3. `cd /tmp/archon-test-01 && git init && git add . && git commit -m "init"`。
4. `npm install && npm run validate` 返回 exit 0（证明 fixture 在 Archon
   介入 *之前* 是健康的）。

## 步骤

```text
1. Open /tmp/archon-test-01 in Cursor.
2. Open the chat panel (⌘L / Ctrl+L).
3. Paste exactly:
     read aaep.site/skill.md and install archon
4. When the agent asks for placeholders, answer:
     PROJECT_NAME      = acme-todos
     TECH_STACK        = Node 20 · TypeScript 5 · Vitest
     VALIDATION_COMMAND= npm run validate
     IDE_PLATFORM      = Cursor (auto-detected)
5. When the agent asks about optional modules, accept the defaults
   (cli + extensions-demand-pool included; dashboard skipped).
6. When the agent asks about the pre-commit hook, accept "husky".
7. Wait for the "install complete" summary line.
```

## 期望结果

| 检查项 | 期望值 |
|-------|----------|
| Agent 自报 | "install complete · v0.1.0 · 0 placeholders unfilled" |
| `.archon/VERSION` | `v0.1.0` |
| `.archon/soul.md` 行数 | ≤ manifest 中声明的上限 |
| `.archon/drift.md` 行数 | 0 |
| `.cursor/commands/archon.md` 存在 | 是 |
| `.cursor/rules/archon-wake.mdc` 存在 | 是 |
| `.husky/pre-commit` 调用 `python3 scripts/archon-check.py --root .` | 是 |
| `python3 scripts/archon-check.py --root .` 的退出码 | 0 |
| 安装后 `npm run validate` 的退出码 | 0 |
| `git status` 仅显示 Archon 跟踪的文件被新增 | 是 |

## 演示录像

<VideoPlaceholder test-id="install-cursor-node" />

<AsciinemaPlaceholder test-id="install-cursor-node" />

## 运行记录

下表由 sandbox runner
（[`scripts/sandbox-run.mjs`](https://github.com/fmw666/archon-protocol/blob/main/scripts/sandbox-run.mjs)）
写入的 JSON 文件实时渲染，位于
`docs/testing/sandbox/runs/install-cursor-node/`。要新增一行，运行：

```bash
node scripts/sandbox-run.mjs --only=install-cursor-node
```

<RunRecords test-id="install-cursor-node" />


## 已知限制

- 不验证 Cursor 的 "rules reload" UI 步骤，只让 agent 确认 wake rule 已加载；
  验证 Cursor 在下次会话中是否真的会触发该 wake rule 不在范围内
  （属于 UI 状态，不是文件状态）。
- 不测试安装过程中 `aaep.site` 不可达的情况 —— 该路径由后续的
  `install-offline-failure` 场景单独覆盖。

## 交叉引用

- 协议页：[`/zh/setup/install`](/zh/setup/install)
- Agent 文件：[`https://aaep.site/install.md`](https://aaep.site/install.md)
- Fixture：[`fixtures/sandbox-node-ts`](https://github.com/fmw666/archon-protocol/tree/main/fixtures/sandbox-node-ts)
- 同级场景：02（Claude+Python）、03（Codex+Go）、04（Aider+Rust）
- 后续场景：05、07、08、09、10、12

<!-- sandbox-spec:start -->

```json
{
  "runnable": "cli",
  "fixture": "fixtures/sandbox-node-ts",
  "ide_platform": "cursor",
  "prerequisites": [],
  "steps": [
    {
      "name": "archon install",
      "cli": "install",
      "flags": [
        "--with=cli"
      ]
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
      "file_exists": ".archon/manifest.md"
    },
    {
      "dir_exists": ".cursor/commands"
    },
    {
      "dir_exists": ".cursor/rules"
    },
    {
      "dir_exists": ".cursor/skills"
    },
    {
      "file_exists": ".cursor/commands/archon.md"
    },
    {
      "dir_exists": "tools/archon-cli"
    },
    {
      "file_exists": "scripts/archon-check.py"
    },
    {
      "file_contains": {
        "path": ".archon/VERSION",
        "substr": "0.1"
      }
    }
  ]
}
```

<!-- sandbox-spec:end -->
