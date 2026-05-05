---
title: "05 · boot-cursor-node"
test_id: boot-cursor-node
fixture: fixtures/sandbox-node-ts (post-01)
ide: Cursor
language: Node 20 + TypeScript
stage: boot
status: pending
---

# 05 · boot-cursor-node

## What this scenario proves

After install (scenario 01), the **wake rule loads automatically on
session start** and the agent can answer Archon-routed prompts
**without a URL**. This is the killer feature of the post-install
flow — the user no longer has to remember `aaep.site/skill.md`.

The scenario also exercises the **first real demand cycle**: the
agent loads `soul.md` + `manifest.md`, picks a domain lens, runs the
delivery loop, writes to `drift.md` + `debt.md` + `memos.md` as
appropriate, and produces a real change in the fixture's `src/`.

## Test environment

| | |
|---|---|
| Fixture | output of scenario 01 (`/tmp/archon-test-01`, post-install) |
| IDE | Cursor (same session or fresh restart) |
| OS | same as scenario 01 |
| Archon source | local (no fetch) |
| Manifest version under test | v0.1.0 |

## Pre-conditions

1. Scenario 01 ran successfully and the run record is ✅.
2. Cursor was **fully closed and reopened** at the same project so the
   wake rule's "load on session start" is genuinely tested.

## Steps

```text
1. With Cursor reopened on /tmp/archon-test-01, open the chat panel.
2. Paste exactly (no URL):
     hi archon, add a "completedAt: Date | null" field to Todo and a
     toggleAndStamp helper that sets it on completion, undoes on uncheck
3. Watch the agent walk the Archon delivery loop:
     - reads soul.md / manifest.md / drift.md / debt.md
     - picks the dev lens
     - drafts a plan, asks for confirmation if the change is non-trivial
     - implements src/todo.ts + src/todo.test.ts
     - runs npm run validate
     - appends a row to drift.md with the demand summary
     - prints close-out summary
4. Inspect git diff to confirm changes are scoped to src/ and
   .archon/drift.md (not the wider Archon kit).
```

## Expected outcome

| Check | Expected |
|-------|----------|
| Agent recognises `hi archon, ...` without the user supplying a URL | yes |
| `src/todo.ts` has the new `completedAt` field and helper | yes |
| `src/todo.test.ts` covers the new helper | yes |
| `npm run validate` exit code | 0 |
| `.archon/drift.md` has a new row with today's date + demand summary | yes |
| `.archon/debt.md` is unchanged (no debt registered for a clean delivery) | yes |
| `.archon/VERSION` is unchanged | yes |
| Number of files outside `src/` and `.archon/drift.md` modified | 0 |

## Demo recordings

<VideoPlaceholder test-id="boot-cursor-node" />

<AsciinemaPlaceholder test-id="boot-cursor-node" />

## Run records

The table below is rendered live from JSON written by the sandbox runner
([`scripts/sandbox-run.mjs`](https://github.com/fmw666/archon-protocol/blob/main/scripts/sandbox-run.mjs))
under `docs/testing/sandbox/runs/boot-cursor-node/`. To add a new row, run

```bash
node scripts/sandbox-run.mjs --only=boot-cursor-node
```

<RunRecords test-id="boot-cursor-node" />


## Known limitations

- "wake rule loads on session start" depends on Cursor's rule loader
  surfacing `archon-wake.mdc`. If you cold-restart Cursor and the rule
  doesn't load until a manual reload, that is a Cursor UI behaviour
  to capture in `KNOWN-ISSUES.md`, not a fail of this scenario.
- Quality of the implementation is judged by `npm run validate`
  passing — not by code-style preferences. Style polish is out of
  scope here (covered by the design lens, not delivery).

## Cross-references

- Protocol page: [`/setup/lifecycle`](/setup/lifecycle) §
  "Daily Cognitive Loop"
- Soul / delivery: [`/source/soul-delivery`](/source/soul-delivery)
- Pre-requisite: [01 install-cursor-node](./install-cursor-node)
- Parallel: [06 boot-claude-python](./boot-claude-python)

<!-- sandbox-spec:start -->

```json
{
  "runnable": "agent",
  "fixture": "fixtures/sandbox-node-ts",
  "ide_platform": "cursor",
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
      "name": "agent boot (hi archon)",
      "agent": "boot"
    }
  ],
  "assertions": [
    {
      "file_exists": ".archon/run.md"
    }
  ],
  "notes": "Boot lifecycle requires a real coding agent. Recorded as result=manual until an agent SDK adapter ships (KNOWN-003)."
}
```

<!-- sandbox-spec:end -->
