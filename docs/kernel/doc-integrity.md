---
outline: deep
---

# Document Integrity Protocol

> **Kernel module: `fsck` for the protocol's own documentation.**
> Enforces single source of truth, change propagation, and consistency invariants.
> Deploy as `.cursor/rules/archon-doc-integrity.md` or include as workflow final step.

## Why This Exists

The protocol itself is a documentation system — drivers, syscalls, daemons all live as markdown files. Without an integrity protocol, edits create drift: a driver gets updated but `reference/constraints.md` still shows the old prohibitions. This module prevents that.

## Principle: Single Source of Truth

`docs/` is the canonical source. All other locations are **derived copies**:

```
docs/  (source of truth)
  ├── drivers/code-quality.md
  ├── syscalls/demand.md
  └── daemons/self-auditor.md
       │
       ├──deploy──>  .cursor/rules/   .cursor/agents/   (Cursor)
       ├──deploy──>  .claude/skills/  .claude/agents/    (Claude Code)
       └──ripple──>  reference/  ai-index.md  README.md  init.md
```

### Hard Rule

- ❌ Edit a deployed copy (`.cursor/rules/archon-driver-*.md`, `.cursor/agents/archon-*.md`) directly — always edit `docs/` source, then re-deploy
- ❌ Add a new component without registering it in the propagation targets
- ❌ Delete a source file without cleaning up all references

## Ripple Propagation Graph

When a source file changes, follow this propagation graph to update all downstream references:

### Content changes (edit existing file)

| Changed file | Propagate to |
|-------------|-------------|
| `docs/drivers/<name>.md` | → `docs/reference/constraints.md` (update summary) |
| | → deployed copy (re-deploy to environment) |
| | → `tests/` (if ❌ prohibitions added/removed) |
| `docs/syscalls/<name>.md` | → `docs/reference/commands.md` (update description) |
| | → deployed copy |
| `docs/daemons/<name>.md` | → `docs/reference/commands.md` (internal workflows table) |
| | → deployed copy |
| `docs/kernel/*.md` | → `.cursor/rules/archon-kernel.md` or `archon-doc-integrity.md` |
| | → `AGENTS.md` (fallback) |

### Structural changes (add/remove component)

| Action | Must update ALL of these |
|--------|-------------------------|
| Add driver | `docs/drivers/index.md`, `.cursor/rules/archon-kernel.md` (Drivers table), `ai-index.md`, `docs/reference/constraints.md`, `docs/public/init.md`, `docs/syscalls/init.md`, `README.md` |
| Remove driver | Same list — remove references |
| Add syscall | `docs/syscalls/index.md`, `.cursor/rules/archon-kernel.md` (Syscalls table), `ai-index.md`, `docs/reference/commands.md`, `docs/public/init.md`, `README.md` |
| Remove syscall | Same list — remove references |
| Add daemon | `docs/daemons/index.md`, `.cursor/rules/archon-kernel.md` (Daemons table), `ai-index.md`, `docs/reference/commands.md`, `docs/public/init.md` |
| Remove daemon | Same list — remove references |

## Consistency Invariants

These are always-true conditions. Violations indicate drift.

| ID | Invariant | Checked by |
|----|-----------|-----------|
| CI-1 | Driver count in kernel tables = file count in `docs/drivers/` (excluding `index.md`) | `/archon-audit`, `pnpm test` |
| CI-2 | Syscall count in kernel tables = file count in `docs/syscalls/` (excluding `index.md`) | `/archon-audit`, `pnpm test` |
| CI-3 | Daemon count in kernel tables = file count in `docs/daemons/` (excluding `index.md`) | `/archon-audit`, `pnpm test` |
| CI-4 | Every name in kernel tables has a corresponding `docs/` file | `/archon-audit`, `pnpm test` |
| CI-5 | Every ❌ prohibition in `docs/reference/constraints.md` exists in its source `docs/drivers/*.md` | `/archon-audit` |
| CI-6 | Every deployed file in `.cursor/rules/archon-*` or `.cursor/agents/archon-*` traces to a `docs/` source | `/archon-init` health check |
| CI-7 | `docs/public/init.md` lists all drivers, syscalls, and daemons | `/archon-audit` |
| CI-8 | `pnpm test` passes | Every workflow, CI |
| CI-10 | Git coupling pairs (files that frequently co-change) are all accounted for in the propagation graph | `pnpm lint:coupling` |

## Coupling Analysis

Files that frequently change together in git history reveal **implicit dependencies** that the propagation graph should cover. The `scripts/lint-coupling.mjs` script mines git history to discover these pairs and validates them against the documented propagation rules.

- **Documented pair**: both files appear in the same propagation chain → `✅`
- **Undocumented pair**: files co-change ≥ 3 times in 90 days but have no propagation link → `⚠️` investigate
- **Same directory**: co-changes within the same directory are expected → auto-pass

Run manually: `node scripts/lint-coupling.mjs [days] [min-co-changes]`

When undocumented coupling is found:
1. If the coupling is real → add the pair to the propagation table above
2. If the coupling is accidental (e.g., unrelated files touched in a batch commit) → no action needed, but document the exception

## Workflow Integration

### As workflow final step

In `/archon-demand` Stage 3.6 (Knowledge Evolution) and Stage 4 (Fix), check:

1. Did this task change any `docs/` file? → follow ripple propagation
2. Did this task add/remove a component? → follow structural change checklist
3. Run `pnpm test` → CI-8

### As standalone check

Run `/archon-audit` Phase 3 (Rule Compliance) to verify all invariants.

### As health check

Run `/archon-init` on an existing installation to verify CI-6 (no orphan deploys) and CI-1 through CI-4 (count/name match).

## Self-Healing Strategy

| Severity | Condition | Action |
|----------|-----------|--------|
| **Auto-fix** | Stale reference count, outdated summary | Fix inline during current task, report in output |
| **Warn** | Deployed copy differs from source | Report delta, suggest re-deploy |
| **Halt** | Missing source file, contradictory prohibitions, broken invariant CI-5 | Stop current task, report to user, suggest `/archon-init` health check |

## Prohibitions

- ❌ Editing `.cursor/rules/archon-driver-*.md` or `.cursor/agents/archon-*.md` without updating `docs/` source — deployed copies are derived, not authoritative
- ❌ Adding a new driver/syscall/daemon without updating all propagation targets — creates invisible drift
- ❌ Marking a task complete when `pnpm test` fails — CI-8 is non-negotiable
- ❌ Deleting a `docs/` source file without grep-searching for all references — orphan links are silent failures
