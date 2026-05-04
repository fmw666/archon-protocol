# Archon Soul — Delivery Extension

> Loaded by `archon-demand.md` on top of the core `soul.md`. Covers mechanics that only apply during a delivery cycle (reasoning capsules, lifecycle hooks, fast-path, debt tracking, product-side quality). Plan and review modes do not need this file.

## Reasoning Capsules

When a hit-a-wall pivot occurs, don't just record "chose B." Write the successful reasoning path into the relevant skill document: **symptom → root cause → fix.**

Next time the same symptom appears, reuse the proven path instead of re-deriving it from scratch.

Not a standalone file. Not a standalone format — embedded in existing skills. Core Axiom #4: Lean > Bloat.

## Lifecycle Hooks

Core principle: **Execution and judgment must be separated.** The deliverer has sunk-cost bias toward their own work — tending to overvalue (over-capture) or turn a blind eye (missed capture). Steps requiring independent judgment are not self-executed by the deliverer but delegated to independent sub-agents at fixed lifecycle points.

### Delivery Lifecycle Overview

| Phase | Check | Executor | Type |
|-------|-------|----------|------|
| Boot | Load soul (core + delivery) + manifest | Command preamble | Automatic |
| Decision gate | Should it be done / how big | Main agent | Self-assess |
| Execute (self-directed interior) | Plan tools, helper code, order, backtracking, and write changes inside hard gates | Main agent | — |
| Validation gate | lint + typecheck + test | Manifest-declared validation command | Automatic |
| Close.1 | Manifest sync | Main agent | Self-assess |
| Close.2 | Blink Dispatch: decide skip vs sub-agent | Main agent using `blink-dispatch` | Mechanical triage |
| Close.3 | Knowledge capture + delivery hygiene when dispatched | **capture-auditor sub-agent** | **Delegated** |
| Close.4 | Execute crystallization + respond to hygiene findings | Main agent (acts on recommendations) | — |
| Close.5 | Drift scoring + logging | Main agent | Self-assess |
| Close.6 | Milestone gate (if applicable) | Main agent checks debt.md clearance | Self-assess |
| Close.7 | Stakeholder memos | Main agent | Self-assess |
| Close.8 | Extension hooks (if any active) | Main agent scans extensions/ | Per-extension |
| Close.9 | Version control | Commit per manifest git strategy | Per strategy |
| Threshold event | drift ≥ full threshold → full review | **archon-reviewer sub-agent** | **Delegated** |
| Milestone close | Debt cleared + acceptance criteria met | Main agent (may trigger reviewer) | Gate |

### When to Escalate to Delegation

A "self-assess" step should be converted to a sub-agent hook when **any** of the following apply:

- Judgment occurs after work completion (sunk-cost bias is strongest)
- Judgment has no self-correction mechanism (if wrong, no one catches it)
- Error cost is high (impacts product correctness or architectural health)

Otherwise keep it as self-assessment — each sub-agent adds an LLM call's latency and cost.

**Cost awareness**: Before activating a new sub-agent, first answer: **can this check be replaced by a self-audit checklist?** Mechanical checks (placeholder scanning, naming consistency, format compliance) are fine as inline self-audits; judgmental assessments (knowledge value identification, bias correction, architectural health) warrant delegation. Empirically: purely mechanical checks sub-agent-ized showed an order-of-magnitude latency increase with no measurable quality improvement.

> Model family separation (sub-agent ≠ main family) is a universal rule; see `soul.md §Sub-Agent Independence`.

### Delivery Fast-Path (Self-Assess Before Verdict)

Not every delivery carries the same cognitive cost. The structured outputs (Verdict / Close-Out — historically `GATE-1` / `GATE-2`) and the full close-out exist to control risk on non-trivial work. On genuinely trivial work they become pure overhead — and overhead compresses delivery tempo until the executor starts evading the gates entirely (a known failure mode that inflates drift without triggering review).

**Fast-path eligibility** (ALL must hold):

- Files changed ≤ 2
- No new module / new pattern / new dependency introduced
- No change to interfaces, schemas, routes, auth, or infrastructure
- No governance file changed
- No user-facing behavior change requiring verification beyond the validation command

When eligible, the delivery collapses structured gates to single-line inline summaries and skips the steps whose judgment value is negligible on trivial changes (detailed in the delivery command file). Every skipped step increments a fast-path counter in the drift log so abuse is visible during review.

**Anti-abuse**: if review finds `fast-path share > 60%` in a cycle, the reviewer must assess whether task granularity has been artificially split to evade full gates.

### Debt Tracking

Issues found during review or delivery that cannot be fixed immediately must not vanish into narrative text. They must be structurally tracked.

- **Debt registry** (`debt.md`): Each item has ID, source, severity, deadline, and status
- **Registration timing**: When capture-auditor hygiene check fails and fix is deferred; when reviewer findings of Warning/Observation severity are deferred
- **Clearance gate**: Before milestone closure, all items with `milestone-close` deadline must be `resolved`
- **Golden rule**: Deferral is acceptable; forgetting is not. Deferral = register + deadline. Unregistered = nonexistent = unmanaged

### Candidate Hooks (Not Yet Activated)

These hooks may become worthwhile as the project scales. Currently not implemented:

| Candidate | Position | Check | Activation Trigger |
|-----------|----------|-------|--------------------|
| delivery-validator | After validation gate, before close | Manifest index ↔ disk consistency, archon decoupling compliance | Source file count > 50 or after backend lands |
| drift-scorer | Replaces self-assess at Close.5 | Independent delivery complexity assessment | After observing self-assessment bias patterns |

> **Note**: The delivery-validator's "does a new module lack tests" check is already covered by capture-auditor's delivery hygiene — no duplication.

### Rules

- Sub-agents advise; the main agent executes — separation of concerns
- Sub-agent output is structured — auditable (drift's crystallization column records auditor judgment)
- When a "judge your own work" pattern emerges, prefer converting to a sub-agent hook
- The trigger table and crystallization path are reference inputs for sub-agents, not a self-check list for the main agent

## Product Quality

### Hard Acceptance Criteria

Clean code ≠ correct product. Each milestone defines **hard acceptance criteria** in the manifest — specific, testable, with metric thresholds.

Acceptance criteria include:
- **Feature acceptance**: Enumerated functionality that must be operational, verifiable via tests or manual validation
- **Quality gates**: Measurable metric thresholds (performance, accessibility, bundle size, test coverage, etc., depending on the project's tech stack)
- **Tooling accompaniment**: Milestone-specific detection tools are introduced in sync with the milestone — neither early nor late, recorded in the manifest

Milestone acceptance criteria not fully checked = milestone not complete. "Close enough" does not exist.

### New Code = New Guardrails

- New module → test file appears simultaneously
- New architecture layer → linter boundary rules updated in sync
- New design pattern → encapsulate as component; don't rely on documentation for consistency
- New milestone → write acceptance criteria first, then write code
- New technology/framework version → ship an adoption skill (recommended patterns + prohibited patterns + timing) + structural guards (lint rules blocking old patterns). A technology selection without an adoption plan = a ticking time bomb — the user should never need to remind you "are you using this framework's new features?"
- Refactoring existing module → first add characterization tests to lock current behavior, then change structure. Refactoring without a safety net = gambling
