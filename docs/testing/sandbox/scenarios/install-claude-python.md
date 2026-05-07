---
title: "02 · install-claude-python"
test_id: install-claude-python
fixture: fixtures/sandbox-python
ide: Claude Code
language: Python 3.12
stage: install
status: pending
---

# 02 · install-claude-python

## What this scenario proves

Archon is **not Node-locked**. A Python project with no `package.json`
and no Node toolchain can adopt Archon end-to-end through Claude Code,
provided Python 3 is on PATH for the contract checker.

This scenario forces three platform-neutral behaviours:

1. The agent must detect `IDE_PLATFORM = claude` (signal: `.claude/`
   or `CLAUDE.md`) and **rewrite** every manifest path from `.cursor/`
   to `.claude/`.
2. The agent must pick the Python `pre-commit` framework path for the
   hook — *not* husky.
3. The agent must skip the `cli` and `dashboard` modules by default
   (they are Node-only optional modules).

Failure means Archon falsely advertises multi-platform / multi-language
support.

## Test environment

| | |
|---|---|
| Fixture | [`fixtures/sandbox-python`](https://github.com/fmw666/archon-protocol/tree/main/fixtures/sandbox-python) |
| IDE | Claude Code (latest) |
| OS | macOS 14 / Ubuntu 22.04 |
| Archon source | `https://aaep.site/manifest.json` |
| Manifest version under test | v0.1.0 |
| Language toolchain | Python 3.10+ with `pip` and `pre-commit` |

## Pre-conditions

1. Claude Code is configured with web-fetch + write tools.
2. `cp -r fixtures/sandbox-python /tmp/archon-test-02`.
3. `cd /tmp/archon-test-02 && git init && git add . && git commit -m "init"`.
4. `python -m pip install -e ".[dev]" && python -m pytest` returns 0.
5. `which python3` resolves (the agent will use it for the hook).

## Steps

```text
1. Open Claude Code in /tmp/archon-test-02.
2. In the chat panel, paste:
     read aaep.site/skill.md and install archon
3. When the agent asks for placeholders, answer:
     PROJECT_NAME      = pyflux
     TECH_STACK        = Python 3.12 · pytest · ruff
     VALIDATION_COMMAND= python -m pytest && ruff check .
4. When asked about optional modules, decline cli + dashboard
   (they require Node). Accept extensions-demand-pool if asked.
5. When asked about the pre-commit hook, choose
   "Python pre-commit framework".
6. Wait for the "install complete" summary.
```

## Expected outcome

| Check | Expected |
|-------|----------|
| Agent self-report includes | "IDE_PLATFORM = claude · BINDING_ROOT = .claude/" |
| `.archon/VERSION` | `v0.1.0` |
| `.cursor/` directory | **does not exist** (path was rewritten) |
| `.claude/commands/archon.md` present | yes |
| `.claude/rules/archon-wake.md` present | yes (note: `.md` not `.mdc` for Claude) |
| `.pre-commit-config.yaml` references `archon-check.py` | yes |
| No `.husky/` directory | yes |
| No `node_modules/` reference in install diff | yes |
| `python3 scripts/archon-check.py --root .` exit code | 0 |
| `python -m pytest` exit code | 0 |

## Demo recordings

<VideoPlaceholder test-id="install-claude-python" />

<AsciinemaPlaceholder test-id="install-claude-python" />

## Run records

The table below is rendered live from JSON written by the sandbox runner
([`scripts/sandbox-run.mjs`](https://github.com/fmw666/archon-protocol/blob/main/scripts/sandbox-run.mjs))
under `docs/testing/sandbox/runs/install-claude-python/`. To add a new row, run

```bash
node scripts/sandbox-run.mjs --only=install-claude-python
```

<RunRecords test-id="install-claude-python" />


## Known limitations

- The exact rule-file extension on Claude Code (`.md` vs `.mdc`) depends on
  Claude Code's evolving rule-loading conventions; if the agent picks a
  different extension and the wake rule still loads, treat as ✅. Update
  this expected outcome row in that case.
- Does not test running Archon on Python 3.9 or earlier; Python 3.10+
  is the documented minimum.

## Cross-references

- Protocol page: [`/setup/install`](/setup/install) §
  "Install IDE binding surface"
- Agent file: [`https://aaep.site/install.md`](https://aaep.site/install.md)
- Manifest IDE platform table: [`/setup/manifest#ide-platforms`](/setup/manifest#ide-platforms)
- Fixture: [`fixtures/sandbox-python`](https://github.com/fmw666/archon-protocol/tree/main/fixtures/sandbox-python)
- Follow-on scenarios: 06, 11

<!-- sandbox-spec:start -->

```json
{
  "runnable": "agent",
  "fixture": "fixtures/sandbox-python",
  "ide_platform": "claude",
  "prerequisites": [],
  "steps": [
    {
      "name": "agent install (claude)",
      "agent": "install"
    }
  ],
  "assertions": [
    {
      "file_exists": ".archon/VERSION"
    },
    {
      "dir_exists": ".claude/commands"
    },
    {
      "dir_absent": ".cursor"
    },
    { "cmd_zero": ["python3", "scripts/archon-check.py", "--root", "."] }
  ],
  "notes": "CLI runner cannot exercise the .cursor/ → .claude/ rewrite. Recorded as result=manual until an agent SDK adapter ships (KNOWN-003)."
}
```

<!-- sandbox-spec:end -->
