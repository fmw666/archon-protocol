---
name: guard-ci-wiring
description: >
  Wire a structural-guard suite into CI so it is drift-proof: schedule the whole
  guard DIRECTORY (never an enumerated file list) and install a meta-guard that
  fails if anyone reverts to per-file scheduling or unwires the suite. Also sets
  up the grandfather/ratchet discipline. Use when adding the first guard,
  integrating Formwork into a repo's CI, or when the user says "wire guards into
  CI", "接入 CI", "守卫没跑", "guards not running in CI", "meta-guard",
  "drift-proof the guard suite", "ratchet".
version: 1.0.0
license: MIT
---

<!-- Source: Formwork (结构守卫) — https://github.com/EvoMap/formwork — MIT.
     Bundled into Archon as an optional skill (manifest module: skills-formwork).
     The exemption ratchet convention is mirrored in .archon/contracts/governance-contract.yaml (structural_guard block). -->

# Guard CI wiring — make the suite drift-proof

A guard that exists but never runs is worse than none — it implies a gate that
isn't there. This skill makes the suite impossible to silently orphan.

## Principle

- **Schedule by directory, not by file.** CI must run the entire guard directory
  (most runners accept a directory path), so a newly added guard is picked up
  automatically with zero registration step a memoryless contributor could
  forget.
- **Install a meta-guard** that reads the CI config / impact-map source text and
  asserts the directory is still scheduled and no per-file enumeration crept
  back. This is "a guard that guards the guards."
- **Run the suite in full, not sampled.** Static scans are cheap and each one
  scans the whole tree, so any change can violate any guard. Carve guards out of
  any random test-sampling pool.
- **Exclude the AI-instruction layer from any "docs-only" CI fast-path.** If CI
  skips heavy steps for docs-only PRs, ensure the agent's executable governance
  files (rule files, the skills directory) are NOT treated as docs — otherwise
  the guards that validate those very files never run when only they change.

## Steps

1. **Place all guards under one directory** (e.g. `tests/structural/`,
   `internal/structural/`, `src/**/__tests__/guards/`).
2. **Schedule that directory** in CI:
   - TS/JS: `vitest run tests/structural` / `jest tests/structural`
   - Python: `pytest tests/structural`
   - Go: `go test ./internal/structural/...`
   - Rust: `cargo test --test 'structural_*'`
   - Java: a JUnit tag/suite for the guard package
3. **Add the meta-guard** (`suite-wiring`): a guard that opens the CI workflow /
   build script as text and asserts (a) it contains the directory schedule and
   (b) it contains zero per-file guard references. It fails on any reversion.
4. **Set up the ratchet** for any grandfather sets: cap == current size, plus an
   "every exemption maps to a real file" check.
5. **Verify**: add a throwaway guard file under the directory and confirm CI
   would run it without any further edit; then remove it.

## Meta-guard sketch (pseudo, port to your language)

```
ci = read_text(CI_CONFIG_PATH)
assert SCHEDULE_DIRECTORY_STRING in ci   # "tests/structural" is scheduled
assert no_match(ci, /per-file guard reference regex/)  # no enumeration
```

## Reminder

The meta-guard makes weakening *visible* (a red build, a diff), not impossible —
it lives in-band and can itself be edited. For load-bearing invariants, back it
with out-of-band authority (branch protection / CODEOWNERS) where available.
This "not-silently-modifiable, not unmodifiable" property is the same one Archon's
Preservation Axis (ADR-28) gives a pinned governance rule.
