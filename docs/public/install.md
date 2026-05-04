# Archon — Install Protocol (agent-facing)

You are installing Archon into a target project for the first time. Follow
these steps in order.

If you haven't read `https://aaep.site/skill.md` yet, stop and read it first.

---

## Step 1. Verify this is a fresh install

Check the target project (call it `$PROJECT_ROOT`). If any of these already
exist, this is **not** a fresh install — go to `/update.md` or `/sync.md`
instead:

- `$PROJECT_ROOT/.archon/soul.md`
- `$PROJECT_ROOT/.archon/VERSION`

If the user explicitly asks for a forced re-install, warn them, back up the
existing `.archon/` tree to `.archon-backup-<ISO-timestamp>/`, and proceed.

---

## Step 2. Fetch the manifest

```
GET https://aaep.site/manifest.json
```

Parse it. Record these fields:

- `version` — you will write this into `.archon/VERSION`.
- `modules[]` — the authoritative file list.
- `placeholders` — values you need to collect from the user.
- `runtime_ledger_paths` — for your knowledge; these are created empty on
  fresh install.

If the fetch fails, report the error and stop. Do not proceed with a partial
manifest.

---

## Step 3. Inspect environment & propose module selection

Inspect the project and decide which **optional** modules to include. Always
include every **required** module (they are marked `required: true` in the
manifest). For each optional module, use this rubric:

| Module | Default | Skip if… |
|--------|---------|----------|
| `cli` | include | User says "agent-only" or `tools/` is disallowed |
| `dashboard` | ask | No Node runtime on the machine, or user says "skip UI" |
| `extensions-demand-pool` | ask | Solo project, user says "no backlog extension" |

Present your plan to the user:

```
I'll install Archon v{{VERSION}}. The 11 required modules (core-soul,
core-contracts, core-templates, core-version, domain-lenses, commands,
agents, rules, skills, scripts, legal) will always be included — that's
{N} files.

Optional modules I recommend including based on this project:
- [ ] cli              (tools/archon-cli — 8 files)
- [ ] dashboard        (.archon/dashboard — 13 files)
- [ ] extensions-demand-pool  (.archon/extensions/demand-pool — 2 files)

Does this look right? Any you want to exclude?
```

Wait for confirmation.

---

## Step 4. Collect placeholder values

The manifest's `placeholders` object describes each token that may appear
inside files (strings like `{{PROJECT_NAME}}`). For each required
placeholder that is not derived, ask the user. For derived ones, compute
them yourself.

Typical set:

- `PROJECT_NAME` (required) — ask the user.
- `PROJECT_SLUG` (derived) — lowercase `PROJECT_NAME`, replace runs of
  non-alphanumerics with `-`, strip leading/trailing `-`.
- `TECH_STACK` (required) — ask; one-liner.
- `DOMAIN` (optional) — ask; one-liner.
- `OWNER` (optional) — ask.

Store the resolved map as `$PLACEHOLDERS`.

> Note: in the current Archon release (v0.1.0) most source files are not yet
> parametrised — the manifest reports **0 placeholders in use**. Still ask
> `PROJECT_NAME` and `TECH_STACK` anyway, because once you reach Step 7
> (identity seeding) you will edit `.archon/soul.md` and
> `.archon/manifest.md` by hand to reflect the user's project. Future
> releases will parametrise more files; this step will then become
> mechanical.

---

## Step 5. Fetch every file and verify

For each file in every selected module:

1. `GET` its `url`.
2. Compute sha256 of the response body.
3. Compare against the manifest's `sha256` field. If mismatch, abort and
   report — do not partial-write.
4. Substitute any `{{PLACEHOLDER}}` tokens using `$PLACEHOLDERS`.
5. Buffer in memory; do not write yet.

This way, a mid-download failure leaves the project untouched.

Tip: fetch files in parallel for speed, but keep the sha256 verification
sequential and strict.

---

## Step 6. Write files to the project

For each buffered file, write to `$PROJECT_ROOT/{file.path}`. Create parent
directories as needed.

Handle collisions:

