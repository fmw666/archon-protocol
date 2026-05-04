# Archon Architecture

> Archon is a session-based AI engineering governance framework that runs inside pair-programming IDEs (e.g., Cursor). It is not an AI assistant enhancement plugin — it elevates the AI agent from "tool that follows instructions" to "engineering owner with full project accountability."
>
> **Audience**: contributors and adopters who want the full system design. For a 10-minute tour, read [concepts/overview.md](/concepts/overview) first; for installation steps, read [setup.md](/setup/full-guide); for a walk-through of the real pain points Archon addresses, read [user-journeys.md](/concepts/user-journeys).

## Design Philosophy: Five Identity Axioms

![Comic explainer: Archon identity axioms](/images/architecture/archon-architecture-01-axioms.png)

Every design decision in Archon derives from these five axioms. Any external practice must pass through them before adoption.

| # | Axiom | Meaning | Design Impact |
|---|------|------|---------|
| 1 | **Ownership > Assistance** | Agent is the project owner, not an assistant. Decisions, quality, consequences are yours. | Agent makes engineering decisions autonomously — never asks the user to pick A or B |
| 2 | **Constraints > Documentation** | Type system > linter > editor rules > docs | If a machine can enforce it, don't write prose |
| 3 | **Inference > Configuration** | Derive behavior from project state, not mode flags | No `mode=harden` config switches |
| 4 | **Lean > Bloat** | Fewer, stronger knowledge assets | Must justify "why can't an existing file carry this?" before creating a new one |
| 5 | **Separation > Self-Review** | The executor must not judge its own work | Knowledge capture and full review delegated to independent sub-agents |

## System Architecture Overview

![Comic explainer: Archon system map](/images/architecture/archon-architecture-02-system-map.png)

At a glance, Archon has six ownership lanes: **Soul** defines identity, **Wake/Commands** route work, **DOMAIN LENS** focuses one demand and routes reusable capability needs, **Lifecycle** enforces gates, **RUN-STATE v2** proves commit readiness, and **Knowledge Assets** preserve promoted learning.

Delivery lifecycle summary: `Decision Gate → Self-directed Execute → Validation Gate → Close-Out(9)` `(incl. Blink Dispatch) → Git`.

### Domain Lenses vs Extensions

Domain Lenses sit inside demand reasoning; Extensions sit on lifecycle edges.

| Mechanism | Scope | Use For |
|------|------|------|
| `.archon/domain-lenses/` | One delivery's professional focus or reusable capability routing | PM, QA, development, design, planning, architecture, creative, art, best-practice capability selection, or other domain toolkits |
| `.archon/extensions/` | Project-local lifecycle hooks | pre-scan, close-out, review, dashboard, demand-pool, or workflow automation |

If the capability changes **how Archon thinks about one demand**, add a Domain Lens. If it changes **when Archon runs extra lifecycle behavior**, add an Extension.

### Mechanism Boundaries

Archon avoids architectural muddiness by assigning one ownership lane to each mechanism:

| Mechanism | Primary Question | Boundary |
|------|------|------|
| `soul.md` + `soul/` | What kind of owner is Archon? | Identity and discipline only; project facts live in project-state files such as `manifest.md`, `debt.md`, `memos.md`, and `.archon/decisions.md`. |
| `.archon/domain-lenses/` | Which professional lens or reusable capability route should one demand use? | One lens per delivery; no lifecycle hooks, persona changes, provider-specific manuals, or selector ownership in universal cards. |
| `.archon/extensions/` | When should project-local lifecycle behavior run? | Hooks around pre-scan, close-out, review, or dashboard; no domain reasoning pack. |
| `blink-dispatch` | Is independent sub-agent review worth launching? | Dispatch decision only; the main agent still owns the delivery. |
| Run-State v2 | Is this delivery complete enough to commit? | Ephemeral proof and staged-path ownership; not long-term memory. |
| `drift.md` + `.archon/drift/archive/` | What was delivered, what was learned, and is review pressure high enough? | Hot delivery index, post-delivery review, archive recall, and review pressure; not a planning backlog or process wish list. |
| `governance-contract.yaml` + checkers | What baseline contracts must travel with Archon? | Portable framework checks only; project-specific policy belongs in project-state files or local overlays. |

### Layered Operating Model

![Comic explainer: Archon layered operating model](/images/architecture/archon-architecture-03-layered-model.png)

Archon is easiest to reason about as a cognitive operating system: each layer receives a narrower signal, produces a stronger artifact, and must not steal responsibility from adjacent layers.

| Layer | Vehicle | Owns | Inputs | Outputs | Boundary |
|------|------|------|------|------|------|
| Thinking constitution | `soul.md` + `soul/` | Identity, axioms, autonomy, review discipline, and evolution principles | User intent, loaded mode, project state summaries | Judgment frame and non-negotiable constraints | Must not store project facts, delivery logs, or domain toolkits |
| World model | `manifest.md` + `.archon/manifest/archive/` | Durable project facts, user language aliases, current state, validation command, knowledge asset index, latest-review summary | Completed deliveries, project changes, verified numeric facts, stakeholder phrasing, review conclusions | Hot project context plus cold review detail | Must not become a process log or framework rulebook |
| Memory state | `drift.md`, `memos.md`, `debt.md` (hot summaries) backed by `.archon/{drift,memos}/records/` + `.archon/debt/items/` (per-event source of truth, ADR-22) | Delivery experience, stakeholder conclusions, unresolved responsibility, review pressure | Close-Out, auditor/reviewer findings, stakeholder decisions | Experience records, review triggers, debt gates | Drift is not a backlog; memos are not routine delivery logs; debt hot index must retain gate fields. Hot summaries are auto-regenerated from records — concurrent PRs no longer conflict on these files. |
| Professional organization | `.archon/domain-lenses/` | One demand's professional focus, reusable capability routing, bounded atomic tools, and per-tool load-line cost so the selector can stay within `max_total_load_lines` | Demand text, registry signals, manifest/skill metadata candidates, tool descriptions, lens contracts, declared `load_lines` budget | `domain_lens:`, selected tool IDs, and optional `capability_selection` asset packet (must include `total_load_lines`) | A lens is not a persona, lifecycle hook, exported sub-agent, provider manual, or soul override; tool count and load-line ceilings are AND-conjoined |
| Delivery action | Commands, code, docs, tests, scripts | Concrete changes to the repository | Judgment frame, project facts, selected lens/tools, validation target | Changed files and Close-Out evidence | Execution must not self-approve or bypass validation |
| Reality proof | L0/L1 checks, manifest-declared validation command, portable checkers | Mechanical evidence that the change is safe | Changed files and governance contracts | Green/failing validation results | A prose claim is weaker than a runnable guard |
| Evolution filter | Close-Out review + `evolution_triage` / `evolution_evidence` | Distinguishing noise, statistical signal, and first-principles signal | Delivery record, validation result, auditor/reviewer signal | `stats-pass`, `first-principles-pass`, or `stay-in-drift` with matching evidence | Must not promote one-off preference through the statistical channel |
| Crystallization | L0 type, L1 test, L2 rule, L3 skill/domain tool, L4 ADR, L5 manifest/debt | Converting learned signal into the strongest fitting vehicle | Triage result and self-test matrix | Stronger reusable constraint or durable record | Must not create a parallel runtime, daemon, or new state lane |

