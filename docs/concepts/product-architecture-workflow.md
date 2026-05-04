# Archon Product Architecture Workflow

> Archon as an independent product: how a project adopts it, how Archon understands project state, how demands are routed, and how engineering judgment becomes verified delivery.

![Comic explainer: Archon product architecture map](/images/product-architecture-workflow/01-product-map.png)

This document complements [architecture.md](/concepts/architecture): that file explains Archon's internal mechanisms; this file explains the product workflow from an adopter's point of view. If you want to install Archon before reading the product view, start with [adoption/quickstart.md](/setup/quickstart.md).

## Purpose

Archon is a repository-native AI engineering governance product. It does not replace the coding model and it does not run as a background daemon. Instead, it gives the model durable project context, hard engineering gates, independent review, and a repeatable way to turn delivery experience into stronger constraints.

## Product Boundary

| Boundary | Archon Owns | Archon Does Not Own |
|------|------|------|
| Project adoption | Framework kit, project-state templates, validation and commit gates | The adopter's product decisions |
| Runtime judgment | Routing, Verdict, validation, Close-Out, review pressure | Blind execution of user technical preferences |
| Project memory | Manifest, drift, memos, debt, ADRs, cold archives | Git history replacement or chat transcript storage |
| Productization | Export kit, installer/migrator, governance checker, platform adapters, dashboard | A separate autonomous coding daemon |

The product promise is: the user expresses intent; Archon supplies engineering ownership, context continuity, verification, and learning.

## Core Product Modules

| Module | Product Role | Primary Files |
|------|------|------|
| Core Kit | Portable governance runtime | `.archon/soul.md`, `.archon/soul/`, domain lenses, contracts, templates |
| Platform Adapter | IDE-specific activation and commands | `{platform}/commands`, `{platform}/rules`, `{platform}/skills`, `{platform}/agents` |
| Project State | Adopter-specific facts and memory | `manifest.md`, `drift.md`, `debt.md`, `memos.md`, `.archon/decisions.md` |
| Runtime Proof | Per-delivery commit permission | `.archon/runs/&lt;run_id&gt;/state.json`, `scripts/archon-run-state.mjs` |
| Governance Checker | Portable mechanical enforcement | `.archon/contracts/governance-contract.yaml`, `scripts/archon-check.py` |
| Dashboard | Optional visibility layer | `.archon/dashboard/` |

## New Project Onboarding

![Comic explainer: Archon new project onboarding](/images/product-architecture-workflow/02-new-project-onboarding.png)

A new project starts with a clean install path:

1. **Copy or export the kit**: install the project-agnostic core, platform adapter files, templates, governance checker, and run-state helper.
2. **Fill project state**: complete `manifest.md`, initialize `drift.md`, `debt.md`, `memos.md`, and `.archon/decisions.md`.
3. **Install mechanical guards**: register the manifest validation command, add governance checks, and wire the pre-commit lifecycle gate.
4. **Run first plan**: `/archon plan` proves that Archon can load the right sections and infer the next project step from state.

Adoption is complete only when the first plan output is coherent and the validation command can enforce the declared governance contracts.

## Existing Project Intake

![Comic explainer: Archon legacy project intake](/images/product-architecture-workflow/03-legacy-project-intake.png)

An existing project is not a blank template. Archon must understand it before governing it.

The intake flow is:

1. **Read reality first**: inspect source layout, build and test commands, deployment path, docs, conventions, CI, and existing guardrails.
2. **Extract durable facts**: write only current truths into `manifest.md`: product purpose, tech stack, directory responsibilities, validation command, knowledge assets, current state.
3. **Classify implicit knowledge**: promote recurring conventions into the strongest fitting vehicle: type, test, lint, rule, skill, ADR, manifest, memo, or debt.
4. **Preserve compatibility**: do not rewrite the project to match Archon. Register gaps as debt with deadlines and let future demands pay them down.
5. **Start with low-risk governance work**: stabilize validation, sync manifest, index knowledge assets, then enter normal demand delivery.

The compatibility rule is simple: Archon adapts its project-state files to the real project first; it changes the project only after a Verdict says the change is justified.

## Demand Execution

