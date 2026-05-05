# Uninstall Protocol (remove)

The protocol Archon agents and the CLI run when you decide to remove Archon
from a project. Destructive, but reversible-by-default — your governance
ledgers are preserved unless you explicitly choose otherwise.

> Agents fetch the executable instruction file at
> [`https://aaep.site/uninstall.md`](https://aaep.site/uninstall.md). This
> page is the human-readable view of what the agent will do.

## When this protocol applies

The user says:

- "uninstall archon"
- "remove archon"
- "I want to stop using archon"

The agent treats this as a destructive operation: every step asks for
explicit consent.

## Three choices for your ledgers

The first decision the agent presents:

| Mode | What happens to runtime ledgers | Default? |
|------|--------------------------------|----------|
| **P** Preserve in place | Stay under `.archon/`; the framework files around them are removed | ✓ default |
| **A** Archive | Move to `.archon-history-<ISO>/`, then remove from `.archon/` | |
| **D** Delete | Wiped permanently — requires typing the literal word `DELETE` | |

`runtime_ledger_paths` covers both files (`drift.md`, `debt.md`, …) and
directories (`drift/`, `debt/`, `runs/`, `dashboard/heartbeats/`, …).

The default (Preserve) means a future re-install resumes from your existing
governance history — install + the same ledgers = picking up where you left
off.

## The 8 steps

### 1. Confirm intent and ledger mode

Explain the three choices. Wait for explicit P / A / D selection.

If user picks **D**, require them to type `DELETE` exactly. Anything else
aborts.

### 2. Fetch the manifest

```
GET https://aaep.site/manifest.json
```

To know exactly which paths Archon owns. Files outside the manifest will
**never** be touched.

### 3. Build the removal set

For every canonical file present in the project, classify:

- **REMOVE** if not in `runtime_ledger_paths`.
- **LEDGER** if it is — handled per ledger mode in step 4.

### 4. Handle ledgers per choice

| Mode | Action |
|------|--------|
| **Preserve** | No changes to ledger files/dirs. They stay in place. |
| **Archive** | `mkdir .archon-history-<ISO>/` → move every ledger path into it → remove the original from `.archon/`. |
| **Delete** | Remove every ledger path entirely. |

### 5. Remove framework files

Print the full removal list. Ask one final confirmation. Then remove.

### 6. Final cleanup

Prune empty Archon-owned directories (`.archon/`, `.cursor/commands/`, etc.)
that resulted from the removal. **Never touch** sibling directories with
non-Archon content — for example, `.cursor/rules/` may still contain user
rules that don't start with `archon`.

### 7. Log the uninstall

Write `.archon-uninstall-<ISO>.log` to the project root with:

- Timestamp.
- Manifest version.
- Ledger mode chosen.
- Full list of removed paths.
- Archive location (if Archive mode).

This log lives outside `.archon/` so it survives even Delete mode.

### 8. Summarise

Print a concise summary:

- ✓ N files removed.
- 📁 Ledgers: preserved / archived to `<path>` / deleted.
- 🪵 Log written to `.archon-uninstall-<ISO>.log`.
- 💡 To reinstall later: `npx @archon/cli@latest install` (your ledgers will
  resume if Preserved or Archived).

## Safety guarantees

- Default mode is **Preserve** — destructive choices require explicit opt-in.
- Delete mode requires typing `DELETE` literally. No one-click disasters.
- Files not in the canonical manifest are **never** touched. The agent
  refuses to delete anything it can't prove Archon owns.
- The uninstall log is written **outside** `.archon/` so you have a record
  even after a Delete-mode uninstall.

## CLI equivalent

```bash
# preserve ledgers (default)
npx @archon/cli@latest uninstall

# archive ledgers to .archon-history-<ISO>/
npx @archon/cli@latest uninstall --archive-ledgers

# DESTRUCTIVE — wipes ledgers, requires DELETE confirmation
npx @archon/cli@latest uninstall --delete-ledgers

# preview what would happen, write nothing
npx @archon/cli@latest uninstall --dry-run
```

## Reinstalling after uninstall

If you preserved or archived ledgers, a future re-install will restore them:

```bash
# preserved: ledgers are still in .archon/, just re-install framework around them
npx @archon/cli@latest install --force

# archived: move them back first, then install
mv .archon-history-<ISO>/* .archon/
npx @archon/cli@latest install --force
```

`--force` tells install to skip the "already installed" refuse-check and
re-fetch the framework files.

## Raw agent file

[`https://aaep.site/uninstall.md`](https://aaep.site/uninstall.md)

## What's next

- Going somewhere else? Take your `.archon-history-<ISO>/` archive with you
  — it's just markdown, readable in any editor.
- Coming back? See [Install](/setup/install).
- The full lifecycle this command sits in: [Complete Lifecycle](/setup/lifecycle).
