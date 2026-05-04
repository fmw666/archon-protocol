# Archon Setup Guide

> Complete steps to integrate the Archon framework into a new project. Archon's reusable mechanisms are project-agnostic and platform-agnostic; each adopter still fills project-state files under `.archon/`.

![Comic explainer: Archon setup install route](/images/setup/01-install-route.png)

Setup has one route: export or copy the framework, fill project state, install mechanical guards, then run the first plan to prove the agent can load the right context.

## Prerequisites

![Comic explainer: three preconditions before install — IDE, git repo, task runner](/images/setup/05-prereqs.png)

- An AI coding platform that loads markdown-based rules, skills, and commands (Cursor, Claude Code, or equivalent)
- Git repository (Archon relies on git hooks and version history)
- A task runner / package manager capable of registering a single validation command (npm, pip, cargo, make, etc.)

> **Reference implementation note**: the test harness in §3b and the pre-commit script in §3c below use Node.js + Vitest + Husky for concreteness. Every mechanism is portable — equivalent ports to pytest / cargo test / go test are welcome.

## Directory Convention

![Comic explainer: Archon core and platform directories](/images/setup/02-two-homes.png)

Archon uses a two-tier directory structure:

| Category | Directory | Note |
|------|------|------|
| **Core + project state files** | `.archon/` | soul and portable helpers plus project state (manifest, drift, debt, memos, decisions), optional extensions & dashboard — same path across platforms |
| **Platform files** | `.cursor/` or `.claude/` etc. | commands, agents, rules, skills — auto-loaded by platform |

| Platform | Platform Directory | Rule Format |
|------|---------|---------|
| Cursor | `.cursor/` | `.mdc` (YAML frontmatter + Markdown) |
| Claude Code | `.claude/` | `.md` (Markdown) |

Below, `{platform}/` denotes the platform directory (e.g., `.cursor/` or `.claude/`). `.archon/` is the same path on all platforms.

## Cross-Reference Convention

![Comic explainer: `&lt;file&gt; §&lt;heading&gt;` is an anchor mechanically validated by the soul-anchor test](/images/setup/06-cross-ref.png)

Archon files reference each other via the `&lt;file&gt; §&lt;heading&gt;` syntax:

```
soul.md §Autonomy Principles
soul/delivery.md §Reasoning Capsules
manifest.md §Context Budget
archon-demand §Decision Gate
```

The `§` character binds to a literal H2–H6 heading in the target file. Every such reference is mechanically validated by the Soul Anchor Consistency test (see §3b Block 4). Renaming a referenced heading fails the validation command until every citer is updated.

## Optional: Export a Standalone Reuse Package (Zero Impact on Current Project)

If you're inside the Archon authoring source repo and want to generate a standalone reuse package for other projects:

```bash
# Cursor target (default)
npm run archon:export -- ./archon-standalone --overwrite

# Claude Code target
npm run archon:export -- ./archon-standalone --platform=claude-code --overwrite
```

The export directory will contain:
- Project-agnostic core: `soul` + `domain-lenses` (including authoring templates) + `commands` + `agents` + decoupling rules + core skills (`archon-framework`, `archon-git-commit`, `blink-dispatch`, `external-agent-patterns`)
- Project templates: `manifest.md` + `drift.md` + `debt.md` + `memos.md` + `.archon/decisions.md`
- Portable governance and run-state helpers: `.archon/contracts/governance-contract.yaml` + `scripts/archon-check.py` + `scripts/archon-check.sh` + `scripts/archon-run-state.mjs` + `scripts/archon-records.mjs` (ADR-22 records-folder regenerator for drift / memos / debt hot summaries)
- Bundled documentation: `docs/archon/README.md` + `architecture.md` + `setup.md` (this file) + `decisions.md` + run-state schema/templates
- Commit hook scaffold: `.husky/pre-commit`
- Platform entry point (Claude Code generates `CLAUDE.md`)

Then copy the export directory contents to the target project root and continue with the setup steps below.

### Export Source-of-Truth Matrix

When changing what Archon exports, update the source that owns that question first:

| Question | Source of Truth | Checked By |
|------|------|------|
| Which source files are copied into the standalone kit? | `scripts/export-archon-core.mjs` | Export smoke test + export-manifest contract |
| Which portable baseline files must every adopter receive? | `.archon/contracts/governance-contract.yaml` `export_manifest.required_files` | `scripts/archon-check.py` + export-manifest contract |
| What does a human installer expect to see? | `docs/archon/setup.md` export summary + Step 1 tree | export-manifest contract |
| What does the agent read first to understand the framework? | `{platform}/skills/archon-framework/SKILL.md` | primer export/routing contract |

Do not add a shipped artifact only to prose. Add it to the export script first, add it to the governance contract when it is part of the portable baseline, then update the adopter-facing docs and tests.

## Step 1: Copy Framework Files

The following files are **project-agnostic** — copy directly from the export package or an existing Archon project:

