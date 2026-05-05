---
title: "01 · install-cursor-node"
test_id: install-cursor-node
fixture: fixtures/sandbox-node-ts
ide: Cursor
language: Node 20 + TypeScript
stage: install
status: pending
---

# 01 · install-cursor-node

## What this scenario proves

The most common adoption shape: a developer with a fresh
**Vite/Next/Express-style Node + TypeScript repo** opens **Cursor** and
asks the agent to install Archon. The agent follows
[`aaep.site/install.md`](https://aaep.site/install.md), detects Cursor
as `IDE_PLATFORM`, lays the binding under `.cursor/`, picks the
`husky`-based pre-commit hook, and produces a tree that passes
`scripts/archon-check.py` on the first run.

Failure here means Archon is broken on its #1 target stack.

## Test environment

| | |
|---|---|
| Fixture | [`fixtures/sandbox-node-ts`](https://github.com/fmw666/archon-protocol/tree/main/fixtures/sandbox-node-ts) |
| IDE | Cursor (latest stable) |
| OS | macOS 14 / Ubuntu 22.04 / Windows 11 + WSL2 |
| Archon source | `https://aaep.site/manifest.json` |
| Manifest version under test | v0.1.0 |
| Language toolchain | Node 20.11+, npm 10+ |

## Pre-conditions

1. Cursor is signed in and the agent has web-fetch + write tools.
2. Fixture copied: `cp -r fixtures/sandbox-node-ts /tmp/archon-test-01`.
3. `cd /tmp/archon-test-01 && git init && git add . && git commit -m "init"`.
4. `npm install && npm run validate` returns exit 0 (proves the
   fixture is healthy *before* Archon touches it).

## Steps

```text
1. Open /tmp/archon-test-01 in Cursor.
2. Open the chat panel (⌘L / Ctrl+L).
3. Paste exactly:
     read aaep.site/skill.md and install archon
4. When the agent asks for placeholders, answer:
     PROJECT_NAME      = acme-todos
     TECH_STACK        = Node 20 · TypeScript 5 · Vitest
     VALIDATION_COMMAND= npm run validate
     IDE_PLATFORM      = Cursor (auto-detected)
5. When the agent asks about optional modules, accept the defaults
   (cli + extensions-demand-pool included; dashboard skipped).
6. When the agent asks about the pre-commit hook, accept "husky".
7. Wait for the "install complete" summary line.
```

## Expected outcome

| Check | Expected |
|-------|----------|
| Agent self-report | "install complete · v0.1.0 · 0 placeholders unfilled" |
| `.archon/VERSION` | `v0.1.0` |
| `.archon/soul.md` line count | ≤ cap declared in manifest |
| `.archon/drift.md` rows | 0 |
| `.cursor/commands/archon.md` present | yes |
| `.cursor/rules/archon-wake.mdc` present | yes |
| `.husky/pre-commit` calls `python3 scripts/archon-check.py --root .` | yes |
| `python3 scripts/archon-check.py --root .` exit code | 0 |
| `npm run validate` exit code (post-install) | 0 |
| `git status` shows only Archon-tracked files added | yes |

## Demo recordings

<VideoPlaceholder test-id="install-cursor-node" />

<AsciinemaPlaceholder test-id="install-cursor-node" />

## Run records

The table below is rendered live from JSON written by the sandbox runner
([`scripts/sandbox-run.mjs`](https://github.com/fmw666/archon-protocol/blob/main/scripts/sandbox-run.mjs))
under `docs/testing/sandbox/runs/install-cursor-node/`. To add a new row, run

```bash
node scripts/sandbox-run.mjs --only=install-cursor-node
```

<RunRecords test-id="install-cursor-node" />


## Known limitations

- Does not exercise the Cursor "rules reload" UI step beyond asking
  the agent to confirm the wake rule is loaded; verifying that Cursor
  actually surfaces the wake rule on next session is out of scope
  (UI state, not file state).
- Does not test what happens if `aaep.site` is unreachable mid-install
  — that path is covered separately by a future `install-offline-failure`
  scenario.

## Cross-references

- Protocol page: [`/setup/install`](/setup/install)
- Agent file: [`https://aaep.site/install.md`](https://aaep.site/install.md)
- Fixture: [`fixtures/sandbox-node-ts`](https://github.com/fmw666/archon-protocol/tree/main/fixtures/sandbox-node-ts)
- Sibling scenarios: 02 (Claude+Python), 03 (Codex+Go), 04 (Aider+Rust)
- Follow-on scenarios: 05, 07, 08, 09, 10, 12

<!-- sandbox-spec:start -->

```json
{
  "runnable": "cli",
  "fixture": "fixtures/sandbox-node-ts",
  "ide_platform": "cursor",
  "prerequisites": [],
  "steps": [
    {
      "name": "archon install",
      "cli": "install",
      "flags": [
        "--with=cli"
      ]
    }
  ],
  "assertions": [
    {
      "file_exists": ".archon/VERSION"
    },
    {
      "file_exists": ".archon/soul.md"
    },
    {
      "file_exists": ".archon/manifest.md"
    },
    {
      "dir_exists": ".cursor/commands"
    },
    {
      "dir_exists": ".cursor/rules"
    },
    {
      "dir_exists": ".cursor/skills"
    },
    {
      "file_exists": ".cursor/commands/archon.md"
    },
    {
      "dir_exists": "tools/archon-cli"
    },
    {
      "file_exists": "scripts/archon-check.py"
    },
    {
      "file_contains": {
        "path": ".archon/VERSION",
        "substr": "0.1"
      }
    }
  ]
}
```

<!-- sandbox-spec:end -->
