---
title: Representative Samples
outline: deep
---

# Representative Samples

A small, hand-picked sample from each gate layer. Prefer reading the [Full Source](/source/) pages for complete listings.

## L1 sample — forbidden-substrings check

From `scripts/archon-check.py`:

```python
def assert_forbidden_substrings(root: Path, contract: dict[str, Any]) -> None:
    forbidden = contract.get("forbidden_substrings")
    if not forbidden:
        return
    files = list(forbidden.get("files", []))
    substrings = list(forbidden.get("substrings", []))
    violations: list[str] = []
    for rel_path in files:
        text = read_text(root, rel_path)
        for phrase in substrings:
            if phrase in text:
                violations.append(f"{rel_path}: forbidden substring {phrase!r}")
    if violations:
        fail("forbidden_substrings violated:\n  " + "\n  ".join(violations))
```

Used, for example, to prevent host-project names from leaking into universal files like `docs/archon/CHANGELOG.md` (see [`contracts/governance-contract.yaml`](/source/contracts/governance-contract)).

## L1 sample — Universal Module Guard

```python
def assert_universal_module_guard(root: Path, contract: dict[str, Any]) -> None:
    guard = contract.get("universal_module_guard")
    if not guard:
        return
    forbidden_terms = json_list_between_markers(
        read_text(root, guard["forbidden_terms_source"]),
        guard["forbidden_terms_marker"],
    )
    patterns = [(term, literal_token_pattern(term)) for term in forbidden_terms]
    # ...scan every file under `scan_paths`; any match fails the gate.
```

The `forbidden_terms` list lives inside `.archon/manifest.md` between `&lt;!-- archon-universal-forbidden-terms:start --&gt; ... :end --&gt;` markers. Adopters declare their project-specific terms there; the checker enforces.

## L2 sample — export contract test

From `scripts/test-archon-export.mjs`:

```js
async function runPlatform(platformName) {
  const outputDir = path.resolve(ROOT, `.tmp-archon-export-${platformName}`)
  await runExportScript(outputDir, platformName)
  await assertBundledImagesListed(outputDir, platformName)
  await assertPlatformRewriteRoundTrip(outputDir, platformName)
  await assertRequiredFilesPresent(outputDir)
  await fs.rm(outputDir, { recursive: true, force: true })
}
```

Running it from the source repo:

```bash
npm run archon:export:test
# [archon-export-test] Cursor and Claude Code bootstrap exports verified.
```

Any new image added to a bundled doc without a matching `DOC_ASSET_FILES` entry fails this gate.

## L3 sample — project validate pipeline

The adopter project wires its own stack. A typical layout:

```jsonc
{
  "scripts": {
    "validate": "npm run archon:records:check && npm run archon:check && npm run archon:verify && npm run archon:export:test && eslint . && tsc --noEmit && vitest run"
  }
}
```

The chain is deliberate:

1. **Records integrity** — regenerate drift/debt/memos from records; fail if hot index drifted from records.
2. **Contract** — `archon-check.py`.
3. **Claim verifier** — walks the repo to prove every load-bearing prose claim is still mechanically true.
4. **Export round-trip** — optional; only meaningful if you ever re-export.
5. **Your own lint + typecheck + test** — the product-side validation declared in `.archon/manifest.md` § Validation Command.

## Pre-commit / pre-push hooks

`.husky/pre-commit` and `.husky/pre-push` run subsets of the chain:

```bash
# .husky/pre-commit (fast gates)
node scripts/archon-records.mjs check-all
python scripts/archon-check.py --root .

# .husky/pre-push (full chain)
npm run validate
```

Cursor users can also opt into [`.cursor/hooks/archon-destructive-guard.mjs`](https://github.com/fmw666/archon-protocol/blob/main/docs/source-files/scripts/) which intercepts destructive shell commands before they hit the terminal (two-layer guard, ADR-9).
