# Constraint Skills Reference

> In the OS model, constraint skills are **drivers** — loaded into kernel space via the `skills:` field. Source of truth lives in `docs/drivers/`.

## All Drivers

| Driver | Source | Activated |
|--------|--------|-----------|
| archon-code-quality | [`/drivers/code-quality`](/drivers/code-quality) | Every code change |
| archon-test-sync | [`/drivers/test-sync`](/drivers/test-sync) | Every code change |
| archon-async-loading | [`/drivers/async-loading`](/drivers/async-loading) | UI component edits |
| archon-error-handling | [`/drivers/error-handling`](/drivers/error-handling) | API/component edits |
| archon-handoff | [`/drivers/handoff`](/drivers/handoff) | Cross-boundary changes |

## Quick Summary

### archon-code-quality

File size limits, type safety, pure logic extraction, universal prohibitions.

Key prohibitions:
- ❌ `any` type — use real type or `unknown`
- ❌ Empty `catch {}` — at minimum log or rethrow
- ❌ Direct state mutation — return new objects
- ❌ Magic numbers/strings — extract to named constants

[Full reference →](/drivers/code-quality)

### archon-test-sync

Tests must follow code changes. Structural scan tests for CI.

Key prohibitions:
- ❌ Changed signature without searching for `.test.` files
- ❌ Added `.skip` to a failing test
- ❌ Marked task complete while tests show `FAIL`

[Full reference →](/drivers/test-sync)

### archon-async-loading

Skeleton screens, 3-state display, error retry, viewport lazy loading.

Key prohibitions:
- ❌ Single API failure crashes entire page
- ❌ Showing `0` while actually loading
- ❌ Firing all API calls on mount

[Full reference →](/drivers/async-loading)

### archon-error-handling

Structured errors server-side, translated errors client-side.

Key prohibitions:
- ❌ Empty `catch {}`
- ❌ `alert(error.message)` — use toast
- ❌ Exposing internal details to client

[Full reference →](/drivers/error-handling)

### archon-handoff

Interface contracts for cross-boundary work.

Key prohibitions:
- ❌ Changing API shape without updating handoff doc first
- ❌ Implementing without a handoff document
- ❌ Leaving open questions unresolved

[Full reference →](/drivers/handoff)

## Framework-Specific Drivers (Optional)

Deployed by `/archon-init` when a matching framework is detected. Templates in `templates/constraints/`.

| Template | Framework | Covers |
|----------|-----------|--------|
| `archon-nextjs-ssr` | Next.js | Server Components, hydration safety, auth state patterns |
| `archon-react-hydration` | React, Next.js | State initialization, conditional rendering, mutation sequencing |
