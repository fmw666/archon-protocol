---
name: archon-react-hydration
description: >
  React hydration and state management constraints from production incidents.
  Activate when framework is 'react' or 'next' in archon.config.yaml.
---

# React Hydration & State Safety

## State Initialization

- State derived from external sources (URL params, cookies, localStorage) must handle the server case
- Initial state must be deterministic — same input → same output on server and client

## Conditional Rendering Safety

Never branch top-level DOM structure on values that differ between server and client:

| Safe for branching | Unsafe for branching |
|-------------------|---------------------|
| Props passed from server | `window.innerWidth` |
| Cookie-derived flags | `localStorage.getItem()` |
| URL pathname/params | `navigator.userAgent` |
| Static config | API response (not yet fetched on server) |

## State Mutation Sequencing

When multiple stores or dispatches interact, ensure correct ordering:

```typescript
// WRONG: clearing auth without clearing local state creates infinite loop
dispatch(clearAuth());

// CORRECT: clear local state first, then server state
clearLocalAuth();
dispatch(clearAuth());
```

## Examples

### Correct: safe conditional with fallback

```tsx
function UserGreeting({ isLoggedIn }: { isLoggedIn: boolean }) {
  const { data: user } = useGetUser({ skip: !isLoggedIn });
  return (
    <div>
      {isLoggedIn ? (
        <span>{user?.name ?? <Skeleton width={80} />}</span>
      ) : (
        <LoginButton />
      )}
    </div>
  );
}
```

## Prohibitions

- ❌ `dispatch(clearAuth())` without `clearLocalAuth()` first — creates infinite redirect loop
- ❌ Conditional array spread `[...isAdmin ? adminRoutes : []]` without null guard — crashes if undefined
- ❌ `useMemo` with `typeof window` check — value differs between server and client render
- ❌ Inline `new Date()` in render for display — differs between server and client; pass as prop or use `useEffect`
