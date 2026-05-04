# Archon CLI

> **Status:** v1.0.0 — manifest-driven.
>
> The CLI now consumes `https://aaep.site/manifest.json` and fetches every
> framework file over HTTPS, verifying sha256 before writing. No local checkout
> of the Archon source repo is required.

## Install

```bash
npx @archon/cli@latest --help
# or pin it:
npm i -g @archon/cli
archon --help
```

## Five lifecycle commands

### `archon install [target-dir]`

Fresh install. Fetches the canonical manifest, verifies every file, writes
atomically, seeds empty runtime ledgers, and logs the install to
`.archon/drift.md`.

```bash
archon install                         # install into cwd
archon install ./my-new-project
archon install --with=all              # include every optional module
archon install --with=cli,dashboard    # specific optional modules
archon install --with=none --yes       # required modules only, no prompts
archon install --dry-run               # show the plan
```

### `archon update [project-dir]`

Upgrades an existing installation. Preserves runtime ledgers (drift, debt,
memos, manifest, signs, decisions — files and record directories). Every
overwrite is backed up to `.archon-backup-<ISO>/`.

```bash
archon update
archon update --force                  # re-verify + rewrite even if versions match
archon update --dry-run
```

### `archon sync [project-dir]`

Read-only health check: diffs the installed files against canonical by
sha256. Reports `ok / modified / missing / extra / ledgers` counts per
module.

```bash
archon sync
archon sync --json                     # machine-readable
```

### `archon doctor [project-dir]`

Four-layer audit:

- **L1 Structural** — required files exist (soul, manifest, drift, debt, …).
- **L2 Contract** — delegates to `scripts/archon-check.py`.
- **L3 Hints** — manifest placeholder / validation-command readability.
- **L4 Canonical** — diffs against `aaep.site/manifest.json`. Skip with `--offline`.

```bash
archon doctor
archon doctor --offline
```

### `archon uninstall [project-dir]`

Safely removes Archon-owned files. Runtime ledgers are **preserved in place**
by default. Other options:

```bash
archon uninstall                       # preserve ledgers (safe default)
archon uninstall --archive-ledgers     # move ledgers to .archon-history-<ISO>/
archon uninstall --delete-ledgers      # DELETE governance history (requires typing "DELETE")
archon uninstall --dry-run
```

## Shared flags

| Flag | Purpose |
|------|---------|
| `--base-url=<url>` | Override manifest source (also `ARCHON_BASE_URL`). |
| `--yes`, `-y` | Skip interactive prompts. |
| `--force` | Force re-install / re-verify. |
| `--dry-run` | Print the plan without writing. |
| `--json` | Machine-readable output (`sync` only). |
| `--offline` | Skip L4 canonical diff (`doctor` only). |
| `--with=<list\|all\|none>` | Optional module selection (`install` only). |
| `--archive-ledgers` / `--delete-ledgers` | Ledger handling (`uninstall` only). |
| `--help`, `-h` | Show usage. |
| `--version`, `-v` | Print CLI version. |

## Aliases and legacy

- `archon init <target-dir>` — alias for `archon install <target-dir>`. The
  legacy `--platform=<cursor\|claude-code>` flag is ignored (a single
  canonical surface is shipped).
- `archon export <output-dir>` — authoring-side tool: packages a
  distributable kit from a local Archon source checkout. Adopters should not
  need this.

## Agent alternative

Agents don't need the CLI at all. They can read
[`https://aaep.site/skill.md`](https://aaep.site/skill.md) and follow the
agent-facing instruction files (`install.md`, `update.md`, `sync.md`,
`uninstall.md`). Every action corresponds 1:1 to a CLI subcommand; use
whichever path fits the environment.

## Exit codes

| Code | Meaning |
|------|---------|
| 0    | Success |
| 1    | Invalid arguments, network failure, sha256 mismatch, doctor failure |

## Versioning

`archon --version` reports the CLI's own version.
`.archon/VERSION` records the installed framework version.
`aaep.site/manifest.json` reports the canonical framework version.
