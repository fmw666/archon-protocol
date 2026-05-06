---
title: Test Fixtures
outline: deep
---

# Test Fixtures

The five minimal projects that sandbox tests install into. They live
under [`fixtures/`](https://github.com/fmw666/archon-protocol/tree/main/fixtures)
in this repo (see [`fixtures/README.md`](https://github.com/fmw666/archon-protocol/blob/main/fixtures/README.md) for the
conventions every fixture follows).

> **None of these fixtures has Archon installed.** They are clean
> "before" snapshots. A sandbox test starts by copying one of them
> into a tmp directory and runs the install protocol against it.

## sandbox-node-ts

The most common adopter shape: Vite / Next / Express-style Node
projects with TypeScript and Vitest.

| | |
|---|---|
| Path | `fixtures/sandbox-node-ts/` |
| Simulated identity | `acme-todos` |
| Toolchain | Node 20 · TypeScript 5 · Vitest |
| Validation cmd | `npm run validate` (= `tsc --noEmit` + `vitest run`) |
| Pre-commit hook style | `husky` + `archon-check.py` |
| Used by scenarios | 01, 05, 07, 08, 09, 10, 12 |

```text
fixtures/sandbox-node-ts/
├── README.md
├── package.json
├── tsconfig.json
└── src/
    ├── todo.ts
    └── todo.test.ts
```

The Vitest test passes from a clean checkout; this is what the
post-install validate gate exercises in scenarios 01 and 07.

## sandbox-python

Proves Archon installs cleanly on a **non-JS project**. The agent
must pick the Python `pre-commit` framework path for the hook and
must not assume `package.json` exists.

| | |
|---|---|
| Path | `fixtures/sandbox-python/` |
| Simulated identity | `pyflux` |
| Toolchain | Python 3.10+ · pytest · ruff |
| Validation cmd | `python -m pytest && ruff check .` |
| Pre-commit hook style | [`pre-commit`](https://pre-commit.com) framework |
| Used by scenarios | 02, 06, 11 |

```text
fixtures/sandbox-python/
├── README.md
├── pyproject.toml
├── src/
│   └── calculator.py
└── tests/
    └── test_calculator.py
```

## sandbox-go

Proves Archon installs on a **compiled-language stack** with `go test`
as the validate command, no Node and no Python framework dependency
beyond the contract checker itself.

| | |
|---|---|
| Path | `fixtures/sandbox-go/` |
| Simulated identity | `goping` |
| Toolchain | Go 1.22+ · stdlib testing |
| Validation cmd | `go test ./... && go vet ./...` |
| Pre-commit hook style | plain `.git/hooks/pre-commit` shell script |
| Used by scenarios | 03 |

```text
fixtures/sandbox-go/
├── README.md
├── go.mod
├── main.go
└── main_test.go
```

This is the **smallest possible Archon adopter** — no language-level
package manager files beyond `go.mod`, no test framework beyond stdlib.
If install works here, it works on any plain repo.

## sandbox-rust

Proves Archon installs on a **systems-language stack** and exercises
the **Aider terminal-only flow** (no IDE chat panel — the agent
interaction happens entirely in a terminal split).

| | |
|---|---|
| Path | `fixtures/sandbox-rust/` |
| Simulated identity | `rustyq` |
| Toolchain | Rust 1.78+ stable · cargo test |
| Validation cmd | `cargo test && cargo clippy -- -D warnings` |
| Pre-commit hook style | plain `.git/hooks/pre-commit` calling `python3 scripts/archon-check.py` |
| Used by scenarios | 04 |

```text
fixtures/sandbox-rust/
├── README.md
├── Cargo.toml
└── src/
    └── lib.rs       ← unit tests inline (Rust convention)
```

## sandbox-empty

The **null reference point**. A directory that contains only a
README — no language manifest, no source files, no tests. Exists
specifically to bracket the install-matrix: `install` must succeed
on a bare directory, and the post-install tree of `sandbox-empty`
versus `sandbox-node-ts` is exactly the install delta.

| | |
|---|---|
| Path | `fixtures/sandbox-empty/` |
| Simulated identity | (none — bare directory) |
| Toolchain | none |
| Validation cmd | none (intentional — install must not require one) |
| Pre-commit hook style | n/a (no `.git/` until install seeds one) |
| Used by scenarios | 13 |

```text
fixtures/sandbox-empty/
└── README.md
```

This fixture **deliberately violates** the
"every fixture has at least one runnable test" convention from
[`fixtures/README.md`](https://github.com/fmw666/archon-protocol/blob/main/fixtures/README.md)
because that is the whole point — install must not require any
business code or test runner in the target.

## Why these four (and not eight)

| Stack family | Covered by | Not yet covered |
|--------------|------------|------------------|
| Script / web (JS/TS) | sandbox-node-ts | — |
| Script / data (Python) | sandbox-python | — |
| Compiled / backend (Go) | sandbox-go | Java · Kotlin |
| Systems (Rust) | sandbox-rust | C++ · Swift |
| Bare (no language) | sandbox-empty | — |

The five fixtures cover ~90 % of the realistic adoption surface plus
the null reference point. Adding Java / Kotlin / C++ / Swift is cheap
when an actual adopter shows up, but until then they would be
**fixtures with no test record** — exactly the rot we want to avoid.

If you need a fixture that doesn't exist yet, follow the "Adding a new
fixture" section of
[`fixtures/README.md`](https://github.com/fmw666/archon-protocol/blob/main/fixtures/README.md)
and pair it with at least one matrix scenario.

## How to obtain a fixture for local testing

Either clone this repo and copy the fixture, or download just the
fixture subtree:

```bash
git clone https://github.com/fmw666/archon-protocol.git /tmp/archon-protocol
cp -r /tmp/archon-protocol/fixtures/sandbox-node-ts /tmp/archon-test-001
cd /tmp/archon-test-001
git init && git add . && git commit -m "init fixture v0.0.0"

# now run the scenario steps from /testing/sandbox/scenarios/install-cursor-node
```

Treat the tmp copy as throw-away — re-create it from the fixture for
each new test run so prior state never leaks.
