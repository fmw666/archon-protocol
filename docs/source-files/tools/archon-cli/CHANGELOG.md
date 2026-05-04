# @archon/cli Changelog

## [0.1.0] — 2026-05-04

Initial preview release. Placeholder npm package name; the final name will be
decided before the first public release.

### Added
- `archon init <target-dir>` — scaffold a new Archon-governed project via the
  in-repo export pipeline, with a post-init banner listing the 4 first-touch
  tasks (manifest fill-in, ADR-1 replacement, validation-command wiring,
  quickstart read).
- `archon doctor [project-dir]` — three-layer audit: L1 structural file
  presence, L2 `scripts/archon-check.py` delegation, L3 manifest placeholder
  and validation-command hints.
- `archon export <output-dir>` — thin wrapper around
  `scripts/export-archon-core.mjs`, reusing the same DOC_FILE_MAP / PLATFORM_FILES
  / TEMPLATE_FILE_MAP single source of truth.
- Shared flags: `--platform`, `--overwrite`, `--dry-run`, `--source`,
  `--python` (doctor only), `--help`, `--version`.
- Source-root auto-discovery that walks up from `cwd` looking for
  `.archon/VERSION` + `scripts/export-archon-core.mjs`.

### Known limits
- Requires a checkout of the Archon source repo (no self-contained npm
  distribution yet).
- No interactive prompts — flag-driven only.
