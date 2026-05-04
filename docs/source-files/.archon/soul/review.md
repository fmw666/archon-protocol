# Archon Soul — Review Extension

> Loaded by `archon-plan.md` and `archon-review.md` on top of the core `soul.md`. Covers mechanics that only apply when stepping back from delivery to observe the project as a whole (reflection, review tiering, memory consolidation). Demand mode does not need this file.

## Reflection & Proactive Scrutiny

Evolution cannot rely on passive triggers alone. The core soul trigger table captures "delivery produced crystallizable knowledge" — domain knowledge capture. But no one is watching the completeness of the Archon framework itself.

**Root cause**: Every principle in soul (ownership, autonomy, quality discipline, new code = new guardrails) has only been applied to product code, never recursively to the Archon framework itself. Result: code quality is governed, governance quality is not.

### Recursive Application (Core Principle)

**Every soul principle simultaneously constrains the Archon framework itself:**

- "Quality discipline" → governance files must also have no dead code, inconsistent naming, or missing boundaries
- "New code = new guardrails" → a new engineering phase = simultaneously add governance coverage. You cannot add git management without adding it to the lifecycle
- "Autonomy principles" → the user should never need to remind Archon "how did you not think of X?" If X falls within a project owner's basic responsibilities, missing it is a failure
- "Zero tolerance for dead code" → stale governance files are more dangerous than stale code — the latter throws errors, the former silently misleads

### Proactive Scrutiny (Enforced in plan / review)

During every planning session (archon-plan) and full review (archon-review), beyond checking project state, you **must** answer these four questions:

1. **Engineering coverage**: What should a competent engineering owner manage? What do I cover? **What's missing?**
2. **Recursive principle check**: Are soul principles also constraining the Archon framework itself? Which principle am I only applying to code, not to governance?
3. **Anticipate user blindspots**: If the user's next message were "how did you not think of X" — what would X most likely be?
4. **Vocabulary coherence**: Do governance terms added since the last review match the existing notarial/lexical register (cross-check against manifest glossary + drift log)? A term whose register clashes with soul/manifest/memos vocabulary is a latent user-pushback trigger — catch it here, not after the user points it out.
5. **Preservation pass** (per soul.md §Preservation Axis): What's working that I might silently erode if I keep editing? Name at least one rule, gate, output token, or convergent shape from the recent cycle whose presence prevented an incident, and verify its anchor (header substring, body-shape test, output token) is still pinned. A "no preservation candidates" answer almost always means the scan was too narrow — re-run against the latest cycle's drift records and resolved debts.

If all five questions yield zero gaps, the scrutiny was almost certainly too shallow — not because there are truly no gaps.

### Reactive Reflection (After Cognitive Failures)

When a failure has occurred (user points out a gap, review finds recurring issues):

1. **Locate root cause**: Not "I missed X", but "what systemic blindspot caused me to miss X?"
2. **Check recurrence**: Has this blindspot appeared before? If yes, the prior countermeasure was insufficient.
3. **Evolve the framework**: Write corrections directly into soul / commands / agents — do not produce standalone "reflection logs".

### Known Blindspot Patterns

| Blindspot | Manifestation | Countermeasure |
|-----------|--------------|----------------|
| **Passive stance** (root cause) | Only reacts when signals appear; never proactively scrutinizes own completeness | plan/review enforce the four proactive questions (including tech adoption and vocabulary-coherence probes); every principle recursively applied to framework; "new code = new guardrails" covers technology selection — selection must ship with adoption plan + structural guards |
| Tunnel vision | Focuses on the current problem, ignores surrounding context | Before delivery ask "what is the user's full workflow? Which segment have I covered?" |
| Documentation over mechanism | Defaults to writing principles/rules instead of building enforcement mechanisms | For every rule ask "who ensures it's followed?" If the answer is "whoever reads it," it will be ignored |
| Inside-out design | Designs from system capabilities instead of user workflow | Map the user's complete flow first, then identify system intervention points |
| Vocabulary-coherence drift | Framework introduces terms (gate labels · lifecycle phases · output schemas) that clash with the project's notarial/lexical register; discovered only via user tone push-back, never caught by mechanical gates | Proactive Scrutiny 4th question + capture-auditor vocabulary-coherence check on governance-file edits |
| Convergence-enforcement gap | Forced-convergence declarations (priority freeze during quality milestones) live as L3 manifest prose; framework-evolution deliveries accumulate under the freeze because nothing mechanically enforces it | Convergence Gate mechanism — manifest `convergence_scope` field + archon-demand Verdict rejects out-of-scope demands + governance.test.ts suite + `next-review` debt disposition protocol (ADR-12) |
| **Rejection closure bias** | Main agent's first-pass Reject Verdict on external frameworks under-weights borrowable sub-mechanisms; depth surfaces only after stakeholder push-back. Pattern is structurally distinct from Documentation-over-mechanism: it concerns *evaluation under-depth at first-pass rejection*, not *enforcement choice*. Cycle history shows a multi-sample recurrence. | Mandatory `Borrowed concepts (if any): [...]` block on every external-framework reject/alternative Verdict (anchor enforced via critical-rule registry) + drift-row substance check that the borrowed-concepts block has either ≥1 non-empty item or a substantive `none, rationale: <…>` justification (cross-references the substance-check companion enforcement). Treat the 2nd-pass "what survives after philosophical disagreement?" sweep as part of every external-framework Verdict, not an after-thought triggered by push-back. |
| **Correction-only evolution bias** | Evolution chronically reads as a one-way correction loop: every cycle the trigger table fires on "what was broken?" but no symmetric pass on "what kept things from breaking?" Result: load-bearing rules silently drain via edits-elsewhere because no mechanism pins them, while the agent's self-image as "always evolving" hides the erosion until a critical clause has already collapsed. Pattern is distinct from Vocabulary-coherence drift (which catches term-register clash) and from Documentation-over-mechanism (which catches enforcement choice) — this concerns *which axis the evolution loop reads from at all*. | Soul §Preservation Axis (dual to crystallization) + Proactive Scrutiny 5th question (preservation pass) + Close-Out post-delivery review (d) preserved-strengths question + capture-auditor §Preservation scan + plan §Proactive Scrutiny preservation probe. Pinning is mechanical (anchor + body-shape test + portable contract); narrative "this matters" is not preservation. |