The flow is directional but not a waterfall: user intent is narrowed by the thinking constitution, grounded in world model + memory state, focused by professional organization, proven by reality checks, filtered for evolution, and crystallized into stronger context for the next delivery.

Boundary checks:

- If a fact or user phrase mapping must be known at boot, put it in `manifest.md`; if it only explains what happened, keep it in `drift.md`.
- If a capability changes how one demand is reasoned about, use a Domain Lens; if it runs at a lifecycle point, use an Extension.
- If a learning can be checked mechanically, promote it to L0/L1/L2 before writing more prose.
- If a learning has one weak sample, leave it in drift unless it falsifies a core assumption and names the smallest validation experiment.
- If a mechanism needs a daemon, external protocol schema, or extra state lane, it is not Archon-native evolution.

Layer handoff contracts:

| Handoff | Required Output | Fails If |
|------|------|------|
| Thinking constitution → World model | A judgment frame that can be grounded in current project state | `soul.md` tries to remember project facts, or `manifest.md` is skipped |
| World model + Memory state → Professional organization | Current facts plus relevant prior decisions, debt, and drift pressure | The selected lens ignores known project state, debt, or stakeholder memory |
| Professional organization → Delivery action | One `domain_lens:` decision and a bounded set of selected tool IDs or selected capability assets | Multiple lenses are blended, a lens behaves like a persona, tools create lifecycle gates, or a selector packet replaces main-agent ownership |
| Delivery action → Reality proof | Changed files plus the intended validation target | Execution self-approves, skips validation, or treats unverified prose as proof |
| Reality proof → Evolution filter | Green/failing validation result plus delivery evidence | Close-Out records learning without validation evidence or auditor/reviewer context |
| Evolution filter → Crystallization | A matching `evolution_triage` + `evolution_evidence` pair | Weak samples are promoted as statistics, first-principles claims omit the broken assumption, or drift becomes a backlog |
| Crystallization → Next delivery | A stronger reusable vehicle at the lowest sufficient layer | A machine-checkable rule remains only prose, or a one-off note becomes permanent machinery |

## Cognitive Loop

![Comic explainer: Archon wake mechanism and cognitive loop](/images/architecture/archon-architecture-04-wake-loop.png)

The agent's behavioral model is a **loop with backtracking at any stage**, not a waterfall: `Perceive → Model → Act → Verify → Perceive`.

- **Perceive**: Hot-path read the required soul/manifest sections, then load cold reference sections only when the demand touches them
- **Model**: Decompose the problem, form a plan
- **Act**: Execute the plan (write code, change config, update docs)
- **Verify**: Run validation command, confirm results meet the goal
- If verification fails → loop back to Perceive

## Wake Mechanism

One of Archon's design goals is a **zero-cognitive-burden entry point** — the user need not remember any command names; saying "hi archon" activates the engineering persona. This requires two layers working in concert:

### Dual-Channel Entry

Three entry paths are supported: natural wake (`hi archon ...`), explicit routing (`/archon demand: ...`), and direct command (`/archon-demand ...`). The wake route hot-path reads required sections before routing; all paths converge on the same mode command.

### Architectural Decision: Rule Layer + Command Layer

| Layer | File | Mechanism | Responsibility |
|----|------|------|------|
| Trigger | `archon-wake.mdc` | always-applied rule | Detect natural language wake words, guide to routing layer |
| Router | `archon.md` | command | Analyze intent or parse explicit prefix, route to target mode |
| Executor | `archon-{plan,demand,review}.md` | command | Complete workflow for each mode |

**Why not pure Commands?** Commands require the user to type the `/` prefix. If the unified entry point were only a Command, "hi archon" style natural language could never activate it — that's designing from system capabilities (command mechanism) instead of user workflow, an "inside-out" blindspot. The always-applied rule adds ~15 lines to every conversation but only does pattern matching and routing — the actual routing logic lives in the command layer, loaded on demand.

### Drift Precheck

The `/archon` router's Step 0 reads `drift.md §Current Value` and compares against tiered thresholds BEFORE any routing. This is a mechanical gate (L1 test: `governance.test.ts §Drift gate` fails red if drift crosses emergency without a trailing review reset row), not a documentation convention. Three outcomes:

| State | Action |
|-------|--------|
| `drift ≥ emergency` | Demand intake halted · force route to review · output `🔴 DRIFT EMERGENCY` |
| `drift ≥ full` | STOP routing unless input prefix is `review` · output `🟠 DRIFT GATE` |
| `drift ≥ light` | Continue routing silently · insert light review before next medium/large demand · output `🟡 DRIFT NOTICE` |
| `drift &lt; light` | Silent pass-through |

Rationale: documentation-only drift precheck was empirically bypassed (history: drift reached 108% of full threshold while demands kept executing — resolved by ADR-9).

## Delivery Lifecycle

![Comic explainer: Archon delivery lifecycle](/images/architecture/archon-architecture-05-delivery-lifecycle.png)

The complete `/archon-demand` flow is: `Boot → Pre-Scan → Fast-Path? → Decision Gate → Verdict → Self-directed Execute → Validation Gate → 9-Step Close-Out → Version Control`.

The **9-Step Close-Out** is intentionally summarized here; the command file owns the exact checklist. In architecture terms, the important split is simple: the execution interior is flexible, while Verdict, validation, Run-State, Blink Dispatch, drift, memory, and git remain hard boundaries.

### Boundary-Hard, Process-Soft Execution

Archon does not hard-code how the agent must execute a delivery after `Verdict=proceed`. The fixed lifecycle nodes are **engineering boundaries**, not a recipe for the agent's inner loop.

Inside execution, the agent owns the plan: choose tools, order steps, add temporary helpers, revise approach after evidence, and use the selected Domain Lens/tools as guidance rather than a scripted procedure. This is the Browser Harness lesson translated into Archon terms: give the model a broad action space and strong feedback surfaces, then constrain only the boundaries that protect project integrity.

The hard boundaries remain non-negotiable: Verdict before writes, selected project facts and memory before judgment, manifest-declared validation before delivery, Run-State/commit proof before version control, independent review when risk or drift requires it, and durable knowledge capture only when the evolution filter justifies promotion.

### Fast-Path (collapsed ceremony)

Qualified trivial deliveries (≤2 files · no new pattern/module/dep · no governance file · no infra/auth/schema change · no user-facing behavior change) collapse the structured gates and skip the judgment-heavy close-out steps (auditor, memos, extensions). Drift is fixed at +1 and tracked; fast-path share > 60% in a cycle flags evasion risk. See soul/delivery.md §Delivery Fast-Path.

### Structured Gate Outputs (Verdict / Close-Out)

