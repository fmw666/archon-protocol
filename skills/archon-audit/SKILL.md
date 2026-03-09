---
name: archon-audit
description: >
  Full project audit: linter, tests, rule compliance, architecture health.
  Produces a scored report (0-100) with prioritized fixes. Does not modify code.
  Activate when the user asks for a project health check.
---

# Audit — Full Project Health Check

Read-only. Do not modify any code. Only observe and report.

## Phase 1: Static Analysis

Run the project's linter. Count errors and warnings.

## Phase 2: Tests

Run the full test suite. Record passed, failed, skipped.

## Phase 3: Rule Compliance

1. Collect all `❌` prohibitions from active rules
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
