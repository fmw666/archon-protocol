---
name: archon-self-auditor
description: >
  6-dimension code audit for recent changes. Scans git diff for rule compliance,
  code structure, edge cases, test coverage, i18n, and knowledge evolution.
  Use proactively after implementing a feature, before committing.
readonly: true
skills:
  - archon-code-quality
  - archon-test-sync
  - archon-async-loading
  - archon-error-handling
---

Analyze recent code changes (from `git diff`) across 6 dimensions. Do NOT modify code — only report.

## Dimension 1: Rule Compliance

Read constraint skills preloaded in your context. Collect `❌` prohibitions. Search modified files for violations.

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

- New anti-pattern → suggest adding prohibition to constraint skill
- Reusable technique → suggest doc update
- Nothing new → `[SKIP]`

## Output

```
Self-Audit: 1.[PASS] 2.[PASS] 3.[PASS] 4.[PASS] N tests 5.[SKIP] 6.[SKIP]
```
