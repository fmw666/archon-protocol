---
title: "04 · install-aider-rust"
test_id: install-aider-rust
fixture: fixtures/sandbox-rust
ide: Aider
language: Rust 1.78
stage: install
status: pending
---

# 04 · install-aider-rust

## What this scenario proves

Archon installs through **Aider** (a terminal-only AI coding tool with
no IDE chat panel) on a **Rust** project. This is the strictest
"no-Node, no-IDE" combination we test:

1. Aider runs entirely in a terminal — there is no editor pane to
   surface rules in.
2. Rust adopters typically have neither Node nor a Python
   `pre-commit` framework installed; the agent must pick the
   **plain `.git/hooks/pre-commit`** path.
3. The agent must accept that the validate command is `cargo test`
   plus `cargo clippy` — heavy (full compile) but real.

## Test environment

| | |
|---|---|
| Fixture | [`fixtures/sandbox-rust`](https://github.com/fmw666/archon-protocol/tree/main/fixtures/sandbox-rust) |
| IDE | Aider (latest) |
| OS | macOS 14 / Ubuntu 22.04 |
| Archon source | `https://aaep.site/manifest.json` |
| Manifest version under test | v0.1.0 |
| Language toolchain | Rust 1.78+ stable, Python 3 (hook) |

## Pre-conditions

1. `aider` installed and an API key configured (`OPENAI_API_KEY` /
   equivalent).
2. `cp -r fixtures/sandbox-rust /tmp/archon-test-04`.
3. `cd /tmp/archon-test-04 && git init && git add . && git commit -m "init"`.
4. `cargo test` returns 0.
5. `which python3` resolves.

## Steps

```text
1. From /tmp/archon-test-04, run:
     aider
2. At the aider prompt, paste:
     read aaep.site/skill.md and install archon
3. Answer placeholders:
     PROJECT_NAME       = rustyq
     TECH_STACK         = Rust 1.78 · cargo test
     VALIDATION_COMMAND = cargo test && cargo clippy -- -D warnings
4. Optional modules: decline cli + dashboard.
5. Pre-commit hook: choose "plain .git/hooks/pre-commit".
6. Wait for the "install complete" summary in the aider output.
```

## Expected outcome

| Check | Expected |
|-------|----------|
| `.aider/commands/archon.md` present | yes (or whatever `BINDING_ROOT` Aider declares — see manifest table) |
| `.cursor/` directory | does not exist |
| `.git/hooks/pre-commit` invokes `archon-check.py` | yes |
| `python3 scripts/archon-check.py --root .` exit code | 0 |
| `cargo test` exit code | 0 |
| `cargo clippy -- -D warnings` exit code | 0 |
| `.archon/VERSION` | `v0.1.0` |
| Aider's commit message for the install change | follows Conventional Commits format |

## Demo recordings

<VideoPlaceholder test-id="install-aider-rust" />

<AsciinemaPlaceholder test-id="install-aider-rust" />

## Run records

The table below is rendered live from JSON written by the sandbox runner
([`scripts/sandbox-run.mjs`](https://github.com/fmw666/archon-protocol/blob/main/scripts/sandbox-run.mjs))
under `docs/testing/sandbox/runs/install-aider-rust/`. To add a new row, run

```bash
node scripts/sandbox-run.mjs --only=install-aider-rust
```

<RunRecords test-id="install-aider-rust" />


## Known limitations

- Aider auto-commits changes; the test does not enforce Archon's
  commit-message convention beyond "Conventional-Commits-shaped".
- Rust's compile time can make this scenario the slowest in the
  matrix (~60 s for the validate step on cold cache). Recordings
  may want to skip the compile via `cargo check` instead — note that
  in the run record's "Notes" column if you do.

## Cross-references

- Protocol page: [`/setup/install`](/setup/install)
- Manifest IDE platform table: [`/setup/manifest#ide-platforms`](/setup/manifest#ide-platforms)
- Fixture: [`fixtures/sandbox-rust`](https://github.com/fmw666/archon-protocol/tree/main/fixtures/sandbox-rust)
- Sibling: 03 (Codex/Go — same terminal-driven shape)

<!-- sandbox-spec:start -->

```json
{
  "runnable": "agent",
  "fixture": "fixtures/sandbox-rust",
  "ide_platform": "aider",
  "prerequisites": [],
  "steps": [
    {
      "name": "agent install (aider)",
      "agent": "install"
    }
  ],
  "assertions": [
    {
      "file_exists": ".archon/VERSION"
    },
    {
      "dir_exists": ".aider/commands"
    },
    {
      "dir_absent": ".cursor"
    },
    { "cmd_zero": ["python3", "scripts/archon-check.py", "--root", "."] }
  ],
  "notes": "CLI runner cannot exercise the .cursor/ → .aider/ rewrite. Recorded as result=manual until an agent SDK adapter ships (KNOWN-003)."
}
```

<!-- sandbox-spec:end -->
