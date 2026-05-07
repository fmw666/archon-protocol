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

### KNOWN-003 — Headless agent SDK provider coverage is incomplete; agent-SDK verification is local-only by policy (2026-05-05, scope updated 2026-05-07)

**Severity:** Info · **Category:** Verification surface

**Symptom:**
The sandbox runner (`scripts/sandbox-run.mjs`) ships with a working
`CliAdapter` and a pluggable `AgentAdapter` that dispatches to per-IDE
providers under `scripts/sandbox/adapters/providers/`:

| Provider | Status | Notes |
| --- | --- | --- |
| `cursor` | **Real** (since 2026-05-05) | Uses `@cursor/sdk` (`Agent.create({ local: { cwd, settingSources: ['project'] } })`), `run.stream()` for tool-call summaries, `run.wait()` for the canonical `RunResult`, and surfaces `CursorAgentError` subclasses as structured manual fallbacks. Auto-degrades to `manual` when `CURSOR_API_KEY` is unset or when the optional `@cursor/sdk` package fails to load. |
| `claude` | Manual fallback | No SDK adapter implemented. Used by `install-claude-python` and `boot-claude-python`. |
| `codex` | Manual fallback | No SDK adapter implemented. Used by `install-codex-go`. |
| `aider` | Manual fallback | No SDK adapter implemented. Used by `install-aider-rust`. |

**CI scope decision (2026-05-07):**
Agent-SDK-driven scenarios are deliberately **not** run in CI. Only the
CLI runnable surface is wired into `sandbox-tests.yml` (`--runnable=cli`).
This is a policy choice, not a missing-feature: every agent provider
needs vendor API keys, billable model calls, and slower wall-clock
budgets, and bringing them into CI would couple every PR to vendor
uptime / secret-management with no regression payoff that the CLI
scenarios + `lint:dist` + manifest-symmetry checks don't already give
us at author time.

Local verification of agent flows is supported and encouraged:

```sh
npm run sandbox:agent      # all agent scenarios (cursor SDK + manual fallbacks)
npm run sandbox:all        # cli + agent in one pass
node scripts/sandbox-run.mjs --runnable=agent --only=install-cursor-node
```

The CI harness still picks up agent run records committed locally
(`docs/testing/sandbox/runs/<id>/<timestamp>.json`) via the same
`runs/index.json` aggregator, so the dashboard reflects whatever the
maintainer last ran on their workstation.

**Impact (with the policy clarified):**
- CLI lifecycle on Node + TypeScript fixtures: full machine-graded
  coverage in CI (13 scenarios, all passing).
- Cursor agent flow: real SDK regression test runnable locally; not run
  per-PR.
- Claude / Codex / Aider flows: still `result: "manual"`. Adding any of
  them is a per-vendor implementation task, but doing so does NOT imply
  bringing them into CI — they would slot into the same local-only
  policy.

**How to add a new provider (template, post-Cursor):**
1. Create `scripts/sandbox/adapters/providers/<name>.mjs`.
2. Export `{ name, isAvailable(), runStep(step, ctx) }` mirroring
   `cursor.mjs`. Map the SDK's success/failure into
   `{ code, stdout, stderr, manual?, toolEdits? }`.
3. Register the export in `scripts/sandbox/adapters/agent.mjs`'s
   `REGISTRY`.
4. Document the relevant `<VENDOR>_API_KEY` env-var in the runner's
   help text and `npm run sandbox:agent` flow. Do NOT add it to
   `.github/workflows/sandbox-tests.yml` — agent SDKs stay local by
   policy. To revisit, file a new `KNOWN-###` documenting the trigger.

**Triggers for revisiting the local-only policy:**
- A regression slips through that *only* the agent SDK could have
  caught (i.e., the cli + lint + manifest layer is genuinely blind to
  it). Single instance is information; rule of three escalates to a
  CI proposal.
- A vendor offers a free tier suitable for CI usage that closes the
  cost / billing argument.

