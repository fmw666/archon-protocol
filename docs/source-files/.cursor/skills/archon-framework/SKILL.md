---
name: archon-framework
description: >-
  Archon engineering governance framework — architectural primer. Explains what
  Archon is, how its files fit together, boot protocol, cross-reference
  conventions, and where to look for deeper details. Use when first encountering
  an Archon-governed project (any `.archon/` directory present), before
  modifying any archon file (soul / manifest / drift / debt / memos /
  domain-lenses / commands / agents / rules / skills), when extending Archon
  (new rule / skill / extension / domain / ADR), or when the user asks "what is
  Archon / how does this work?".
---

# Archon Framework — Agent Primer

> Read this skill once per session when working on an Archon-governed project. Then consult `https://aaep.site/concepts/architecture` only if you need deeper detail.

## What Archon Is

A session-based, platform-agnostic AI engineering governance framework. It makes the AI agent the **project owner** (not an assistant): the agent makes engineering decisions, verifies them, and captures what was learned.

Archon is **not** a daemon, CLI, plugin, or auto-triggered loop. It is a set of markdown files activated inside a pair-programming IDE (Cursor, Claude Code, etc.).

## Three-Tier Layout

Any adopting project ends up with this shape. `.archon/` is universal; the platform dotdir differs per IDE.

```
.archon/                  ← core + project state (same path on every platform)
├── soul.md               ← cognitive core — hot-path sections by route
├── soul/
│   ├── delivery.md       ← delivery-mode extension — loaded by /archon-demand
│   └── review.md         ← review-mode extension — loaded by /archon-plan, /archon-review
├── manifest.md           ← project-specific hot context (current state + latest validation)
├── manifest/archive/     ← cold manifest review/history detail, keyword-indexed, on-demand recall
├── drift.md              ← cognitive drift counter + delivery log (auto-generated from drift/records/, ADR-22)
├── drift/records/        ← per-delivery record files (one per +N/-N event, source of truth)
├── debt.md               ← technical debt hot gate index (auto-generated from debt/items/, ADR-22)
├── debt/items/           ← per-debt item files (DEBT-NNN-<slug>.md, source of truth)
├── debt/archive/         ← cold debt rationale, keyword-indexed, on-demand recall
├── memos.md              ← stakeholder conclusions hot index (auto-generated from memos/records/, ADR-22; ≤5 compact pointers)
├── memos/records/        ← per-memo record files (one per stakeholder conclusion, source of truth)
├── memos-archive/        ← cold memos, keyword-indexed, on-demand recall
├── decisions.md          ← project-specific ADR ledger
├── domain-lenses/        ← one-demand professional focus + bounded atomic tools
│   ├── registry.yaml     ← single lens/tool membership index and budgets
│   └── templates/        ← lens.md + tool.md skeletons for new domains
├── extensions/           ← optional project-local lifecycle hooks (not exported)
└── dashboard/            ← optional governance visualization (not required)
.archon/contracts/governance-contract.yaml ← portable baseline for exported checks
scripts/archon-check.py              ← dependency-free contract checker
scripts/archon-run-state.mjs         ← Run-State v2 helper for delivery state

{platform}/               ← platform-specific (e.g. Cursor or Claude Code dotdir)
├── commands/             ← archon · archon-plan · archon-demand · archon-review · archon-dashboard
├── agents/               ← archon-reviewer · archon-capture-auditor
├── rules/                ← archon.mdc (decoupling) · archon-wake.mdc (wake trigger)
└── skills/               ← this SKILL.md lives here
```

## Three Modes

| Mode | Trigger | What It Does |
|------|---------|--------------|
| Plan | `hi archon, ...` · `/archon plan` · `/archon-plan` | Read-only state assessment + next-step recommendation |
| Demand | `/archon-demand <intent>` | Full delivery: decision gate → self-directed execute → validation gate → close-out |
| Review | `/archon-review` (auto when drift ≥ full threshold) | Independent sub-agent audit: architecture · code · compliance · knowledge health |

The wake rule (`archon-wake.mdc`) routes natural-language `hi archon …` requests into the unified `/archon` command, which dispatches to one of the three modes.

## Mechanism Routing

| Need | Mechanism |
|------|-----------|
| Project identity and owner discipline | `.archon/soul.md` + `soul/` |
| Project-specific facts, commands, stack, current state, and latest validation | `.archon/manifest.md` |
| One demand's professional focus and bounded tools | `.archon/domain-lenses/` |
| Project-local lifecycle hook behavior | `.archon/extensions/` |
| Per-delivery commit proof | `.archon/runs/<run_id>/state.json` via Run-State v2 |
| Delivery log, post-delivery review, and review pressure | `.archon/drift.md` |
| Project-specific architecture decisions | `.archon/decisions.md` |
| Delivery evolution signals and promotion decisions | `drift.md` → test/rule/skill/domain tool/ADR/debt/manifest |
| Architecture forecast for the next likely pressure | `drift.md` delivery row + `/archon-demand §Close-Out` |
| Portable adopter checks | `.archon/contracts/governance-contract.yaml` + `scripts/archon-check.py` |

