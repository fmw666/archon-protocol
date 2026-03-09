---
name: archon-async-loading
description: >
  Standardized async data loading: skeleton screens, 3-state display, error retry,
  viewport lazy loading. Activate when editing UI components.
---

# Async Data Loading

## Skeleton Screens

- Every async section MUST show a skeleton placeholder while loading
- Skeleton height/width should approximate real content dimensions to minimize CLS
- Use a shared `<Skeleton />` component — do not inline shimmer styles

## Three-State Value Display

Values fed by async data MUST handle 3 states:

| State | Display |
|-------|---------|
| `loading` | `<Skeleton />` (matches value dimensions) |
| `error` | `"—"` or error indicator |
| `resolved` | Formatted value |

Create a utility like `kpiVal(value, isLoading, isError)` to enforce consistency.

## Error + Retry

Each independent data section MUST handle errors independently:

- Display the error inline within the failed section, not as a full-page error
- Provide a retry button that calls `refetch()` or re-invokes the request
- Other sections continue loading/displaying normally

## Viewport-Triggered Loading

Off-screen sections SHOULD defer API requests until scrolled into view:

- Use `IntersectionObserver` (or a `useInView` hook) with `rootMargin` of `~200px`
- Once loaded, data stays cached — no re-request on scroll-out/scroll-in
- Combine with query `skip` parameter: `skip: !inView`

## Prohibitions

- ❌ Single API failure crashes the entire page — wrap each section with its own `isError` / `refetch` handling
- ❌ Showing `0` or `"No data"` while actually still loading — use skeleton instead
- ❌ Firing all API calls on mount via `useEffect` regardless of scroll position — use `skip: !inView` for off-screen sections
