# Archon vs Superpowers — Comparative Analysis and Adopted Disciplines

> Structural comparison between Superpowers v5.0.7 (2026-03) and the current Archon version. If you want the full internal architecture instead, read [architecture.md](/concepts/architecture).

![Comic explainer: Superpowers is a horizontal skill library, Archon is a vertical governance framework](/images/superpowers-comparison/01-skills-vs-governance.png)

The two systems solve different layers of the problem. Superpowers is a **horizontal skill library** (*how to code*). Archon is a **vertical governance framework** (*how to govern*). The new `capability` Domain Lens lets Archon route horizontal capabilities from within a governance flow: first decide whether a given skill/tool should be loaded at all, then let the main agent consume it — rather than turning Archon itself into a static skill library. Complementary more than competitive.

## 1. Positioning

This section frames why the two systems don't compete one-to-one. The rest of the document then walks through each mechanism, records which Superpowers disciplines Archon adopted, and explains which it deliberately rejected.

## 2. Mechanism-by-mechanism comparison

### 2.1 Workflow

| Dimension | Superpowers | Archon | Verdict |
|-----------|-------------|--------|---------|
| Design phase | brainstorm → spec → user approval | Decision Gate (should it be done / how big) → execute | SP is stricter but sacrifices autonomy; Archon's gate is lightweight but sufficient |
| Planning phase | writing-plans (2–5min granularity, full code) | No standalone plan document | SP suits delegation to a junior agent; Archon itself is senior, doesn't need textbook-level plans |
| Execution phase | subagent-per-task + two-stage review | Main agent executes autonomously | SP's subagent isolation protects context; Archon doesn't split execution and relies on the validate gate as backstop |
| Review phase | code-reviewer subagent (every task) | Blink Dispatch triages capture-auditor / reviewer / skip | SP is high-frequency low-depth; Archon is conditional, preserves independent judgment while controlling latency |
| Knowledge management | None (skills are static files) | drift / debt / capture-auditor / evolution mechanisms | **Archon-exclusive strength** |

### 2.2 Quality assurance