**See also:**
- `scripts/sandbox/adapters/agent.mjs` — dispatcher + registry.
- `scripts/sandbox/adapters/providers/cursor.mjs` — reference implementation.
- `scripts/sandbox/adapters/providers/manual.mjs` — fallback shape.
- `docs/testing/how-runner-works.md` — provider lifecycle doc.
- `package.json` `sandbox:agent` / `sandbox:all` — local entry-points.
- `.github/workflows/sandbox-tests.yml` — CLI-only scope, with rationale
  comment at the top.

---

## Closed

### KNOWN-007 — `NOTICE` referenced repo-only paths that no adopter receives (closed 2026-05-07)

**Severity:** Bug · **Category:** Distribution boundary

**Symptom:**
The `NOTICE` file shipped via the `legal` manifest module — i.e., copied
verbatim into every adopter project — contained two paragraphs that only
make sense for the archon-protocol *source* repository itself:

```
Documentation bundled under docs/archon/** is distributed under the
same Apache-2.0 license.

Comic illustrations under docs/images/archon/** were generated using
Google Gemini image models; the generated images are distributed under
Apache-2.0 as part of this repository.
```

Adopter projects never receive `docs/archon/**` or `docs/images/archon/**`
(neither is in `manifest.json`), so the resulting NOTICE in their tree
asserted licenses on directories that did not exist in their repository
and referenced "this repository" with the wrong antecedent.

This is the same root cause as KNOWN-006 (author / repo-self content
leaking into the adopter distribution surface), surfaced on a different
file.

**Fix (this commit):**
1. Rewrote `docs/source-files/NOTICE` (the adopter-facing NOTICE) to keep
   only Apache-2.0 §4(d) required attributions: upstream provenance
   (Distilgent + Archon Framework), license reference, and a generic
   third-party-components clause. Removed both repo-only paragraphs.
2. Added a separate, **non-distributed** `NOTICE` at the repo root
   (`archon-protocol/NOTICE`) that carries the full text including the
   `docs/archon/**` and `docs/images/archon/**` sub-license declarations,
   plus a closing note explaining why the two NOTICE files exist and how
   to keep them in sync.
3. Reran `node scripts/build-manifest.mjs`; the `legal` module's NOTICE
   shrank from 683 → 410 bytes and its sha256 was updated in
   `docs/public/manifest.json`.

**Verification:**
- `docs/public/source-files/NOTICE` (the bytes adopters actually fetch)
  contains no `docs/archon/**` or `docs/images/archon/**` reference.
- The repo-root `NOTICE` retains the full original sub-license text, so
  archon-protocol's own redistribution remains compliant.

**Lesson reinforcement:**
The same pattern as KNOWN-006: the canonical distribution channel
(`manifest.json` + `docs/source-files/`) only carries adopter-bound
content; anything that describes archon-protocol-the-repository's own
build artifacts (VitePress docs, generated images, author-only scripts)
must live outside `docs/source-files/`. When in doubt, ask: "would an
adopter project that has only the manifest output understand this
sentence?" — if not, it does not belong under `docs/source-files/`.

**See also:**
- `docs/source-files/NOTICE` (adopter-facing, redistributed)
- `NOTICE` (repo-root, not redistributed)
- `KNOWN-006` (same root cause, surfaced via `archon-check.py` instead)

---

### KNOWN-006 — `archon-check.py` referenced undistributed `docs/archon/*` files (closed 2026-05-07)

**Severity:** Bug · **Category:** Distribution boundary

**Symptom:**
The portable contract checker shipped to every adopter via the `scripts/`
module hard-required four `docs/archon/*` files that the canonical
`manifest.json` never distributes:

- `docs/archon/decisions.md` (in `file_budgets` and `export_manifest.required_files`)
- `docs/archon/README.md`, `docs/archon/architecture.md`, `docs/archon/setup.md`
  (in `forbidden_substrings.files` and hard-read by `assert_export_manifest`)
