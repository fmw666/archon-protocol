---
name: archon-test-runner
description: >
  Find tests affected by code changes, update broken assertions,
  add coverage for new behavior, run until all pass.
  Activate after modifying source files.
---

# Test Runner

Ensure tests match code reality for every modified source file.

## Step 1: Discover

For each file in `git diff --name-only`:
- Search `__tests__/<module>.test.*`
- Check cross-cutting tests that scan `src/`

## Step 2: Assess

| Code Change | Likely Broken Assertion |
|-------------|----------------------|
| API path changed | `toHaveBeenCalledWith("/old/path")` |
| Signature changed | `toHaveBeenCalledWith(oldArgs)` |
| Return shape changed | `toEqual(oldShape)` |
| Import path moved | `vi.mock("@/old/path")` |
| State shape changed | `expect(state.oldField)` |
| Export renamed | `import` in test breaks |

## Step 3: Update

- Fix broken assertions to match new behavior
- Update mocks if API contract changed
- Add test cases for new behavior
- NEVER `.skip` or delete tests to hide failures

## Step 4: Run

Execute test runner (e.g. `vitest run <file>`). Repeat until all pass.

## Output

```
Tests: N files found, M updated, X passed, Y failed → [ALL PASS | NEEDS FIX]
```
