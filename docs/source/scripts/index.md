# Scripts

Portable helpers. **Stdlib-only / zero-dependency**, runnable from any adopter project without additional installs.

## Governance contract checkers

Two ports of the same contract (Node / Bash-Python) so an adopter can pick whichever stack they have.

- [`archon-check.py`](/source/scripts/archon-check-py) — Python stdlib-only implementation. Consumes `.archon/contracts/governance-contract.yaml`.
- [`archon-check.sh`](/source/scripts/archon-check-sh) — Bash port of the same contract check.

## Run-State v2 helpers

Ephemeral per-delivery state lives at `.archon/runs/&lt;run_id&gt;/` and is regenerated from event records (ADR-22).

- [`archon-run-state.mjs`](/source/scripts/archon-run-state) — create / update / read run state; schema-validated.
- [`archon-records.mjs`](/source/scripts/archon-records) — records-folder fold helpers; regenerate hot indices from immutable records.
- [`archon-records-fold.mjs`](/source/scripts/archon-records-fold) — low-level fold primitives used by `archon-records`.

## Claim Verifier (ADR-27)

Catches "said-vs-truth" drift by walking the repo to prove a prose claim is still mechanically true.

- [`archon-claim-verifier.mjs`](/source/scripts/archon-claim-verifier)

## Export pipeline

Produces a standalone Archon kit for Cursor or Claude Code from this source repo.

- [`export-archon-core.mjs`](/source/scripts/export-archon-core) — export pipeline; reads `.archon/VERSION`; ships LICENSE + NOTICE + CHANGELOG + VERSION inside every kit.
- [`test-archon-export.mjs`](/source/scripts/test-archon-export) — contract test: every bundled markdown's referenced images must be listed in `DOC_ASSET_FILES`.