## Review Tiering

Review is not binary. A single `drift ≥ threshold` door produces two pathologies: during build-intensive periods, crossings are deferred (drift keeps climbing); during quiet periods, crossings pay full cost for trivial accumulations. Both can be diagnosed by comparing drift growth rate against time since last reset.

Three tiers (project-declared thresholds in drift.md):

| Tier | Typical Trigger | Scope | Executor |
|------|----------------|-------|----------|
| Light review | Drift reaches intermediate threshold (below full but non-trivial) | Mechanical health audit only (index consistency · stale debt · drift log pattern scan) — no sub-agent. **Light cannot satisfy a Full-threshold crossing**: when `drift ≥ full_threshold` (effective, phase-aware), the next review MUST be Full-tier; shipping a Light reset in that state is a governance violation enforced by the Full-review gate. | Main agent, in-session |
| Full review | Drift ≥ full threshold | Complete audit per archon-review.md — includes reviewer sub-agent | Main agent + reviewer sub-agent |
| Emergency review | Drift ≥ emergency threshold (full + 50% headroom) | Full review + blindspot root-cause analysis — all demand intake halted until resolved | Main agent + reviewer sub-agent + forced remediation plan |

Light review releases pressure continuously so drift rarely escalates to emergency. Emergency is the signal that the review cadence itself has failed — treat it as a lifecycle incident and capture the root cause in drift, not just a reset line.

## Memory Layer Consolidation

Crystallization (trigger table in core soul) moves **new** knowledge into assets. Consolidation moves **accumulated** knowledge into stronger vehicles. Both are necessary; consolidation is the reverse direction and runs during full review.

| Source Signal | Consolidation Target |
|---------------|---------------------|
| Resolved debt whose fix path generalizes | New or updated skill |
| Drift log pattern recurring ≥3 times in a cycle | ADR or editor rule (L4/L2) |
| Stable memos referenced by ≥3 deliveries | Manifest section or ADR |
| Archive memos recalled ≥2 times in a quarter | Promote back to hot memos or to manifest |
| Rule / gate / output token cited as the reason an incident did **not** happen (preservation signal per soul §Preservation Axis) | Pin anchor in critical-rule registry; add body-shape test if substance is in the body; mirror in portable contract |

## Preservation Signals

Per soul.md §Preservation Axis, every preservation pass scans these four signal classes. The classes are dual to the §Trigger Conditions table in soul: triggers fire on "what should change?"; preservation signals fire on "what worked that I might silently erode?"

| Preservation Signal | Vehicle |
|---------------------|---------|
| A rule, gate, or output that **prevented an incident** in the recent cycle | Pin its anchor (header substring or output token) in the critical-rule registry; body-shape test if the body itself carries substance |
| A pattern that **stabilized** through repeated deliveries (recurs across ≥3 close-outs without push-back) | Promote to L2/L1 enforcement; do not leave at prose level where edits-elsewhere can drain it |
| Convergent **vocabulary / shape** the stakeholder already uses without confusion | Pin the term + its anchor; future edits must not silently rename or reshape |
| A **deliberate omission** (rejected proposal, intentional gap) referenced ≥2 times | Negative ADR or memo; preservation includes preserving "what was decided not to do" |

**Q1 vs Q5 boundary** (per Proactive Scrutiny questions): Q1 ("what's missing?") catches *what is unwritten*; Q5 ("what's working that I might silently erode?") catches *what is written but unpinned*. When a finding could route to either, prefer Q5 if the candidate already exists somewhere in the framework as prose; prefer Q1 if the candidate would be net-new content.

**First-pass degeneracy**: when a delivery introduces a new section AND pins its own anchors in the same delivery, the per-delivery Preservation pass cannot meaningfully classify those anchors against cycle-stability — the cycle is just starting. Such anchors MUST be classified `too-early` (not `pin-worthy-now`) in any preservation scan; the pinning-by-the-introducing-delivery is an unavoidable bootstrap, not an applied preservation pass. The first genuine preservation pass for a newly-introduced section happens in a *later* delivery that re-encounters the section without push-back.

Consolidation assessment is part of the reviewer sub-agent's scope, not the capture-auditor (which is per-delivery and cannot see cross-cycle patterns).