```
.archon/                              ← Archon core + project state (same path across platforms)
├── soul.md                           ← Cognitive core (hot-path sections: identity, axioms, guardrails, evolution)
├── soul/
│   ├── delivery.md                   ← Delivery-mode extension (loaded by /archon-demand)
│   └── review.md                     ← Review-mode extension (loaded by /archon-plan, /archon-review)
├── domain-lenses/                    ← Domain Lens pre-Verdict index + proceed-only lens/tool contracts
│   ├── registry.yaml                 ← Single index for lens/tool membership, discovery metadata, and budgets
│   ├── lenses/                       ← Lens contracts (installed: dev + platform + ecosystem + capability + design)
│   ├── tools/                        ← Atomic tool cards scoped to one lens
│   └── templates/                    ← Lens/tool authoring skeletons for new domains
│       ├── lens.md                   ← Lens contract template
│       └── tool.md                   ← Atomic tool card template
└── (manifest.md · drift.md · debt.md · memos.md · decisions.md created in Step 2)
{platform}/                           ← Platform-specific files
├── commands/
│   ├── archon.md                     ← Unified entry (wake + intent routing)
│   ├── archon-plan.md                ← Planning mode
│   ├── archon-demand.md              ← Delivery mode (Decision Gate → self-directed execution → Validation Gate → Close-Out)
│   ├── archon-review.md              ← Full review mode
│   └── archon-dashboard.md           ← Governance dashboard launcher (optional; dashboard itself activated in Step 4)
├── agents/
│   ├── archon-reviewer.md            ← Full review sub-agent
│   └── archon-capture-auditor.md     ← Post-delivery audit sub-agent
├── rules/
│   ├── archon.mdc (.md)              ← Decoupling rules (what may / may not go in each file)
│   └── archon-wake.mdc (.md)         ← Wake trigger — "hi archon" natural-language activation; also routes the agent to the primer skill on first use
└── skills/
    ├── archon-framework/SKILL.md     ← Agent primer — framework self-introduction loaded on demand
    ├── archon-git-commit/SKILL.md    ← Commit-gate skill — reads Run-State v2 or legacy .archon/run.md before any commit
    ├── blink-dispatch/SKILL.md       ← Thin-slice subagent dispatch gate — decides skip vs use:<subagent>
    └── external-agent-patterns/SKILL.md ← External-framework evaluation skill — checks role assumptions before borrowing patterns
.archon/contracts/governance-contract.yaml  ← Portable governance contract shared by reference checkers and authoring tests
scripts/archon-check.py               ← Dependency-free Python reference checker for non-TS adopters
scripts/archon-check.sh               ← POSIX shell wrapper around the Python checker
scripts/archon-run-state.mjs           ← Dependency-free Run-State v2 helper (init/set/check/commit resolution)
scripts/archon-records.mjs             ← Dependency-free records-folder regenerator (ADR-22; new/regen/check for drift|memos|debt)
```

Per-delivery ephemeral state:

```
.archon/runs/<run_id>/state.json       ← Run-State v2 per-delivery state (activated after Verdict, removed after successful commit)
.archon/runs/<run_id>/events.ndjson    ← Append-only event trace for debugging/resume
.archon/run.md                         ← Legacy single-file fallback during migration
.archon/templates/run-state.schema.json ← Schema reference for Run-State v2
.archon/templates/run.template.md  ← Legacy schema reference for .archon/run.md
```

> **Claude Code extra**: Place `CLAUDE.md` at the project root containing Archon boot instructions and command index (auto-generated by the export script).

### What each rule does

- **`archon-wake.mdc`** is an always-applied rule (~20 lines). It detects the natural-language wake phrase (`hi archon …`), hot-path reads the required `soul.md` identity/routing sections and `manifest.md` current-state sections, then routes the trailing text into the `archon` command. Without this rule, users would need to type `/archon-*` commands explicitly every time.
- **`archon.mdc`** is the decoupling rule. It separates project-state files (`manifest.md`, drift logs, debt, memos, project ADRs) from universal framework files. Editor rules surface violations during editing; review sub-agents audit them afterward.
- **`archon-framework/SKILL.md`** is the agent-facing primer. Loaded on demand when the agent: (a) first encounters an Archon-governed project, (b) is about to modify any archon file, (c) is about to extend Archon with a new rule/skill/extension/ADR, or (d) is asked "what is Archon / how does this work?".
- **`archon-git-commit/SKILL.md`** is the commit-gate skill. Loaded when the user asks for a commit during an active Archon delivery. It resolves Run-State v2 first (`.archon/runs/&lt;run_id&gt;/state.json`), falls back to legacy `.archon/run.md`, asserts the permit flag and every SOP variable is complete, then generates a Conventional Commits message and invokes git. Delegates to a plain `git-commit` skill when no active run-state exists.
- **`blink-dispatch/SKILL.md`** is the close-out subagent dispatch gate. It thin-slices the diff and emits `subagent_dispatch: skip:&lt;reason&gt; | use:&lt;subagent&gt;:&lt;reason&gt;` before any subagent is launched.
- **`.archon/domain-lenses/`** provides the optional Domain Lens protocol used by `/archon-demand` when installed: classify one lens from registry metadata, read the selected lens router, load a bounded atomic tool set, and decompose multi-domain demands instead of mixing identities. The description index lives at `.archon/domain-lenses/registry.yaml`.

### Domain Lenses vs Extensions

Use this rule when adapting Archon:

| Need | Mechanism |
|------|-----------|
| Professional focus, reusable capability routing, or domain toolkit (PM, QA, development, design, planning, architecture, creative, art) | `.archon/domain-lenses/` |
| Lifecycle hook (pre-scan, close-out, review, dashboard, demand-pool, project-local workflow) | `.archon/extensions/` |

