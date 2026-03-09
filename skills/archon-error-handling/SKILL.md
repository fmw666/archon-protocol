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

## Examples

### Correct: server-side structured error

```typescript
export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await db.findUser(req.params.id);
    if (!user) throw new HttpError(404, "User not found");
    res.json(user);
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500;
    logger.error("[GET /api/users]", { id: req.params.id, err });
    res.status(status).json({ error: err.message });
  }
});
```

### Correct: client-side user-facing error

```typescript
try {
  await updateProfile(data);
} catch (err: unknown) {
  toast.error(t("profile.update_failed"));
  logger.error("[Profile:update]", err);
}
```

## Prohibitions

- ❌ Empty `catch {}` — at minimum log the error
- ❌ `alert(error.message)` — use toast with translated string
- ❌ Returning `{ error: e }` with the full Error object — serialize to `{ error: e.message }`
- ❌ Exposing internal error details (`stack`, SQL, `env` vars) to the client

## Battle-tested Prohibitions

Project-specific prohibitions from production incidents. Format: `❌ <pattern> — <fix> [INCIDENT]: <what broke>`

_(empty — populated via Stage 3.6 → proposed-rules.md → user approval)_
