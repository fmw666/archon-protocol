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
contract-checked file structure under `.archon/` plus an IDE binding directory
(see §3 below). After install the agent — not the user — owns governance
hygiene.

Full concepts: https://aaep.site/concepts/

---

## 2. Available commands

When the user says any of these, fetch and follow the matching instruction
file:

| User intent (examples) | Fetch and follow |
|------------------------|------------------|
| "install archon", "set up archon", "add archon to this project", "init archon", "initialise archon" | `https://aaep.site/install.md` (or `init.md`, an alias) |
| "update archon", "upgrade archon", "pull latest archon" | `https://aaep.site/update.md` |
| "check archon", "is archon healthy", "any drift from canonical", "sync archon" | `https://aaep.site/sync.md` |
| "remove archon", "uninstall archon" | `https://aaep.site/uninstall.md` |

> ### Important — first-time vs subsequent invocations
>
> The very first time a user asks to install Archon, the local agent does **not**
> know what Archon is. The user's prompt **must** include a URL so you can fetch
> this skill file. Examples that work as the user's very first sentence:
>
> - `read https://aaep.site/skill.md and install archon`
> - `read https://aaep.site/init.md and install archon`
> - `fetch https://aaep.site/skill.md, then install archon in this project`
>
> After Archon is installed, `.cursor/rules/archon-wake.mdc` (or its
> platform-equivalent — see §3) is loaded into the agent's context on every
> session, so subsequent invocations no longer require the URL: phrases like
> *"hi archon, update yourself"* or *"sync archon"* will route correctly. If you
> are reading this file, you are presumably running on **first-time** path; tell
> the user explicitly that future commands will be shorter.

Every instruction file is self-contained: it tells you exactly which files to
fetch, how to write them into the project, what to ask the user, and how to
verify the result.

---

## 3. Detect the IDE platform

Archon is **platform-neutral**. The framework core under `.archon/` is the
same regardless of which AI coding IDE you use; only the **binding directory**
(rules / agents / commands / skills) differs.

Inspect the project to detect the platform — in this priority order:

| Signal in `$PROJECT_ROOT` | Platform | Binding root |
|---------------------------|----------|--------------|
| `.cursor/` exists | Cursor | `.cursor/` |
| `.codex/` or `AGENTS.md` exists | OpenAI Codex CLI | `.codex/` |
| `.claude/` or `CLAUDE.md` exists | Claude Code | `.claude/` |
| `.continue/` exists | Continue | `.continue/` |
| `.aider.conf.yml` or `.aider/` exists | Aider | `.aider/` |
| `.windsurf/` exists | Windsurf | `.windsurf/` |
| None of the above | Ask the user | (user picks one) |

Record the detected `$IDE_PLATFORM` and `$BINDING_ROOT`. Every subsequent
instruction file uses these instead of hardcoded `.cursor/`.

If the user is on a coding agent that doesn't have a dedicated binding
directory convention (e.g. raw API clients, custom harnesses), default to
`.cursor/` because the markdown content is human-readable in any editor; tell
the user that the bindings will not auto-load and they may need to copy the
content into their agent's prompt-config manually.

> **Mapping note**: at the time of writing, the canonical manifest's
> `commands/agents/rules/skills` modules ship `.cursor/`-pathed files. For
> non-Cursor platforms, rewrite the path prefix on write only. The file
> contents themselves are platform-neutral markdown.

---

## 4. How to start: always inspect the project first

Before picking a command, inspect the project state. Use your file-reading
tools to check for these signals:

| Signal | Meaning |
|--------|---------|
| `.archon/soul.md` exists | Archon is already installed |
| `.archon/VERSION` file exists | Read it to learn installed version |
| `.archon/soul.md` missing, but `.archon/` directory exists | Partial install — prefer `sync.md` to diagnose |
| No `.archon/` at all | Fresh install — use `install.md` |
| `$BINDING_ROOT/` exists with user's own rules/skills/etc. | Archon files coexist here; never delete user content, only add / update Archon-prefixed files |

Then fetch `https://aaep.site/manifest.json` once — this is the canonical list
of every file Archon ships, including sha256 checksums, module grouping, and
placeholder declarations. Use it as the source of truth for what to download,
verify, and write.

