# 5 分钟快速开始

> 从「我有一个项目」到「Archon 在它里面跑起来了」的最短路径。需要长篇参考请读
> [完整安装指南](/zh/setup/full-guide)；需要跨整个采用方生命周期的端到端故事请读
> [完整生命周期](/zh/setup/lifecycle)。

![漫画图解：5 分钟快速开始](/images/quickstart/01-quickstart-map.png)

**开始之前**，请确认你已具备：

- 任意一个 AI 结对编程 agent —— 见下方[受支持的平台](#step-1-install)。
- 一个 git 跟踪的项目（工作树干净）。
- Python 3（用于运行可移植治理检查器 `scripts/archon-check.py`）。
  可选：Node ≥ 18，仅当你想要可选的 CLI / dashboard 模块时才需要。
- 约 10 分钟。前 3 分钟是安装，后 7 分钟是接线 + 跑一个真实 demand。

---

## 步骤 1 — 安装 Archon（约 3 分钟）{#step-1-install}

你有两条等价路径。**除非你身处 CI，否则选 A。**

### 路径 A — 直接对你的 agent 说话（推荐）

第一次时，本地 agent 完全不知道 Archon 是什么，所以
prompt **必须包含一个 URL**。安装完成后，`archon-wake.mdc`（或它在对应平台的等价物）
会自动加载，后续 prompt 不再需要 URL。

具体的一行命令取决于你的 IDE —— 但 **prompt 本身在所有平台上完全一致**；
变化的只是聊天面板的位置：

#### 如果你用 Cursor

1. 在 Cursor 中打开项目。
2. 按 `Ctrl+L`（或 `Cmd+L`）打开聊天面板。
3. 粘贴并发送：

```text
read aaep.site/skill.md and install archon
```

Archon 的绑定会落到 `.cursor/`。

#### 如果你用 Claude Code

1. 在终端中打开项目。
2. 运行 `claude` 启动 Claude Code 会话。
3. 粘贴并发送：

```text
read aaep.site/skill.md and install archon
```

Archon 的绑定会落到 `.claude/`，并在 `CLAUDE.md` 中引用已加载的 rules。

#### 如果你用 OpenAI Codex CLI

1. 在终端中打开项目。
2. 运行 `codex` 启动 Codex 会话。
3. 粘贴并发送：

```text
read aaep.site/skill.md and install archon
```

Archon 的绑定会落到 `.codex/`（或并入你已有的 `AGENTS.md`）。

#### 如果你用 Continue

1. 在装有 Continue 的 VS Code（或 JetBrains）中打开项目。
2. 打开 Continue 聊天面板。
3. 粘贴并发送：

```text
read aaep.site/skill.md and install archon
```

Archon 的绑定会落到 `.continue/`。

#### 如果你用 Aider

1. 在项目根目录运行：

```bash
aider --message "read aaep.site/skill.md and install archon"
```

Archon 的绑定会落到 `.aider/`。

#### 如果你用 Windsurf

1. 在 Windsurf 中打开项目。
2. 打开 Cascade 聊天面板。
3. 粘贴并发送：

```text
read aaep.site/skill.md and install archon
```

Archon 的绑定会落到 `.windsurf/`。

#### 如果你用其他任意编程 agent

如果你的 agent 平台支持 web-fetch + file-write 工具，同样的 prompt
依然有效：

```text
fetch aaep.site/skill.md and follow it to install archon in this project; if
you cannot infer my IDE platform, ask me which binding directory to use
```

agent 会读取 `skill.md` §3，问你它检测不到的平台信息，
并据此写入绑定。

### agent 按顺序做什么

无论平台如何，agent 的协议都完全一致：

1. 拉取 [`aaep.site/skill.md`](https://aaep.site/skill.md) 并路由到 install。
2. 拉取 [`aaep.site/manifest.json`](https://aaep.site/manifest.json) —— 这是
   规范化的文件清单（每个文件的 sha256、模块列表、占位符）。
3. **检测你的 IDE 平台**与绑定目录（依据 `skill.md` §3）。
4. **检视你的项目** —— `package.json` / `pyproject.toml` / `go.mod`、
   README、已存在的绑定目录。
5. **问 3-4 个问题** —— 项目名、技术栈、可选模块
   （CLI / dashboard / demand-pool），然后展示计划。
6. **并行拉取所有必需文件** —— 在 *写入之前* 对照 manifest 做 sha256 校验。
   下载途中的损坏不可能发生。
7. **替换占位符** —— `{{PROJECT_NAME}}`、`{{TECH_STACK}}` 等等，
   用你的回答填上。
8. **写出整棵树** —— `.archon/` + `<binding-root>/` + `scripts/`。
   非 Cursor 平台会自动把路径前缀从 `.cursor/` 重写为 `<binding-root>/`。
9. **种入空的运行时账本** —— `drift.md`、`debt.md`、`memos.md` 等。
10. **登记此次 install** —— 在 `.archon/drift.md` 追加一条记录。
11. **汇报** —— 简明摘要 + 后续步骤。

agent 永远不会写出半成品 install。要么所有文件都校验通过、整棵树落地，
要么什么都不写。

### 路径 B — CLI（脚本化、无对话）

> CLI 是 **可选** 的，且 **需要 Node ≥ 18**。如果你的项目不是 Node 项目
> 且不希望引入 Node 工具链，请跳过此路径。

```bash
# 交互式：安装到当前目录
npx @archon/cli@latest install

# 非交互式：安装所有模块（含可选模块）
npx @archon/cli@latest install ./my-project --with=all --yes

# 仅预览：展示计划，不写任何文件
npx @archon/cli@latest install --dry-run
```

CLI 消费的是与 agent **同一份 manifest**，产出的是 **同一棵树**。
按你的环境选择即可。

> 自建私有镜像？用 `--base-url=` 或 `ARCHON_BASE_URL` 环境变量
> 覆盖基础 URL。manifest 中每个文件的 URL 都会被重写到你的镜像。

完成此步后，你的仓库新增：

```
.archon/ <binding-root>/ scripts/
```

（`<binding-root>` 在 Cursor 上是 `.cursor/`、Claude Code 上是 `.claude/`，
其余依此类推 —— 见上方平台对照。）

![漫画图解：把 Archon 落到你的项目里](/images/quickstart/02-drop-in.png)

---

## 步骤 2 — 填写你的项目 manifest（约 90 秒）

install 已经种入了一份空的 `.archon/manifest.md`。打开它，至少填好：

- **§Platform path mappings** —— 确认这个项目使用的是哪个 IDE 绑定文件夹
  （agent 已经写过了；只需要核对它与现实是否一致）。
- **§Tech Stack** —— 你的语言 / 框架 / 包管理器。
- **§Validation Command** —— 一条 **单一命令**，跑 lint + typecheck
  + test。这是 Archon 的 validate gate 在每次 Close-Out 时会调用的命令。
  示例：`npm run validate`（Node）、`pytest`（Python）、`go test ./...`
  （Go）、`cargo test`（Rust）、`mvn verify`（Java/JVM）、`swift test`（Swift）、
  `make validate`（任意）。

其余的暂时留空。Archon 会随你使用而生长这些区段。

![漫画图解：项目状态文件](/images/setup/03-project-state.png)

> 提示：编辑后，问你的 agent *"is archon healthy?"* —— Archon 的 L3
> 提示层会标出任何未填的占位符。

---

## 步骤 3 — 接通 validate 命令（约 60 秒）

如果 validate gate 不能被调用，它就毫无用处。从一个干净的 shell 中
运行你的命令并确认它通过 —— 用你的项目栈所提供的任何方式：

```bash
# Node
npm run validate

# Python
pytest

# Go
go test ./...

# Rust
cargo test

# Java / JVM
mvn verify

# 任意（例如基于 Make 的项目）
make validate
```

如果你的项目还没有一条复合命令，先加一条。Node 项目示例：

```json
{
  "scripts": {
    "validate": "npm run lint && npm run typecheck && npm run test"
  }
}
```

其他技术栈，加一个 Makefile target、`pyproject.toml` script 等等。

![漫画图解：validation 命令](/images/setup/07-validate-command.png)

如果它是红的，先把已有错误修掉。Archon 拒绝在 validate gate 红时 Close-Out。

---

## 步骤 4 — pre-commit 钩子（约 60 秒）

Archon 的可移植 pre-commit 检查器（`scripts/archon-check.py`）会拦截
跳过 Decision Gate 或 Close-Out 的提交。随附的检查器是 **Python**
（仅依赖 stdlib）—— 不需要 Node。挑一种与你项目已有 pre-commit 基础设施
匹配的接线方式：

### 选项 1 — Python `pre-commit` 框架（Python 项目推荐）

如果你的项目已经在用 [`pre-commit`](https://pre-commit.com/)，在
`.pre-commit-config.yaml` 中加一个本地 hook：

```yaml
repos:
  - repo: local
    hooks:
      - id: archon-check
        name: archon-check
        entry: python3 scripts/archon-check.py --root .
        language: system
        pass_filenames: false
        stages: [pre-commit]
```

然后执行 `pre-commit install`。

### 选项 2 — 朴素 git hook（适用于任意项目）

```bash
mkdir -p .git/hooks
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh
exec python3 scripts/archon-check.py --root .
EOF
chmod +x .git/hooks/pre-commit
```

在 Windows 上（Git Bash 用法相同；原生 PowerShell 用以下方式）：

```powershell
@'
@echo off
py -3 scripts\archon-check.py --root .
'@ | Out-File -Encoding ascii .git\hooks\pre-commit.cmd
```

### 选项 3 — husky（仅当 Node 项目已经在用它时）

```bash
npx husky install
echo 'sh scripts/archon-check.sh .' > .husky/pre-commit
chmod +x .husky/pre-commit
```

> **不要** 仅仅为了安装这个 hook 就把 husky 加进非 Node 项目 ——
> 选项 1 和 2 更轻、且不引入 Node 依赖。

![漫画图解：pre-commit 闸门](/images/setup/08-pre-commit-gates.png)

用 `git commit --dry-run` 验证 —— hook 会触发，并报告 pass / fail。

---

## 步骤 5 — 唤醒 Archon 并跑你的第一个 demand（约 2 分钟）

重新加载你的 IDE 聊天面板（让新绑定生效），然后说：

```text
hi archon, run a plan for adding a health-check endpoint
```

> 这次不需要 URL —— `archon-wake.mdc`（或它在对应平台的等价物）
> 现在已经被加载到 agent 每次会话的上下文中，wake 短语
> 不再需要引导 fetch 就能正确路由。

Archon 会：

1. 加载 `soul.md` + `manifest.md`，扫描 memos 寻找相关 vetoes。
2. 跑 **Decision Gate** —— 探测 Radius（爆炸半径）、Soul-headroom
   （认知预算）、Modularity（合适粒度）。给出关于 *该不该做 / 多大 / 谁来定*
   的 Verdict。
3. 仅当 gate 无法自动解决时才追问澄清问题。
4. 一旦你批准计划，执行 → 跑 validate → 走到 Close-Out，并对治理文档
   做 mirror-check。

![漫画图解：run-state 生命周期](/images/setup/09-run-state-lifecycle.png)

第一次 demand 循环就是你的「Boot」—— 每个阶段的细节请读
[完整生命周期](/zh/setup/lifecycle)。

---

## 你完成了

到这里你已经拥有：

- `.archon/` 含活的状态文件与可移植框架核心。
- `<binding-root>/` 中的 IDE 绑定（`.cursor/` / `.claude/` / `.codex/` /
  `.continue/` / `.aider/` / `.windsurf/`）。
- 一条 Archon gate 会调用的 validate 命令。
- 一个基于 Python 的 pre-commit 钩子，拦截被跳过的治理。
- 至少一次交付被记录在 `drift.md` 中。

### 常见的下一步

| 意图 | 页面 |
|------|------|
| 理解刚才发生了什么 | [10 分钟概览](/zh/concepts/overview) |
| 看完整的采用方生命周期 | [完整生命周期](/zh/setup/lifecycle) |
| 深挖架构 | [架构参考](/zh/concepts/architecture) |
| 学习 Archon 解决的 16 个 AI 编程坑 | [User Journeys](/zh/concepts/user-journeys) |
| 上线一个 domain lens | [完整安装指南 §可选增强](/zh/setup/full-guide#step-4-optional-enhancements) |
| 之后 update / sync / uninstall | [生命周期命令](/zh/setup/lifecycle#lifecycle-commands) |

### 故障排查

| 现象 | 可能原因 | 修复 |
|------|----------|------|
| agent 说 "I don't have web fetch" | 你的 IDE 没启用 URL-fetch 工具 | 改用 **路径 B（CLI）**，前提是你有 Node ≥ 18 |
| 我用的是 Claude Code，但 agent 装到了 `.cursor/` | agent 跳过了 IDE 检测 | 用更明确的指令重跑：*"install archon; my IDE is Claude Code so use `.claude/`"* |
| 说 "hi archon" 时 Archon 没醒 | IDE 的 rules/skills 没被装上 | 重跑 install；确认 `<binding-root>/rules/archon-wake.mdc` 存在 |
| Decision Gate 抱怨 manifest | `.archon/manifest.md` 是空的 | 把三个必填区段填好（步骤 2） |
| pre-commit 钩子从不触发 | hook 没装上、或没可执行权限 | 见 [步骤 4](#step-4) —— 按你项目已有的 pre-commit 基础设施挑对应选项 |
| `archon-check.py: command not found` | Python 3 不在 PATH 上 | 装 Python 3（仅依赖 stdlib —— 不需要 `pip install`）；Windows 上用 `py` 启动器 |
| validate 总是红的 | 已有的 lint/type/test 错误 | 先把它们修了；validate 红时 Archon 不会 Close-Out |
| install 报告 sha256 不匹配 | 网络损坏或过期 CDN 缓存 | 重跑 install；如果一直如此，请连同 manifest URL 与有问题的文件提交 issue |
