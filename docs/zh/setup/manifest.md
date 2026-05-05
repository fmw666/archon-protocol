# 规范清单（Canonical Manifest）

清单是定义 Archon 安装合法构成的**唯一真相源**。它在以下地址实时发布：

> [`https://aaep.site/manifest.json`](https://aaep.site/manifest.json)

智能体协议与 CLI 均消费该文件。不存在其他权威账本；如果某个文件不在清单中，那它**就不属于 Archon**。

## Schema：`archon.manifest/v1`

```jsonc
{
  "schema": "archon.manifest/v1",
  "version": "0.1.0",                      // canonical framework version
  "generated_at": "2026-05-05T…",
  "base_url": "https://aaep.site",
  "source_root": "docs/source-files/",

  "docs": {
    "skill":     "https://aaep.site/skill.md",
    "install":   "https://aaep.site/install.md",
    "update":    "https://aaep.site/update.md",
    "sync":      "https://aaep.site/sync.md",
    "uninstall": "https://aaep.site/uninstall.md"
  },

  "runtime_ledger_paths": {
    "files":       [".archon/debt.md", ".archon/drift.md", ".archon/manifest.md", "..."],
    "directories": [".archon/debt/", ".archon/drift/", ".archon/runs/", "..."]
  },

  "placeholders": {
    "PROJECT_NAME": { "description": "...", "required": true, "example": "Acme" },
    "TECH_STACK":   { "description": "...", "required": true, "example": "Node.js + React" },
    "DOMAIN":       { "description": "...", "required": false, "example": "saas-platform" },
    "OWNER":        { "description": "...", "required": true, "example": "Acme Inc." },
    "PROJECT_SLUG": { "description": "...", "required": false, "derived_from": "PROJECT_NAME" }
  },

  "totals": { "modules": 14, "files": 82 },

  "modules": [
    {
      "id": "core-soul",
      "title": "Cognitive core (soul)",
      "description": "The soul defines who the agent is: identity, cognitive loop, ...",
      "required": true,
      "file_count": 11,
      "files": [
        {
          "path":   ".archon/soul.md",                              // where to write
          "url":    "https://aaep.site/source-files/.archon/soul.md", // where to fetch
          "sha256": "abcdef...",
          "bytes":  12345,
          "placeholders": ["PROJECT_NAME"]  // present only when the file contains tokens
        }
        // ... more files
      ]
    }
    // ... more modules
  ]
}
```

## 模块（Modules）

当前清单包含 14 个模块 —— 11 个必装，3 个可选。

| id | 是否必装 | 内容 | 运行时依赖 |
|----|:--------:|------|-----------|
| `core-soul` | ✓ | `.archon/soul.md` 与各模式扩展 | 无 |
| `core-contracts` | ✓ | `governance-contract.yaml` | 无 |
| `core-templates` | ✓ | `run.template.md` 与 `run-state.schema.json` | 无 |
| `core-version` | ✓ | `.archon/VERSION` | 无 |
| `domain-lenses` | ✓ | 5 个领域透镜 + 16 个决策工具 | 无 |
| `commands` | ✓ | IDE 命令（`archon`、`archon-plan`、…） | 无 |
| `agents` | ✓ | 子智能体（`archon-reviewer`、`archon-capture-auditor`） | 无 |
| `rules` | ✓ | 常驻规则（`archon.mdc`、wake、heartbeat） | 无 |
| `skills` | ✓ | 关键字 / 文件触发的 skills | 无 |
| `scripts` | ✓ | Python `archon-check.py`（仅依赖标准库） + Bash 包装脚本 | Python 3（仅在调用时） |
| `legal` | ✓ | LICENSE 与 NOTICE | 无 |
| `cli` | 可选 | Archon CLI 源码（`tools/archon-cli/`） | **Node ≥ 18** |
| `dashboard` | 可选 | 本地可观测性 UI | **Node ≥ 18** |
| `extensions-demand-pool` | 可选 | 待办队列扩展 | 无 |

必装模块始终安装。可选模块通过 `--with=<list>` 或交互式提示进行选择。

> **Archon 框架本身不依赖 Node.js。** 仅 `cli` 与 `dashboard` 模块需要 Node，且两者均为可选。
> 仅当你实际调用 `scripts/archon-check.py`（例如作为 pre-commit 钩子）时才需要 Python 3；
> 框架自身的 install / update / sync / uninstall 协议并不会运行它。

## IDE 平台绑定 {#ide-platforms}

Archon **平台中立**。无论你使用哪种 AI 编码 IDE，`.archon/` 下的框架核心都是相同的；
仅有**绑定目录**不同。清单中四个绑定模块（`commands`、`agents`、`rules`、`skills`）的规范路径
使用 `.cursor/`；智能体与 CLI 在写入时会将该前缀重写为检测到的平台对应值。

| 检测到的特征 | `$IDE_PLATFORM` | `$BINDING_ROOT` | 清单路径 → 写入路径 |
|--------------|-----------------|-----------------|---------------------|
| 存在 `.cursor/` | `cursor` | `.cursor/` | `.cursor/foo` → `.cursor/foo` |
| 存在 `.codex/` 或 `AGENTS.md` | `codex` | `.codex/` | `.cursor/foo` → `.codex/foo` |
| 存在 `.claude/` 或 `CLAUDE.md` | `claude` | `.claude/` | `.cursor/foo` → `.claude/foo` |
| 存在 `.continue/` | `continue` | `.continue/` | `.cursor/foo` → `.continue/foo` |
| 存在 `.aider.conf.yml` 或 `.aider/` | `aider` | `.aider/` | `.cursor/foo` → `.aider/foo` |
| 存在 `.windsurf/` | `windsurf` | `.windsurf/` | `.cursor/foo` → `.windsurf/foo` |
| 以上均无 | — | — | 询问用户 |

检测优先级与重写规则定义于
[`skill.md` §3](https://aaep.site/skill.md)（智能体侧）与 CLI 的 `lib/install.mjs`（CLI 侧）；
两者遵循相同逻辑，因此最终生成的目录树完全一致。

## Pre-commit 钩子实现 {#hook-implementations}

`scripts` 模块提供**两种**便携合规检查器实现。**没有 Node 实现**：

| 文件 | 语言 | 适用场景 |
|------|------|----------|
| `scripts/archon-check.py` | Python 3，仅依赖标准库 | 参考实现。任何能运行 Python 3 的环境都能用（任意操作系统，无需 `pip install`）。 |
| `scripts/archon-check.sh` | POSIX shell | 委托给 `archon-check.py` 的包装脚本。当项目的 pre-commit 基础设施期望使用 shell 脚本时使用。 |

智能体或 CLI 会根据你的开发环境挑选合适的钩子命令：

| 开发环境 | 钩子命令 |
|----------|---------|
| PATH 中有 Python 3（Linux / macOS / WSL） | `python3 scripts/archon-check.py --root .` |
| Unix 上同时具备 Bash 与 Python 3 | `sh scripts/archon-check.sh .` |
| Windows 通过 `py` 启动器调用 Python | `py -3 scripts\archon-check.py --root .` |
| 没有可用的 Python | 跳过钩子；建议手动运行 `archon sync` |

具体接入方案（Python `pre-commit` 框架、纯 git hook、Node 项目上的 husky）记录于
[Quickstart 第 4 步](/zh/setup/quickstart#step-4)。

## 为什么发布清单而不是发布压缩包？

1. **透明** —— 任何人都可以 `cat manifest.json | jq` 直接看到框架交付了什么。没有不透明的压缩二进制块。
2. **增量更新** —— 智能体与 CLI 仅拉取当前与规范版本之间存在差异的文件，而非整个框架。
3. **校验和优先** —— 清单中携带的 sha256 让传输中途的截断也能在写入前被发现。
4. **模块粒度** —— 可逐文件选择是否启用可选模块。
5. **镜像友好** —— 通过 `--base-url=` 或 `ARCHON_BASE_URL` 覆写 `base_url` 即可托管私有镜像。
   即便文件全量铺开，JSON 体积也很小（< 100 KB）。

## 清单是如何生成的

清单在每次文档站点构建时通过 `archon-protocol` 仓库中的
[`scripts/build-manifest.mjs`](https://github.com/fmw666/archon-protocol/blob/main/scripts/build-manifest.mjs)
重新生成。它扫描 `docs/source-files/`，逐文件计算 sha256，识别 `{{PLACEHOLDER}}` 占位符，
并写出：

- `docs/public/manifest.json`（在 `/manifest.json` 提供访问）
- `docs/public/source-files/**`（镜像原始字节，供智能体 / CLI 拉取）

版本号取自源码树中的 `.archon/VERSION`。

## Schema 版本演进

`archon.manifest/v1` 已稳定。未来如果发布 `v2` schema，将以另一个 URL（`manifest-v2.json`）提供；
旧版智能体 / CLI 在显式选择升级之前，仍可继续使用 `manifest.json`（= v1）。

## 检视线上清单

```bash
curl -s https://aaep.site/manifest.json | jq '.totals, .modules[].id'
```

或直接浏览 JSON：
[`https://aaep.site/manifest.json`](https://aaep.site/manifest.json)

## 相关文档

- [安装协议](/zh/setup/install) —— 首次安装时如何消费清单。
- [更新协议](/zh/setup/update) —— 如何将与清单的差异转化为更新计划。
- [同步协议](/zh/setup/sync) —— 清单如何驱动漂移健康检查。
