---
name: archon-test-sync
description: >
  When source code changes, corresponding tests MUST be found, updated, and verified.
  Prevents silent regressions. Activate on every code change.
---

# Test Sync Guard

## Workflow

### 1. Discover

For every source file to be modified, search for matching tests:
- `__tests__/<moduleName>.test.*`
- `*.test.*` or `*.spec.*` in the same directory
- Cross-cutting static analysis tests that scan `src/`

### 2. Assess Impact

| Change | Likely broken assertions |
|--------|------------------------|
| API path changed | `toHaveBeenCalledWith("/old/path")` |
| Signature changed | `toHaveBeenCalledWith(oldArgs)` |
| Return shape changed | `toEqual(oldShape)` |
| Import path moved | `vi.mock("@/old/path")` |
| State shape changed | `expect(state.oldField)` |
| Behavior changed | Any assertion on that behavior |
| Export renamed/removed | `import` in test file |

### 3. Update

- Update assertions to match new behavior
- Update mocks if API contract changed
- Add test cases for new behavior
- NEVER delete or `.skip` a test to hide failures

### 4. Verify

Run all affected test files. Task is NOT complete until all pass.

## Prohibitions

- ❌ Changed function signature without searching for `.test.` files that import it
- ❌ Added `.skip` to a failing test instead of fixing the assertion
- ❌ Deleted a `.test.` file to eliminate failures — fix the assertions instead
- ❌ Assumed no tests exist — always search `__tests__/` first
- ❌ Marked task complete while tests still show `FAIL`
