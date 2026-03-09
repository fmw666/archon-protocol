---
name: archon-code-quality
description: >
  Code quality constraints: file size limits, type safety, pure logic extraction,
  and universal prohibitions. Activate on every code change.
---

# Code Quality

## File Size Limits

| File type | Max lines | When exceeded |
|-----------|----------|---------------|
| Page component | 350 | Split into sub-components + hooks |
| Component | 300 | Extract logic to hooks/utils |
| Hook | 200 | Split into focused hooks |
| Utility | 200 | Split by responsibility |
| API route | 150 | Extract to service layer |
| Test file | No limit | Organize with `describe` blocks |

## Type Safety

- All exported functions MUST have parameter and return type annotations
- Shared entity types: define once in a types directory, import everywhere
- Organize types by business domain: `types/common.ts`, `types/users.ts`, `types/billing.ts`
- Cross-domain types go in `common.ts`; new domain = new file
- Never copy `@typedef` or `interface` across files — import from the canonical source

## Pure Logic Extraction

If logic does NOT depend on framework context (hooks, state, props), extract it as a pure function in `utils/` with unit tests.

## Examples

### Correct: typed function with named constants

```typescript
const MAX_RETRY_COUNT = 3;
const TIMEOUT_MS = 5000;

export function fetchWithRetry(url: string, retries: number = MAX_RETRY_COUNT): Promise<Response> {
  return fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) })
    .catch((err: unknown) => {
      if (retries > 0) return fetchWithRetry(url, retries - 1);
      throw err;
    });
}
```

### Correct: immutable state update

```typescript
function addItem(items: readonly Item[], newItem: Item): Item[] {
  return [...items, newItem]; // not items.push(newItem)
}
```

## Prohibitions

- ❌ `any` type — use the real type or `unknown`
- ❌ Bare `Object` type — define the shape with properties
- ❌ Empty `catch {}` blocks — at minimum log or rethrow
- ❌ `console.log(error)` as the only error handling — use structured error reporting
- ❌ Hardcoded user-facing strings when i18n is enabled — use `t("key")`
- ❌ Unused `import` statements — remove them or use the imported binding
- ❌ Direct state mutation (`.push()`, `.splice()` on state) — return new objects
- ❌ Duplicate rendering of the same data — use `memo()` or lift to parent
- ❌ Magic numbers/strings without `const` — extract to named constants
- ❌ Copying `@typedef` or `interface` across files — import from canonical `types/` source
- ❌ Inline type literals for shared entities — define in `types/` directory

## Battle-tested Prohibitions

Project-specific prohibitions derived from production incidents. Stage 3.6 proposes additions here via `proposed-rules.md`. Format:

```
  ❌ <concrete pattern> — <what to do instead>
  [INCIDENT]: <what went wrong in production>
```

_(empty — will be populated as the project evolves through real usage)_
