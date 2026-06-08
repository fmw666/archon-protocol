---
name: guard-from-incident
description: >
  Turn a just-fixed bug or a removed bad pattern into a permanent structural
  guard so it can never recur in any file (the bug → fix → guard lifecycle).
  Use immediately after fixing a cross-file, load-order, or convention bug, or
  when the user says "make sure this never happens again", "防止复发",
  "固化成守卫", "add a regression guard", "freeze this fix", "postmortem action
  item", or when a code review finds a pattern that should be banned everywhere.
version: 1.0.0
license: MIT
---

<!-- Source: Formwork (结构守卫) — https://github.com/EvoMap/formwork — MIT.
     Bundled into Archon as an optional skill (manifest module: skills-formwork).
     Archon-native sibling: ADR-24 Signs table + soul/delivery §New Code = New Guardrails. -->

# Guard from incident — freeze a fixed bug as a tripwire

The highest-value structural guards come from real incidents. After a fix, the
cheapest insurance against recurrence is a guard that scans the whole tree for
the bad pattern.

## When to trigger

Immediately after fixing a bug, ask: **"could a future edit reintroduce this
anywhere in the repo?"** If yes — especially if the failure was silent
(import-order dependent, only reproduces when two modules load together,
invisible at runtime) — write a guard in the same change.

## Steps

1. **Name the bad pattern precisely.** What exact code shape caused the
   incident? Reduce it to a detectable signature (a call, an import, a missing
   companion file, a duplicated identifier across modules).
2. **Choose the category** (see `structural-guard` Step 2). Most incidents map
   to *Forbidden Pattern* or *Structural Invariant*.
3. **Author the guard** via the `structural-guard` skill, with the five-part
   anatomy.
4. **Embed the postmortem in the guard.** The header comment and the failure
   message MUST contain:
   - the **incident date** and a one-line symptom;
   - **why** it was silent / dangerous;
   - the **canonical correct pattern** (copy-pasteable);
   - a `[Rule: <issue / ADR / PR link>]` breadcrumb.
   This is the briefing for the next zero-context agent that trips it.
5. **Prove it would have caught the bug**: temporarily reintroduce the original
   bad code, confirm the guard fails, then revert.
6. **Wire into CI** via `guard-ci-wiring`.

## Example failure-message shape (language-agnostic)

```
<N> file(s) reintroduced the <pattern> banned after the <YYYY-MM-DD> incident:
  <path:line>
Why: <one-line symptom — e.g. "duplicate endpoint name; winner depends on
import order; invisible until both modules load">.
Fix: <canonical pattern>, e.g. see <example file>.
[Rule: <incident link>]
```

## Anti-pattern

Do not "fix" a future failure of this guard by adding the new violation to its
exemption list — that defeats the purpose. The guard exists precisely so the
incident class stays dead.

## Archon note

In Archon, this is the mechanical face of soul/delivery §New Code = New
Guardrails and the second-sample landing of an ADR-24 Sign (a recurring failure
promoted from a one-off drift note to a re-scanning tripwire).
