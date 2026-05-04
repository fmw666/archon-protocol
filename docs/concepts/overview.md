# Archon — 10-Minute Overview

> A condensed tour of Archon for readers who want the big picture before diving into [architecture.md](/concepts/architecture). If you want to install it right now, skip to [adoption/quickstart.md](/setup/quickstart.md).

![Comic explainer: Archon in one minute — owner, not assistant](/images/overview/01-owner-not-assistant.png)

**Archon is a session-based engineering governance framework that runs inside AI pair-programming IDEs.** It doesn't add new reasoning power. It adds an *environment* in which a strong model can keep reasoning correctly across sessions, across deliveries, across milestones — without losing shared vocabulary, decision memory, or quality discipline.

If you want the philosophical argument behind why this matters, read [concepts/model-vs-harness.md](model-vs-harness.md). If you want the comparison against sibling frameworks, read [concepts/superpowers-comparison.md](superpowers-comparison.md).

---

## 1. What Archon actually is

Archon is three things at once:

1. **An identity contract** — a short document (`soul.md` + focused extensions) that says *Agent = project owner*, not assistant. Every decision in Archon derives from this.
2. **A state discipline** — a small set of living files (`manifest.md`, `drift.md`, `memos.md`, `debt.md`, records folders) that maintain project truth between sessions so no context is lost.
3. **A lifecycle enforcement** — commands, agents, rules, lints, and tests that stop the agent from self-approving sloppy work.

The **three-tier layout** makes this physical:

```
.archon/          ← framework core + project state (portable)
{platform}/       ← platform-specific bindings (.cursor/, .codex/, .claude/)
docs/archon/      ← bundled human-readable documentation
```

> Portability rule: universal files under `.archon/soul*`, `.archon/commands/`, `.archon/agents/` must stay project-agnostic. Project specifics live in `manifest.md`, `drift.md`, `debt.md`, `memos.md`, `.archon/decisions.md`.

## 2. Five identity axioms

![Comic explainer: five axioms](/images/overview/02-five-axioms.png)

Every Archon design decision passes through these axioms before adoption:

| # | Axiom | Meaning |
|---|-------|---------|
| 1 | **Ownership > Assistance** | Agent is the owner. Decisions, quality, consequences belong to it — not the user. |
| 2 | **Constraints > Documentation** | Type system > lint > editor rules > prose. If a machine can enforce it, don't write prose. |
| 3 | **Inference > Configuration** | Derive behavior from project state, not mode flags. No `mode=strict` switches. |
| 4 | **Leanness > Bloat** | Fewer, stronger knowledge assets. Every new file must justify itself against an existing home. |
| 5 | **Separation > Self-Review** | The executor must not judge its own work. Review and knowledge capture go to independent sub-agents. |

