---
title: "11 · uninstall-preserve"
test_id: uninstall-preserve
fixture: fixtures/sandbox-python (post-02 + post-06)
ide: Claude Code
language: Python 3.12
stage: uninstall
status: pending
---

# 11 · uninstall-preserve

## What this scenario proves

Uninstalling Archon with the **Preserve ledgers** choice removes every
canonical file (soul / manifest / commands / rules / skills /
contracts / scripts / binding directory) **but keeps the runtime
ledgers** (`drift.md` / `debt.md` / `memos.md` / `run/state.json` /
records folder) untouched in `.archon/`.

The user gets a clean editor surface back, the project's governance
history stays on disk, and re-installing later resumes from the same
ledger state.

## Test environment

| | |
|---|---|
| Fixture | output of scenario 02 + at least one boot-claude-python (06) drift row |
| IDE | Claude Code |
| Manifest version under test | v0.1.0 |
| OS | same as scenario 02 |

## Pre-conditions

1. Scenarios 02 + 06 both ✅.
2. `.archon/drift.md` has at least one real row.
3. `git status` clean.

## Steps

```text
1. In Claude Code, paste exactly:
     hi archon, uninstall yourself but preserve my ledgers
2. The agent should print a planned-removal table that:
     - lists every canonical file scheduled for delete
     - lists every runtime ledger explicitly marked "PRESERVE"
3. Confirm.
4. Verify on disk:
     - .archon/soul.md, .archon/manifest.md, etc. — gone
     - .claude/commands/, .claude/rules/, etc. — gone
     - .archon/drift.md, .archon/debt.md, .archon/memos.md — STILL
       present, unchanged byte-for-byte
     - .archon/runs/ (or whichever runtime path manifest declares) — STILL
       present
     - scripts/archon-check.py — gone (it's part of the canonical kit)
     - .pre-commit-config.yaml — preserved (project-owned config)
5. Verify the project's own validate command still works:
     python -m pytest      # exit 0
```

## Expected outcome

| Check | Expected |
|-------|----------|
| Canonical files removed | yes |
| Runtime ledgers (`drift.md` / `debt.md` / `memos.md` / runs) | preserved, byte-identical |
| `.claude/` binding dir | empty or removed entirely |
| Project's `python -m pytest` | exit 0 |
| `git status` after uninstall | only deletions of canonical files visible; ledgers unmodified |
| Reinstall (`hi archon, install yourself` + URL bootstrap) | re-uses the preserved ledgers without overwriting |

## Demo recordings

<VideoPlaceholder test-id="uninstall-preserve" />

<AsciinemaPlaceholder test-id="uninstall-preserve" />

## Run records

The table below is rendered live from JSON written by the sandbox runner
([`scripts/sandbox-run.mjs`](https://github.com/fmw666/archon-protocol/blob/main/scripts/sandbox-run.mjs))
under `docs/testing/sandbox/runs/uninstall-preserve/`. To add a new row, run

```bash
node scripts/sandbox-run.mjs --only=uninstall-preserve
```

<RunRecords test-id="uninstall-preserve" />


## Known limitations

- Reinstall after uninstall (with preserved ledgers) is verified
  manually as part of step 6 here, but a dedicated
  `reinstall-after-preserve` scenario would isolate that flow more
  cleanly. Add when prioritised.

## Cross-references

- Protocol page: [`/setup/uninstall`](/setup/uninstall) §
  "Preserve / Archive / Delete"
- Agent file: [`https://aaep.site/uninstall.md`](https://aaep.site/uninstall.md)
- Pre-requisite: [02 install-claude-python](./install-claude-python) +
  [06 boot-claude-python](./boot-claude-python)
- Sibling: [12 uninstall-archive](./uninstall-archive) — same flow with
  the Archive option instead of Preserve.

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
      "name": "archon uninstall (preserve ledgers)",
      "cli": "uninstall",
      "flags": []
    }
  ],
  "assertions": [
    {
      "file_absent": "tools/archon-cli/bin/archon.mjs"
    },
    {
      "file_absent": ".cursor/commands/archon.md"
    },
    {
      "file_absent": ".archon/soul.md"
    },
    {
      "file_exists": ".archon/manifest.md"
    }
  ]
}
```

<!-- sandbox-spec:end -->