![Comic explainer: Archon demand execution route](/images/product-architecture-workflow/04-demand-execution.png)

Every user-facing feature request, bug fix, or change request enters the same decision pipeline:

```text
Wake / command
→ Drift Precheck
→ Router
→ Pre-Scan
→ Domain Lens classification
→ Fast-Path check
→ Verdict
→ Capability selector packet (optional, post-Verdict)
→ Self-directed execution
→ Validation Gate
→ Close-Out
→ Run-State commit permission
→ Git strategy
```

The execution interior is flexible: the agent chooses files, tools, helper scripts, test strategy, and backtracking. For broad reusable capability requests, the selected `capability` lens may ask a generic read-only selector to return a compact asset packet after `Verdict=proceed`; the packet can name at most the few skills or domain tools worth loading, but it cannot decide the delivery or implement changes. The boundaries are not flexible: no write before Verdict, no delivery without validation when files changed, no commit without Run-State permission, no self-review when independent review is required, and no permanent rule promotion without an evolution signal.

## Routing And Judgment

| User Input | Route | Judgment |
|------|------|------|
| Status, next step, uncertainty | Plan | Read-only state perception and priority ranking |
| Feature, bug, concrete change | Demand | Verdict first, execute only if sound |
| Audit, quality, security, drift pressure | Review | Light, Full, or Emergency based on drift and invocation |
| Ambiguous intent | Plan | Safe default; produces actionable demand candidates |

Judgment is state-derived, not flag-driven. Archon infers build, harden, repair, or review pressure from manifest milestones, validation state, debt deadlines, and drift patterns.

## Configuration Surface

Archon should feel configurable through project truth, not through a pile of mode switches.

| Need | Configure Through |
|------|------|
| What this project is | `manifest.md §Product` and `§Concept Glossary` |
| How to prove safety | `manifest.md §Validation Command` |
| How much context can stay hot | `manifest.md §Context Budget` |
| What reusable knowledge assets exist | `manifest.md §Knowledge Assets` + platform skill metadata |
| How commits happen | `manifest.md §Git Strategy` |
| Which professional focus and domain tools are available | `domain-lenses/registry.yaml` |
| Which project-local hooks run | `.archon/extensions/&lt;id&gt;/extension.md` |
| Which baseline contracts must hold | `.archon/contracts/governance-contract.yaml` |

If a setting can be inferred from current project state, prefer inference. Add configuration only when state cannot express the decision reliably.

## Productized Delivery Surfaces

For Archon as an independent product, the clean package shape is:

| Surface | Responsibility |
|------|------|
| Export Kit | Reusable files copied into adopter projects |
| Installer | Creates the directory shape and initializes project-state templates |
| Migrator | Performs read-only intake for existing projects and drafts the first manifest/debt/memo set |
| Checker | Runs portable governance checks outside the authoring source |
| Platform Adapter | Converts commands, rules, agents, and skills to each IDE's file format |
| Dashboard | Shows current drift, runs, debt, milestones, and review pressure |

This keeps the compatibility boundary at the repository files. Versioned packaging can come later; the current product unit is the exported kit plus mechanical checks.

## Non-Goals

Archon should not become:

- A background autonomous coding daemon
- A chat transcript database
- A replacement for Git history
- A config-heavy policy engine
- A workflow tool that makes users pick technical options
- A separate memory protocol copied from another agent framework

Any proposed product feature must preserve the ownership model: Archon remains the engineering owner inside a project repository, with the user as product stakeholder.

## Adoption Readiness Checklist

| Check | New Project | Existing Project |
|------|------|------|
| Core kit copied | Required | Required |
| Project state initialized | From templates | From repository intake |
| Validation command green | Required before delivery | Establish before high-risk delivery |
| Drift starts controlled | `0` | Initial value reflects known mismatch only if justified |
| Debt registry ready | Empty | Seed with real unresolved risks |
| Knowledge assets indexed | Starter index | Existing rules/docs/skills mapped first |
| First `/archon plan` coherent | Install pass | Intake pass |

The final adoption signal is not "files exist"; it is "Archon can explain the current project state and recommend the next engineering step without guessing."
