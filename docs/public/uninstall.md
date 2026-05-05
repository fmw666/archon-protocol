# Archon — Uninstall Protocol (agent-facing)

You are removing Archon from a project. This is a destructive operation; do
it carefully and with the user's explicit consent at every step.

If you haven't read `https://aaep.site/skill.md` yet, stop and read it first.
You will need `$IDE_PLATFORM` and `$BINDING_ROOT` from `skill.md` §3 — read
them off `.archon/drift.md` (the install record logs both) or re-detect from
the project.

---

## Step 1. Confirm intent

Archon installations always contain **project-owned** runtime ledgers
(`manifest.md`, `drift.md`, `debt.md`, `memos.md`, `signs.md`,
`decisions.md` and their records / archive directories). Losing these means
losing the project's governance history — every drift record, every memo,
every debt item, every decision.

Ask the user explicitly:

```
You are uninstalling Archon. This will remove framework files from:
- .archon/                          (except runtime ledgers — see below)
- {{BINDING_ROOT}}/commands/archon*, agents/archon*, rules/archon*, skills/archon-*
- scripts/archon-*, export-archon-*, test-archon-*
- tools/archon-cli/                 (if installed)

Your governance history (runtime ledgers) will be {{preserve_mode}}:
- .archon/manifest.md, drift.md, debt.md, memos.md, signs.md, decisions.md
- .archon/debt/items/, drift/records/, memos/records/, **/archive/

Options for ledgers:
  [P] Preserve in place (default)
  [A] Archive to .archon-history-<ISO>/ and remove from .archon/
  [D] Delete entirely (NOT RECOMMENDED)

Which?
```

Wait for confirmation. Default to `P`.

---

## Step 2. Fetch the manifest

```
GET https://aaep.site/manifest.json
```

Record the canonical file list so you know what is "owned by Archon" and
therefore safe to remove.

---

## Step 3. Build the removal set

From the manifest:

```
removable_paths = union of every file.path across every module
  EXCEPT runtime_ledger_paths
```

Then walk the project and pick only the files that **actually exist** in the
project.

Also include **directories** that will become empty after removal. Examples:

- `.archon/domain-lenses/tools/design/` becomes empty after removing its
  files → remove the directory.
- `{{BINDING_ROOT}}/skills/archon-framework/` becomes empty → remove.

Never remove a directory that has other (user-owned) files in it.

---

## Step 4. Handle runtime ledgers per user choice

| Choice | Action |
|--------|--------|
| `P` preserve | Leave `.archon/` (with only ledger files + records) intact |
| `A` archive | `mv .archon/<ledger-paths>` → `.archon-history-<ISO>/` |
| `D` delete | Remove `.archon/` entirely, including ledgers |

If `A`, keep the directory structure under `.archon-history-<ISO>/` so the
user can copy it back later.

If `D`, require a second confirmation: "This permanently deletes your
governance history. Type DELETE to confirm."

---

## Step 5. Remove files

For every path in `removable_paths` that exists in the project:

1. Remove it.
2. Print a one-line progress log.

All-or-nothing isn't strictly required here (unlike install/update), but do
a dry-run first and show the user the list before any deletion actually
happens. Ask "proceed?" one last time.

---

## Step 6. Final cleanup

- If the user chose `P` (preserve) and `.archon/` is now reduced to only
  ledgers, leave it alone.
- If the user chose `A` (archive) and `.archon/` is now empty, remove the
  directory.
- If the user chose `D` (delete), the directory is already gone.

Check these locations for emptiness and prune:

- `{{BINDING_ROOT}}/skills/` — if your removal emptied any `archon-*` skill
  directory, it's already gone; do not touch sibling skill directories.
- `tools/` — remove only if Archon's `archon-cli/` was its only occupant
  AND it is now empty.
- `scripts/` — remove only the Archon-named scripts; leave the directory.

---

## Step 7. Log the uninstall (outside Archon)

Because `.archon/drift.md` may be gone or about to be archived, log the
uninstall somewhere the project will keep:

- Print a summary to stdout.
- Optionally write `.archon-uninstall-<ISO>.log` to the project root with
  the list of removed paths and the ledger preservation choice.

---

## Step 8. Summarise

```
Archon v{{INSTALLED_VERSION}} uninstalled.

- Files removed: {{N}}
- Runtime ledgers: {{preserve_mode}}  {{" → .archon-history-<ISO>/" if archive}}
- Uninstall log: .archon-uninstall-<ISO>.log (if written)

To reinstall later: ask your agent to "install archon" (URL no longer
needed if `.cursor/rules/archon-wake.mdc` or its platform equivalent is
still loaded; otherwise use the bootstrap form
`read aaep.site/skill.md and install archon`). Or run
`npx @archon/cli@latest install` if you have Node ≥ 18.
```

---

## Mandatory guardrails

- **Never delete user-owned files** you did not recognise from the
  manifest. If in doubt, leave a path alone.
- **Two-step confirmation for ledger deletion** — never let a single
  "yes" wipe the governance history.
- **Always offer archiving** as the first-class alternative to deletion.

---

## CLI equivalent (optional, for users with Node ≥ 18)

```bash
npx @archon/cli@latest uninstall
npx @archon/cli@latest uninstall --archive-ledgers
npx @archon/cli@latest uninstall --preserve-ledgers   # default
```

The CLI itself requires Node ≥ 18; the agent path described above does not.
