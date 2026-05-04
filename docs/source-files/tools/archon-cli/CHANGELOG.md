# @archon/cli Changelog

## [1.1.0] — 2026-05-05

### Added
- `archon update` now honors `--with=<list|all|none>` and `--without=<list>`
  to refine the auto-detected module set. Previously `update` was driven
  purely by on-disk detection: an adopter who wanted to drop a previously
  installed optional module (e.g. `cli`, `dashboard`) had no way to express
  that intent without a manual cleanup + re-install.
- `update` now plans **removals** for modules the user opts out of via
  `--without`. Removed files are moved into the same `.archon-backup-<ts>/`
  directory that holds overwrites, and empty parent dirs (`tools/archon-cli/`
  etc.) are pruned. This closes the drift loop: after
  `archon update --without=cli`, `archon sync` reports 0 extra files.
- `archon install` gains a symmetric `--without=<list>` flag (required
  modules are always preserved and `--without=<required>` is ignored with a
  warning). Useful for non-interactive CI scripts.

### Notes
- Required modules are never removable — the contract guarantees that any
  Archon-governed project always ships core soul, contracts, templates,
  domain-lenses, commands, agents, rules, skills, scripts, version, legal.

## [1.0.1] — 2026-05-05

### Fixed
- `archon update` no longer hand-synthesises `.archon/VERSION` after the
  core-version module has already written it. The manual write used `'\n'`
  on all platforms, which drifted from canonical bytes when the upstream
  ships CRLF, causing `archon sync` to immediately report 1 modified file
  after any update. VERSION now flows through the same fetch-verify-write
  path as every other manifest file.

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
