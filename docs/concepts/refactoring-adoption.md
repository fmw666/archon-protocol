# From *Refactoring* to Archon — Translation Path and Engineering Landings

> An evaluation of Martin Fowler's *Refactoring: Improving the Design of Existing Code* (2nd ed., 2018) against the Archon framework, extracting actionable engineering disciplines.
>
> **Authority note**: this document records the full translation process (*Why* + *How*). The operative definitions of each discipline live in `soul.md` — if this document conflicts with soul, soul wins.

![Comic explainer: translate, don't copy](/images/refactoring-adoption/01-translate-not-copy.png)

## 1. Why examine this book

*Refactoring* solves a core problem: **how to continuously improve internal structure without changing external behavior**. This matters just as much for AI engineering governance — but it can't be copy-pasted. Fowler's context is human teams collaborating; Archon's context is session-based AI-agent autonomy. What follows is a translation path, not a textbook port.

## 2. Concept cheat sheet

| Concept | One-line summary |
|---------|-----------------|
| **Refactoring** | Improve internal structure in small steps without changing external behavior |
| **Code Smells** | Surface symptoms hinting at deeper structural problems (22+ categories) |
| **Two Hats** | At any moment do one thing: add features *or* refactor, never both |
| **Rule of Three** | First time write it; second time tolerate it; third time abstract |
| **Characterization Test** | Before refactoring, write tests to pin current behavior first, then touch structure |
| **Branch by Abstraction** | Large-scale replacement without halting — old and new coexist, migrate gradually, delete old at the end |
| **Refactoring Catalog** | Each smell pairs with a set of named techniques, forming a reusable diagnostic lookup table |

## 3. Relationship to Archon

### 3.1 Already aligned (no new action needed)

Several of Archon `soul.md`'s principles naturally coincide with Fowler's, just expressed in different vocabulary:

| Fowler | Archon | Assessment |
|--------|--------|------------|
| Eliminate dead code | Zero-tolerance for dead code | Fully aligned |
| Single Responsibility / Extract Class | One file, one job; split when it bloats | Aligned |
| DRY / Eliminate duplication | Pattern consistency — one way to do one thing | Aligned |
| Tests as safety net | Validate gate (validate fully green) | Aligned |
| Continuous improvement over big rewrites | Drift small-step accumulation + evolution mechanism | Aligned |
| Avoid speculative abstraction | Leanness > accumulation | Aligned |
| Naming is design | Naming *is* design | Fully aligned |

These aren't coincidences. Fowler distilled from human team collaboration; Archon derived from AI-agent autonomous governance. Both arrived at the same engineering bedrock.

### 3.2 Gaps (adopted and landed)

![Comic explainer: five adopted refactoring disciplines](/images/refactoring-adoption/02-five-disciplines.png)

The following five items were present in Fowler and missing in Archon. All five are now written into `soul/delivery.md`:

| # | Gap | Fowler's original | Archon adaptation | Landing location |
|---|-----|-------------------|-------------------|------------------|
| 1 | **Two Hats** | Don't mix features and refactoring | Ship the feature delivery first, then do a refactor delivery — separate commits | `soul/delivery.md §Product Quality` |
| 2 | **Rule of Three** | Abstract only on the third repetition | Avoid premature generalization; two repetitions isn't an abstraction trigger | `soul/delivery.md §Product Quality` |
| 3 | **Gradual Replacement** | Branch by Abstraction | Old and new coexist; migrate stepwise; no stop-the-world rewrite | `soul/delivery.md §Product Quality` |
| 4 | **Restrained Tempo** | Don't refactor near a deadline | If a milestone feature isn't done, log the smell as debt; don't fix on the spot | `soul/delivery.md §Product Quality` |
| 5 | **Characterization Test** | Write Characterization Tests before refactoring | Before refactoring an existing module, add tests that pin current behavior | `soul/delivery.md §New Code = New Guardrails` |

### 3.3 Explicitly rejected

| Candidate | Rejection reason | Archon principle cited |
|-----------|------------------|-----------------------|
| **TDD mandate** | Fowler recommends test-first, but the Archon agent chooses the optimal execution path itself. A mandate reduces flexibility; the validate gate already guards the quality floor | Ownership (agent judges its own path) |
| **Standalone Refactoring Catalog doc** | The 22 generic smell categories are textbook content, not project knowledge. Consult the book when needed; not worth maintaining a copy | Leanness > accumulation |
| **Dedicated refactoring skill file** | Currently no accumulated project-specific smell patterns. An empty-shell skill violates "create-to-defend" | Knowledge hygiene |
| **Refactoring plan document template** | Producing a plan file per refactor = governance bloat. Two-Hats discipline + validate gate are sufficient | Leanness > accumulation |

## 4. Adaptation approach: human discipline → AI mechanism

![Comic explainer: load human disciplines as AI structural constraints](/images/refactoring-adoption/03-discipline-to-structure.png)

Fowler's refactoring disciplines rely on self-discipline, code review, and team culture. Archon's risk profile is different: an AI agent doesn't "forget the rules" the way a human would, but it *does* lose context and suffer cross-session cognitive drift. The adaptation goal is therefore to translate human **behavioral discipline** into AI **structural constraint**:

| Human (Fowler) | AI (Archon) | Translation |
|----------------|-------------|-------------|
| "Remember not to mix feature and refactor" | Two Hats written into `soul/delivery.md` → loaded automatically on every delivery | Behavioral discipline → cognitive pre-load |
| "Code Review catches smells" | Reasoning capsules embedded in skills → symptom maps directly to fix | Team review → self-evolving knowledge |
| "Refactor on the third repetition" | Rule of Three written into `soul/delivery.md` → decision anchor | Rule of thumb → decision primitive |
| "Write tests before refactoring" | Characterization tests written into New Code = New Guardrails → wired to the validate gate | Best practice → structural guard |
| "Phase large refactors" | Gradual Replacement written into `soul/delivery.md` → aligned with drift small-step accumulation | Project-management trick → engineering principle |

Key insight: humans need to *remember* principles; AI needs principles *loaded*. Archon's soul (core + pattern-loaded extensions) is read on demand at every boot; writing into soul equals writing into the agent's working memory.

## 5. The role of Code Smells in AI coding

![Comic explainer: from code smell to stronger guardrail](/images/refactoring-adoption/04-smell-to-guardrail.png)

Fowler's 22 Code Smells are a diagnostic checklist for humans. For AI agents, the value isn't in "memorizing" them but in establishing **smell → refactoring** fast-decision paths.

Archon's handling strategy:

1. **Don't pre-store the generic catalog** — the 22 smells are book knowledge the AI already has
2. **Accumulate project-specific mappings** — when the same smell appears for a second time in this project, embed it in the relevant skill as a reasoning capsule (symptom → root cause → fix)
3. **From diagnosis to automation** — if a smell can be detected by a lint rule, promote it to L1 (move up the Constraint Pyramid); more reliable than documentation

This matches soul's crystallization-path priority: **if a lint can catch it, don't write prose; if a reasoning capsule can capture it, don't create a dedicated file.**

## 6. Full quality-hygiene landscape after adoption

| Principle | Source | Enforcement |
|-----------|--------|-------------|
| Naming is design | Original | Cognitive pre-load |
| Single Responsibility | Original / Fowler-aligned | Cognitive pre-load |
| Zero-tolerance for dead code | Original / Fowler-aligned | Cognitive pre-load |
| Types are documentation | Original | L0 compile constraint |
| Pattern consistency | Original / Fowler-aligned | Cognitive pre-load |
| Architectural boundaries | Original | L1 lint constraint |
| No TODOs | Original | Cognitive pre-load |
| **Two Hats** | **Adopted from Fowler** | Cognitive pre-load + commit-auditable |
| **Rule of Three** | **Adopted from Fowler** | Cognitive pre-load (decision anchor) |
| **Gradual Replacement** | **Adopted from Fowler** | Cognitive pre-load + drift-linked |
| **Restrained Tempo** | **Adopted from Fowler** | Cognitive pre-load + debt-linked |
| Characterization Test (new guardrails) | **Adopted from Fowler** | L2 test constraint |

## 7. Future evolution vectors

These aren't landed today, but may trigger evolution later:

| Trigger signal | Action |
|----------------|--------|
| The same smell appears in the project for the 3rd time | Write a reasoning capsule and embed in the relevant skill |
| A smell becomes detectable by static analysis | Write a custom lint rule; promote the constraint from L3 to L1 |
| Milestone migrates critical infrastructure | Execute via Gradual Replacement (Branch by Abstraction) |
| Page-layer refactor (currently lacks tests) | Add Characterization Tests first, then touch structure |
