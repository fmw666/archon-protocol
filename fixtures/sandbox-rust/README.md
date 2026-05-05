# sandbox-rust

A minimal **Rust** project used as an Archon install target.

## Simulated product context

- `PROJECT_NAME`: `rustyq`
- `TECH_STACK`: `Rust 1.78 · cargo test`
- `VALIDATION_COMMAND`: `cargo test && cargo clippy -- -D warnings`
- `IDE_PLATFORM`: Aider (default — terminal-only flow)

## Stack

| Layer | Choice |
|-------|--------|
| Language | Rust ≥ 1.78 (stable) |
| Test | `cargo test` |
| Lint | `cargo clippy` |
| Pre-commit | plain `.git/hooks/pre-commit` calling `python3 scripts/archon-check.py` |

## Files

```
.
├── README.md
├── Cargo.toml
└── src/
    └── lib.rs           ← unit tests live in the same file (Rust convention)
```

## Local sanity check

```bash
cargo test
```

Expected exit code: `0`.

## Used by which scenarios

- `install-aider-rust`
