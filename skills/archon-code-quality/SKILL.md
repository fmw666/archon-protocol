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

## Pure Logic Extraction

If logic does NOT depend on framework context (hooks, state, props), extract it as a pure function in `utils/` with unit tests.

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
