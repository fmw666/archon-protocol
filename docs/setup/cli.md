# Archon CLI

> **Status:** v0.1.0 preview (placeholder package name `@archon/cli` — the final name on npm is not yet decided).
>
> This is a thin, in-repo CLI that packages the three operations Archon adopters
> care about: `init`, `doctor`, and `export`. It currently runs from a checkout
> of the Archon source repo (the Distilgent host project); self-contained
> distribution via `npm create archon` / `npx` is the next milestone.

## Install (local dev)

```bash
# From the Archon repo root
npm link ./tools/archon-cli
# You now have `archon` on PATH
archon --version
```

Or run without linking:

```bash
node tools/archon-cli/bin/archon.mjs --help
```

## Commands

### `archon init &lt;target-dir&gt;`

Scaffolds a new Archon-governed project.

```bash
archon init ../my-new-project --platform=cursor
archon init ../claude-project --platform=claude-code --overwrite
archon init ./demo --dry-run    # show the plan, no files written
```

Output includes the six `.archon/` state files (manifest/drift/debt/memos/decisions + soul),
the platform-scoped `.cursor/` or `.claude/` tree (commands · agents · rules · skills),
portable helpers (`scripts/archon-check.py`, `scripts/archon-run-state.mjs`, ...),
bundled reference docs, and a post-init banner reminding the adopter which manifest
sections to fill before the first `/archon` run.

### `archon doctor [project-dir]`

Audits an Archon-governed project across three layers:

- **L1 Structural** — required files exist (`soul.md`, `manifest.md`, `drift.md`,
  `debt.md`, `memos.md`, `decisions.md`, `VERSION`, platform directory).
- **L2 Contract** — delegates to `scripts/archon-check.py` (the portable
  governance-contract guard). Pass `--python=&lt;path&gt;` to pick a specific
  interpreter.
- **L3 Hints** — cheap readability signals: remaining template placeholders,
  missing `Validation Command`, empty sections.

Exit code is `0` when all checks pass, `1` when any L1 or L2 failure is
detected. Warnings alone do not fail the command.

```bash
archon doctor .
archon doctor ../my-project --python=python3
```

### `archon export &lt;output-dir&gt;`

Emits a standalone Archon kit (same behavior as `npm run archon:export` inside
the source repo). Useful when you want a ready-to-copy kit rather than
scaffolding directly into a project.

```bash
archon export ./archon-kit-v0.1.0 --platform=cursor --overwrite
archon export ./archon-claude --platform=claude-code
```

## Shared flags

- `--platform=&lt;cursor|claude-code&gt;` — which platform's command/agent/rule/skill
  layout to materialize (default: `cursor`).
- `--overwrite` — allow replacing an existing target directory.
- `--dry-run` — print the plan without writing files (supported by `init` and
  `export`).
- `--source=&lt;path&gt;` — pin the Archon source repo location (otherwise walks up
  from `cwd` looking for `.archon/VERSION` + `scripts/export-archon-core.mjs`).
- `--help`, `-h` — show usage.
- `--version`, `-v` — print CLI version.

## Exit codes

| Code | Meaning |
|------|---------|
| 0    | Success (or dry-run plan printed) |
| 1    | Invalid arguments, missing source repo, export/doctor failure |

## Versioning

The CLI's own version (from `tools/archon-cli/package.json`) is reported by
`archon --version`. The version of the governance kit itself (the material that
`init` and `export` land) is read from `.archon/VERSION` at runtime and printed
in every command's banner.

## Not yet supported

- Self-contained npm distribution (the CLI still needs access to the
  `docs/archon/templates/` and `scripts/` in the Archon source repo). Planned
  for v0.2.0.
- Interactive prompts (everything is flag-driven today for CI compatibility).
- Custom-named sub-agents or lens curation during `init`.
