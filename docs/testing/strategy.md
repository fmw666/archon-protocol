---
title: Test Strategy
outline: deep
---

# Test Strategy

## Three gate layers

Archon's verification surface is deliberately layered so different failure modes are caught by different mechanisms.

### L1 — Portable governance contract

Consumed from `.archon/contracts/governance-contract.yaml` by two equivalent checkers:

- `scripts/archon-check.py` — Python stdlib-only (runs on any CI image with Python 3).
- `scripts/archon-check.sh` — Bash port.

What it verifies:

- **File shape** — required headings / sections exist in `soul.md`, `manifest.md`, `decisions.md`, etc.
- **Cross-references** — every `&lt;file&gt; §&lt;heading&gt;` link resolves mechanically.
- **Line caps** — `.archon/soul.md`, `.archon/manifest.md`, `decisions.md`, drift / debt hot indices obey their declared budget.
- **Archive hygiene** — drift / debt / memos archive headers carry the expected row counts.
- **Forbidden substrings** — host-project terms do not leak into universal modules (Universal Module Guard).
- **Preservation Axis probes** (ADR-28) — load-bearing headings keep their body shape.

### L2 — Export manifest round-trip

`scripts/test-archon-export.mjs` runs a dry export for every platform target and asserts:

- Every image referenced by a bundled markdown is listed in `DOC_ASSET_FILES`.
- Platform path rewrites (`.cursor/` → `.claude/`, `.mdc` → `.md`) round-trip cleanly.
- Required core files are present.

This gate catches the most common export regression: adding a new comic to `architecture.md` without updating the export manifest.

### L3 — Project validate pipeline

The adopter declares this in `.archon/manifest.md` § Validation Command. Example (Node stack):

```bash
npm run validate  # lint + typecheck + test + bundle-budget
```

Archon does not dictate what goes here — it only insists that **some** validation command exists and passes before close-out.

## Gate composition

The three layers compose via the `npm run validate` entry on the authoring repo:

```text
validate
├── archon:records:check   # records-folder fold integrity (ADR-22)
├── archon:check           # archon-check.py (L1)
├── archon:verify          # claim verifier (ADR-27)
├── archon:export:test     # test-archon-export.mjs (L2)
└── <project-specific>     # eslint + tsc + vitest + bundle budget (L3)
```

Every pre-commit and pre-push hook runs the same chain (via `.husky/`).

## What is **not** tested mechanically

Intentional gaps:

- **Design quality** — visual polish, copy tone. These use Plan-mode human review, not CI.
- **ADR trade-off quality** — a rejected alternative can be technically well-framed yet strategically wrong. Captured in ADR-N rows (negative ADRs) + re-evaluation conditions.
- **Domain correctness in user code** — Archon governs the governance, not the product logic. The product team owns product tests.

The line is: *if a mistake can be mechanized, it must be*. If it cannot, the governance surface is upgraded until it can (Lint-Rule Bridge — ADR-20).
