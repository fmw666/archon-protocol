# @archon/cli Changelog

## [1.0.0] — 2026-05-05

**Architectural shift**: the CLI no longer requires a checkout of the Archon
source repo. Every lifecycle command now consumes
[`https://aaep.site/manifest.json`](https://aaep.site/manifest.json) as the
single source of truth: files are fetched over HTTPS, sha256-verified, and
written atomically. Adopters can `npx @archon/cli install` into an empty
directory with zero git operations.

### Added
- `archon install [target-dir]` — fresh install driven by the canonical
  manifest. Interactive prompt for optional modules (`cli`, `dashboard`,
  `extensions-demand-pool`). `--with=<list|all|none>` to select non-interactively.
- `archon update [project-dir]` — upgrade an installed project to canonical.
  Preserves runtime ledgers. Backs up every overwritten file to
  `.archon-backup-<ISO>/`.
- `archon sync [project-dir]` — read-only diff vs canonical. `--json` for
  machine-readable output.
- `archon uninstall [project-dir]` — safe removal. `--archive-ledgers` (default:
  preserve in place), `--delete-ledgers` (destructive, two-step confirm).
- `archon doctor` — now includes an L4 canonical-diff layer in addition to the
  existing L1 structural / L2 contract / L3 hints layers. Skip with `--offline`.
- Shared `--base-url=<url>` flag + `ARCHON_BASE_URL` env var override for
  mirror deployments and local development.

### Changed
- `archon init` is now an alias for `archon install`. The `--platform=<cursor|claude-code>`
  flag is deprecated and ignored (the canonical distribution ships the
  `.cursor/` surface directly; other agent families reuse it as-is).
- `archon doctor` no longer requires a local source checkout for its L1–L3
  layers; L4 adds a canonical diff.

### Deprecated
- `archon export <output-dir>` — kept for authoring-side use (packaging a
  distributable kit from a local Archon source). Adopters should not call this.

## [0.1.0] — 2026-05-04

Initial preview release. Source-copy-based init / doctor / export. Required a
local Archon source checkout. See v1.0.0 notes for the replacement model.
