# Archon — Agent Skill Protocol

You are an AI coding agent. A user has asked you to install, update, sync, or
inspect **Archon** — a session-based AI engineering governance framework — in
their project. This file is the entry point: read it first, then branch to the
appropriate command file.

All files under `https://aaep.site/` are the canonical distribution. You will
fetch content from there rather than cloning a git repository.

---

## 1. What Archon is (one-paragraph primer)

Archon turns you from a "tool that follows instructions" into an **engineering
owner** with full project accountability. It gives the AI agent a persistent
identity (`soul.md`), a governed lifecycle (plan → demand → review), a set of
ledgers the agent is responsible for keeping up to date (`manifest.md`,
`drift.md`, `debt.md`, `memos.md`, `signs.md`, `decisions.md`), and a
contract-checked file structure under `.archon/` + `.cursor/`. After install
the agent — not the user — owns governance hygiene.

Full concepts: https://aaep.site/concepts/

---

## 2. Available commands

When the user says any of these, fetch and follow the matching instruction
file:

| User intent (examples) | Fetch and follow |
|------------------------|------------------|
| "install archon", "set up archon", "add archon to this project" | `https://aaep.site/install.md` |
| "update archon", "upgrade archon", "pull latest archon" | `https://aaep.site/update.md` |
| "check archon", "is archon healthy", "any drift from canonical", "sync archon" | `https://aaep.site/sync.md` |
| "remove archon", "uninstall archon" | `https://aaep.site/uninstall.md` |

Every instruction file is self-contained: it tells you exactly which files to
fetch, how to write them into the project, what to ask the user, and how to
verify the result.

---

## 3. How to start: always inspect the project first

Before picking a command, inspect the project state. Use your file-reading
tools to check for these signals:

| Signal | Meaning |
|--------|---------|
| `.archon/soul.md` exists | Archon is already installed |
| `.archon/VERSION` file exists | Read it to learn installed version |
| `.archon/soul.md` missing, but `.archon/` directory exists | Partial install — prefer `sync.md` to diagnose |
| No `.archon/` at all | Fresh install — use `install.md` |
| `.cursor/` directory exists with user's own rules/skills | Archon files coexist here; never delete user content, only add / update Archon-prefixed files |
| `package.json` exists with `"type": "module"` | Node tooling available |
| No Node.js / no `package.json` | Archon still works; the CLI is optional |

Then fetch `https://aaep.site/manifest.json` once — this is the canonical list
of every file Archon ships, including sha256 checksums, module grouping, and
placeholder declarations. Use it as the source of truth for what to download,
verify, and write.

```
curl -sSL https://aaep.site/manifest.json
```

The manifest's schema is `archon.manifest/v1`. Key fields:

- `version` — canonical framework version (e.g. `"0.1.0"`).
- `base_url` — always `"https://aaep.site"`.
- `docs` — URLs of the five agent-facing instruction files.
- `runtime_ledger_paths` — files and directories you **must not** overwrite on
  update. These are owned by the adopter project.
- `placeholders` — map of `{{PLACEHOLDER}}` tokens with description, whether
  required, and examples.
- `modules` — 14 groups (core-soul, domain-lenses, commands, agents, rules,
  skills, scripts, cli, dashboard, extensions, …). Each file entry has
  `path` (where to write it in the adopter project), `url` (where to fetch
  it), `sha256`, and optional `placeholders`.

---

## 4. Personalised recommendations

After inspecting the project, offer the user a **tailored plan** rather than
executing blindly. Example recommendations:

### For a fresh install

> I'll install Archon v{VERSION} into this project. The core modules (soul,
> commands, agents, rules, skills, scripts, domain lenses, contracts,
> templates — 11 required modules, ~60 files) are always included. Optional
> modules I'll ask about:
> - **Archon CLI** (`archon` command in `tools/archon-cli/`) — useful if you
>   want to run `archon doctor` without an agent. Skip if agent-only.
> - **Local dashboard** (`.archon/dashboard/`) — browser UI for ledgers. Skip
>   if you don't run local Node servers.
> - **Demand-pool extension** (`.archon/extensions/demand-pool/`) — backlog
>   queue for pending work. Useful for team workflows.
>
> Before I start, I need a few values to seed the identity files:
> - Project name? (will appear in `soul.md` identity block)
> - Primary tech stack? (shapes governance lens hints)
> - Owner GitHub handle? (optional)
>
> Fetch-and-write plan: ~60 files totalling ~X KB. I'll verify every file
> against the manifest's sha256 before writing.

### For an update

> You're on Archon v{INSTALLED}, canonical is v{CANONICAL}. I'll:
> - Diff your installed files against the manifest and list which framework
>   files will be updated.
> - **Never touch** your runtime ledgers (debt.md, drift.md, memos.md,
>   manifest.md, signs.md, decisions.md, and their records/archive
>   directories). These are owned by your project.
> - Write a drift record after the update so there's a trail.

### For a sync (health check)

> I'll inspect your `.archon/` + Archon-owned files under `.cursor/` and
> compare each file's sha256 against the canonical manifest. Anything missing,
> modified, or added will be reported. No writes — just diagnosis.

### For uninstall

> I'll list every Archon-owned file and ask which to remove. Runtime ledgers
> and records (your project's history) will be backed up to
> `.archon-backup-<timestamp>/` unless you tell me otherwise.

---

## 5. Context-aware skipping

The manifest lists **14 modules**; not every project needs every one. Skip or
ask about these based on project context:

- Skip **CLI module** (`tools/archon-cli/`) if the project has no `tools/`
  folder tradition or the user says "agent-only".
- Skip **Dashboard module** (`.archon/dashboard/`) if there's no Node runtime
  or the user doesn't want a local server.
- Skip **demand-pool extension** if the user is a solo operator.
- Skip individual **domain-lens tools** (the 16 files under
  `.archon/domain-lenses/tools/`) that don't fit the project's domain — for
  instance, a backend-only project may skip the `design/` lens tools. When in
  doubt, include them; they are small markdown files.

---

## 6. Mandatory agent behaviour

1. **Never silently overwrite**. If a target path exists and will change,
   summarise the diff and ask before writing.
2. **Never touch runtime ledger paths** listed in `manifest.runtime_ledger_paths`.
3. **Always verify sha256** of downloaded bytes against the manifest before
   writing.
4. **Always write `.archon/VERSION`** to match the manifest's `version` field.
5. **Always log the session** once done: append a short drift record to
   `.archon/drift.md` (creating the file if needed) describing: `install`,
   `update`, or `uninstall`, the version, the module set applied, and the
   user-supplied placeholder values.
6. **Refuse ambiguous requests**. If the user says "install archon" but
   `.archon/` already exists and is populated, ask whether they want
   `update`, `sync`, or a forced re-install.
7. **Do not invent** — if the manifest does not contain a file you think
   should exist, report it as a manifest bug; do not fabricate file
   contents.

---

## 7. Fallback: the Archon CLI

If the user prefers non-agent tooling, `archon@latest` implements the same
commands programmatically. One-liner install:

```bash
npx archon install          # or update / sync / doctor / uninstall
```

The CLI consumes the same `manifest.json`, so agent and CLI paths stay in
lock-step. Instruct the user accordingly if they prefer scripted operation.

---

## 8. When in doubt

Read the full concepts first:
- `https://aaep.site/concepts/introduction` — what Archon is and why it
  exists.
- `https://aaep.site/concepts/architecture` — how the pieces fit.
- `https://aaep.site/concepts/user-journeys` — 16 AI-coding pitfalls
  Archon is designed to fix.

Then come back here and proceed.
