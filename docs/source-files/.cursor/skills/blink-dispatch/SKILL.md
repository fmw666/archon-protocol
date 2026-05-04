---
name: blink-dispatch
description: >-
  Thin-slice subagent dispatch gate for Archon deliveries. Use during
  archon-demand close-out before launching any subagent to decide whether to
  skip, launch capture-auditor, launch archon-reviewer, or use another
  verification agent.
---

# Blink Dispatch

Blink Dispatch is a fast, deterministic gate for deciding whether a delivery
needs a subagent. It is inspired by thin-slicing: inspect a few high-signal
features, not the whole problem again.

Do not launch a "blink" subagent. The point is to avoid spending subagent
latency on a dispatch decision the main agent can make from the current diff.

## Output Contract

Emit exactly one dispatch line in close-out notes and drift when relevant:

```text
subagent_dispatch: skip:<reason> | use:<subagent>:<reason>
```

Also update `.archon/run.md`:

- `closeout.subagent_dispatched = 1` when any subagent is launched.
- `closeout.subagent_dispatched = skip:<reason>` when the gate decides no
  subagent is needed.
- For the legacy capture-auditor rows, mirror the result:
  - capture-auditor used: `auditor_ran=1`, `auditor_processed=1`
  - capture-auditor not used: `auditor_ran=skip:<reason>`,
    `auditor_processed=skip:<reason>`

## Thin-Slice Signals

Use these signals, in this order:

1. **Path risk**: source/API/db/governance path touched?
2. **Boundary risk**: auth, secret, deploy, DB, CI permissions, routing, or
   lifecycle semantics changed?
3. **Failure repair**: validation failed and the delivery included a fix?
4. **State closure**: debt, milestone, manifest acceptance, or external blocker
   status changed?
5. **Drift pressure**: current or resulting drift reaches light/full/emergency?
6. **Agent uncertainty**: main agent cannot confidently bound the risk.

## Required Dispatch

Launch a subagent when any required signal matches:

The portable source of truth for high-risk path patterns and allowed skip
reasons is `.archon/contracts/governance-contract.yaml` §`blink_dispatch`; keep this
skill's prose aligned with that contract.

| Signal | Dispatch |
|--------|----------|
| Manifest-declared product/source path changed | `use:archon-capture-auditor:implementation-risk` |
| Archon core changed (`.archon/soul*`, `.archon/domain-lenses`, `.archon/contracts`, `.archon/templates`, `docs/archon`, `scripts`, `.husky/pre-commit`, `.cursor/commands`, `.cursor/agents`, `.cursor/rules`, `.cursor/skills`, `governance.test.ts`) | `use:archon-capture-auditor:governance-risk` |
| Full review threshold reached | `use:archon-reviewer:full-review-required` |
| Auth, secret, deploy, DB, or CI permission boundary changed | `use:archon-capture-auditor:boundary-risk` |
| Debt/milestone/external blocker is being closed | `use:archon-capture-auditor:state-closure-risk` |
| Validation failed and was repaired | `use:archon-capture-auditor:repair-risk` |
| Main agent is uncertain | `use:archon-capture-auditor:uncertain-risk` |

## Allowed Skip

Skip subagents only for low-risk, validation-backed changes:

| Case | Dispatch |
|------|----------|
| Copy-only docs, no state closure | `skip:copy-only` |
| Drift log budget maintenance | `skip:drift-budget` |
| Validation-only CI trigger/cache/concurrency change, no secret/deploy permission expansion | `skip:low-risk-ci` |
| Manifest sync of already verified facts | `skip:verified-manifest-sync` |
| Fast-path delivery | `skip:fast-path` |

When in doubt, dispatch. A false positive costs time; a false negative removes
the independent judgment Archon relies on.
