# Archon Protocol — Documentation Site

VitePress-powered documentation + distribution site for the **Archon
engineering governance framework**.

- 🌐 Live: https://aaep.site
- 🤖 Agent entry: <https://aaep.site/skill.md>
- 📜 Canonical manifest: <https://aaep.site/manifest.json>
- 🧬 Raw source files: <https://aaep.site/source-files/…>

## Role

This repo is the **canonical source of truth** for Archon. Everything
adopter projects install — `.archon/`, IDE binding directories
(`.cursor/` / `.claude/` / `.codex/` / `.continue/` / `.aider/` /
`.windsurf/`), `scripts/` (Python + Bash, no Node), `tools/archon-cli/`
(optional, Node ≥ 18), the dashboard reference UI (optional, Node ≥ 18),
the demand-pool extension, LICENSE, NOTICE — lives under
[`docs/source-files/`](docs/source-files/).

Adopter projects (including `Distilgent`, the reference host) **pull**
from this repo:

- **Agent path** (preferred, no Node needed): user tells their coding agent
  *"read aaep.site/skill.md and install archon"* on first install → agent
  fetches the manifest, sha256-verifies, writes files. Works with any
  coding agent that has web-fetch + write tools (Cursor, Claude Code,
  OpenAI Codex CLI, Continue, Aider, Windsurf, …). After install, the
  installed wake rule routes subsequent commands without the URL.
- **CLI path** (optional, requires Node ≥ 18): `npx @archon/cli@latest install`
  — same manifest, same verification, scripted.

Nothing in `docs/source-files/` is generated from another repo. Edit
here.

## Five entry points on the site

| Nav | Path | Purpose |
|-----|------|---------|
| **Core Concepts** | `/concepts/` | Identity · cognitive loop · 16 user journeys · architecture · ADRs · deep dives. |
| **Install & Boot** | `/setup/` | Agent-first install, complete lifecycle (install · update · sync · uninstall), CLI, state templates, dashboard PRD. |
| **Full Source** | `/source/` | Every shipped file (~87), rendered from `docs/source-files/` via snippet imports. |
| **Testing** | `/testing/` | Test strategy · contract checkers · how to run the gates in your project. |
| **Changelog** | `/changelog/` | Framework changelog · CLI changelog · ADR timeline. |

## Develop locally

```bash
npm install
npm run docs:dev       # dev server (auto-rebuilds manifest + source pages)
npm run build          # production build → docs/.vitepress/dist/
npm run docs:preview   # preview production build locally
```

The `prebuild` step runs before every build:

1. `scripts/build-manifest.mjs` — scans `docs/source-files/`, computes sha256
   for every file, buckets them into modules, emits
   `docs/public/manifest.json`, and mirrors the raw bytes into
   `docs/public/source-files/` so the published site serves them at the URL
   the manifest advertises.
2. `scripts/generate-source-pages.mjs` — creates one wrapper markdown page
   per source file under `docs/source/` so human visitors can browse them.

## Repo layout

```
archon-protocol/
├── docs/
│   ├── public/                    # served at site root (generated + checked-in)
│   │   ├── manifest.json            ← aaep.site/manifest.json (generated)
│   │   ├── skill.md · install.md …  ← agent-facing instructions (checked-in)
│   │   ├── source-files/…           ← raw bytes of every shipped file (generated)
│   │   └── images/…                 ← comic illustrations
│   ├── source-files/              # CANONICAL — edit here
│   │   ├── .archon/…
│   │   ├── .cursor/…                ← canonical paths (rewritten on write
│   │   │                              for non-Cursor IDEs)
│   │   ├── scripts/…                ← Python + Bash (no Node)
│   │   ├── tools/archon-cli/…       ← optional CLI (Node ≥ 18)
│   │   ├── LICENSE
│   │   └── NOTICE
│   ├── concepts/ · setup/ · testing/ · changelog/ · source/
│   └── .vitepress/
└── scripts/
    ├── build-manifest.mjs         # scan source-files → manifest.json + mirror
    ├── generate-source-pages.mjs  # create /source/**/*.md wrappers
    └── lint-links.mjs             # verify every internal link resolves
```

## Editing flows

### Adding a new framework file

1. Write the file under the appropriate path inside `docs/source-files/`
   (e.g. `.archon/domain-lenses/tools/dev/new-tool.md`).
2. If it should belong to a specific module, update `MODULE_DEFS` in
   `scripts/build-manifest.mjs`; otherwise it will land in the `misc`
   bucket.
3. Run `npm run build`. The manifest, the public mirror, and the wrapper
   pages regenerate automatically.
4. If the file needs a custom sidebar entry or URL alias, edit
   `docs/.vitepress/config.ts` and `OVERRIDES` inside
   `scripts/generate-source-pages.mjs`.

### Shipping a new framework version

1. Bump `docs/source-files/.archon/VERSION` to the new semver.
2. Write a `docs/changelog/framework.md` entry.
3. Build. The manifest picks up the new version automatically.

### Adding a placeholder-aware file

1. Use `{{PLACEHOLDER_NAME}}` inside the file (uppercase, underscore
   separated).
2. Add an entry to `placeholderCat` inside `scripts/build-manifest.mjs` so
   agents know how to ask the user for the value.
3. Build; the manifest exposes the catalogue + which files use each
   placeholder.

## Not in scope here

- Adopter-side runtime state (`drift.md`, `debt.md`, `memos.md`, record
  directories, dashboard heartbeat store, demand-pool demands). These live
  in each adopter project and are never touched by updates.

## License

Archon framework: Apache-2.0. See [`docs/source-files/LICENSE`](docs/source-files/LICENSE).