The Verdict (decision gate exit) and the Close-Out statement (closeout-phase compliance checklist) produce machine-checkable output that the capture-auditor verifies as a lifecycle-compliance dimension. Missing or malformed gate output is a blocking finding, not a soft warning. These outputs were previously labeled `GATE-1` / `GATE-2`; historical log entries retain the old labels.

### Run-State Gate

Run-State v2 stores active delivery state in `.archon/runs/&lt;run_id&gt;/state.json`, with `events.ndjson` as an append-only trace. This replaces the singleton-state bottleneck of legacy `.archon/run.md`: multiple deliveries can have distinct run directories, while commit-time resolution fails closed if more than one run is commit-ready unless `ARCHON_RUN_ID` is explicit. The resolver also checks staged path ownership: staged files must be listed in the selected run's `changedPaths`, otherwise the commit is blocked. Legacy `.archon/run.md` remains only as a migration fallback for adopter projects that have not shipped the helper yet.

### Delivery State Dataflow

Each delivery moves through several state vehicles. They are deliberately separate so no file carries both in-flight proof and long-term memory:

| Phase | State Vehicle | Purpose | Lifetime |
|------|------|------|------|
| Boot → Close-Out | `.archon/runs/&lt;run_id&gt;/state.json` | Tracks SOP completion, changed paths, and commit permission | Ephemeral; removed after commit |
| Close-Out step ⑤ | `.archon/drift.md` + `.archon/drift/archive/*.md` | Records delivery summary, post-delivery review, complexity score, and review pressure | Hot index under line budget; older complete rows move to keyword-indexed cold archives |
| Manifest sync | `.archon/manifest.md` + `.archon/manifest/archive/*.md` | Records durable project facts, latest validation, current milestone, indexed knowledge assets, and archived latest-review detail | Hot project context; long review/history detail moves to cold archive |
| Promotion threshold met | `debt.md` + `.archon/debt/archive/*.md` / `rules` / `tests` / `skills` / `.archon/decisions.md` / `docs/archon/decisions.md` | Carries repeated failures, enforceable constraints, reusable practices, or architectural rationale | Project ADRs stay in `.archon/decisions.md`; reusable framework ADRs stay in `docs/archon/decisions.md` |

Rule of thumb: Run-State proves the delivery can commit; drift hot index records recent events, current pressure, and archive pointers; drift archives preserve older rows for on-demand recall; manifest records durable project state; debt hot index keeps active gate fields visible while debt archives preserve rationale; rules/tests/skills/ADRs receive only promoted findings.

**Plan-mode binding** (ADR-11, since 2026-04-19): the Verdict MUST be output before any write-side tool invocation. Cursor's native Plan mode (read-only + write tools denied by the platform) is the platform-enforced realization of this rule — the "decide before acting" discipline is promoted from L3 prose convention to L2 platform capability. When a session already started in Agent mode, the rule degrades to L3 self-discipline and Close-Out records `Plan mode not used: &lt;reason&gt;` for long-tail auditing.

### Convergence Gate (Milestone-Scoped Demand Filter)

When the current milestone is under forced convergence, `manifest §Current State` declares a `Convergence scope: [&lt;DEBT-IDs&gt;]` list that enumerates the debt items the next non-exempt delivery MUST advance. The Verdict step classifies each incoming demand as in-scope or out-of-scope; out-of-scope demands receive `Verdict=reject` with rationale `"out of convergence scope"` — unless one of four exits applies:

- **Emergency-review remediation** (tail fixes within an emergency-reset loop)
- **L0/L1 gate regression fix** (a broken type/lint/test gate blocks everything, so fixing it is always in-scope)
- **Tooling unblocking the declared scope** (e.g., a codegen script that the scope debt depends on)
- **User override** — the demand text contains an explicit override phrase ("override convergence" / "framework priority" / similar); the phrase is quoted verbatim in the Verdict rationale and an override record (≥ +1 drift) is created via `node scripts/archon-records.mjs new drift --type delivery --delta +N --summary "..."` (per ADR-22; the hot summary auto-regenerates and the override record IS the audit trail)

The gate is L2-enforced by `governance.test.ts §Convergence gate` — if the manifest declares a `Convergence scope`, the `archon-demand` command file must carry the `**Convergence gate**` clause and the `out of convergence scope` rejection phrase, otherwise validation fails. This promotes milestone-level forced convergence from L3 manifest prose to a mechanical filter. Recorded in ADR-12.

**Scope lifecycle**: populated when a milestone enters its convergence phase, cleared when the milestone closes. `scope=[]` = "open period" — gate is inert.

### Drift Mechanical Floors

Self-assessed complexity in close-out step ⑤ is bounded below by file-count floors: ≥3 files = small (+2); ≥6 files = medium (+3); ≥10 files OR new module/pattern/dep = large (+5). Applied as `max(self, floor)`. When the floor raises by ≥2, an adjustment note is logged. See drift.md §Rules.

### Decision Gate

Three questions must be answered before acting:

| Question | Judgment Criteria |
|------|---------|
| **Should it be done** | Real problem or hypothetical? Is there a no-code solution? |
| **How big** | Blast radius (files affected) + reversibility (rollback cost) |
| **Who decides** | Engineering decisions are yours; product direction goes to the user |

When the assessment is "don't do it" — **reject the demand with rationale and alternative**. This is the agent's responsibility.

![Comic explainer: Source Modularity Probe — foresight-style axis check at the Decision Gate](/images/architecture/archon-architecture-14-modularity-probe.png)

The Decision Gate accepts three mechanical probes as **input** before the Verdict; each probe is a deterministic match against a manifest-declared map plus the changed-paths candidate set, surfaced one line above the Verdict block:

| Probe | ADR | What It Surfaces | Map Source | Output Token |
|-------|-----|------------------|------------|--------------|
| Radius | ADR-23 | How many files / modules a delivery touches; which boundaries it crosses | `manifest §Module Boundary Map` | `radius_probe: files=N\|modules=N\|crosses=[...]` |
| Soul-headroom | ADR-23 extension | When changed-paths intersect soul, surface cap-pressure (`&lt;current&gt;/&lt;cap&gt; = &lt;pct&gt;%`); ≥95% forces compress-first or explicit-cap-widening ADR | soul cap declared in `manifest §Context Budget` | `soul_headroom: &lt;current&gt;/&lt;cap&gt; = &lt;pct&gt;% (&lt;remaining&gt; lines)` |
| **Modularity** | **ADR-29** | When changed-paths create a new file or match a declared modularity glob, surface whether the change folds a second concept-axis into a file already responsible for one (`fan-out-needed` → prior split commit OR map-update Verdict) | `manifest §Source Modularity Map` | `modularity_probe: target=&lt;path&gt;\|axes=&lt;axis-cell,...&gt;\|status=aligned\|fan-out-needed\|undeclared` |

All three probes share one contract: **machinery checks the boundary, the owner decides**. Probes never block a Verdict — they make the structural fact visible at the decision point so an override carries explicit rationale rather than silent omission. Modularity in particular is foresight pressure: it asks "if I add this content, does it fold a second axis into a file already responsible for one?" before the file accumulates concept-axis debt, rather than after a stakeholder asks "isn't this getting hard to manage?".

