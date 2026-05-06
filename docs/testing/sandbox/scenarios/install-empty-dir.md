---
title: "13 · install-empty-dir"
test_id: install-empty-dir
fixture: fixtures/sandbox-empty
ide: Cursor
language: (none — bare directory)
stage: install
status: pending
---

# 13 · install-empty-dir

## What this scenario proves

`archon install` succeeds on a **fully empty directory** — no
`package.json`, no `pyproject.toml`, no source files, nothing but a
single placeholder README. This is the **null reference point** for
the install-matrix: the simplest "before" state imaginable, and the
upper bound on what install can possibly add.

A passing run here proves three things:

1. Install does **not** require any pre-existing language manifest
   (`package.json` / `pyproject.toml` / `go.mod` / `Cargo.toml`).
2. Install does **not** require any business code or runnable tests.
3. Seeded runtime ledgers (`.archon/drift.md`, `.archon/manifest.md`,
   etc.) are created from `seedRuntimeLedgers()` even when the target
   tree is otherwise empty.

This scenario pairs with [14 · install-existing-project](./install-existing-project)
to **bracket the install behaviour**: 13 is "install adds everything",
14 is "install adds Archon files and touches nothing else".

## Test environment

| | |
|---|---|
| Fixture | [`fixtures/sandbox-empty`](https://github.com/fmw666/archon-protocol/tree/main/fixtures/sandbox-empty) |
| IDE | Cursor (default; binding directory `.cursor/` is laid out) |
| OS | macOS 14 / Ubuntu 22.04 / Windows 11 |
| Archon source | local mirror of `docs/public/manifest.json` (sandbox runner) |
| Manifest version under test | v0.1.x |
| Language toolchain | none |

## Pre-conditions

1. Fixture copied to a fresh tmp dir (the runner does this automatically).
2. No `.archon/` and no `.cursor/` exist.

## Steps

```text
1. Run:
     archon install --with=cli
2. Wait for the "install complete" summary line.
```

## Expected outcome

| Check | Expected |
|-------|----------|
| Exit code (CLI) | 0 |
| `.archon/VERSION` | exists, matches manifest version |
| `.archon/soul.md` | exists |
| `.archon/manifest.md` | exists (seeded header) |
| `.archon/drift.md` | exists; contains exactly **one** `## install` row |
| `.cursor/commands/archon.md` | exists |
| `.cursor/rules/` | exists |
| `.cursor/skills/` | exists |
| `tools/archon-cli/` (because `--with=cli`) | exists |
| `.archon-backup-*` (no force, no prior install) | absent |

## Demo recordings

<VideoPlaceholder test-id="install-empty-dir" />

<AsciinemaPlaceholder test-id="install-empty-dir" />

## Run records

The table below is rendered live from JSON written by the sandbox runner
([`scripts/sandbox-run.mjs`](https://github.com/fmw666/archon-protocol/blob/main/scripts/sandbox-run.mjs))
under `docs/testing/sandbox/runs/install-empty-dir/`. To add a new row, run

```bash
node scripts/sandbox-run.mjs --only=install-empty-dir
```

<RunRecords test-id="install-empty-dir" />

## Known limitations

- Does not test what happens if the directory does not exist at all.
  `install.mjs` calls `fs.mkdir(targetDir, { recursive: true })` so a
  non-existent path is handled, but that is exercised by the CLI's own
  unit tests, not by the sandbox.
- Does not validate the ledger seeding *content* (drift body, manifest
  header) line-by-line — only that the files exist. A future scenario
  may diff the seeded headers against `seedRuntimeLedgers()` literals.

## Cross-references

- Protocol page: [`/setup/install`](/setup/install)
- Companion scenario: [14 · install-existing-project](./install-existing-project) — same install, but on a non-empty fixture.
- Install matrix index: [Install Matrix](../install-matrix)
- CLI source: [`docs/source-files/tools/archon-cli/lib/install.mjs`](https://github.com/fmw666/archon-protocol/blob/main/docs/source-files/tools/archon-cli/lib/install.mjs)

<!-- sandbox-spec:start -->

```json
{
  "runnable": "cli",
  "fixture": "fixtures/sandbox-empty",
  "ide_platform": "cursor",
  "prerequisites": [
    {
      "name": "drop sandbox check helper",
      "write_file": {
        "path": "__sb-check.cjs",
        "content": "const fs=require('fs');const op=process.argv[2];const args=process.argv.slice(3);if(op==='drift-install-count'){const want=Number(args[0]);const c=fs.readFileSync('.archon/drift.md','utf8');const m=c.match(/^## install /gm);const n=m?m.length:0;if(n!==want){console.error('drift install rows: want',want,'got',n);process.exit(1)}process.exit(0)}if(op==='no-backup-dir'){const found=fs.readdirSync('.').some(function(x){return x.indexOf('.archon-backup-')===0});if(found){console.error('unexpected .archon-backup-*');process.exit(1)}process.exit(0)}if(op==='has-backup-dir'){const found=fs.readdirSync('.').some(function(x){return x.indexOf('.archon-backup-')===0});if(!found){console.error('expected .archon-backup-* missing');process.exit(1)}process.exit(0)}if(op==='pkg-name-equals'){const p=require('./package.json');if(p.name!==args[0]){console.error('package.json name mutated:',p.name);process.exit(1)}process.exit(0)}if(op==='file-includes'){const text=fs.readFileSync(args[0],'utf8');if(text.indexOf(args[1])===-1){console.error(args[0],'missing',args[1]);process.exit(1)}process.exit(0)}if(op==='drift-modules-excludes'){const c=fs.readFileSync('.archon/drift.md','utf8');const re=new RegExp('^- Modules:.*\\\\b'+args[0]+'\\\\b','m');if(re.test(c)){console.error(args[0],'unexpectedly listed');process.exit(1)}process.exit(0)}console.error('unknown op:',op);process.exit(2);\n"
      }
    }
  ],
  "steps": [
    {
      "name": "archon install --with=cli",
      "cli": "install",
      "flags": ["--with=cli"]
    }
  ],
  "assertions": [
    { "file_exists": ".archon/VERSION" },
    { "file_exists": ".archon/soul.md" },
    { "file_exists": ".archon/manifest.md" },
    { "file_exists": ".archon/drift.md" },
    { "dir_exists": ".cursor/commands" },
    { "dir_exists": ".cursor/rules" },
    { "dir_exists": ".cursor/skills" },
    { "file_exists": ".cursor/commands/archon.md" },
    { "dir_exists": "tools/archon-cli" },
    { "file_exists": "scripts/archon-check.py" },
    { "cmd_zero": ["node", "__sb-check.cjs", "drift-install-count", "1"] },
    { "cmd_zero": ["node", "__sb-check.cjs", "no-backup-dir"] }
  ],
  "notes": "Null reference point for the install matrix: empty dir + minimal flags. The __sb-check.cjs helper is written by a prerequisite step and provides cross-platform-safe assertions (Windows shell-quoting strips embedded quotes from `node -e ...`)."
}
```

<!-- sandbox-spec:end -->
