---
title: "19 · install-agent-cursor"
test_id: install-agent-cursor
fixture: fixtures/sandbox-node-ts
ide: Cursor
language: Node 20 + TypeScript
stage: install (agent path)
status: pending
---

# 19 · install-agent-cursor

## What this scenario proves

The **agent install path** — what an end-user actually does when they
type `read aaep.site/install.md and install archon` into a Cursor chat —
end-to-end through the sandbox runner.

Unlike scenarios 13–18 (which drive `archon install` directly via the
CLI), this scenario:

1. Boots a headless Cursor agent (`@cursor/sdk`) with the tmp project
   as the working directory.
2. Hands it the **same prompt a human would paste**: read
   `https://aaep.site/install/SKILL.md` and install Archon.
3. Lets the agent fetch the install protocol, follow it, and write
   files to disk using its own `write` / `read` / web-fetch tools.
4. Verifies the resulting tree has the same critical landmarks as a
   CLI install (`.archon/soul.md`, `.archon/manifest.md`,
   `.cursor/commands/archon.md`).

This is the **regression test for the agent-facing install protocol**
itself — `install.md`, `skill.md`, the manifest fetch instructions —
not just the CLI implementation. If `install.md` is rewritten in a
way that confuses agents, this scenario catches it; the CLI matrix
(13–18) cannot.

## Pairing with the CLI matrix

| Aspect | CLI matrix (13–18) | This scenario (19) |
|--------|--------------------|--------------------|
| What is being tested | `install.mjs` source code | `install.md` agent-facing protocol |
| Determinism | Fully deterministic; same exit code every run | Probabilistic (LLM); same outcome but exact tool-call sequence varies |
| Fail mode if broken | CLI bug | Agent-facing protocol prose / manifest URL ambiguity |
| Required to release | Yes | Yes (when `CURSOR_API_KEY` is provisioned in CI) |

Both layers must pass. The CLI matrix is the **fast feedback loop**
during local development; the agent path is the **end-user contract**
verified before release.

## Test environment

