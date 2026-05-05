---
title: Test Record Template
outline: deep
---

# Test Record Template

> **For framework maintainers.** Every sandbox scenario page in
> [`/testing/sandbox/scenarios/`](./test-matrix) follows this exact
> structure. Copy-paste the code block below and fill in the
> brace-bracketed placeholders. Do **not** publish a scenario page
> that still has any `{TODO}` placeholder unfilled.

The template body, exactly as it should be copied into a new scenario
file:

````md
---
title: {Scenario short title}
test_id: {e.g. install-cursor-node}
fixture: {fixtures/sandbox-node-ts | sandbox-python | sandbox-go | sandbox-rust}
ide: {Cursor | Claude Code | OpenAI Codex CLI | Aider}
language: {Node 20 + TS | Python 3.12 | Go 1.22 | Rust 1.78}
stage: {install | boot | update | sync | uninstall}
status: {pending | passing | failing}
---

# {Scenario short title}

## What this scenario proves

{One paragraph: which Archon claim is being tested, and why this
fixture/IDE/language combination is meaningful.}

## Test environment

| | |
|---|---|
| Fixture | [`fixtures/{dir}`](https://github.com/fmw666/archon-protocol/tree/main/fixtures/) |
| IDE | {Cursor latest / Claude Code latest / Codex CLI latest} |
| OS | {macOS 14 / Ubuntu 22.04 / Windows 11 + WSL2} |
| Archon source | `https://aaep.site/manifest.json` (or pinned `?version=v0.1.x`) |
| Manifest version under test | {v0.1.x} |
| Language toolchain | {Node 20.11 / Python 3.12 / Go 1.22 / Rust 1.78} |

## Pre-conditions

1. Fixture copied to a fresh tmp dir (`/tmp/archon-test-{id}`).
2. `git init && git add . && git commit -m "init"` — clean v0.0.0.
3. The IDE is open at the fresh tmp dir.
4. (For update / sync / uninstall scenarios) prerequisite scenario
   `{id}` ran successfully first.

## Steps

```text
1. {Action — typically the agent prompt or CLI command}
2. {Action}
3. {Verification step}
```

## Expected outcome

| Check | Expected |
|-------|----------|
| Exit code (CLI) / agent self-report | {0 / "install complete"} |
| `.archon/VERSION` | matches `manifest.version` under test |
| `.archon/drift.md` rows | {0 for fresh install, ...} |
| `{BINDING_ROOT}/commands/archon.md` present | yes |
| `scripts/archon-check.py --root .` exit code | 0 |
| `{validation command}` exit code | 0 |

## Demo recordings

::: tip Recordings — see [docs/public/videos/README.md](/videos/README)
- `videos/{test-id}.mp4` — full IDE chat-panel walkthrough.
- `asciinema/{test-id}.cast` — pure terminal verification.
:::

<VideoPlaceholder test-id="{test-id}" />

<AsciinemaPlaceholder test-id="{test-id}" />

## Run records

> Newest at the top. Append a row every time this scenario is run on
> a tagged manifest version.

| Date | Manifest version | Runner | Result | Notes / link |
|------|------------------|--------|--------|--------------|
| YYYY-MM-DD | v0.1.x | {human or CI} | ✅ pass / ❌ fail / ⏳ pending | {commit sha · CI link · or "manual"} |

## Known limitations

{Anything the test does NOT cover. E.g. "does not assert IDE rule reload
behaviour because that is platform-specific UI state".}

## Cross-references

- Protocol page: [`/setup/{install or update or sync or uninstall}`](/setup/)
- Agent file: [`https://aaep.site/{install or update or sync or uninstall}.md`](https://aaep.site/)
- Fixture: [`fixtures/{dir}`](https://github.com/fmw666/archon-protocol/tree/main/fixtures/)
- Sibling scenarios: {list peer test-ids that share the same stage / IDE}
````

## Status conventions

| Status | Meaning |
|--------|---------|
| `pending` | Test is **planned and documented**, but no run record exists yet. The video / asciinema slots are empty. New scenarios start here. |
| `passing` | Most recent run on the latest tagged manifest version returned the expected outcome. At least one recording is uploaded. |
| `failing` | Most recent run did not match expected outcome. The Run records table shows the failing row at the top, plus a follow-up note in the demand pool / drift log. The framework version is **not** released until this is back to `passing`. |

## Why this template is mandatory

Without a uniform shape, the matrix degrades into a folder of
ad-hoc README-shaped notes that nobody reads twice. The template enforces
three contracts that make the sandbox testable as a whole:

1. **Same metadata on every scenario** — the matrix page can be generated
   from front-matter in the future.
2. **Same expected-outcome table** — run records are diff-able across
   manifest versions.
3. **Same recording slots** — adding videos later is purely an upload, not
   a doc-restructure.

## Filling the placeholders

Every brace-wrapped token must be replaced before publishing:

| Placeholder | Where | Example value |
|-------------|-------|---------------|
| `{Scenario short title}` | front-matter `title` + `# H1` | `01 · install-cursor-node` |
| `{test_id}` | front-matter | `install-cursor-node` |
| `{fixture}` | front-matter | `fixtures/sandbox-node-ts` |
| `{ide}` / `{language}` / `{stage}` / `{status}` | front-matter | `Cursor` / `Node 20 + TypeScript` / `install` / `pending` |
| `{BINDING_ROOT}` | expected-outcome table | `.cursor` / `.claude` / `.codex` / `.aider` (depends on IDE) |
| `{test-id}` (lower-case in `<VideoPlaceholder test-id="…">`) | demo-recordings section | same as front-matter `test_id` |

A scenario with any literal `{...}` placeholder remaining in the
published body is treated as a contract violation by the matrix
review and must be fixed before the page is linked from
[Test Matrix](./test-matrix).
