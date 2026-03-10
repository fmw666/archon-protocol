---
outline: deep
---

# /archon-demand

> **`exec()` — Full delivery pipeline for a one-line requirement.**

Implements, audits, fixes, evolves knowledge, and commits — all in one pass.

**Preloads drivers**: archon-code-quality, archon-test-sync, archon-async-loading, archon-error-handling, archon-handoff

## Stage 0: Refactor Alignment

If `docs/refactor-plan.md` exists, read it. Identify which milestone relates to this requirement. Prefer target architecture patterns during implementation.

## Stage 1: Implement

**Before writing code**: If `archon.config.yaml` declares `benchmarks.primary`, read that module's structure (directory layout, naming, data flow, test patterns). New code should imitate the benchmark — not reinvent patterns.

Write code under all constraint skills preloaded in your context. Follow every `❌` prohibition. Prefer boring consistency with existing modules over locally optimal but novel approaches.

## Stage 1.5: Linter Verification

Run the project's lint command (e.g., `pnpm lint`, `eslint .`). Read the output. Fix all errors that overlap with constraint skill prohibitions.

## Stage 2: Performance Audit

Check project perf docs for applicable items:
- List-rendered links: `prefetch={false}`
- Async sections: skeleton + error retry + 3-state values
- No redundant requests
- Off-screen sections: defer with IntersectionObserver

## Stage 3: Self-Audit (6 Dimensions)

### 3.1 Rule compliance
Search modified files for `❌` violations from constraint skills. Recognize `@archon-exception: <ID> — <reason>` annotations as documented exceptions.

### 3.2 Code structure
File sizes, single responsibility, no circular deps.

### 3.3 Edge cases
null, empty, error, boundary values.

### 3.4 Test sync
Find tests, update assertions, add coverage, run all.

### 3.5 i18n
`t("key")`, all locales, no `.replace()`.

### 3.6 Knowledge evolution
New anti-pattern or technique discovered? Write to `proposed-rules.md` (staging area). Do NOT modify constraint skills directly. Rules graduate to skills only after user approval.

### 3.7 Doc integrity check
If this task changed any `docs/` file, follow the [Doc Integrity Protocol](/kernel/doc-integrity):
1. Content change → follow ripple propagation (update reference docs, deployed copies)
2. Structural change (add/remove component) → follow full propagation checklist
3. Verify `pnpm test` passes (CI-8)

## Stage 4: Fix

Fix all issues from Stages 2-3 (including doc integrity violations). Re-run tests until all pass.

## Stage 5: Refactor Progress

If refactor plan exists: mark completed items, update milestone progress.

## Stage 6: Commit

Stage related files only. Conventional commit. Verify with `git status`.

## Output

```
✅ Implemented: <summary>
✅ Linter: passed / fixed N items
✅ Performance: passed / fixed N items
✅ Self-audit: found N issues, all fixed
✅ Tests: X files, Y tests passing
✅ Evolution: N rules proposed (or N/A)
✅ Refactor: milestone N at X% (or N/A)
✅ Committed: <hash> <message>
```

## Opt-Out Flags

| Flag | Skips | Best for |
|------|-------|----------|
| `quick` | Stages 2, 3.5, 3.6, 5 | Hotfixes, small changes, styling |
| `no-commit` | Stage 6 | Exploration, review before commit |
| `skip-tests` | Stage 3.4 | Pure visual/styling changes |

Flags can be combined: `quick no-commit skip-tests` for minimal pipeline.