Read the long-form axioms with examples in [architecture.md §Design Philosophy](/concepts/architecture#design-philosophy-five-identity-axioms).

## 3. Three modes, one loop

![Comic explainer: three modes — plan, demand, review](/images/overview/03-three-modes.png)

Archon responds to three kinds of wake:

| Wake | Purpose | Command |
|------|---------|---------|
| **Plan** | Negotiate what should be done, at what size, under what risk | `/archon-plan` |
| **Demand** | Execute a scoped delivery end-to-end (Decision Gate → Execute → Validate → Close-Out) | `/archon-demand` |
| **Review** | Independent full-review pass when drift pressure exceeds the threshold | `/archon-review` |

Inside every wake the agent runs the same **Sense → Model → Act → Verify** cognitive loop, backing up to any earlier step if evidence invalidates the current conclusion.

## 4. The delivery lifecycle in one picture

![Comic explainer: delivery lifecycle end-to-end](/images/overview/04-delivery-lifecycle.png)

```
Wake → Decision Gate → Plan → Execute → Validate → Close-Out → Git
              │                              │          │
              │                              │          └── Blink Dispatch
              │                              │              (skip / capture-auditor / reviewer)
              │                              └── lint + typecheck + test, must be green
              └── Radius / Soul-headroom / Modularity probes
```

The **Decision Gate** runs *before* any code change. It enforces three mechanical probes (Radius, Soul-headroom, Modularity) and a verdict (should this be done? how big? who decides?). The **Close-Out** runs *after* validation turns green. It decides whether learning from this delivery should crystallize into a stronger vehicle (test, lint rule, skill, ADR, manifest entry).

For the full picture, see [architecture.md §Delivery Lifecycle](/concepts/architecture#delivery-lifecycle).

## 5. The Constraint Pyramid (L0 → L5)

![Comic explainer: constraint pyramid](/images/overview/05-constraint-pyramid.png)

Archon's quality model has **six layers**, strongest at the bottom:

| Layer | Vehicle | Enforcement |
|-------|---------|-------------|
| **L0** | Type system | Compilation impossible if violated |
| **L1** | Lint / static analysis | Red in CI |
| **L2** | Editor rules, tests, pre-commit hooks | Red in IDE / CI |
| **L3** | Skills, commands, agents | Loaded at relevant wake |
| **L4** | ADRs | Recorded decisions |
| **L5** | Prose documentation | Human-readable only |

**Promotion direction is always downward** (stronger). A reasoning capsule that becomes a lint rule moves from L3 → L1. Documentation is the last resort, not the first.

## 6. The state discipline

![Comic explainer: state discipline — manifest, drift, memos, debt](/images/overview/06-state-discipline.png)

Four state files + three records folders keep project truth between sessions:

| File | Role |
|------|------|
| **manifest.md** | Hot project context: concept glossary, user language aliases, current state, validation command, tech stack, knowledge asset index. The *only* Archon file allowed to contain project specifics. |
| **drift.md** | Memory-decay alarm. Counter of deliveries since the last review, tiered thresholds (Light / Full / Emergency). |
| **memos.md** | Stakeholder memos. Vetoes, decisions, clarifications. Auto-scanned at demand pre-scan. |
| **debt.md** | Unresolved responsibility. Milestone gate reads here. |

Per-event records under `.archon/{drift,memos}/records/` and `.archon/debt/items/` are the immutable source of truth (ADR-22, event-sourcing). The hot summary files are regenerated from records — concurrent PRs no longer collide on them.

Read [mechanisms/drift-mechanism.md](/concepts/drift-mechanism.md) for the full drift story.

## 7. How Archon evolves itself

![Comic explainer: knowledge evolution](/images/overview/07-knowledge-evolution.png)

Archon doesn't just execute deliveries — it metabolizes them. At Close-Out, every delivery passes through an **evolution triage**:

1. **stats-pass** — statistical signal (Rule of Three or recurrence). Promote to the strongest fitting vehicle.
2. **first-principles-pass** — a core assumption was falsified. Capture with explicit validation experiment.
3. **stay-in-drift** — one-off or weak sample. Stay as experience record.

Promotion follows the Constraint Pyramid. A repeated null-check bug doesn't become "a note in drift" — it becomes a lint rule (L1) or a characterization test (L2). The **Claim Verifier** (`scripts/archon-claim-verifier.mjs`) mechanically cross-checks the agent's written claims against in-repo truth to stop governance prose from drifting from reality.

The dual motion:

- **Crystallization** — turn experience into a stronger constraint.
- **Preservation** (ADR-28) — actively pin load-bearing knowledge with a mechanical triple (critical-rule registry anchor + body-shape test + portable-contract entry), so useful knowledge is not silently deleted.

## 8. Where to go next

![Comic explainer: where to go from here](/images/overview/08-next-steps.png)

| I want to... | Read this |
|--------------|-----------|
| Install Archon in my project | [adoption/quickstart.md](/setup/quickstart.md) (5 min) → [setup.md](/setup/full-guide) (full detail) |
| Understand the full architecture | [architecture.md](/concepts/architecture) |
| See the framework decision log | [decisions.md](/concepts/decisions) |
| See 16 real-world pain points it addresses | [user-journeys.md](/concepts/user-journeys) |
| Understand drift in depth | [mechanisms/drift-mechanism.md](/concepts/drift-mechanism.md) |
| Compare Archon vs a skill library | [concepts/superpowers-comparison.md](superpowers-comparison.md) |
| Read the "model isn't enough" argument | [concepts/model-vs-harness.md](model-vs-harness.md) |
| See how refactoring disciplines were adapted | [concepts/refactoring-adoption.md](refactoring-adoption.md) |
| See how Archon looks as a product | [concepts/product-architecture-workflow.md](product-architecture-workflow.md) |
