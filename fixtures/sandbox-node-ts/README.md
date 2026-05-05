# sandbox-node-ts

A minimal **Node + TypeScript** project used as an Archon install target
in the sandbox test matrix.

## Simulated product context

When an agent runs `install archon` against this fixture, use these
answers for the placeholder prompts:

- `PROJECT_NAME`: `acme-todos`
- `TECH_STACK`: `Node 20 · TypeScript 5 · Vitest`
- `VALIDATION_COMMAND`: `npm run validate`
- `IDE_PLATFORM`: depends on scenario (Cursor / Claude Code / Codex / …)

## Stack

| Layer | Choice |
|-------|--------|
| Runtime | Node ≥ 20 |
| Language | TypeScript 5 (`tsc --noEmit` for typecheck) |
| Test runner | Vitest |
| Pre-commit | `husky` + `lint-staged` (post-install will rewrite to call `archon-check.py`) |

## Files

```
.
├── README.md             ← this file
├── package.json
├── tsconfig.json
└── src/
    ├── todo.ts           ← trivial business module
    └── todo.test.ts      ← passing test so `npm run validate` is green
```

## Local sanity check

```bash
npm install
npm run validate
```

Expected exit code: `0`.

## Used by which scenarios

- `install-cursor-node`
- `boot-cursor-node`
- `update-cursor-node`
- `update-cli-without-cli`
- `sync-clean`
- `sync-modified`
- `uninstall-archive`

See [`docs/testing/sandbox/test-matrix.md`](../../docs/testing/sandbox/test-matrix.md).
