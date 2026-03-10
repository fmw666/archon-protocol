---
description: "Document integrity protocol — enforces consistency across protocol docs. Source: docs/kernel/doc-integrity.md"
globs: ["docs/**/*.md", "ai-index.md", "README.md", ".cursor/rules/archon-*.md", ".cursor/agents/archon-*.md"]
---

# Document Integrity Protocol

> Source of truth: `docs/kernel/doc-integrity.md`

## Single Source of Truth

`docs/` is canonical. All `.cursor/rules/archon-*` and `.cursor/agents/archon-*` files are **derived copies**.

- ❌ Edit a deployed copy directly — edit `docs/` source, then re-deploy
- ❌ Add a component without updating all propagation targets
- ❌ Delete a source file without cleaning up references

## Ripple Propagation (content change)

| Changed | Also update |
|---------|------------|
| `docs/drivers/<name>.md` | `docs/reference/constraints.md`, deployed copy, `tests/` |
| `docs/syscalls/<name>.md` | `docs/reference/commands.md`, deployed copy |
| `docs/daemons/<name>.md` | `docs/reference/commands.md`, deployed copy |
| `docs/kernel/*.md` | `.cursor/rules/archon-kernel.md`, `AGENTS.md` |

## Ripple Propagation (structural change)

| Action | Must update ALL |
|--------|----------------|
| Add/remove driver | `docs/drivers/index.md`, kernel (Drivers table), `ai-index.md`, `reference/constraints.md`, `public/init.md`, `syscalls/init.md`, `README.md` |
| Add/remove syscall | `docs/syscalls/index.md`, kernel (Syscalls table), `ai-index.md`, `reference/commands.md`, `public/init.md`, `README.md` |
| Add/remove daemon | `docs/daemons/index.md`, kernel (Daemons table), `ai-index.md`, `reference/commands.md`, `public/init.md` |

## Consistency Invariants

| ID | Rule |
|----|------|
| CI-1..3 | Component counts in kernel tables = file counts in `docs/{drivers,syscalls,daemons}/` |
| CI-4 | Every kernel table name has a corresponding `docs/` file |
| CI-5 | `reference/constraints.md` summaries match `docs/drivers/` content |
| CI-6 | Every `.cursor/rules/archon-*` traces to a `docs/` source |
| CI-7 | `docs/public/init.md` lists all components |
| CI-8 | `pnpm test` passes |

## Workflow Integration

After any task that touches `docs/`:
1. Did content change? → follow content ripple propagation
2. Did structure change (add/remove)? → follow structural propagation
3. Run `pnpm test` → CI-8

## Self-Healing

- **Auto-fix**: Stale counts, outdated summaries → fix inline
- **Warn**: Deployed copy differs from source → suggest re-deploy
- **Halt**: Missing source, contradictions → stop, report, suggest `/archon-init`

## Prohibitions

- ❌ Editing deployed copies without updating `docs/` source
- ❌ Adding components without full propagation
- ❌ Marking task complete when `pnpm test` fails
- ❌ Deleting `docs/` files without searching for references
