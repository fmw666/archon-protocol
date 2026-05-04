# Agent Uninstall Protocol

Human-readable view of [`aaep.site/uninstall.md`](https://aaep.site/uninstall.md).

## When the agent applies this protocol

The user says:

- "uninstall archon"
- "remove archon"

This is a destructive operation; every step asks for explicit consent.

## The 8 steps

1. **Confirm intent** — explain what "uninstall" means for runtime ledgers
   (your governance history). Offer three ledger choices:
   - **P** Preserve in place (default, safe)
   - **A** Archive to `.archon-history-<ISO>/` then remove from `.archon/`
   - **D** Delete entirely (requires typing `DELETE`)
2. **Fetch the manifest** to know exactly which files Archon owns.
3. **Build the removal set** — canonical files present in project, excluding
   runtime-ledger paths.
4. **Handle ledgers per choice**.
5. **Remove files** — print the list first, confirm one last time, then remove.
6. **Final cleanup** — prune empty Archon-owned directories. Never touch
   sibling directories with non-Archon content.
7. **Log the uninstall** — write `.archon-uninstall-<ISO>.log` to the project
   root with the removal list and ledger mode.
8. **Summarise** — how many files removed, where ledgers went, how to
   reinstall later.

## Safety defaults

- Ledgers are **preserved in place** by default. You can always reinstall
  later and keep your history.
- `--delete-ledgers` requires a literal `DELETE` confirmation string. One-click
  disaster is impossible.
- Files not in the canonical manifest are **never** touched — the agent
  refuses to delete anything it can't prove Archon owns.

## The CLI equivalent

```bash
npx @archon/cli@latest uninstall                      # preserve ledgers (default)
npx @archon/cli@latest uninstall --archive-ledgers    # move ledgers to .archon-history-<ISO>/
npx @archon/cli@latest uninstall --delete-ledgers     # DESTRUCTIVE, requires confirmation
npx @archon/cli@latest uninstall --dry-run
```

## Raw source

[`https://aaep.site/uninstall.md`](https://aaep.site/uninstall.md)
