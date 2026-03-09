---
name: archon-error-handling
description: >
  Structured error handling patterns for API routes and client-side code.
  Activate when editing API routes or UI components.
---

# Error Handling

## API Routes (Server)

- Use a structured error class (e.g. `HttpError`) with numeric status codes
- Always validate input before processing
- Always log errors with context (endpoint, params, upstream status)
- Never return raw stack traces to the client

## Client-Side

- User-facing errors: always translated via `t()`, never raw error messages
- Dev-facing errors: include namespace/context prefix for searchability
- Network errors: distinguish timeout vs. server error vs. auth expired

## Prohibitions

- ❌ Empty `catch {}` — at minimum log the error
- ❌ `alert(error.message)` — use toast with translated string
- ❌ Returning `{ error: e }` with the full Error object — serialize to `{ error: e.message }`
- ❌ Exposing internal error details (`stack`, SQL, `env` vars) to the client
