# sandbox-go

A minimal **Go** project used as an Archon install target.

## Simulated product context

- `PROJECT_NAME`: `goping`
- `TECH_STACK`: `Go 1.22 · stdlib testing`
- `VALIDATION_COMMAND`: `go test ./... && go vet ./...`
- `IDE_PLATFORM`: OpenAI Codex CLI (default)

## Stack

| Layer | Choice |
|-------|--------|
| Language | Go ≥ 1.22 |
| Test | `go test` (stdlib) |
| Pre-commit | plain `.git/hooks/pre-commit` shell script (no husky, no pre-commit framework) |

## Files

```
.
├── README.md
├── go.mod
├── main.go
└── main_test.go
```

## Local sanity check

```bash
go test ./...
```

Expected exit code: `0`.

## Used by which scenarios

- `install-codex-go`
