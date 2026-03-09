# Debt Radar

Active improvement backlog for Archon Protocol. Items sourced from ADRs, audits, and external reviews.

## Priority: High

### [DEBT-001] Linter Integration Stage
**Source**: ADR-001, Critique 1  
**Description**: Add a Linter verification step to `archon-demand` between Stage 1 (Implement) and Stage 2 (Performance Audit). Agent runs project's lint command, reads errors, and fixes before proceeding.  
**Effort**: Small — ~10 lines added to `archon-demand.md` and `archon-demand` skill.

### [DEBT-002] Evolution Staging Area
**Source**: ADR-001, Critique 3  
**Description**: Stage 3.6 should write new discoveries to `proposed-rules.md` instead of directly modifying constraint skills. Rules graduate to constraints only after user approval or passing automated contradiction checks.  
**Effort**: Medium — new file, update Stage 3.6 in demand + self-auditor, add review step to audit.

### [DEBT-003] Exception Annotation System
**Source**: ADR-001, Critique 8  
**Description**: Design `@archon-exception: <RULE-ID> — <reason>` inline annotation. Stage 3.1 recognizes these and skips the marked prohibition. Exceptions logged in audit reports.  
**Effort**: Medium — update self-auditor dimension 1, document format, add test.

## Priority: Medium

### [DEBT-004] Constraint Skill Examples
**Source**: ADR-001, Critique 5  
**Description**: Add `## Examples` section to each constraint skill with 1-2 correct code snippets. Provides positive signal alongside prohibitions.  
**Effort**: Medium — 4 constraint skills × ~20 lines each.

### [DEBT-005] Quick Mode Documentation
**Source**: ADR-001, Critique 6  
**Description**: Document `quick`, `no-commit`, `skip-tests` flags prominently in getting-started guide and command reference. Add decision tree: "When to use which mode."  
**Effort**: Small — documentation only.

### [DEBT-006] Multi-Language Init Detection
**Source**: ADR-001, Critique 7  
**Description**: Enhance `archon-init` to detect multi-language projects (e.g., TypeScript frontend + Python backend) and warn about constraint scope. Suggest per-directory constraint profiles.  
**Effort**: Small — update init agent/skill.

## Priority: Low

### [DEBT-007] AGENTS.md Path Alignment
**Source**: Internal audit  
**Description**: AGENTS.md references paths that don't exist or use different names. Align paths with actual directory structure.  
**Effort**: Small — update AGENTS.md references.

### [DEBT-008] Package.json Script Alignment
**Source**: Internal audit  
**Description**: AGENTS.md references `pnpm dev` and `pnpm lint` which don't exist in package.json. Either add scripts or update AGENTS.md.  
**Effort**: Trivial.

### [DEBT-009] Chinese Architecture Docs Outdated
**Source**: Internal audit  
**Description**: `docs/zh/architecture/overview.md` still describes the old "pure Skill" architecture. It references "no AGENTS.md, no .cursor/agents/" which contradicts the current dual-layer Agent-first, Skill-fallback model. Needs full rewrite to match English version.  
**Effort**: Medium — full rewrite of zh architecture docs.

## Completed

- [DEBT-001] Linter Integration Stage — Stage 1.5 added to archon-demand
- [DEBT-002] Evolution Staging Area — `proposed-rules.md` created, Stage 3.6 redirected
- [DEBT-003] Exception Annotation System — `@archon-exception` support added to self-auditor and demand
- [DEBT-007] AGENTS.md Path Alignment — paths corrected to match actual structure
- [DEBT-008] Package.json Script Alignment — `pnpm dev` → `pnpm docs:dev`, removed `pnpm lint`
