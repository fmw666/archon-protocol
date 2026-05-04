# Archon

> A session-based AI engineering governance framework. Elevates the AI agent from "tool that follows instructions" to "engineering owner with full project accountability."

> **Quick entry points**
>
> - New here and want the big picture in 10 minutes? → [concepts/overview.md](/concepts/overview)
> - Want to install Archon in 5 minutes? → [adoption/quickstart.md](/setup/quickstart)
> - Want the full reference? → [architecture.md](/concepts/architecture) + [setup.md](/setup/full-guide)

## One-Line Summary

![Comic explainer: Archon owner not assistant](/images/readme/01-owner-not-assistant.png)

The user expresses product intent; Archon translates it into engineering action and delivers end-to-end — including decisions, implementation, verification, knowledge crystallization, and self-review.

## Core Philosophy

| Principle | Meaning |
|------|------|
| Ownership > Assistance | Agent is the owner, not the assistant |
| Constraints > Documentation | If a machine can enforce it, don't write prose |
| Inference > Configuration | Derive behavior from project state, not mode flags |
| Lean > Bloat | Fewer, stronger knowledge assets |
| Separation > Self-Review | The executor must not judge its own work |

## Documentation Guide

### Ships with every adopter project

| Document | You Will Learn |
|------|-----------|
| **[architecture.md](/concepts/architecture)** | Full Archon architecture: cognitive loop, delivery lifecycle, constraint pyramid, knowledge evolution, sub-agent delegation, state management, anti-bloat mechanisms |
| **[setup.md](/setup/full-guide)** | Integrating Archon into a new project: file inventory, templates, structural guard configuration, verification checklist |
| `.archon/contracts/governance-contract.yaml` | Portable governance contract consumed by dependency-free reference checkers (`scripts/archon-check.py`, `scripts/archon-check.sh`) and mirrored by authoring-source tests |
| **[decisions.md](/concepts/decisions)** | Archon framework ADRs: context, trade-offs, and rationale for reusable governance mechanisms (e.g., soul on-demand loading, SRE-grade gates, platform-capability bindings) |

### Authoring-repo only (not exported)

These documents live in the Archon authoring source. They are linked from the public project site; adopter projects do not receive them automatically.

| Document | You Will Learn |
|------|-----------|
| [`user-journeys.md`](/concepts/user-journeys) | 16 real-world pitfalls of AI-assisted coding and how Archon's mechanisms address each one — the "why" behind the framework |
| [`concepts/overview.md`](/concepts/overview) | 10-minute tour of Archon for readers who want the big picture before diving into architecture.md |
| [`concepts/model-vs-harness.md`](/concepts/model-vs-harness) | The "Model vs. Harness" debate dissected: six questions that expose why stronger models still need engineering environments |
| [`mechanisms/drift-mechanism.md`](/concepts/drift-mechanism) | Deep dive into the drift mechanism: tiered triggering (light/full/emergency), mechanical floors, dynamic thresholds (including convergence-phase tightening), log compression |
| [`concepts/product-architecture-workflow.md`](/concepts/product-architecture-workflow) | Product-facing Archon architecture workflow: new project onboarding, existing project intake, demand execution, configuration surface, and independent-product boundaries |
| [`concepts/superpowers-comparison.md`](/concepts/superpowers-comparison) | Comparative analysis with the Superpowers framework — anti-rationalization table, systematic debugging, sub-agent cost awareness |
| [`concepts/refactoring-adoption.md`](/concepts/refactoring-adoption) | Distilled refactoring discipline (two hats, rule of three, gradual replacement, tempo, characterization tests) |
| [`adoption/quickstart.md`](/setup/quickstart) | 5-minute install path: drop in the export, initialize state, wire validate, install pre-commit hook, first demand |
| [`adoption/dashboard-redesign-prd.md`](/setup/dashboard-prd) | Visual + interaction redesign PRD for the Archon Dashboard (Light Voxel Brutalist, multi-session, whiteboxed execution trace) |

### Tools

| Tool | Purpose | Availability |
|------|---------|--------------|
| **Dashboard** (`/archon-dashboard`) | Governance state visualization — workflow-driven layout + real-time heartbeat + schema structural guard | Included in adopter projects (optional; activate by keeping `.archon/dashboard/` directory present) |
| **Export script** | Generate a standalone Archon kit for new projects from the authoring source | Authoring source only — adopter projects do not need to re-export |

