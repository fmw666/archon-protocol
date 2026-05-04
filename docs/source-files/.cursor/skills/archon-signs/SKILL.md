---
name: archon-signs
description: >-
  Trigger-indexed reasoning capsules for Archon. Defines the writing discipline
  for `signs.md` rows so the project-side trigger table stays mechanically
  scannable in the demand pre-scan. Use when adding, removing, or auditing a
  Signs row, or when a delivery's post-review surfaces an `evolution_triage =
  stats-pass` candidate from auditor or validation evidence.
---

# Archon Signs — Writing Discipline

A Sign is a one-row capsule for a recurring failure pattern. The hot index
lives at `signs.md`; the demand pre-scan sweeps the Trigger column against
the demand text before the Verdict so prior pain surfaces automatically
instead of relying on the agent's recall.

## Three columns

```
| Trigger | Instruction | Why |
|---------|-------------|-----|
```

- **Trigger** must be **mechanically matchable**. Allowed forms:
  - `keyword: <quoted phrase>` — case-insensitive substring on demand text
  - `path: <glob>` — matches when changed-paths candidate set intersects the glob
  - `error: <prefix>` — matches when the demand text or last-known validation log contains the error class
  - `phrase: <verbatim>` — full phrase substring
- **Instruction** is one short sentence describing what to do when the trigger
  fires (e.g., "run X first", "load skill Y", "split into two demands").
- **Why** is one short clause explaining the underlying failure mode the
  trigger is recalling. No prose paragraphs.

## Forbidden writing patterns

- Triggers that are **abstract feelings** ("when something feels off",
  "if uncertain about scope") — these are not mechanically matchable; the
  pre-scan cannot fire them. Promote to a checklist line in the relevant
  command instead.
- Multi-sentence Instruction or Why columns — collapse, or promote to a
  reasoning capsule inside a skill.
- Two Signs that fire on the same Trigger — merge or specialize one's
  Trigger so the pre-scan output stays unambiguous.

## When to add a row

Only when **all** of the following hold:

1. The same failure has fired in ≥2 prior deliveries (drift, auditor, or
   validation evidence). One sample stays in drift per the evolution-signal
   triage table — Signs is the second-sample landing.
2. The fix is a small reusable instruction, not a new module or a rule worth
   promoting to L1/L2.
3. The Trigger can be expressed mechanically per the four allowed forms above.

If the candidate fails (1) → leave in drift; if it fails (2) → promote
directly to rule/test/skill/ADR; if it fails (3) → write a reasoning capsule
in the relevant skill instead and link it from drift.

## When to retire a row

- Trigger has not fired in 3 consecutive boot cycles → archive to
  `signs-archive/<year>-Q<N>.md`.
- Underlying failure is now caught by L0/L1 (test, lint, type) → delete the
  row and note the replacement in the next drift record.
- Trigger phrasing was too abstract to ever fire → rewrite per the four
  allowed forms or delete.

## Pre-scan integration

The demand command sweeps `signs.md` Trigger column on every non-fast-path
demand. Hits are cited at the top of the response in the same shape as
memo cites:

```
Sign hit: <trigger> → <instruction>  (signs.md row N)
```

Multiple hits → list them all; ordering is row order. No hits → no line
emitted (silence is the default).

## Caps

- Hot file row cap = 30. Beyond that, retire least-recently-fired rows to
  `signs-archive/`.
- Single-row character cap = 240 (slightly above memos hot-row ceiling to fit Trigger-Instruction-Why three columns; if you exceed it, the Sign is too long — split or promote to a skill).
- Schema is enforced by `governance.test.ts §Signs table shape` when
  `signs.md` exists; missing file = "project has not introduced Signs yet"
  and the test passes silently.
