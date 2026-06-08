# From Formwork to Archon — Translation Path and Engineering Landings

> An evaluation of [**Formwork** (结构守卫)](https://github.com/EvoMap/formwork) — a
> methodology plus portable Agent Skills for writing **structural guards** — against
> the Archon framework, extracting what Archon already covers, what is genuinely new,
> and what is explicitly rejected.
>
> **Authority note**: this document records the full translation process (*Why* + *How*)
> and the adoption decision (see [ADR-30](/concepts/decisions)). The operative definitions
> of every load-bearing mechanism live in `soul.md`, `governance-contract.yaml`, and the
> ADR log — if this document conflicts with them, they win. Per ADR-30 this evaluation
> introduces **no new runtime, daemon, mode, agent, or persona**. The genuinely-new
> surface — product-code guards, the exemption ratchet, and the authoring skills — was
> **landed on 2026-06-08 by explicit stakeholder direction** (ADR-30 Landing pass), not
> left deferred; see §3.2, §6, and §7 for the concrete landings.

## 1. Why examine this framework

Formwork solves a sharp problem: **how to stop a fixed bug or an architectural decision
from ever silently reappearing**, by freezing it into a cheap, whole-repository
static-scan test ("structural guard") that runs in CI. Its framing is striking because it
targets exactly Archon's audience — *"the maintainer is often a stateless, self-modifying
AI agent, so the guards become the codebase's externalized, re-executing memory."*

That is, almost word for word, Archon's own thesis (constraints over documentation; drift
as externalized memory; preservation against silent drain). So the interesting question is
not "should Archon copy Formwork" but "**where does Archon already do this, and what is the
one surface Formwork covers that Archon does not?**" What follows is a translation path, not
a port.

## 2. Concept cheat sheet

| Concept | One-line summary |
|---------|-----------------|
| **Structural guard** | A test that scans the *whole tree* and asserts a codebase-wide invariant (not the behavior of one function) |
| **Six recipes** | Forbidden Pattern · Required Companion · Consumer Validation · Directory Purity · Specific File Check · Structural Invariant |
| **Five-part anatomy** | Scope → sentinel assertion (`count > N`) → violation collector → single assertion + fix guidance → path/comment normalization |
| **Sentinel assertion** | Assert "scanned files > N" first; a zero-file scan passes vacuously and is a false green — worse than no guard |
| **Grandfather + ratchet** | Freeze existing violations in an exemption set; cap == current size (no headroom); bind every exemption to a re-derivable ground-truth fact (the file still exists) |
| **Meta-guard** | "A guard that guards the guards" — assert CI still schedules the guard *directory*, not an enumerated file list |
| **bug → guard lifecycle** | After fixing a cross-file/load-order bug, freeze the bad pattern as a permanent guard the same change (`guard-from-incident`) |
| **constraint-pruner** | A scheduled deletion ritual: cheap-to-add guards accumulate and tax every session's context; prune the redundant / absorbed / toothless / stale |
| **Not-silently-modifiable** | The strongest property against a self-modifying maintainer is not "unmodifiable" but "unmodifiable *without a visible scar*" (diff, failing existence check, red meta-guard) |

## 3. Relationship to Archon

### 3.1 Already aligned (no new action needed)

Formwork's load-bearing ideas are, to a striking degree, **already present in Archon under
different vocabulary**. This is the most important finding of the evaluation.