## Question Router

![Comic explainer: Archon question router](/images/readme/02-question-router.png)

Start from the question you are trying to answer:

| Question | Read First | Then Check |
|------|------|------|
| What is Archon, structurally? | `README.md §Quick Overview` | `architecture.md §System Architecture Overview` |
| How do Archon's thinking, memory, domain, delivery, validation, evolution, and crystallization layers fit together? | `architecture.md §Layered Operating Model` | `README.md §Mechanism Relationship Map` |
| Why does a mechanism exist? | `docs/archon/decisions.md` | `architecture.md §Mechanism Boundaries` |
| How does one delivery run? | `README.md §Workflow` | `{platform}/commands/archon-demand.md` |
| How does Archon keep execution flexible without losing hard gates? | `{platform}/commands/archon-demand.md §Self-Directed Execution Interior` | `architecture.md §Boundary-Hard, Process-Soft Execution` |
| How does Archon learn from each delivery? | `.archon/drift.md` | `{platform}/commands/archon-demand.md §Close-Out` |
| How does Archon keep what already works from silently draining? | `architecture.md §Preservation Axis (Dual to Crystallization)` | `decisions.md §ADR-28 · Preservation Axis` |
| How does Archon catch governance prose drifting from the repo? | `architecture.md §Claim Verification` | `decisions.md §ADR-27 · Claim Verifier` |
| How does Archon prevent concurrent deliveries from colliding on the same file? | `architecture.md §Decision Gate` (Modularity probe) | `decisions.md §ADR-29 · Source Modularity Probe` |
| How does Archon store governance state without merge conflicts between parallel branches? | `drift-mechanism.md §Storage Shape — One File Per Event` | `decisions.md §ADR-22 · Records-Folder` |
| How does Archon learn the user's wording for project objects? | `.archon/manifest.md §User Language Index` | `soul.md §Ownership` |
| How does Archon evolve from delivery history? | `architecture.md §Delivery Evolution Loop` | `decisions.md §ADR-20 · Archon-native Evolution Loop（交付经验自进化）` |
| How does Archon forecast the next architecture pressure? | `architecture.md §Architecture Forecast Loop` | `{platform}/commands/archon-demand.md §Close-Out` |
| How does Archon self-test an evolution promotion? | `architecture.md §Evolution Self-Test Matrix` | `drift.md` post-delivery review |
| How does Archon filter experience noise from breakthrough signals? | `architecture.md §Evolution Signal Triage Matrix` | `{platform}/commands/archon-demand.md §Close-Out` |
| Which professional lens should a demand use? | `.archon/domain-lenses/README.md` | `.archon/domain-lenses/registry.yaml` |
| How does Archon choose reusable skills or tool cards for broad capability requests? | `.archon/domain-lenses/README.md §Capability Toolsets And Skills` | `manifest.md §Knowledge Assets` + platform skill metadata |
| Is this a Domain Lens or Extension? | `README.md §Mechanism Relationship Map` | `architecture.md §Domain Lenses vs Extensions` |
| Why did work stop for review? | `.archon/drift.md` | `architecture.md §Drift Precheck` |
| Why can or cannot a commit happen? | Run-State v2 state file | `{platform}/skills/archon-git-commit/SKILL.md` |
| Is an adopter export complete? | `governance-contract.yaml` | `scripts/archon-check.py` |
| Where should project-specific context live? | `.archon/manifest.md` | `{platform}/rules/archon.mdc` |

## Quick Overview

> `{platform}/` stands for the active AI coding platform's directory — `.cursor/` on Cursor, `.claude/` on Claude Code, etc. `.archon/` is the same path everywhere.