If the capability changes **how Archon thinks about one demand**, add a Domain Lens. If it changes **when Archon runs extra lifecycle behavior**, add an Extension.

When adding a Domain Lens, follow `.archon/domain-lenses/README.md §Adding a Domain`: registry entry and `tool_index` metadata first, then lens contract, then atomic tools. A normal new domain should pass the existing Domain Lens contract tests without adding custom test logic.

## Step 2: Create Project State Files

![Comic explainer: Archon project state files](/images/setup/03-project-state.png)

The following five files are **project-specific**. Initialize them by copying the authoring source's templates:

| File | Path | Template |
|------|------|----------|
| Project hot context | `.archon/manifest.md` | `docs/archon/templates/manifest.template.md` |
| Drift counter | `.archon/drift.md` | `docs/archon/templates/drift.template.md` |
| Debt registry | `.archon/debt.md` | `docs/archon/templates/debt.template.md` |
| Stakeholder memos | `.archon/memos.md` | `docs/archon/templates/memos.template.md` |
| Project ADRs | `.archon/decisions.md` | `docs/archon/templates/decisions.template.md` |

> **Single source of truth**: templates live only in `docs/archon/templates/`. The export script reads those files directly, so the package you received already contains initialized copies at the target paths. Do not hand-copy skeletons from any other document — `templates/*.template.md` are canonical.

Open each file, replace the `&lt;!-- ... --&gt;` placeholders with your project's values, and commit. `manifest.md` is the adopter's hot project map; these sections matter most:

- **§Platform** — map logical names (Rules Directory, Skills Directory, etc.) to actual paths for your AI platform
- **§Product** — one paragraph: what the product is, core flow, business model
- **§Tech Stack** — frameworks and versions you've chosen
- **§Validation Command** — the single `npm run validate` / `make validate` / `cargo test` / etc. entry point that runs lint + typecheck + test
- **§Context Budget** — per-file line caps (recommended starting values are in the template)
- **§Milestones & Acceptance Criteria** — M0 acceptance items + quality gates
- **§Current State** — current milestone marker

`manifest.md` keeps current state, user-language aliases, and latest validation hot; move long latest-review detail to `.archon/manifest/archive/&lt;year&gt;-Q&lt;N&gt;.md` when needed. Per ADR-22 records-folder, `memos.md` is auto-generated from `.archon/memos/records/` (most-recent 5 by date) — do not hand-edit; create a stakeholder-conclusion record file via `node scripts/archon-records.mjs new memos --topic "..." --conclusion "..." --source ".archon/memos-archive/&lt;year&gt;-Q&lt;N&gt;.md ? keyword: ..."` and put full rationale in the matching `memos-archive/&lt;year&gt;-Q&lt;N&gt;.md`.
`drift.md` starts at 0 with the log table header ready.
`debt.md` starts as a hot gate index with no active rows; put full rationale in `debt/archive/&lt;year&gt;-Q&lt;N&gt;.md` when registering detailed debts.

Operational contracts to preserve:

- The `manifest.md` `Latest review` hot row keeps `Latest validation target:`, the validation command, bundle evidence when available, and an archive pointer. Do not duplicate volatile `N files / M tests` counts there; keep detailed review history in `.archon/manifest/archive/&lt;year&gt;-Q&lt;N&gt;.md`.
- Drift archives are cold delivery logs. Their `Rows archived:` header must match the number of archived delivery rows in the table; the reference `drift-gates` test guards this.
- Non-fast-path close-out rows include an Architecture Forecast (`risk|next|confidence`). Treat it as a prediction for the next pre-scan, not as a backlog item or permission to skip the next Verdict.

## Step 3: Structural Guards

![Comic explainer: Archon setup mechanical guards](/images/setup/04-mechanical-guards.png)

Archon's governance effectiveness depends on mechanical enforcement. The following three guard layers are ordered by enforcement strength (strongest first).

### 3a. Validation Command

![Comic explainer: one validate command — lint + typecheck + tests flow into a single gate](/images/setup/07-validate-command.png)

Register a **single entry point** validation command in your task runner, covering lint + typecheck + test. This is the sole channel for all quality checks.

Example (Node.js / package.json):

```json
{
  "scripts": {
    "validate": "eslint . && tsc --noEmit && vitest run"
  }
}
```

Declare this command in `manifest.md §Validation Command`.

### 3b. Governance Tests (Budget · Ratio · Drift Gate · Anchors · Rule Preservation · Convergence · Export)

All hot-path governance files MUST carry mechanical enforcement at the validation gate. Ten independent contract blocks cover the failure modes that documentation alone cannot prevent: bloat · tribal knowledge / bloat balance · drift accumulation · broken cross-references · silent prose drain · manifest↔command desync · export-package self-inconsistency · commit-gate bypass · said-vs-truth claim drift · preservation-axis degradation.

The portable baseline lives in `.archon/contracts/governance-contract.yaml`. The file is JSON-compatible YAML, so dependency-free runners can parse it with standard-library JSON support. TypeScript projects can keep a native test implementation, but the authoring source asserts its TS registry matches this contract; non-TS adopters can run:

```bash
python scripts/archon-check.py --root .
# or, on POSIX shells:
sh scripts/archon-check.sh .
```

#### Block 1: File Budget (Prevents Bloat)

