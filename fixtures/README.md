# Archon Sandbox Fixtures

Minimal project skeletons used as **install targets** for Archon's sandbox
test suite. Each fixture represents a different
*language × IDE × project shape* combination so the sandbox tests can prove
the install protocol behaves identically across them.

> **These fixtures are NOT adopters of Archon themselves.** They are clean
> "before" snapshots — a sandbox test starts by copying one of these into a
> tmp directory, runs `install archon` (via agent or CLI), then verifies
> the resulting tree matches the canonical manifest.

## Why these four stacks

| Fixture | Purpose | Targets which IDE in the matrix |
|---------|---------|-------------------------------|
| `sandbox-node-ts/` | Most common adopter shape today (Vite / Next / Express). Validates `husky` pre-commit path. | Cursor (default) |
| `sandbox-python/` | Proves Archon works on **non-JS** projects. Validates the Python `pre-commit` framework path for the hook. | Claude Code |
| `sandbox-go/` | Proves Archon works on a **compiled-language** stack with `go test` as validate. Validates plain-git-hook path. | OpenAI Codex CLI |
| `sandbox-rust/` | Proves Archon works on a **systems-language** stack with `cargo test` as validate. Smoke for Aider terminal-only flow. | Aider |

These four cover ~90 % of the realistic adoption surface (script /
backend / compiled / systems). Adding more (Java, Swift, Ruby) is cheap
when an actual adopter shows up — see `KNOWN-ISSUES.md` if a gap is
blocking you.

## Conventions every fixture follows

1. **Clean working tree** — every fixture is a self-contained directory
   that `git init` + `git add . && git commit` would accept as v0.0.0.
2. **No `.archon/` and no IDE binding directories** — install must succeed
   from a true zero-state.
3. **At least one runnable test** — so step 3 of Quickstart ("validate
   command is green from a clean shell") has something real to invoke.
4. **A `README.md` declaring** the simulated product context
   (`PROJECT_NAME` / `TECH_STACK`) the agent will be told to use during
   install. This keeps test runs reproducible.
5. **Tooling installed by the developer, not vendored** — fixtures don't
   ship `node_modules/` / `target/` / `__pycache__/`. The sandbox test
   runner is responsible for setting up the language toolchain (Node /
   Python / Go / Rust).

## How fixtures are consumed by tests

A typical sandbox test (see [`docs/testing/sandbox/`](../docs/testing/sandbox/)):

```bash
# 1. copy fixture to a tmp working dir
cp -r fixtures/sandbox-node-ts /tmp/archon-test-001

# 2. initialise as fresh git repo (some tests need a real .git/)
cd /tmp/archon-test-001 && git init && git add . && git commit -m "init"

# 3. run the install protocol (agent or CLI)
#    — agent path:   open IDE, paste "read aaep.site/skill.md and install archon"
#    — CLI path:     npx @archon/cli@latest install --yes

# 4. verify the post-install state matches expectation
#    — assert .archon/ exists, .archon/VERSION matches manifest version, etc.
#    — see docs/testing/sandbox/<scenario-id>.md for per-scenario expectations
```

## Adding a new fixture

1. Create `fixtures/sandbox-<stack>/` with the conventions above.
2. Add a row to the table at the top of this README.
3. Add at least one matrix scenario referencing it in
   `docs/testing/sandbox/test-matrix.md`.
4. Document the rationale in `docs/testing/sandbox/fixtures.md`.

Don't add a fixture without a paired test scenario — fixtures with no test
record drift from reality.
