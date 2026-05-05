---
title: Sandbox 测试
outline: deep
---

# Sandbox 测试

一个可复现的、基于证据的回答，用于回应这个问题：

> **Archon 的 install / update / sync / uninstall 协议在每一个支持的 IDE
> 与语言上，是否真的能在真实项目中端到端工作？**

每个 sandbox 测试都会取一个**干净的 fixture 项目**（没有 `.archon/`，
也没有 binding 目录），运行一条 Archon 生命周期命令（通过 agent 或
CLI），并将生成的目录树与预期结果进行比对。每一次 run 都会记录日期、
manifest 版本、runner 与结果，让你可以审计真实情况，而不是承诺。

## 与 [Contract 测试](/zh/testing/strategy) 的区别

| 层级 | 关心的问题 | 位于 |
|-------|------|----------|
| [Contract 测试](/zh/testing/strategy) | "框架文件之间是否内部一致？"（文件形态、交叉引用、行数上限、禁用子串） | `scripts/archon-check.py`，针对 `.archon/contracts/governance-contract.yaml` 运行 |
| **Sandbox 测试（本节）** | "在某个 IDE / 语言下，install 协议是否能在一个真实的全新项目上生成有效的目录树？" | [`/zh/testing/sandbox/scenarios/`](./test-matrix) 下的 scenario 页面 —— 每个都由 [`fixtures/`](https://github.com/fmw666/archon-protocol/tree/main/fixtures) 中的 fixture 支撑 |

两层都是必须的。Contract 测试是静态的，每次提交都会运行；sandbox 测试
则是 scenario 驱动的，每次发布都会运行（在新增 IDE / 语言目标时也会
按需运行）。

## 12 个 scenario 矩阵

第一版矩阵覆盖 `生命周期阶段 × IDE × 语言`，并在最常见的技术栈
（Cursor + Node + TS）上有意保留重叠，以便 update / sync / uninstall
scenario 可以在 install scenario 之上链式执行。

| # | test-id | 阶段 | IDE | 语言 |
|---|---------|:-----:|-----|----------|
| 01 | [`install-cursor-node`](./scenarios/install-cursor-node) | install | Cursor | Node + TS |
| 02 | [`install-claude-python`](./scenarios/install-claude-python) | install | Claude Code | Python |
| 03 | [`install-codex-go`](./scenarios/install-codex-go) | install | Codex CLI | Go |
| 04 | [`install-aider-rust`](./scenarios/install-aider-rust) | install | Aider | Rust |
| 05 | [`boot-cursor-node`](./scenarios/boot-cursor-node) | boot | Cursor | Node + TS |
| 06 | [`boot-claude-python`](./scenarios/boot-claude-python) | boot | Claude Code | Python |
| 07 | [`update-cursor-node`](./scenarios/update-cursor-node) | update | Cursor | Node + TS |
| 08 | [`update-cli-without-cli`](./scenarios/update-cli-without-cli) | update + `--without=cli` | Cursor | Node + TS |
| 09 | [`sync-clean`](./scenarios/sync-clean) | sync（无 drift） | Cursor | Node + TS |
| 10 | [`sync-modified`](./scenarios/sync-modified) | sync（检测到 drift） | Cursor | Node + TS |
| 11 | [`uninstall-preserve`](./scenarios/uninstall-preserve) | uninstall（保留 ledger） | Claude Code | Python |
| 12 | [`uninstall-archive`](./scenarios/uninstall-archive) | uninstall（归档 ledger） | Cursor | Node + TS |

完整网格（含 fixture / 状态列）请见 [Test Matrix](./test-matrix) 页面，
或跳转到 [Test Fixtures](./fixtures) 查看每个 scenario 安装目标所使用的
项目骨架。

## 最近一次 run 的概要

下方表格是**判断 "Archon 是否可发布" 的唯一事实来源**。在每一行的
最近一次 run 都对候选 manifest 版本 `passing` 之前，本次发布不会上线。

它由 [`runs/index.json`](https://github.com/fmw666/archon-protocol/tree/main/docs/testing/sandbox/runs)
实时渲染，该文件会在每次调用
[`scripts/sandbox-run.mjs`](https://github.com/fmw666/archon-protocol/blob/main/scripts/sandbox-run.mjs)
时（本地 + GitHub Actions）重新生成。修改某个 scenario 后，运行下面的
命令即可刷新：

```bash
node scripts/sandbox-run.mjs --runnable=cli         # CLI scenarios
node scripts/sandbox-run.mjs --runnable=agent       # agent scenarios (currently → manual)
```

<LatestRunsSummary />

> **状态图例**：✅ passing · ❌ failing · ⏳ manual（尚无 SDK adapter，
> 详见 [KNOWN-003](https://github.com/fmw666/archon-protocol/blob/main/KNOWN-ISSUES.md)） ·
> · pending（暂无 run 记录）。
>
> `failing` 行**不是** runner 噪声 —— 要么是真实的 CLI 回归，要么
> 是某个 scenario 的断言需要更新。无论哪种情况，在解决之前它都会
> 阻塞发布。

## 如何新增一个 scenario

1. 找到缺口：尚未覆盖的 阶段 / IDE / 语言 组合。
2. 在 [`fixtures/`](https://github.com/fmw666/archon-protocol/tree/main/fixtures) 下选择（或新增）一个 fixture —— 约定参见
   [`fixtures/README.md`](https://github.com/fmw666/archon-protocol/blob/main/fixtures/README.md)。
3. 将 [`template.md`](./template) 拷贝到 `scenarios/<test-id>.md`，
   填写 front-matter + steps + 预期结果。
4. 把这一行加入 [Test Matrix](./test-matrix) 以及上面的 **最近一次 run 的概要**
   表格（状态填 `pending`）。
5. （在你真正执行它之后）录制 mp4 + cast，上传到
   `docs/public/videos/<test-id>.mp4` 与
   `docs/public/asciinema/<test-id>.cast`，并在同一 commit 里把状态
   翻成 `passing`。

## 为什么我们要让 `pending` 行始终可见

一个被搁置在 "我之后会写这个测试" 状态下的 scenario 页面会很快腐坏。
通过在 run 之前**就**把页面（包含 `pending` 状态、预期步骤、空的录制
位）提交进来，可以发生三件事：

1. 矩阵能诚实地反映覆盖率缺口。
2. 预期结果在 run *之前*就被固定下来，避免了让测试去迁就实际发生情况
   的偏差。
3. 任何人（包括未来的维护者）都可以接手一个 `pending` scenario 并执行
   它，而不必从零去构思它。
