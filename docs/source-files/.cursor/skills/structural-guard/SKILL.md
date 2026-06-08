---
name: structural-guard
description: >
  Author a structural guard — a whole-repository static-scan test that enforces
  a codebase-wide invariant (a banned pattern, a required companion file, a
  directory-purity rule, a cross-file relationship) in CI, in any language
  (TypeScript, Python, Go, Rust, Java). Use when the user wants to enforce a
  pattern across all files, prevent a banned pattern from reappearing, require
  co-located tests, or guard an architectural boundary that a single-file linter
  cannot express. Also triggered by "结构守卫", "结构性测试", "structural test",
  "guard test", "防回归测试", "ban this pattern project-wide", "enforce pattern
  everywhere", "fitness function test".
version: 1.0.0
license: MIT
---

<!-- Source: Formwork (结构守卫) — https://github.com/EvoMap/formwork — MIT.
     Bundled into Archon as an optional skill (manifest module: skills-formwork).
     Companion in-loop reasoning card: .archon/domain-lenses/tools/dev/structural-guard.md.
     Rationale + adopt/reject analysis: ADR-30 + docs/concepts/formwork-adoption.md (framework repo only). -->

# Structural Guard — author a codebase-wide invariant test

Create a test that scans the whole repository and fails when a global invariant
is violated. Complements linters by covering **cross-file** constraints that
single-file tools cannot express.

## Step 0 — Should this be a guard at all?

- If a single-file **linter rule** expresses it (a banned identifier, a syntax
  ban), prefer the linter.
- If it is a **dependency/layer** rule, prefer the ecosystem's dependency tool
  (dependency-cruiser, import-linter, ArchUnit, golangci, Nx boundaries).
- Write a guard only for a **cross-file, second-order, silently-failing**
  invariant a linter cannot phrase.

## Step 1 — Define the invariant precisely

Write one sentence before coding:

1. **What must be true** (positive) or **never happen** (negative)?
2. **Scope**: which directories / extensions are in; what is excluded
   (tests, generated code, vendored deps)?
3. **Known exceptions** (the initial grandfather set)?
4. The **human-readable failure message** (what / why / how-to-fix / example
   file / `[Rule: <source>]`).

## Step 2 — Pick the category

| Category | Shape |
|---|---|
| Forbidden Pattern | a regex must NOT match in any scanned file |
| Required Companion | file A implies sibling file B exists |
| Consumer Validation | file A must be imported by ≥1 non-test file |
| Directory Purity | files in dir X must not contain pattern Y |
| Specific File Check | a named file must satisfy a condition |
| Structural Invariant | a cross-file relationship must hold |

## Step 3 — Detect language & test runner, then scaffold

Detect the project's stack and place the guard in its native test suite:

| Language | Runner | Walk | Guard location |
|---|---|---|---|
| TS / JS | Vitest / Jest | `node:fs` | `**/__tests__/<concern>.guard.test.ts` |
| Python | pytest | `pathlib` | `tests/structural/test_<concern>.py` |
| Go | `go test` | `filepath.WalkDir` | `internal/structural/<concern>_test.go` |
| Rust | `cargo test` | `walkdir` | `tests/structural_<concern>.rs` |
| Java | JUnit | `Files.walk` | `src/test/.../<Concern>GuardTest.java` |

Paste-ready per-language templates and runnable examples live upstream:
https://github.com/EvoMap/formwork (`templates/<language>/`, `docs/language-adapters.md`).

## Step 4 — The five-part anatomy (every language)

1. **Scope** — collect target files; skip tests/generated/vendored.
2. **Sentinel assertion** — `assert scanned_count > N`. A zero-file scan passes
   vacuously and is worse than no guard. **Never skip this.**
3. **Violation collector** — iterate; push `path:line` on a hit; never assert
   inside the loop.
4. **Single assertion + fix guidance** — assert the collected list is empty,
   with a message containing what / why / fix / example / `[Rule: ...]`.
5. **Normalization** — normalize path separators; strip comments and string
   literals before matching to avoid false positives on docs/examples.

## Step 5 — Handle existing violations (grandfather + ratchet)

If the codebase already violates the new rule:

- Add a **grandfather set** of the current violations, each with an inline
  one-line reason.
- Add **two sibling assertions**: (a) the set's size is `<= current_size`
  (cap == current count, no headroom); (b) every entry maps to a file that
  still exists (`existsSync`/`Path.exists`).
- Never widen the cap to go green — that is the anti-pattern this guards against.

## Step 6 — Wire into CI & verify

- Run it: execute the single guard with your runner.
- **Prove it bites**: introduce a real violation, confirm the guard fails, then
  revert.
- Ensure CI schedules the whole guard **directory** (not this file by name) —
  invoke the `guard-ci-wiring` skill, which also installs the meta-guard.

## Eight rules (apply in any language)

1. Read the filesystem in a Node/CI environment, never a browser-like one.
2. Always include the sentinel (`count > N`).
3. Always normalize path separators for cross-OS runs.
4. Always skip comment lines / string literals (and rule-doc example lines).
5. Use the violation-collector pattern; assert once with a descriptive message.
6. Keep regexes conservative — prefer false negatives over false positives; a
   noisy guard gets ignored or deleted. (Then schedule pruning so under-matching
   guards don't accumulate — see `constraint-pruner`.)
7. Put fix guidance + a `[Rule: <source>]` breadcrumb in the failure message.
8. One concern per guard file.

See also: `guard-from-incident` (turn a fixed bug into a guard),
`guard-ci-wiring` (CI scheduling + meta-guard), `constraint-pruner` (de-bloat).
The Archon in-loop reasoning card for the same decision is the dev lens tool
`structural-guard` (`.archon/domain-lenses/tools/dev/structural-guard.md`).
