# Archon — Update Protocol (agent-facing)

You are upgrading an existing Archon installation in a target project to the
current canonical version on aaep.site. Follow these steps in order.

If you haven't read `https://aaep.site/skill.md` yet, stop and read it first.

---

## Step 1. Confirm the project has Archon installed

Verify these exist in `$PROJECT_ROOT`:

- `.archon/soul.md`
- `.archon/VERSION`

If either is missing, this is not an update — route to `/install.md` or
`/sync.md` instead.

Read `.archon/VERSION` and record `$INSTALLED_VERSION`.

---

## Step 2. Fetch the canonical manifest

```
GET https://aaep.site/manifest.json
```

Record `$CANONICAL_VERSION` (the manifest's `version`).

If `$INSTALLED_VERSION == $CANONICAL_VERSION`:

- Offer the user a **force-refresh** path that still re-verifies and rewrites
  any file whose sha256 differs from canonical, or
- Tell them they're up to date and offer to run `/sync.md` for a health check.

Otherwise continue.

---

## Step 3. Build the update plan

For every file in every required module plus every optional module already
installed (an optional module is "installed" if at least one of its files
exists in the project), do the following:

1. If the target file does not exist in the project → mark `ADD`.
2. If the target file exists and its sha256 matches the manifest → mark
   `UNCHANGED`; you will not touch it.
3. If the target file exists and its sha256 differs → mark `UPDATE`.

For optional modules that are **not** currently installed:

- Ask the user if they want to opt in during this update. Don't add them
  silently.

Present the plan:

```
Archon update: v{{INSTALLED_VERSION}} → v{{CANONICAL_VERSION}}

Files to add    ({{N_ADD}}): ...
Files to update ({{N_UPDATE}}): ...
Files unchanged ({{N_SAME}}): {{N_SAME}} (will not be touched)

Runtime ledgers that will be PRESERVED (never touched by update):
- .archon/debt.md, drift.md, manifest.md, memos.md, signs.md, decisions.md
- .archon/debt/, drift/, memos/, memos-archive/, manifest/, runs/
- .archon/dashboard/heartbeats/

Optional modules NOT currently installed:
- {{list}} — include any of these?

OK to proceed?
```

Wait for confirmation.

---

## Step 4. Fetch updates and verify

For every `ADD` and `UPDATE` file:

1. `GET` its `url`.
2. Compute sha256, compare against the manifest. If mismatch, abort the
   entire update (all-or-nothing).
3. Buffer in memory.

---

## Step 5. Write updates

For every `ADD`: write the file.

For every `UPDATE`:

1. Before overwriting, save a backup copy to
   `.archon-backup-<ISO>/<original-relative-path>`.
2. Overwrite with the new content.

For every `UNCHANGED`: do nothing.

**Never touch** any path listed in `manifest.runtime_ledger_paths.files` or
any path matching a prefix in `manifest.runtime_ledger_paths.directories`.
These are owned by the adopter, even if you think you know better.

---

## Step 6. Handle renames and removals

If the canonical manifest no longer lists a file that is present in the
project (for example, a module was restructured and a file moved), report
it to the user:

```
These files exist in your project but are no longer in canonical v{{CANONICAL_VERSION}}:
- .cursor/old-path/... (was in v{{INSTALLED_VERSION}})

Options: remove, leave alone, or show me where it moved to.
```

Do not auto-delete. The user decides.

---

## Step 7. Write new VERSION

Overwrite `.archon/VERSION` with `$CANONICAL_VERSION`.

---

## Step 8. Log the update

Append to `.archon/drift.md`:

```
## update — Archon v{{INSTALLED_VERSION}} → v{{CANONICAL_VERSION}} — {{ISO_TIMESTAMP}}

- Agent: {{AGENT_NAME}}
- Files added: {{N_ADD}}
- Files updated: {{N_UPDATE}} (backups at .archon-backup-<ISO>/)
- Files unchanged: {{N_SAME}}
- Files removed: 0 (any pruning was user-directed and listed above)
- Optional modules opted-in this update: {{list or "none"}}
- Source: https://aaep.site/manifest.json (sha256-verified)
```

---

## Step 9. Summarise

```
Archon upgraded: v{{INSTALLED_VERSION}} → v{{CANONICAL_VERSION}}

- {{N_UPDATE}} files updated (old copies in .archon-backup-<ISO>/)
- {{N_ADD}} files added
- {{N_SAME}} files already current
- Runtime ledgers untouched

See the changelog: https://aaep.site/changelog/framework
```

If anything user-visible changed in the framework (e.g. a new command, a new
sub-agent, a rule that now loads by default), mention it explicitly. The
agent should skim the changelog between the two versions and highlight
breaking or behavioural changes.

---

## Mandatory guardrails

- **All-or-nothing writes**. If any file fails sha256 verification, roll
  back — do not leave the project in a half-upgraded state.
- **Backups for every overwrite**. No in-place mutation without a copy.
- **Runtime ledgers are sacred**. Never touch them. If the user explicitly
  asks you to migrate ledger schemas, that's a different task — see
  `.archon/drift.md` in the authoring repo for migration records.
- **Respect user customisations**. If the user has edited a canonical file
  in place (detected: file exists, sha256 differs but isn't the previous
  canonical version either), ask them whether to preserve the edit or
  adopt canonical.

---

## CLI equivalent

```bash
npx archon@latest update
npx archon@latest update --force    # re-verify and rewrite even if versions match
```
