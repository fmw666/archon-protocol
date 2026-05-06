---
name: sandbox-install-tests
description: Run the install-matrix sandbox scenarios end-to-end (single, subset, or all CLI six, plus the agent path through aaep.site/install.md). Use when the user asks to test install behaviour, verify install in empty / existing / re-install / force / half-archon / without-cli scenarios, run the agent install via install.md, or says things like "run install matrix tests", "test install in a sandbox", "verify install rejects re-install", "compare install on empty vs existing project", "test install through the agent".
---

# Sandbox Install Tests

This skill drives the **7-scenario install matrix** under
[`docs/testing/sandbox/install-matrix.md`](../../docs/testing/sandbox/install-matrix.md):

- **CLI matrix (rows 13–18)** — vary the *initial state* of the install
  target and the *flags* passed to `archon install`. Drives
  [`docs/source-files/tools/archon-cli/lib/install.mjs`](../../docs/source-files/tools/archon-cli/lib/install.mjs)
  directly. Deterministic, fast, the green-bar guard for the install
  **implementation**.
- **Agent matrix (row 19)** — drives install through a headless Cursor
  agent reading [`https://aaep.site/install/SKILL.md`](https://aaep.site/install/SKILL.md),
  the way an end-user actually triggers Archon installation. Probabilistic,
  needs `CURSOR_API_KEY`, and **is the only test that locks down the
  agent-facing install protocol prose**.

Use it whenever you need to:

- Verify install still works after a change to `install.mjs`,
  `manifest.mjs`, or `manifest.json` (use CLI matrix).
- Verify install still works after a change to the **agent-facing
  install prose** (`docs/source-files/install.md`, `install/SKILL.md`,
  manifest fetch wording) — use the agent row.
- Compare what install produces on an empty directory vs an existing
  project.
- Confirm the re-install guard (with and without `--force`) still
  behaves as documented.
- Lock down the `--without=<module>` exclusion contract.

## The 7 scenarios

### CLI matrix (rows 13–18)

| test-id | What it proves |
|---------|----------------|
| `install-empty-dir` | Install works on a fully bare directory (no `package.json`, no source). |
| `install-existing-project` | Install is purely additive — host files (`package.json`, `src/`) are byte-preserved. |
| `install-rejects-reinstall` | A second `install` (no `--force`) exits non-zero, no backup, drift unchanged. |
| `install-force-reinstall` | `install --force` succeeds, creates `.archon-backup-<ts>/`, appends a second install row. |
| `install-half-archon-dir` | Install proceeds when `.archon/` exists but `soul.md` does not — guard is intentionally narrow. |
| `install-without-cli` | `--without=cli` skips `tools/archon-cli/`; required modules still present. |

### Agent matrix (row 19)

| test-id | What it proves |
|---------|----------------|
| `install-agent-cursor` | An end-user prompt (*"read aaep.site/install/SKILL.md and install Archon"*) sent to a headless Cursor agent produces a working install (`.archon/soul.md`, `.archon/manifest.md`, `.cursor/commands/archon.md` all exist; host `package.json` unchanged). Records `result: manual` if `CURSOR_API_KEY` is unset (KNOWN-003). |

Full descriptions: [Install Matrix](../../docs/testing/sandbox/install-matrix.md).

## How the runner works

This skill is a thin wrapper over [`scripts/sandbox-run.mjs`](../../scripts/sandbox-run.mjs)
which:

1. Spins up a local static mirror of `docs/public/` (so the test does
   not depend on `aaep.site` being reachable).
2. For each scenario, copies the fixture into a tmp dir, runs
   prerequisites + main steps via the CLI adapter, runs the declared
   assertions, and writes a JSON record under
   `docs/testing/sandbox/runs/<test-id>/<ts>.json`.
3. Updates `docs/testing/sandbox/runs/index.json` so the
   `<LatestRunsSummary />` component on the docs site reflects the
   newest run.

You do not need to start the mirror, manage tmp dirs, or hand-write
assertions — those are baked into the scenario JSON spec blocks.

## Pre-flight (always)

Before running any scenario, do these once per session:

1. Confirm `docs/public/manifest.json` exists and is current. If not,
   rebuild it:

   ```bash
   npm run manifest
   ```

2. Confirm Node ≥ 18 and Python 3 are on PATH. The runner is
   cross-platform; on Windows it uses `shell: true` automatically.

3. (Optional) `npm install` if `node_modules/` is missing. The runner
   itself only depends on Node stdlib, but the docs build does not.

## Modes

### Mode A — run the **CLI matrix** (six scenarios)

Use when the user says "run install matrix tests", "run all install
tests", "verify install end-to-end", or after a non-trivial change to
`install.mjs` / `manifest.mjs`. This is the fast, deterministic path
and is the **default** when the user does not specifically mention the
agent.

```bash
node scripts/sandbox-run.mjs --only=install-empty-dir,install-existing-project,install-rejects-reinstall,install-force-reinstall,install-half-archon-dir,install-without-cli
```

Expected summary line:

```
[sandbox-runner] summary: 6 passing · 0 failing · 0 manual
```

If any row is `failing`, **do not paper over it**. Read the JSON
record under `docs/testing/sandbox/runs/<failing-id>/` to see which
assertion failed and why, then fix the source (CLI / manifest / fixture)
or update the scenario expectations — never both at once.

### Mode A′ — run the **agent matrix** (row 19)

Use when the user says "test install through the agent", "verify
install.md still works", "test the agent install path", or after a
change to `docs/source-files/install.md`, `docs/source-files/install/SKILL.md`,
or any manifest-fetch wording the agent reads.

**This row needs `@cursor/sdk` + `CURSOR_API_KEY`.** The canonical
execution path is GitHub Actions
([`.github/workflows/sandbox-tests.yml`](../../.github/workflows/sandbox-tests.yml)),
which runs on `ubuntu-latest` and reads the `CURSOR_API_KEY` repo
secret. Local runs are also possible on any OS, but **Windows hosts
need a one-time sqlite3 binding fixup** because npm install ships
sqlite3 prebuilds for older N-API versions; Node 22 (N-API v9) is
forward-compatible with the napi-v6 binary but `prebuild-install`
versions older than ~7.1 do not auto-select the right fallback.

To unlock the SDK on Windows + Node 22 (one-time):

```bash
cd node_modules/sqlite3
npx --yes prebuild-install --runtime=napi --target=6
# binary lands at node_modules/sqlite3/build/Release/node_sqlite3.node
cd ../..
node -e "import('@cursor/sdk').then(m => console.log('ok')).catch(e => console.log('fail:', e.message))"
# expect "ok"
```

After that, `npm rebuild`-style rebuilds may wipe the binary; rerun
the same `prebuild-install` command if `cursor.mjs::isAvailable()`
starts reporting "native sqlite3 binding missing" again. On
Linux/macOS the default `npm install` already drops a working binary
at `node_modules/sqlite3/lib/binding/.../node_sqlite3.node` so no
fixup is needed.

Real run (any OS, key in env):

```bash
# Real run (~1–10 min depending on model + network):
CURSOR_API_KEY=… node scripts/sandbox-run.mjs --only=install-agent-cursor --runnable=agent

# Without key (manual fallback, exits 0 in ~6 ms):
node scripts/sandbox-run.mjs --only=install-agent-cursor --runnable=agent
```

CI behaviour: `sandbox-tests.yml::steps.cursor_key` detects the
`CURSOR_API_KEY` secret. If set → real agent run, run record gets
`runner_kind: agent` + `runner_provider: cursor`. If unset →
`result: manual`, workflow does not crash.

Expected summary line **with** key:

```
[sandbox-runner] summary: 1 passing · 0 failing · 0 manual
```

Expected summary line **without** key:

```
[sandbox-runner] summary: 0 passing · 0 failing · 1 manual
```

If the run fails *with* a valid key, the failure is real and probably
indicates `install.md` has been rewritten in a way the agent can no
longer follow. Inspect the tmp dir (the runner preserves it on failure)
to see which landmark file is missing.

### Mode A″ — run the **full matrix** (CLI + agent)

When the user wants the complete picture before a release. Note the
`--runnable=any` flag — without it, the runner defaults to
`runnable=cli` and silently filters out the agent row:

```bash
node scripts/sandbox-run.mjs --runnable=any --only=install-empty-dir,install-existing-project,install-rejects-reinstall,install-force-reinstall,install-half-archon-dir,install-without-cli,install-agent-cursor
```

The runner internally picks the right adapter per scenario based on the
spec block's `runnable` field, so this single command exercises both
matrices. Without `CURSOR_API_KEY` the agent row will record `manual`
and the rest will pass deterministically.

### Mode B — run a **single** scenario

Use when the user names a scenario or describes one specific behaviour.
Pick the right `<test-id>` from the table above.

```bash
node scripts/sandbox-run.mjs --only=<test-id>
```

Examples:

| User says | Run |
|-----------|-----|
| "test install on an empty directory" | `--only=install-empty-dir` |
| "verify install doesn't touch my package.json" | `--only=install-existing-project` |
| "check that re-install is rejected" | `--only=install-rejects-reinstall` |
| "test --force re-install" | `--only=install-force-reinstall` |
| "verify install when .archon/ already exists" | `--only=install-half-archon-dir` |
| "test --without=cli" | `--only=install-without-cli` |
| "test install through the agent" / "verify install.md" | `--only=install-agent-cursor --runnable=agent` |

### Mode C — run a **subset**

Use when the user names two or three scenarios, or a logical pair
(e.g. "compare empty vs existing", "verify both halves of the
re-install guard").

```bash
node scripts/sandbox-run.mjs --only=install-empty-dir,install-existing-project
node scripts/sandbox-run.mjs --only=install-rejects-reinstall,install-force-reinstall
```

### Mode D — keep the tmp dir for debugging

When a scenario fails and you need to inspect the resulting tree
(which file is missing, what does the drift ledger actually contain),
add `--keep-tmp`. The runner prints the tmp path and skips cleanup.

```bash
node scripts/sandbox-run.mjs --only=install-rejects-reinstall --keep-tmp
```

The runner already preserves tmp dirs automatically when a scenario
fails, so this flag is mainly useful when a scenario *passes* but you
want to inspect the post-state anyway.

## Result interpretation

Three possible outcomes per scenario:

| Result | Meaning | Action |
|--------|---------|--------|
| `passing` | All assertions returned ok. | Move on. |
| `failing` | At least one assertion or step failed. | Read the JSON record; identify the failing assertion; reproduce locally. |
| `manual` | Scenario hit a manual fallback. **Expected** for `install-agent-cursor` when `CURSOR_API_KEY` is unset (KNOWN-003). For any **CLI** scenario, `manual` indicates a runnable-filter misconfiguration — inspect the spec block. |

## Triage flow when a scenario fails

1. Open the latest record under `docs/testing/sandbox/runs/<test-id>/`
   (sorted by timestamp, newest last).
2. Look at `assertions[]` — each has `name`, `ok`, and `detail`.
3. Look at `steps[]` — each has `exit_code`, `stdout_tail`,
   `stderr_tail`. The CLI's failure messages are usually at the bottom
   of `stderr_tail`.
4. Reproduce by re-running the same scenario with `--keep-tmp`, then
   `cd` into the tmp project and run the failing assertion's command
   manually.
5. If the failure is a real CLI regression: fix in
   `docs/source-files/tools/archon-cli/lib/install.mjs` (or wherever),
   then re-run the same scenario to confirm green.
6. If the failure is an outdated assertion: update the
   `<!-- sandbox-spec -->` block in the scenario `.md`, document why
   in the scenario's "Known limitations" section, then re-run.

Never edit the runner (`scripts/sandbox-run.mjs`,
`scripts/sandbox/*.mjs`) to make a scenario pass — the runner is
declarative; the source of truth is the scenario `.md` and
`install.mjs`.

## After all six pass

If this skill was invoked because the user is shipping a change:

1. Note the manifest version that was tested: `cat
   docs/public/manifest.json | node -e "let s='';process.stdin.on('data',d=>s+=d);process.stdin.on('end',()=>console.log(JSON.parse(s).version))"`.
2. Tell the user the install matrix is green on `vX.Y.Z`.
3. Suggest also running the rest of the matrix
   (`node scripts/sandbox-run.mjs --runnable=cli`) before tagging a release.

If this skill was invoked exploratorily (the user is just learning what
install does), point them to the
[Install Matrix](../../docs/testing/sandbox/install-matrix.md)
page — the mermaid graph there is the cleanest summary.

## What this skill does **not** do

- Does not run the boot / update / sync / uninstall scenarios. Those have
  their own skills (or will, once added).
- Does not run agent install for IDE platforms other than Cursor —
  Claude / Codex / Aider headless SDK adapters do not exist yet, see
  [KNOWN-003](../../KNOWN-ISSUES.md). Their install rows
  (`install-claude-python`, `install-codex-go`, `install-aider-rust`)
  remain `manual` until the adapters land.
- Does not modify `install.mjs` or any source file. It only **runs** the
  matrix and **reports** results.
- Does not commit. If the user wants the run records committed, do that
  via your normal commit flow after asking for confirmation.

## Implementation note: the `__sb-check.cjs` helper

Each install-matrix scenario's first prerequisite step writes a tiny
helper script (`__sb-check.cjs`) into the tmp project root. Assertions
then call `node __sb-check.cjs <op> <args...>` instead of `node -e
"<inline-js>"`. This is **not cosmetic** — it works around a Windows
spawn-with-shell limitation: when the runner spawns
`node -e "const x = a || b"`, `cmd.exe` interprets the embedded
`||` as a command separator and the assertion blows up before the
JS even parses. Putting the script on disk avoids the shell-quoting
problem entirely and makes assertions cross-platform-safe.

Supported `__sb-check.cjs` ops (extend as needed when adding scenarios):

| op | usage |
|----|-------|
| `drift-install-count <n>` | assert `.archon/drift.md` has exactly `n` `## install ` rows |
| `no-backup-dir` | assert no `.archon-backup-*` directory exists at root |
| `has-backup-dir` | assert at least one `.archon-backup-*` exists |
| `pkg-name-equals <name>` | assert `package.json`'s `name` equals `<name>` |
| `file-includes <path> <substr>` | assert file contains substring |
| `drift-modules-excludes <module-id>` | assert drift's `Modules:` line does not list `<id>` |

When you add a new install scenario, copy the prerequisite block from
any existing scenario verbatim (the helper content is identical across
all six). If you need a new check, add a new `op` branch to the helper
inline-string and reuse the same shape across all scenarios.

## Cross-references

- Scenario pages: `docs/testing/sandbox/scenarios/install-*.md`
- Runner: `scripts/sandbox-run.mjs` and `scripts/sandbox/*.mjs`
- Runner architecture doc: [`docs/testing/how-runner-works.md`](../../docs/testing/how-runner-works.md)
- Install matrix doc: [`docs/testing/sandbox/install-matrix.md`](../../docs/testing/sandbox/install-matrix.md)
- CLI install source: [`docs/source-files/tools/archon-cli/lib/install.mjs`](../../docs/source-files/tools/archon-cli/lib/install.mjs)
- Fixtures: `fixtures/sandbox-empty/`, `fixtures/sandbox-node-ts/`
