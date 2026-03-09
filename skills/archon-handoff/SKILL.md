---
name: archon-handoff
description: >
  Interface contract and handoff documentation for cross-boundary work.
  Activate when changes span frontend/backend, multiple services, or
  when another AI/human will continue the work. Ensures precise data
  contracts and revision history survive context boundaries.
---

# Handoff & Interface Contracts

When work crosses a boundary (frontend↔backend, service↔service, AI↔human, session↔session), create a handoff document that preserves the exact contract.

## When to Create a Handoff Document

- Changing an API that a separate frontend/backend consumes
- Defining a new endpoint, webhook, or event schema
- Handing work to another developer, AI session, or team
- Database migration that affects multiple consumers

## Handoff Document Structure

Create as `docs/handoff/<feature-name>.md`:

```markdown
# Handoff: <Feature Name>

## Status
- [ ] Contract defined
- [ ] Frontend implementation
- [ ] Backend implementation
- [ ] Integration tested

## Endpoints

### POST /api/example
Request:
  ```json
  { "field": "string", "count": 0 }
  ```
Response (200):
  ```json
  { "id": "string", "created_at": "ISO8601" }
  ```
Response (400):
  ```json
  { "error": "string" }
  ```

## Data Contract
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| field | string | yes | max 255 chars |
| count | number | yes | >= 0 |

## Confirmed Decisions
- <decision 1>
- <decision 2>

## Open Questions
- <question needing resolution>

## Revision History
| Rev | Date | Author | Changes |
|-----|------|--------|---------|
| 1 | YYYY-MM-DD | <who> | Initial contract |
```

## Prohibitions

- ❌ Changing an API `response` shape without updating `docs/handoff/` first — contract must lead implementation
- ❌ Implementing against a chat description without a `docs/handoff/*.md` — create the handoff doc first
- ❌ Leaving `Open Questions` section unresolved before starting implementation — resolve or escalate
- ❌ Omitting `Response (4xx/5xx)` error shapes from the contract — document every status code
