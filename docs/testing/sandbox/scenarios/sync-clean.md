---
title: "09 · sync-clean"
test_id: sync-clean
fixture: fixtures/sandbox-node-ts (post-01)
ide: Cursor
language: Node 20 + TypeScript
stage: sync
status: pending
---

# 09 · sync-clean

## What this scenario proves

`archon sync` (and its URL-less agent equivalent `hi archon, are you
healthy?`) is **read-only**. Against an unmodified install, it must:

1. Fetch the canonical manifest.
2. Walk every installed file, compute sha256, compare to the manifest.
3. Print a green report: every required module's files match.
4. **Write nothing** — neither to source-files nor to runtime ledgers.

This is the most basic guarantee of the framework: the gate that
proves "you can run sync at any time without consequences".

## Test environment

| | |
|---|---|
| Fixture | output of scenario 01 (clean post-install) |
| IDE | Cursor |
| Manifest version under test | v0.1.0 |
| OS | same as scenario 01 |

## Pre-conditions

1. Scenario 01 ✅.
2. `git status` clean immediately before this scenario starts.

## Steps

```text
1. In Cursor, paste exactly:
     hi archon, are you healthy?
2. Or via CLI:
     npx @archon/cli@latest sync
3. Inspect the printed report:
     - core-soul:           N/N OK
     - core-contracts:      N/N OK
     - commands:            N/N OK
     - rules:               N/N OK
     - skills:              N/N OK
     - cli (optional):      N/N OK   (or "not installed" if removed in 08)
     - extensions-demand-pool: …
4. Run `git status` immediately after — must still be clean.
```

## Expected outcome

| Check | Expected |
|-------|----------|
| Sync exits with success status | yes |
| Every required module reports `N/N OK` | yes |
| Optional modules report either `N/N OK` or `not installed` (never `0/N OK`) | yes |
| `git status` after sync | identical to before (clean) |
| No `.bak` files created | yes |
| `.archon/drift.md` unchanged | yes |
| Total wall-clock time | < 30 s on a warm cache |

## Demo recordings

<VideoPlaceholder test-id="sync-clean" />

<AsciinemaPlaceholder test-id="sync-clean" />

## Run records

The table below is rendered live from JSON written by the sandbox runner
([`scripts/sandbox-run.mjs`](https://github.com/fmw666/archon-protocol/blob/main/scripts/sandbox-run.mjs))
under `docs/testing/sandbox/runs/sync-clean/`. To add a new row, run

```bash
node scripts/sandbox-run.mjs --only=sync-clean
```

<RunRecords test-id="sync-clean" />


## Known limitations

- Does not test sync against a manifest fetched from a stale CDN
  cache. That is `sync-stale-manifest` — separate scenario.
- Does not exercise the offline path (`--offline` flag for the CLI);
  see protocol page for that mode's expected output.

## Cross-references

- Protocol page: [`/setup/sync`](/setup/sync)
- Agent file: [`https://aaep.site/sync.md`](https://aaep.site/sync.md)
- Pre-requisite: [01 install-cursor-node](./install-cursor-node)
- Sibling: [10 sync-modified](./sync-modified) — same scenario but
  with a hand-edit injected so the report goes red.

<!-- sandbox-spec:start -->

```json
{
  "runnable": "cli",
  "fixture": "fixtures/sandbox-node-ts",
  "ide_platform": "cursor",
  "prerequisites": [
    {
      "name": "archon install",
      "cli": "install",
      "flags": [
        "--with=cli"
      ]
    }
  ],
  "steps": [
    {
      "name": "archon sync (json)",
      "cli": "sync",
      "flags": [
        "--json"
      ]
    }
  ],
  "assertions": [
    {
      "file_exists": ".archon/VERSION"
    }
  ]
}
```

<!-- sandbox-spec:end -->
