---
title: "15 · install-rejects-reinstall"
test_id: install-rejects-reinstall
fixture: fixtures/sandbox-node-ts
ide: Cursor
language: Node 20 + TypeScript
stage: install (negative)
status: pending
---

# 15 · install-rejects-reinstall

## What this scenario proves

`archon install` **refuses to clobber** an existing Archon installation
unless `--force` is given. The exact guard is in
[`docs/source-files/tools/archon-cli/lib/install.mjs`](https://github.com/fmw666/archon-protocol/blob/main/docs/source-files/tools/archon-cli/lib/install.mjs)
lines 31–38:

```text
if (await pathExists(path.join(targetDir, '.archon', 'soul.md'))) {
  if (!force) {
    throw new Error(
      'This project already has Archon installed (.archon/soul.md exists). Use `archon update` or pass --force to re-install.',
    )
  }
}
```

A passing run here proves three things:

1. The second `archon install` returns **non-zero**.
2. No new files are written (no `.archon-backup-*` directory is
   created — backups only happen on `--force`).
3. The first install's drift ledger is **untouched** — exactly one
   `## install` row, not two.

This is the sibling negative test of [16 · install-force-reinstall](./install-force-reinstall),
which exercises the explicit override path.

## Test environment

| | |
|---|---|
| Fixture | [`fixtures/sandbox-node-ts`](https://github.com/fmw666/archon-protocol/tree/main/fixtures/sandbox-node-ts) (post first install) |
| IDE | Cursor |
| Manifest version under test | v0.1.x |

## Pre-conditions

1. Fixture copied — runner-managed.
2. **First** `archon install --with=cli` succeeds (prerequisite).
3. `.archon/soul.md` exists.

## Steps

```text
1. Run `archon install --with=cli` a second time.
2. Observe the CLI exits non-zero with the "already has Archon installed"
   error message.
```

## Expected outcome

| Check | Expected |
|-------|----------|
| Step 1 exit code | non-zero |
| `.archon/soul.md` | still exists, unchanged |
| `.archon/drift.md` install rows | exactly **1** (the prerequisite's row) |
| `.archon-backup-*` directory | **absent** (no force, no backup) |

The runner's `allow_nonzero: true` flag tells the harness to **expect**
the non-zero exit and proceed to assertions instead of marking the
scenario as failing.

## Demo recordings

<VideoPlaceholder test-id="install-rejects-reinstall" />

<AsciinemaPlaceholder test-id="install-rejects-reinstall" />

## Run records

```bash
node scripts/sandbox-run.mjs --only=install-rejects-reinstall
```

<RunRecords test-id="install-rejects-reinstall" />

## Known limitations

- Does not assert the **exact** error text. If the wording in
  `install.mjs` changes, this scenario stays green; only the exit code
  is checked. A future enhancement could capture stderr and `file_matches`
  it (current runner doesn't expose stderr to the assertion phase).
- Does not test the `--force` half — that lives in scenario 16.

## Cross-references

- Protocol page: [`/setup/install`](/setup/install)
- Companion scenario: [16 · install-force-reinstall](./install-force-reinstall)
- Source: [`docs/source-files/tools/archon-cli/lib/install.mjs`](https://github.com/fmw666/archon-protocol/blob/main/docs/source-files/tools/archon-cli/lib/install.mjs) lines 31–38.

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
      "name": "second archon install (expected to refuse)",
      "cli": "install",
      "flags": ["--with=cli"],
      "allow_nonzero": true
    }
  ],
  "assertions": [
    { "file_exists": ".archon/soul.md" },
    { "file_exists": ".archon/drift.md" },
    { "cmd_zero": ["node", "__sb-check.cjs", "drift-install-count", "1"] },
    { "cmd_zero": ["node", "__sb-check.cjs", "no-backup-dir"] },
    { "cmd_zero": ["python3", "scripts/archon-check.py", "--root", "."] }
  ],
  "notes": "Negative test: the second install must be rejected with non-zero exit, no backup, no drift mutation."
}
```

<!-- sandbox-spec:end -->
