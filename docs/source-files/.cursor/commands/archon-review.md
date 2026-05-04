Hot-path load: read `.archon/soul.md` sections needed for review (`Core Axioms`, `Evolution`, `Quality Discipline`, `Knowledge Hygiene`), then `.archon/soul/review.md` in full only for Full/Emergency review and only `Review Tiering` for Light review, then `.archon/manifest.md` sections needed for review (`Validation Command`, `Context Budget`, `Governance Ratio`, `Knowledge Assets`, `Current State`), then `.archon/drift.md` `Current Value`, thresholds, and entries since the last release/reset.

You are now in **review** mode.

## Tier Selection

Review runs in three tiers (defined in soul/review.md §Review Tiering). Determine the tier from drift.md before doing anything else:

| Condition | Tier | Scope |
|-----------|------|-------|
| `drift ≥ emergency_threshold` OR reviewer explicitly invoked with `emergency` | **Emergency** | Full review + blindspot root-cause analysis. All demand intake halted until reset. |
| `drift ≥ full_threshold` OR user-invoked without qualifier | **Full** | Original complete flow (Phase 0-4 below) |
| `drift ≥ light_threshold` AND `< full_threshold` | **Light** | Mechanical health audit only — no reviewer sub-agent, no remediation planning |
| `drift < light_threshold` AND user-invoked | **Full** (user override) | User explicitly asked — run full regardless of drift |

Output the tier choice at the top of the response: `REVIEW TIER: light|full|emergency · drift=<N> · trigger=<threshold-crossing|user-invoked>`.

## Light Review (Mechanical)

Light review releases pressure continuously so drift rarely escalates. Execute ONLY:

1. **Automated checks**: Run the validation command declared in the manifest. Red = fix first.
2. **Index consistency**: List governance files on disk; cross-check against manifest knowledge asset index; flag missing / phantom / stale entries.
3. **Stale debt scan**: List debt items whose deadlines have passed without resolution; flag for immediate attention.
4. **Drift log pattern scan**: Read drift entries since last reset; count recurring fix types. If ≥3 entries share the same type (e.g., "style fix", "missing test") → flag as stagnation signal.
5. **Budget check**: Cross-check governance file line counts against manifest's Context Budget section (the validation gate already enforces, but note any file within 10% of cap as approaching).
6. **Close-out** (per ADR-22 records-folder):
   - Create one new drift record file via `node scripts/archon-records.mjs new drift --type review-release --delta -N --summary "Light review release ..."` (N = 2..4 partial release). Do NOT hand-edit `.archon/drift.md` between sentinels — pre-commit hook regen + restages.
   - Report findings; remediation (if any) handed to next delivery, not executed in-session.
7. **Tier-crossing guard** (DEBT-060, 2026-04-24): **Light cannot satisfy a Full-threshold crossing**. If the drift value at Light-review entry is ≥ full threshold (effective, phase-aware — see `soul/review.md §Review Tiering` and the dynamic table in `.archon/drift.md §Dynamic Threshold`), abort Light-tier immediately and escalate to Full-tier. CI backstop: `web/src/test/archon/drift-gates.test.ts §Full-review gate`.

Light review MUST NOT spawn the reviewer sub-agent and MUST NOT perform Phase 2-3 of full review.

## Full Review

### Phase 0: Automated Checks

Run the validation command declared in the manifest. If red, fix to green first — issues catchable by automation do not belong in a manual review report.

### Phase 1: Launch archon-reviewer Sub-Agent

Conduct an independent review of the entire project (see archon-reviewer.md in the agents directory; prefer a model family different from the main agent when the platform supports it — see soul.md §Sub-Agent Independence). The reviewer covers dimensions automation cannot: architectural decay, abstraction soundness, specification drift, governance health.

### Phase 2: Knowledge Health Audit

This is not a checklist — it is a quantitative audit. Produce concrete numbers.

**Index Consistency**
- List all governance files on disk (rules / skills / agents / ADR)
- Cross-check each against the manifest knowledge asset index → flag: missing (on disk but not indexed), phantom (indexed but not on disk), description stale
- Inconsistency count = 0 is healthy

**Governance Ratio**
- Total governance files / total source files → healthy band defined in the manifest (project-declared bounds)
- Above upper bound = bloat; below lower bound = tribal knowledge / missing guardrails

**Knowledge Capture Rate**
- Read drift log entries since the last review (or log start)
- Total deliveries D, entries with crystallization column ≠ `—` count C
- Capture rate = C / D → report the number; flag knowledge attrition risk if < 0.3

**Fast-Path Share**
- Count deliveries in cycle marked as fast-path vs. total
- Report share; flag evasion risk if fast-path share > 60% (task granularity may be artificially split — see soul/delivery.md §Delivery Fast-Path)