```
.archon/                  ← Core + project state (same path on every platform)
├── soul.md               ← Cognitive core (axioms · guardrails · evolution · extension points; hot-path sections)
├── soul/
│   ├── delivery.md       ← Delivery-mode extension (reasoning capsules · lifecycle hooks · fast-path; loaded by /archon-demand)
│   └── review.md         ← Review-mode extension (reflection · tiering · memory consolidation; loaded by /archon-plan, /archon-review)
├── manifest.md           ← Project hot context (stack · user language index · directories · milestones · state · latest validation)
├── manifest/archive/     ← Cold manifest review/history detail (keyword-indexed · on-demand recall)
├── drift.md              ← Drift hot index (AUTO-GENERATED from drift/records/ via scripts/archon-records.mjs · ADR-22)
├── drift/records/        ← Per-delivery record files (one per +N/-N event · ISO8601 names · YAML frontmatter)
├── drift/archive/        ← Cold delivery-log archive (quarterly partitions · keyword-indexed · on-demand recall)
├── debt.md               ← Tech debt hot gate index (AUTO-GENERATED from debt/items/ · ADR-22)
├── debt/items/           ← Per-debt item files (DEBT-NNN-<slug>.md · YAML frontmatter)
├── debt/archive/         ← Cold debt rationale archive (full source · trigger details · on-demand recall)
├── memos.md              ← Stakeholder conclusions hot index (AUTO-GENERATED from memos/records/ · ADR-22 · ≤5 compact)
├── memos/records/        ← Per-memo record files (one per stakeholder conclusion · YAML frontmatter)
├── memos-archive/        ← Cold archive (quarterly partitions · keyword-matched · on-demand recall)
├── decisions.md          ← Project-specific ADR ledger (product, stack, and adopter-local decisions)
├── domain-lenses/        ← Domain Lens pre-Verdict index + proceed-only lens/tool contracts
│   ├── registry.yaml     ← Single index for installed lenses, tool discovery metadata, and budgets
│   ├── lenses/           ← Lens contracts
│   ├── tools/            ← Atomic tool cards scoped to one lens
│   └── templates/        ← Lens/tool authoring skeletons for new domains
│       ├── lens.md       ← Lens contract template
│       └── tool.md       ← Atomic tool card template
├── extensions/           ← Optional pluggable lifecycle hooks (project-specific, NOT exported with the kit)
└── dashboard/            ← Optional governance-state visualization (zero-dep Node server; activate by keeping the directory)
.archon/contracts/governance-contract.yaml ← Portable baseline for governance checks
scripts/
├── archon-check.py       ← Dependency-free Python reference checker
└── archon-check.sh       ← POSIX shell wrapper around archon-check.py

{platform}/               ← Platform-specific files (.cursor/ or .claude/)
├── commands/
│   ├── archon.md            ← Unified entry (wake + intent routing)
│   ├── archon-demand.md     ← Delivery (decision gate → self-directed execute → validation gate → close-out)
│   ├── archon-plan.md       ← Planning (next-step recommendations, read-only)
│   ├── archon-review.md     ← Full review (drift threshold triggered)
│   └── archon-dashboard.md  ← Launch governance dashboard
├── agents/
│   ├── archon-reviewer.md         ← Independent review sub-agent
│   └── archon-capture-auditor.md  ← Post-delivery knowledge capture sub-agent
├── rules/
│   ├── archon.mdc                 ← Decoupling rules (what may / may not go in each file)
│   └── archon-wake.mdc            ← Wake trigger ("hi archon, ..." natural-language activation)
└── skills/
    ├── archon-framework/SKILL.md   ← Agent primer (this entire directory's self-introduction for the agent)
    ├── archon-git-commit/SKILL.md  ← Commit-gate skill (reads Run-State v2 or legacy .archon/run.md)
    ├── blink-dispatch/SKILL.md     ← Thin-slice subagent dispatch gate (decides skip vs use:<subagent>)
    └── external-agent-patterns/SKILL.md ← External-framework evaluation skill (checks role assumptions before borrowing patterns)
```

## Mechanism Relationship Map

![Comic explainer: Archon mechanism lanes](/images/readme/03-mechanism-lanes.png)

Archon stays clear by keeping each mechanism in one lane:

| Lane | Mechanism | Owns | Does Not Own |
|------|-----------|------|--------------|
| Identity | `soul.md` + `soul/` | Archon's axioms, autonomy, review discipline, delivery rules | Project facts or domain-specific toolkits |
| Project state | `manifest.md`, `manifest/archive/`, `debt.md`, `memos.md`, `drift.md` | Product context, user language aliases, milestone state, latest validation, cold review detail, active debt gate index, stakeholder conclusion index, delivery log, post-delivery review, drift pressure | Universal framework rules |
| Demand focus | `.archon/domain-lenses/` | One delivery's professional lens, reusable capability routing, and bounded atomic tools | Lifecycle hooks, persona changes, provider-specific manuals, or selector ownership of the delivery |
| Lifecycle hooks | `.archon/extensions/` | Project-local pre-scan, close-out, review, dashboard, or workflow hooks | Domain reasoning inside one demand |
| Sub-agent dispatch | `blink-dispatch` skill + `archon-reviewer` / `archon-capture-auditor` + generic read-only capability selector | When independent review, capture, or compact capability selection is worth the context/cost | Main-agent ownership of the delivery |
| Delivery state | `.archon/runs/&lt;run_id&gt;/state.json` + `archon-git-commit` | Per-delivery completion evidence and commit permission | Long-term project memory |
| Portable enforcement | `governance-contract.yaml` + `archon-check.py` + authoring tests | Baseline checks that travel with the framework | Product-specific policy overlays |
| Claim verification | `scripts/archon-verify.mjs` (ADR-27) — 5 modes: numeric-claim · borrowed-concepts · self-citation · missed-triggers · preservation-evidence | Catching "said vs truth" drift between governance prose and repository state | Deciding whether a claim was worth making in the first place |
| Preservation pinning | Soul §Preservation Axis + critical-rule registry + `web/src/test/governance.test.ts` body-shape checks + `governance-contract.yaml` entries (ADR-28 triple) | Mechanically anchoring load-bearing rules so evolution does not silently hollow them out | Suppressing legitimate crystallization of new rules |
| Project decision history | `.archon/decisions.md` | Why this project chose a product, stack, or local architecture path | Framework mechanism rationale |
| Framework decision history | `docs/archon/decisions.md` | Why a reusable Archon mechanism exists and when to revisit it | Project runtime source of truth |

Rule of thumb: Domain Lenses change **how one demand is reasoned about**; Extensions change **when lifecycle behavior runs**; Run-State proves **this delivery is complete**; Drift hot index records **what was recently delivered and learned**, then decides **whether the agent needs review before more work**; drift archives are loaded only when a demand/review/debt/ADR points to an older period or keyword.

Capability rule: broad requests like deployment strategy, data backend choice, frontend state management, responsive behavior, loading feedback, or skeleton policy use the `capability` lens. Domain tool candidates come from `registry.yaml`; skill candidates come from manifest knowledge assets or platform skill metadata. If reading full candidate assets would crowd the main context, the main agent may ask a generic read-only selector for a compact `capability_selection` packet after `Verdict=proceed`. The selector never outputs a Verdict, never launches subagents, and never implements changes.

**Example: Theme Palette Request**

![Comic explainer: Domain tool theme palette case](/images/readme/05-domain-tool-theme-palette-case.png)

A request like "help me design an excellent theme palette" is not just free-form taste. Archon routes it through the `design` lens, selects `design/palette-boundary`, loads the relevant design-system skill, then produces a bounded palette contract: roles, ratios, contrast, state colors, and rejection rules. The Domain Lens decides **which capability path** to use; the tool card defines **what reusable judgment shape** is needed; the skill supplies **provider or project-specific practice**; validation proves the result can guide implementation.

Evolution rule: delivery experience starts as a drift event, becomes an evolution signal only when it repeats or carries enforcement/reuse/architecture value, and then promotes to the strongest fitting vehicle. Archon borrows self-evolution ideas as local constraint upgrades; it does not install a daemon, copy external protocol schemas, or use drift as a backlog.

Forecast rule: each non-fast-path close-out writes a compact architecture forecast (`risk|next|confidence`) into the delivery record. The forecast helps the next pre-scan inspect likely pressure, but it is not a backlog, roadmap, or permission to skip the next Verdict.

Per-delivery ephemeral state (created on demand, not versioned between deliveries):

```
.archon/runs/<run_id>/state.json       ← Run-State v2 for each active delivery (gitignored)
.archon/runs/<run_id>/events.ndjson    ← Append-only v2 event trace (gitignored)
.archon/run.md                         ← Legacy single-file fallback during migration
.archon/templates/run-state.schema.json ← v2 schema shipped in the export
.archon/templates/run.template.md  ← Legacy schema reference shipped in the export
scripts/archon-run-state.mjs           ← v2 helper (init/set/check/resolve-for-commit/cleanup)
```

State vehicle cheat sheet:

