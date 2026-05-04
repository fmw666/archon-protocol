# Testing

Archon is engineered around **mechanical verification, not prose discipline**. This section describes the test surface, shows representative test samples, and explains how to run the same gates inside your own project.

## Why this section exists

Every claim Archon's governance files make is only as good as the check that enforces it. The **Claim Verifier (ADR-27)** makes this explicit: if a governance document asserts a mechanism exists, a machine-executable probe must prove it on every commit.

The test surface therefore ships three kinds of guards:

| Layer | What | Where |
|-------|------|-------|
| **Contract tests** | Universal governance contract — file shapes, cross-references, cap enforcement, forbidden substrings, module guards | `.archon/contracts/governance-contract.yaml` consumed by `scripts/archon-check.py` (Python) and `scripts/archon-check.sh` (Bash) |
| **Export tests** | Every bundled markdown's referenced images must be listed in the export manifest; platform path rewrite must round-trip | `scripts/test-archon-export.mjs` |
| **Project tests** | Adopter-specific lint + typecheck + integration + unit | Adopter's own test harness (e.g., `npm run validate`) |

## Pages

- [Test Strategy](/testing/strategy) — the mental model: how gates compound, why some tests are portable and others are per-project.
- [Representative Samples](/testing/samples) — annotated examples from each test layer.
- [How to Run in Your Project](/testing/how-to-run) — the minimum wiring needed to get the full gate chain running after `archon init`.

## The 30-second summary

Three commands cover the full governance gate chain. After `archon init`, the expected behavior is:

```bash
# Layer 1 — portable contract
python scripts/archon-check.py --root .

# Layer 2 — export manifest round-trip (only meaningful if you ever re-export)
node scripts/test-archon-export.mjs

# Layer 3 — your own project validate pipeline (from manifest.md § Validation Command)
npm run validate   # or equivalent for your stack
```

`archon doctor` wraps Layer 1 and adds structural + hint layers. See [CLI](/setup/cli).
