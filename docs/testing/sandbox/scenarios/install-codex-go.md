---
title: "03 · install-codex-go"
test_id: install-codex-go
fixture: fixtures/sandbox-go
ide: OpenAI Codex CLI
language: Go 1.22
stage: install
status: pending
---

# 03 · install-codex-go

## What this scenario proves

Archon installs cleanly on the **smallest possible adopter shape** —
a Go project whose entire manifest is `go.mod` plus a few `.go` files,
driven by the **OpenAI Codex CLI** running in a terminal split.

Three things are simultaneously verified:

1. The agent detects `IDE_PLATFORM = codex` from `AGENTS.md` /
   `.codex/` signals and rewrites paths to `.codex/`.
2. With no Node and no Python pre-commit framework available by
   default, the agent falls back to the **plain `.git/hooks/pre-commit`
   shell script** option.
3. The validate command is `go test ./... && go vet ./...` — proving
   the manifest's `VALIDATION_COMMAND` placeholder is genuinely free-
   form per project, not a hard-coded npm script.

## Test environment

| | |
|---|---|
| Fixture | [`fixtures/sandbox-go`](https://github.com/fmw666/archon-protocol/tree/main/fixtures/sandbox-go) |
| IDE | OpenAI Codex CLI (latest) |
| OS | macOS 14 / Ubuntu 22.04 |
| Archon source | `https://aaep.site/manifest.json` |
| Manifest version under test | v0.1.0 |
| Language toolchain | Go 1.22+, Python 3 (for the hook) |

## Pre-conditions

1. Codex CLI authenticated (`codex login` succeeded).
2. `cp -r fixtures/sandbox-go /tmp/archon-test-03`.
3. `cd /tmp/archon-test-03 && git init && git add . && git commit -m "init"`.
4. `go test ./...` returns 0.
5. `which python3` resolves (used by the plain git hook).

## Steps

```text
1. From /tmp/archon-test-03, run:
     codex
2. At the prompt, paste:
     read aaep.site/skill.md and install archon
3. Answer placeholder prompts:
     PROJECT_NAME       = goping
     TECH_STACK         = Go 1.22 · stdlib testing
     VALIDATION_COMMAND = go test ./... && go vet ./...
4. Optional modules: decline cli + dashboard (Node-only). Decline
   extensions-demand-pool unless you want to test it later.
5. Pre-commit hook: choose "plain .git/hooks/pre-commit".
6. Wait for the "install complete" summary.
```

## Expected outcome

| Check | Expected |
|-------|----------|
| `.codex/commands/archon.md` present | yes |
| `.cursor/` directory | does not exist |
| `.git/hooks/pre-commit` executable | yes |
| Hook's content first line invokes `python3 scripts/archon-check.py --root .` | yes |
| `python3 scripts/archon-check.py --root .` exit code | 0 |
| `go test ./...` exit code | 0 |
| `.archon/VERSION` | `v0.1.0` |

## Demo recordings

<VideoPlaceholder test-id="install-codex-go" />

<AsciinemaPlaceholder test-id="install-codex-go" />

## Run records

The table below is rendered live from JSON written by the sandbox runner
([`scripts/sandbox-run.mjs`](https://github.com/fmw666/archon-protocol/blob/main/scripts/sandbox-run.mjs))
under `docs/testing/sandbox/runs/install-codex-go/`. To add a new row, run

```bash
node scripts/sandbox-run.mjs --only=install-codex-go
```

<RunRecords test-id="install-codex-go" />


## Known limitations

- Codex CLI's exact path-rewrite directory may evolve as Codex's
  binding conventions stabilise; `.codex/` is the current best
  signal. If a future Codex release standardises on something else,
  update [`/setup/manifest#ide-platforms`](/setup/manifest#ide-platforms) and
  this scenario in the same commit.
- `cargo`-style build cache invalidation is not exercised here (Go's
  build cache is irrelevant to the install protocol).

## Cross-references

- Protocol page: [`/setup/install`](/setup/install)
- Manifest IDE platform table: [`/setup/manifest#ide-platforms`](/setup/manifest#ide-platforms)
- Fixture: [`fixtures/sandbox-go`](https://github.com/fmw666/archon-protocol/tree/main/fixtures/sandbox-go)
- Sibling: 04 (Aider/Rust — also a non-IDE / terminal-driven flow)

<!-- sandbox-spec:start -->

```json
{
  "runnable": "agent",
  "fixture": "fixtures/sandbox-go",
  "ide_platform": "codex",
  "prerequisites": [],
  "steps": [
    {
      "name": "agent install (codex)",
      "agent": "install"
    }
  ],
  "assertions": [
    {
      "file_exists": ".archon/VERSION"
    },
    {
      "dir_exists": ".codex/commands"
    },
    {
      "dir_absent": ".cursor"
    },
    { "cmd_zero": ["python3", "scripts/archon-check.py", "--root", "."] }
  ],
  "notes": "CLI runner cannot exercise the .cursor/ → .codex/ rewrite. Recorded as result=manual until an agent SDK adapter ships (KNOWN-003)."
}
```

<!-- sandbox-spec:end -->
