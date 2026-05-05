# Sync Protocol (drift check)

Read-only health check. Fetches the canonical manifest, walks every
Archon-owned path locally, and reports whether anything has drifted from
canonical. **Nothing is written**, except an optional one-line memo if
findings are interesting.

> Agents fetch the executable instruction file at
> [`https://aaep.site/sync.md`](https://aaep.site/sync.md). This page is the
> human-readable view of what the agent will do.

![Comic explainer: cross-ref check](/images/setup/06-cross-ref.png)

## When this protocol applies

The user says:

- "check archon"
- "is archon healthy?"
- "any archon drift?"
- "sync archon"
- "diff archon"

This is **idempotent and side-effect-free** by default. Run it as often as
you like — pre-commit, in CI, or whenever you're suspicious.

## The 7 steps

### 1. Inspect the project

Refuse if `.archon/soul.md` is missing. Suggest **Install** instead.

### 2. Fetch the canonical manifest

```
GET https://aaep.site/manifest.json
```

### 3. Build the canonical set

Filter the manifest to **modules the project has at least one file of**.
Optional modules with zero files installed are reported separately as "not
installed (optional, N files available)" rather than as `missing`.

This avoids confusing output like "0/8 ok" when you simply opted out of the
dashboard.

### 4. Walk and classify

For every path in the canonical set, plus every Archon-owned directory in
the project:

| Label | Meaning |
|-------|---------|
| `ok` | Path in canonical AND sha256 matches |
| `modified` | Path in canonical AND sha256 differs (you edited a framework file) |
| `missing` | Path in canonical AND not present locally (deleted or never installed) |
| `extra` | Path in an Archon-owned directory but not in canonical (custom, or stale from old version) |
| `ledger` | Path in `runtime_ledger_paths` — owned by you, intentionally not diffed |

### 5. Print the report

Per-file diff headers for `modified` files (path + sha256 short hash for
both sides), then a per-module summary:

```
Module: core-soul              11/11 ok
Module: commands                5/5  ok
Module: rules                   2/3  ok, 1 modified
Module: cli                     not installed (optional, 14 files available)
Module: dashboard               not installed (optional, 22 files available)

Totals: 78 ok · 1 modified · 0 missing · 2 extra · 6 ledger
```

### 6. Offer follow-ups

| If… | Suggest |
|-----|---------|
| `modified > 0` | Inspect the diffs; if intentional, document them; if accidental, run `update` to restore |
| `missing > 0` | Run `update` to fetch the missing files |
| `extra > 0` | Inspect — could be project customisations or stale from an old version |
| All clean | "Archon is healthy. ✓" |

### 7. Optional memo

Only if findings are genuinely notable, append a brief one-liner to
`.archon/memos.md`. Routine "all clean" results write nothing.

## Why optional modules show "not installed"

Earlier versions of `sync` printed `0/8 ok` for opted-out modules, which
looked like a failure. The current protocol treats modules with zero
installed files as **uninstalled-by-choice** and labels them clearly.

To install an optional module that's currently absent, run:

```bash
npx @archon/cli@latest update --with=<module-id>
```

## CLI equivalent

```bash
# human-readable report
npx @archon/cli@latest sync

# machine-readable, pipeable
npx @archon/cli@latest sync --json

# private mirror
npx @archon/cli@latest sync --base-url=https://archon.mycorp.com
```

## Raw agent file

[`https://aaep.site/sync.md`](https://aaep.site/sync.md)

## What's next

- See drift? [Update](/setup/update) to restore canonical.
- All clean? Get back to writing demands. The
  [10-Minute Overview](/concepts/overview) is the next conceptual page worth
  reading.
- Ready to leave Archon? [Uninstall](/setup/uninstall).