### Validation Gate

After delivery, the manifest-declared validation command (typically lint + typecheck + test) must be run. **Red means fix to green — "pass now, fix later" does not exist.**

### Sub-Agent Delegation in Close-Out

Step ② is Blink Dispatch: the main agent performs deterministic thin-slice triage before any close-out sub-agent is launched. High-risk slices dispatch to an independent sub-agent; low-risk slices record `subagent_dispatch: skip:&lt;reason&gt;`. This preserves Archon's separation principle without paying sub-agent latency for mechanical low-risk deliveries. See [Sub-Agent Delegation Model](#sub-agent-delegation-model).

## Constraint Pyramid

![Comic explainer: Archon constraint pyramid](/images/architecture/archon-architecture-06-constraint-pyramid.png)

Archon's quality assurance does not rely on documentation — documentation is the weakest constraint. Every rule worth following gets pushed to the **strongest possible level**:

| Layer | Vehicle | Enforcement Strength |
|------|------|------|
| L0 | Type system | Won't compile = doesn't exist |
| L1 | Linter / tests | Violation = won't commit |
| L2 | Editor rules | Prompted during editing |
| L3 | Skill documents | Loaded on demand |
| L4 | ADRs | Historical traceability |
| L5 | Manifest | Context synchronization |

**Golden rule**: If a machine can enforce it, don't write prose. Documentation carries only "why" and design intent that machines cannot express.

### Constraint Maturity & Lint-Rule Bridge

Every constraint has an upgrade path: `Discovered → SHOULD (docs) → MUST (lint/test)`. A constraint staying at documentation level when it could be mechanically verified = a reliability gap.

The **Lint-Rule Bridge** closes L2's passivity gap: lint error messages contain `→ Read &lt;rule-file-path&gt;`, forcing the AI to load the full spec on violation. L1 actively triggers L2. See soul.md §Guardrail System for the complete specification.

## Knowledge Evolution System

![Comic explainer: Archon knowledge evolution and forecast](/images/architecture/archon-architecture-07-evolution-forecast.png)

Archon is not a static framework — it **accumulates and strengthens** its knowledge with every delivery.

### Delivery Evolution Loop

Archon translates external self-evolution ideas into its own constraint pyramid. It does not copy external protocol formats or run a daemon; it promotes delivery experience into stronger local vehicles:

Delivery experience moves through `Delivery Event → Evolution Signal → Promotion Decision → Stronger Vehicle`.

| Stage | Archon Vehicle | Rule |
|------|------|------|
| Delivery Event | `drift.md` entry | Every completed demand leaves an auditable delivery record |
| Evolution Signal | post-delivery review + auditor/reviewer findings + validation failures | One-off observations stay in drift |
| Promotion Decision | Close-Out judgment | Promote only repeated, enforceable, reusable, or architectural findings |
| Stronger Vehicle | test / rule / skill / domain tool / ADR / debt / manifest | Use the strongest fitting layer; do not create a parallel evolution system |

**Translate, do not copy**: Archon may borrow the concepts of compact lessons, auditable events, signal de-duplication, and promotion thresholds. It must not copy external GEP/Gene/Capsule/Event schemas, install a self-evolution daemon, depend on a Hub/worker network, or turn `drift.md` into a backlog.

### Preservation Axis (Dual to Crystallization)

![Comic explainer: Archon preservation axis — evolution dual motion (crystallize + preserve)](/images/architecture/archon-architecture-12-preservation-axis.png)

Per ADR-28, evolution is a **two-motion** discipline. Crystallization captures what should change (new knowledge → stronger vehicle). Preservation captures what should be kept (load-bearing knowledge → pinned anchor) so a later edit cannot silently drain it. Treating only the first motion as "evolution" produces a framework that drifts toward whatever was last broken — losing the rules that explain why nothing else broke.

| Motion | Question | Vehicle | Where it runs |
|--------|----------|---------|---------------|
| Crystallization | "What did this delivery teach that should change Archon?" | New / updated test, rule, skill, domain tool, ADR, debt, manifest entry | Trigger table + Close-Out post-delivery review (a)(b)(c) + capture-auditor §Knowledge Capture |
| Preservation | "What did this delivery rely on that must not silently drain?" | Pin in critical-rule registry + body-shape test + portable contract entry | Soul §Preservation Axis + soul/review.md §Preservation Signals + Close-Out post-delivery review (d) + capture-auditor §Preservation Scan + plan §Proactive Scrutiny preservation probe |

A preservation pin is a tripwire, not a wall: the pinned item is still removable, but removal must be an explicit, auditable edit (delete the pin, the test, and the contract entry together) rather than a silent body-drain. Saying "this rule is important" in prose is not preservation — that is exactly the failure mode preservation guards against.

#### Preservation hardening — mechanical guards (DEBT-074..077 closure)

Four mechanical guards keep Preservation from degrading into ceremony, registered as L1 lint after the introducing delivery's Full review surfaced the gaps:

| Guard | What it catches | Implementation |
|---|---|---|
| Substance gate for `none-this-cycle(&lt;evidence&gt;)` | Frictionless escape valve — empty or hand-wave evidence on the Close-Out checklist | `archon-claim-verifier.mjs --mode=preservation` requires evidence ≥40 chars + verb-of-scanning + scan-target |
| First-pass degeneracy guard | Introducing delivery self-classifying its own additions as `pin-worthy-now` (cycle has not started) | Same `--mode=preservation` requires explicit "first pass / introducing delivery / pinned-bootstrap" framing when pinned anchors appear in the same diff |
| Header-anchor body-shape declaration | Anchor pinned at header level while body is silently drainable (DEBT-077 rule-of-3 3/3 stagnation) | Every header-shape entry in the critical-rule registry MUST declare `body_shape: 'has-body-shape-test' \| 'header-only' \| 'token-only'`; absent declaration fails L1 |
| Capture-auditor protocol step alignment | Inserting a new step without renumbering (e.g., two step "4"s) | L1 test asserts numbered protocol steps == declared jobs + 2 setup steps, contiguous numbering 1..N |

These guards do not prevent preservation from staying simple — they prevent the simple form from quietly degrading. The cumulative-frequency surface (multiple `none-this-cycle` Close-Outs across cycles) becomes a Full review signal once the substance gate is in place; without the gate, all evidence looks identical and the signal collapses.

### Evolution Self-Test Matrix

Before promoting a delivery observation into a stronger vehicle, Archon self-tests the promotion:

| Self-Test Question | Required Evidence | Promotion Fails If |
|------|------|------|
| Is the signal real? | Source named in drift: post-delivery review, auditor/reviewer finding, validation failure, or repeated pattern | The observation is only a preference, hunch, or one-off inconvenience |
| Is the target the strongest fitting vehicle? | Chosen vehicle matches the constraint pyramid: test/rule for enforceable constraints, skill/domain tool for reusable practice, ADR for architecture, debt for unresolved risk, manifest for durable project fact | A machine-enforceable rule remains prose, or a one-off note becomes a permanent asset |
| Is the Archon-native boundary intact? | No external schema, daemon, Hub/worker dependency, or new state vehicle is introduced | The change copies an external protocol or turns `drift.md` into a backlog |
| Is regression guarded? | L1 test/rule exists, or drift explicitly records why a guard is not applicable yet | A promoted claim has no mechanical guard and no stated reason |

