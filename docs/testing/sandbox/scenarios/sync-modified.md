---
title: "10 · sync-modified"
test_id: sync-modified
fixture: fixtures/sandbox-node-ts (post-01, with hand-edit injected)
ide: Cursor
language: Node 20 + TypeScript
stage: sync
status: pending
---

# 10 · sync-modified

## What this scenario proves

`archon sync` correctly **detects drift** when a canonical file has
been hand-edited, and reports it precisely (which file, expected vs
actual sha256). This is the failure-mode counterpart of
[scenario 09 sync-clean](./sync-clean).

Two things must both be true:

1. The report flags the modified file as drifted.
2. The modified file is **not** auto-corrected — sync stays read-only.
   The user must run `archon update` (or revert the file manually)
   to resolve the drift.

## Test environment

| | |
|---|---|
| Fixture | output of scenario 01 + a deliberate hand-edit |
| IDE | Cursor |
| Manifest version under test | v0.1.0 |
| OS | same as scenario 01 |

## Pre-conditions

1. Scenario 01 ✅.
2. `git status` clean before injecting the edit.

## Steps

```text
1. Inject a deliberate hand-edit into a canonical file. Pick something
   short and unmistakable, e.g.:
     echo "" >> .cursor/commands/archon.md
     echo "<!-- DRIFT INJECTED FOR TEST 10 -->" >> .cursor/commands/archon.md
2. Confirm the file's sha256 has changed:
     sha256sum .cursor/commands/archon.md
3. In Cursor, paste exactly:
     hi archon, are you healthy?
4. Read the report — should call out
     .cursor/commands/archon.md   FAIL  expected <sha-A>  got <sha-B>
5. Confirm sync did not modify any file:
     git status
   must show ONLY the file you injected (modified), nothing extra.
6. Repair drift via update:
     hi archon, update yourself
   confirm the planned change includes restoring .cursor/commands/archon.md
   and accept.
7. Re-run sync (step 3) — should now report N/N OK again.
```

## Expected outcome

| Check | Expected |
|-------|----------|
| Sync (step 3) prints the modified file with FAIL + sha mismatch | yes |
| Sync exits with non-zero status (or otherwise signals "drift detected" — match protocol page) | yes |
| Sync **does not** modify any file (step 5) | yes |
| Update (step 6) restores the canonical content | yes |
| Re-sync (step 7) | N/N OK |
| `.archon/drift.md` row count | unchanged throughout (sync/update of canonical files is not a drift event in the runtime-ledger sense) |

## Demo recordings

<VideoPlaceholder test-id="sync-modified" />

<AsciinemaPlaceholder test-id="sync-modified" />

## Run records

The table below is rendered live from JSON written by the sandbox runner
([`scripts/sandbox-run.mjs`](https://github.com/fmw666/archon-protocol/blob/main/scripts/sandbox-run.mjs))
under `docs/testing/sandbox/runs/sync-modified/`. To add a new row, run

```bash
node scripts/sandbox-run.mjs --only=sync-modified
```

<RunRecords test-id="sync-modified" />


## Known limitations

- This scenario only injects drift on a binding-root file
  (`.cursor/commands/archon.md`). A more complete matrix would also
  inject drift in `.archon/soul.md`, `.archon/manifest.md`, etc., to
  prove the report covers the core directory equally. Add as
  follow-up scenarios when prioritised.
- Does not test the case where a runtime ledger is hand-edited
  (`.archon/drift.md`). Those files are project-owned and **must
  not** be reported as drift by `sync` — that is a separate negative
  test (`sync-ignores-runtime-ledgers`).

## Cross-references

- Protocol page: [`/setup/sync`](/setup/sync) and [`/setup/update`](/setup/update)
- Pre-requisite: [01 install-cursor-node](./install-cursor-node)
- Sibling: [09 sync-clean](./sync-clean) — same flow, no drift injected

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
    },
    {
      "name": "tamper soul.md",
      "append_to_file": {
        "path": ".archon/soul.md",
        "content": "\n# tampered by sandbox runner\n"
      }
    }
  ],
  "steps": [
    {
      "name": "archon sync (expected to flag drift)",
      "cli": "sync",
      "flags": [
        "--json"
      ],
      "allow_nonzero": true
    }
  ],
  "assertions": [
    {
      "file_exists": ".archon/soul.md"
    },
    {
      "file_contains": {
        "path": ".archon/soul.md",
        "substr": "tampered by sandbox runner"
      }
    }
  ],
  "notes": "Asserts that tampering is preserved on disk and `archon sync` runs without crashing. A future enhancement could capture the JSON drift report and assert specific drift counts."
}
```

<!-- sandbox-spec:end -->