| | |
|---|---|
| Fixture | [`fixtures/sandbox-node-ts`](https://github.com/fmw666/archon-protocol/tree/main/fixtures/sandbox-node-ts) |
| IDE | Cursor (`@cursor/sdk` `Agent.create({ local: { cwd, settingSources: ['project'] } })`) |
| Provider | [`scripts/sandbox/adapters/providers/cursor.mjs`](https://github.com/fmw666/archon-protocol/blob/main/scripts/sandbox/adapters/providers/cursor.mjs) |
| Model | `composer-2` (override via `ARCHON_AGENT_MODEL`) |
| Timeout | 10 min (override via `ARCHON_AGENT_TIMEOUT_MS`) |
| Manifest version under test | v0.1.x |
| Required env | `CURSOR_API_KEY` (without it, scenario records `result: manual`) |

## Where this scenario actually runs

This scenario can run anywhere `@cursor/sdk` loads + `CURSOR_API_KEY`
is in the environment. There is one platform-specific footnote and
one general gate:

1. **`@cursor/sdk` requires a native `sqlite3` binding.** On Linux and
   macOS, `npm install` drops a working prebuilt binary out of the box.
   On Windows + Node 22, `npm install` may leave sqlite3 without a
   loaded binding because the bundled `prebuild-install` does not
   auto-select sqlite3's napi-v6 prebuild for Node 22 (N-API v9). The
   one-time fix:

   ```bash
   cd node_modules/sqlite3
   npx --yes prebuild-install --runtime=napi --target=6
   ```

   After that, `node -e "import('@cursor/sdk').then(...)"` loads the
   SDK successfully.

2. **`CURSOR_API_KEY` must be set** in the environment. Without it
   `cursor.mjs::isAvailable()` short-circuits to `manual` regardless
   of platform. Get a key at
   [cursor.com/dashboard/integrations](https://cursor.com/dashboard/integrations).

The repository's
[`.github/workflows/sandbox-tests.yml`](https://github.com/fmw666/archon-protocol/blob/main/.github/workflows/sandbox-tests.yml)
runs this scenario on `ubuntu-latest` against the `CURSOR_API_KEY`
repo secret on every push, PR, and nightly cron. CI is therefore the
**canonical green-bar path**; local runs are for triage and
prototyping.

| Where | Outcome | Why |
|-------|---------|-----|
| Local Windows + Node 22 (no sqlite3 fixup) | `manual` (SDK load fails) | sqlite3 binding not unpacked; run the napi-v6 prebuild-install once |
| Local Windows + Node 22 (sqlite3 fixed up, no key) | `manual` (`isAvailable()` short-circuits) | `CURSOR_API_KEY` unset |
| Local Windows + Node 22 (sqlite3 fixed up, key in env) | real agent run | both gates pass |
| Local Linux/macOS (no key) | `manual` (`isAvailable()` short-circuits) | `CURSOR_API_KEY` unset |
| Local Linux/macOS (with key) | real agent run | both gates pass |
| CI `sandbox-tests.yml` (no secret) | `manual` (`isAvailable()` short-circuits) | secret not provisioned |
| **CI `sandbox-tests.yml` (secret configured)** | **real agent run, recorded into runs/** | the canonical path for this scenario |

## Provisioning the CI secret

Once per repository (or once per fork), an admin needs to:

```bash
gh secret set CURSOR_API_KEY --repo <owner>/<repo>
# paste the API key from https://cursor.com/dashboard/integrations
```

Verify:

```bash
gh secret list --repo <owner>/<repo>
# should include CURSOR_API_KEY
```

After the secret is set, the next push (or a manual
`gh workflow run sandbox-tests.yml`) will produce a real run record
under `docs/testing/sandbox/runs/install-agent-cursor/` with
`runner_kind: agent` and `runner_provider: cursor`.

## Pre-conditions

1. Fixture copied — runner-managed.
2. `@cursor/sdk` installed (it is an `optionalDependencies` entry in
   the repo's `package.json`).
3. `CURSOR_API_KEY` exported. **Without the key, this scenario falls
   back to `result: manual`** — that is intentional, not a failure.
   See `cursor.mjs::isAvailable()`.
4. Local mirror serving `docs/public/`. The runner manages this; the
   prompt instructs the agent to fetch from the mirror's URL via the
   `Note: For this sandbox run, fetch Archon source files
   from <mirror-url>` line in `cursor.mjs::buildPrompt()`.

## Steps

```text
1. Sandbox runner boots a Cursor agent against the tmp project.
2. Runner sends the install prompt:
     "Read the install instructions at https://aaep.site/install/SKILL.md
      and install Archon into this project. ..."
3. Agent fetches install.md, follows it, writes files to .archon/, .cursor/, etc.
4. Runner waits for run.wait() to settle (status='finished'), then runs
   the assertion block.
```

## Expected outcome

| Check | Expected |
|-------|----------|
| Run status | `finished` (mapped to exit code 0) |
| `.archon/soul.md` | exists |
| `.archon/manifest.md` | exists |
| `.archon/drift.md` | exists |
| `.cursor/commands/archon.md` | exists |
| `.cursor/rules/` | exists |
| `package.json` (host file) | unchanged (`name: "acme-todos"` preserved) |
| `tool_edits[]` in run record | non-empty (agent did write files) |

The exact list of files written is **not** asserted — agents may
choose to omit optional modules, defer some seeded ledgers, or
write equivalent-but-renamed files. Only the canonical landmarks
that `install.md` mandates are checked.

## When CURSOR_API_KEY is unset

This scenario degrades gracefully:

- The Cursor provider's `isAvailable()` returns `{ ok: false }`.
- The dispatcher records `manual: true` with the reason logged into
  `step.stdout_tail`.
- `result` becomes `manual`, not `failing`. The CI run is **not** red.

This is the documented contract for KNOWN-003 ("Headless agent SDK
provider coverage is incomplete"). The CLI matrix carries the
green-bar burden when the agent path is unreachable.

## Demo recordings

<VideoPlaceholder test-id="install-agent-cursor" />

<AsciinemaPlaceholder test-id="install-agent-cursor" />

## Run records

```bash
# CI (with CURSOR_API_KEY):
node scripts/sandbox-run.mjs --only=install-agent-cursor --runnable=agent

# Local without key (scenario records manual, runner exits 0):
node scripts/sandbox-run.mjs --only=install-agent-cursor --runnable=agent
```

<RunRecords test-id="install-agent-cursor" />

## Known limitations

- **Probabilistic outcome**. LLM-driven runs can take varying paths;
  one run may write files in a different order than another. Only
  the post-state landmarks are asserted, never the path taken.
- **One IDE platform only**. Claude / Codex / Aider equivalents are
  out of scope until those SDK providers exist (KNOWN-003).
- **Cost**. Each run consumes Cursor model credits. Budget the CI
  cadence accordingly (per-release, not per-commit, is reasonable).
- The local-mirror URL is appended to the prompt as a
  "fetch from this URL instead" instruction; the agent must follow
  it. If `install.md` is ever rewritten to ignore the override, this
  scenario will be unable to use the local mirror and will need
  network access to `aaep.site`.

## Cross-references

- Provider source: [`scripts/sandbox/adapters/providers/cursor.mjs`](https://github.com/fmw666/archon-protocol/blob/main/scripts/sandbox/adapters/providers/cursor.mjs)
- Dispatcher: [`scripts/sandbox/adapters/agent.mjs`](https://github.com/fmw666/archon-protocol/blob/main/scripts/sandbox/adapters/agent.mjs)
- Agent-facing install protocol: [`install.md`](https://aaep.site/install.md)
- KNOWN-003 (other IDE providers still manual): [`KNOWN-ISSUES.md`](https://github.com/fmw666/archon-protocol/blob/main/KNOWN-ISSUES.md)
- Sibling: [01 · install-cursor-node](./install-cursor-node) — same fixture, different layer (CLI).
- Install matrix: [Install Matrix](../install-matrix)

<!-- sandbox-spec:start -->

```json
{
  "runnable": "agent",
  "fixture": "fixtures/sandbox-node-ts",
  "ide_platform": "cursor",
  "prerequisites": [
    {
      "write_file": {
        "path": "__sb-check.cjs",
        "content": "const fs=require('fs');const op=process.argv[2];const args=process.argv.slice(3);if(op==='pkg-name-equals'){const p=require('./package.json');if(p.name!==args[0]){console.error('package.json name mutated:',p.name);process.exit(1)}process.exit(0)}console.error('unknown op:',op);process.exit(2);"
      }
    }
  ],
  "steps": [
    {
      "name": "agent install via aaep.site/install.md",
      "agent": "install",
      "timeout_ms": 600000
    }
  ],
  "assertions": [
    { "file_exists": ".archon/soul.md" },
    { "file_exists": ".archon/manifest.md" },
    { "file_exists": ".archon/drift.md" },
    { "file_exists": ".cursor/commands/archon.md" },
    { "dir_exists": ".cursor/rules" },
    { "file_exists": "package.json" },
    { "cmd_zero": ["node", "__sb-check.cjs", "pkg-name-equals", "acme-todos"] },
    { "cmd_zero": ["python3", "scripts/archon-check.py", "--root", "."] }
  ],
  "notes": "Headless Cursor agent path. Without CURSOR_API_KEY the runner records result=manual via the cursor.mjs provider's isAvailable() guard. Assertions cover only landmark files because LLM runs are non-deterministic in path-not-outcome."
}
```

<!-- sandbox-spec:end -->
