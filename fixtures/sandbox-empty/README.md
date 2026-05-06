# sandbox-empty

The **zero-state** fixture — a directory containing only this README.
No `package.json`, no language toolchain markers, no source files.

## Why this fixture exists

Most adopters install Archon into an existing project (Node, Python, Go,
Rust, …). But the **fully empty directory** is also a real adoption
shape:

- A user who just `mkdir my-new-project && cd my-new-project` and asks
  the agent to bootstrap Archon before they have written a single line
  of business code.
- A bot/CI flow that materialises an Archon governance skeleton into a
  fresh tmp dir as part of repo provisioning.

`install` must succeed in this state — there is no project tree to
respect, no validation command to run, no language toolchain to detect.
The post-install tree is purely the manifest projection plus seeded
runtime ledgers.

## What the install protocol promises here

| Aspect | Expected behaviour |
|--------|-------------------|
| `.archon/soul.md` | created from manifest |
| `.archon/manifest.md` | seeded header (no Validation Command yet — adopter fills) |
| `.archon/drift.md` | exactly one `## install — Archon vX.Y.Z` row |
| `.cursor/` (default IDE) | binding directory laid out |
| `tools/archon-cli/` | only if `--with=cli` |
| Pre-existing files | none — there are none to preserve |

This fixture is the **null reference point** for the install matrix:
the simplest possible "before" state. Compare its post-install tree to
`sandbox-node-ts`'s post-install tree to see exactly what install adds
versus what it leaves untouched.

## Used by scenarios

- `install-empty-dir` (13) — fresh install into pure zero-state.

## Conventions reminder

This fixture deliberately violates one bullet from
`fixtures/README.md` ("at least one runnable test"): there is no
business code to test. That is the whole point — install must not
require anything to be runnable in the target.
