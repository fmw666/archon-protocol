---
outline: deep
---

# /archon-audit

> **`stat()` — Read-only project health check, scored 0-100.**

Full project health audit across 5 dimensions. Does NOT modify code.

**Preloads drivers**: archon-code-quality, archon-test-sync

## Phase 1: Static Analysis

Run the project's linter. Count errors and warnings.

## Phase 2: Tests

Run the full test suite. Record passed, failed, skipped.

## Phase 3: Rule Compliance

1. Collect all `❌` prohibitions from constraint skills (preloaded in your context)
2. Search ALL source files for violations
3. Report: file, line, which prohibition

## Phase 4: Architecture Health

- Files exceeding size limits
- Source files with no matching test
- Circular dependencies
- Stale documentation references

## Phase 5: Score (0-100)

| Dimension | Weight |
|-----------|--------|
| Lint | 20% |
| Tests | 25% |
| Rule compliance | 25% |
| Architecture | 20% |
| Documentation | 10% |

## Output

```
Project Audit: XX/100
  Lint: N errors, M warnings
  Tests: X passed, Y failed
  Rules: N violations
  Architecture: N issues

Top Priorities:
  1. [CRITICAL] ...
  2. [HIGH] ...
```
