# Changelog

Archon's version history across three timelines: the **framework itself**, the **CLI**, and the **architecture decisions** that drove each major change.

## Pages

- [Framework Changelog](/changelog/framework) — every release of the portable governance kit (files shipped by `export-archon-core.mjs`).
- [Archon CLI Changelog](/changelog/cli) — `tools/archon-cli/` release history.
- [ADR Timeline](/changelog/adr-timeline) — architectural decisions in chronological order with "what changed" summaries.

## Versioning

Archon uses a single `MAJOR.MINOR.PATCH` version recorded in `.archon/VERSION` and echoed into every standalone export package:

- **MAJOR** — breaking changes to the governance contract, file layout, or wake protocol that require adopters to migrate manually.
- **MINOR** — new mechanisms, new ADRs, new skills, or new domain lenses added in a backward-compatible way.
- **PATCH** — documentation fixes, template clarifications, bug fixes in portable helpers, visual asset updates.

Current version: **v0.1.0** (first tagged release). See [Framework Changelog](/changelog/framework) for the release notes.
