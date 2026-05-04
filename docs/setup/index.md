# Install & Boot

The **how** of getting Archon running in your project. Pick the path that
matches your patience.

## Paths

| Path | Time | When to use |
|------|------|-------------|
| [5-Minute Quickstart](/setup/quickstart) | 5 min | You just want something running and you will read the why later. |
| [Full Setup Guide](/setup/full-guide) | 30 min | You want to understand every file the kit lands and why it is there. |
| [Archon CLI](/setup/cli) | 2 min | You have the Archon source repo checked out and want `archon init` to do the scaffolding for you. |

## Two-line version

```bash
# From an Archon source checkout:
node tools/archon-cli/bin/archon.mjs init ../my-new-project --platform=cursor
cd ../my-new-project && # fill .archon/manifest.md, then start a session
```

The post-init banner tells you exactly which four things to edit before your
first `/archon` run:

1. `.archon/manifest.md` — Product, Tech Stack, Validation Command.
2. `.archon/decisions.md` — replace the placeholder ADR-1.
3. `npm run validate` (or equivalent) — wire lint + typecheck + test.
4. Read [5-Minute Quickstart](/setup/quickstart) — first delivery cycle walkthrough.

## State templates

Archon ships five durable state files at `.archon/`. These are what your
agent and humans edit; the templates are exactly what `archon init` lands:

- [manifest.template.md](/setup/templates/manifest.template) — project hot context.
- [decisions.template.md](/setup/templates/decisions.template) — project ADR log.
- [drift.template.md](/setup/templates/drift.template) — drift counter + archive index.
- [debt.template.md](/setup/templates/debt.template) — active debt registry.
- [memos.template.md](/setup/templates/memos.template) — stakeholder memo hot index.

## Verify the install

After `archon init`, run:

```bash
archon doctor .
```

Three layers of audit:

- **L1 Structural** — required files present.
- **L2 Contract** — delegates to `scripts/archon-check.py`.
- **L3 Hints** — unfilled placeholders, missing validation command.

Green across all three means you can start writing `/archon` demands.
