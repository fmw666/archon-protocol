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

Per-item resolution details live in the linked commit messages (rationale,
verification steps, follow-on lessons). This table is the speed-grep entry
point for "have we hit this class of issue before?" — extend the table
rather than re-introduce long Closed entries.

| ID | Severity | Closed | Category | One-line symptom | Fix commit |
|---|---|---|---|---|---|
| [KNOWN-001](#known-001) | Warning | 2026-05-07 | Distribution boundary | `scripts/` module shipped author-only export tooling and the comic-doc-refactor SKILL to every adopter. | `f8ffbb5` |
| [KNOWN-004](#known-004) | Bug | 2026-05-07 | CLI lifecycle | `archon update --with=<mod>` was a no-op when the version was unchanged; `--with`/`--without` were silently dropped. | `0ac7b2e` |
| [KNOWN-005](#known-005) | Cosmetic | 2026-05-07 | CLI lifecycle | `archon uninstall` left empty `tools/archon-cli/{bin,lib}` directories because `pruneEmptyDirs` did not recurse. | `0ac7b2e` |
| [KNOWN-006](#known-006) | Bug | 2026-05-07 | Distribution boundary | `archon-check.py` hard-required four `docs/archon/*` files that `manifest.json` never distributes; every fresh adopter install failed the checker. | `f8ffbb5` |
| [KNOWN-007](#known-007) | Bug | 2026-05-07 | Distribution boundary | Adopter-facing `NOTICE` declared sub-licenses on `docs/archon/**` and `docs/images/archon/**` that no adopter receives. | `f8ffbb5` |
| [KNOWN-008](#known-008) | Bug | 2026-05-07 | Verification surface | `install-*` sandbox scenarios asserted `archon-check.py` *exists* but never executed it; CI was blind to KNOWN-006/009. | `0ac7b2e` |
| [KNOWN-009](#known-009) | Bug | 2026-05-07 | Distribution boundary | `export_manifest.required_files` listed `.husky/*`, `.cursor/hooks*`, `.gitattributes` as mandatory; non-Cursor / non-husky adopters always failed. | `f8ffbb5` |
| [KNOWN-010](#known-010) | Warning | 2026-05-07 | Distribution boundary mechanism | Rule-of-three on the distribution-boundary cluster (KNOWN-001/006/007/009); no mechanism prevented the next instance. | `f8ffbb5` |

### Anchors

The anchors below exist purely so the table's links resolve. If you need
the full original write-up of any closed item (symptom / fix / verification /
lessons), check `git log --grep=KNOWN-<id> -p KNOWN-ISSUES.md` — the
content was preserved in commit history at the time of resolution.

<a id="known-001"></a><a id="known-004"></a><a id="known-005"></a>
<a id="known-006"></a><a id="known-007"></a><a id="known-008"></a>
<a id="known-009"></a><a id="known-010"></a>

### Cross-cutting lessons (carry-forward)

These are the patterns the closed cluster taught us; they are the actual
debt the table above is paying down on behalf of future contributors.

1. **Distribution boundary** — the canonical channel
   (`manifest.json` + `docs/source-files/`) only carries adopter-bound
   content. Anything that describes archon-protocol-the-repository's
   own build artefacts (VitePress docs under `docs/archon/**`,
   generated images under `docs/images/archon/**`, author-only
   scripts) must live outside `docs/source-files/` *and* outside the
   mandatory blocks of `governance-contract.yaml`. Enforcement now
   lives in `scripts/lint-distribution.mjs`; do not weaken it without
   filing a successor `KNOWN-###`.

2. **Repo self-check vs. portable check** — `governance-contract.yaml`'s
   `repo_self_check.*` sub-blocks each declare a `trigger_path` and
   activate iff that path exists. Use this pattern (not a separate
   contract file) when adding rules that should fire only inside the
   archon-protocol source repository or only on a specific adopter
   shape (husky, cursor binding, …).

3. **"File exists" is not "command runs"** — sandbox scenarios must
   exercise commands via `cmd_zero` / `cmd_nonzero`, not just
   `file_exists`. Documentation-side promises ("checker exits 0 after
   install") have to be backed by a machine-graded assertion in the
   same scenario page, otherwise CI will let regressions through.

4. **Rule of three** — when the third instance of a single root cause
   shows up, stop fixing the symptom and ship a mechanism. KNOWN-010
   is the canonical example: KNOWN-001/006/007 + KNOWN-009 → one lint
   replaces four point-fixes.
