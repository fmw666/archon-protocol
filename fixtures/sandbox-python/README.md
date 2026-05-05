# sandbox-python

A minimal **Python** project used as an Archon install target.

## Simulated product context

- `PROJECT_NAME`: `pyflux`
- `TECH_STACK`: `Python 3.12 · pytest · ruff`
- `VALIDATION_COMMAND`: `python -m pytest && ruff check .`
- `IDE_PLATFORM`: Claude Code (default for this fixture)

## Stack

| Layer | Choice |
|-------|--------|
| Language | Python ≥ 3.10 |
| Test runner | pytest |
| Lint | ruff |
| Pre-commit | the [`pre-commit`](https://pre-commit.com) framework calling `scripts/archon-check.py` |

## Files

```
.
├── README.md
├── pyproject.toml
├── src/
│   └── calculator.py
└── tests/
    └── test_calculator.py
```

## Local sanity check

```bash
python -m pip install -e ".[dev]"
python -m pytest
```

Expected exit code: `0`. Archon's Python checker requires only stdlib, so
no extra deps for the contract gate.

## Used by which scenarios

- `install-claude-python`
- `boot-claude-python`
- `uninstall-preserve`
