# ADR-003: Executable Enforcement — Documents SHOULD, Processes MUST

**Status**: Accepted
**Date**: 2026-03-11
**Context**: Analysis of context window compression behavior in AI coding tools (Cursor, Claude Code, etc.) revealed that document-layer constraints can be lost during long conversations. This ADR formally establishes the two-layer enforcement model and redefines Archon Protocol as a complete operating system — not just a documentation system, but a unified system encompassing documents, lint, tests, and CI.

---

## The Problem

ADR-001 established that "tools and protocols are complementary layers, not substitutes." This framing treated both layers as equal. Production experience reveals they are **not equal in reliability**:

| Enforcement mechanism | Persistence | Can be compressed? | Can be bypassed? |
|----------------------|-------------|-------------------|-----------------|
| `alwaysApply` Cursor Rule | Per-request injection | ❌ No | ❌ No |
| Driver file read during conversation | Session-bound | ✅ Yes (long conversations) | ✅ Yes (AI forgets) |
| `pnpm lint` (ESLint / Biome) | Process-level | ❌ No (runs in OS process) | ❌ No (CI blocks merge) |
| `pnpm test` (Vitest / Jest) | Process-level | ❌ No (runs in OS process) | ❌ No (CI blocks merge) |
| CI pipeline check | Persistent | ❌ No (runs on server) | ❌ No (blocks deployment) |

**Key insight**: In a 200-message conversation, a ❌ prohibition read at message 5 may be compressed to "the AI was told to follow code quality rules" by message 50. The specific, grep-verifiable pattern is lost. But a lint rule or test case **never degrades** — it runs fresh every time, in its own process, independent of the AI's context window.

---

## The Architectural Principle

> **Documents can achieve SHOULD. Only process execution can achieve MUST.**

A document-layer constraint (driver, rule, skill) **guides** the AI's generation-time decisions. It reduces the probability of violations. But it cannot **guarantee** compliance — the AI is a probabilistic system, and its context can be compressed, diluted, or ignored.

A process-layer constraint (lint rule, test case, CI check) **enforces** compliance mechanically. It runs in its own address space, has no context window limitations, and produces a binary pass/fail verdict. It cannot be negotiated with or compressed away.

### The Two-Layer Model

```
┌─────────────────────────────────────────────────────────────┐
│  DOCUMENT LAYER (SHOULD — generative guidance)              │
│                                                             │
│  Rule · Skill · Driver · ADR · proposed-rules               │
│                                                             │
│  Purpose:                                                   │
│  - Guide AI decisions at generation time                    │
│  - Capture institutional knowledge across sessions          │
│  - Self-evolve through Stage 3.6 feedback loop              │
│  - Discover new constraints and anti-patterns               │
│                                                             │
│  Nature: Advisory. Can be compressed. Session-bound.        │
│  Strength: Covers architectural intent (Layer B) that       │
│            no tool can express as a static rule.             │
├─────────────────────────────────────────────────────────────┤
│  PROCESS LAYER (MUST — executable enforcement)              │
│                                                             │
│  Lint rules · Structural tests · Unit tests · CI pipeline   │
│                                                             │
│  Purpose:                                                   │
│  - Final authority on code compliance                       │
│  - Unbypassable gate before merge/deploy                    │
│  - Persistent across sessions, immune to context loss       │
│                                                             │
│  Nature: Mandatory. Cannot be compressed. Process-level.    │
│  Strength: 100% reliable for expressible constraints.       │
│            Binary pass/fail. No probabilistic decay.        │
├─────────────────────────────────────────────────────────────┤
│  BRIDGE: /archon-init                                       │
│                                                             │
│  Detects project's lint + test ecosystem at bootstrap.      │
│  Maps document-layer constraints to process-layer rules.    │
│  Ensures AAEP integrates into the project's existing CI.    │
└─────────────────────────────────────────────────────────────┘
```

### The Constraint Maturity Lifecycle

Every constraint begins as a document and **aspires to become a process**:

```
Discovery          Document            Process             CI Gate
(Stage 3.6)   →   (proposed-rules  →  (lint rule or    →  (CI pipeline
                    → driver ❌)        structural test)    blocks merge)

SHOULD             SHOULD              MUST                MUST
(advisory)         (generation-time)   (process-level)     (deploy-level)
```

Not every document constraint CAN become a process constraint. "Every async section must have skeleton + error + retry" requires cognitive understanding — no lint rule or test can express it mechanically. These remain in the document layer as SHOULD constraints, and that's fine. The document layer's value is in covering what the process layer **cannot reach**.

But every constraint that CAN be expressed as a lint rule or test **MUST** be. Leaving a machine-expressible constraint in the document layer alone is a reliability gap.

---

## Decision

### 1. Archon Protocol is a complete OS, not a documentation system

The OS includes:
- **Documents** (drivers, skills, ADRs) — the knowledge base and generative guidance
- **Lint** — syntax-level and pattern-level enforcement
- **Tests** — structural scan tests and unit tests that encode constraints
- **CI** — the pipeline that runs lint + tests and gates deployment