## Constraint Pyramid (L0–L5)

Every rule worth following gets pushed to the strongest enforcement layer. Documentation is the **weakest** constraint.

```
L0  Type system        — won't compile = doesn't exist
L1  Linter / tests     — violation = won't commit (governance.test.ts lives here)
L2  Editor rules       — prompted during editing (.mdc / .md in rules dir)
L3  Skill documents    — indexed on demand (this file is L3)
L4  ADR                — historical traceability (decisions.md)
L5  Manifest           — context synchronization (manifest.md)
```

**Golden rule**: if a machine can enforce it, don't write prose.

## Cross-Reference Convention

Commands, agents, and soul extensions reference each other via the `<file> §<heading>` syntax. Examples:

- `soul.md §Autonomy Principles`
- `soul/delivery.md §Reasoning Capsules`
- `manifest.md §Context Budget`

Every such reference is validated mechanically — the `governance.test.ts` suite includes a Soul Anchor Consistency test that fails red if an anchor points to a non-existent heading after refactors.

## Decoupling Rule (one line)

Project-state files may contain project facts: `manifest.md` for hot context, `drift.md` log rows for delivery history, `debt.md` for active follow-up, `memos.md` for stakeholder conclusions, and `decisions.md` for project ADRs. Universal files (`soul`, commands, agents, rules, domain lenses, framework docs, exported checkers) must stay project-agnostic so they can be copied verbatim to any project. If you're tempted to put a framework name, stack name, concrete path, command, or metric into a universal file, stop — it violates the decoupling rule and will be caught by review.

## Runtime Load Policy

Keep the hot path section-scoped. Commands should load the smallest sections that can safely answer the current phase, then pull cold reference material only when the demand touches that mechanism.

| Situation | Load |
|------|------|
| Wake / routing | `soul.md` identity sections + `manifest.md` current-state sections, including glossary and user-language aliases |
| Demand execution | Delivery-relevant `soul.md` / `soul/delivery.md` sections + manifest facts needed for validation, git, knowledge assets, and current state |
| Demand pre-Verdict | `/archon-demand` `Pre-Verdict Read Budget`: section reads, memo + manifest ADR/Extensions indexes, matching ADR sections only, Domain Lens Level 1 registry only, no new Run-State |
| Demand reject/alternative | `/archon-demand` Reject-Only Close-Out: decision records, trigger-gated demand-pool capture, drift, and git only if knowledge artifacts changed |
| Demand execution interior | `/archon-demand §Self-Directed Execution Interior`: Boundary-hard/process-soft; the agent owns tool order, helper creation, and backtracking while Verdict, validation, Run-State, independent review, and evolution filter remain hard gates |
| Demand close-out | Manifest Extensions trigger hints first; extension bodies only when a matching close-out hook trigger exists; non-fast-path delivery rows include an Architecture Forecast (`risk|next|confidence`) that is not a backlog or Verdict bypass |
| Plan | Planning sections from `soul/review.md`, manifest milestone/current-state sections, and recent drift entries since the last release/reset |
| Light review | `soul/review.md §Review Tiering`, manifest validation/context-budget/knowledge-index sections, and recent drift entries only |
| Full or emergency review | Full `soul/review.md` plus the specific docs/files implicated by findings |
| Framework modification | Relevant `architecture.md` section and matching ADR(s), not the entire docs set by default |

Cold references such as full architecture (`https://aaep.site/concepts/architecture`), full ADR ledgers (`.archon/decisions.md` for project decisions, `https://aaep.site/concepts/decisions` for framework decisions), setup guides, exported templates, and long historical drift entries are read on demand. If a section is missing, inconsistent, or directly edited, expand the read scope for that file.

## Before Modifying Archon Files

1. Read the relevant section at `https://aaep.site/concepts/architecture` for the mechanism you're touching
2. Check only the ADR(s) in `https://aaep.site/concepts/decisions` that bind that mechanism
3. Verify the change does not leak project specifics into universal files (see §Decoupling Rule)
4. Ensure cross-references still resolve (see §Cross-Reference Convention)
5. Expect the validation command declared in `manifest.md` to enforce budgets, anchors, and export-manifest contract — not just type/lint

## Where to Read Next

| Need | Read |
|------|------|
| Full architecture | `https://aaep.site/concepts/architecture` |
| How to install Archon into a new project | `https://aaep.site/setup/full-guide` |
| Which domain lens/tool shape to use | `.archon/domain-lenses/README.md` |
| Why each mechanism exists (narrative) | `https://aaep.site/concepts/user-journeys` |
| Drift mechanism specifics | `https://aaep.site/concepts/drift-mechanism` |
| Framework mechanism decisions | `https://aaep.site/concepts/decisions` |
| Project/product decisions | `.archon/decisions.md` |
| One-page navigation | `https://aaep.site/concepts/` |
