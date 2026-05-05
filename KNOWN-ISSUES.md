# Known Framework-Level Issues

Tracks architectural debt of the **archon-protocol distribution model itself**.
These items are about how Archon ships, not about any single adopter
project's business code. Adopter projects (e.g., Distilgent) should keep
their own `.archon/debt.md` for their business debts.

Each item is consumed when a future demand decides to act on it. New items
are appended to the end. Closed items move to the **Closed** section with
the resolving commit / PR.

---

## Open

### KNOWN-001 — Author tools leak into adopter `scripts/` module (2026-05-05)

**Severity:** Warning · **Category:** Distribution boundary

**Symptom:**
The canonical `scripts/` module currently includes `export-archon-core.mjs`
and `test-archon-export.mjs`. These are **author tools** that build a
standalone Archon kit from a local source checkout — they are how the
Distilgent host repo historically packaged Archon for distribution. After
the v2.0.0 architectural reversal (`archon-protocol` is now canonical and
agents pull files from `aaep.site/manifest.json`), these scripts no longer
serve any purpose for adopter projects, but they are still shipped to
every adopter via `scripts/` (a required module).

**Impact:**
- Adopters get two `.mjs` files they never run, plus an `archon:export`
  npm script that, if invoked, would try to re-package an Archon kit out
  of the adopter's `.archon/` — a confusing self-reference.
- The Distilgent test suite (`web/src/test/archon/export-manifest-contract.test.ts`,
  `web/src/test/archon/governance-docs-mirror.test.ts`, etc.) is still
  asserting export-time invariants that only Distilgent itself cares about.
- `archon-protocol/scripts/build-manifest.mjs` already replaces the runtime
  job that `export-archon-core.mjs` used to do, so the author tool is also
  redundant inside the canonical repo.

**Why it's deferred (not fixed in this commit):**
A clean fix requires a coordinated change across two repos:
1. In `archon-protocol`: split `scripts/` into two manifest modules — a
   required `scripts-runtime` (the records helpers, claim verifier, run-state
   helper, archon-check.py/sh) and a non-distributed `scripts-author` that
   stays in source-files but is excluded from `manifest.json`. Update the
   sidebar and source pages accordingly.
2. In `Distilgent`: remove `archon:export` and `archon:export:test` from
   `package.json` `scripts`; remove `archon:export:test` from the `validate`
   chain; retire the export-related contract tests (or move them into
   `archon-protocol` where the canonical build pipeline lives).
3. Run `archon update` on Distilgent — both files will fall into the
   "REMOVE (opted-out module)" path of the new `--without` mechanism we
   just shipped.

**Triggers for picking this up:**
- A new adopter complains about the unused `archon:export` script.
- A second framework-level distribution change forces the same kind of
  module reshuffle (rule of three).
- We do a v2.x close-out and want a clean adopter surface.

**See also:**
- `docs/source-files/scripts/export-archon-core.mjs`
- `docs/source-files/scripts/test-archon-export.mjs`
- `scripts/build-manifest.mjs` (the replacement)

---

### KNOWN-002 — CLI is Node-only; no parity for non-Node projects (2026-05-08)

**Severity:** Info · **Category:** Distribution surface

**Symptom:**
The Archon CLI under `tools/archon-cli/` is implemented in JavaScript and
requires Node ≥ 18 to run. The agent-first install path now correctly
documents this as **optional** and never blocks non-Node projects from
adopting Archon — but adopters who *want* a scripted, non-conversational
install (e.g. for CI on a Python or Go project) currently have to either
install Node just for the CLI, or write their own shell glue around
`curl https://aaep.site/manifest.json` + sha256 verification.

**Impact:**
- Python/Go/Rust/Java/etc. projects without an existing Node toolchain
  must either (a) accept Node as a CI dependency, (b) use the agent path
  (manual chat invocation, not great in CI), or (c) write their own
  installer.
- The portable contract checker (`scripts/archon-check.py`) already proves
  Python is a viable second-class implementation — extending the same idea
  to install/update/sync would close the loop.

**Why it's deferred (not fixed in this commit):**
Implementing a second CLI is a non-trivial engineering project:
1. Decide language: Python (matches the contract checker, broadest
   ecosystem reach) vs Bash (smallest surface, but limited JSON parsing).
2. Replicate the manifest fetch + sha256 + write pipeline that lives in
   `tools/archon-cli/lib/{install,update,sync,uninstall,manifest,...}.mjs`.