Governance files bloat with each delivery. When they exceed their cap, they erode the AI's context budget. Declare caps in the manifest's §Context Budget table; assert them as tests.

```typescript
const FILE_BUDGET: Record<string, { limit: number; hint: string }> = {
  '.archon/soul.md':               { limit: 300, hint: 'Core soul — move mode-specific material to soul/<mode>.md' },
  '.archon/soul/delivery.md':      { limit: 150, hint: 'Delivery extension — move shared material back to core' },
  '.archon/soul/review.md':        { limit: 150, hint: 'Review extension — move shared material back to core' },
  '.archon/manifest.md':           { limit: 350, hint: 'Move long latest-review detail to .archon/manifest/archive/<year>-Q<N>.md' },
  '.archon/drift.md':              { limit:  70, hint: 'Move older complete rows to .archon/drift/archive/<year>-Q<N>.md' },
  '.archon/debt.md':               { limit:  40, hint: 'Keep hot gate index compact; move full rationale to .archon/debt/archive/<year>-Q<N>.md' },
  '.archon/memos.md':              { limit:  30, hint: 'Keep hot index compact; move full rationale to memos-archive/<year>-Q<N>.md' },
  '<decisions log>':               { limit: 300, hint: 'Archive superseded ADRs before any further cap raise' },
}
// For each file: read → count lines → expect ≤ limit with hint in error message
```

#### Block 2: Governance Ratio (Prevents Both Bloat AND Tribal Knowledge)

Governance file count / source file count must stay within `[0.1, 0.5]`. Below 0.1 = tribal knowledge risk (implicit rules not written down); above 0.5 = governance bloat. Walk the governance directories and source directory, compute the ratio, assert both bounds.

#### Block 3: Drift Gate (Prevents Emergency-Level Drift Going Unreviewed)

Parse drift.md's current value and emergency threshold. If `current ≥ emergency`, the tail row MUST be a `**Review reset**` entry — otherwise the project is in a broken state (demands executed past the emergency ceiling without a review). The same guard should assert the progressive-loading contract: hot drift keeps an Archive Index and latest rows under budget, while `.archon/drift/archive/*.md` carries keyword-indexed cold logs. Without this test, documentation-only drift precheck was empirically bypassed (history: drift reached 108% of full threshold while demands kept executing).

#### Block 4: Soul Anchor Consistency (Prevents Broken Cross-References)

When `soul.md` is split into core + mode extensions (`soul/delivery.md`, `soul/review.md`), commands and agents reference specific headings via the `soul[/delivery|review].md §X` syntax declared in §Cross-Reference Convention. A refactor that renames a heading or moves content between files must update every reference — otherwise the agent follows a pointer to an anchor that no longer exists.

Scan every cross-reference source (commands, agents, soul extensions); for each `soul[/delivery|review].md §X` match, assert the target file exists and contains a heading matching `§X`. Also assert the extensions themselves exist and are loaded by the correct commands.

#### Block 5: Critical Rule Preservation (Prevents Silent Prose Drain)

