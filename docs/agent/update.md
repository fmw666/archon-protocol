# Agent Update Protocol

Human-readable view of [`aaep.site/update.md`](https://aaep.site/update.md).

## When the agent applies this protocol

The user says:

- "update archon"
- "upgrade archon"
- "pull latest archon"

and `.archon/soul.md` + `.archon/VERSION` already exist.

## The 9 steps

1. **Confirm Archon is installed** — route to install/sync if not.
2. **Fetch canonical manifest** — detect current vs canonical version.
3. **Build update plan** — per-file classification: ADD / UPDATE / UNCHANGED.
   Ask about optional modules not yet installed.
4. **Download and verify** — same all-or-nothing sha256 discipline as install.
5. **Write updates with backup** — every overwrite first copies the previous
   version to `.archon-backup-<ISO>/`. New files get written directly.
6. **Handle renames/removals** — files no longer in canonical are reported to
   the user, never auto-deleted.
7. **Write new VERSION** — update `.archon/VERSION` to match manifest.
8. **Log the update** — append drift record: old version → new version,
   counts, module deltas, source URL.
9. **Summarise** — highlight breaking / behavioural changes from the
   changelog between the two versions.

## What is **never** touched

The manifest's `runtime_ledger_paths` list is sacred:

**Files:**
- `.archon/manifest.md`
- `.archon/drift.md`
- `.archon/debt.md`
- `.archon/memos.md`
- `.archon/signs.md`
- `.archon/decisions.md`

**Directories:**
- `.archon/debt/`
- `.archon/drift/`
- `.archon/memos/`
- `.archon/memos-archive/`
- `.archon/manifest/`
- `.archon/dashboard/heartbeats/`
- `.archon/runs/`

These are your project's governance history. Archon upgrades cannot change
them — only you can.

## The CLI equivalent

```bash
npx @archon/cli@latest update
npx @archon/cli@latest update --force    # re-verify even if versions match
npx @archon/cli@latest update --dry-run
```

## Raw source

[`https://aaep.site/update.md`](https://aaep.site/update.md)
