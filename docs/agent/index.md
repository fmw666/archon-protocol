# Agent Protocol

> For human readers: this section documents how a coding agent installs,
> updates, and maintains Archon in any project by fetching instructions from
> `aaep.site`. Nothing is git-cloned; everything goes through a canonical
> manifest with sha256 verification.

## The one-liner

Tell your coding agent (Cursor, Claude Code, Codex, any frontier model with
web-fetch tools) exactly this:

> **read `aaep.site/skill.md` and install archon**

or, for an existing install:

> **read `aaep.site/skill.md` and update archon** &nbsp;·&nbsp;
> **read `aaep.site/skill.md` and sync archon** &nbsp;·&nbsp;
> **read `aaep.site/skill.md` and uninstall archon**

The agent fetches the skill file, inspects your project, routes to the right
command, fetches the manifest, verifies checksums, and writes the files. You
confirm the plan; the agent executes it. Nothing happens silently.

## What lives at `aaep.site/`

| Path | Content |
|------|---------|
| [`/manifest.json`](https://aaep.site/manifest.json) | Machine-readable file ledger — version, modules, sha256 per file, placeholder catalogue, runtime-ledger protection list. |
| [`/skill.md`](https://aaep.site/skill.md) | Agent entry point — describes all commands and how to pick one based on project state. |
| [`/init.md`](https://aaep.site/init.md) | Alias of `install.md` for users who prefer the word "init". Forwards to install. |
| [`/install.md`](https://aaep.site/install.md) | Step-by-step install protocol for agents (10 steps). |
| [`/update.md`](https://aaep.site/update.md) | Step-by-step update protocol (9 steps, preserves runtime ledgers). |
| [`/sync.md`](https://aaep.site/sync.md) | Read-only health check protocol. |
| [`/uninstall.md`](https://aaep.site/uninstall.md) | Safe-removal protocol with ledger preservation choice. |
| [`/source-files/**`](/source/) | Every file the manifest lists, served at the exact URL the manifest points to. |

All of the above are plain text / JSON served directly by the documentation
site. No GitHub rate limits, no git clone, no authentication required.

## Why agent-first?

1. **Zero-setup**: the user does not install anything. The agent does. If
   your agent can fetch URLs and write files, Archon can install.
2. **Conversational**: the agent asks about your project (tech stack, team
   size, optional modules) and tailors what it installs.
3. **Context-aware**: the agent respects your existing `.cursor/` rules,
   your project's LICENSE, your runtime ledgers. Nothing is overwritten
   silently.
4. **Reversible**: the uninstall protocol is first-class; archiving your
   governance history is the default, not an afterthought.
5. **Offline friendly**: everything is ordinary HTTPS; mirror-able to
   corporate networks by overriding the base URL.

## Why keep a CLI then?

The CLI (`@archon/cli` v1.0.0) does the same thing as the agent protocol,
just without conversation. It consumes the same manifest, same URLs, same
sha256 verification. Use it in CI, in scripts, or when you don't have an
agent available.

See [CLI quickstart](/setup/quickstart) for the human path.

## Lifecycle at a glance

```
     ┌──────────────────────────────────────────────┐
     │  aaep.site/manifest.json  (canonical v1.0.0) │
     │  sha256-keyed file list, 82 files, 14 modules │
     └──────────────────────────────────────────────┘
              ▲                         ▲
              │ fetches                 │ fetches
              │                         │
       ┌──────┴──────┐          ┌───────┴────────┐
       │  Agent      │          │  CLI (archon)  │
       │  install.md │          │  install       │
       │  update.md  │          │  update        │
       │  sync.md    │          │  sync          │
       │  uninstall.md│         │  uninstall     │
       └──────┬──────┘          └───────┬────────┘
              │                         │
              ▼                         ▼
       ┌──────────────────────────────────────────┐
       │        Adopter project (.archon/ +       │
       │        .cursor/ + scripts/ + tools/)     │
       └──────────────────────────────────────────┘
```

## Guarantees

- **Checksum discipline**: every fetched file is verified against the
  manifest's sha256 before writing. Mid-download failures never leave a
  half-installed tree.
- **Runtime ledger protection**: the manifest lists files and directories
  the agent must never overwrite (`drift.md`, `debt.md`, `memos.md`,
  `manifest.md`, `signs.md`, `decisions.md`, their record directories, and
  the dashboard heartbeat store). Once your project owns its governance
  history, Archon upgrades cannot erase it.
- **All-or-nothing writes**: `install` and `update` buffer every verified
  file in memory before writing. You never end up in a partial state.
- **Backups on overwrite**: every `update` writes a `.archon-backup-<ISO>/`
  containing the previous version of every modified file.
- **Two-step deletion**: `uninstall --delete-ledgers` requires typing the
  word `DELETE`. The safe default archives your ledgers.

## Quick links

- Read the agent entry point: [`skill.md`](https://aaep.site/skill.md)
- Browse the manifest: [`manifest.json`](https://aaep.site/manifest.json)
- Human CLI path: [`archon install`](/setup/quickstart)
- Full source: [`/source/`](/source/)
