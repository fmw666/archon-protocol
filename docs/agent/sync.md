# Agent Sync Protocol

Human-readable view of [`aaep.site/sync.md`](https://aaep.site/sync.md).

## When the agent applies this protocol

The user says:

- "check archon", "is archon healthy"
- "sync archon", "any archon drift"
- "diff archon"

This is **read-only**. Nothing is written (except an optional memo if the
sync surfaces genuinely notable findings).

## The 7 steps

1. **Inspect the project** — refuse if no `.archon/soul.md`.
2. **Fetch the canonical manifest**.
3. **Build the canonical set** — filter to modules the project has at least
   one file of (skip uninstalled optionals like dashboard).
4. **Walk the project and compare** — classify each file under Archon-owned
   directories as `ok` / `modified` / `missing` / `extra` / `ledger`.
5. **Print the report** — per-file diff headers for modified files,
   per-module summary, total counts.
6. **Offer follow-ups** — suggest `/update.md` if drift exists, investigate
   extras if they look stale.
7. **Log the sync (optional)** — append a brief memo to `.archon/memos.md`
   only if findings are interesting enough to remember.

## Classifications

| Label | Meaning |
|-------|---------|
| `ok` | Path is in canonical AND sha256 matches |
| `modified` | Path is in canonical AND sha256 differs (user edited a framework file) |
| `missing` | Path is in canonical AND not present in project (file was deleted or never installed) |
| `extra` | Path is in an Archon-owned directory but not in canonical (either project-owned custom or stale from an old version) |
| `ledger` | Path is in `runtime_ledger_paths` — intentionally not diffed; owned by project |

## The CLI equivalent

```bash
npx @archon/cli@latest sync           # human-readable report
npx @archon/cli@latest sync --json    # machine-readable, pipeable
```

## Raw source

[`https://aaep.site/sync.md`](https://aaep.site/sync.md)
