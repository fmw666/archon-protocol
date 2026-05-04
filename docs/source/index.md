# Full Source

Every file Archon ships, indexed by role. Each entry below opens a rendered
view of the file's contents — code is embedded via VitePress snippet
inclusion so the rendered page stays in sync with the source of truth under
`docs/source-files/`.

> **How this section works.** `docs/source-files/` contains an exact mirror of
> the Archon source tree. Every Markdown page in `/source/` uses VitePress
> `&lt;&lt;&lt;` snippet syntax to embed the corresponding file. This lets you read
> the source inline, while keeping the source itself a single source of truth.

## Layout

```
docs/source-files/
├── .archon/                     # Portable cognitive core + project-agnostic state
│   ├── soul.md                  # Identity, cognitive loop, ownership, guardrails
│   ├── soul/
│   │   ├── delivery.md          # demand-mode extension
│   │   └── review.md            # plan + review-mode extension
│   ├── domain-lenses/           # Pre-Verdict lens index (5 lenses + tools)
│   ├── contracts/               # Portable governance contract (YAML)
│   ├── templates/               # Run-State schema + run row template
│   └── VERSION
├── .cursor/                     # Platform surface (rules · commands · agents · skills)
│   ├── commands/
│   ├── agents/
│   ├── rules/
│   └── skills/
├── scripts/                     # Portable helpers
│   ├── archon-check.py          # Governance contract checker (stdlib-only)
│   ├── archon-check.sh          # Bash port of the same contract check
│   ├── archon-run-state.mjs     # Run-State v2 helpers
│   ├── archon-claim-verifier.mjs# ADR-27 claim verifier
│   ├── archon-records.mjs       # Records-folder fold helpers (ADR-22)
│   ├── archon-records-fold.mjs
│   ├── export-archon-core.mjs   # Export pipeline (source → standalone kit)
│   └── test-archon-export.mjs   # Contract test for the export pipeline
└── tools/
    └── archon-cli/              # archon init / doctor / export CLI
```

## By role

### Cognitive core

The soul defines **who the agent is**: identity axioms, ownership contract,
cognitive loop, autonomy principles, evolution axis, guardrail system. Two
mode extensions load on demand.

- [`.archon/soul.md`](/source/soul) — resident core, section-scoped hot-path.
- [`.archon/soul/delivery.md`](/source/soul-delivery) — demand mode.
- [`.archon/soul/review.md`](/source/soul-review) — plan + review mode.

### Commands

Entry points that route a user message into a governed lifecycle.

- [`archon.md`](/source/commands/archon) — top-level routing.
- [`archon-plan.md`](/source/commands/archon-plan) — plan mode.
- [`archon-demand.md`](/source/commands/archon-demand) — delivery mode.
- [`archon-review.md`](/source/commands/archon-review) — review mode.
- [`archon-dashboard.md`](/source/commands/archon-dashboard) — governance state dashboard.

### Sub-agents

Cross-family sub-agents for independence (ADR-independence rule).

- [`archon-reviewer.md`](/source/agents/archon-reviewer) — cycle-level review.
- [`archon-capture-auditor.md`](/source/agents/archon-capture-auditor) — per-delivery hygiene.

### Rules

Universal guardrails that load into every session for Archon-touching files.

- [`archon.mdc`](/source/rules/archon) — decoupling rule + universal module guard.
- [`archon-wake.mdc`](/source/rules/archon-wake) — wake-word routing.

### Skills

Horizontal reusable capabilities triggered by keywords / file types.

- [`archon-framework`](/source/skills/archon-framework) — framework primer.
- [`archon-git-commit`](/source/skills/archon-git-commit) — Archon-governed commit workflow.
- [`archon-signs`](/source/skills/archon-signs) — trigger-indexed reasoning capsules.
- [`blink-dispatch`](/source/skills/blink-dispatch) — sub-agent dispatch gate.
- [`external-agent-patterns`](/source/skills/external-agent-patterns) — external-framework evaluation.

### Domain lenses

Pre-Verdict lens index used at the Decision Gate.

- [Overview](/source/domain-lenses/) · [registry.yaml](/source/domain-lenses/registry)
- Lenses: [dev](/source/domain-lenses/dev) · [design](/source/domain-lenses/design) · [platform](/source/domain-lenses/platform) · [ecosystem](/source/domain-lenses/ecosystem) · [capability](/source/domain-lenses/capability).

### Contracts

Portable governance contract, consumed by the `archon-check.py` and
`archon-check.sh` checkers.

- [`governance-contract.yaml`](/source/contracts/governance-contract)

### Runtime templates

Consumed by `archon-run-state.mjs` to initialize a new delivery's ephemeral
state.

- [`run.template.md`](/source/runtime-templates/run.template)
- [`run-state.schema.json`](/source/runtime-templates/run-state.schema)

### Scripts

Portable helpers. All scripts are stdlib / zero-dep and can run from an
adopter project without any additional install.

- [Overview](/source/scripts/)
- [`archon-check.py`](/source/scripts/archon-check-py)
- [`archon-check.sh`](/source/scripts/archon-check-sh)
- [`archon-run-state.mjs`](/source/scripts/archon-run-state)
- [`archon-claim-verifier.mjs`](/source/scripts/archon-claim-verifier)
- [`archon-records.mjs`](/source/scripts/archon-records)
- [`archon-records-fold.mjs`](/source/scripts/archon-records-fold)
- [`export-archon-core.mjs`](/source/scripts/export-archon-core)
- [`test-archon-export.mjs`](/source/scripts/test-archon-export)

### Archon CLI

Human-facing wrapper (`init` · `doctor` · `export`).

- [Overview](/source/cli/) · [package.json](/source/cli/package)
- Entry: [`bin/archon.mjs`](/source/cli/bin-archon)
- Lib: [`common.mjs`](/source/cli/lib-common) · [`init.mjs`](/source/cli/lib-init) · [`doctor.mjs`](/source/cli/lib-doctor) · [`export.mjs`](/source/cli/lib-export)
