---
title: "17 · install-half-archon-dir"
test_id: install-half-archon-dir
fixture: fixtures/sandbox-node-ts
ide: Cursor
language: Node 20 + TypeScript
stage: install (edge case)
status: pending
---

# 17 · install-half-archon-dir

## What this scenario proves

The install guard checks **only one file** to decide if Archon is
already present:

```js
if (await pathExists(path.join(targetDir, '.archon', 'soul.md'))) { ... }
```

So if the target has a `.archon/` directory **without** a `soul.md`
inside (typical of a half-aborted earlier install, a manually-created
empty governance directory, or a corrupted state), `archon install`
will treat the project as a **clean target** and proceed.

This scenario locks that behaviour down so it does not silently
change. It is **intentionally documented as a sharp edge** (see
[Known limitations](#known-limitations)) and pairs with the install-matrix
discussion of guard semantics.

## Test environment

| | |
|---|---|
| Fixture | [`fixtures/sandbox-node-ts`](https://github.com/fmw666/archon-protocol/tree/main/fixtures/sandbox-node-ts) + injected half-archon |
| IDE | Cursor |
| Manifest version under test | v0.1.x |

## Pre-conditions

1. Fixture copied — runner-managed.
2. **No** `.archon/soul.md` exists.
3. `.archon/sentinel.txt` injected as prerequisite (so `.archon/`
   *as a directory* already exists).

## Steps

```text
1. Inject `.archon/sentinel.txt` with a marker line.
2. Run `archon install --with=cli`.
3. Observe install proceeds without complaint.
```

## Expected outcome

| Check | Expected |
|-------|----------|
| Step 2 exit code | 0 |
| `.archon/soul.md` | **created** (the install was not blocked) |
| `.archon/sentinel.txt` | preserved (not deleted by install) |
| `.archon/drift.md` install rows | exactly 1 |
| `.archon-backup-*` | absent (no `--force` was needed because the guard didn't fire) |

## Demo recordings

<VideoPlaceholder test-id="install-half-archon-dir" />

<AsciinemaPlaceholder test-id="install-half-archon-dir" />

## Run records

```bash
node scripts/sandbox-run.mjs --only=install-half-archon-dir
```

<RunRecords test-id="install-half-archon-dir" />

## Known limitations

- This is a **documented sharp edge**, not a bug fix in disguise.
  The install guard is intentionally narrow (`soul.md` is the
  canonical "Archon was here" marker; bare `.archon/` directories
  are common during scaffolding). If the team ever decides the
  guard should also fire on a non-empty `.archon/`, this scenario
  must flip its expectations.
- Does not check what happens if `.archon/manifest.md` exists but
  `soul.md` does not — that is a more subtle half-state worth a
  follow-up scenario.

## Cross-references

- Protocol page: [`/setup/install`](/setup/install)
- Source: [`docs/source-files/tools/archon-cli/lib/install.mjs`](https://github.com/fmw666/archon-protocol/blob/main/docs/source-files/tools/archon-cli/lib/install.mjs) line 31.
- Install matrix: [Install Matrix](../install-matrix)

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
      "name": "inject .archon/sentinel.txt (no soul.md)",
      "write_file": {
        "path": ".archon/sentinel.txt",
        "content": "half-archon sentinel for scenario 17\n"
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
    { "file_exists": ".archon/sentinel.txt" },
    { "file_contains": { "path": ".archon/sentinel.txt", "substr": "half-archon sentinel" } },
    { "cmd_zero": ["node", "__sb-check.cjs", "drift-install-count", "1"] },
    { "cmd_zero": ["node", "__sb-check.cjs", "no-backup-dir"] },
    { "cmd_zero": ["python3", "scripts/archon-check.py", "--root", "."] }
  ],
  "notes": "Documents the install guard's narrow check (soul.md only). A bare .archon/ does not block install."
}
```

<!-- sandbox-spec:end -->