### Evolution Signal Triage Matrix

Archon filters delivery experience through two gates: statistics suppress routine noise; first principles preserve rare structural signals.

| Triage Result | Promotion Rule | Required Evidence | Default Vehicle |
|------|------|------|------|
| `stats-pass` | Promote when the signal is repeated, reproducible, costly, cross-context, and mechanically enforceable | At least 2-3 related drift/auditor/validation samples; no one-sample exception | test / rule / skill / debt |
| `first-principles-pass` | Promote a one-off signal only when it falsifies a core assumption or exposes a constraint-pyramid gap | The broken assumption, the principle it touches, and the smallest validation experiment are named | ADR / test / skill |
| `stay-in-drift` | Keep observations that are preferences, hunches, local inconvenience, or weakly evidenced process noise | Drift entry records why the signal is not yet strong enough | drift only |

Close-Out promotion decisions must record one of these labels as `evolution_triage=&lt;stats-pass|first-principles-pass|stay-in-drift&gt;`. A promoted finding without one of these labels is considered untriaged.

Triage labels are not enough by themselves. Close-Out must also record one compact evidence shape:

| Triage Result | Evidence Shape |
|------|------|
| `stats-pass` | `evolution_evidence=stats(samples=&lt;n&gt;, source=&lt;drift|auditor|validation&gt;, action=&lt;test|rule|skill|debt&gt;)` |
| `first-principles-pass` | `evolution_evidence=first-principles(assumption=&lt;broken assumption&gt;, experiment=&lt;smallest validation&gt;)` |
| `stay-in-drift` | `evolution_evidence=drift(reason=&lt;why not promoted yet&gt;)` |

The triage label and evidence kind must match: `stats-pass` pairs only with `stats(...)`, `first-principles-pass` pairs only with `first-principles(...)`, and `stay-in-drift` pairs only with `drift(...)`.

### Architecture Forecast Loop

Archon also forecasts the next likely architecture pressure after each non-fast-path delivery. The forecast is compact and written in the delivery record, not a separate planning system:

The forecast names three things: the most likely next risk, the next useful optimization if that risk materializes, and confidence (`low|medium|high`). It is not a backlog, roadmap, or permission to bypass the next Decision Gate. A future demand still starts from fresh project state and must pass Verdict before any work begins.

### Dynamic Acceptance Criteria

Acceptance criteria are not static paperwork. When a delivery introduces a new technology, architecture layer, module, pattern, or optimization that changes validation needs, Archon treats that as an acceptance-contract delta. The same delivery must either update the manifest's milestone criteria, extend the validation command, add or update a test/rule/skill guard, or explicitly record `Acceptance criteria delta: no-change`.

This keeps the contract dynamic without making it informal: the acceptance standard can evolve, but the evolution must land in `manifest.md`, tests, rules, skills, or validation rather than prose-only intent.

### Trigger → Capture → Crystallize

Trigger signals include hit-a-wall pivots, repeated patterns, external feedback, new technology, business insight, discovered concepts, and conventions. Each signal is assessed against the constraint pyramid and promoted only when a stronger vehicle is justified.

### Reasoning Capsules & Anti-Rationalization

On a hit-a-wall pivot, the successful debug path (`Symptom → Root Cause → Fix`) is embedded in the relevant skill document — not a standalone file. Anti-rationalization tables (Red Flags) embedded in each skill provide immediate correction when the agent rationalizes cutting corners. See soul/delivery.md §Reasoning Capsules for details.

## Sub-Agent Delegation Model

![Comic explainer: Archon sub-agent delegation](/images/architecture/archon-architecture-08-subagent-delegation.png)

One of Archon's core architectural principles: **Execution and judgment must be separated.**

The main agent remains the project owner. **Blink Dispatch** decides whether close-out needs `capture-auditor`; drift/manual review launches `archon-reviewer`; broad capability/toolset requests may launch a read-only selector subagent to return a compact asset-selection packet before the main agent loads full skills or tool cards. Sub-agents advise, audit, or summarize selection; they do not take ownership of the delivery.

### Delegation Threshold & Cost Awareness

See soul/delivery.md §Lifecycle Hooks for the complete delegation criteria and cost awareness principle. Key rule: mechanical checks stay as self-audit; judgmental assessments (knowledge value, bias correction) warrant delegation.

Capability selection is a context-budget delegation, not a lifecycle gate or exported agent file. Use a generic read-only subagent only after `Verdict=proceed` when Level 1 domain-tool metadata plus manifest/platform skill metadata point to multiple plausible candidate assets, or when reading full candidate assets would crowd the main agent's working context. The selector's output is advisory; the main agent still performs the Verdict, loads the chosen assets, executes the delivery, validates the result, and closes out.

## State Management

![Comic explainer: Archon state and memory model](/images/architecture/archon-architecture-09-state-memory.png)

Archon manages project state through three living files, auto-updated after each delivery.

![Comic explainer: One file per event, never collide — records-folder](/images/architecture/archon-architecture-11-records-folder.png)

**Per ADR-22 records-folder**, the three event-stream state files (`drift.md` / `memos.md` / `debt.md`) are **hot summaries** auto-generated from per-event records under:

| Hot summary | Records source of truth | Sentinel sections | Helper command |
|---|---|---|---|
| `.archon/drift.md` | `.archon/drift/records/&lt;ISO8601&gt;-&lt;slug&gt;.md` | `current-value`, `log` | `node scripts/archon-records.mjs new drift --type delivery --delta +N --summary "..."` then `regen drift` |
| `.archon/memos.md` | `.archon/memos/records/&lt;ISO8601&gt;-&lt;slug&gt;.md` | `hot-memos` | `... new memos --topic "..." --conclusion "..." --source "..."` then `regen memos` |
| `.archon/debt.md` | `.archon/debt/items/DEBT-NNN-&lt;slug&gt;.md` | `active-debt` | `... new debt --id DEBT-NNN --severity ... --status pending --deadline ... --source "..." --summary "..."` then `regen debt` |

Hot rows between sentinels are **never hand-edited**: a new record file is created, then `npm run archon:records:regen &lt;kind&gt;` rewrites the hot summary deterministically. `npm run validate` fails red if a hot summary disagrees with its records folder.

This solves the **concurrent-PR conflict** that single-file append-only governance state hits as soon as multiple cloud agents work in parallel: different branches write different filenames (no textual conflict); after merge the regenerator computes a unique hot summary (no integer-counter ambiguity, no `Threshold: X→Y` non-commutative narrative).

The single-file representation below remains the **conceptual model** of state; the records-folder is its physical implementation:

### manifest.md — Project Hot Context