```
GET https://aaep.site/manifest.json
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

Archon does not require Node.js, Python, or any specific language runtime to
be installed for the install/update/sync/uninstall protocols themselves — you
fetch JSON and markdown over HTTPS, parse them in your agent runtime, and
write files. Only **two** project-level operations need a runtime, and they
are decided per project (see §5):

- The **portable contract checker** (Python) used as a pre-commit hook.
- The **optional** Archon CLI / dashboard modules (Node ≥ 18).

---

## 5. Detect the project language for the pre-commit hook

After the install protocol writes the framework files, you will help the user
wire a pre-commit hook that runs Archon's portable contract checker. The
checker's reference implementation is **Python** (`scripts/archon-check.py`,
zero stdlib-only deps). A POSIX shell wrapper is also shipped
(`scripts/archon-check.sh`) for users who prefer to invoke via Bash.

Inspect the project to pick the right hook command:

| Signal | Recommended hook command |
|--------|--------------------------|
| `python` / `python3` available, any project | `python3 scripts/archon-check.py --root .` |
| Bash on Unix, no Python preference | `sh scripts/archon-check.sh .` (delegates to python3 internally) |
| Windows with Python via `py` launcher | `py -3 scripts\archon-check.py --root .` |
| Project has no Python and won't install one | Skip the pre-commit hook; recommend running `archon sync` manually before commits |

The checker is intentionally Python-stdlib-only so it runs on any modern OS
without `pip install`. If the project's language is Go, Rust, Java, C++, etc.
— that has no bearing on the hook; it just needs Python on the developer's
machine.

> Archon does **not** ship a Node implementation of the checker (an
> `archon-check.mjs` does not exist in the manifest). If you see prose
> recommending one, that's stale documentation — file an issue.

---

## 6. Personalised recommendations

After inspecting the project, offer the user a **tailored plan** rather than
executing blindly. Example recommendations:

### For a fresh install

> I'll install Archon v{VERSION} into this project. The 11 required modules
> (soul, commands, agents, rules, skills, scripts, domain lenses, contracts,
> templates, version, legal — ~60 files) are always included. Optional
> modules I'll ask about:
>
> - **Archon CLI** (`tools/archon-cli/`, requires Node ≥ 18) — useful if you
>   want to run `archon doctor` without an agent. Skip if agent-only or no
>   Node.
> - **Local dashboard** (`.archon/dashboard/`, requires Node ≥ 18) — browser
>   UI for ledgers. Skip if no Node.
> - **Demand-pool extension** (`.archon/extensions/demand-pool/`) — backlog
>   queue for pending work. Useful for team workflows.
>
> I detected your IDE as **{{IDE_PLATFORM}}**, binding root: `{{BINDING_ROOT}}`.
> Your project language: **{{LANGUAGE}}**. The pre-commit hook will use
> `{{HOOK_COMMAND}}`.
>
> Before I start, I need a few values:
>
> - Project name? (will appear in identity files)
> - Primary tech stack? (shapes governance lens hints)
> - Owner GitHub handle? (optional)
>
> Fetch-and-write plan: ~60 files totalling ~X KB. I'll verify every file
> against the manifest's sha256 before writing.

> **After writing**, I won't hand you an empty manifest: I'll run a read-only
> codebase self-scan and pre-fill `.archon/manifest.md` (tech stack, directory
> map, product-term glossary candidates, source-modularity seeds) from the
> shipped templates — and, if this is a monorepo, propose path-scoped manifest
> slices. See `install.md` §7b.

### For an update

> You're on Archon v{INSTALLED}, canonical is v{CANONICAL}. I'll:
>
> - Diff your installed files against the manifest and list which framework
>   files will be updated.
> - **Never touch** your runtime ledgers (debt.md, drift.md, memos.md,
>   manifest.md, signs.md, decisions.md, and their records / archive
>   directories). These are owned by your project.
> - Write a drift record after the update so there's a trail.

### For a sync (health check)

> I'll inspect your `.archon/` plus the Archon-owned files under
> `{{BINDING_ROOT}}` (the IDE binding directory) and compare each file's
> sha256 against the canonical manifest. Anything missing, modified, or added
> will be reported. No writes — just diagnosis.

### For uninstall

> I'll list every Archon-owned file and ask which to remove. Runtime ledgers
> and records (your project's history) will be archived to
> `.archon-history-<timestamp>/` unless you tell me otherwise.

---

## 7. Context-aware skipping

The manifest lists **14 modules**; not every project needs every one. Skip or
ask about these based on project context:

- Skip **CLI module** (`tools/archon-cli/`) if the user says "agent-only", or
  the user has no Node ≥ 18.
- Skip **Dashboard module** (`.archon/dashboard/`) if there's no Node runtime
  or the user doesn't want a local server.
- Skip **demand-pool extension** if the user is a solo operator.
- Skip individual **domain-lens tools** (the 16 files under
  `.archon/domain-lenses/tools/`) that don't fit the project's domain — for
  instance, a backend-only project may skip the `design/` lens tools. When in
  doubt, include them; they are small markdown files.

---

## 8. Mandatory agent behaviour

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
6. **Always rewrite path prefixes for non-Cursor IDEs** — when writing a file
   whose canonical path begins with `.cursor/`, rewrite to
   `$BINDING_ROOT/<remainder>` if `$IDE_PLATFORM ≠ cursor`. Never write a
   `.cursor/` directory on a non-Cursor project.
7. **Refuse ambiguous requests**. If the user says "install archon" but
   `.archon/` already exists and is populated, ask whether they want
   `update`, `sync`, or a forced re-install.
8. **Do not invent** — if the manifest does not contain a file you think
   should exist, report it as a manifest bug; do not fabricate file
   contents.

---

## 9. Fallback: the Archon CLI

If the user prefers non-agent tooling, `@archon/cli@latest` implements the
same commands programmatically. **Requires Node ≥ 18** — for users without
Node, the agent path described in this file is the only path.

```bash
npx @archon/cli@latest install        # or update / sync / doctor / uninstall
```

The CLI consumes the same `manifest.json`, so agent and CLI paths stay in
lock-step. Instruct the user accordingly if they prefer scripted operation,
e.g. for CI.

---

## 10. When in doubt

Read the full concepts first:

- `https://aaep.site/concepts/introduction` — what Archon is and why it
  exists.
- `https://aaep.site/concepts/architecture` — how the pieces fit.
- `https://aaep.site/concepts/user-journeys` — 16 AI-coding pitfalls
  Archon is designed to fix.

Then come back here and proceed.
