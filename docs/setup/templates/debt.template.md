# Technical Debt Registry

> Deferral is acceptable; forgetting is not. This hot index keeps every active debt gate visible; full rationale lives in `.archon/debt/archive/&lt;year&gt;-Q&lt;N&gt;.md`.
> Before milestone closure, all items with `milestone-close` deadline must be `resolved`.

## Rules

- Hot rows must retain `ID`, `Severity`, `Deadline`, and `Status` for mechanical gates.
- Keep descriptions compact; put full rationale in the archive row referenced by `Details`.
- Remove `resolved` items during the next delivery close-out; git history and archive retain the record.

## Archive Index

| Archive | Period | Rows | Keywords | Load When |
|---------|--------|------|----------|-----------|

## Active Debt Index

<!-- no-active-debt -->

| ID | Source | Severity | Compact Description | Deadline | Status | Details |
|----|--------|----------|---------------------|----------|--------|---------|
