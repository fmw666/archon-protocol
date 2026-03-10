---
outline: deep
---

# archon-self-auditor

> **`watchdogd` — 6-dimension code audit daemon. Spawned by `/archon-demand` Stage 3.**

Analyzes recent code changes (from `git diff`) across 6 dimensions. Read-only — does NOT modify code, only reports.

**Preloads drivers**: archon-code-quality, archon-test-sync, archon-async-loading, archon-error-handling, archon-handoff

## Dimension 1: Rule Compliance

Read constraint skills preloaded in your context. Collect `❌` prohibitions. Search modified files for violations. Recognize `@archon-exception: <ID> — <reason>` annotations as documented exceptions — skip the marked prohibition for that line and include exceptions in the report.

## Dimension 2: Code Structure

- [ ] Pure logic extracted to testable utility functions
- [ ] Files within size limits (page: 350, component: 300, hook: 200)
- [ ] No circular dependencies
- [ ] Single responsibility per module

## Dimension 3: Edge Cases

- [ ] `null` / `undefined` inputs handled
- [ ] Empty arrays / objects handled
- [ ] Error states (API failure, timeout)
- [ ] Loading vs refetch distinction
- [ ] Boundary values (0, negative, very large)

## Dimension 4: Test Coverage

1. Search `__tests__/` for tests matching modified files
2. Check if existing assertions are broken
3. Check if new behavior lacks coverage
4. Report findings

## Dimension 5: i18n (skip if not configured)

- [ ] New user-facing strings use `t("key")`
- [ ] Keys exist in all locale files
- [ ] No `.replace()` on translated strings

## Dimension 6: Knowledge Evolution

- New anti-pattern → write proposed prohibition to `proposed-rules.md`
- Reusable technique → write proposed update to `proposed-rules.md`
- Nothing new → `[SKIP]`

Do NOT modify constraint skills directly. Proposed rules require user approval.

## Output

```
Self-Audit: 1.[PASS] 2.[PASS] 3.[PASS] 4.[PASS] N tests 5.[SKIP] 6.[SKIP]
```
