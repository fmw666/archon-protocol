# Archon Protocol — Documentation Site

VitePress-powered documentation site for the **Archon engineering governance framework**.

- 🔗 Live site: https://aaep.site (current CNAME — may be re-pointed later)
- 🧬 Framework source: mirrored into [`docs/source-files/`](docs/source-files/) and rendered under `/source/*` on the site.

## What's inside

The site has five top-level sections:

| Nav | Path | What it covers |
|-----|------|----------------|
| **Core Concepts** | `/concepts/` | Identity · cognitive loop · 16 user journeys · architecture reference · ADRs · drift / model-vs-harness / workflow deep dives |
| **Install & Boot** | `/setup/` | 5-minute quickstart · full setup guide · `archon` CLI · state templates · dashboard PRD |
| **Full Source** | `/source/` | Every shipped Archon file (82 files across soul, commands, agents, rules, skills, domain-lenses, contracts, templates, scripts, CLI, dashboard, extensions), mirrored from [`docs/source-files/`](docs/source-files/) via VitePress snippet imports |
| **Testing** | `/testing/` | Test strategy · representative samples · how to run the gate chain in an adopter project |
| **Changelog** | `/changelog/` | Framework changelog · CLI changelog · ADR timeline |

## Develop locally

```bash
npm install
npm run docs:dev       # dev server (auto-reload)
npm run docs:build     # production build → docs/.vitepress/dist
npm run docs:preview   # preview production build locally
```

## Sync from the authoring repo (one command)

The Archon framework is **authored** inside the `Distilgent` project (its
reference host). When framework files change there, re-sync the docs site by
running one command from this repo root:

```bash
npm run sync                          # pulls from ../Distilgent by default
npm run sync -- --src=E:/Distilgent   # explicit path
npm run sync:dry                      # preview what would change
```

What `sync` does, in order:

1. **Mirror**: copy every Archon source file from the authoring repo into
   `docs/source-files/`, following the rule table in
   [`scripts/sync-archon-source.mjs`](scripts/sync-archon-source.mjs). Any
   file in `docs/source-files/` that no longer matches an upstream rule is
   removed so the mirror stays a true reflection.
2. **Regenerate wrappers**: run `scripts/generate-source-pages.mjs` to
   produce one `/source/**/*.md` wrapper per file. Wrapper paths are derived
   by convention (with small overrides for URL ergonomics) so adding a new
   source file only requires editing the mirror rules, never the generator.
3. **Lint**: run `scripts/lint-links.mjs` to catch any broken internal links
   introduced by the sync.

When the authoring repo grows a new Archon-owned file category (for example,
a new `.cursor/rules/archon-*.mdc` or a new domain-lens tool), edit
`MIRROR_RULES` in `scripts/sync-archon-source.mjs` to describe it. That file
is the **single source of truth** for what the docs site promises to ship.

### What the sync intentionally does NOT copy

These live in the authoring repo but are considered project-private runtime
state, not framework material:

- `.archon/debt.md`, `drift.md`, `manifest.md`, `memos.md`, `signs.md`, `decisions.md` (active ledgers)
- `.archon/debt/items/*`, `.archon/drift/records/*`, `.archon/memos/records/*`, `.archon/*/archive/*`
- `.archon/dashboard/heartbeats/*` (per-project heartbeat logs)
- `.archon/extensions/*/demands.md` entries — only the extension contract (`extension.md`) and the file's schema are mirrored.

Adopters will generate their own versions of these when they run
`archon init` or the cognitive loop writes its first record.

## Other scripts

| Script | Purpose |
|--------|---------|
| `lint-links.mjs` | Verify every internal `](...)` link resolves to an existing file. Runs in CI. |
| `generate-source-pages.mjs` | (Re)generate the `/source/*.md` wrapper pages from `docs/source-files/`. Called by `sync`. |
| `fix-migrated-links.mjs` | One-off helper: rewrite legacy Distilgent-relative links (`../images/archon/...`) to site-absolute paths. |
| `escape-inline-code-brackets.mjs` | One-off helper: escape `<token>` inside inline-code spans so the VitePress/Vue compiler does not misparse them as HTML. |

## License

Archon framework: Apache-2.0 (see `docs/source-files/LICENSE`).
