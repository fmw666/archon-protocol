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

Currently a stub. Documents the contract and the env-var protocol
(`ARCHON_AGENT_PROVIDER`, `ARCHON_AGENT_API_KEY`). When a concrete SDK
adapter ships:

1. Detect provider from `ARCHON_AGENT_PROVIDER`.
2. For each `step.agent === "install"` (or `"update"`, `"sync"`, `"boot"`),
   send the canonical prompt from `https://aaep.site/<step>.md` to the
   agent SDK with `--cwd=<projectRoot>`, capture stdout, return shape
   `{ code, stdout, stderr }`.
3. Stop returning `manual: true`.

Tracked in [KNOWN-003](https://github.com/fmw666/archon-protocol/blob/main/KNOWN-ISSUES.md).

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
3. Invokes `node scripts/sandbox-run.mjs --runnable=cli --ci=$GITHUB_RUN_URL`.
4. Commits regenerated `runs/` JSON back to the source branch (PR) or to
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
