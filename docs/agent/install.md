# Agent Install Protocol

This is the human-readable view of [`aaep.site/install.md`](https://aaep.site/install.md),
the step-by-step protocol a coding agent follows to install Archon into a
fresh project.

> Agents: don't read this page; fetch `aaep.site/install.md` as plain text.
> This page is for humans reviewing what the agent will do.

## When the agent applies this protocol

The user says something like:

- "install archon in this project"
- "add archon governance"
- "set up archon"

and there is no existing `.archon/` tree (or the user explicitly asks for a
forced re-install).

## The 10 steps

1. **Verify fresh install** — refuse if `.archon/soul.md` or `.archon/VERSION`
   already exists, unless `--force`.
2. **Fetch the manifest** — `GET https://aaep.site/manifest.json`. Parse
   schema, record version, module list, placeholder catalogue, runtime-ledger
   paths.
3. **Inspect project & propose module selection** — include all required
   modules (core-soul, commands, agents, rules, skills, scripts, domain
   lenses, contracts, templates, legal). Ask about optional modules (CLI,
   dashboard, demand-pool extension). Present the plan before downloading.
4. **Collect placeholder values** — PROJECT_NAME, TECH_STACK, DOMAIN, OWNER,
   derived PROJECT_SLUG. Store as `$PLACEHOLDERS`.
5. **Fetch every file and verify** — parallel fetch, sha256-check against the
   manifest, substitute placeholders, buffer in memory. Abort on any checksum
   mismatch; do not partial-write.
6. **Write files** — create parent directories, write buffered bytes. Fail
   loudly on unexpected collisions (indicates you're not in a fresh install).
7. **Seed runtime ledgers** — create empty but valid `.archon/manifest.md`,
   `drift.md`, `debt.md`, `memos.md`, `signs.md`, `decisions.md`; create empty
   `drift/records/`, `debt/items/`, `memos/records/` directories with
   `.gitkeep` placeholders. Write `.archon/VERSION` from manifest.
8. **Install Cursor surface** — write `.cursor/commands/`, `.cursor/agents/`,
   `.cursor/rules/`, `.cursor/skills/archon-*` verbatim. Coexist with user's
   existing `.cursor/` content; never delete non-Archon files.
9. **Log the install** — append a drift record: version, agent name, modules,
   file count, placeholder values, manifest URL.
10. **Report summary** — concise list of what happened + next steps
    (`hi archon` to wake, browse `/concepts/`, run `archon doctor`).

## Guardrails the agent must enforce

- Never write outside the target project root.
- Never write paths not in the manifest (except the runtime ledgers + `.gitkeep`).
- Always verify sha256 before writing.
- Always keep user's own `.cursor/` files intact.
- Install is all-or-nothing: every file verifies, or nothing is written.

## The CLI equivalent

```bash
npx @archon/cli@latest install ./my-project
npx @archon/cli@latest install --with=all --yes   # no prompts, everything
npx @archon/cli@latest install --dry-run          # show the plan
```

See the [CLI reference](/source/cli/README) for every flag.

## Raw source

The agent-facing instruction file (verbatim):
[`https://aaep.site/install.md`](https://aaep.site/install.md)
