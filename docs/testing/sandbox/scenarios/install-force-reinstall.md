---
title: "16 · install-force-reinstall"
test_id: install-force-reinstall
fixture: fixtures/sandbox-node-ts
ide: Cursor
language: Node 20 + TypeScript
stage: install (force)
status: pending
---

# 16 · install-force-reinstall

## What this scenario proves

`archon install --force` is the documented **escape hatch** when an
adopter genuinely wants to reset their Archon installation (e.g.
recovering from a corrupted `.archon/`). The expected behaviour is:

1. The previously-installed files are **backed up** into a fresh
   `.archon-backup-<iso-timestamp>/` sibling directory.
2. The full manifest is re-projected on top of the existing layout.
3. A second `## install` row is appended to `.archon/drift.md` —
   making the drift ledger an **honest installation history** of the
   project (one row per install, including forced re-installs).

This is the positive counterpart of [15 · install-rejects-reinstall](./install-rejects-reinstall).

## Test environment

| | |
|---|---|
| Fixture | [`fixtures/sandbox-node-ts`](https://github.com/fmw666/archon-protocol/tree/main/fixtures/sandbox-node-ts) |
| IDE | Cursor |
| Manifest version under test | v0.1.x |

## Pre-conditions

1. Fixture copied — runner-managed.
2. First `archon install --with=cli` succeeds (prerequisite).

## Steps

```text
1. Run `archon install --with=cli --force` a second time.
2. Observe:
     - exit 0
     - log line "[archon install] backups will be written to .archon-backup-…"
3. Verify backup directory and drift ledger row count.
```

## Expected outcome

| Check | Expected |
|-------|----------|
| Step 1 exit code | 0 |
| `.archon/soul.md` | exists (re-written) |
| `.archon-backup-<iso-timestamp>/` | **exists** (at least one such directory) |
| `.archon/drift.md` install rows | exactly **2** |
| Pre-existing host files (`package.json`, `src/todo.ts`) | unchanged |

## Demo recordings

<VideoPlaceholder test-id="install-force-reinstall" />

<AsciinemaPlaceholder test-id="install-force-reinstall" />

## Run records

```bash
node scripts/sandbox-run.mjs --only=install-force-reinstall
```

<RunRecords test-id="install-force-reinstall" />

## Known limitations

- Does not verify the **content** of the backup directory matches the
  previous `.archon/` byte-for-byte. The current contract only
  promises a backup *exists*; granular content equality is a deeper
  test for a future scenario.
- Does not measure the time interval between the two install rows;
  if a maintainer ever wires drift-row chronology into a contract,
  this scenario gains a new assertion.

## Cross-references

- Protocol page: [`/setup/install`](/setup/install)
- Companion scenario: [15 · install-rejects-reinstall](./install-rejects-reinstall)
- Source: [`docs/source-files/tools/archon-cli/lib/install.mjs`](https://github.com/fmw666/archon-protocol/blob/main/docs/source-files/tools/archon-cli/lib/install.mjs) lines 71–86.

<!-- sandbox-spec:start -->

```json
{
  "runnable": "cli",
  "fixture": "fixtures/sandbox-node-ts",
  "ide_platform": "cursor",
  "prerequisites": [
    {
      "name": "drop sandbox check helper",
      "write_file": {
        "path": "__sb-check.cjs",
        "content": "const fs=require('fs');const op=process.argv[2];const args=process.argv.slice(3);if(op==='drift-install-count'){const want=Number(args[0]);const c=fs.readFileSync('.archon/drift.md','utf8');const m=c.match(/^## install /gm);const n=m?m.length:0;if(n!==want){console.error('drift install rows: want',want,'got',n);process.exit(1)}process.exit(0)}if(op==='no-backup-dir'){const found=fs.readdirSync('.').some(function(x){return x.indexOf('.archon-backup-')===0});if(found){console.error('unexpected .archon-backup-*');process.exit(1)}process.exit(0)}if(op==='has-backup-dir'){const found=fs.readdirSync('.').some(function(x){return x.indexOf('.archon-backup-')===0});if(!found){console.error('expected .archon-backup-* missing');process.exit(1)}process.exit(0)}if(op==='pkg-name-equals'){const p=require('./package.json');if(p.name!==args[0]){console.error('package.json name mutated:',p.name);process.exit(1)}process.exit(0)}if(op==='file-includes'){const text=fs.readFileSync(args[0],'utf8');if(text.indexOf(args[1])===-1){console.error(args[0],'missing',args[1]);process.exit(1)}process.exit(0)}if(op==='drift-modules-excludes'){const c=fs.readFileSync('.archon/drift.md','utf8');const re=new RegExp('^- Modules:.*\\\\b'+args[0]+'\\\\b','m');if(re.test(c)){console.error(args[0],'unexpectedly listed');process.exit(1)}process.exit(0)}console.error('unknown op:',op);process.exit(2);\n"
      }
    },
    {
      "name": "first archon install",
      "cli": "install",
      "flags": ["--with=cli"]
    }
  ],
  "steps": [
    {
      "name": "force reinstall",
      "cli": "install",
      "flags": ["--with=cli", "--force"]
    }
  ],
  "assertions": [
    { "file_exists": ".archon/soul.md" },
    { "file_exists": "package.json" },
    { "file_exists": "src/todo.ts" },
    { "cmd_zero": ["node", "__sb-check.cjs", "has-backup-dir"] },
    { "cmd_zero": ["node", "__sb-check.cjs", "drift-install-count", "2"] },
    { "cmd_zero": ["node", "__sb-check.cjs", "pkg-name-equals", "acme-todos"] },
    { "cmd_zero": ["python3", "scripts/archon-check.py", "--root", "."] }
  ],
  "notes": "Positive test: --force overrides the guard, creates .archon-backup-*, appends a second install row, leaves host files alone."
}
```

<!-- sandbox-spec:end -->
