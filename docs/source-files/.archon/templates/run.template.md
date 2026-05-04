---
demand: "<one-line summary quoted from the user's demand>"
mode: standard
started_at: <ISO-8601 UTC>
plan_mode: used | fallback | n/a
convergence: in-scope | out-of-scope-override | n/a
---

> Legacy ephemeral run-state file — tracks a single active archon-demand delivery.
> New adopters should prefer Run-State v2 (`.archon/runs/<run_id>/state.json`);
> this template remains for compatibility and migration safety.

## SOP Variables

| Phase | Variable | Status |
|-------|----------|--------|
| boot | soul_loaded | 0 |
| boot | mode_extension_loaded | 0 |
| boot | manifest_loaded | 0 |
| prescan | memos_scanned | 0 |
| prescan | archive_scanned | 0 |
| prescan | adrs_scanned | 0 |
| prescan | extensions_hooked | 0 |
| decision | fastpath_assessed | 0 |
| decision | convergence_classified | 0 |
| decision | plan_mode_declared | 0 |
| decision | verdict_output | 0 |
| execute | changes_applied | 0 |
| validate | validation_green | 0 |
| closeout | manifest_synced | 0 |
| closeout | subagent_dispatched | 0 |
| closeout | auditor_ran | 0 |
| closeout | auditor_processed | 0 |
| closeout | drift_updated | 0 |
| closeout | milestone_gate | 0 |
| closeout | memos_appended | 0 |
| closeout | extensions_hooked | 0 |
| closeout | statement_output | 0 |

permit_commit: 0

## Status Column Semantics

- `1` — step completed successfully.
- `0` — step not yet reached or in progress.
- `2` — **smart-skipped by user intent** (ADR-15). Reserved for non-critical
  steps the user explicitly asked to bypass (or agent proposed bypass and user
  confirmed). Distinct from `skip:*` because the rationale is human judgment,
  not a mechanical mode. **Every `2` row MUST have a corresponding rationale
  in drift.md** (line containing `smart-skip: <phase>.<variable>`) or the
  Close-Out statement — governance.test.ts Block 8 enforces this. See
  §Smart-Skip Permission List below for the allow-list.
- `skip:<reason>` — step deliberately bypassed by structural / mode rule.
  Valid reasons:
  - `skip:fast-path` — qualified fast-path deliveries skip Blink Dispatch /
    conditional subagent processing / memos / extensions (see soul/delivery.md
    §Delivery Fast-Path).
  - `skip:rejected` — Verdict=reject bypasses execute / validate / most
    close-out steps.
  - `skip:no-change` — phase is N/A (e.g., `manifest_synced` when nothing in
    the delivery touches manifest-tracked state).
  - `skip:no-decision-value` — closeout.memos_appended when the delivery
    produced no stakeholder-level conclusion.
  - `skip:no-extensions` — extension hooks with no active extension.
  - `skip:<blink-reason>` — closeout.subagent_dispatched / auditor rows after
    Blink Dispatch decides no subagent is needed for a low-risk delivery.

Any other `skip:*` reason is permitted; commit-time skill / hook treat any
`skip:*` value as complete. `2` is also treated as complete (it is not `0`).

## Smart-Skip Permission List (ADR-15)

A user may directively bypass only these steps (mark Status = `2`):

- `prescan.archive_scanned`
- `closeout.auditor_ran` · `closeout.auditor_processed`
- `closeout.memos_appended`
- `closeout.milestone_gate`
- `closeout.extensions_hooked`

All other rows are **soul-enforced** — they may reach `1` or `skip:<mode>`,
never `2`. Attempting to write `2` on a soul-enforced row is an agent error:

- `boot.*` — mechanical preconditions.
- `prescan.memos_scanned` · `prescan.adrs_scanned` — knowledge-hygiene
  prerequisites (soul §Knowledge Hygiene).
- `decision.fastpath_assessed` · `decision.convergence_classified` ·
  `decision.plan_mode_declared` · `decision.verdict_output` — structural
  gates (soul §Structured Gate Outputs).
- `execute.changes_applied` — if any files changed, the row must be `1`.
- `validate.validation_green` — never user-skippable when code changed
  (soul §Quality Discipline hard rule).
- `closeout.manifest_synced` · `closeout.subagent_dispatched` ·
  `closeout.drift_updated` ·
  `closeout.statement_output` — delivery terminal record; skipping them
  would leave the session untraceable.

`permit_commit: 1` is the final gate. Set it to `1` ONLY after every row above
is `1` or `skip:*`. The pre-commit hook and `archon-git-commit` skill both
inspect this line before permitting a commit.

An active `.archon/run.md` must be a single block: exactly one YAML front matter
block, one SOP table, and one `permit_commit` line. Extra blocks usually mean a
stale prior-delivery tail was appended and must be truncated before validation.

## Mode-Specific Forms

**Fast-path** (qualified per soul/delivery.md): the same table, but every row
outside `{decision.verdict_output, execute.changes_applied,
validate.validation_green, closeout.drift_updated, closeout.statement_output,
closeout.manifest_synced}` carries `skip:fast-path`.

**Rejected** (Verdict=reject): skip execute / validate / most closeout rows
with `skip:rejected`. Required: `decision.verdict_output = 1`,
`closeout.drift_updated = 1`, `closeout.statement_output = 1`.

**Emergency remediation**: single-bundle exemption from ADR-9 tiered review.
Required additions noted in the drift log entry; the table itself follows the
standard form.