**Coverage**
- List each first-level subdirectory in source code → check if corresponding rules or skills exist → flag blind spots

**Stale Asset Cleanup**
- Check if patterns described in rules/skills are still used in code → flag stale assets and clean up
- Check if manifest directory structure matches disk → correct drift

**Glossary Candidate Scan** (see soul.md §Trigger Conditions · "Concept discovered" row)
- Extract multi-char capitalized tokens and quoted domain nouns from manifest body + ADRs + recent drift entries
- Filter to terms that: (a) appear in common English dictionaries with a generic meaning, AND (b) are used in the codebase or manifest with a project-specific meaning
- Cross-check against existing Concept Glossary entries
- Report any candidate terms missing from the glossary; the main agent decides which to add during Phase 4
- Also flag repeated stakeholder phrases that point to the same project artifact but are missing from the User Language Index

After the health audit checks above, scan the archon directory's `extensions/` subdirectory for active extensions with a `review.health` hook (see soul.md §Extension Points). For each match, execute and append findings to the health audit output.

### Phase 3: Remediation

Fix Critical and Warning level issues found by the reviewer. Run the validation command again after fixes to confirm no regressions.

### Phase 3.5: `next-review` debt disposition (ADR-12, DEBT-038.b)

For every debt entry whose deadline column is `next-review` (read from `.archon/debt.md` hot index, source of truth in `.archon/debt/items/DEBT-NNN-<slug>.md` per ADR-22), assign exactly ONE of the four dispositions in this review cycle. Apply by editing the item file's YAML frontmatter directly (item files ARE the records — frontmatter edits are the canonical write surface; do NOT hand-edit `.archon/debt.md` between sentinels), then `node scripts/archon-records.mjs regen debt`:

1. **Execute** — landed in this review's remediation (Phase 3 delta) or bundled into a follow-up demand; set frontmatter `status: resolved` with resolution date in body. Resolved items are removed from the records folder during the next delivery's close-out (per debt rules).
2. **Defer** — insufficient evidence / wrong timing; **must** state in item body (a) what new evidence would unblock action and (b) the next deadline (specific milestone or `next-N-reviews`); set frontmatter `deadline:` to the new value. Pure "defer to next-review" is disallowed — it creates infinite snoozes.
3. **Observe** — downgrade frontmatter `severity: Info` + add an activation-trigger line in body (e.g., "≥1 observed X event before mechanism trial"); until trigger fires, no action, no re-surface.
4. **Reject** — premise no longer holds (superseded by ADR / architecture change); set frontmatter `status: rejected` with rationale in body. Rejected items are removed during next close-out.

The reviewer sub-agent MUST include a `next-review debt disposition` table in its findings; absence counts as a Warning against this command file. This exists because `next-review`-deadline debts otherwise accumulate silently and re-inflate the backlog without forcing a deliberate choice.

### Phase 4: Memory Layer Consolidation

Evaluate whether accumulated knowledge warrants promotion to stronger vehicles, using the signal → target table in soul/review.md §Memory Layer Consolidation. Archive recall signal: check `memos-archive/<year>-Q<N>.md` keyword headers + current reviewer findings to count recalls.

Report each promotion (or "no promotion candidates") in the close-out.

### Phase 5: Close-Out (per ADR-22 records-folder)

1. Update the manifest to be fully synchronized with project reality
2. Reset drift via `node scripts/archon-records.mjs new drift --type review-release --delta -N --summary "Full review release ..."` (or `--summary "EMERGENCY REVIEW RESET ..."`):
   - Fully clear: choose `-N` such that running drift falls to `0`. The regenerator computes `max(0, sum_of_deltas)` so a single large negative delta safely resets.
   - Residual concerns: choose `-N` to leave `1-3` running; the record body MUST explain what residual remains.
   - The record body MUST include: findings count by severity (Critical/Warning/Observation), key actions taken, residual issues. Do NOT hand-edit `.archon/drift.md` between sentinels — the hot summary regenerates from the record.

## Emergency Review

Emergency review = full review + these additions:

1. **Before Phase 0**: declare "demand intake halted until drift reset". Any demand attempted during emergency review returns the same message.
2. **After Phase 2**: blindspot root-cause analysis — for each Critical finding, identify the systemic gap that allowed it, check against soul/review.md §Known Blindspot Patterns, and propose a countermeasure (rule / mechanism / lifecycle change). Record in drift reset line.
3. **After Phase 5**: outline a remediation plan as the next 1-3 demand inputs. The plan becomes the next deliveries, not a report.

Emergency is a lifecycle incident signal: the review cadence itself failed (drift climbed 50% above full threshold). Treat the root cause as seriously as a production incident.

## Output

Report to the user: tier chosen, what was found (by severity), what was fixed, drift reset value, any memory consolidation outcomes.