| Formwork | Archon | Assessment |
|----------|--------|------------|
| "Not-silently-modifiable; the scar is friction, not a wall" | **Preservation Axis (ADR-28)** — "a pin is a tripwire, not a wall; still removable, but only via an explicit, auditable edit" | Fully aligned — independently arrived at the *identical* principle |
| Forbidden Pattern guard | `governance-contract.yaml` `forbidden_substrings` + the Universal Module Guard | Aligned (Archon's scope: governance files) |
| Body-shape / existence test pinning a rule | The Preservation triple's **body-shape test**; `critical_rule_substrings` | Fully aligned — a preservation pin *is* a structural guard |
| Said-vs-truth, whole-repo scan | **Claim Verifier (ADR-27)** `archon-claim-verifier.mjs` (numeric · borrowed · self-cite · missed-trig · preservation) | Fully aligned |
| "If a single-file linter expresses it, prefer the linter" | **Constraint Pyramid** L0→L5: "if a machine can enforce it, don't write prose" | Fully aligned |
| Guards = externalized, re-executing memory for a stateless AI maintainer | Archon's entire premise — soul + manifest + drift + ADRs as cross-session machine-checked memory | Fully aligned — same worldview |
| Meta-guard ("guard that guards the guards") | `archon-check.py` Blink-Dispatch self-check; the recursive review discipline ("apply every soul principle to the framework itself") | Aligned |
| bug → guard lifecycle | "New code = new guardrails" (`soul/delivery.md`) + **Signs table (ADR-24)** trigger→instruction→why + crystallization | Aligned in principle |
| Exclude the AI-instruction layer from any "docs-only" CI fast-path | The Claim Verifier / governance tests run on governance-file changes; ADR-22 records checks gate the same surface | Aligned |

These are not coincidences. Formwork distilled from elite-engineering CI practice
(`rust/tidy`, Chromium `PRESUBMIT.py`, Kubernetes `hack/verify-*`); Archon derived from
AI-agent autonomous governance. Both arrived at the same bedrock: **load-bearing rules must
become machine-rechecked tripwires, or a memoryless maintainer will silently drain them.**

### 3.2 Gaps (adopted — landed 2026-06-08 by stakeholder direction)

Four items are present in Formwork and were *not* fully covered by Archon. ADR-30's first
pass registered them as future vectors (observe-before-build); the same-day Landing pass
(stakeholder direction) implemented #1, #2, and #4 immediately. Status below is **as landed**.

| # | Gap | Formwork's original | Archon adaptation | Landing (status) |
|---|-----|---------------------|-------------------|------------------|
| 1 | **Guards over adopter *product* code, in any language** | `structural-guard` skill + TS/Python/Go/Rust/Java templates | Archon's guards cover only `.archon/` *governance* files (`archon-check.py`, `governance.test.ts`); generalize the same mechanism to application code | **Landed**: `dev` lens tool [`dev/structural-guard`](/source/domain-lenses/tools/dev/structural-guard) (registry + `dev.md`), plus the four authoring skills shipped as opt-in module `skills-formwork` |
| 2 | **Grandfather + ratchet exemption discipline** | Cap == current size; every exemption bound to a ground-truth fact (file exists) | Archon had drift mechanical floors and a preservation evidence gate, but **no generalized ratchet on exemption sets** | **Landed**: `structural_guard.exemption_ratchet` convention block in `governance-contract.yaml` (cap==current + bind-to-ground-truth), echoed in the `dev/structural-guard` tool |
| 3 | **Six-recipe taxonomy** | Forbidden Pattern · Required Companion · Consumer Validation · Directory Purity · Specific File Check · Structural Invariant | A shared vocabulary for *categorizing* a guard before authoring it | **Landed**: encoded in the `dev/structural-guard` tool card, the `structural-guard` skill, and `governance-contract.yaml structural_guard.recipes` |
| 4 | **constraint-pruner deletion ritual** | Scheduled de-bloat once the suite passes ~15 guards | Archon has "Lean > Bloat" + file line-budgets, but **no explicit guard-pruning cadence** | **Landed (as skill)**: the `constraint-pruner` skill ships in `skills-formwork`; a `soul/review.md` cadence row remains a lighter future option if usage proves it needed |

### 3.3 Explicitly rejected (still rejected after the Landing pass)

The Landing pass shipped the four skills as the **opt-in** `skills-formwork` module — so the
first-pass "do not ship skills yet" position was overridden by stakeholder direction. What
remains rejected is narrower:

| Candidate | Rejection reason | Archon principle cited |
|-----------|------------------|------------------------|
| **Ship the skills as *required* core (not opt-in)** | They were shipped, but as an opt-in module the `.archon/` core never depends on; making them mandatory would tax every adopter for a capability many won't use | Leanness > accumulation |
| **Vendor the cross-language template library (TS/Py/Go/Rust/Java) in-repo** | Templating/textbook content, not project knowledge. The shipped skills point to `github.com/EvoMap/formwork` (`templates/`, `docs/language-adapters.md`) instead of carrying a 5-language library Archon would have to maintain | Leanness > accumulation |
| **A CI guard-scheduling runtime / meta-guard daemon** | Archon is session-based, not a CI runtime; the `guard-ci-wiring` skill *describes* directory-scheduling + meta-guard, but Archon ships no daemon to run them | Not a process orchestrator (ADR-20 boundary) |
| **Treat structural guards as a new mode / agent / persona** | Guards landed as a `dev` lens *tool* and skills — the same boundary that kept Domain Lenses from becoming personas. Focus mechanisms must not spawn new identities | Inference > Configuration (ADR-19 boundary) |

## 4. Adaptation approach: external practice → Archon mechanism

Formwork addresses a human/CI failure mode (contributors forget invariants; reviews miss
cross-file patterns) with a CI artifact. Archon's risk profile is narrower and sharper: a
stateless agent does not "forget" within a session, but it **loses context across sessions**
and is **pulled by training priors toward the statistically common pattern your project
deliberately abandoned** — which is *exactly* the "plausible drift" Formwork names. The
adaptation goal is therefore to confirm the mechanism already exists, and translate only the
genuinely-new surface into the strongest fitting Archon vehicle:

| Formwork (CI practice) | Archon (governance mechanism) | Translation |
|------------------------|-------------------------------|-------------|
| "Freeze a fixed bug as a whole-tree guard" | Signs table (ADR-24) + "new code = new guardrails" + crystallization to a rule/test | CI regression artifact → cross-session reasoning capsule + promotion |
| "A pin can be edited but leaves a scar" | Preservation Axis (ADR-28) tripwire-not-wall | CI exemption diff → governance preservation triple |
| "Bind every exemption to ground truth" | Drift floors / preservation evidence gate, generalized via vector #2 | Free-text allowlist → re-derivable fact |
| "Guard the adopter's product code" | A `dev/structural-guard` lens tool (vector #1) | Cross-language CI suite → bounded atomic reasoning card |
| "Prune the guard set on a schedule" | `soul/review.md` consolidation cadence (vector #4) | Maintenance ritual → memory-layer hygiene pass |

Key insight (shared with the *Refactoring* adoption): humans need to *remember* practices;
an AI agent needs practices *loaded* and *machine-rechecked*. Formwork and Archon are two
implementations of one idea — **externalized, re-executing memory** — applied to two
different surfaces (see §5).

## 5. The one sentence that positions Formwork relative to Archon

> **Archon guards its own *governance self-code* (`.archon/`); Formwork guards the adopter's
> *product code* in any language. They are complementary halves of the same "externalized,
> re-executing memory" idea.**

Archon already runs a structural-guard suite — `archon-check.py` (~15 whole-tree assertions)
and `governance.test.ts` — but its scan target is the framework's own files (soul, manifest,
drift, domain lenses, run-state). Formwork's contribution is to point the identical mechanism
at the *application* code an adopter ships, in whatever language they write it. That is the
single surface worth growing into, and only when a real adopter demands it (§7).

## 6. Full structural-guard landscape after evaluation

| Capability | Source | Status in Archon |
|------------|--------|------------------|
| Whole-repo invariant scan of governance files | Original (`archon-check.py`, `governance.test.ts`) | Shipped |
| Said-vs-truth claim verification | Original (ADR-27) | Shipped |
| Preservation pin = tripwire-not-wall | Original (ADR-28) | Shipped |
| Forbidden-pattern / directory-purity on governance files | Original (`forbidden_substrings`, Universal Module Guard) | Shipped |
| bug → guard / sign lifecycle | Original (ADR-24 Signs, "new code = new guardrails") | Shipped |
| Sentinel-assertion discipline (no vacuous green) | Confirmed by Formwork | Present (lens `load_lines` tolerance, conditional checks); now also a contract clause (`structural_guard.sentinel_rule`) |
| Six-recipe authoring taxonomy | **From Formwork** | **Landed** (`dev/structural-guard` tool, `structural-guard` skill, `structural_guard.recipes`) |
| Grandfather + ratchet on exemptions | **From Formwork** | **Landed** (`structural_guard.exemption_ratchet` in the contract) |
| Guards over adopter product code, any language | **From Formwork** | **Landed** (`dev/structural-guard` lens tool + `skills-formwork` opt-in module) |
| Scheduled guard pruning | **From Formwork** | **Landed** (`constraint-pruner` skill in `skills-formwork`) |

## 7. Post-landing monitoring & remaining options

Vectors #1, #2, and #4 were landed in the 2026-06-08 Landing pass (§3.2). What remains is
monitoring, plus a few deliberately-deferred lighter options:

| Signal | Action |
|--------|--------|
| `skills-formwork` sees zero adopter uptake in ~6 months **and** `dev/structural-guard` is never cited in drift | Re-review ADR-30 (a): consider demoting back to docs-only — withdraw the skills module, keep the concept + lens tool |
| An adopter's guard/rule exemption set never shrinks across 3 review cycles | The `constraint-pruner` skill + soul "Lean > Bloat" already cover the deletion ritual; promote to a `soul/review.md §Memory Layer Consolidation` cadence row only if the skill proves insufficient (the lighter deferred form of vector #4) |
| The `dev/structural-guard` tool card grows past its `load_lines` tolerance as recipes accrue | Split or trim per `registry.yaml load_lines_tolerance` — the domain-lens budget mechanism already guards this |
| A second external framework independently re-derives the preservation / claim-verifier core | Strengthening signal — record it in this lane as corroboration, no action needed |
