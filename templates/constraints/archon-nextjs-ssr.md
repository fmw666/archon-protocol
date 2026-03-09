---
name: archon-nextjs-ssr
description: >
  Next.js SSR/hydration constraints derived from production incidents.
  Activate when framework is 'next' in archon.config.yaml.
  Deploy via: /archon-init detects Next.js → copies this to skills/.
---

# Next.js SSR & Hydration Safety

## Server vs Client Boundary

- Components in `app/` are Server Components by default — no `useState`, `useEffect`, `onClick`
- Add `"use client"` only to components that NEED browser APIs or interactivity
- Server Components can import Client Components, not vice versa

## Hydration Safety

- Server-rendered HTML must match the initial client render exactly
- Any value that differs between server and client causes a hydration mismatch

### Auth State Pattern

Use a cookie-derived synchronous flag for initial render, async API for full user data:

```typescript
// Synchronous (safe for SSR — derived from cookie, available on server)
const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

// Asynchronous (NOT safe for initial render branching — requires API call)
const { data: user } = useGetCurrentUser({ skip: !isLoggedIn });
```

## Examples

### Correct: SSR-safe conditional rendering

```tsx
// isLoggedIn is derived from cookie (synchronous, same on server + client)
{isLoggedIn ? <DashboardNav /> : <PublicNav />}

// user data used only AFTER it loads (not for top-level branching)
{user && <span>Welcome, {user.name}</span>}
```

### Wrong: hydration mismatch

```tsx
// user is undefined on server (API hasn't been called yet)
// but populated on client → DOM mismatch → hydration error
{user ? <DashboardNav /> : <PublicNav />}
```

## Prohibitions

- ❌ `user ?` / `!user ?` for top-level DOM branching — use `isLoggedIn` (cookie-derived, synchronous)
- ❌ `typeof window !== "undefined"` inside `useMemo` or render — causes hydration mismatch; use `useEffect` for client-only logic
- ❌ `useLayoutEffect` to patch hydration mismatches — it runs after comparison, not before; fix the root cause
- ❌ Accessing `localStorage` or `sessionStorage` during render — wrap in `useEffect` or use a cookie
- ❌ Conditional `useEffect` based on server-only data — effects don't run on server; restructure the data flow
- ❌ `"use client"` on a page-level component that could be a Server Component — push `"use client"` to the leaf
