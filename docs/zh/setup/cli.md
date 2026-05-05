# Archon CLI

> **状态：** v0.1.0 预览（占位包名 `@archon/cli` —— npm 上的最终名称尚未决定）。
>
> 这是一个仓库内薄 CLI，打包了 Archon 采用方关心的三种操作：`init`、`doctor`、`export`。它目前从 Archon 源仓库（Distilgent 宿主项目）的检出运行；通过 `npm create archon` / `npx` 自包含分发是下一个里程碑。

## 安装（本地开发）

```bash
# 从 Archon 仓库根
npm link ./tools/archon-cli
# 现在你的 PATH 上有 `archon`
archon --version
```

或者不 link 直接运行：

```bash
node tools/archon-cli/bin/archon.mjs --help
```

## 命令

### `archon init <target-dir>`

脚手架一个新的 Archon 治理项目。

```bash
archon init ../my-new-project --platform=cursor
archon init ../claude-project --platform=claude-code --overwrite
archon init ./demo --dry-run    # 显示计划，不写文件
```

输出包括六个 `.archon/` 状态文件（manifest/drift/debt/memos/decisions + soul）、平台域的 `.cursor/` 或 `.claude/` 树（commands · agents · rules · skills）、可移植 helper（`scripts/archon-check.py`、`scripts/archon-run-state.mjs` 等）、内附参考文档，以及一条 init 后横幅提醒采用方在首次 `/archon` 运行之前填哪些 manifest 区段。

### `archon doctor [project-dir]`

跨三层审计 Archon 治理项目：

- **L1 结构** —— 必需文件存在（`soul.md`、`manifest.md`、`drift.md`、`debt.md`、`memos.md`、`decisions.md`、`VERSION`、平台目录）。
- **L2 契约** —— 委派给 `scripts/archon-check.py`（可移植治理契约守卫）。传 `--python=<path>` 选特定解释器。
- **L3 提示** —— 廉价可读性信号：剩余的模板占位符、缺失的 `Validation Command`、空区段。

所有检查通过时退出码为 `0`，检测到任何 L1 或 L2 失败时为 `1`。仅警告不会让命令失败。

```bash
archon doctor .
archon doctor ../my-project --python=python3
```

### `archon export <output-dir>`

发出一个独立的 Archon kit（行为同源仓内的 `npm run archon:export`）。当你想要一个直接拷贝的 kit 而不是直接脚手架到项目里时有用。

```bash
archon export ./archon-kit-v0.1.0 --platform=cursor --overwrite
archon export ./archon-claude --platform=claude-code
```

## 共享 flag

- `--platform=<cursor|claude-code>` —— 物化哪个平台的命令/agent/规则/skill 布局（默认：`cursor`）。
- `--overwrite` —— 允许替换既有目标目录。
- `--dry-run` —— 打印计划而不写文件（`init` 与 `export` 支持）。
- `--source=<path>` —— 钉住 Archon 源仓库位置（否则从 `cwd` 向上找 `.archon/VERSION` + `scripts/export-archon-core.mjs`）。
- `--help`、`-h` —— 显示用法。
- `--version`、`-v` —— 打印 CLI 版本。

## 退出码

| 码 | 含义 |
|------|---------|
| 0    | 成功（或 dry-run 计划已打印） |
| 1    | 参数无效、找不到源仓库、export/doctor 失败 |

## 版本控制

CLI 自身版本（来自 `tools/archon-cli/package.json`）由 `archon --version` 报告。治理 kit 本身的版本（即 `init` 与 `export` 落地的内容）在运行时从 `.archon/VERSION` 读取，并在每条命令的横幅中打印。

## 尚未支持

- 自包含 npm 分发（CLI 仍需访问 Archon 源仓库的 `docs/archon/templates/` 和 `scripts/`）。计划在 v0.2.0。
- 交互提示（今天为了 CI 兼容性一切都由 flag 驱动）。
- 在 `init` 期间自定义子代理名或 lens 策展。
