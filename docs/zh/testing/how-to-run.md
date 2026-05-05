---
title: 在你的项目中运行
outline: deep
---

# 在你的项目中运行

为采用 Archon 的项目提供一条最小可行的门控链，前提是你已经运行 `archon init` 并完整落地了套件。

## 前置条件

- Node ≥ 18（用于 `.mjs` 可移植辅助脚本和 CLI）。
- Python 3（用于 `archon-check.py`）。Bash 用户可改用 `archon-check.sh`。
- 你项目自身的 lint / typecheck / test 命令。

## 步骤 1 — init 完成后立即运行 L1

```bash
archon doctor .
```

预期输出：

```
[L1 Structural]
  [OK]   .archon/soul.md
  [OK]   .archon/manifest.md
  ...
[L2 Contract]
[archon-check] OK: portable governance contract checks passed.
  [OK]   archon-check.py passed.
[L3 Hints]
  [WARN] 55 unfilled `<!-- ... -->` placeholders in manifest.md — fill at least Product / Tech Stack / Validation Command before the first delivery.
```

在你填写 manifest 之前出现警告是正常的。

## 步骤 2 — 填写 manifest 的 Validation Command

打开 `.archon/manifest.md`，声明项目的校验命令。以典型的 Node 栈为例：

```md
## Validation Command

`npm run validate` covers: eslint · tsc --noEmit · vitest run · bundle budget check.
```

然后添加对应的 npm 脚本：

```jsonc
{
  "scripts": {
    "validate": "npm run archon:records:check && npm run archon:check && eslint . && tsc --noEmit && vitest run",
    "archon:records:check": "node scripts/archon-records.mjs check-all",
    "archon:check": "python scripts/archon-check.py --root ."
  }
}
```

## 步骤 3 — 接入 pre-commit 钩子

Archon 套件中自带 `.husky/pre-commit`。如果你使用 [`husky`](https://typicode.github.io/husky/)，在 `package.json` 中加入：

```jsonc
{
  "scripts": {
    "prepare": "husky"
  }
}
```

随后 `npm install` 即可激活 pre-commit 门控。

不使用 husky 时的手动安装：

```bash
cp .husky/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

## 步骤 4 — 验证链路运行

```bash
npm run validate
```

全部通过意味着：

- Records 热索引与 records 目录一致（ADR-22）。
- 满足 portable contract。
- 你自己的 lint/typecheck/test 通过。

## 故障排查

### `archon-check.py` 报告 `forbidden_substrings`

你或代理把宿主项目名（或在 `manifest.md § Universal Module Guard` 中声明的项目专属术语）写进了某个通用的 Archon 文件。两种处理方式：

1. 把该提及移出通用文件；或
2. 如果该术语已不再是项目专属的，从 `manifest.md` 的 `forbidden_terms` JSON 数组中移除它。

### `lint-integrity.mjs` 报告交叉引用断裂

运行：

```bash
node scripts/lint-links.mjs
```

它会暴露所有无法再解析的内部链接。常见原因：

- 文档被重命名，但反向引用未同步更新。
- 标题锚点形状变了（例如新增了 em-dash 或换了标点）。交叉链接优先使用最近的、纯 ASCII 的稳定父级标题。

### `archon:verify`（claim verifier）失败

某个治理文档声称某机制存在，但探针找不到它。两种处理方式：

- 修正文字（机制已被移除或改名）；或
- 修正探针（机制仍在但位置变了 — 更新 `soul/delivery.md § Claim Verifier` 中的探针锚点）。

这正是 ADR-27 循环的体现：文字描述与实际机制必须在机械层面保持一致。

## 升级到完整 L3

当你自己的测试套件足够成熟时，把它加入 `Validation Command`，让 pre-push 钩子（或 CI）运行 `npm run validate`。这一条命令就是你完整的三层门控。
