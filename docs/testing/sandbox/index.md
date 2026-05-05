---
title: Sandbox Tests
outline: deep
---

# Sandbox Tests

A reproducible, evidence-based answer to the question:

> **Does Archon's install / update / sync / uninstall protocol actually
> work end-to-end on real projects, on every supported IDE and language?**

Each sandbox test takes a **clean fixture project** (no `.archon/`, no
binding directory), runs one Archon lifecycle command (via agent or
CLI), and verifies the resulting tree against an expected outcome. Every
run is recorded with date, manifest version, runner, and result so you
can audit reality, not promises.

## How this differs from [Contract Tests](/testing/strategy)

| Layer | Asks | Lives in |
|-------|------|----------|
| [Contract Tests](/testing/strategy) | "Are the framework files internally consistent?" (file shapes, cross-refs, line caps, forbidden substrings) | `scripts/archon-check.py` running against `.archon/contracts/governance-contract.yaml` |
| **Sandbox Tests (this section)** | "Does the install protocol produce a valid tree on a real fresh project, on this IDE / language?" | Scenario pages under [`/testing/sandbox/scenarios/`](./test-matrix) — each backed by a fixture in [`fixtures/`](https://github.com/fmw666/archon-protocol/tree/main/fixtures) |

Both layers are required. Contract tests are static and run on every
commit; sandbox tests are scenario-driven and run on every release
(plus on demand when adding a new IDE / language target).

## The 12-scenario matrix

The first matrix covers `lifecycle stage × IDE × language` with deliberate
overlap on the most common stack (Cursor + Node + TS) so that
update / sync / uninstall scenarios can chain on top of an install
scenario.

| # | test-id | Stage | IDE | Language |
|---|---------|:-----:|-----|----------|
| 01 | [`install-cursor-node`](./scenarios/install-cursor-node) | install | Cursor | Node + TS |
| 02 | [`install-claude-python`](./scenarios/install-claude-python) | install | Claude Code | Python |
| 03 | [`install-codex-go`](./scenarios/install-codex-go) | install | Codex CLI | Go |
| 04 | [`install-aider-rust`](./scenarios/install-aider-rust) | install | Aider | Rust |
| 05 | [`boot-cursor-node`](./scenarios/boot-cursor-node) | boot | Cursor | Node + TS |
| 06 | [`boot-claude-python`](./scenarios/boot-claude-python) | boot | Claude Code | Python |
| 07 | [`update-cursor-node`](./scenarios/update-cursor-node) | update | Cursor | Node + TS |
| 08 | [`update-cli-without-cli`](./scenarios/update-cli-without-cli) | update + `--without=cli` | Cursor | Node + TS |
| 09 | [`sync-clean`](./scenarios/sync-clean) | sync (no drift) | Cursor | Node + TS |
| 10 | [`sync-modified`](./scenarios/sync-modified) | sync (drift detected) | Cursor | Node + TS |
| 11 | [`uninstall-preserve`](./scenarios/uninstall-preserve) | uninstall (preserve ledgers) | Claude Code | Python |
| 12 | [`uninstall-archive`](./scenarios/uninstall-archive) | uninstall (archive ledgers) | Cursor | Node + TS |

See the [Test Matrix](./test-matrix) page for the full grid with
fixture / status columns, or jump to [Test Fixtures](./fixtures) for the
project skeletons each scenario installs into.

## Latest run summary

The table below is the **single source of truth for "is Archon
release-ready"**. A release does not ship until every row's most-recent
run is `passing` against the candidate manifest version.

It is rendered live from [`runs/index.json`](https://github.com/fmw666/archon-protocol/tree/main/docs/testing/sandbox/runs),
which is regenerated on every invocation of
[`scripts/sandbox-run.mjs`](https://github.com/fmw666/archon-protocol/blob/main/scripts/sandbox-run.mjs)
(local + GitHub Actions). To refresh after editing a scenario, run:

```bash
node scripts/sandbox-run.mjs --runnable=cli         # CLI scenarios
node scripts/sandbox-run.mjs --runnable=agent       # agent scenarios (currently → manual)
```

<LatestRunsSummary />

> **Status legend**: ✅ passing · ❌ failing · ⏳ manual (no SDK adapter yet,
> see [KNOWN-003](https://github.com/fmw666/archon-protocol/blob/main/KNOWN-ISSUES.md)) ·
> · pending (no run on record).
>
> A `failing` row is **not** runner noise — it is either an authentic CLI
> regression or a scenario whose assertions need updating. Either way it
> blocks the release until resolved.

## How to add a new scenario

1. Pick the gap: a stage / IDE / language combination not yet covered.
2. Pick (or add) a fixture under [`fixtures/`](https://github.com/fmw666/archon-protocol/tree/main/fixtures) — see
   [`fixtures/README.md`](https://github.com/fmw666/archon-protocol/blob/main/fixtures/README.md) for conventions.
3. Copy [`template.md`](./template) into `scenarios/<test-id>.md`,
   fill front-matter + steps + expected outcome.
4. Add the row to [Test Matrix](./test-matrix) and to the **Latest run
   summary** table above (status `pending`).
5. (When you actually execute it) record mp4 + cast, upload to
   `docs/public/videos/<test-id>.mp4` and
   `docs/public/asciinema/<test-id>.cast`, flip status to `passing` in
   the same commit.

## Why we keep `pending` rows visible

A scenario page that lives under "I'll write the test later" rots fast.
By committing the page (with `pending` status, expected steps, and
empty recording slots) **before** the run, three things happen:

1. The matrix is honest about coverage gaps.
2. The expected outcome is fixed *before* the run, removing the bias of
   writing the test to match whatever happened.
3. Anyone (including future maintainers) can pick up a `pending`
   scenario and execute it without having to invent it.
