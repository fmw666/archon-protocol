---
title: "08 · update-cli-without-cli"
test_id: update-cli-without-cli
fixture: fixtures/sandbox-node-ts (post-01, with cli installed)
ide: Cursor
language: Node 20 + TypeScript
stage: update
status: pending
---

# 08 · update-cli-without-cli

## What this scenario proves

The `--without={module}` flag (and its agent-prompt equivalent)
**actually removes** an optional module on update — including
deleting the on-disk files of that module, not merely flagging it
as "skipped going forward".

This is the regression test for the most common user request:

> "I installed Archon with the cli module last week, but our CI image
> can't have Node. Can I drop just the CLI without uninstalling
> Archon entirely?"

Yes. This scenario proves it.

## Test environment

| | |
|---|---|
| Fixture | output of scenario 01 (cli module installed) |
| IDE | Cursor |
| OS | same as scenario 01 |
| Archon source | `https://aaep.site/manifest.json` |
| Manifest version under test | v0.1.0 (no version bump needed) |

## Pre-conditions

1. Scenario 01 ✅, with `cli` module included (default).
2. `tools/archon-cli/` exists on disk.
3. `git status` clean.

## Steps

```text
1. In Cursor, paste exactly:
     hi archon, update yourself but without the cli module
2. Or equivalently via CLI:
     npx @archon/cli@latest update --without=cli --yes
3. The agent / CLI prints a planned-changes table that should include:
     - REMOVE  tools/archon-cli/...        (every cli file)
     - KEEP    .archon/...                  (core unchanged)
     - KEEP    .cursor/...                  (binding unchanged)
4. Confirm.
5. Verify tools/archon-cli/ no longer exists.
6. Verify .archon/manifest.md or wherever opted-in modules are
   tracked reflects "cli: not installed".
```

## Expected outcome

| Check | Expected |
|-------|----------|
| `tools/archon-cli/` removed | yes |
| Other modules untouched | yes |
| `.archon/drift.md` rows | unchanged |
| `.archon/VERSION` | unchanged |
| Subsequent `archon sync` (scenario 09) reports cli as "not installed" — **not** as "0/N ok" | yes |
| `python3 scripts/archon-check.py --root .` exit code | 0 |
| `npm run validate` exit code | 0 |

## Demo recordings

<VideoPlaceholder test-id="update-cli-without-cli" />

<AsciinemaPlaceholder test-id="update-cli-without-cli" />

## Run records

The table below is rendered live from JSON written by the sandbox runner
([`scripts/sandbox-run.mjs`](https://github.com/fmw666/archon-protocol/blob/main/scripts/sandbox-run.mjs))
under `docs/testing/sandbox/runs/update-cli-without-cli/`. To add a new row, run

```bash
node scripts/sandbox-run.mjs --only=update-cli-without-cli
```

<RunRecords test-id="update-cli-without-cli" />


## Known limitations

- Does not test re-adding the cli later via `--with=cli`. That is a
  separate scenario worth adding (`update-add-cli-back`) once the
  basic remove path is green.
- Does not test removing a *required* module — that should fail
  loudly. A negative scenario `update-without-required-fails` is a
  good follow-up.

## Cross-references

- Protocol page: [`/setup/update`](/setup/update) §
  "Module selection (--with / --without)"
- Manifest: [`/setup/manifest`](/setup/manifest) — required vs
  optional modules table
- Pre-requisite: [01 install-cursor-node](./install-cursor-node)
- Follow-up: any subsequent [09 sync-clean](./sync-clean) run should
  reflect cli as "not installed".

<!-- sandbox-spec:start -->

```json
{
  "runnable": "cli",
  "fixture": "fixtures/sandbox-node-ts",
  "ide_platform": "cursor",
  "prerequisites": [
    {
      "name": "archon install (no cli)",
      "cli": "install",
      "flags": [
        "--without=cli"
      ]
    }
  ],
  "steps": [
    {
      "name": "archon update with cli",
      "cli": "update",
      "flags": [
        "--with=cli"
      ]
    }
  ],
  "assertions": [
    {
      "dir_exists": "tools/archon-cli"
    },
    {
      "file_exists": "tools/archon-cli/bin/archon.mjs"
    }
  ]
}
```

<!-- sandbox-spec:end -->
