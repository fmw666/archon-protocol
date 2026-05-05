---
title: "sandbox runner 工作原理"
description: "架构、本地调用、CI，以及通往真实 agent SDK adapter 的路径。"
---

# sandbox runner 工作原理

sandbox runner（[`scripts/sandbox-run.mjs`](https://github.com/fmw666/archon-protocol/blob/main/scripts/sandbox-run.mjs)）
是让 [Sandbox 测试](/zh/testing/sandbox/) 一节**真实有效**的关键组件，
而不是堆满 `pending` 复选框的一面墙。本页讲解它的架构、如何在本地运行、
它在 CI 中如何运转，以及在不修改 runner 核心的前提下新增 adapter
（Cursor SDK、Claude Code SDK、Codex CLI）所遵循的契约。

---

## 心智模型

```
            ┌────────────────────────────────────────────────────┐
            │  scripts/sandbox-run.mjs (entry)                   │
            │   ─ parse flags                                    │
            │   ─ start local mirror of docs/public/             │
            │   ─ for each scenario:                              │
            │       copy fixture → tmp dir                        │
            │       run prerequisites via CliAdapter              │
            │       run main steps via Cli|AgentAdapter           │
            │       run assertions against tmp dir                │
            │       write JSON record + update index              │
            └────────────────────────────────────────────────────┘
                          │
              ┌───────────┴───────────┐
              ▼                       ▼
    scripts/sandbox/                docs/testing/sandbox/runs/
      adapters/cli.mjs                <test-id>/<ts>.json     ← single source
      adapters/agent.mjs              index.json              ← of truth
      assertions.mjs
      scenarios.mjs (parser)
      results.mjs (JSON writer)
      local-server.mjs
      shared.mjs
```

runner **自身没有任何测试代码** —— 每条断言都声明在 scenario 的
`<!-- sandbox-spec:start --> ... <!-- sandbox-spec:end -->` 区块中。
这样人类可读的 scenario 页面（`## Steps`、`## Expected outcome`）
和机器可读的 spec 就**并排存在**于同一个 Markdown 文件里。

---

## scenario 契约

[`docs/testing/sandbox/scenarios/`](https://github.com/fmw666/archon-protocol/tree/main/docs/testing/sandbox/scenarios)
下的每个页面，都包含一段位于 `<!-- sandbox-spec:start -->` 与
`<!-- sandbox-spec:end -->` 标记之间的 JSON 区块。runner 只消费这个区块；
周边的散文是给人类看的。

Schema：

```json
{
  "runnable": "cli | agent | both | manual",
  "fixture": "fixtures/sandbox-node-ts",
  "ide_platform": "cursor | claude | codex | aider",
  "prerequisites": [
    { "name": "...", "cli": "install", "flags": ["--with=cli"] }
  ],
  "steps": [
    { "name": "...", "cli": "<subcommand>", "flags": [...] },
    { "name": "...", "cmd": ["node", "-e", "..."] },
    { "name": "...", "append_to_file": { "path": "...", "content": "..." } },
    { "name": "...", "write_file": { "path": "...", "content": "..." } },
    { "name": "...", "agent": "install" }
  ],
  "assertions": [
    { "file_exists": "<rel>" },
    { "file_absent": "<rel>" },
    { "dir_exists": "<rel>" },
    { "dir_absent": "<rel>" },
    { "file_contains": { "path": "<rel>", "substr": "..." } },
    { "file_matches": { "path": "<rel>", "regex": "^v0\\.1\\." } },
    { "sha256_equals": { "path": "<rel>", "sha256": "..." } },
    { "cmd_zero": ["python3", "scripts/archon-check.py", "--root", "."] },
    { "cmd_nonzero": ["..."] },
    { "git_clean": true }
  ],
  "notes": "free-form context for the row"
}
```

`runnable` 控制 runner 使用哪个 adapter：
- `cli` —— 驱动本地 Archon CLI；一切都是机械化的。
- `agent` —— 需要一个 coding agent。在没有 SDK adapter 的情况下（即当前状态），
  `runnable: agent` 的 scenario 会记录为 `result: "manual"`。
- `both` —— 对每个可用 adapter 各跑一次（未来）。
- `manual` —— 明确不在自动化范围内。

---

## adapter

### CliAdapter（[`scripts/sandbox/adapters/cli.mjs`](https://github.com/fmw666/archon-protocol/blob/main/scripts/sandbox/adapters/cli.mjs)）

为每个 `cli` 步骤 spawn `node tools/archon-cli/bin/archon.mjs <subcommand> <projectRoot>
--yes --base-url=<local-mirror>`，并提供内联文件原语
（`append_to_file`、`write_file`）以及任意 `cmd` 数组，用于跨平台、
不依赖 shell 的命令执行。

local mirror 是一个极小的静态 HTTP 服务器
（[`local-server.mjs`](https://github.com/fmw666/archon-protocol/blob/main/scripts/sandbox/local-server.mjs)），
它 serve `docs/public/`，让 sandbox 可以验证文档站点正在发布的**确切**那份
manifest，而不依赖 CI 能够访问 `aaep.site`。

### AgentAdapter（[`scripts/sandbox/adapters/agent.mjs`](https://github.com/fmw666/archon-protocol/blob/main/scripts/sandbox/adapters/agent.mjs)）

一个轻量调度器。它根据 scenario 的 `ide_platform` 选择一个 **provider**
（可通过 `ARCHON_AGENT_PROVIDER` 环境变量覆盖），并把 `runStep` 转发给它。
每个 provider 位于
[`scripts/sandbox/adapters/providers/`](https://github.com/fmw666/archon-protocol/tree/main/scripts/sandbox/adapters/providers)
下，遵循以下契约：

```js
{
  name,                                    // 'cursor' | 'claude' | ...
  isAvailable(): { ok, reason? },          // sync, cheap (env / SDK present?)
  async runStep(step, ctx)                 // ctx = { projectRoot, baseUrl,
                                           //         manifestVersion, ide }
    -> { code, stdout, stderr,
         manual?, toolEdits? }
}
```

当前已注册的：

| Provider | 实现 | 当 `ide_platform` 为以下值时触发 |
| --- | --- | --- |
| `cursor` | **真实**，使用 [`@cursor/sdk`](https://www.npmjs.com/package/@cursor/sdk) | `cursor` |
| `claude` | Manual fallback | `claude` |
| `codex` | Manual fallback | `codex` |
| `aider` | Manual fallback | `aider` |
| 其他任何值 | Manual fallback（按 name） | 其余情况 |

只要 provider 不可用（无 API key、未安装可选 SDK 包、宿主机上的 native 依赖
未编译、SDK 抛出 `AuthenticationError` 等），该步骤就会被记录为
`manual: true` 并附带人类可读的 `reason`，scenario 的 `result` 会变成
`manual` 而非 `failing`。当 `CURSOR_API_KEY` 缺失时 CI 不会崩溃 ——
它只会回退到文档化的人工证据路径。

#### Cursor provider 深入剖析

Cursor provider 以 **local mode** 运行 SDK，因此 agent 直接在 sandbox 的
tmp 项目目录上操作。它不会创建云端 VM，也永远不会触碰源码仓库。

参考 [Cursor 的 SDK 文档](https://cursor.com/docs/sdk/typescript)：

- `Agent.create({ apiKey, model: { id: 'composer-2' }, local: { cwd, settingSources: ['project'] } })`
  会加载 fixture 的 `.cursor/rules/`、`.cursor/commands/`、
  `.cursor/skills/`、`.cursor/agents/` 与 `.cursor/mcp.json`。这正是
  Archon 仓库侧的 `archon-wake.mdc` 规则与 `archon.md` 命令无需我们重新
  上传就能到达 agent 的方式。
- `await run.wait()` 返回一个 `RunResult`，其 `status` 为
  `'finished' | 'error' | 'cancelled'`。provider 把它们映射到数字 exit code
  （`0`、`1`、`124`），从而让 runner 在 CLI / agent 路径之间保持统一。
- `run.stream()` 会被并发消费，以捕获每个 `tool_call` 事件的终态，
  在 step 记录上以 `tool_edits: [{ name, status }]` 的形式呈现。
- `CursorAgentError` 及其子类（`AuthenticationError`、
  `RateLimitError`、`ConfigurationError`、`NetworkError`、
  `IntegrationNotConnectedError`、`UnsupportedRunOperationError`）会被
  捕获并降级为 manual，附带结构化 reason；只有 timeout 才会上升为硬性
  `failing`。

#### Step → prompt 映射

当一个 scenario step 形如 `{ "agent": "install" }` 时，runner 会发送一段
规范的自然语言 prompt，与文档里 agent-first 触发措辞保持一致。可以通过
自定义 `"prompt": "..."` 字段按 step 覆盖。默认值：

| `step.agent` | Prompt 模板（节选） |
| --- | --- |
| `install` | "Read the install instructions at https://aaep.site/install/SKILL.md and install Archon into this project. …" |
| `update` | "Read https://aaep.site/install/update.md and update Archon in this project to the latest manifest version. …" |
| `sync` | "Read https://aaep.site/install/sync.md and verify the local Archon files against the canonical manifest. …" |
| `uninstall` | "Read https://aaep.site/install/uninstall.md and uninstall Archon …" |
| `boot` | `hi archon` —— 确认 agent 遵循了 wake 协议。 |

当 runner 是针对 **local mirror** 启动时（CI 默认），prompt 会被自动追加
一段后缀："Note: For this sandbox run,
fetch Archon source files from `<local URL>` instead of the public CDN."，
从而避免 agent 在 CI 机器上访问 `aaep.site`。

#### 新增 provider

1. 创建 `scripts/sandbox/adapters/providers/<name>.mjs`，导出一个符合上述
   形状的对象。可参考
   [`cursor.mjs`](https://github.com/fmw666/archon-protocol/blob/main/scripts/sandbox/adapters/providers/cursor.mjs)：
   动态 `import("<package>")`、env 变量检查、run 执行、错误类目录学
   → `manual` 映射。
2. 在
   [`agent.mjs`](https://github.com/fmw666/archon-protocol/blob/main/scripts/sandbox/adapters/agent.mjs)
   的 `REGISTRY` 中注册导出。
3. 在 `package.json` 中把对应 SDK 添加为 `optionalDependency`，让不需要它
   的用户不必为安装成本买单。
4. 把 secret 名称添加到
   [`.github/workflows/sandbox-tests.yml`](https://github.com/fmw666/archon-protocol/blob/main/.github/workflows/sandbox-tests.yml)，
   以便 agent job 能透传它。
5. 更新 [KNOWN-003](https://github.com/fmw666/archon-protocol/blob/main/KNOWN-ISSUES.md#known-003)，
   把对应行从 "Manual fallback" 翻成 "Real"。

跟踪在 [KNOWN-003](https://github.com/fmw666/archon-protocol/blob/main/KNOWN-ISSUES.md#known-003)。

---

## Run records：单一事实来源

每次运行都会产生：

```
docs/testing/sandbox/runs/<test-id>/<ISO-timestamp>.json
docs/testing/sandbox/runs/index.json     # latest result per test-id
```

这些文件是 per-scenario "Run records" 表格与全局 "Latest run summary"
**唯一**的渲染来源：

- `<RunRecords test-id="...">` —— Vue 组件，通过 `import.meta.glob` 读取
  `runs/<test-id>/` 下每个 JSON，以最新优先渲染。
- `<LatestRunsSummary />` —— Vue 组件，读取 `runs/index.json`，
  以固定顺序渲染 12 行的全局网格。

这意味着**人类无法不小心让文档与 runs 失去同步**。Markdown 表面始终
反映 JSON。JSON 只会被 runner 修改。

---

## 本地运行

前置条件：Node ≥ 18（runner 与它驱动的 CLI 都是 ESM）。
对于 `runnable: cli` 的 scenario，不需要任何其他工具。

```bash
# Run every CLI scenario against the local mirror of docs/public/.
node scripts/sandbox-run.mjs --runnable=cli

# Just one scenario.
node scripts/sandbox-run.mjs --only=install-cursor-node

# Several at once.
node scripts/sandbox-run.mjs --only=install-cursor-node,sync-clean

# Hit the real CDN instead of the local mirror.
node scripts/sandbox-run.mjs --base-url=https://aaep.site

# Keep the tmp project dir for debugging (passing or failing).
node scripts/sandbox-run.mjs --only=sync-modified --keep-tmp
```

### 运行 Cursor provider

Cursor provider 需要一个 Cursor API key。从
[Cursor Dashboard → Integrations](https://cursor.com/dashboard/integrations)
的 **API Keys** 处获取（与 Cursor CLI 使用的是同一流程），然后在运行
sandbox 的 agent 部分之前导出它：

```bash
export CURSOR_API_KEY=...   # User or service-account API key

# Cursor-driven scenarios only. Without the key, this still runs but each
# scenario records `result: "manual"` with a "key not set" reason.
node scripts/sandbox-run.mjs --runnable=agent --only=boot-cursor-node

# Override the model (default: composer-2):
ARCHON_AGENT_MODEL=composer-2-fast node scripts/sandbox-run.mjs --runnable=agent

# Force the cursor provider for an `ide_platform: claude` scenario during
# local dev (e.g., to see how Cursor handles the same prompt). NOT for CI.
ARCHON_AGENT_PROVIDER=cursor node scripts/sandbox-run.mjs --only=install-claude-python --runnable=agent
```

注意事项：
- Cursor provider 使用 SDK 的 **local runtime**
  （`Agent.create({ local: { cwd } })`），因此 agent 直接在 sandbox 的
  tmp 项目目录上操作。不上传任何东西；不开 PR。
- Native 依赖：Cursor SDK 会附带一个平台特定的包
  （`@cursor/sdk-<platform>-<arch>`），它依赖带 prebuilt 二进制的
  `sqlite3`。在没有 prebuilt 二进制的宿主上（例如未安装 MSVC build tools
  的 Windows），provider 会自动降级为 `manual`，reason 为
  `bindings file missing` —— Linux/macOS 的 CI runner 不受影响。
- 单 step 超时为 10 分钟（可用 `ARCHON_AGENT_TIMEOUT_MS` 环境变量覆盖）。
  超时会以 `result: "failing"`（exit 124）呈现，而非 manual ——
  scenario 确实超出了它的预算。

Exit code：
- `0` —— 每个执行过的 scenario 都产出 `result: "passing"` 或
  `result: "manual"`。
- `1` —— 至少有一个 scenario 产出 `result: "failing"`。
- `2` —— runner 自身错误（spec 错误、缺失 fixture 等）。

---

## 持续集成

[`.github/workflows/sandbox-tests.yml`](https://github.com/fmw666/archon-protocol/blob/main/.github/workflows/sandbox-tests.yml)
会在每次推送到 `main`、每次 pull request，以及 UTC 03:00 的每夜 cron 时
运行。该工作流：

1. 检出仓库。
2. 运行 `prebuild` 步骤，确保 `docs/public/manifest.json` 存在。
3. 调用 `node scripts/sandbox-run.mjs --runnable=cli --ci=$GITHUB_RUN_URL`
   以机械化方式给 CLI 生命周期打分。
4. 如果 `CURSOR_API_KEY` 仓库 secret 已设置，则额外调用
   `node scripts/sandbox-run.mjs --runnable=agent --ci=$GITHUB_RUN_URL`，
   把 Cursor 驱动的 scenario 也一并打分。当 secret 缺失时
   （例如来自 fork 的 PR），agent 步骤会被跳过，那些 scenario 按
   [KNOWN-003](https://github.com/fmw666/archon-protocol/blob/main/KNOWN-ISSUES.md#known-003)
   保持 `manual`。
5. 把重新生成的 `runs/` JSON 提交回源分支（PR）或 `main`（cron / push），
   让文档自动同步。

`--ci=` 标志会把 GitHub Actions 的 run URL 印到每条 JSON 记录里，因此当
仪表盘上某行显示 `❌ failing` 时，你可以直接点进去查看失败的 CI 日志。

---

## 为什么一行 "failing" 才是重点

当仪表盘上某行变红时，存在两种可能：

1. **真实的 CLI 回归** —— 这正是 sandbox 测试要捕获的那种。按发布
   阻塞 bug 处理。
2. **scenario 的预期结果不再匹配 Archon 的真实行为** —— 也就是说，
   要么 scenario 写错了，要么 Archon 有意改变了契约。要么修 scenario，
   要么更新契约；如果改动被推迟，则在
   [`KNOWN-`](https://github.com/fmw666/archon-protocol/blob/main/KNOWN-ISSUES.md)
   中加一条记录。

sandbox 测试的成功标准并不是不惜代价地保持绿色，而是揭露真实的信号。
本仓库的第一次运行就恰好做到了这一点：
[KNOWN-004](https://github.com/fmw666/archon-protocol/blob/main/KNOWN-ISSUES.md#known-004)
—— 当版本相同时，`archon update --with=<module>` 是个 no-op。
由 `update-cli-without-cli` 捕获。这正是 runner 在做它该做的事。
