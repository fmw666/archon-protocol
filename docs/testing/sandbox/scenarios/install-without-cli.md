---
title: "18 · install-without-cli"
test_id: install-without-cli
fixture: fixtures/sandbox-node-ts
ide: Cursor
language: Node 20 + TypeScript
stage: install (module exclusion)
status: pending
---

# 18 · install-without-cli

## What this scenario proves

`archon install --without=cli` correctly **omits the optional `cli`
module** from the install plan. After install:

- `tools/archon-cli/` does **not** exist.
- All required modules (soul, manifest, scripts, contracts, binding,
  …) are still present.
- The drift row records `Modules:` **without** `cli` in the list.

This is the positive proof that **module exclusion at install time
works** — and it is the static contract that the **broken** scenario
[`update-cli-without-cli` (08)](./update-cli-without-cli) tries to
restore later via `archon update --with=cli`. See
[KNOWN-004](https://github.com/fmw666/archon-protocol/blob/main/KNOWN-ISSUES.md)
for why update is currently a no-op there.

## Test environment

| | |
|---|---|
| Fixture | [`fixtures/sandbox-node-ts`](https://github.com/fmw666/archon-protocol/tree/main/fixtures/sandbox-node-ts) |
| IDE | Cursor |
| Manifest version under test | v0.1.x |

## Pre-conditions

1. Fixture copied — runner-managed.
2. No `.archon/`.

## Steps

```text
1. Run `archon install --without=cli`.
2. Observe install completes, no `tools/archon-cli/` is materialised.
```

## Expected outcome

| Check | Expected |
|-------|----------|
| Exit code | 0 |
| `.archon/soul.md` | exists |
| `.cursor/commands/archon.md` | exists |
| `tools/archon-cli/` | **absent** |
| `tools/archon-cli/bin/archon.mjs` | absent |
| `.archon/drift.md` `Modules:` line | does **not** mention `cli` |

## Demo recordings

<VideoPlaceholder test-id="install-without-cli" />

<AsciinemaPlaceholder test-id="install-without-cli" />

## Run records

```bash
node scripts/sandbox-run.mjs --only=install-without-cli
```

<RunRecords test-id="install-without-cli" />

## Known limitations

- Only excludes the `cli` module. A future scenario should sweep
  every optional module (`extensions-demand-pool`, `dashboard`, …)
  with `--without=<id>` to lock the exclusion contract module-by-module.
- Does not exercise the **inverse** combination
  `archon install --with=cli` (covered explicitly by 13, 14).

## Cross-references

- Protocol page: [`/setup/install`](/setup/install)
- Source: [`docs/source-files/tools/archon-cli/lib/install.mjs`](https://github.com/fmw666/archon-protocol/blob/main/docs/source-files/tools/archon-cli/lib/install.mjs) `pickModules()` (lines 115–156).
- Related broken scenario: [08 · update-cli-without-cli](./update-cli-without-cli) (KNOWN-004).
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
    }
  ],
  "steps": [
    {
      "name": "archon install --without=cli",
      "cli": "install",
      "flags": ["--without=cli"]
    }
  ],
  "assertions": [
    { "file_exists": ".archon/soul.md" },
    { "file_exists": ".cursor/commands/archon.md" },
    { "dir_absent": "tools/archon-cli" },
    { "file_absent": "tools/archon-cli/bin/archon.mjs" },
    { "cmd_zero": ["node", "__sb-check.cjs", "drift-modules-excludes", "cli"] },
    { "cmd_zero": ["python3", "scripts/archon-check.py", "--root", "."] }
  ],
  "notes": "Asserts module exclusion at install time. Sister-test of 08 (which exposes a known update bug)."
}
```

<!-- sandbox-spec:end -->
