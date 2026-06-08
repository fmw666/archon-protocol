# Archon — Install Protocol (agent-facing)

You are installing Archon into a target project for the first time. Follow
these steps in order.

If you haven't read `https://aaep.site/skill.md` yet, stop and read it first.
Steps 0 and 5 below assume you have already detected `$IDE_PLATFORM`,
`$BINDING_ROOT`, and the project language per `skill.md` §3 and §5.

---

## Step 0. Detect environment (if you haven't already)

Re-read `skill.md` §3 and §5 if these are not yet recorded:

- `$IDE_PLATFORM` ∈ { `cursor`, `codex`, `claude`, `continue`, `aider`,
  `windsurf`, `other` }
- `$BINDING_ROOT` (e.g. `.cursor/`, `.codex/`, `.claude/`)
- `$LANGUAGE` (your best inference from `package.json`, `pyproject.toml`,
  `go.mod`, `Cargo.toml`, `pom.xml`, etc.)
- `$HOOK_COMMAND` (per the language → hook table in `skill.md` §5)

If `$IDE_PLATFORM` cannot be determined automatically, **ask the user**
before proceeding. Defaulting to Cursor when the project clearly isn't a
Cursor project will pollute the wrong directory.

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
| `cli` | ask | User says "agent-only", or no Node ≥ 18 available |
| `dashboard` | ask | No Node ≥ 18 available, or user says "skip UI" |
| `extensions-demand-pool` | ask | Solo project, user says "no backlog extension" |

> Note: the `cli` and `dashboard` modules **require Node ≥ 18 at runtime**.
> The Archon framework itself (everything else) does not. Always ask before
> including these on projects without Node, even if `$LANGUAGE` is something
> like Go or Python that doesn't need Node otherwise.

Present your plan to the user:

