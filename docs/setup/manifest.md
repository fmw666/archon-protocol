# Canonical Manifest

The manifest is the **single source of truth** for what constitutes a valid
Archon installation. It is published live at:

> [`https://aaep.site/manifest.json`](https://aaep.site/manifest.json)

Both the agent protocol and the CLI consume this file. No other ledger is
authoritative; if a file is not in the manifest, it is **not part of Archon**.

## Schema: `archon.manifest/v1`

```jsonc
{
  "schema": "archon.manifest/v1",
  "version": "0.1.0",                      // canonical framework version
  "generated_at": "2026-05-05T…",
  "base_url": "https://aaep.site",
  "source_root": "docs/source-files/",

  "docs": {
    "skill":     "https://aaep.site/skill.md",
    "install":   "https://aaep.site/install.md",
    "update":    "https://aaep.site/update.md",
    "sync":      "https://aaep.site/sync.md",
    "uninstall": "https://aaep.site/uninstall.md"
  },

  "runtime_ledger_paths": {
    "files":       [".archon/debt.md", ".archon/drift.md", ".archon/manifest.md", "..."],
    "directories": [".archon/debt/", ".archon/drift/", ".archon/runs/", "..."]
  },

  "placeholders": {
    "PROJECT_NAME": { "description": "...", "required": true, "example": "Acme" },
    "TECH_STACK":   { "description": "...", "required": true, "example": "Node.js + React" },
    "DOMAIN":       { "description": "...", "required": false, "example": "saas-platform" },
    "OWNER":        { "description": "...", "required": true, "example": "Acme Inc." },
    "PROJECT_SLUG": { "description": "...", "required": false, "derived_from": "PROJECT_NAME" }
  },

  "totals": { "modules": 14, "files": 82 },

  "modules": [
    {
      "id": "core-soul",
      "title": "Cognitive core (soul)",
      "description": "The soul defines who the agent is: identity, cognitive loop, ...",
      "required": true,
      "file_count": 11,
      "files": [
        {
          "path":   ".archon/soul.md",                              // where to write
          "url":    "https://aaep.site/source-files/.archon/soul.md", // where to fetch
          "sha256": "abcdef...",
          "bytes":  12345,
          "placeholders": ["PROJECT_NAME"]  // present only when the file contains tokens
        }
        // ... more files
      ]
    }
    // ... more modules
  ]
}
```

## Modules

The current manifest ships 14 modules — 11 required, 3 optional.

| id | Required? | What it is |
|----|:---------:|------------|
| `core-soul` | ✓ | `.archon/soul.md` + mode extensions |
| `core-contracts` | ✓ | `governance-contract.yaml` |
| `core-templates` | ✓ | `run.template.md` + `run-state.schema.json` |
| `core-version` | ✓ | `.archon/VERSION` |
| `domain-lenses` | ✓ | 5 lenses + 16 decision tools |
| `commands` | ✓ | Cursor commands (`archon`, `archon-plan`, …) |
| `agents` | ✓ | Sub-agents (`archon-reviewer`, `archon-capture-auditor`) |
| `rules` | ✓ | Always-on rules (`archon.mdc`, wake, heartbeat) |
| `skills` | ✓ | Keyword/file-triggered skills |
| `scripts` | ✓ | Python / Bash / Node portable helpers |
| `legal` | ✓ | LICENSE + NOTICE |
| `cli` | optional | Archon CLI source (`tools/archon-cli/`) |
| `dashboard` | optional | Local observability UI |
| `extensions-demand-pool` | optional | Backlog queue extension |

Required modules are always installed. Optional modules are opt-in via
`--with=<list>` or interactive prompt.

## Why publish a manifest instead of a tarball?

1. **Transparent** — a human can `cat manifest.json | jq` and see exactly
   what the framework ships. No opaque compressed blob.
2. **Partial updates** — agents and the CLI fetch only the files that differ
   between current and canonical, not the whole framework.
3. **Checksum-first** — sha256 in the manifest means even a mid-download
   truncation is caught before writing.
4. **Module granularity** — opt in or out of optional modules per file.
5. **Mirror-friendly** — override `base_url` via `--base-url=` or
   `ARCHON_BASE_URL` and host a private mirror. The JSON is small (< 100 KB
   even at full file count).

## How the manifest is generated

The manifest is regenerated on every doc-site build via
[`scripts/build-manifest.mjs`](https://github.com/fmw666/archon-protocol/blob/main/scripts/build-manifest.mjs)
in the `archon-protocol` repo. It scans `docs/source-files/`, computes
sha256 per file, identifies `{{PLACEHOLDER}}` tokens, and writes:

- `docs/public/manifest.json` (served at `/manifest.json`)
- `docs/public/source-files/**` (mirrors raw bytes for agents/CLI to fetch)

Version comes from `.archon/VERSION` in the source tree.

## Schema versioning

`archon.manifest/v1` is stable. If a future `v2` schema ships, it will be
served at a different URL (`manifest-v2.json`) and old agents/CLIs will
continue to work against `manifest.json` (= v1) until they explicitly opt
in.

## Inspecting the live manifest

```bash
curl -s https://aaep.site/manifest.json | jq '.totals, .modules[].id'
```

Or browse the JSON directly:
[`https://aaep.site/manifest.json`](https://aaep.site/manifest.json)

## Related

- [Install protocol](/setup/install) — how the manifest is consumed on first install.
- [Update protocol](/setup/update) — how diffs against the manifest become an update plan.
- [Sync protocol](/setup/sync) — how the manifest powers the drift health check.
