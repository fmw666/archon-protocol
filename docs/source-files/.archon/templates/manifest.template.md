# Project Manifest

> Archon hot-path reads only the sections needed for the current route. Updated by Archon after each delivery. On a fresh install the onboarding agent pre-fills the sections below from a codebase self-scan (see install.md §7); replace every `<!-- hint -->` with real project values.

## Platform

<!-- Archon core + project state files live in .archon/ (same path across platforms); platform-specific files live in each platform's dotdir -->

| Logical Name | Actual Path | Note |
|--------|---------|------|
| Archon Core | `.archon/` | Universal across platforms |
| Rules Directory | <!-- .cursor/rules / .claude/rules --> | Platform-specific |
| Skills Directory | <!-- .cursor/skills / .claude/skills --> | Platform-specific |
| Agent Directory | <!-- .cursor/agents / .claude/agents --> | Platform-specific |
| Commands Directory | <!-- .cursor/commands / .claude/commands --> | Platform-specific |

## Product

<!-- One paragraph: what the product is, core user flow, business model -->

## Concept Glossary

> Product-specific terminology included in current-state hot paths. Prevents AI from reverting to dictionary/training-data meanings. Keep entries lean (one-line definitions). Add new terms during close-out when a concept could be misinterpreted.

| Term | Meaning in This Project | ≠ Common Meaning |
|------|------------------------|------------------|
| <!-- term --> | <!-- project-specific definition --> | <!-- what it does NOT mean --> |

## User Language Index

> Maps stakeholder phrases to canonical project artifacts for fast lookup. Use for aliases, nicknames, and repeated user wording; keep Concept Glossary focused on product-domain meanings. Row format: `User Phrase(s)` separated by ` · `; `Canonical Target` names the artifact class + identifier; `Lookup` lists route · file · anchor pointers. When two phrases would resolve to different targets, create separate rows rather than merging.

| User Phrase(s) | Canonical Target | Lookup |
|----------------|------------------|--------|
| <!-- phrase A · phrase B --> | <!-- page, module, concept, route, or artifact --> | <!-- route/path/file/test/ADR lookup hint --> |

## Tech Stack

| Layer | Choice | Version |
|----|------|------|
| <!-- fill per layer --> | | |

## Validation Command

<!-- Declare the project's validation command covering lint + typecheck + test -->

## Context Budget

Per soul.md §Mechanical Budget Enforcement, every hot-path governance file MUST carry a hard line cap asserted by the project's test suite.

| File | Hard Cap (lines) | Hot Path | Remediation on Breach |
|------|-----------------:|:-------------:|----------------------|
| `.archon/soul.md` (core) | <!-- e.g., 300 --> | Section-scoped | Move mode-specific material to `soul/<mode>.md` or trim recursive restatement |
| `.archon/soul/delivery.md` | <!-- e.g., 150 --> | demand only | Move shared material back to core; trim redundancy |
| `.archon/soul/review.md` | <!-- e.g., 150 --> | plan + review | Move shared material back to core; trim redundancy |
| `.archon/manifest.md` | <!-- e.g., 350 --> | Yes | Keep current state hot; move long latest-review detail to `.archon/manifest/archive/<year>-Q<N>.md` |
| `.archon/drift.md` | <!-- e.g., 70 --> | Yes | Keep as hot index; move older complete rows to `.archon/drift/archive/<year>-Q<N>.md` |
| `.archon/debt.md` | <!-- e.g., 40 --> | Yes | Clean `resolved` items |
| `.archon/memos.md` | <!-- e.g., 30 --> | Yes | Migrate oldest to `memos-archive/<year>-Q<N>.md` |
| `<decisions log>` | <!-- e.g., 200 --> | On demand | Archive superseded entries |

`Latest review` stays hot as a compact summary: keep the validation target, command, bundle evidence when useful, and an archive pointer; do not repeat volatile `N files / M tests` counts in the hot row.

Archive files are NOT counted — only keyword headers/indexes are loaded unless a demand, review, debt, ADR, or keyword points to that period.

**Soul on-demand loading**: `soul.md` core ships with two mode extensions (`soul/delivery.md` — demand only; `soul/review.md` — plan + review). Boot and mode hot paths read only the required core sections; each command loads its extension when needed.

## Governance Ratio

Per soul.md §Knowledge Hygiene, governance files / source files should stay within **[0.1, 0.5]**. Below 0.1 = tribal knowledge risk; above 0.5 = bloat. Both bounds asserted by the project's test suite.

## Agent Model Assignment

Per soul.md §Sub-Agent Independence, sub-agents should use a model family different from the main agent.

| Role | Model Family Constraint | Current Assignment | Rationale |
|------|------------------------|--------------------|-----------|
| Main | <!-- platform default --> | <!-- e.g., Anthropic Sonnet --> | <!-- reason --> |
| `archon-capture-auditor` | ≠ main family (fast) | <!-- e.g., OpenAI / Google --> | Per-delivery lightweight independence check |
| `archon-reviewer` | ≠ main family | <!-- e.g., OpenAI / Google --> | Cycle-level heavyweight independence check |