| Need | Write To |
|------|----------|
| Prove this in-flight delivery can commit | `.archon/runs/&lt;run_id&gt;/state.json` |
| Resolve stakeholder wording or aliases to project artifacts | `.archon/manifest.md §User Language Index` |
| Record what was delivered and learned | `node scripts/archon-records.mjs new drift --type delivery --delta +N --summary "..."` → `.archon/drift/records/*.md` (hot summary auto-regenerated) + `.archon/drift/archive/*.md` cold logs |
| Update durable project facts or latest validation | `.archon/manifest.md` hot context + `.archon/manifest/archive/*.md` cold review detail |
| Track unresolved work or promoted follow-up | `node scripts/archon-records.mjs new debt --id DEBT-NNN --severity ... --status pending --deadline ... --source "..." --summary "..."` → `.archon/debt/items/*.md` (hot index auto-regenerated) + `.archon/debt/archive/*.md` cold rationale |
| Capture stakeholder conclusion | `node scripts/archon-records.mjs new memos --topic "..." --conclusion "..." --source "..."` → `.archon/memos/records/*.md` (hot index auto-regenerated) + `.archon/memos-archive/*.md` cold archive |
| Explain why a reusable Archon mechanism exists | `docs/archon/decisions.md` |
| Record a project-specific product or stack decision | `.archon/decisions.md` |

If a note is only a one-off observation, keep it in `drift.md`; promote it only when it becomes repeated, enforceable, reusable, or architectural.

Preservation rule (ADR-28 dual motion): each Close-Out post-delivery review asks (a)(b)(c) what should **change** (crystallization) AND (d) what **already worked** and should be pinned against silent drain (preservation). A pin is a tripwire, not a wall — three mechanical parts (anchor + body-shape test + portable-contract entry), removed only as an explicit, auditable edit.

## Workflow

![Comic explainer: Archon delivery route](/images/readme/04-delivery-route.png)

```
 /archon-demand "implement feature X"    [invoke from Plan mode when the platform supports it]
        │
        ▼
 Step 0 · Drift Precheck ──→ hard gate: emergency → halt · full → block · light → notice
        │
        ▼
   Pre-Scan ──→ memos + archive keyword match + ADRs + User Language Index alias scan + extension pre-scan hooks
        │
        ▼
   Domain Lens ──→ optional single lens + bounded atomic tools, or decompose multi-domain demand
        │
        ▼
   Fast-Path? ──→ qualified trivial (≤2 files · no new pattern) → collapse ceremony
        │ no
        ▼
   Decision Gate ──→ **Verdict**: ruling + radius + reversibility + rationale
        │             ├─ Plan-mode binding: Verdict precedes any write-side tool invocation
        │             └─ Convergence gate (when manifest declares Convergence scope):
        │                out-of-scope demand → reject, unless exempted or user-overridden
        │
        ├─ Capability selector? ──→ optional read-only packet when capability assets are ambiguous
        │
        ▼
   Self-directed Execute ──→ Agent plans tools, helper code, order, and backtracking
        │             └─ Boundary-hard/process-soft: Verdict, validation, Run-State,
        │                independent review, and evolution filter remain hard gates
        │
        ▼
   Validation Gate ──→ lint + typecheck + test all green
        │
        ▼
   Close-Out ──→ manifest · capture(sub) · drift(mechanical floor + architecture forecast) · memos(+archive) · extensions · git → **Close-Out** compliance checklist
        │             ├─ Run-state gate: v2 permitCommit=true or legacy permit_commit: 1
        │             └─ archon-git-commit skill handles commit; pre-commit hook enforces the gate
        │
        ├→ drift ≥ light threshold      ──→ light review before next medium/large demand
        ├→ drift ≥ full threshold       ──→ /archon-review (full) → reset
        └→ drift ≥ emergency threshold  ──→ /archon-review (emergency) → halt + reset + remediation plan
             (thresholds tighten during milestone convergence phases — see drift-mechanism.md)
```

## Where to Go From Here

| Reader | Start With |
|--------|------------|
| AI agent picking up an Archon-governed project for the first time | `{platform}/skills/archon-framework/SKILL.md` → this README → `architecture.md` only if deeper detail is needed |
| Human developer exploring an adopter project | This README → `architecture.md` for design rationale → `docs/archon/decisions.md` for framework trade-offs → `.archon/decisions.md` for project trade-offs |
| Integrator installing Archon into a new project | `setup.md` end-to-end |
| Contributor evolving the framework itself | Authoring source only: `user-journeys.md` + `drift-mechanism.md` + `model-vs-harness.md` + `docs/archon/decisions.md` |
