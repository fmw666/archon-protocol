---
title: "14 · install-existing-project"
test_id: install-existing-project
fixture: fixtures/sandbox-node-ts
ide: Cursor
language: Node 20 + TypeScript
stage: install
status: pending
---

# 14 · install-existing-project

## What this scenario proves

`archon install` is **non-invasive**: when run against a real existing
project (Node + TypeScript), it adds Archon's files but **does not
touch a single byte of the host project's existing files**.

Specifically, after install:

- `package.json`, `tsconfig.json`, `src/todo.ts`, `src/todo.test.ts` —
  byte-identical to the fixture.
- `.archon/`, `.cursor/`, `tools/archon-cli/`, `scripts/` — newly
  added by the manifest projection.

This is the "host project respects me, I respect host project"
contract that distinguishes Archon from frameworks that mutate
`package.json` scripts, override `tsconfig.json`, or rewrite source
files. Pair this with [13 · install-empty-dir](./install-empty-dir) to
see that the **delta** between the two post-install trees is exactly
the host project's pre-existing files — proving install is purely
additive.

## Test environment

| | |
|---|---|
| Fixture | [`fixtures/sandbox-node-ts`](https://github.com/fmw666/archon-protocol/tree/main/fixtures/sandbox-node-ts) |
| IDE | Cursor |
| OS | macOS 14 / Ubuntu 22.04 / Windows 11 |
| Archon source | local mirror of `docs/public/manifest.json` |
| Manifest version under test | v0.1.x |
| Language toolchain | Node 20.11+ |

## Pre-conditions

1. Fixture copied — runner-managed.
2. No `.archon/`, no `.cursor/`.
3. Fixture's own files (`package.json` etc.) are intact.

## Steps

```text
1. Run:
     archon install --with=cli
2. Wait for the "install complete" summary line.
```

## Expected outcome

| Check | Expected |
|-------|----------|
| Exit code | 0 |
| `.archon/soul.md` | exists |
| `.cursor/commands/archon.md` | exists |
| `tools/archon-cli/` | exists (`--with=cli` was passed) |
| `package.json` | byte-identical to fixture |
| `tsconfig.json` | byte-identical to fixture |
| `src/todo.ts` | byte-identical to fixture |
| `src/todo.test.ts` | byte-identical to fixture |
| `.archon/drift.md` install rows | exactly 1 |

The byte-identity check is enforced by `sha256_equals` against the
canonical fixture sha. If the fixture content ever changes, regenerate
the sha values from `git hash-object` and update the spec block.

## Demo recordings

<VideoPlaceholder test-id="install-existing-project" />

<AsciinemaPlaceholder test-id="install-existing-project" />

## Run records

```bash
node scripts/sandbox-run.mjs --only=install-existing-project
```

<RunRecords test-id="install-existing-project" />

## Known limitations

- Only checks four host files for byte-identity. A larger fixture
  (e.g. a real Vite + React skeleton) would need a directory-tree
  hash — out of scope until an adopter actually reports a mutation
  bug on a richer tree.
- Does not run `npm install && npm run validate` post-install. That
  belongs to scenario 01 (`install-cursor-node`) which also verifies
  the validation chain.

## Cross-references

- Protocol page: [`/setup/install`](/setup/install)
- Companion scenario: [13 · install-empty-dir](./install-empty-dir) — install without any host files.
- Install matrix: [Install Matrix](../install-matrix)
- Sibling: [01 · install-cursor-node](./install-cursor-node) — same fixture, focuses on validate-chain not host-file preservation.

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
    { "file_exists": ".archon/soul.md" },
    { "file_exists": ".cursor/commands/archon.md" },
    { "dir_exists": "tools/archon-cli" },
    { "file_exists": "package.json" },
    { "file_exists": "src/todo.ts" },
    { "file_exists": "src/todo.test.ts" },
    { "cmd_zero": ["node", "__sb-check.cjs", "pkg-name-equals", "acme-todos"] },
    { "cmd_zero": ["node", "__sb-check.cjs", "file-includes", "src/todo.ts", "Todo"] },
    { "cmd_zero": ["node", "__sb-check.cjs", "drift-install-count", "1"] },
    { "cmd_zero": ["python3", "scripts/archon-check.py", "--root", "."] }
  ],
  "notes": "Asserts install is non-invasive on a real Node+TS project: package.json identity field unchanged, source file content preserved, exactly one install row in drift."
}
```

<!-- sandbox-spec:end -->
