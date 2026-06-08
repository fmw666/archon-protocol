# Archon Framework Changelog

All notable changes to the **Archon framework** (the portable governance kit —
the set of files and mechanisms produced by `scripts/export-archon-core.mjs`) are
documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **What counts as an Archon change?** Any modification to files shipped by the
> export pipeline (soul, domain lenses, commands, agents, rules, skills,
> templates, portable helpers, docs under `docs/archon/`). Changes to
> host-project application code do not belong here.

## Versioning Scheme

Archon uses a single `MAJOR.MINOR.PATCH` version recorded in `.archon/VERSION` and
echoed into every standalone export package:

- **MAJOR** — breaking changes to the governance contract, file layout, or wake
  protocol that require adopters to migrate manually.
- **MINOR** — new mechanisms, new ADRs, new skills, or new domain lenses added in
  a backward-compatible way.
- **PATCH** — documentation fixes, template clarifications, bug fixes in portable
  helpers, or visual asset updates.

## [Unreleased]

### Added
- _(Planned)_ `archon init` / `archon doctor` / `archon export` CLI (ROI-2) for
  one-command adoption without needing to clone the framework's source repo.

### Audited
- Template cleanliness: `docs/archon/templates/{manifest,decisions,debt,drift,memos}.template.md`
  confirmed free of host-project-specific content. All concept examples are
  either HTML-comment placeholders or intentionally generic teaching vocabulary
  (e.g., `Booking`, `Launch Prep`, `Capability Package` in user-journeys).

### Changed

### Fixed

## [0.2.0] — 2026-06-08

Memory-layer upgrade derived from a comparative study of Claude Code's
project-level memory + ADR practices (see ADR-31 / ADR-32 and the Negative
ADR-N6 / ADR-N7).

### Added
- **Shipped state templates** (ADR-31): all five seedable ledgers now have
  real, sha256-verified templates in the `core-templates` module and
  `export_manifest.required_files` — `manifest.template.md`,
  `decisions.template.md`, and (completing the thesis after the
  `install-agent-cursor` sandbox showed LLM agents under-seed hand-built
  ledgers) `drift.template.md`, `debt.template.md`, `memos.template.md`.
  `install.md` Step 7 seeds `manifest / debt / drift / memos / decisions` by
  copying the canonical templates verbatim instead of constructing them from
  prose, so a fresh install passes `archon-check.py` deterministically — the
  drift `**drift: 0**` sentinel, the memos `## Archive Index` section, and the
  debt `<!-- no-active-debt -->` marker no longer depend on prose adherence.
- **Onboarding codebase self-scan** (ADR-31): `install.md` Step 7b — the
  install agent runs a read-only scan (package manifests, directory layout,
  README terms) and pre-fills the manifest's Tech Stack, Directory Structure,
  Concept Glossary candidates, and Source Modularity Map seeds.
- **Path-scoped manifest slices** (ADR-32): optional `.archon/manifest/slices/<slug>.md`
  fragments scoped to a subtree via a `scope:` glob, indexed in the root
  manifest `## Manifest Slices` section and loaded on demand during pre-scan.
  New conditional `manifest_slices` contract block + `assert_manifest_slices`
  in `archon-check.py` (skipped when the directory is absent, so single-scope
  projects are unaffected).

### Changed
- `soul.md` §Knowledge Hygiene gains a **Path-scoped slices** pre-emptive rule;
  core soul cap raised 310→315 (ADR-32 rationale recorded in `file_budgets`).
- `archon-demand.md` pre-scan gains a **Manifest slice scan** step and the
  `modularity_probe` becomes slice-aware (no pinned substring disturbed).
- `.archon/VERSION` 0.1.0 → 0.2.0.

## [0.1.0] — 2026-05-04

First tagged release of the Archon framework. The mechanism set reflects roughly
three months of iteration inside the host project (ADR-01 through ADR-26).

### Added
- **Soul model** — cognitive core with identity axioms, ownership contract,
  cognitive loop, autonomy principles, evolution axis, and guardrail system
  (`soul.md` + route-scoped `soul/delivery.md` · `soul/review.md`).
- **Three-tier directory layout** — `.archon/` (core + project state) + platform
  directory (`.cursor/` / `.claude/`) + `docs/archon/` (reference docs).
- **Cognitive state files** — manifest / drift / debt / memos / decisions six-piece
  set with hot-summary regeneration from immutable records (ADR-22 records-folder).
- **Delivery lifecycle** — Decision Gate (Verdict) · Validation Gate · Close-Out
  with mechanical outputs verified by Claim Verifier (ADR-27).
- **Blink Dispatch** — thin-slice triage gate for close-out sub-agent dispatch
  (ADR-17).
- **Constraint pyramid** — L0–L5 enforcement levels with Lint-Rule Bridge for
  promoting skills to linter rules (ADR-20).
- **Preservation Axis** — load-bearing rule registry with anchor + body-shape test
  + portable contract (ADR-28).
- **Source Modularity Probe** — mechanical architectural-debt probe at Decision
  Gate (ADR-29).
- **Run-State v2** — ephemeral per-delivery state under `.archon/runs/&lt;run_id&gt;/`
  with JSON schema (ADR-14 extended).
- **Domain Lenses** — pre-Verdict lens index with five lenses shipped: dev,
  design, platform, ecosystem, capability.
- **Portable helpers** — `archon-check.py` (governance contract), `archon-check.sh`
  (bash port), `archon-run-state.mjs`, `archon-records.mjs`, `archon-claim-verifier.mjs`.
- **Two-platform export** — `scripts/export-archon-core.mjs` produces Cursor and
  Claude Code ready kits.
- **Complete documentation set** — 18 markdown files under `docs/archon/` covering
  architecture, setup, decisions (10 public ADRs), user journeys (16), concepts,
  and adoption quickstart.
- **Comic illustrations** — 26 generated comic explainer images across README,
  architecture, setup, user-journeys, decisions, and adoption quickstart.

### Governance
- Apache-2.0 License.
- `NOTICE` file describing third-party attributions.
- Portable governance contract (`.archon/contracts/governance-contract.yaml`)
  verified by both Node and Python runtimes.

---

[Unreleased]: https://github.com/fmw666/archon-protocol/compare/archon-v0.1.0...HEAD
[0.1.0]: https://github.com/fmw666/archon-protocol/releases/tag/archon-v0.1.0