All four are first-class components of the operating system. The `/archon-init` boot sequence must integrate with the project's existing lint and test infrastructure — not just deploy markdown files.

### 2. `/archon-init` gains Step 3.5: Lint & Test Ecosystem Integration

During bootstrap, init must:
1. Detect the project's linter and its configuration
2. Detect the project's test framework and its configuration
3. Detect CI pipeline configuration
4. Map each ❌ prohibition to determine if it's already covered by a lint rule
5. Report the coverage gap: which constraints are document-only (SHOULD) vs. process-enforced (MUST)

### 3. `/archon-demand` Stage 3.6 gains a constraint-hardening step

When Stage 3.6 (Knowledge Evolution) discovers a new anti-pattern or constraint, it must also evaluate:
- Can this constraint be expressed as a lint rule? → Recommend or create the rule
- Can this constraint be expressed as a structural test? → Recommend or create the test
- Neither? → Document-layer only (SHOULD), with a note explaining why

### 4. `test-sync` driver Section 5 (Structural Scan Tests) is upgraded from SHOULD to MUST

When a ❌ prohibition is grep-verifiable (contains a concrete code pattern), a corresponding structural scan test MUST exist or be created. This is no longer optional.

### 5. `archon.config.yaml` gains an `enforcement` section

Records the project's lint/test ecosystem details so that all syscalls can reference them.

---

## What This Changes in the Existing Architecture

### Before (ADR-001 model)

```
"Agent proposes under constraints; Linter verifies the proposable."
 → Constraints and Linter are complementary equals.
```

### After (ADR-003 model)

```
"Documents guide. Processes enforce. Init bridges them."
 → Documents are SHOULD (generative guidance, self-evolving knowledge).
 → Processes are MUST (executable law, unbypassable).
 → Init integrates AAEP into the project's enforcement ecosystem.
 → The OS is the union of both layers, not just the documents.
```

The Constraint Pyramid in `os-model.md` gains a new foundation layer:

```
┌─────────────────────────────────────────────┐
│  Layer 1: Kernel (always resident)          │  Identity, core loop
│  "Who you are"                              │  MUST (alwaysApply)
├─────────────────────────────────────────────┤
│  Layer 2: Drivers (document constraints)    │  ❌ prohibitions
│  "What you should not do"                   │  SHOULD (generative)
├─────────────────────────────────────────────┤
│  Layer 3: Syscalls (standard workflows)     │  Pipeline stages
│  "How you should do it"                     │  SHOULD (procedural)
├─────────────────────────────────────────────┤
│  Layer 4: Filesystem (reference on demand)  │  Architecture, ADRs
│  "Why we do it this way"                    │  Knowledge base
├─────────────────────────────────────────────┤
│  Layer 5: Process Enforcement (NEW)         │  Lint + Test + CI
│  "What you MUST comply with"                │  MUST (unbypassable)
│  The final authority. Blocks merge/deploy.  │
└─────────────────────────────────────────────┘
```

Layer 5 is the **foundation** — it sits beneath all other layers as the ultimate backstop. Layers 1-4 reduce the probability of violations at generation time. Layer 5 catches what remains with 100% reliability.

---

## Relationship to Existing Principles

| Principle | How ADR-003 extends it |
|-----------|----------------------|
| P1: Environment Predictability > Agent Intelligence | Process-layer enforcement makes the environment maximally predictable — lint/test results are deterministic |
| P3: Prohibitions > Instructions | Prohibitions in documents are SHOULD; prohibitions backed by lint/test are MUST |
| P7: Self-Maintenance > Manual Updates | The evolution loop now includes "can this constraint become a lint rule or test?" as a mandatory evaluation |

This ADR also introduces **Principle 8: Process Enforcement > Document Enforcement** — see `core-principles.md`.

---

## Risks and Mitigations

| Risk | Mitigation |
|------|-----------|
| Not all constraints are machine-expressible | Document layer remains for cognitive/architectural constraints. ADR-003 does not eliminate the document layer — it adds a process layer beneath it |
| Generating lint rules / tests adds complexity to Stage 3.6 | Start with structural scan tests (simple grep-based). Custom lint rules only when a corresponding ESLint/Biome rule exists or is trivial |
| Projects without CI won't benefit from deploy-level gates | Init detects CI presence. If absent, recommend adding a minimal CI config. Process-level enforcement (local lint/test) still works |

---

## Summary

- **Documents = SHOULD**: Guide AI generation, capture knowledge, self-evolve. Can be compressed or forgotten. Advisory.
- **Processes = MUST**: Lint rules, structural tests, CI gates. Run in their own process. Cannot be compressed, bypassed, or negotiated with. Mandatory.
- **AAEP = the union of both**: Not "a documentation system with some tests." An operating system that encompasses documents, lint, tests, and CI as integrated components.
- **Init = the bridge**: Must deeply understand and integrate with the project's existing lint/test ecosystem from day one.