Section-anchor checks (Block 4) guarantee the heading exists, but not that the substantive rule body below it remains intact. A future edit can silently drain a paragraph while the anchor survives — and no gate catches it. For any rule whose mechanical strength depends on the prose wording itself (not just the section's existence), register a substring assertion.

Maintain a registry of `{ file, substring, rationale }` triples; for each entry, read the file and assert `content.includes(substring)`.

**Adopter projects start with an empty registry.** The registry grows organically as your project's L3-originated prose rules get promoted to L2 — each promotion adds one row. When a rule eventually becomes a full mechanical check (e.g., a parser instead of a substring match), remove its registry entry.

**Reference examples** (from the Archon authoring source — illustrative, not prescriptive):

- Plan-mode binding paragraph in `archon-demand §Decision Gate` — keywords: `**Plan-mode binding**`, `BEFORE any write-side tool invocation`
- Convergence gate clause in `archon-demand §Decision Gate` — keywords: `**Convergence gate**`, `out of convergence scope`
- Two-hats extended clause in `soul §Quality Discipline` — keyword: `rename + a rule promotion on the same concept still counts as two hats`
- Glossary scope rule in `soul §Knowledge Hygiene` — keyword: `Glossary scope`
- Vocabulary-coherence question in `soul/review §Proactive Scrutiny` — keyword: `**Vocabulary coherence**`

These come from specific deliveries in the Archon source repo's history. Do not copy them verbatim into a fresh adopter project — they will fail red because your soul files do not contain those phrases yet.

#### Block 6: Convergence Gate Contract (Prevents Manifest↔Command Desync)

**Activation is conditional**: this test is a no-op in the "open period" (no forced convergence active). It fires only when the project opts into milestone-level forced convergence.

If the manifest's `§Current State` declares a `Convergence scope: [&lt;DEBT-IDs&gt;]` field (forced-convergence active), the `archon-demand` command file MUST contain the `**Convergence gate**` clause and the `out of convergence scope` rejection phrase — otherwise the Verdict step has nothing to enforce the scope against. When `Convergence scope` is absent, the assertion returns early and imposes no constraint.

Keep this block in the test file even while inactive — it costs nothing and activates automatically the moment the manifest declares a scope.

#### Block 7: Export Manifest Contract (Prevents Distribution Self-Inconsistency)

When the project is the Archon **authoring source** (ships the `scripts/export-archon-core.mjs` equivalent), the export manifest must match this setup guide and the README's file tree. If setup.md or README describes a file that isn't exported, adopter projects receive silent gaps; if the export ships a file that no document mentions, adopter agents find stray files and don't know how to use them.

The test inspects the export script's file lists (core files + platform files + template files + doc files + skill files) and asserts bidirectional coverage with both this setup guide's Step 1 file tree and the README's Quick Overview.

Adopter projects that don't maintain their own export script can safely skip Block 7.

#### Block 8: Run-State Contract (Prevents Commit-Gate Bypass)

Run-State v2 (`.archon/runs/&lt;run_id&gt;/state.json`) is the machine-readable counterpart of the Verdict + Close-Out chat statements. It exists only while a delivery is in flight — activated after Verdict, updated per phase, removed by `archon-git-commit` after a successful commit. Legacy `.archon/run.md` remains as a migration fallback for adopter projects not yet shipping the helper. Four always-on contract checks ensure the plumbing stays honest even between deliveries:

1. `.archon/templates/run-state.schema.json` and legacy `run.template.md` exist and are shipped in the export.
2. `{platform}/skills/archon-git-commit/SKILL.md` exists and is registered in the export's platform files.
3. The pre-commit hook calls `scripts/archon-run-state.mjs resolve-for-commit` and retains the legacy `permit_commit` fallback.
4. `archon-demand.md` contains the "Run-State Lazy Activation" clause and documents both v2 `permitCommit` and legacy `permit_commit: 1`.

A fifth check activates only when legacy `.archon/run.md` is present: YAML front matter declares `demand` · `mode` · `started_at` · `plan_mode` · `convergence`; a `permit_commit: 0|1` line is present; status tokens use only `1` / `0` / `2` / `skip:&lt;reason&gt;`; line count ≤ 50. V2 active states are checked by `scripts/archon-run-state.mjs check`.

This block prevents five specific failure modes: forgetting to ship the schema/helper (adopters can't learn or operate the format), deleting the skill (commit gate loses its reader), breaking the hook (commit gate loses its enforcer), letting archon-demand.md silently drain its run-state instructions (agents stop initializing state), and reintroducing the single-file concurrency bottleneck as the default path.

#### Block 9: Claim Verifier (Prevents Said-vs-Truth Governance Drift)

Governance prose can quietly diverge from the repo: a test count cited from memory, a borrowed concept without lineage, a soul edit that cites itself as authority, a trigger claimed to have fired without evidence, or a Preservation checklist row padded with hand-wave evidence. Each failure mode had been tracked as its own debt (DEBT-058 numeric · DEBT-066 borrowed · DEBT-070 self-cite · DEBT-071 missed-trig · DEBT-074 preservation substance). Per ADR-27, one verifier unifies the family:

```bash
npm run archon:verify        # runs all modes
# or individually:
node scripts/archon-claim-verifier.mjs --mode=numeric
node scripts/archon-claim-verifier.mjs --mode=borrowed
node scripts/archon-claim-verifier.mjs --mode=self-cite
node scripts/archon-claim-verifier.mjs --mode=missed-trig
node scripts/archon-claim-verifier.mjs --mode=preservation
```

All modes share a single report prefix — `[claim-verifier:&lt;mode&gt;] &lt;FAIL|WARN&gt;: &lt;file&gt; — &lt;msg&gt;` — so a single `grep` surfaces every claim drift regardless of mode. The verifier is wired into `npm run validate` (errors fail closed, warnings surface) and `.husky/pre-commit`. The portable `archon-check.py` remains the adopter-side contract checker; the verifier is the per-delivery scan against `git diff` or `.archon/*/records/` recent entries. Future family members enter as new modes rather than new scripts — when the script exceeds ~300 lines, modes are refactored into separate files behind an index, not split into parallel CLIs.

**Preservation mode** deserves a specific note (per ADR-28 hardening): it gates two distinct degenerate shapes of the Close-Out Preservation row. The `none-this-cycle(&lt;evidence&gt;)` escape valve requires evidence ≥40 characters AND a verb-of-scanning (e.g., `scanned`, `reviewed`, `checked`) AND a named scan target; hand-wave strings fail closed. The first-pass-degeneracy guard catches an introducing delivery that pins its own newly added anchors as `pinned(...)` — such a pin must be framed as `first pass`, `introducing delivery`, or `pinned-bootstrap`, otherwise the verifier rejects the self-promotion until at least one subsequent cycle lands.

#### Block 10: Preservation Axis Imperatives (Evolution's Second Motion)

Beyond the claim-verifier substance gate in Block 9, the Preservation motion introduced by ADR-28 carries three non-verifier contract points:

1. **Close-Out checklist row** — `archon-demand.md §Close-Out` contains a `Preservation pass:` row that accepts only `pinned(&lt;anchor&gt;+&lt;test&gt;+&lt;contract&gt;)` or `none-this-cycle(&lt;evidence&gt;)`. Absence of the row fails anchor-consistency (Block 4).
2. **Capture-auditor §Preservation Scan** — the auditor protocol must list 5 jobs and 7 steps (5 jobs + 2 setup), with contiguous numbering 1..N. An L1 step-count test catches "insert new step + forget to renumber" (e.g., two step "4"s).
3. **Header-anchor body-shape declaration** — every header-shape entry in the critical-rule registry MUST declare `body_shape: 'has-body-shape-test' | 'header-only' | 'token-only'`. Absent declaration fails L1 lint; `has-body-shape-test` entries must be paired with an actual body-shape assertion (same as Block 5, but with type-level enforcement added per ADR-28 hardening pass).

These three guards together make Preservation a mechanical triple (registry anchor + body-shape test + portable contract entry), not a prose reminder. See ADR-28 in the decisions log for rationale.

**Delivery log + post-delivery review**: every completed demand writes a drift log entry, then asks **both**: (a)(b)(c) whether the delivered work or the delivery process itself should improve (crystallization), AND (d) whether this delivery relied on a load-bearing anchor that should be pinned (preservation, per ADR-28). Keep this review lightweight: record one-off observations in the drift entry, and promote only repeated failures, auditor/reviewer findings, unstable manual steps, or mechanically enforceable constraints to debt/rule/test/skill/ADR. Each review labels the signal with `evolution_triage=stats-pass|first-principles-pass|stay-in-drift`: statistics filter routine noise only after 2-3 related samples, while first principles allow rare one-off signals only when they falsify a core assumption and name the smallest validation experiment. The label also carries matching compact evidence via `evolution_evidence=stats(...)`, `evolution_evidence=first-principles(...)`, or `evolution_evidence=drift(...)`. The preservation answer is recorded as `preservation: pinned(&lt;anchor&gt;+&lt;test&gt;+&lt;contract&gt;) | none-this-cycle(&lt;evidence&gt;)`. This keeps Archon learning **and** keeping after each delivery without turning Close-Out into a growing checklist.

**Reference implementation**: see `.archon/contracts/governance-contract.yaml` plus `scripts/archon-check.py` for a dependency-free baseline. The Archon authoring repo's `governance.test.ts` remains the TypeScript reference implementation and asserts its portable registry matches the YAML contract.

**Note on subdirectory test runners**: if your test framework runs in a subdirectory (e.g., `web/`), the test file's `ROOT` constant must resolve to the project root so it can read `.archon/*` at the real paths. A common pattern: `const ROOT = resolve(process.cwd(), '..')`.

### 3c. Pre-commit Hook

![Comic explainer: pre-commit as two independent gates in series — validation gate + lifecycle gate](/images/setup/08-pre-commit-gates.png)

The git pre-commit hook does two things:
1. **Run the validation command** (code quality + governance budget, all covered by tests)
2. **Lifecycle gate** (check git staged state — this can only be done in a hook)

Reference implementation (Husky):

Install:
```bash
npm install -D husky
npx husky init
```

`.husky/pre-commit`:
```bash
# Replace <source-dir> with your source directory and <validate-command> with the validation command from manifest.md
cd <source-dir>
<validate-command>

cd ..

# ── Archon Lifecycle Gate ──
# Source changes must be accompanied by drift log updates,
# ensuring the delivery close-out process is not skipped.
if git diff --cached --name-only | grep -q '^<source-dir>/'; then
  if ! git diff --cached --name-only | grep -q '^.archon/drift\.md$'; then
    echo ""
    echo "⛔ Archon lifecycle gate: source changed but drift.md not staged."
    echo ""
    echo "   Complete delivery closing steps before committing:"
    echo "   1. Sync manifest   2. Run Blink Dispatch/subagent steps   3. Update drift log"
    echo ""
    exit 1
  fi
fi

# ── Archon Run-State Gate (ADR-14 / v2) ──
# Active v2 delivery must resolve to exactly one permitCommit=true run.
node scripts/archon-run-state.mjs resolve-for-commit

# Legacy fallback: run.md present must have permit_commit: 1 — otherwise the
# Verdict · execute · validate · close-out SOP has pending steps.
if [ -f .archon/run.md ]; then
  if ! grep -qE '^permit_commit:[[:space:]]*1[[:space:]]*$' .archon/run.md; then
    echo ""
    echo "⛔ Archon run-state gate: active delivery has pending SOP steps."
    echo ""
    echo "   Pending (first 5 rows with status=0):"
    grep -E '\|[[:space:]]*0[[:space:]]*\|' .archon/run.md | head -5 | sed 's/^/     /'
    echo ""
    echo "   Complete the remaining steps per archon-demand.md § Close-Out,"
    echo "   or 'rm .archon/run.md' to abandon this delivery."
    echo ""
    exit 1
  fi
fi
```

**Separation of concerns**: Testable constraints go in tests (governance budget, code standards); git-state-dependent checks go in hooks (staged file checks). Keep hooks thin.

### 3d. Run-State Files (ADR-14 / v2)

![Comic explainer: Run-State is ephemeral — appears after Verdict, removed after commit, gitignored](/images/setup/09-run-state-lifecycle.png)

Run-State v2 stores one delivery per directory: `.archon/runs/&lt;run_id&gt;/state.json` plus optional `events.ndjson`. It is **ephemeral** — activated after Verdict, updated as each SOP phase completes, and removed by the `archon-git-commit` skill after a successful commit. Between deliveries there are no active run directories.

**Must be gitignored.** Add `.archon/runs/` and legacy `.archon/run.md` to your repo's `.gitignore` before adopting the commit gate. These files carry in-flight state that must never enter history: committing them would cause ping-pong diffs and leak per-session context into the log.

**Concurrency model**: v2 removes the singleton bottleneck. Each delivery has a distinct `run_id`, and commit-time resolution fails closed if multiple commit-ready runs exist unless `ARCHON_RUN_ID` is explicit. The resolver also rejects staged files that are not listed in the selected run's `changedPaths`, preventing a second session's files from being swept into the wrong commit. Git worktrees remain the recommended way to do truly concurrent editing because overlapping edits to the same file are still a source-control problem, not a run-state problem. Legacy `.archon/run.md` keeps the old demand-mismatch fallback only for migration.

**Schema** (see `.archon/templates/run-state.schema.json`):

```json
{
  "schemaVersion": 2,
  "runId": "20260425-abc123",
  "demand": "...",
  "status": { "validate.validation_green": "1" },
  "changedPaths": ["..."],
  "permitCommit": true
}
```

Status values remain unchanged: `1` (completed), `0` (pending/in-progress), `2` (**user-intent smart-skip**, ADR-15 — only on permission-list rows, requires drift rationale), `skip:&lt;reason&gt;` (mode-driven bypass). `permitCommit: true` is the final gate and is set only after every required status is complete.

**`2` vs `skip:*` — audit strength differs.** `skip:*` carries its reason in the token itself (structural / mode-driven) and passes a static check. `2` means a human chose to bypass; the reason lives externally in drift.md as `smart-skip: &lt;phase&gt;.&lt;variable&gt; — &lt;reason&gt;`, which governance.test.ts Block 8 cross-references. Use `2` ONLY when the user explicitly asked (imperative, affirmative reply to agent proposal, or demand-level `[trivial] / [quick patch] / [docs-only]` hint). An agent's own judgment that a step is unneeded is a mode-class skip (`skip:no-change` / `skip:no-decision-value` / `skip:no-extensions`) — don't smuggle it into `2`. The permission list (six rows: `prescan.archive_scanned`, all five non-terminal `closeout.*` audit rows) is hard — soul-enforced rows (validate / drift_updated / statement_output / etc.) never accept `2`.

**Mode-specific forms**:
- **Standard** (default): ~21 rows spanning boot · prescan · decision · execute · validate · closeout.
- **Fast-path**: the four rows `decision.verdict_output` · `execute.changes_applied` · `validate.validation_green` · `closeout.drift_updated` (+ `closeout.manifest_synced` · `closeout.statement_output`) stay at `1`; everything else is `skip:fast-path`.
- **Rejected** (`Verdict=reject`): `decision.verdict_output` + `closeout.drift_updated` + `closeout.statement_output` stay at `1`; execute / validate and most closeout rows become `skip:rejected`.

**Why a separate runtime directory** (vs. inlining into drift.md or memos.md): `drift.md` is append-only historical log — mid-flight state would pollute it. Close-Out statements live in the chat and disappear after compact. `.archon/runs/&lt;run_id&gt;/state.json` is the mechanical ledger of in-flight progress, and the only artifact a pre-commit hook should consult before letting a commit through.

### 3e. Destructive-Git Guardrails (B4 L1 Interception)

Soul §Constraints carries a "no destructive git without drift rationale" rule. As long as it lived only in prose, both humans and agents could violate it silently with a single `git push --force` or `git reset --hard`. B4 promotes this rule from L3 to L1 via **two independent mechanical interceptors** that together cover every client path:

1. **`.husky/pre-push` hook** — client-agnostic, fires on *any* push that reaches git (CLI, VS Code, JetBrains, Cursor, GUI clients). Blocks `--force` / `--force-with-lease` and non-fast-forward pushes. Because it runs inside git itself, it cannot be bypassed by choosing a different terminal or editor.
2. **Cursor `beforeShellExecution` hook** (`.cursor/hooks/archon-destructive-guard.mjs`) — agent-shell guard fired before the agent executes any shell command. Intercepts `git reset --hard`, `git branch -D`, `git clean -f*`, and `git checkout -B` before they touch the working tree. **Fail-closed on parse failure** — an unparseable command is rejected, never silently allowed.

**Bypass is explicit**: `ARCHON_ALLOW_DESTRUCTIVE=1 &lt;command&gt;` lets a single call through, but the next Close-Out MUST record a drift row naming the command and the rationale. Missing rationale triggers the claim-verifier `missed-trig` mode on the next delivery.

**Cross-platform note**: `.gitattributes` pins LF on `*.sh` and `.husky/*` to prevent Windows `core.autocrlf` from corrupting hook shebangs. The Cursor hook is implemented in Node (`*.mjs`) specifically because Cursor on Windows resolves `/bin/sh` to WSL, which breaks POSIX shell hooks — Node runs identically on all three platforms.

**Governance anchoring**: 3 portable-contract entries (`governance-contract.yaml`) + 3 critical-rule substrings (Block 5 registry) + export-manifest inclusion of the guard script and hook config. Removing any one anchor without the paired edits fails Block 4 (anchor consistency) or Block 7 (export manifest).

Adopter projects without Cursor can ship just the pre-push hook and skip the `.cursor/hooks/` half. Adopter projects that want to permit destructive ops as a matter of course can remove the pre-push hook entirely — but then soul §Constraints must also drop the no-destructive-git rule so prose and mechanism stay aligned.

## Step 4: Optional Enhancements

Add these as needed — not required for initial setup, but each closes a specific governance gap as the project grows.

### Lint-Rule Bridge

Have linter error messages point to rule files in the platform rules directory, forming an L1→L2 active trigger loop.

**Convention**: Custom lint rule error message format = self-contained fix guidance + `→ Read &lt;rule-file-path&gt;`.

Example (ESLint `no-restricted-imports`, Cursor platform):

```javascript
{
  message: 'Pages import from @/lib/api directly. Use hooks instead. → Read .cursor/rules/frontend.mdc',
}
```

### Project Rules (Rules Directory)

Coding standards, architecture boundaries, design system specs, and other project-specific editor rules. For each rule, ask "who ensures it's followed?" — if the answer is "whoever reads it," consider pushing to a lint rule.

### Skill Documents (Skills Directory)

Reusable domain knowledge: design system, API specs, framework best practices, component guides, etc. Maintain an index in `manifest.md §Knowledge Assets`. The pre-installed `archon-framework` skill serves as a working example and stays in place permanently.

### Architecture Decision Records

`.archon/decisions.md` — project-specific ADRs for the adopter project. Each entry records date, status, decision, rationale, impact, and re-evaluation triggers. `docs/archon/decisions.md` is separate: it explains Archon framework decisions that ship with the reusable kit.

### Extensions (`.archon/extensions/`)

Extensions are project-specific capabilities that hook into Archon's fixed lifecycle points without modifying core files. They implement the plug-in pattern: install = create a directory with `extension.md`; uninstall = delete the directory.

**Lifecycle points** that extensions can hook into (declared in `soul.md §Extension Points`):

| Point | Command | When |
|-------|---------|------|
| `demand.pre-scan` | archon-demand | After loading memos, before decision gate |
| `demand.close-out` | archon-demand | After stakeholder memos, before git |
| `plan.perception` | archon-plan | During state perception phase |
| `plan.output` | archon-plan | After priority ranking, before final output |
| `review.health` | archon-review | During knowledge health audit |

**Budget rules**: max 3 active extensions per project, ≤ 15 lines per hook declaration. Extensions are NOT exported with the core kit — they are always project-local. See `soul.md §Extension Points` for the complete discovery protocol and `extension.md` file format.

### Dashboard (`.archon/dashboard/`)

A zero-dependency Node.js dashboard that visualizes governance state (milestones, drift log, debt registry, ADR timeline, delivery cadence) by parsing `.archon/*.md` directly.

- **Install**: the dashboard is optional and not exported by default. Copy `.archon/dashboard/` from the authoring source when you want governance visualization.
- **Launch**: run `/archon-dashboard` or `node .archon/dashboard/server.js`.
- **Deactivate**: delete `.archon/dashboard/`. The `archon-dashboard` command will no-op until the directory returns.
- **Optional heartbeat rule** (`{platform}/rules/archon-heartbeat.mdc`): provides more precise session state inference by writing transient heartbeat files during delivery. Entirely optional — the dashboard falls back to passive inference from transcripts when heartbeats are absent.

## Step 5: Verify Installation

Run `/archon plan` (or `/archon-plan`). Archon will hot-path read the required `soul.md`, `soul/review.md`, `manifest.md`, and `drift.md` sections, then output next-step recommendations based on project state. If it produces a coherent summary and plan, the framework is loaded successfully.

Additionally, the agent should consult the `archon-framework` skill on its first Archon-related action in the session — `archon-wake.mdc` will guide it there. If you ever want to test the primer flow manually, ask the agent "what is Archon and how does this project use it?" — it should cite `{platform}/skills/archon-framework/SKILL.md`.

## Checklist

| Step | Artifact | Verification |
|------|------|----------|
| Copy framework files | `.archon/soul.md` + `.archon/soul/{delivery,review}.md` + `{platform}/{commands,agents,rules,skills}/archon*` | All files exist; `archon-wake.mdc` and `archon.mdc` present in rules; `archon-framework/SKILL.md` + `archon-git-commit/SKILL.md` + `blink-dispatch/SKILL.md` present in skills |
| Create manifest | `.archon/manifest.md` | Platform mapping + all `&lt;!-- --&gt;` placeholders filled; §Context Budget, §Validation Command, §Milestones present |
| Create drift | `.archon/drift.md` | `drift: 0`, log table header ready |
| Create debt | `.archon/debt.md` | Template copied, Archive Index + Active Debt Index sections ready |
| Create memos | `.archon/memos.md` | Template copied, Archive Index + Hot Memos sections ready |
| Run-state schema/helper | `.archon/templates/run-state.schema.json` + `scripts/archon-run-state.mjs` | Files present; `.archon/runs/` and legacy `.archon/run.md` are gitignored and NOT created here — they appear only during active deliveries |
| Register validation command | package.json / Makefile / etc. | Command runs and passes green |
| Governance tests (6-8 blocks) | Test file | Validation runs: budget (≥7 files) + ratio [0.1, 0.5] + drift gate + manifest/memos/debt hot-index/archive contracts + soul anchors + critical-rule substrings (registry may start empty) + convergence-gate contract (may be no-op) + export-manifest contract (authoring source only) + run-state contract (template + skill + hook + demand-cmd clauses) |
| Pre-commit hook | `.husky/pre-commit` or equivalent | `git commit` triggers validation + lifecycle gate + run-state gate (when `.archon/run.md` is present) |
| First plan | `/archon plan` or `/archon-plan` output | Archon correctly loads the required soul/manifest sections; `archon-framework` skill consulted on first archon-related action |
