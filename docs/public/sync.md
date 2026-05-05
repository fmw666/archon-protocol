# Archon — Sync Protocol (agent-facing)

You are running a **read-only health check** comparing a project's Archon
files against the canonical distribution on aaep.site. No writes happen in
this command. The output is a diff report the user can review before
deciding whether to run `update` or hand-fix.

If you haven't read `https://aaep.site/skill.md` yet, stop and read it first.
You will need `$IDE_PLATFORM` and `$BINDING_ROOT` from `skill.md` §3 — read
them off `.archon/drift.md` (the install record logs both) or re-detect from
the project.

---

## Step 1. Inspect the project

In `$PROJECT_ROOT`:

- If `.archon/soul.md` does not exist → respond "Archon is not installed;
  route to `/install.md` instead."
- Read `.archon/VERSION` → `$INSTALLED_VERSION`.

---

## Step 2. Fetch the canonical manifest

```
GET https://aaep.site/manifest.json
```

Record `$CANONICAL_VERSION`.

---

## Step 3. Build the canonical set

From the manifest, build a map:

```
canonical_files = { path: {sha256, module, bytes}, ... }
```

Iterate every module; include required + any optional module that has at
least one file present in the project.

---

## Step 4. Walk the project and compare

Walk these trees (they are the Archon surface — do not scan the rest of the
project):

- `$PROJECT_ROOT/.archon/` (excluding `runtime_ledger_paths`)
- `$PROJECT_ROOT/$BINDING_ROOT/commands/`,
  `$BINDING_ROOT/agents/`, `$BINDING_ROOT/rules/`,
  `$BINDING_ROOT/skills/archon-*`,
  `$BINDING_ROOT/skills/blink-dispatch`,
  `$BINDING_ROOT/skills/external-agent-patterns`
- `$PROJECT_ROOT/scripts/archon-*`, `scripts/export-archon-*`,
  `scripts/test-archon-*`
- `$PROJECT_ROOT/tools/archon-cli/` (if present)
- `$PROJECT_ROOT/LICENSE`, `NOTICE` (only if they match canonical hashes —
  the user may have their own LICENSE)

When comparing against canonical paths from the manifest, rewrite the
`.cursor/` prefix to `$BINDING_ROOT/` for non-Cursor platforms before
matching.

For every file found, classify:

| Classification | Condition |
|----------------|-----------|
| `ok` | path is in canonical_files AND sha256 matches |
| `modified` | path is in canonical_files AND sha256 differs |
| `missing` | path is in canonical_files AND not present in project |
| `extra` | path is NOT in canonical_files but under an Archon-owned directory |
| `ledger` | path is in `runtime_ledger_paths` — SKIPPED; shown only as "managed by project" |

---

## Step 5. Report the result

Produce a structured report. Example layout:

```
Archon sync report
==================
Project:            {{PROJECT_ROOT}}
Installed version:  {{INSTALLED_VERSION}}
Canonical version:  {{CANONICAL_VERSION}}  {{"(same)" if equal else "— update available"}}

Summary:
  OK         {{N_OK}} / {{N_CANONICAL}}
  Modified   {{N_MOD}}
  Missing    {{N_MISS}}
  Extra      {{N_EXTRA}}
  Ledgers    {{N_LED}} (managed by this project; not checked against canonical)

Modified files (sha256 differs from canonical):
  {{BINDING_ROOT}}/rules/archon.mdc
      installed:  abc1234…
      canonical:  def5678…
  …

Missing files (in canonical but not in project):
  .archon/domain-lenses/tools/capability/adoption-plan.md
  …

Extra files (not in canonical — project-owned or stale):
  {{BINDING_ROOT}}/rules/my-custom-rule.mdc  (likely project-owned)
  .archon/old-experiment.md                  (possibly stale — investigate)

Per-module status:
  core-soul            11/11 ok
  commands              5/5 ok
  agents                2/2 ok
  rules                 2/3 ok, 1 modified
  …

Recommended next steps:
  - 1 file is modified — either update via /update.md (adopt canonical) or
    keep your custom version (in which case, rename it or document the
    divergence in .archon/drift.md).
  - 0 files missing — integrity is healthy.
  - 2 extra files look project-owned; no action needed.
```

---

## Step 6. Offer follow-up actions

Ask the user what they want to do:

- If there are modifications or missing files, offer `/update.md`.
- If there are extras that look stale, offer to investigate.
- If everything is `ok`, celebrate briefly and exit.

Never take any of these actions in sync mode; this is diagnosis only.

---

## Step 7. Log the sync (optional)

Append a short memo to `.archon/memos.md`:

```
## sync — {{ISO_TIMESTAMP}}

- Installed: v{{INSTALLED_VERSION}} — Canonical: v{{CANONICAL_VERSION}}
- OK: {{N_OK}}, Modified: {{N_MOD}}, Missing: {{N_MISS}}, Extra: {{N_EXTRA}}
- Agent: {{AGENT_NAME}}
```

This is optional — only do it if the sync surfaced genuinely interesting
findings the project will want to remember.

---

## Mandatory guardrails

- **Read-only**. No writes to the project except the optional memo in
  Step 7 (which you must ask permission for if it seems excessive).
- **No network writes either**. Don't report telemetry anywhere.
- **Runtime ledger paths are not diffed**. They are owned by the project
  and diverging from canonical by design.

---

## CLI equivalent (optional, for users with Node ≥ 18)

```bash
npx @archon/cli@latest sync           # same diff report, printed to stdout
npx @archon/cli@latest sync --json    # machine-readable output
```

The CLI itself requires Node ≥ 18; the agent path described above does not.
