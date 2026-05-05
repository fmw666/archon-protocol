---
title: "06 · boot-claude-python"
test_id: boot-claude-python
fixture: fixtures/sandbox-python (post-02)
ide: Claude Code
language: Python 3.12
stage: boot
status: pending
---

# 06 · boot-claude-python

## What this scenario proves

The boot flow (wake rule + first demand) works identically on
**Claude Code + Python** — i.e. nothing in the cognitive loop
secretly assumed Cursor or Node. Specifically:

1. The Claude wake rule loads on session start, no URL needed.
2. The delivery loop produces a Python source change with a passing
   pytest result.
3. The drift log row uses the same shape as scenario 05 (proving
   the row template is platform-neutral).

## Test environment

| | |
|---|---|
| Fixture | output of scenario 02 (`/tmp/archon-test-02`, post-install) |
| IDE | Claude Code |
| OS | same as scenario 02 |
| Archon source | local |
| Manifest version under test | v0.1.0 |

## Pre-conditions

1. Scenario 02 ran successfully and the run record is ✅.
2. Claude Code was fully closed and reopened on the same project.

## Steps

```text
1. With Claude Code reopened on /tmp/archon-test-02, in the chat panel
   paste exactly (no URL):
     hi archon, add a multiply(a, b) function to calculator.py with
     tests for both positive and negative inputs
2. Confirm any Plan-mode prompt the agent raises.
3. Watch it edit src/calculator.py + tests/test_calculator.py and run
   pytest.
4. Confirm close-out summary appears.
```

## Expected outcome

| Check | Expected |
|-------|----------|
| Agent accepts the URL-less `hi archon, ...` invocation | yes |
| `src/calculator.py` has `multiply` with type hints | yes |
| `tests/test_calculator.py` covers positive + negative cases | yes |
| `python -m pytest` exit code | 0 |
| `.archon/drift.md` has a new row | yes |
| Files modified outside `src/`, `tests/`, `.archon/drift.md` | 0 |

## Demo recordings

<VideoPlaceholder test-id="boot-claude-python" />

<AsciinemaPlaceholder test-id="boot-claude-python" />

## Run records

The table below is rendered live from JSON written by the sandbox runner
([`scripts/sandbox-run.mjs`](https://github.com/fmw666/archon-protocol/blob/main/scripts/sandbox-run.mjs))
under `docs/testing/sandbox/runs/boot-claude-python/`. To add a new row, run

```bash
node scripts/sandbox-run.mjs --only=boot-claude-python
```

<RunRecords test-id="boot-claude-python" />


## Known limitations

- Same caveat as scenario 05: Claude Code rule reload on cold start
  is a UI behaviour, not a file-state assertion.

## Cross-references

- Pre-requisite: [02 install-claude-python](./install-claude-python)
- Parallel: [05 boot-cursor-node](./boot-cursor-node)

<!-- sandbox-spec:start -->

```json
{
  "runnable": "agent",
  "fixture": "fixtures/sandbox-python",
  "ide_platform": "claude",
  "prerequisites": [
    {
      "name": "archon install",
      "cli": "install",
      "flags": [
        "--with=cli"
      ]
    }
  ],
  "steps": [
    {
      "name": "agent boot (hi archon, claude code)",
      "agent": "boot"
    }
  ],
  "assertions": [
    {
      "file_exists": ".archon/run.md"
    }
  ],
  "notes": "Boot lifecycle is agent-only. Recorded as result=manual until an agent SDK adapter ships (KNOWN-003)."
}
```

<!-- sandbox-spec:end -->
