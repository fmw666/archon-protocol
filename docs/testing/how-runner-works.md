---
title: "How the sandbox runner works"
description: "Architecture, local invocation, CI, and the path to a real agent SDK adapter."
---

# How the sandbox runner works

The sandbox runner ([`scripts/sandbox-run.mjs`](https://github.com/fmw666/archon-protocol/blob/main/scripts/sandbox-run.mjs))
is the piece that makes the [Sandbox Tests](/testing/sandbox/) section
**real and effective**, rather than a wall of `pending` checkboxes. This
page explains its architecture, how to run it locally, how it lives in
CI, and what the contract is for adding new adapters (Cursor SDK, Claude
Code SDK, Codex CLI) without changing the runner core.

---

## Mental model

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

The runner has **no test code of its own** — every assertion is declared
in the scenario's `<!-- sandbox-spec:start --> ... <!-- sandbox-spec:end -->`
block. This keeps the human-readable scenario page (`## Steps`,
`## Expected outcome`) and the machine-readable spec **next to each
other** in one Markdown file.

---

## The scenario contract

Every page under [`docs/testing/sandbox/scenarios/`](https://github.com/fmw666/archon-protocol/tree/main/docs/testing/sandbox/scenarios)
contains a JSON block between `<!-- sandbox-spec:start -->` and
`<!-- sandbox-spec:end -->` markers. The runner only consumes that block;
the surrounding prose is for humans.

Schema:

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

`runnable` controls which adapter the runner uses:
- `cli` — drives the local Archon CLI; everything is mechanical.
- `agent` — needs a coding agent. Without an SDK adapter (today's state)
  scenarios with `runnable: agent` record `result: "manual"`.
- `both` — runs once per available adapter (future).
- `manual` — explicitly out of scope for automation.

---

## Adapters

### CliAdapter ([`scripts/sandbox/adapters/cli.mjs`](https://github.com/fmw666/archon-protocol/blob/main/scripts/sandbox/adapters/cli.mjs))

Spawns `node tools/archon-cli/bin/archon.mjs <subcommand> <projectRoot>
--yes --base-url=<local-mirror>` for each `cli` step, plus inline file
primitives (`append_to_file`, `write_file`) and arbitrary `cmd` arrays
for cross-platform shell-free command execution.

The local mirror is a tiny static HTTP server
([`local-server.mjs`](https://github.com/fmw666/archon-protocol/blob/main/scripts/sandbox/local-server.mjs))
that serves `docs/public/` so the sandbox can verify the **exact**
manifest the docs site is shipping, without depending on `aaep.site`
being reachable from CI.

### AgentAdapter ([`scripts/sandbox/adapters/agent.mjs`](https://github.com/fmw666/archon-protocol/blob/main/scripts/sandbox/adapters/agent.mjs))

A thin dispatcher. It picks a **provider** based on the scenario's
`ide_platform` (overridable with the `ARCHON_AGENT_PROVIDER` env var) and
forwards `runStep` to it. Each provider lives under
[`scripts/sandbox/adapters/providers/`](https://github.com/fmw666/archon-protocol/tree/main/scripts/sandbox/adapters/providers)
and conforms to:

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

Currently registered:

| Provider | Implementation | Triggered when `ide_platform` is |
| --- | --- | --- |
| `cursor` | **Real**, uses [`@cursor/sdk`](https://www.npmjs.com/package/@cursor/sdk) | `cursor` |
| `claude` | Manual fallback | `claude` |
| `codex` | Manual fallback | `codex` |
| `aider` | Manual fallback | `aider` |
| anything else | Manual fallback (per-name) | otherwise |

Whenever a provider is unavailable (no API key, optional SDK package not
installed, native dep not built on this host, SDK raised an
`AuthenticationError`, …) the step is recorded as `manual: true` with a
human-readable `reason`, and the scenario's `result` becomes `manual`
rather than `failing`. CI does not crash if `CURSOR_API_KEY` is absent —
it simply falls back to the documented manual evidence path.

#### Cursor provider deep-dive

The Cursor provider runs the SDK in **local mode** so the agent operates
directly on the sandbox's tmp project directory. It does not provision a
cloud VM and never touches the source repo.

Per [Cursor's SDK docs](https://cursor.com/docs/sdk/typescript):

- `Agent.create({ apiKey, model: { id: 'composer-2' }, local: { cwd, settingSources: ['project'] } })`
  loads the fixture's `.cursor/rules/`, `.cursor/commands/`,
  `.cursor/skills/`, `.cursor/agents/`, and `.cursor/mcp.json`. This is
  how Archon's repo-side `archon-wake.mdc` rule and `archon.md` command
  reach the agent without us re-uploading them.
- `await run.wait()` returns a `RunResult` with
  `status: 'finished' | 'error' | 'cancelled'`. The provider maps these
  to numeric exit codes (`0`, `1`, `124`) so the runner stays uniform
  across CLI / agent paths.
- `run.stream()` is consumed concurrently to capture each `tool_call`
  event's terminal status, surfaced as `tool_edits: [{ name, status }]`
  on the step record.
- `CursorAgentError` and its subclasses (`AuthenticationError`,
  `RateLimitError`, `ConfigurationError`, `NetworkError`,
  `IntegrationNotConnectedError`, `UnsupportedRunOperationError`) are
  caught and degraded to manual with a structured reason; only timeouts
  surface as a hard `failing`.

#### Step → prompt mapping

When a scenario step looks like `{ "agent": "install" }`, the runner
sends a canonical natural-language prompt that mirrors the agent-first
trigger phrasing the docs document. Override per-step with a custom
`"prompt": "..."` field. Defaults:

| `step.agent` | Prompt template (abridged) |
| --- | --- |
| `install` | "Read the install instructions at https://aaep.site/install/SKILL.md and install Archon into this project. …" |
| `update` | "Read https://aaep.site/install/update.md and update Archon in this project to the latest manifest version. …" |
| `sync` | "Read https://aaep.site/install/sync.md and verify the local Archon files against the canonical manifest. …" |
| `uninstall` | "Read https://aaep.site/install/uninstall.md and uninstall Archon …" |
| `boot` | `hi archon` — confirms the agent followed the wake protocol. |

When the runner is started against the **local mirror** (the default for
CI), the prompt is auto-augmented with a "Note: For this sandbox run,
fetch Archon source files from `<local URL>` instead of the public CDN."
suffix so the agent never reaches out to `aaep.site` from a CI box.

#### Adding a new provider

1. Create `scripts/sandbox/adapters/providers/<name>.mjs` that exports an
   object with the shape above. Use
   [`cursor.mjs`](https://github.com/fmw666/archon-protocol/blob/main/scripts/sandbox/adapters/providers/cursor.mjs)
   as a reference: dynamic `import("<package>")`, env-var check, run
   execution, error-class taxonomy → `manual` mapping.
2. Register the export in
   [`agent.mjs`](https://github.com/fmw666/archon-protocol/blob/main/scripts/sandbox/adapters/agent.mjs)'s
   `REGISTRY`.
3. Add the SDK as an `optionalDependency` in `package.json` so users who
   don't need it never pay the install cost.
4. Add the secret name to
   [`.github/workflows/sandbox-tests.yml`](https://github.com/fmw666/archon-protocol/blob/main/.github/workflows/sandbox-tests.yml)
   so the agent job can pass it through.
5. Update [KNOWN-003](https://github.com/fmw666/archon-protocol/blob/main/KNOWN-ISSUES.md#known-003)
   to flip the row from "Manual fallback" to "Real".

Tracked in [KNOWN-003](https://github.com/fmw666/archon-protocol/blob/main/KNOWN-ISSUES.md#known-003).

---

## Run records: the source of truth

Every run produces:

```
docs/testing/sandbox/runs/<test-id>/<ISO-timestamp>.json
docs/testing/sandbox/runs/index.json     # latest result per test-id
```

These files are the **only** rendered surface for both the per-scenario
"Run records" table and the global "Latest run summary":

- `<RunRecords test-id="...">` — Vue component, reads every JSON under
  `runs/<test-id>/` via `import.meta.glob`, renders newest first.
- `<LatestRunsSummary />` — Vue component, reads `runs/index.json`,
  renders the 12-row global grid in a fixed order.

This means **humans cannot accidentally desynchronise the documentation
from the runs**. The Markdown surface always reflects the JSON. The JSON
is only ever touched by the runner.

---

## Running locally

Pre-requisites: Node ≥ 18 (the runner and the CLI it drives are both
ESM). No other tooling required for `runnable: cli` scenarios.

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

### Running the Cursor provider

The Cursor provider needs a Cursor API key. Get one from
[Cursor Dashboard → Integrations](https://cursor.com/dashboard/integrations)
under **API Keys** (same flow the Cursor CLI uses), then export it before
running the agent half of the sandbox:

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

Notes:
- The Cursor provider uses the **local runtime** of the SDK
  (`Agent.create({ local: { cwd } })`), so the agent operates directly on
  the sandbox's tmp project directory. Nothing is uploaded; no PR is
  opened.
- Native dependency: the Cursor SDK ships a platform-specific package
  (`@cursor/sdk-<platform>-<arch>`) that depends on `sqlite3` with a
  prebuilt binary. On hosts without a prebuilt binary (e.g., Windows
  without MSVC build tools), the provider auto-degrades to `manual` with
  a `bindings file missing` reason — Linux/macOS CI runners are unaffected.
- Per-step timeout is 10 min (`ARCHON_AGENT_TIMEOUT_MS` env override). A
  timeout surfaces as `result: "failing"` (exit 124), not manual — the
  scenario really did exceed its budget.

Exit codes:
- `0` — every executed scenario produced `result: "passing"` or
  `result: "manual"`.
- `1` — at least one scenario produced `result: "failing"`.
- `2` — runner self-error (bad spec, missing fixture, etc.).

---

## Continuous integration

[`.github/workflows/sandbox-tests.yml`](https://github.com/fmw666/archon-protocol/blob/main/.github/workflows/sandbox-tests.yml)
runs on every push to `main`, every pull request, and a nightly cron at
03:00 UTC. The workflow:

1. Checks out the repo.
2. Runs the `prebuild` step so `docs/public/manifest.json` exists.
3. Invokes `node scripts/sandbox-run.mjs --runnable=cli --ci=$GITHUB_RUN_URL`
   to mechanically grade the CLI lifecycle.
4. If the `CURSOR_API_KEY` repository secret is set, additionally invokes
   `node scripts/sandbox-run.mjs --runnable=agent --ci=$GITHUB_RUN_URL` so
   Cursor-driven scenarios are graded too. When the secret is absent
   (e.g., on PRs from forks), the agent step is skipped and those
   scenarios remain `manual` per [KNOWN-003](https://github.com/fmw666/archon-protocol/blob/main/KNOWN-ISSUES.md#known-003).
5. Commits regenerated `runs/` JSON back to the source branch (PR) or to
   `main` (cron / push) so the documentation auto-syncs.

The `--ci=` flag stamps the GitHub Actions run URL into each JSON record,
so when a row in the dashboard says `❌ failing`, you can click straight
through to the failing CI log.

---

## Why a "failing" row is the point

When a row in the dashboard goes red, two possibilities exist:

1. **A real CLI regression** — the kind sandbox tests are meant to catch.
   Treat as a release-blocking bug.
2. **A scenario whose expected outcome no longer matches Archon's actual
   behaviour** — meaning either the scenario was wrong, or Archon
   intentionally changed contract. Either fix the scenario or update the
   contract, and add a [`KNOWN-`](https://github.com/fmw666/archon-protocol/blob/main/KNOWN-ISSUES.md)
   entry if the change is deferred.

Sandbox tests succeed not by being green at all costs but by surfacing
real signal. The first run in this repo found exactly that:
[KNOWN-004](https://github.com/fmw666/archon-protocol/blob/main/KNOWN-ISSUES.md#known-004)
— `archon update --with=<module>` is a no-op when versions match. Caught
by `update-cli-without-cli`. That's the runner doing its job.
