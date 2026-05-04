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