- `docs/archon` (in `universal_module_guard.scan_paths`)

Every fresh adopter install therefore failed `archon-check.py` with a
`FileNotFoundError` cascade, even though the install itself was correct.
This was first surfaced by the `install-agent-cursor` sandbox run on
2026-05-06.

**Fix (this commit):**
1. `governance-contract.yaml`:
   - Moved `docs/archon/*` substring guards from `forbidden_substrings.files`
     into `forbidden_substrings.optional_files` (existing skip-when-missing
     mechanism).
   - Moved `docs/archon` out of `universal_module_guard.scan_paths` into a
     new `optional_scan_paths` list.
   - Pulled `docs/archon/decisions.md` out of `file_budgets` and
     `export_manifest.required_files`.
   - Added a new top-level `repo_self_check` block carrying every rule
     that depends on `docs/archon/*` (file budget, required files,
     setup/README mention lists).
2. `scripts/archon-check.py`:
   - `assert_export_manifest` no longer hard-reads `docs/archon/{setup,README}.md`.
   - `assert_universal_module_guard` honours the new `optional_scan_paths`.
   - New `assert_repo_self_check` runs the moved rules iff
     `<root>/docs/archon/` exists — i.e., only inside the archon-protocol
     source repository (which dogfoods this checker on its own VitePress
     docs), never in adopter projects that received only the manifest.

**Verification:**
- Direct invocation of `assert_repo_self_check` against an adopter-shaped
  fixture (no `docs/archon/`) silently passes.
- Same fixture with `docs/archon/{decisions,README,setup}.md` stubs
  correctly fails with the original mention checks, confirming the
  archon-protocol repo self-check is not weakened.
- `assert_export_manifest` no longer raises on missing `docs/archon/*`.
- `node scripts/build-manifest.mjs` regenerated cleanly (87 files,
  unchanged module count) — the contract change does not alter the
  distribution surface.

**Lesson:**
The `governance-contract.yaml` previously conflated two roles —
"portable rules every Archon-running project must satisfy" and "rules
the archon-protocol source repository must satisfy on its own VitePress
docs". The new `repo_self_check` block separates them with a single,
self-activating gate (`docs/archon/` exists ⇒ run; otherwise skip),
avoiding the maintenance cost of a parallel `repo-self-contract.yaml`
while restoring the adopter-side install promise that v0.1.0 made.

---

### KNOWN-001 — Author tools leak into adopter `scripts/` module (closed 2026-05-07)

**Severity:** Warning · **Category:** Distribution boundary

**Symptom:**
The `scripts/` module shipped `export-archon-core.mjs`,
`test-archon-export.mjs`, and the `archon-comic-doc-refactor` SKILL to
every adopter even though they only make sense inside the archon-protocol
source repository (build-manifest.mjs already supersedes the export
pipeline; the comic-doc-refactor skill operates on `docs/archon/**` which
adopters never receive).

**Fix:**
Added `AUTHOR_ONLY_FILES` set to `scripts/build-manifest.mjs` excluding
the three files from manifest-bucketing. Files remain in `docs/source-files/`
so authors can still run them locally; they no longer enter
`docs/public/manifest.json` (84 files, down from 87) and no longer mirror
into `docs/public/source-files/`. `lint-distribution.mjs` (KNOWN-010)
now treats them as author-only by reading the manifest path set, so any
reintroduction is caught at author time.

**Verification:**
- `node scripts/build-manifest.mjs` reports `version 0.1.0, 14 modules,
  84 files`.
- `lint-distribution.mjs` clean (0 violations, 0 exemptions).
- All 13 sandbox scenarios pass without these files in the install
  surface.

**See also:**
- `scripts/build-manifest.mjs` (`AUTHOR_ONLY_FILES`)
- `scripts/lint-distribution.mjs` (path-denylist enforcement)

---