3. Decide how to ship the second CLI (`pip install archon-cli`?
   `tools/archon-cli-py/`? a single bundled `archon` shell shim that picks
   Node or Python based on what's available?).
4. Keep the two implementations in lock-step — every behaviour change
   needs to land in both, or one becomes the second-class drift target.

The current stance is: **agent-first is the universal scripted path**
(every modern coding agent has web-fetch + write tools, even in CI via
their headless modes), and the CLI is the convenience path for
JS/TS-native projects. We will revisit when an adopter project files a
concrete need for a non-Node, non-agent CLI in CI.

**Triggers for picking this up:**
- An adopter blocks adoption purely because their CI image cannot install
  Node and headless agent invocation isn't acceptable to their security
  posture.
- Multiple adopters surface the same gap (rule of three).
- The CLI grows a feature that is genuinely awkward to express through the
  agent prompt path, raising the value of a second native CLI.

**See also:**
- `docs/source-files/tools/archon-cli/` — current Node implementation.
- `docs/source-files/scripts/archon-check.py` — proves Python stdlib-only
  is a viable parallel implementation language.
- Agent path: `https://aaep.site/install.md` + `manifest.json`.

---

### KNOWN-003 — No headless agent SDK adapter for sandbox runner (2026-05-05)

**Severity:** Info · **Category:** Verification surface

**Symptom:**
The sandbox runner (`scripts/sandbox-run.mjs`) ships with a working
`CliAdapter` that drives Archon's lifecycle via `tools/archon-cli/`, and a
stub `AgentAdapter` that documents the contract for future SDK adapters
(Cursor SDK, Claude Code SDK, Codex CLI). Until a concrete SDK adapter
ships, every scenario whose `runnable` is `agent` (currently 6 of 12 — the
two `boot-*` scenarios and the four `install-*` scenarios that prove
IDE-platform path rewrites) records `result: "manual"`. They are not
mechanically verified.

**Impact:**
- Sandbox CI gives full machine-graded coverage of CLI lifecycle (install,
  update, sync, uninstall) on Node + TypeScript fixtures, but the agent
  path — the one actually documented as the primary adoption mode — is
  proved only by the captured demo videos + transcripts, not by an
  automated check.
- The IDE platform rewrite (`.cursor/` → `.claude/` / `.codex/` / `.aider/`)
  is currently a documented design intent, not a verified behaviour. The
  CLI itself does not implement the rewrite; only an agent following
  `install.md` does.

**Why it's deferred (not fixed in this commit):**
1. Each headless agent SDK has its own auth flow, model selection, and
   billing surface. Choosing one before adopters surface a preference is
   premature.
2. The agent-driven flows are inherently slower (model latency,
   non-deterministic token counts) — running them on every `git push` would
   require careful CI budgeting.
3. The CLI path already provides the most important regression signal:
   any change that breaks manifest schema, sha256 verification, the
   prune-on-uninstall behaviour, or the optional-module flow will be
   caught by the 7 currently-running CLI scenarios.

**Triggers for picking this up:**
- An adopter wants to verify their agent-driven IDE rewrite continues to
  work after they switch IDEs.
- A regression in the agent-facing protocol files (`install.md`, `skill.md`,
  `boot.md`) ships and only surfaces in user reports, not in CI.
- We standardise on a primary headless SDK for the demo videos and want
  the same harness to drive both the recordings and the assertions.

**See also:**
- `scripts/sandbox/adapters/agent.mjs` — current stub + documented contract.
- `docs/testing/sandbox/scenarios/install-claude-python.md` and siblings —
  scenarios that block on this.

---

### KNOWN-004 — `archon update --with=<module>` is a no-op when versions match (2026-05-05)

**Severity:** Bug · **Category:** CLI lifecycle

**Symptom:**
When a project is already on the canonical Archon version, `archon update
--with=cli` (or any other module-add request) early-exits with
`already on canonical version`, **without** materialising the newly
requested optional module. The user has to pass `--force` to actually
download the new module's files. The `--with` flag is silently ignored.

This was first surfaced by the sandbox scenario
`update-cli-without-cli`: install with `--without=cli`, then update with
`--with=cli`, and observe that `tools/archon-cli/` is never created.

**Impact:**
- Adopters who skipped a module at install time and later try to add it
  via `archon update --with=<mod>` get no error, no warning, and no
  module — pure silent failure.
- The sandbox scenario `update-cli-without-cli` currently reports
  `result: "failing"` because of this; it's a true positive.

**Why it's deferred (not fixed in this commit):**
The fix lives in `docs/source-files/tools/archon-cli/lib/update.mjs`.
The early-return on version match must be replaced by a comparison of the
**effective module set** (installed vs requested) so that an unchanged
version + a changed module list still triggers the download phase. This is
a small but cross-cutting change that deserves its own commit and an
update-time regression test.

**Triggers for picking this up:**
- Any adopter who runs `archon update --with=<mod>` and reports a no-op.
- Next CLI maintenance cycle.

**See also:**
- `docs/source-files/tools/archon-cli/lib/update.mjs` (early-return path).
- `docs/testing/sandbox/scenarios/update-cli-without-cli.md` (failing scenario).

---

### KNOWN-005 — `archon uninstall` leaves empty subdirectories under `tools/archon-cli/` (2026-05-05)

**Severity:** Cosmetic · **Category:** CLI lifecycle

**Symptom:**
After `archon uninstall`, every file the manifest enumerates is removed
correctly, but the parent directories `tools/archon-cli/bin/` and
`tools/archon-cli/lib/` are left as empty folders. `pruneEmptyDirs`
explicitly tries `tools/archon-cli` and `tools` but does not recurse into
the leaf-level `bin/` / `lib/`.

**Impact:**
- Cosmetic: leaves empty folders the user has to delete by hand.
- Sandbox scenarios `uninstall-preserve` and `uninstall-archive` had to
  rephrase their assertions from `dir_absent: tools/archon-cli` to
  `file_absent: tools/archon-cli/bin/archon.mjs`, which is a weaker but
  more accurate truth.

**Why it's deferred (not fixed in this commit):**
Trivial fix (one extra recursion in `pruneEmptyDirs`) but worth its own
PR with a regression assertion in a sandbox scenario, so we don't
inadvertently delete a user-owned directory in a future refactor.

**Triggers for picking this up:**
- Any user reporting empty `tools/` after uninstall.
- Next CLI maintenance cycle.

**See also:**
- `docs/source-files/tools/archon-cli/lib/uninstall.mjs` (`pruneEmptyDirs` call).

---

## Closed

_(none yet)_
