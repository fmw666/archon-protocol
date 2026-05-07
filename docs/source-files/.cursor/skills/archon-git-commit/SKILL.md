---
name: archon-git-commit
description: >-
  Archon-governed git commit workflow. Resolves the active Run-State v2 record
  under `.archon/runs/<run_id>/state.json` when present, falls back to legacy
  `.archon/run.md`, asserts the delivery is complete and permitted, generates a
  Conventional Commits message from the demand + drift log, executes git commit,
  and cleans up the ephemeral run-state on success.
---

# archon-git-commit — Archon-Governed Commit Workflow

> Archon's commit skill. It consults Run-State v2 before touching git, so a
> half-finished delivery cannot ship. If no v2 run exists, it falls back to the
> legacy `.archon/run.md`; if neither exists, delegate to the plain `git-commit`
> skill.

## When to Use

Trigger whenever the user requests a git commit during an Archon session:

- User says `commit` / `提交` / `ship it` after an archon-demand delivery.
- Close-Out statement concludes with git=`committed|prompted` per manifest Git
  Strategy.
- Pre-commit hook rejects a commit with the run-state gate error.

Do NOT use this skill for pure doc-only non-Archon commits — a plain
`git-commit` skill handles those.

## Preconditions

1. Prefer Run-State v2: `.archon/runs/<run_id>/state.json` exists and
   `node scripts/archon-run-state.mjs resolve-for-commit` selects exactly one
   candidate. If more than one candidate exists, set `ARCHON_RUN_ID`. The
   resolver also rejects staged paths that are not listed in the selected run's
   `changedPaths`.
2. If no v2 run exists, legacy `.archon/run.md` may still govern the delivery.
3. If neither exists → fall back to the plain `git-commit` skill. No active
   delivery means no Archon gate to enforce.

## Protocol

### Step 1 · Resolve run-state and classify status

Run:

```bash
node scripts/archon-run-state.mjs resolve-for-commit
```

If it reports a v2 candidate, read `.archon/runs/<run_id>/state.json`. A status
value is **complete** if it is `1`, `2`, or starts with `skip:`. A row is
**pending** if it is `0` or empty.

If no v2 run exists but `.archon/run.md` exists, parse every legacy table row.
A legacy row is **complete** if its `Status` column is `1`, `2`, or starts with
`skip:`.

Then check the permit field: v2 uses `permitCommit: true`; legacy uses
`permit_commit: 1`.

### Step 2 · Assert commit eligibility

Commit is permitted iff:

- Every phase row is complete, AND
- v2 `permitCommit: true` or legacy `permit_commit: 1` is present.

If NOT eligible, STOP. Do not call `git add` or `git commit`. Produce this
report:

```
Archon run-state gate: delivery has pending steps.

Pending (first 5):
  <phase>.<variable>
  <phase>.<variable>
  ...

→ Complete the remaining steps per archon-demand.md, or remove the active
  .archon/runs/<run_id>/ directory / legacy .archon/run.md to abandon it.
```

### Step 3 · Generate the commit message

Per ADR-22 records-folder, read the most-recent record file under
`.archon/drift/records/` (sort by ISO8601 filename, take the last one). Its
YAML frontmatter `summary` field plus body is the canonical body source — it
contains everything previously rendered into the `.archon/drift.md` §Log
table cell, but in full unsmushed form. Combine with the v2 `demand` field
or legacy `run.md` front matter for a Conventional Commits header.

Pre-commit hook auto-runs `node scripts/archon-records.mjs regen drift|memos|debt`
and re-stages hot summaries before validate; the commit-message generator
operates on the records folder, not the regenerated hot summary.

Header format:

```
<type>(<scope>): <one-line summary, ≤ 72 chars>
```

- `type` — inferred from the delivery (feat / fix / refactor / docs / test /
  chore / build / ci). Archon governance-only changes = `chore(archon)`.
- `scope` — optional; use the primary directory touched if obvious
  (`archon` / `api` / `web` / `scripts` / etc.).
- Header must not exceed 72 characters.

Body format (from drift summary, compressed):

```
<2-4 lines summarizing the change, what it unblocks, and any override>

Refs: <ADR-ID(s) if any> · drift <+N total=M>
```

Follow the project's `git-commit` skill for style details (it is loaded
alongside this skill in projects that have it).

### Step 4 · Stage and commit

```bash
git add -A
git commit -m "$(cat <<'EOF'
<header>

<body>
EOF
)"
```

Never use `--no-verify`. The pre-commit hook is the last mechanical gate; if it
rejects the commit, the run-state gate was enabled for a reason.

### Step 5 · Clean up run-state on success

Run-state files are **gitignored** (see repo `.gitignore`) — they never enter
git history, and `git add -A` will not stage them. After the commit succeeds
(exit 0), remove the active v2 run directory or legacy file so the next delivery
starts from scratch:

```bash
node scripts/archon-run-state.mjs cleanup <run_id>
# legacy fallback only:
rm .archon/run.md
```

This cleanup is pure filesystem cleanup; it does not produce any further git
diff because the files were never tracked. This is the only place run-state is
deleted.

If the commit fails (pre-commit rejects, etc.), leave run-state in place. The
user / next agent needs the state to fix and retry.

### Step 6 · Report

Produce a final-line TL;DR per manifest §Persona:

```
Committed <sha> · run-state cleared · drift total=M.
```

## Fast-Path and Rejected Deliveries

- **Fast-path**: state uses the compact fast-path form (required variables:
  verdict_output · changes_applied · validate_green · drift_updated; all other
  optional rows `skip:fast-path`). The skill still asserts required rows are 1.
- **Rejected**: state uses the rejected form (verdict_output=1 with `reject` ·
  drift_updated=1; other non-terminal rows `skip:rejected`). Most rejections
  produce no code changes; the skill still creates a commit if manifest
  memos/drift were staged, else reports "nothing staged — skipping commit".

## Escalation

Do NOT try to work around the gate:

- If the user insists on committing with pending steps, refer them to
  `node scripts/archon-run-state.mjs cleanup <run_id>` or `rm .archon/run.md`
  (explicit abandon) or `git commit --no-verify` (manual escape — the
  responsibility is theirs).
- If multiple v2 candidates exist, set `ARCHON_RUN_ID=<run_id>` rather than
  guessing.
- If legacy run.md appears corrupt / orphaned from a prior session, ask the user
  whether to `rm` it or resume the unfinished delivery.

## Interaction with pre-commit hook

The hook (`.husky/pre-commit` or equivalent) performs the same eligibility
check at commit time by calling `scripts/archon-run-state.mjs` and then applying
the legacy fallback. This skill's assertion is a first line of defense and the
hook is the second. They must agree: a commit permitted by the skill must pass
the hook.

## References

- Run-State v2 schema — `.archon/templates/run-state.schema.json`
- Legacy `.archon/run.md` schema — `.archon/templates/run.template.md`
- Run-State v2 helper — `scripts/archon-run-state.mjs`
- Archon commit hook contract — `https://aaep.site/setup/full-guide` §3c Pre-commit Hook
- Conventional Commits + project style — the project's `git-commit` skill (if
  present)