### KNOWN-004 — `archon update --with=<module>` is a no-op when versions match (closed 2026-05-07)

**Severity:** Bug · **Category:** CLI lifecycle

**Symptom:**
`archon update --with=cli` early-exited with `already on canonical
version` whenever the target Archon version matched the installed
version, silently dropping the requested module-add.

**Fix:**
`docs/source-files/tools/archon-cli/lib/update.mjs` now compares the
**effective module set** (installed vs requested via `--with` / `--without`)
in addition to the version stamp. If only the module set changed, the
update proceeds with a `version unchanged; reconciling module set`
message; if both are identical, the `--force` opt-out remains the only
way to trigger a rewrite.

**Verification:**
Sandbox scenario `update-cli-without-cli` (which installs with
`--without=cli` and updates with `--with=cli`) passes — `tools/archon-cli/`
is now materialised on the second pass.

**See also:**
- `docs/source-files/tools/archon-cli/lib/update.mjs`
- `docs/testing/sandbox/scenarios/update-cli-without-cli.md`

---

### KNOWN-005 — `archon uninstall` leaves empty subdirectories (closed 2026-05-07)

**Severity:** Cosmetic · **Category:** CLI lifecycle

**Symptom:**
`pruneEmptyDirs` only removed the top-level dirs it was called with;
intermediate empties such as `tools/archon-cli/bin/` and
`tools/archon-cli/lib/` survived a clean uninstall.

**Fix:**
Replaced `pruneEmptyDirs` in
`docs/source-files/tools/archon-cli/lib/uninstall.mjs` with a recursive
`pruneIfEmptyRec` helper: each subtree is walked depth-first and every
directory whose entries all collapse to empty is rmdir'd. Best-effort —
non-empty leaves halt the upward sweep at that branch, so user-owned
content adjacent to Archon files is never deleted.

**Verification:**
Sandbox scenarios `uninstall-preserve` and `uninstall-archive` were
strengthened with three new `dir_absent` assertions (`tools/archon-cli`,
`tools/archon-cli/bin`, `tools/archon-cli/lib`) and pass.

**See also:**
- `docs/source-files/tools/archon-cli/lib/uninstall.mjs`
- `docs/testing/sandbox/scenarios/uninstall-preserve.md`

---

### KNOWN-008 — Sandbox install scenarios assert `archon-check.py` exists but never run it (closed 2026-05-07)

**Severity:** Bug · **Category:** Verification surface

**Symptom:**
Every `install-*` scenario only asserted `file_exists` for the contract
checker; it was never executed in CI. v0.1.0 shipped with KNOWN-006 /
KNOWN-009 silently red because nothing called the checker post-install.

**Fix:**
Appended `{ "cmd_zero": ["python3", "scripts/archon-check.py", "--root",
"."] }` to every `install-*` scenario's assertion block (11 scenarios).
`scripts/sandbox/assertions.mjs` gained a `normalizeCmdForPlatform`
helper that maps `python3` → `py -3` on Windows so the assertion is
cross-platform. The first run of the new assertion immediately surfaced
incomplete `drift.md` / `manifest.md` seeding in `install.mjs`, which
was also fixed in this commit.

**Verification:**
All 13 sandbox scenarios pass with the contract checker actually
executed end-to-end on Windows + macOS shells.

**See also:**
- `scripts/sandbox/assertions.mjs` (`normalizeCmdForPlatform`)
- `docs/source-files/tools/archon-cli/lib/install.mjs` (`seedRuntimeLedgers`)

---

### KNOWN-009 — `export_manifest.required_files` references undistributed hook files (closed 2026-05-07)

**Severity:** Bug · **Category:** Distribution boundary

**Symptom:**
After KNOWN-006, `archon-check.py` still failed in adopter installs
because the contract hard-required `.husky/pre-commit`,
`.husky/pre-push`, `.cursor/hooks.json`,
`.cursor/hooks/archon-destructive-guard.mjs`, and `.gitattributes` —
none of which are unconditionally distributed (husky hooks are
language-aware, hook files relocate via `$BINDING_ROOT`, `.gitattributes`
is not in the manifest at all).