| Section | Content |
|------|------|
| Product | Product definition, core flow, business model |
| Concept Glossary | Product-specific terminology (term + project meaning + ≠ common meaning) |
| User Language Index | Stakeholder phrases, aliases, and nicknames mapped to canonical project artifacts. Row format: `User Phrase(s)` ` · `-separated · `Canonical Target` = artifact class + identifier · `Lookup` = route · file · anchor pointers. Disambiguation rule: when phrases resolve to different targets, create separate rows rather than merging. `/archon-demand` Pre-Scan consults this section on every demand (see §Stakeholder Memory) |
| Tech Stack | Frameworks, versions, dependencies |
| Validation Command | Concrete lint + typecheck + test command |
| Git Strategy | Commit mode (auto/prompt/off) + branch model |
| Directory Structure | Complete file tree |
| Knowledge Asset Index | Index of all rules/skills/ADR |
| Milestones & Acceptance | Hard acceptance criteria — all checked = complete |
| Current State | Active milestone + known issues + compact latest review pointer |
| Stakeholder Memos | Pointer to `.archon/memos.md` hot index |

Long latest-review detail belongs in `.archon/manifest/archive/&lt;year&gt;-Q&lt;N&gt;.md`; keep the hot manifest line concise and retain the latest validation target in `Current State`. Keep the User Language Index compact: it is a lookup table for repeated stakeholder wording, not a conversation transcript.

**Role**: Section-scoped current-state source read on the hot path only when the route needs project context. The **only archon file** allowed to contain project specifics.

### drift.md — Cognitive Drift Counter

Tracks the rate at which the agent's cognitive model diverges from project reality. Each delivery scores +1 to +5 based on cognitive complexity, bounded below by mechanical floors (see §Drift Mechanical Floors above). **Three-tier triggering** replaces the original binary gate:

| Tier | Threshold | Scope |
|------|-----------|-------|
| Light | drift ≥ 6 | Mechanical health audit only (no reviewer sub-agent) · releases 2-4 points · in-session |
| Full | drift ≥ 12 | Original complete flow · reviewer sub-agent · resets to 0-3 |
| Emergency | drift ≥ 20 | Demand intake halted · full + blindspot root-cause + forced remediation plan |

**Dynamic thresholds**: shift by project phase (build-intensive = higher tolerance; quality convergence = tighter) inferred from manifest Current State without config flags.

See [mechanisms/drift-mechanism.md](/concepts/drift-mechanism) for the complete design rationale.

### debt.md — Technical Debt Registry

`Deferral = register + deadline. Unregistered = nonexistent = unmanaged.` Each item has ID, source, severity, deadline, and status. Before milestone closure, all `milestone-close` deadline items must be `resolved`.

`debt.md` is a hot gate index, not a prose archive. It keeps `ID`, `Severity`, `Deadline`, and `Status` visible for milestone/review gates; full source, trigger details, and disposition rationale live in `.archon/debt/archive/&lt;year&gt;-Q&lt;N&gt;.md`.

## Stakeholder Memory

Problem solved: session-based frameworks' inherent flaw — **every boot starts from a blank slate**. A project owner should remember what was discussed with the stakeholder. The same question asked twice = the first conclusion was lost = a failure of ownership.

### Memory Architecture

Example: if a stakeholder asks about a large architecture migration and Archon rejects it with rationale, close-out stores the conclusion as a memo. A later session pre-scans memos, recalls the prior decision, and avoids making the user repeat the same context.

### Three-Layer Implementation

| Layer | Location | Responsibility |
|----|------|------|
| **Principle** | soul.md §Ownership | "The user should never repeat themselves — repetition = lost context = failure" |
| **Entry** | archon-demand §Pre-Scan | After receiving demand, search memos, decision records, and the manifest User Language Index for stakeholder aliases; hit → silently resolve (optionally bridge `"We call this X in our project."`) and proactively cite history; near-miss → record `uli_candidate: &lt;phrase&gt; → &lt;target&gt;` for Close-Out promotion |
| **Exit** | archon-demand §Close-Out step 7 | Write conclusions with decision value to memos (rejection/deferral/direction confirmed/priority change) |
| **Storage** | .archon/memos.md + memos-archive/ | Hot index: compact pointers; archive: full rationale with `Archived On` |

### Memory Classification

Different memory types have different persistence vehicles. Stakeholder memos are a lightweight hot index backed by cold archives; heavyweight decisions are promoted to stronger vehicles:

| Type | Vehicle | Lifecycle | Loaded at Boot? | Example |
|------|------|---------|-----------------|------|
| Delivery record | drift.md | Compressed by cycle | Yes | "Quality gate passed; release pressure reduced" |
| Project architecture decision (positive) | `.archon/decisions.md` (ADR) | Permanent | On demand | "Use managed database platform for first milestone" |
| Project architecture decision (negative) | `.archon/decisions.md` (Negative ADR) | Permanent (with re-evaluation conditions) | On demand | "Reject full framework migration until evidence changes" |
| Framework architecture decision | `docs/archon/decisions.md` | Permanent | On demand | ADR-20 Archon-native Evolution Loop |
| Stakeholder conclusion (hot) | memos.md | ≤5 compact pointers | Section-scoped | "Migration rejected", "localization deferred" |
| Stakeholder conclusion (cold) | memos-archive/`&lt;year&gt;-Q&lt;N&gt;.md` | Quarterly partition · archived forever | No — keyword-matched, on-demand | Older auth-boundary decisions |

### Trimming, Cold Archive & Promotion

Memo hot cap: **5 compact entries**. Full rationale **migrates to `memos-archive/&lt;year&gt;-Q&lt;N&gt;.md`** (NOT deleted). Each archive file carries a keyword index at the top; demand pre-scan scans the keyword index (NOT full body) and loads the archive file in full only on keyword hit.

Before migration, check:

- Conclusion has durable long-term value across projects? → **Promote** to a stronger vehicle (ADR / skill / manifest section), then archive
- Conclusion is stale or superseded? → Archive with a `superseded by &lt;target&gt;` note

### Memory Layer Consolidation (Reverse Crystallization)

Crystallization moves **new** knowledge into assets (trigger table). Consolidation moves **accumulated** knowledge into stronger vehicles; runs during full review as Phase 4 and the reviewer sub-agent's §Framework Completeness step.

| Source Signal | Consolidation Target |
|---------------|---------------------|
| Resolved debt with generalizable fix path | New or updated skill |
| Drift log pattern recurring ≥3 times in cycle | ADR or editor rule |
| Stable memos referenced by ≥3 deliveries | Manifest section or ADR |
| Archive memos recalled ≥2 times in quarter | Promote back to hot memos or to manifest |

### Design Boundaries

- **Is**: Conclusion-level memory — what was discussed, when, what was decided, why
- **Is not**: Conversation-level memory — does not store conversation flow (that's the agent transcript's job, retrievable on demand)
- **Is not**: Full history — routine delivery records are carried by drift; memos record only conclusions with decision value
- **Enforcement**: Process-level (demand step), not mechanical (cannot lint-detect omissions). Consistent with L3-L5 constraint pyramid levels — relies on the executor reading and following

