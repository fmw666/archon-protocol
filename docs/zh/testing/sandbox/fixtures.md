---
title: 测试 Fixtures
outline: deep
---

# 测试 Fixtures

sandbox 测试所安装到的四个最小化项目。它们位于本仓库的
[`fixtures/`](https://github.com/fmw666/archon-protocol/tree/main/fixtures)
目录下（每个 fixture 所遵循的约定见
[`fixtures/README.md`](https://github.com/fmw666/archon-protocol/blob/main/fixtures/README.md)）。

> **这些 fixtures 都没有安装 Archon。** 它们是干净的
> "before"（安装前）快照。一次 sandbox 测试以将其中之一复制
> 到临时目录开始，然后对该副本执行安装协议。

## sandbox-node-ts

最常见的接入方形态：使用 TypeScript 与 Vitest 的 Vite / Next /
Express 风格 Node 项目。

| | |
|---|---|
| 路径 | `fixtures/sandbox-node-ts/` |
| 模拟身份 | `acme-todos` |
| 工具链 | Node 20 · TypeScript 5 · Vitest |
| 校验命令 | `npm run validate`（即 `tsc --noEmit` + `vitest run`） |
| Pre-commit hook 形式 | `husky` + `archon-check.py` |
| 使用该 fixture 的 scenario | 01、05、07、08、09、10、12 |

```text
fixtures/sandbox-node-ts/
├── README.md
├── package.json
├── tsconfig.json
└── src/
    ├── todo.ts
    └── todo.test.ts
```

Vitest 测试在干净检出时即可通过；这就是 scenario 01 与 07 中
安装后的 validate 关卡所要执行的内容。

## sandbox-python

证明 Archon 能干净地安装到 **非 JS 项目** 上。Agent 必须为 hook
选择 Python 的 `pre-commit` 框架路径，且不能假设 `package.json`
存在。

| | |
|---|---|
| 路径 | `fixtures/sandbox-python/` |
| 模拟身份 | `pyflux` |
| 工具链 | Python 3.10+ · pytest · ruff |
| 校验命令 | `python -m pytest && ruff check .` |
| Pre-commit hook 形式 | [`pre-commit`](https://pre-commit.com) 框架 |
| 使用该 fixture 的 scenario | 02、06、11 |

```text
fixtures/sandbox-python/
├── README.md
├── pyproject.toml
├── src/
│   └── calculator.py
└── tests/
    └── test_calculator.py
```

## sandbox-go

证明 Archon 能安装到 **编译型语言技术栈** 上，以 `go test` 作为
校验命令，除契约检查器本身外，不依赖 Node，也不依赖任何
Python 框架。

| | |
|---|---|
| 路径 | `fixtures/sandbox-go/` |
| 模拟身份 | `goping` |
| 工具链 | Go 1.22+ · 标准库 testing |
| 校验命令 | `go test ./... && go vet ./...` |
| Pre-commit hook 形式 | 纯 `.git/hooks/pre-commit` shell 脚本 |
| 使用该 fixture 的 scenario | 03 |

```text
fixtures/sandbox-go/
├── README.md
├── go.mod
├── main.go
└── main_test.go
```

这是 **可能存在的最小 Archon 接入方** —— 除 `go.mod` 外没有
语言级的包管理器文件，除标准库外也没有任何测试框架。如果
安装在这里能跑通，那么在任何普通仓库上都能跑通。

## sandbox-rust

证明 Archon 能安装到 **系统级语言技术栈** 上，并演练
**Aider 纯终端流程**（没有 IDE 聊天面板 —— 与 agent 的
交互完全在终端分屏中进行）。

| | |
|---|---|
| 路径 | `fixtures/sandbox-rust/` |
| 模拟身份 | `rustyq` |
| 工具链 | Rust 1.78+ stable · cargo test |
| 校验命令 | `cargo test && cargo clippy -- -D warnings` |
| Pre-commit hook 形式 | 纯 `.git/hooks/pre-commit`，调用 `python3 scripts/archon-check.py` |
| 使用该 fixture 的 scenario | 04 |

```text
fixtures/sandbox-rust/
├── README.md
├── Cargo.toml
└── src/
    └── lib.rs       ← 单元测试内联（Rust 惯例）
```

## 为什么是这四个（而不是八个）

| 技术栈类别 | 已覆盖 fixture | 尚未覆盖 |
|--------------|------------|------------------|
| 脚本 / Web（JS/TS） | sandbox-node-ts | — |
| 脚本 / 数据（Python） | sandbox-python | — |
| 编译 / 后端（Go） | sandbox-go | Java · Kotlin |
| 系统级（Rust） | sandbox-rust | C++ · Swift |

这四个 fixture 覆盖了约 90% 的真实接入面。当真正的接入方
出现时，再补 Java / Kotlin / C++ / Swift 成本很低；但在那之前，
它们将是 **没有任何测试记录的 fixture** —— 这正是我们想要
避免的腐坏。

如果你需要一个目前还不存在的 fixture，请遵循
[`fixtures/README.md`](https://github.com/fmw666/archon-protocol/blob/main/fixtures/README.md)
中 "Adding a new fixture" 一节，并为它配套至少一个 matrix
scenario。

## 如何获取 fixture 用于本地测试

要么克隆本仓库并复制 fixture，要么仅下载 fixture 子树：

```bash
git clone https://github.com/fmw666/archon-protocol.git /tmp/archon-protocol
cp -r /tmp/archon-protocol/fixtures/sandbox-node-ts /tmp/archon-test-001
cd /tmp/archon-test-001
git init && git add . && git commit -m "init fixture v0.0.0"

# now run the scenario steps from /testing/sandbox/scenarios/install-cursor-node
```

将该 tmp 副本视为一次性使用 —— 每次新的测试运行都从 fixture
重新创建它，让先前的状态永远不会泄漏过来。
