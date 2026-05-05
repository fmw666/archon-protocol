---
title: "12 · uninstall-archive"
test_id: uninstall-archive
fixture: fixtures/sandbox-node-ts (post-01 + post-05)
ide: Cursor
language: Node 20 + TypeScript
stage: uninstall
status: pending
---

# 12 · uninstall-archive

## What this scenario proves

The **Archive ledgers** option moves the runtime ledgers
(`drift.md` / `debt.md` / `memos.md` / `runs/`) into a single
timestamped tarball or zip outside `.archon/` (e.g.
`.archon-archive-2026-05-05.tar.gz` at the project root) **before**
deleting `.archon/` entirely.

This is the option for projects that:

- want a clean repo (no `.archon/` left behind),
- but also want a portable record of the governance history they
  built up, in case they re-adopt later or audit the past.

## Test environment

| | |
|---|---|
| Fixture | output of scenario 01 + at least one boot-cursor-node (05) drift row |
| IDE | Cursor |
| Manifest version under test | v0.1.0 |
| OS | same as scenario 01 |

## Pre-conditions

1. Scenarios 01 + 05 both ✅.
2. `.archon/drift.md` has at least one real row.
3. `git status` clean.

## Steps

```text
1. In Cursor, paste exactly:
     hi archon, uninstall yourself and archive my ledgers
2. The agent should print a planned-removal table that includes a
   line like:
     ARCHIVE  .archon/drift.md, .archon/debt.md, ...
       → .archon-archive-<YYYY-MM-DD-HHmm>.tar.gz
     DELETE   <every other canonical and ledger file>
3. Confirm.
4. Verify on disk:
     - .archon/  — gone entirely
     - .cursor/  — gone (binding dir removed; if you keep .cursor/
       for non-Archon settings, only Archon's contributed files are
       removed)
     - scripts/archon-check.py — gone
     - .archon-archive-<timestamp>.tar.gz — exists at project root
5. Inspect the archive contents:
     tar -tzf .archon-archive-<timestamp>.tar.gz
   should list every preserved ledger plus a small README
   explaining how to restore.
6. Verify the project's own validate still works:
     npm run validate     # exit 0
```

## Expected outcome

| Check | Expected |
|-------|----------|
| Archive tarball exists at project root | yes |
| Archive includes `.archon/drift.md`, `.archon/debt.md`, `.archon/memos.md`, and any `runs/` content | yes |
| Archive includes a README explaining restore steps | yes |
| `.archon/` directory removed | yes |
| `.cursor/` Archon-contributed files removed (other Cursor settings preserved) | yes |
| `npm run validate` exit code | 0 |
| `git status` after uninstall | shows the archive tarball as untracked + Archon files deleted |
| Restore by extracting archive into a fresh `.archon/` directory then running install | works (manual verification optional) |

## Demo recordings

<VideoPlaceholder test-id="uninstall-archive" />

<AsciinemaPlaceholder test-id="uninstall-archive" />

## Run records

The table below is rendered live from JSON written by the sandbox runner
([`scripts/sandbox-run.mjs`](https://github.com/fmw666/archon-protocol/blob/main/scripts/sandbox-run.mjs))
under `docs/testing/sandbox/runs/uninstall-archive/`. To add a new row, run

```bash
node scripts/sandbox-run.mjs --only=uninstall-archive
```

<RunRecords test-id="uninstall-archive" />


## Known limitations

- The exact archive filename pattern (`.tar.gz` vs `.zip`,
  timestamp granularity) is whatever the protocol page declares —
  this scenario asserts the archive **exists and is restorable**,
  not the exact filename shape.
- Restore-from-archive is verified manually here; a dedicated
  `restore-from-archive` scenario would tighten this guarantee.

## Cross-references

- Protocol page: [`/setup/uninstall`](/setup/uninstall) § "Archive ledgers"
- Pre-requisite: [01 install-cursor-node](./install-cursor-node) +
  [05 boot-cursor-node](./boot-cursor-node)
- Sibling: [11 uninstall-preserve](./uninstall-preserve) — keeps
  `.archon/` ledgers in place instead of archiving.

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
      "name": "archon uninstall --archive-ledgers",
      "cli": "uninstall",
      "flags": [
        "--archive-ledgers"
      ]
    }
  ],
  "assertions": [
    {
      "file_absent": ".cursor/commands/archon.md"
    },
    {
      "file_absent": "tools/archon-cli/bin/archon.mjs"
    },
    {
      "file_absent": ".archon/soul.md"
    }
  ],
  "notes": "--archive-ledgers moves runtime ledgers under .archon-history-<ts>/. We assert .archon/soul.md is gone (moved). A more rigorous check could glob-match .archon-history-*/soul.md."
}
```

<!-- sandbox-spec:end -->
