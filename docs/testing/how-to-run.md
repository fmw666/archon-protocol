---
title: How to Run in Your Project
outline: deep
---

# How to Run in Your Project

A minimum-viable gate chain for an adopter project, assuming you have run `archon init` and have the full kit landed.

## Prerequisites

- Node ≥ 18 (for `.mjs` portable helpers and the CLI).
- Python 3 (for `archon-check.py`). Bash users can run `archon-check.sh` instead.
- Your project's own lint / typecheck / test commands.

## Step 1 — Run L1 immediately after init

```bash
archon doctor .
```

Expected output:

```
[L1 Structural]
  [OK]   .archon/soul.md
  [OK]   .archon/manifest.md
  ...
[L2 Contract]
[archon-check] OK: portable governance contract checks passed.
  [OK]   archon-check.py passed.
[L3 Hints]
  [WARN] 55 unfilled `<!-- ... -->` placeholders in manifest.md — fill at least Product / Tech Stack / Validation Command before the first delivery.
```

Warnings are expected until you fill the manifest.

## Step 2 — Fill the manifest's Validation Command

Open `.archon/manifest.md` and declare your project's validation command. For a typical Node stack:

```md
## Validation Command

`npm run validate` covers: eslint · tsc --noEmit · vitest run · bundle budget check.
```

Then add the matching npm script:

```jsonc
{
  "scripts": {
    "validate": "npm run archon:records:check && npm run archon:check && eslint . && tsc --noEmit && vitest run",
    "archon:records:check": "node scripts/archon-records.mjs check-all",
    "archon:check": "python scripts/archon-check.py --root ."
  }
}
```

## Step 3 — Wire the pre-commit hook

Archon ships `.husky/pre-commit` inside the kit. If you use [`husky`](https://typicode.github.io/husky/), add it to your `package.json`:

```jsonc
{
  "scripts": {
    "prepare": "husky"
  }
}
```

Then `npm install` will activate the pre-commit gate.

Manual install (no husky):

```bash
cp .husky/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

## Step 4 — Verify the chain runs

```bash
npm run validate
```

All green means:

- Records hot indices match the records folder (ADR-22).
- Portable contract satisfied.
- Your own lint/typecheck/test passes.

## Troubleshooting

### `archon-check.py` reports `forbidden_substrings`

You or the agent wrote a host-project name (or a project-specific term declared in `manifest.md § Universal Module Guard`) into a universal Archon file. Either:

1. Move the mention out of the universal file, or
2. If the term is no longer project-specific, remove it from the `forbidden_terms` JSON array in `manifest.md`.

### `lint-integrity.mjs` reports a broken cross-reference

Run:

```bash
node scripts/lint-links.mjs
```

This surfaces every internal link that no longer resolves. Typical causes:

- A doc was renamed without updating its back-references.
- A heading anchor changed shape (e.g., em-dash added, different punctuation). Prefer the nearest stable ASCII-only parent heading for cross-links.

### `archon:verify` (claim verifier) fails

A governance document claims a mechanism exists, but the probe cannot find it. Either:

- Fix the prose (the mechanism was removed/renamed), or
- Fix the probe (the mechanism exists but moved — update the probe anchor in `soul/delivery.md` § Claim Verifier).

This is the ADR-27 loop in action: prose and reality must match mechanically.

## Moving to full L3

Once your own test suite is mature, add it to `Validation Command` and let the pre-push hook (or CI) run `npm run validate`. That single command is now your full three-layer gate.