| Dimension | Superpowers | Archon | Verdict |
|-----------|-------------|--------|---------|
| Test discipline | TDD mandate (test first or delete-and-restart) | "New code = new guardrails" (must have tests, doesn't prescribe order) | SP stricter but dogmatic; Archon flexible but softer on enforcement |
| Debugging method | Four-phase root-cause analysis + anti-rationalization table | None (reasoning capsules only record post-hoc paths) | **SP advantage → adopted** |
| Constraint enforcement | Relies entirely on L3 documentation | Constraint Pyramid L0→L5 + Lint-Rule bridge | **Archon-exclusive strength** |
| Code review | Per-task subagent review | Full review triggered by drift threshold | SP more frequent; Archon more economical |
| Capability selection | User or skill self-entry | `capability` lens routes skill / domain tool / test / ADR / manifest | Archon has a horizontal-capability entry point, but consumption remains governance-gated |

### 2.3 Self-evolution

| Dimension | Superpowers | Archon | Verdict |
|-----------|-------------|--------|---------|
| Knowledge capture | ❌ None | ✅ capture-auditor + trigger table + crystallization paths | **Archon-exclusive** |
| Drift detection | ❌ None | ✅ drift counter + threshold review | **Archon-exclusive** |
| Debt tracking | ❌ None | ✅ debt.md + milestone gate | **Archon-exclusive** |
| Constraint maturity | ❌ None | ✅ SHOULD → MUST upgrade path | **Archon-exclusive** |
| Blind-spot introspection | ❌ None | ✅ Recursive applicability + active-review four questions (expanded to five in 2026-05) | **Archon-exclusive** |
| Anti-rationalization | ✅ Red Flags table built into every skill | ⚠️ Principle existed in soul layer but was missing at skill layer | **Adopted** |
| Dual-motion evolution | ❌ None (only "skill = static file" mental model) | ✅ Crystallization (change → stronger vehicle) + Preservation (stabilize → three-piece pin, ADR-28) | **Archon-exclusive**: avoids correction-only evolution bias |
| Claim vs Truth guard | ❌ None | ✅ `archon-claim-verifier.mjs`, five modes (numeric · borrowed · self-cite · missed-trig · preservation, ADR-27+28) | **Archon-exclusive**: mechanized proofreading of governance prose against in-repo truth |
| Concurrent delivery storage | N/A (no governance state) | ✅ Records-Folder event-sourcing + recomputable hot summaries (ADR-22) | **Archon-exclusive**: multi-agent parallel delivery without text conflicts |
| Foresighted splitting | ❌ None (splits based on "feeling," always post-hoc) | ✅ Decision Gate Source Modularity Probe (ADR-29): mechanically detects axis fan-out when a file is created or hits the map | **Archon-exclusive**: pre-empts merge conflicts on concurrent PRs |

### 2.4 Sub-agent strategy

| Dimension | Superpowers | Archon |
|-----------|-------------|--------|
| Count | Many (1 implementer + 2 reviewers per task) | Lean (Blink Dispatch + auditor + reviewer) |
| Trigger | Every task | Blink Dispatch's thin-slice decision; auditor for high-risk; reviewer at full-review threshold; skip for low-risk |
| Cost | High (v5.0.6 found 25-min review overhead with no measurable quality gain → removed) | Low (precise delegation of judgment-only work) |
| Context isolation | ✅ Emphasized (subagent gets only the context it needs) | ✅ Present (sub-agent receives a summary) |

**Key empirical point**: Superpowers v5.0.6 used regression tests to demonstrate that mechanizing review into subagents cost ×50 latency with no measurable quality improvement. → Recorded in `soul/delivery.md §Cost-Consciousness Principle`.

## 3. Adoption landing list

![Comic explainer: adopt useful disciplines, reject what weakens autonomy or inflates process](/images/superpowers-comparison/02-adopt-or-reject.png)

### ✅ Adopted

| Item | Source | Landing location | Adaptation |
|------|--------|------------------|------------|
| **Anti-rationalization tables** | SP's Red Flags section in every skill | `react-19-patterns §Red Flags` (7 items), `api-schema-guide §Red Flags` (6 items), `systematic-debugging §Red Flags` (8 items) | Shift from generic doctrine to project-specific scenarios (cites `debt.md` evidence) |
| **Systematic debugging methodology** | SP `systematic-debugging` skill | `.cursor/skills/systematic-debugging/SKILL.md` | Dropped "ask human partner" (autonomy principle); wired to reasoning capsules (Archon-exclusive knowledge-crystallization mechanism); dropped TDD-mandate (keeps execution flexible) |
| **Sub-agent cost-consciousness** | SP v5.0.6 empirical finding | `soul/delivery.md §When to Escalate to Delegation` (includes cost-consciousness) | Encoded as a decision principle rather than a configuration — matches "infer > configure" |

### ❌ Explicitly rejected

| Candidate | Rejection reason | Archon principle cited |
|-----------|------------------|-----------------------|
| brainstorming workflow | Call-and-response to flesh out requirements violates "don't make the user think" | Autonomy |
| writing-plans planning document | A plan file produced on every demand = governance bloat | Leanness > accumulation |
| TDD mandate (delete if tests come after code) | Agent chooses optimal execution path; dogmatic constraint reduces efficiency | Ownership (agent judges optimal execution) |
| git worktree isolation | Current direct-branch model; premature complexification | Evolution tempo (infer from state; don't preventively introduce) |
| subagent-per-task execution | Archon's agent is senior and doesn't need to break tasks down for juniors | Ownership > assistance |

## 4. Full Archon architecture

![Comic explainer: Blink Dispatch only delegates judgment work](/images/superpowers-comparison/03-blink-dispatch-cost.png)

> Complete architecture document: **[architecture.md](/concepts/architecture)** (system overview, delivery lifecycle, constraint pyramid, knowledge evolution system, sub-agent delegation model).
>
> The list below is only a feature overview for comparison reference. The core pattern remains: mechanical checks are self-serve; judgment checks are delegated. Blink Dispatch triages capture-auditor / reviewer / skip.

## 5. Post-adoption Archon feature overview

![Comic explainer: Archon's dynamic knowledge system keeps evolving from deliveries](/images/superpowers-comparison/04-dynamic-knowledge.png)

| Category | Feature | Source |
|----------|---------|--------|
| **Identity** | Project-ownership model (Agent = Owner, not Assistant) | Original |
| **Identity** | Five identity axioms (ownership > assistance · constraint > documentation · inference > configuration · leanness > accumulation · separation > self-review) | Original |
| **Cognition** | Sense → Model → Act → Verify loop (any backtrack allowed) | Original |
| **Governance** | Delivery lifecycle (7 phases + version control + threshold events) | Original |
| **Governance** | Decision Gate (should it be done / how big / who decides) | Original |
| **Governance** | Validate gate (lint + typecheck + test; stay red until green) | Original |
| **Governance** | Drift counter + threshold-forced review | Original |
| **Governance** | Debt register + milestone gate | Original |
| **Quality** | Constraint Pyramid L0–L5 | Original |
| **Quality** | Constraint maturity (SHOULD → MUST upgrade path) | Adopted from archon-protocol |
| **Quality** | Lint-Rule bridge (L1 actively triggers L2) | Original |
| **Capability** | Capability Lens: routes deploy, data-platform, state-management, reactivity, skeleton-UI etc. requests to skill / domain tool / test / ADR / manifest | Original |
| **Quality** | Anti-rationalization tables (Red Flags) embedded in skills | ✨ Adopted from Superpowers |
| **Quality** | Systematic debugging methodology (four-phase root-cause analysis) | ✨ Adopted from Superpowers |
| **Evolution** | Knowledge capture (trigger table + crystallization paths) | Original |
| **Evolution** | Dual-motion evolution: Crystallization (change) + Preservation (stabilize, three-piece pin, ADR-28) | Original |
| **Evolution** | Claim Verifier, five modes (numeric/borrowed/self-cite/missed-trig/preservation, ADR-27+28) | Original |
| **Evolution** | Reasoning capsules (symptom → root cause → fix, embedded in skills) | Original |
| **Evolution** | Recursive applicability (soul principles bind Archon itself) | Original |
| **Evolution** | Active-review five questions (mandatory in plan/review; ADR-28 added a preservation question) | Original |
| **Evolution** | Known-blindspot pattern table (includes correction-only evolution bias, ADR-28) | Original |
| **State** | Records-Folder event-sourcing + recomputable hot summaries (drift/memos/debt, ADR-22) | Original |
| **Governance** | Decision-Gate three probes (Radius ADR-23 · Soul-headroom · Modularity ADR-29); mechanical facts fed in before Verdict | Original |
| **Delegation** | Execution/judgment separation (sub-agent advises; main agent executes) | Original |
| **Delegation** | Cost-consciousness principle (mechanical checks self-serve; judgment checks delegated) | ✨ Adopted from Superpowers v5.0.6 empirical evidence |
| **Decoupling** | soul / commands / agents are project-agnostic; portable to any new project | Original |
| **Decoupling** | manifest is the only place for project specifics | Original |
| **Hygiene** | Create-to-defend + governance budget + context budget | Original |
| **Hygiene** | Governance-file line-count gate (governance.test.ts) | Original |
