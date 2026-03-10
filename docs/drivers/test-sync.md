---
outline: deep
---

# archon-test-sync

> **FS integrity driver — activated on every code change.**

When source code changes, corresponding tests MUST be found, updated, and verified. Prevents silent regressions.

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

### 5. Structural Scan Tests

Beyond unit tests, projects SHOULD maintain structural scan tests that statically analyze the entire codebase for prohibited patterns. These run in CI and catch violations regardless of who wrote the code.

**When to create**: When a prohibition is too critical to rely on AI self-checking alone, or when a production incident revealed a pattern that must NEVER reappear.

**Template**:

```javascript
import { readdirSync, readFileSync } from "fs";

function scanFiles(dir, pattern) {
  // recursively find source files, read content, match pattern
}

describe("Structural: <constraint name>", () => {
  it("no files use <prohibited pattern>", () => {
    const violations = scanFiles("src/", /<regex for pattern>/);
    expect(violations).toEqual([]);
  });
});
```

## Examples

### Correct: updating test after signature change

```typescript
// Source changed: getUser(id) → getUser(id, options?)
// Before:
expect(getUser).toHaveBeenCalledWith("user-1");
// After:
expect(getUser).toHaveBeenCalledWith("user-1", expect.any(Object));
```

### Correct: adding coverage for new behavior

```typescript
// Source added: getUser now throws on invalid ID
it("throws on empty ID", () => {
  expect(() => getUser("")).toThrow("ID must not be empty");
});
```

## Prohibitions

- ❌ Changed function signature without searching for `.test.` files that import it
- ❌ Added `.skip` to a failing test instead of fixing the assertion
- ❌ Deleted a `.test.` file to eliminate failures — fix the assertions instead
- ❌ Assumed no tests exist — always search `__tests__/` first
- ❌ Marked task complete while tests still show `FAIL`

## Battle-tested Prohibitions

Project-specific prohibitions from production incidents. Format: `❌ <pattern> — <fix> [INCIDENT]: <what broke>`

_(empty — populated via Stage 3.6 → proposed-rules.md → user approval)_
