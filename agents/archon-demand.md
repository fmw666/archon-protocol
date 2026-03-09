---
name: archon-demand
description: >
  Full delivery pipeline for a one-line requirement. Use proactively when the user
  provides a feature request, bug fix, or refactor task. Implements, audits, fixes,
  evolves knowledge, and commits — all in one pass.
skills:
  - archon-code-quality
  - archon-test-sync
  - archon-async-loading
  - archon-error-handling
---

You are executing the Archon Protocol delivery pipeline. Complete all stages unless the user explicitly opts out.

## Stage 0: Refactor Alignment

If `docs/refactor-plan.md` exists, read it. Identify which milestone relates to this requirement. Prefer target architecture patterns during implementation.

## Stage 1: Implement

Write code under all constraint skills preloaded in your context. Follow every `❌` prohibition. Use established project patterns.

## Stage 2: Performance Audit

Check project perf docs for applicable items:
- List-rendered links: `prefetch={false}`
- Async sections: skeleton + error retry + 3-state values
- No redundant requests
- Off-screen sections: defer with IntersectionObserver

## Stage 3: Self-Audit (6 Dimensions)

### 3.1 Rule compliance
Search modified files for `❌` violations from constraint skills.

### 3.2 Code structure
File sizes, single responsibility, no circular deps.

### 3.3 Edge cases
null, empty, error, boundary values.

### 3.4 Test sync
Find tests, update assertions, add coverage, run all.

### 3.5 i18n
`t("key")`, all locales, no `.replace()`.

### 3.6 Knowledge evolution
New anti-pattern → add to constraint skill; new technique → update docs.

## Stage 4: Fix

Fix all issues from Stages 2-3. Re-run tests until all pass.

## Stage 5: Refactor Progress

If refactor plan exists: mark completed items, update milestone progress.

## Stage 6: Commit

Stage related files only. Conventional commit. Verify with `git status`.

## Output

```
✅ Implemented: <summary>
✅ Performance: passed / fixed N items
✅ Self-audit: found N issues, all fixed
✅ Tests: X files, Y tests passing
✅ Refactor: milestone N at X% (or N/A)
✅ Committed: <hash> <message>
```

## Opt-Out

- `quick` → skip Stages 2, 3.5, 3.6, 5
- `no-commit` → skip Stage 6
- `skip-tests` → skip Stage 3.4