## Anti-Bloat Mechanisms

![Comic explainer: Archon extensibility and hygiene](/images/architecture/archon-architecture-10-extensibility-hygiene.png)

Archon's governance files can bloat too. Four lines of defense:

| Defense | Mechanism | Timing |
|------|------|------|
| **Pre-emptive** | Justify creation: must answer "can an existing file carry this?" before creating | On creation |
| **Pre-emptive** | Governance ratio bounds: governance files / source files within **[0.1, 0.5]** · asserted in governance.test.ts | Ongoing (ratio lower bound catches tribal knowledge) |
| **Pre-emptive** | Context budget table: per-file hard line caps declared in manifest.md §Context Budget · asserted in governance.test.ts | Ongoing |
| **Retroactive** | Bloated → split; redundant → merge; stale → delete | During review |
| **Automated** | Drift log compression: move old complete rows to archive when hot file exceeds 70 lines | During review |
| **Automated** | Memos cold archive: full rationale migrated to `memos-archive/&lt;year&gt;-Q&lt;N&gt;.md` rather than deleted | On hot cap breach |

### Claim Verification — "said vs truth" family (ADR-27)

![Comic explainer: Archon claim verifier — mechanical fact-checker at the commit gate](/images/architecture/archon-architecture-13-claim-verifier.png)

Governance prose can quietly drift from the repo: a test count cited from memory, a borrowed concept without lineage, a soul edit that cites itself, a trigger that fires silently. Per ADR-27, a single verifier `scripts/archon-claim-verifier.mjs` carries four modes under one unified `[claim-verifier:&lt;mode&gt;] &lt;FAIL|WARN&gt;: &lt;file&gt; — &lt;msg&gt;` report format:

| Mode | Catches |
|------|---------|
| `numeric` | Numeric claims in governance docs or skill prose that disagree with the repo (e.g., test count, file count, bundle size) |
| `borrowed` | Borrowed-concept statements in ADRs or drift rows missing the lineage line (which external sample, which commit) |
| `self-cite` | Edits to `soul.md` / `soul/*.md` that cite themselves as authority without an independent source |
| `missed-trig` | Close-Out claims a trigger fired without the corresponding evidence in drift or records |
| `preservation` | `none-this-cycle(&lt;evidence&gt;)` on the Close-Out Preservation row without a substantive scanning verb + scan target (≥40 chars), and first-pass-degeneracy bootstraps that pin same-delivery anchors without explicit "first pass / introducing delivery" framing |

The verifier is wired into `npm run validate` (errors fail closed, warnings surface) and the pre-commit hook. The portable `archon-check.py` remains the adopter-side contract checker; the verifier is the per-delivery scan at authoring time — the two do not duplicate each other.

## Self-Reflection Mechanisms

Archon governs not just code, but itself. See soul/review.md §Reflection & Proactive Scrutiny for the full mechanism: recursive principle application, four mandatory proactive questions, known blindspot patterns table.

## Modular Soul Loading

The cognitive core is split into **one section-scoped core + two mode-specific extensions** to keep the perpetual context tax low while preserving full specification depth per mode.

| File | Content Scope | Loaded By | Budget |
|------|---------------|-----------|--------|
| `soul.md` | Ownership · Core Axioms · Guardrail System · Knowledge Hygiene · Evolution (incl. Preservation Axis per ADR-28) · Persona · Sub-Agent Independence (universal principles) | Boot and mode hot paths by required section | 310 lines |
| `soul/delivery.md` | Reasoning Capsules · Lifecycle Hooks · When to Escalate · Delivery Fast-Path · Debt Tracking · Product Quality | `/archon-demand` only | 150 lines |
| `soul/review.md` | Reflection & Proactive Scrutiny · Review Tiering · Memory Layer Consolidation | `/archon-plan` and `/archon-review` | 150 lines |

**Why split**: `soul.md` carries universal judgment, but the hot path should read only the sections needed for the current route. Chapters only used by one mode (delivery lifecycle · review reflection) become per-mode extensions. Measured impact from the original split: boot path cut ~40% · demand path ~12% · plan/review path ~23%; section-scoped hot reads reduce the steady-state tax further without weakening the specification.

**Anchor integrity**: `governance.test.ts § Soul anchor consistency` scans every `soul[/delivery|review].md §X` reference in commands, agents, and extensions, asserting each anchor resolves to a real heading. Refactoring the core or extensions automatically fails this check until cross-references are updated.

See ADR-10 in the decisions log for the full rationale.

## Decoupling Model

Archon's universal files can be copied directly into any new project:

| Portable File | Role | Contains Project Specifics? |
|---------|------|-----------|
| soul.md | Cognitive core (section-scoped hot path) | ❌ |
| soul/delivery.md | Delivery-mode extension (loaded by demand) | ❌ |
| soul/review.md | Review-mode extension (loaded by plan + review) | ❌ |
| archon.md (command) | Unified entry + intent routing | ❌ |
| archon-wake.mdc (rule) | Wake trigger | ❌ |
| archon-demand/plan/review.md | Workflows | ❌ |
| archon-reviewer/capture-auditor.md | Sub-agents | ❌ |
| archon.mdc | Decoupling rules | ❌ |
| drift.md rules section | Drift mechanism | ❌ |
| **manifest.md** | **Project context** | **✅ The only one** |
| drift.md log section | Delivery records | ✅ |
| debt.md registry | Tech debt | ✅ |

**Rule**: Universal files must not contain concrete technology names, file paths, shell commands, package names, or metric numbers. See the archon decoupling rules in the platform rules directory.

## Extension Points

Archon's core lifecycle exposes **fixed extension points** — project-specific capabilities hook into these points without modifying core files. This is the plug-in mechanism: install by creating a directory, uninstall by deleting it.

### Architecture

The universal core exposes fixed sockets; project-specific extensions plug into those sockets without changing core files. Extension names stay outside the universal core.

### Lifecycle Points

Commands scan `.archon/extensions/` at these fixed points. Each extension declares which points it subscribes to:

| Point ID | Command | When | Available Context |
|----------|---------|------|-------------------|
| `demand.pre-scan` | archon-demand | After loading memos, before decision gate | Demand text, memos, manifest |
| `demand.close-out` | archon-demand | After stakeholder memos, before git | Delivery summary, verdict, changed files |
| `plan.perception` | archon-plan | During state perception phase | Manifest, debt, drift |
| `plan.output` | archon-plan | After priority ranking, before final output | Ranked work items |
| `review.health` | archon-review | During knowledge health audit | All project files |

**Presence = active. Absence = not installed.** Max 3 active extensions, ≤15 lines per hook. See soul.md §Extension Points for the complete specification: discovery protocol, file format, budget rules, and design rationale.

## Other Extension Patterns

### Adding a Workflow Mode

Create `archon-&lt;mode&gt;.md` in the commands directory:
- Open by declaring the required soul/manifest hot-path sections
- Define mode responsibilities
- Close with manifest + drift updates