**Fix:**
1. Removed the five paths from `export_manifest.required_files` and
   `critical_rule_substrings` in `governance-contract.yaml`.
2. Refactored `repo_self_check` into nested sub-blocks
   (`docs_self_check`, `husky_self_check`) — each declares its own
   `trigger_path` and activates only when that file exists. Adopter
   projects without husky / without `docs/archon/` skip silently.
3. `.gitignore` entries in `run_state.required_static_checks` gained
   `optional: true` so missing-`.gitignore` adopters skip the check.
4. `archon-check.py` was extended with `_run_docs_self_check` /
   `_run_husky_self_check` helpers and an `optional` short-circuit in
   the `required_static_checks` loop.
5. Discovered `.cursor/hooks.json`, `archon-destructive-guard.mjs`, and
   `.gitattributes` had no source under `docs/source-files/` — they were
   ghost rules and were removed entirely.

**Verification:**
All 13 sandbox scenarios pass; `archon-check.py` runs green at the end
of every install path including non-Cursor / non-husky shapes.

**See also:**
- `docs/source-files/.archon/contracts/governance-contract.yaml`
  (`repo_self_check.docs_self_check` / `husky_self_check`)
- `docs/source-files/scripts/archon-check.py`
  (`assert_repo_self_check`)

---

### KNOWN-010 — Distribution-boundary lint missing; rule-of-three triggered (closed 2026-05-07)

**Severity:** Warning · **Category:** Distribution boundary mechanism

**Symptom:**
Four independent items (KNOWN-001 / 006 / 007 / 009) shared the same
root cause — repo-self content leaking into the adopter-bound
`docs/source-files/**` channel — and were each fixed point-by-point with
no mechanism to prevent the next instance.

**Fix:**
Added `scripts/lint-distribution.mjs` enforcing three families of
checks:

1. **Path deny-list** — no source file under
   `docs/source-files/docs/archon/*`, `docs/images/archon/*`, or any
   `AUTHOR_ONLY_FILES` member.
2. **Token deny-list** — distributed text files (those that actually
   appear in `manifest.json`) may not contain repo-only path substrings
   (`docs/archon/`, `docs/images/archon/`, `docs/source-files/`),
   except where an explicit `allow` predicate documents the legitimate
   internal reference.
3. **Contract symmetry** — every path in `governance-contract.yaml`
   mandatory blocks must either be in `manifest.json` (or be a runtime
   ledger seeded by `install.mjs`) OR live inside one of the recognised
   conditional sub-blocks (`repo_self_check.*`, `optional_files`,
   `optional_scan_paths`, …).

`scripts/build-manifest.mjs` invokes the lint at the end of every
manifest regen and refuses to publish on violation. `npm run lint:dist`
exposes it as a standalone target; `npm run lint` chains it after the
existing link / encoding lints.

To clear KNOWN-010, the bring-up surfaced and fixed several stale
internal references: `archon-demand.md`, `archon.mdc`,
`archon-framework/SKILL.md`, and `archon-git-commit/SKILL.md` now
either link to `aaep.site/*` or carry explicit "framework repo only"
disclaimers; `assert_export_manifest`-type repo-only references in
`archon-check.py` and `archon-claim-verifier.mjs` are recognised by the
lint via `allow` predicates.

**Verification:**
- `npm run lint:dist` reports
  `OK: distribution boundary clean (0 violations, 0 known-debt
  exemption(s) tracked)`.
- The lint catches a synthetic regression (manually planting
  `docs/archon/` under `docs/source-files/` immediately fails the build).

**See also:**
- `scripts/lint-distribution.mjs`
- `scripts/build-manifest.mjs` (`runLintDistribution`)
- `package.json` (`lint:dist` script)

---