```
I'll install Archon v{{VERSION}} into this {{LANGUAGE}} project.

IDE platform detected: {{IDE_PLATFORM}}  (binding root: {{BINDING_ROOT}})
Pre-commit hook: {{HOOK_COMMAND}}

Required modules (always installed):
  core-soul, core-contracts, core-templates, core-version, domain-lenses,
  commands, agents, rules, skills, scripts, legal — {{N}} files.

Optional modules:
  [ ] cli              (tools/archon-cli — 8 files, needs Node ≥ 18)
  [ ] dashboard        (.archon/dashboard — 13 files, needs Node ≥ 18)
  [ ] extensions-demand-pool  (.archon/extensions/demand-pool — 2 files)

Does this look right? Any you want to exclude or include?
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

> Note: in the current Archon release (v0.2.0) most source files are not yet
> parametrised — the manifest reports **0 placeholders in use**. Still ask
> `PROJECT_NAME` and `TECH_STACK` anyway, because in Step 7 (identity seeding)
> and Step 7b (codebase self-scan) you will fill `.archon/manifest.md` and
> personalise `.archon/soul.md` to reflect the user's project. Future releases
> will parametrise more files; this step will then become mechanical.

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

## Step 6. Write files to the project (with binding-root rewrite)

For each buffered file, determine its **target path** in the project:

- If `file.path` starts with `.cursor/` and `$IDE_PLATFORM != cursor`,
  rewrite the prefix: `.cursor/foo/bar.md` → `$BINDING_ROOT/foo/bar.md`.
- Otherwise write to `file.path` verbatim.

Then write the buffered bytes to `$PROJECT_ROOT/<target_path>`. Create
parent directories as needed.

Handle collisions:

- If the target file does not exist → write it.
- If the target file exists and is byte-identical → skip.
- If the target file exists and differs → you are **not** in install mode;
  fail with a clear message ("file already exists: … — was this a fresh
  install?"). The user should have started from `/update.md` or
  `/sync.md`.

> Why rewrite only the binding directory? The `.archon/` framework core,
> `scripts/`, `tools/`, and `LICENSE`/`NOTICE` are platform-neutral and
> always go to their canonical paths. Only the IDE binding files
> (commands / agents / rules / skills) are platform-specific.

---

## Step 7. Seed the runtime ledgers & identity

After all canonical files are written, create these **empty but valid**
runtime ledgers — the adopter now owns them. The five that ship a
`.archon/templates/*.template.md` (manifest, debt, drift, memos, decisions)
MUST be seeded by copying that template verbatim — never hand-constructed from
prose — so the result passes `archon-check` deterministically:

- `.archon/manifest.md` — project identity, tech stack, decision log index.
  **Seed it from the shipped template** `.archon/templates/manifest.template.md`
  (copy its content, then fill it in Step 7b). This guarantees every adopter
  starts from the canonical section set instead of an ad-hoc stub.
- `.archon/debt.md` — empty debt log. **Seed it from the shipped template**
  `.archon/templates/debt.template.md`. The template already satisfies the
  portable checker: a `## Archive Index` section, a `## Active Debt Index`
  section (with the columns `ID · Source · Severity · Compact Description ·
  Deadline · Status · Details`), and — since there is no debt yet — a literal
  `<!-- no-active-debt -->` marker line. Do **not** hand-construct it; an
  under-seeded debt.md fails `archon-check`.
- `.archon/drift.md` — drift log. **Seed it from the shipped template**
  `.archon/templates/drift.template.md`. The template carries the current-value
  sentinel `**drift: 0**`, a `## Archive Index` section, and a `## Log` section
  (these are what `archon-check` / `drift_gate` assert). Then append the install
  record from Step 9.
- `.archon/memos.md` — empty memos index. **Seed it from the shipped template**
  `.archon/templates/memos.template.md` — it carries the `## Archive Index` and
  `## Hot Memos` sections the checker requires.
- `.archon/signs.md` — empty signs table.
- `.archon/decisions.md` — empty project decision log. **Seed it from the
  shipped template** `.archon/templates/decisions.template.md`.
- `.archon/VERSION` — write the manifest's `version` string.

Also create empty directories so future records have a home:

- `.archon/drift/records/`
- `.archon/debt/items/`
- `.archon/memos/records/`
- `.archon/manifest/slices/` — only if Step 7b proposes path-scoped slices
  (large / monorepo projects); otherwise omit it (single-scope is the default).

You can leave a `.gitkeep` placeholder inside each empty directory.

Personalise `soul.md` and `manifest.md` by editing identity headers to
reflect `$PLACEHOLDERS.PROJECT_NAME`, `$PLACEHOLDERS.TECH_STACK`, etc. Do
this after the canonical content is written, not before — the canonical
content is what you verified against the checksum.

---

## Step 7b. Bootstrap the manifest from a codebase self-scan

A fresh manifest full of `<!-- hint -->` placeholders is dead weight. As the
engineering owner (soul §Ownership), you build the project's initial mental
model yourself instead of interrogating the user. Before reporting success,
**scan the existing codebase** and pre-fill the manifest template you just
seeded. This is read-only inspection — derive, don't ask:

1. **Tech Stack** — read the package manifests you already detected for
   `$LANGUAGE` (`package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`,
   `pom.xml`, etc.) and fill the Tech Stack table (layer · choice · version).
2. **Directory Structure** — `ls` / glob the top two levels of source and fill
   the Directory Structure table with one responsibility line per top-level
   dir. Do not enumerate files.
3. **Concept Glossary candidates** — skim README / top-level docs and the most
   central module names for product-specific terms whose common meaning would
   mislead. Add them as glossary rows (mark uncertain ones with a trailing
   `<!-- confirm -->`). Capture only product-domain terms, not framework or
   generic tech words (soul §Glossary scope).
4. **Source Modularity Map seeds** — for the one or two directories with the
   clearest file-naming convention, add a starter row (path glob · split axes ·
   fan-out trigger). Pick the smallest axis vocabulary that already explains how
   files differ today; leave the rest empty (an empty map is advisory, never
   blocking — ADR-29).
5. **Manifest slices (large / monorepo only)** — if the scan shows a
   multi-package layout (`packages/*`, `apps/*`, `services/*`, a workspaces /
   multi-module build), propose one slice per major subtree: create
   `.archon/manifest/slices/<slug>.md` with a `scope: <glob>` line plus the
   subtree-local glossary / modularity rows, and index each under the manifest
   `## Manifest Slices` section. For a single-package project, **skip this** —
   do not create the `slices/` directory (ADR-32; soul §Path-scoped slices).

Keep every inference lean and clearly provisional — the manifest is a living
file the owner refines each delivery, not a one-shot survey. Anything you are
unsure of stays a `<!-- hint -->` rather than a confident wrong value.

---

## Step 8. Wire the pre-commit hook (project-language-aware)

The portable contract checker is shipped as both a Python script and a Bash
wrapper:

- `scripts/archon-check.py` — Python 3 stdlib-only reference implementation.
- `scripts/archon-check.sh` — POSIX shell wrapper that delegates to
  `archon-check.py`.

There is **no Node implementation**. Pick the hook command based on the
project's developer environment, not on `$LANGUAGE` of the project itself:

| Developer environment | Hook command |
|-----------------------|--------------|
| Python 3 available | `python3 scripts/archon-check.py --root .` |
| Bash on Unix, Python available | `sh scripts/archon-check.sh .` |
| Windows + Python via `py` launcher | `py -3 scripts\archon-check.py --root .` |
| No Python available | Skip the hook; recommend `archon sync` before commits |

Wire the chosen command into the project's existing pre-commit infrastructure
if any (husky for Node projects, pre-commit framework for Python projects,
plain git hooks otherwise). Do **not** introduce husky onto a project that
doesn't already use it just to install this hook — recommend the lightest
mechanism the project already uses.

If the project has no existing pre-commit infrastructure, ask the user
whether to set one up. Don't add scaffolding silently.

---

## Step 9. Log the install

Append an install drift record to `.archon/drift.md`:

```
## install — Archon v{{VERSION}} — {{ISO_TIMESTAMP}}

- Agent: {{AGENT_NAME}} (e.g. Cursor / Claude Code / Codex / Continue / Aider / Windsurf / other)
- IDE platform: {{IDE_PLATFORM}}, binding root: {{BINDING_ROOT}}
- Modules installed: core-soul, core-contracts, core-templates,
  core-version, domain-lenses, commands, agents, rules, skills, scripts,
  legal, {{optional_modules_selected}}
- Files written: {{N}}
- Pre-commit hook command: {{HOOK_COMMAND}}
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
Archon v{{VERSION}} installed into {{IDE_PLATFORM}}.

- {{N}} files written to {{PROJECT_ROOT}}
- IDE bindings written to {{BINDING_ROOT}}
- Runtime ledgers initialised (.archon/{manifest,drift,debt,memos,signs,decisions}.md)
- Pre-commit hook: {{HOOK_COMMAND or "not configured"}}
- Install logged to .archon/drift.md

Next steps:
- Reload your AI coding session so the new bindings under {{BINDING_ROOT}}
  load. (For Cursor, this means opening a new chat; for Claude Code, restart
  the session; for Codex CLI, the next invocation will pick up AGENTS.md.)
- After reload, "hi archon, plan a feature for X" routes through the wake
  protocol — the URL is no longer required for subsequent commands.
- Browse the concepts reference: https://aaep.site/concepts/
- Read the 5-minute orientation: https://aaep.site/setup/quickstart
- When you want to upgrade later: say "update archon" (no URL needed once
  the wake rule is loaded).
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
- **Always** keep user's existing `$BINDING_ROOT/` files (theirs, not
  Archon's) intact.
- **Always** rewrite `.cursor/` path prefixes to `$BINDING_ROOT/` when
  `$IDE_PLATFORM != cursor`. Never write a `.cursor/` tree on a non-Cursor
  project.
- **Never** add a Node-based pre-commit hook. The shipped checker is
  Python; install only Python or Bash variants.

---

## CLI equivalent (optional, for users with Node ≥ 18)

```bash
npx @archon/cli@latest install         # interactive prompts
npx @archon/cli@latest install --yes   # accept all defaults, skip optional modules prompts
```

Both paths produce identical trees. The CLI itself requires Node ≥ 18; the
agent path described above does not.
