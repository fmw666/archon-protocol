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

## Closed

_(none yet)_
