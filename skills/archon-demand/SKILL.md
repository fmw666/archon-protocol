---
name: archon-demand
description: >
  Full delivery loop for a one-line requirement: refactor alignment → implement →
  perf audit → 6-dim self-audit → fix → knowledge evolution → refactor progress → commit.
  Activate when the user provides a feature request, bug fix, or refactor task.
---

# Demand — One-Line Requirement Delivery

Execute all stages. Do not skip unless the user explicitly opts out.

## Stage 0: Refactor Alignment

If `docs/refactor-plan.md` exists, read it. Identify which milestone relates to this requirement. Prefer target architecture patterns during implementation.

## Stage 1: Implement

**Before writing code**: If `archon.config.yaml` declares `benchmarks.primary`, read that module's structure (directory layout, naming, data flow, test patterns). New code should imitate the benchmark — not reinvent patterns.

Write code under all active constraint skills. Follow every `❌` prohibition. Prefer boring consistency with existing modules over locally optimal but novel approaches.

## Stage 1.5: Linter Verification

Run the project's lint command (e.g., `pnpm lint`, `eslint .`). Read the output. Fix all errors that overlap with constraint skill prohibitions. This catches syntactic violations that slipped through generation.

## Stage 2: Performance Audit

Check project perf docs for applicable items:
- List-rendered links: `prefetch={false}`
- Async sections: skeleton + error retry + 3-state values
- No redundant requests
- Off-screen sections: defer with IntersectionObserver

## Stage 3: Self-Audit (6 Dimensions)

### 3.1 Rule compliance
Search modified files for `❌` violations from constraint skills. Recognize `@archon-exception: <ID> — <reason>` annotations as documented exceptions — skip the marked prohibition for that line.

### 3.2 Code structure
File sizes, single responsibility, no circular deps.

### 3.3 Edge cases
null, empty, error, boundary values.

### 3.4 Test sync
Find tests, update assertions, add coverage, run all.

### 3.5 i18n
`t("key")`, all locales, no `.replace()`.

### 3.6 Knowledge evolution
New anti-pattern or technique discovered? Write to `proposed-rules.md` (staging area). Do NOT modify constraint skills directly. Rules graduate to skills only after user approval or passing contradiction tests via `archon-audit`.

## Stage 4: Fix

Fix all issues from Stages 2-3. Re-run tests until all pass.

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

## Opt-Out

- `quick` → skip Stages 2, 3.5, 3.6, 5
- `no-commit` → skip Stage 6
- `skip-tests` → skip Stage 3.4
