---
title: Test Matrix
outline: deep
---

# Test Matrix

The complete grid of sandbox scenarios. Every row links to a full
[`template.md`](./template)-shaped scenario page with steps,
expected outcome, and run records.

## The grid

| # | test-id | Stage | IDE | Language | Fixture | Status |
|---|---------|:-----:|-----|----------|---------|:------:|
| 01 | [`install-cursor-node`](./scenarios/install-cursor-node) | install | Cursor | Node 20 + TS | sandbox-node-ts | ⏳ |
| 02 | [`install-claude-python`](./scenarios/install-claude-python) | install | Claude Code | Python 3.12 | sandbox-python | ⏳ |
| 03 | [`install-codex-go`](./scenarios/install-codex-go) | install | Codex CLI | Go 1.22 | sandbox-go | ⏳ |
| 04 | [`install-aider-rust`](./scenarios/install-aider-rust) | install | Aider | Rust 1.78 | sandbox-rust | ⏳ |
| 05 | [`boot-cursor-node`](./scenarios/boot-cursor-node) | boot (first demand) | Cursor | Node 20 + TS | sandbox-node-ts (after 01) | ⏳ |
| 06 | [`boot-claude-python`](./scenarios/boot-claude-python) | boot (first demand) | Claude Code | Python 3.12 | sandbox-python (after 02) | ⏳ |
| 07 | [`update-cursor-node`](./scenarios/update-cursor-node) | update (v0.1.0 → v0.1.1) | Cursor | Node 20 + TS | sandbox-node-ts (after 01) | ⏳ |
| 08 | [`update-cli-without-cli`](./scenarios/update-cli-without-cli) | update with `--without=cli` | Cursor | Node 20 + TS | sandbox-node-ts (after 01) | ⏳ |
| 09 | [`sync-clean`](./scenarios/sync-clean) | sync (no drift expected) | Cursor | Node 20 + TS | sandbox-node-ts (after 01) | ⏳ |
| 10 | [`sync-modified`](./scenarios/sync-modified) | sync (drift detected) | Cursor | Node 20 + TS | sandbox-node-ts (after 01, hand-edit injected) | ⏳ |
| 11 | [`uninstall-preserve`](./scenarios/uninstall-preserve) | uninstall (preserve ledgers) | Claude Code | Python 3.12 | sandbox-python (after 02) | ⏳ |
| 12 | [`uninstall-archive`](./scenarios/uninstall-archive) | uninstall (archive ledgers) | Cursor | Node 20 + TS | sandbox-node-ts (after 01) | ⏳ |

> **Status legend**: ✅ passing · ❌ failing · ⏳ pending.
> Status is updated **per release**: each scenario must pass against
> the candidate manifest version before the framework is tagged.

## Coverage view

### By stage

| Stage | # of scenarios | Test IDs |
|-------|:-------------:|----------|
| install | 4 | 01–04 |
| boot | 2 | 05, 06 |
| update | 2 | 07, 08 |
| sync | 2 | 09, 10 |
| uninstall | 2 | 11, 12 |
| **Total** | **12** | |

### By IDE

| IDE | # of scenarios | Test IDs |
|-----|:-------------:|----------|
| Cursor | 7 | 01, 05, 07, 08, 09, 10, 12 |
| Claude Code | 3 | 02, 06, 11 |
| OpenAI Codex CLI | 1 | 03 |
| Aider | 1 | 04 |
| Continue / Windsurf | 0 | (deferred — see [KNOWN-ISSUES.md](https://github.com/fmw666/archon-protocol/blob/main/KNOWN-ISSUES.md)) |

### By language

| Language | # of scenarios | Test IDs |
|----------|:-------------:|----------|
| Node + TypeScript | 7 | 01, 05, 07, 08, 09, 10, 12 |
| Python | 3 | 02, 06, 11 |
| Go | 1 | 03 |
| Rust | 1 | 04 |

## Dependency graph

Some scenarios reuse the post-install state of an earlier scenario.
Run them in this order if you want to chain (otherwise each scenario
sets itself up from the fixture):

```mermaid
graph TD
  F1[fixtures/sandbox-node-ts] --> S01[01 install-cursor-node]
  S01 --> S05[05 boot-cursor-node]
  S01 --> S07[07 update-cursor-node]
  S01 --> S08[08 update-cli-without-cli]
  S01 --> S09[09 sync-clean]
  S01 --> S10[10 sync-modified]
  S01 --> S12[12 uninstall-archive]

  F2[fixtures/sandbox-python] --> S02[02 install-claude-python]
  S02 --> S06[06 boot-claude-python]
  S02 --> S11[11 uninstall-preserve]

  F3[fixtures/sandbox-go] --> S03[03 install-codex-go]
  F4[fixtures/sandbox-rust] --> S04[04 install-aider-rust]
```

## What this matrix does **not** cover (yet)

| Gap | Why deferred | Trigger to add |
|-----|--------------|----------------|
| Continue / Windsurf IDE coverage | No active adopter; would be a synthetic test | First adopter on either IDE |
| Java / Kotlin / Swift / C++ fixtures | See [`fixtures/README.md`](https://github.com/fmw666/archon-protocol/blob/main/fixtures/README.md) | First adopter |
| `archon doctor` deep-dive scenario | Doctor is a wrapper over check + structural; covered transitively in 09 | Behavior diverges from `sync` |
| Multi-agent / parallel-write race | Single-agent invariant is part of soul.md; race testing is out of scope | If invariant is relaxed |
| Cross-OS matrix (Linux × macOS × Windows × WSL) | First-party CI runs on Linux; macOS/Windows runs are spot-checked manually | Before declaring `1.0.0` |

These gaps are recorded so the matrix is honest about what
"sandbox-tested" means today.
