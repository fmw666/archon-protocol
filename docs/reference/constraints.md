# Constraint Skills Reference

Constraint skills define hard boundaries. They are preloaded into agents or auto-discovered by skill-only tools.

## archon-code-quality

**Activated**: every code change.

### File Size Limits

| File type | Max lines | When exceeded |
|-----------|----------|---------------|
| Page component | 350 | Split into sub-components + hooks |
| Component | 300 | Extract logic to hooks/utils |
| Hook | 200 | Split into focused hooks |
| Utility | 200 | Split by responsibility |
| API route | 150 | Extract to service layer |

### Prohibitions

- ❌ `any` type — use the real type or `unknown`
- ❌ Bare `Object` type — define the shape with properties
- ❌ Empty `catch {}` blocks — at minimum log or rethrow
- ❌ `console.log(error)` as the only error handling
- ❌ Hardcoded user-facing strings when i18n is enabled — use `t("key")`
- ❌ Unused `import` statements
- ❌ Direct state mutation (`.push()`, `.splice()` on state)
- ❌ Duplicate rendering of the same data
- ❌ Magic numbers/strings without `const`

## archon-test-sync

**Activated**: every code change.

### Workflow

1. **Discover** — search `__tests__/<module>.test.*` for every modified file
2. **Assess** — determine which assertions break
3. **Update** — fix assertions, update mocks, add coverage
4. **Verify** — run tests, all must pass

### Prohibitions

- ❌ Changed function signature without searching for `.test.` files
- ❌ Added `.skip` to a failing test
- ❌ Deleted a `.test.` file to hide failures
- ❌ Assumed no tests exist
- ❌ Marked task complete while tests show `FAIL`

## archon-async-loading

**Activated**: editing UI components.

### Requirements

- Every async section: skeleton placeholder while loading
- Three-state display: loading → error → resolved
- Independent error + retry per section
- Off-screen sections: defer with IntersectionObserver

### Prohibitions

- ❌ Single API failure crashes the entire page
- ❌ Showing `0` or `"No data"` while actually loading
- ❌ Firing all API calls on mount regardless of scroll position

## archon-error-handling

**Activated**: editing API routes or UI components.

### Server

- Structured error class with numeric status codes
- Always validate input before processing
- Always log errors with context
- Never return raw stack traces to client

### Client

- User-facing errors: translated via `t()`, never raw messages
- Dev-facing errors: namespace/context prefix for searchability

### Prohibitions

- ❌ Empty `catch {}` — at minimum log the error
- ❌ `alert(error.message)` — use toast with translated string
- ❌ Returning `{ error: e }` with the full Error object
- ❌ Exposing internal error details (`stack`, SQL, `env` vars) to client

## archon-handoff

**Activated**: cross-boundary changes (frontend↔backend, service↔service, session handoff).

### When Required

- Changing an API that a separate frontend/backend consumes
- Defining a new endpoint, webhook, or event schema
- Handing work to another developer, AI session, or team
- Database migration affecting multiple consumers

### Document Format

Create `docs/handoff/<feature-name>.md` with: status checklist, endpoint definitions (request + all response shapes), data contract table, confirmed decisions, open questions, revision history.

### Prohibitions

- ❌ Changing an API `response` shape without updating `docs/handoff/` first
- ❌ Implementing against a chat description without a `docs/handoff/*.md`
- ❌ Leaving `Open Questions` section unresolved before starting implementation
- ❌ Omitting `Response (4xx/5xx)` error shapes from the contract

## Framework-Specific Constraints (Optional)

Deployed by `/archon-init` when a matching framework is detected. Templates live in `templates/constraints/`.

| Template | Framework | Covers |
|----------|-----------|--------|
| `archon-nextjs-ssr` | Next.js | Server Components, hydration safety, auth state patterns |
| `archon-react-hydration` | React, Next.js | State initialization, conditional rendering, mutation sequencing |