New modes are automatically covered by the wake layer — `archon.md` routing logic and `archon-wake.mdc` trigger can extend their intent mapping tables to recognize new modes.

### Adding a Sub-Agent

Create an agent file in the agents directory. Follow:
- Pass delegation threshold + cost awareness evaluation
- Sub-agent advises; main agent executes
- Output is structured and auditable via drift log

### Adding Knowledge Assets

- Rules (platform rules directory): Conventions enforced during editing
- Skills (platform skills directory): Domain knowledge indexed on demand
- Follow the constraint pyramid: push to the strongest possible level

### Adding Tools

Create a tool subdirectory in the archon directory. Tools are read-only observability extensions or utility scripts — they do not alter the core Archon workflow.

Current tools:

- **Dashboard** (`.archon/dashboard/`): Schema-first governance state dashboard. `schema.js` defines file structure and drives parsing + validation; `server.js` renders workflow-driven visualization pages. Session heartbeats are injected via the heartbeat rule — dashboard directory exists = activated, removed = deactivated. Structural validation integrated into `governance.test.ts`; file format drift = red test.

## Feature Overview

| Category | Feature | Summary |
|------|------|------|
| **Identity** | Ownership model | Agent = Owner, not Assistant |
| **Identity** | 5 Identity Axioms | Ownership · Constraints · Inference · Lean · Separation |
| **Cognitive** | Cognitive loop | Perceive → Model → Act → Verify (backtrack at any stage) |
| **Entry** | Wake mechanism | Rule trigger layer + Command routing layer + Executor layer (three-tier separation) |
| **Entry** | Dual channel | "hi archon" (natural language) / `/archon` (explicit command) / `/archon-*` (direct) |
| **Entry** | Intent routing | Auto-dispatch plan/demand/review + drift pre-check |
| **Governance** | Delivery lifecycle | 9 close-out steps + extension hooks + version control + threshold events |
| **Governance** | Fast-path | Qualified trivial deliveries collapse ceremony; abuse detected via share>60% check |
| **Governance** | Decision gate | Should it be done / how big / who decides (structured as **Verdict** output, previously `GATE-1`) |
| **Governance** | Plan-mode binding | Verdict precedes any write-side tool; Cursor Plan mode is the platform realization (ADR-11) |
| **Governance** | Convergence gate | Milestone-scoped demand filter — out-of-scope demands rejected unless exempted or user-overridden (ADR-12) |
| **Governance** | Validation gate | lint + typecheck + test — red means fix to green |
| **Governance** | Close-out gate | **Close-Out** structured checklist (previously `GATE-2`) — auditor verifies compliance |
| **Governance** | Drift counter | Quantify cognitive debt + mechanical floors + dynamic thresholds (convergence phase tightens emergency to 14) |
| **Governance** | Tiered review | Light (≥6) / Full (≥12) / Emergency (≥20; convergence phase ≥14) — releases pressure continuously |
| **Governance** | Debt registry | Structured debt tracking + milestone gate |
| **Quality** | Constraint pyramid | L0-L5 six-level constraints — push to strongest |
| **Quality** | Constraint maturity | SHOULD → MUST upgrade path |
| **Quality** | Lint-Rule bridge | L1 actively triggers L2 |
| **Quality** | Anti-rationalization table | Red Flags embedded in skills for immediate correction |
| **Quality** | Systematic debugging | Four-phase root cause analysis + reasoning capsules |
| **Evolution** | Knowledge capture | Trigger table + crystallization path |
| **Evolution** | Preservation axis | Pin load-bearing rules so edits-elsewhere cannot drain them (ADR-28) |
| **Evolution** | Reasoning capsules | Symptom → root cause → fix, embedded in skills |
| **Evolution** | Recursive application | Soul principles constrain Archon itself |
| **Evolution** | Proactive scrutiny | Five mandatory questions in plan/review |
| **Evolution** | Known blindspot patterns | Pattern recognition + bound countermeasures |
| **Memory** | Pre-scan | Search memos and decisions before acting; hit → proactively cite |
| **Memory** | Concept Glossary + User Language Index | Product-specific vocabulary and stakeholder aliases included in current-state hot paths; prevents semantic drift on domain terms and artifact lookup |
| **Memory** | Stakeholder memos (hot) | ≤5 compact pointers to stakeholder conclusions |
| **Memory** | Cold archive | Trimmed memos migrated to `memos-archive/&lt;year&gt;-Q&lt;N&gt;.md` · keyword-matched on-demand recall |
| **Memory** | Negative ADR | Rejected architecture proposals persisted (with mechanical re-evaluation triggers) |
| **Memory** | Trimming & promotion | Oldest entries archived or promoted to stronger vehicles |
| **Memory** | Layer consolidation | Reviewer Phase 4: promote accumulated knowledge (resolved debt → skill; recurring drift → ADR/rule; stable memos → manifest) |
| **Delegation** | Execution-judgment separation | Sub-agent advises, main agent executes |
| **Delegation** | Cost awareness | Mechanical checks self-audit; judgmental checks delegated |
| **Delegation** | Model-family separation | Sub-agents declare `model_family: different-from-main` · manifest assigns per role |
| **Decoupling** | Universal core | soul/commands/agents portable to any project |
| **Decoupling** | Project-state binding | Project specifics belong in project-state files such as manifest, drift logs, debt, memos, and project ADRs |
| **Extensibility** | Extension Points | 5 lifecycle hooks in core; project-specific extensions plug in without modifying commands |
| **Extensibility** | Pluggable install | mkdir = install, rmdir = uninstall, Status: disabled = pause |
| **Extensibility** | Budget constraints | Max 3 active extensions, ≤15 lines per hook, not exported with core |
| **Extensibility** | Extension lifecycle | Promotion (≥2 projects OR 15-line hook budget hit → core via ADR) · Deprecation (3 idle cycles → removal logged in drift) |
| **Hygiene** | Anti-bloat defenses | Creation justification + budgets + automated gates |
| **Observability** | Dashboard | Schema-first parsing + workflow-driven layout + SSE live updates |
| **Observability** | Heartbeat protocol | Rule-injected session state; dashboard presence = activated |
| **Observability** | Structural guards | Governance file schema validation integrated into governance.test.ts |

## Related Documents

| Document | Content |
|------|------|
| [README.md](/concepts/introduction) | Quick start navigation |
| [setup.md](/setup/full-guide) | Full setup steps for new projects |
| [mechanisms/drift-mechanism.md](/concepts/drift-mechanism) | Deep dive into drift mechanism design |
| [decisions.md](/concepts/decisions) | Archon framework ADRs (portable mechanism rationale) |
| [user-journeys.md](/concepts/user-journeys) | 15 real-world pitfalls of AI-assisted coding → Archon mechanism mapping |
| [concepts/model-vs-harness.md](/concepts/model-vs-harness) | The "Model vs. Harness" debate: why stronger models still need engineering environments |
| [concepts/superpowers-comparison.md](/concepts/superpowers-comparison) | Comparative analysis with Superpowers |
