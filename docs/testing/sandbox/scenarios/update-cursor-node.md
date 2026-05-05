---
title: "07 · update-cursor-node"
test_id: update-cursor-node
fixture: fixtures/sandbox-node-ts (post-01, then a real demand committed)
ide: Cursor
language: Node 20 + TypeScript
stage: update
status: pending
---

# 07 · update-cursor-node

## What this scenario proves

Updating Archon from one tagged version to the next **must not
overwrite runtime ledgers** (`drift.md`, `debt.md`, `memos.md`,
`run/state` files) and **must update only the canonical files** whose
sha256 has changed.

Specifically:

1. The agent fetches a new `manifest.json` from `aaep.site` (or a
   pinned `?version=` query for reproducibility).
2. It diffs the local files against the new sha256 list.
3. It writes only changed files, keeping a `.bak` for any non-trivial
   overwrite.
4. `runtime_ledger_paths` from the manifest are **read-only** the
   entire time.
5. The `.archon/VERSION` file moves to the new version exactly once,
   at the end, with original line endings preserved.

## Test environment

| | |
|---|---|
| Fixture | output of scenario 01 + scenario 05 (i.e. has 1 real drift row) |
| IDE | Cursor |
| Manifest "from" version | v0.1.0 |
| Manifest "to" version | v0.1.1 (or any newer tag at run time) |
| OS | same as scenario 01 |

## Pre-conditions

1. Scenarios 01 + 05 both ✅.
2. `git status` is clean — pending changes would obscure the diff.
3. A newer tagged manifest exists at `aaep.site/manifest.json?version=v0.1.1`
   (or skip if not yet tagged — re-run when one ships).

## Steps

```text
1. In Cursor, paste exactly:
     hi archon, update yourself
   (URL-less; the wake rule routes this to the update protocol.)
2. The agent should:
   - fetch the new manifest
   - print a planned-changes table (file, old-sha, new-sha, action)
   - ask for confirmation
3. Confirm.
4. Watch it write changed files + create .bak siblings for any
   overwrite that isn't byte-identical to the prior canonical bytes.
5. Inspect `.archon/VERSION` — should match the new version.
6. Inspect `git diff` — only the planned files should appear changed.
7. Run `npm run validate` — should still be 0.
```

## Expected outcome

| Check | Expected |
|-------|----------|
| Agent prints a planned-changes table before writing | yes |
| `.archon/drift.md` row count | unchanged (preserved) |
| `.archon/debt.md` content | unchanged |
| `.archon/memos.md` content | unchanged |
| `.archon/VERSION` | matches the "to" manifest version |
| `python3 scripts/archon-check.py --root .` exit code | 0 |
| Any Cursor commands / rules / skills file changed only when its sha256 differs from the new manifest | yes |
| `npm run validate` exit code | 0 |
| For each non-trivially overwritten file, a `<file>.bak` exists | yes (or all bak files cleaned per protocol — match whichever the protocol page specifies) |

## Demo recordings

<VideoPlaceholder test-id="update-cursor-node" />

<AsciinemaPlaceholder test-id="update-cursor-node" />

## Run records

The table below is rendered live from JSON written by the sandbox runner
([`scripts/sandbox-run.mjs`](https://github.com/fmw666/archon-protocol/blob/main/scripts/sandbox-run.mjs))
under `docs/testing/sandbox/runs/update-cursor-node/`. To add a new row, run

```bash
node scripts/sandbox-run.mjs --only=update-cursor-node
```

<RunRecords test-id="update-cursor-node" />


## Known limitations

- This scenario cannot be executed until at least two consecutive
  tagged manifest versions exist on `aaep.site`. Until then the
  status stays ⏳ and the run record carries the "awaiting tag" note.
- Does not test rollback. A separate `update-rollback` scenario can
  be added if/when rollback is part of the protocol.

## Cross-references

- Protocol page: [`/setup/update`](/setup/update)
- Agent file: [`https://aaep.site/update.md`](https://aaep.site/update.md)
- Pre-requisite: [01](./install-cursor-node) + [05](./boot-cursor-node)
- Sibling: [08 update-cli-without-cli](./update-cli-without-cli)

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
      "name": "archon update (self-update)",
      "cli": "update",
      "flags": []
    }
  ],
  "assertions": [
    {
      "file_exists": ".archon/VERSION"
    },
    {
      "file_exists": ".archon/soul.md"
    },
    {
      "dir_exists": "tools/archon-cli"
    }
  ],
  "notes": "Same-version self-update (manifest only ships v0.1.0). Proves the update path is non-destructive. Extend when v0.2.0 ships to install a pinned older version first."
}
```

<!-- sandbox-spec:end -->
