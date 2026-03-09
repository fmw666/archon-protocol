# ADR-002: EvoMap Experience Absorption

**Status**: Accepted  
**Date**: 2026-03-09  
**Context**: EvoMap, a production-grade project with battle-tested AI development practices, provided 5 concrete suggestions for strengthening Archon Protocol. This ADR records the analysis and integration decisions.

---

## Executive Summary

EvoMap's suggestions came from real production incidents and cross-AI collaboration experience. Unlike theoretical critiques, these are patterns proven in a live codebase with Next.js 15, React 19, SSR, and multi-AI workflows.

| # | Suggestion | Verdict | Action |
|---|-----------|---------|--------|
| 1 | Battle-tested Constraints | **Accept** | Add `## Battle-tested Prohibitions` section to all constraint skills |
| 2 | Structural Scan Tests | **Accept** | Add scan test template to `archon-test-sync` |
| 3 | Multi-AI Handoff | **Partial accept** | Create `archon-handoff` constraint skill (reframed for single-agent) |
| 4 | Framework-specific constraints | **Accept** | Create `templates/constraints/` with Next.js and React templates |
| 5 | Type system guidance | **Accept** | Expand type safety section in `archon-code-quality` |

---

## Detailed Analysis

### Suggestion 1: Battle-tested Constraints

**What EvoMap does**: Derives extremely specific prohibitions from production incidents — not generic rules, but patterns that actually broke production. Each prohibition carries an `[INCIDENT]` tag explaining what went wrong.

**Why this matters**: Archon's existing prohibitions are generic ("don't use `any`"). Generic prohibitions catch 80% of issues, but the remaining 20% — the production-breaking ones — require project-specific constraints derived from real failures.

**Decision**: Add a `## Battle-tested Prohibitions` section to every constraint skill. This section starts empty and is populated through Stage 3.6 (Knowledge Evolution) as the project accumulates production experience. Format:

```
- ❌ <concrete pattern> — <what to do instead>
  [INCIDENT]: <what went wrong>
```

**Files changed**: All 4 constraint skills (`archon-code-quality`, `archon-test-sync`, `archon-async-loading`, `archon-error-handling`).

### Suggestion 2: Structural Scan Tests

**What EvoMap does**: Creates automated test files that scan the entire `src/` directory for prohibited patterns using static analysis. These run in CI and catch violations regardless of who wrote the code.

**Why this matters**: AI self-checking (Stage 3.1) is probabilistic. A structural scan test is deterministic — it physically prevents prohibited patterns from entering the codebase, even from human developers.

**Decision**: Add a "Structural Scan Tests" workflow step to `archon-test-sync`. Includes:
- When to create a structural scan test
- Template with `scanFiles()` pattern
- Real-world examples (hydration safety, theme consistency, z-index ordering)

**Relationship to Stage 1.5**: Stage 1.5 runs the project's linter after implementation. Structural scan tests extend this concept — they ARE the linter for architecture-level patterns that ESLint can't catch.

**Files changed**: `archon-test-sync/SKILL.md` — new Step 5: Structural Scan Tests.

### Suggestion 3: Multi-AI Handoff

**What EvoMap does**: Uses a 1500+ line document as a contract between frontend AI and backend AI, with 3 rounds of cross-AI review and a "usage guide" for each AI.

**Archon's position**: Archon Protocol is built on single-agent architecture (see `architecture/single-agent.md`). Adding multi-agent coordination would undermine the core design.

**However**: The concept of a structured handoff document is valuable even in single-agent mode:
- When the same agent works on frontend and backend in separate sessions
- When human developers need to understand API contracts
- When another AI tool (or the same tool in a new session) picks up unfinished work
- In microservice architectures where multiple repositories exist

**Decision**: Create `archon-handoff` as a **constraint skill**, not a workflow agent. It defines a document format for interface contracts — without introducing multi-agent coordination. The handoff document serves as a "context bridge" across session boundaries, not an inter-agent communication protocol.

**Files changed**: New skill `skills/archon-handoff/SKILL.md`. Added to `archon-demand` and `archon-self-auditor` skill preloads.

### Suggestion 4: Framework-Specific Constraints

**What EvoMap does**: Encodes deep Next.js/React 19 knowledge as rules — Cookie→Server Prop→Provider→Store patterns, `isLoggedIn` vs `user` usage boundaries, catch-all route proxy patterns.

**Why this matters**: Archon's existing constraints are framework-agnostic. This handles 80% of code quality issues. But 20% of production bugs come from framework-specific traps: hydration mismatches, SSR state management, server/client component boundaries.

**Decision**: Create `templates/constraints/` directory with framework-specific constraint templates:
- `archon-nextjs-ssr.md` — Server Components, hydration safety, auth state patterns
- `archon-react-hydration.md` — State initialization, conditional rendering safety, mutation sequencing

These are NOT deployed by default. `/archon-init` detects the framework from `package.json` and deploys the matching template as an additional constraint skill.

**Files changed**: New directory `templates/constraints/` with 2 templates. Updated `archon-init` agent/skill to deploy framework constraints.

### Suggestion 5: Type System Guidance

**What EvoMap does**: Organizes types by business domain (`types/common.js`, `types/agents.js`, `types/billing.js`) with explicit rules: cross-domain types in `common`, new domain = new file, no cross-file type copying.

**Decision**: Expand the Type Safety section in `archon-code-quality`:
- Domain-based type file organization pattern
- Cross-domain types in `common.ts`
- New prohibitions: no `@typedef`/`interface` copying across files, no inline type literals for shared entities

**Files changed**: `archon-code-quality/SKILL.md` — expanded Type Safety section + 2 new prohibitions.

---

## Key Principle: Absorption Without Assimilation

EvoMap's practices are derived from a specific project context (Next.js 15, React 19, multi-AI collaboration). Archon Protocol's role is to provide **the framework for capturing such practices**, not to hard-code them.

- Battle-tested Prohibitions → the **section** is universal, the **content** is project-specific
- Structural Scan Tests → the **pattern** is universal, the **regex** is project-specific
- Framework Constraints → the **template system** is universal, the **templates** are framework-specific
- Handoff Documents → the **format** is universal, the **contracts** are project-specific

This is AAEP's directed evolution at work: we absorb the *mechanism*, not the *instance*.

---

## References

- [ADR-001: Response to External Critiques](./ADR-001-response-to-external-critiques.md)
- [Single-Agent Architecture](../architecture/single-agent.md)
- [Feedback Loop](../architecture/feedback-loop.md)
