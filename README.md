# Archon Protocol — Documentation Site

VitePress-powered documentation site for the **Archon engineering governance framework**.

🔗 Live site: https://aaep.site (current CNAME — may be re-pointed later)
🧬 Framework source: mirrored into `docs/source-files/` and rendered under `/source/*` on the site.

## What's inside

The site has five top-level sections:

| Nav | Path | What it covers |
|-----|------|----------------|
| **Core Concepts** | `/concepts/` | Identity · cognitive loop · 16 user journeys · architecture reference · ADRs · drift / model-vs-harness / workflow deep dives |
| **Install & Boot** | `/setup/` | 5-minute quickstart · full setup guide · `archon` CLI · state templates · dashboard PRD |
| **Full Source** | `/source/` | Every shipped Archon file, mirrored from [`docs/source-files/`](docs/source-files/) via VitePress snippet imports |
| **Testing** | `/testing/` | Test strategy · representative samples · how to run the gate chain in an adopter project |
| **Changelog** | `/changelog/` | Framework changelog · CLI changelog · ADR timeline |

## Develop locally

```bash
npm install
npm run docs:dev       # dev server (auto-reload)
npm run docs:build     # production build → docs/.vitepress/dist
npm run docs:preview   # preview production build locally
```

## Maintenance scripts

The `scripts/` folder carries three migration helpers and one link linter:

- `lint-links.mjs` — checks every internal `](...)` link resolves to an existing file.
- `generate-source-pages.mjs` — (re)generates the `/source/*.md` wrapper pages from `docs/source-files/`.
- `fix-migrated-links.mjs` — rewrites legacy Distilgent-relative links (`../images/archon/...` etc.) to site-absolute paths. Idempotent; run after any bulk re-sync from the Distilgent authoring repo.
- `escape-inline-code-brackets.mjs` — escapes `<token>` inside inline-code spans so the VitePress / Vue template compiler does not misparse them as HTML.

```bash
npm run lint                         # link lint
npm run migrate:source-pages         # regenerate /source/*.md wrappers
npm run migrate:fix-links            # rewrite legacy relative links
npm run migrate:escape-brackets      # escape <foo> in inline code
```

## Sync from the Distilgent authoring repo

The Archon framework is authored inside the `Distilgent` project (its reference
host). When framework files change there, re-sync by:

1. Copy `docs/archon/*` → appropriate site locations (see `scripts/generate-source-pages.mjs` for the mapping).
2. Copy `.archon/`, `.cursor/commands`, `.cursor/agents`, `.cursor/rules/archon*`, `.cursor/skills/archon-*`, `scripts/archon-*`, `tools/archon-cli/` → `docs/source-files/`.
3. Copy `docs/images/archon/*` → `docs/images/`.
4. Run `npm run migrate:fix-links && npm run migrate:escape-brackets && npm run docs:build`.
5. `npm run lint` — verify no broken internal links.

## License

Archon framework: Apache-2.0 (see `docs/source-files/LICENSE`).