If the platform cannot route sub-agents to a different family, the `model_family: different-from-main` frontmatter acts as forward declaration.

## Git Strategy

| Setting | Value |
|--------|---|
| Mode | `prompt` / `auto` / `off` |
| Branch Model | `direct` / `feature-branch` / `trunk-based` |
| Commit Convention | <!-- e.g., Conventional Commits --> |

## Directory Structure

> Top-level outline and responsibilities. File-level details are discovered via `ls` / Glob as needed — not maintained here.

| Directory | Responsibility |
|------|------|
| <!-- fill per directory --> | |

## Source Modularity Map

> Per ADR-29 (framework). Decision Gate `modularity_probe:` matches changed paths against this map and emits `target=<path>|axes=<axis-cell,...>|status=<aligned|fan-out-needed|undeclared>`. Each row declares the **concept axes** a file (or glob) is allowed to mix; folding a second axis-cell into a file already responsible for one fires `fan-out-needed`. Empty map = every path is `undeclared` and the probe is advisory. Maintain by axis (role / surface / medium / lifecycle), **not by line-count threshold**. Pick the smallest concept-axis vocabulary that already explains how files differ today — do not invent axes you have no current pressure for.

| Path Glob | Split Axes (one cell per future file) | Fan-Out Trigger |
|-----------|----------------------------------------|-----------------|
| <!-- e.g., src/pages/*.tsx --> | <!-- e.g., page-component · page-local-hook · page-data-shape --> | <!-- e.g., a 60+ line inline hook → extract to sibling file --> |

## Manifest Slices

> Per ADR-32 (framework). Optional path-scoped manifest fragments for large / monorepo projects. Each slice lives at `.archon/manifest/slices/<slug>.md`, declares the **path glob** it governs (`scope: <glob>` in its body), and carries only the subtree-local additions to Concept Glossary / User Language Index / Source Modularity Map / Directory notes. The demand pre-scan matches the demand's target paths against the globs below and loads only the matching slice bodies — keeping per-subtree context off the root hot path. Absence of the `slices/` directory = single-scope behaviour (this whole manifest applies everywhere). Each slice is mechanically validated by `archon-check.py` (`manifest_slices` block: ≤120 lines, must declare a `scope:` glob, must be indexed below).

| Slice | Path Glob | Purpose (one line) |
|-------|-----------|--------------------|
| <!-- e.g., packages-web --> | <!-- e.g., packages/web/** --> | <!-- e.g., web-app vocabulary + modularity rows --> |

## Knowledge Assets

### Rules (Rules Directory)

| File | Responsibility | Constraint Scope |
|------|------|----------|
| `archon.mdc` | Archon decoupling rules | Archon-related files |

### Skills (Skills Directory)

<!-- Add as needed -->

### Lifecycle Hooks (Agent Directory)

| Agent | Trigger | Responsibility |
|-------|---------|------|
| `archon-capture-auditor.md` | After every delivery close-out | Knowledge capture + blindspot reflection + delivery hygiene |
| `archon-reviewer.md` | drift ≥ 12 or manual trigger | Full project review |

### Architecture Decisions

<!-- e.g., `.archon/decisions.md` for project ADRs; the framework ADR ledger at https://aaep.site/concepts/decisions for reusable Archon ADRs -->

### Universal Module Guard

Project and stack terms that must not appear inside universal Archon modules. Keep this list project-specific; the portable checker reads it from here. Replace the empty array during adoption so the guard has real project terms to enforce.

<!-- archon-universal-forbidden-terms:start -->
```json
[]
```
<!-- archon-universal-forbidden-terms:end -->

Project path patterns that Blink Dispatch treats as high-risk for this repository:

<!-- archon-blink-project-high-risk-paths:start -->
```json
[]
```
<!-- archon-blink-project-high-risk-paths:end -->

### Extensions (`.archon/extensions/`)

> Project-specific capabilities that hook into core lifecycle points. Not exported with core.
> Install = create directory with extension.md; uninstall = delete directory. See soul.md §Extension Points.

<!-- Add as needed: | Extension | Hooks | Purpose | -->

## Milestones & Acceptance Criteria

> Acceptance criteria are dynamic project contracts. When a delivery introduces a new technology, architecture layer, module, pattern, or validation-changing optimization, update this section or the Validation Command in the same delivery.

### M0 — Infrastructure ⬜

Feature Acceptance:
- [ ] <!-- specific, testable functionality -->

Quality Gates:
- [ ] Validation command passes green

## Persona

<!-- Optional. Leave empty = default style (concise, direct, no role-playing). Format per soul.md §Persona -->

<!--
Style:
Tone:
Self-reference:
Traits:
-->

## Current State

- **Current milestone**: M0
- **Completed**: —
- **Known issues**: see `debt.md`

### Stakeholder Memos

> Separated to `.archon/memos.md`; loaded on-demand during archon-demand pre-scan.