- If the target file does not exist → write it.
- If the target file exists and is byte-identical → skip.
- If the target file exists and differs → you are **not** in install mode;
  fail with a clear message ("file already exists: … — was this a fresh
  install?"). The user should have started from `/update.md` or
  `/sync.md`.

---

## Step 7. Seed the runtime ledgers & identity

After all canonical files are written, create these **empty but valid**
runtime ledgers — the adopter now owns them:

- `.archon/manifest.md` — project identity, tech stack, decision log index.
  Use the canonical `.archon/templates/` if present; otherwise produce a
  short header from `$PLACEHOLDERS`.
- `.archon/debt.md` — empty debt log with one header row.
- `.archon/drift.md` — empty drift log; immediately append the install
  record from Step 9.
- `.archon/memos.md` — empty memos index.
- `.archon/signs.md` — empty signs table.
- `.archon/decisions.md` — empty decision index.
- `.archon/VERSION` — write the manifest's `version` string.

Also create empty directories so future records have a home:

- `.archon/drift/records/`
- `.archon/debt/items/`
- `.archon/memos/records/`

You can leave a `.gitkeep` placeholder inside each empty directory.

Personalise `soul.md` and `manifest.md` by editing identity headers to
reflect `$PLACEHOLDERS.PROJECT_NAME`, `$PLACEHOLDERS.TECH_STACK`, etc. Do
this after the canonical content is written, not before — the canonical
content is what you verified against the checksum.

---

## Step 8. Install Cursor surface files

All files with paths starting `.cursor/commands/`, `.cursor/agents/`,
`.cursor/rules/`, `.cursor/skills/` should be written verbatim. They are
designed to coexist with the user's existing `.cursor/` content. Never
delete anything you didn't write.

If the user is not on Cursor, tell them: these `.cursor/` files are
Cursor-specific, and other coding agents (Claude Code, etc.) will need the
equivalent translated into their rule / skill format. The content itself
(plain markdown) remains usable as reference material even without Cursor.

---

## Step 9. Log the install

Append an install drift record to `.archon/drift.md`:

```
## install — Archon v{{VERSION}} — {{ISO_TIMESTAMP}}

- Agent: {{AGENT_NAME}} (e.g. Cursor / Claude Code / Codex)
- Modules installed: core-soul, core-contracts, core-templates,
  core-version, domain-lenses, commands, agents, rules, skills, scripts,
  legal, {{optional_modules_selected}}
- Files written: {{N}}
- Placeholder values:
  - PROJECT_NAME: {{VALUE}}
  - TECH_STACK: {{VALUE}}
  - …
- Source: https://aaep.site/manifest.json (sha256-verified)
```

This is the first entry in the project's governance history. From here
onwards, the agent owns this log.

---

## Step 10. Report summary to the user

Print a concise summary:

```
Archon v{{VERSION}} installed.

- {{N}} files written to {{PROJECT_ROOT}}
- Runtime ledgers initialised (.archon/{manifest,drift,debt,memos,signs,decisions}.md)
- Install logged to .archon/drift.md

Next steps:
- Open a new Cursor session. The archon.mdc rule + archon-wake.mdc will
  auto-load. Say "hi archon" to wake the framework.
- Browse the concepts reference: https://aaep.site/concepts/
- Read the 5-minute orientation: https://aaep.site/setup/quickstart
- When you want to upgrade: say "update archon" or run `npx archon update`.
```

---

## Mandatory guardrails

- **Never** write outside the target project root.
- **Never** write any path not listed in the manifest (with the exception
  of the runtime ledger files seeded in Step 7 and the `.gitkeep`
  placeholders in empty record directories).
- **Always** write files in an all-or-nothing batch: either every verified
  file gets written, or none do.
- **Always** verify sha256 before writing.
- **Always** keep user's existing `.cursor/` files (theirs, not Archon's)
  intact.

---

## CLI equivalent

```bash
npx archon@latest install         # interactive prompts
npx archon@latest install --yes   # accept all defaults, skip optional modules prompts
```

Both paths produce identical trees.
