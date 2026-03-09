# ADR-001: Response to External Architecture Critiques

**Status**: Accepted  
**Date**: 2026-03-09  
**Context**: Two independent AI reviewers critiqued Archon Protocol's architecture. This ADR records the formal analysis — what we accept, what we reject, and why.

---

## Executive Summary

Eight critiques were raised across two reviews. After auditing the codebase against each claim:

| # | Critique | Verdict | Action |
|---|----------|---------|--------|
| 1 | Soft constraints → use Linter/CI | **Partial accept** | Add Linter verification stage |
| 2 | Full preload → JIT context | **Reject** | Already JIT; document more clearly |
| 3 | Self-evolution is dangerous | **Accept concern** | Add proposed_rules staging area |
| 4 | agents/ + skills/ violates DRY | **Reject** | Cross-tool compatibility, not duplication |
| 5 | Prohibitions → positive examples | **Partial accept** | Add Examples section to constraints |
| 6 | 6-stage overkill for small tasks | **Reject** | `quick` mode already exists |
| 7 | Init detection single-point failure | **Partial accept** | Strengthen validation messaging |
| 8 | Rigid prohibitions kill exceptions | **Accept concern** | Design exception mechanism |

---

## Critique 1: "Soft Constraints Should Be Replaced by Linter/CI"

### Claim
> "Don't expect AI to enforce rules by reading docs. Use ESLint, Husky, CI Pipeline as the real enforcement."

### Analysis

The critique conflates two distinct enforcement layers:

**Layer A — Syntactic/Pattern rules** (e.g., no `any` type, no unused imports): These CAN and SHOULD be enforced by ESLint. We agree.

**Layer B — Architectural rules** (e.g., file size limits, module boundary violations, missing 3-state async handling, test coverage gaps): These CANNOT be expressed as ESLint rules. No linter can enforce "every async section must have skeleton + error + retry." These require cognitive understanding — exactly what a protocol-guided agent provides.

Archon Protocol operates primarily at Layer B. The constraints are **pre-generation filters** injected into the agent's context window BEFORE code is written, not post-generation checks. The agent avoids writing `any` not because it reads a linter report, but because the prohibition exists in its active context during generation.

### Decision

- **Accept**: Add a Linter verification stage to `archon-demand` (between Stage 1 and Stage 2) where the agent runs `lint` and reads output. This catches what the agent missed.
- **Reject**: The premise that constraints should ONLY be enforced by tools. Protocol-level constraints catch architectural violations that no tool can express.

### Architecture Principle

> **"Agent proposes under constraints; Linter verifies the proposable."**
>
> Constraints reduce the probability of violations at generation time. Linters catch the remainder at verification time. Neither alone is sufficient.

---

## Critique 2: "All 27 Skills Preloaded — Use JIT Context Instead"

### Claim
> "If an Agent carries 27 skill packs to write a few lines of business logic, it wastes tokens and causes Lost-in-the-Middle effect."

### Analysis

**This critique is factually incorrect.** It stems from a surface-level reading of the file listing without understanding the loading mechanism.

Evidence from the codebase:

1. `archon-demand.md` frontmatter preloads exactly **4** constraint skills, not 27:
   ```yaml
   skills:
     - archon-code-quality      # 41 lines
     - archon-test-sync         # ~30 lines
     - archon-async-loading     # ~25 lines
     - archon-error-handling    # ~30 lines
   ```
   Total constraint text: ~126 lines. This is negligible in a 128K+ context window.

2. The 7 workflow agents are **NOT** preloaded. They're invoked as sub-agents with isolated context:
   - `archon-self-auditor` → called by demand Stage 3 (isolated context)
   - `archon-test-runner` → called by demand Stage 3.4 (isolated context)

3. The architecture document `single-agent.md` explicitly addresses this:
   > "The agent's context window is finite. Running it as a focused skill keeps the main task context clean."

**The architecture already IS JIT.** Command agents invoke internal agents on-demand. Constraint skills are minimal and always relevant (every code change needs quality + test checks).

### Decision

- **Reject**: The premise is based on a misunderstanding.
- **Accept**: Document the loading mechanism more prominently in the architecture overview to prevent future confusion.

---

## Critique 3: "Self-Evolution (Stage 3.6) Is Dangerous"

### Claim
> "AI often generalizes edge cases into universal rules. After a few months, SKILL.md becomes a garbage dump of self-contradictory rules."

### Analysis

This is a **legitimate concern** with nuance. The critics correctly identify a real risk — unchecked AI-generated rules can accumulate noise.

However, the current system already has guardrails they didn't notice:

1. **`prohibition-quality.test.js`**: Every prohibition must contain a grep-able concrete pattern and be ≥20 characters. Vague rules fail CI.
2. **`ecosystem-integrity.test.js`**: Automatically detects contradictions — "no pattern is both ❌ prohibited and ✅ promoted."
3. **`archon-self-auditor.md` Dimension 6**: Uses the word "**suggest**" — it reports findings, it doesn't auto-commit them.

But `archon-demand.md` Stage 3.6 says "add to constraint skill" more directly, creating ambiguity about whether this is automatic or requires review.

### Decision

- **Accept the concern**: Add a `proposed_rules.md` staging mechanism.
- **Process**:
  1. Stage 3.6 writes new discoveries to `docs/proposed-rules.md` (staging area)
  2. `archon-audit` includes a "Pending Rules Review" dimension
  3. Rules move to constraint skills only after explicit user approval or passing contradiction tests
- **Existing tests remain** as the automated quality gate.

---

## Critique 4: "agents/ and skills/ Violates DRY"

### Claim
> "Same rules written in agents/*.md AND skills/*/SKILL.md. This violates DRY and will cause inconsistency."

### Analysis

**This critique fundamentally misunderstands the dual-layer architecture.**

The duality exists because different AI tools have different discovery mechanisms:

| Tool | Discovers agents from | Discovers skills from |
|------|----------------------|----------------------|
| Cursor | `.cursor/agents/` | `.cursor/skills/` |
| Claude Code | `.claude/agents/` | `.claude/skills/` |
| Codex | — | `.codex/skills/` |
| Copilot | — | Skills discovery |
| VS Code | — | Skills discovery |
| Gemini CLI | — | Skills discovery |

To support 27+ tools, you MUST deploy to multiple locations. The source files in `agents/` and `skills/` ARE the single source of truth — `templates/install.sh` deploys them to tool-specific directories.

Furthermore, `ecosystem-integrity.test.js` enforces consistency:
- Every agent must have a matching skill (line 60-64)
- Content alignment is verified through cross-references

The critique's own suggestion — "write a build script to generate skills/ from agents/" — is essentially what `install.sh` already does, just in the opposite direction.

### Decision

- **Reject**: The dual-layer is a cross-tool compatibility requirement, not DRY violation.
- **The source repo IS the SSOT**. Deployment targets are generated artifacts.
- `ecosystem-integrity.test.js` is the automated consistency checker.

---

## Critique 5: "Prohibitions Should Be Positive Examples (Few-Shot)"

### Claim
> "LLMs understand 'do this' better than 'don't do this'. Too many negative prompts cause defensive programming. Use code examples instead."

### Analysis

**Partially valid, partially oversimplified.**

The claim that LLMs handle positive examples better has some empirical basis. However:

1. Archon's prohibitions are NOT vague negations. Each one includes the positive alternative:
   ```
   ❌ `any` type — use the real type or `unknown`
   ❌ Empty `catch {}` blocks — at minimum log or rethrow
   ```
   The text after `—` IS the positive instruction.

2. `prohibition-quality.test.js` enforces that each prohibition contains a concrete, grep-able code pattern. This makes prohibitions function as **pattern-matching rules**, not vague negations.

3. However, adding 1-2 code examples per constraint skill WOULD strengthen the signal. The current format tells the agent WHAT to avoid; examples show HOW the correct pattern looks in context.

### Decision

- **Partial accept**: Add an optional `## Examples` section to constraint skills showing correct patterns.
- **Reject**: Replacing prohibitions with only positive examples. Prohibitions serve as explicit boundary markers. The `—` format already provides the positive alternative.
- **Architecture principle**: Prohibitions define the boundary; examples illuminate the path.

---

## Critique 6: "6-Stage Pipeline Is Overkill for Small Tasks"

### Claim
> "Using the full 6-stage process for a one-line fix is like using Full Concentration Breathing to kill a mosquito."

### Analysis

**Already addressed in the codebase.** `archon-demand.md` lines 77-79:

```
## Opt-Out
- `quick` → skip Stages 2, 3.5, 3.6, 5
- `no-commit` → skip Stage 6
- `skip-tests` → skip Stage 3.4
```

The `quick` flag strips the pipeline to: Implement → Rule compliance check → Code structure check → Edge cases → Fix → Done. This is the minimum viable audit for any code change.

### Decision

- **Reject**: The mechanism already exists.
- **Accept**: Document `quick` mode more prominently. Add guidance on when to use each mode in `docs/guide/getting-started.md`.

---

## Critique 7: "Init Detection Is a Single Point of Failure"

### Claim
> "If /init misdetects the tech stack by even 10%, all subsequent constraints are based on wrong assumptions."

### Analysis

**Partially valid** but mitigated:

1. `archon-init.md` Step 3: "**Confirm ambiguous detections with user.**" Human confirmation is built in.
2. The config file (`archon.config.yaml`) is plaintext YAML — trivially editable.
3. The health check (Step 4) can detect drift between config and actual project state.

The real risk is not detection error but **detection scope** — e.g., a full-stack project with both TypeScript frontend and Python backend might get constraints optimized for only one side.

### Decision

- **Partial accept**: Enhance init to explicitly warn about multi-language projects and recommend per-directory constraint profiles.
- **Reject**: The "cascade failure" framing. Config is editable, health checks exist, and constraints are additive (wrong constraints don't break correct ones — they're just noise).

---

## Critique 8: "Rigid Prohibitions Kill Necessary Exceptions"

### Claim
> "In extreme performance optimization or legacy code scenarios, you MUST break rules. The protocol's rigidity might make AI refuse the optimal solution."

### Analysis

**Valid edge case.** There ARE situations where breaking a rule is the correct decision:

- Using `any` when interfacing with an untyped third-party library
- Exceeding file size limits during a migration that will be split in the next PR
- Synchronous loading for critical above-the-fold content

The current system has no formal exception mechanism. An agent that encounters a legitimate need to break a rule has no protocol-sanctioned way to do so.

### Decision

- **Accept**: Design an inline exception annotation:
  ```typescript
  // @archon-exception: QUAL-001 — Legacy integration requires `any` here
  ```
- Stage 3.1 (rule compliance) will recognize `@archon-exception` annotations and skip the marked prohibition for that specific line/block.
- Exceptions are logged and visible in `archon-audit` reports.
- This preserves rigidity as default while allowing documented, traceable deviations.

---

## Meta-Analysis: What Both Reviewers Got Wrong

### The "Document-Based Protocol" Misconception

Both reviewers frame Archon Protocol as a "document-based spec" that naively trusts AI reading comprehension. This misses the key architectural insight:

**Archon Protocol is not documentation. It is executable architecture.**

- Constraint skills are not "guidelines" — they are context-window payloads injected into the agent at invocation time. The agent doesn't "remember" to follow them; they're part of its active instruction set.
- The 6-stage pipeline is not a "checklist" — it's a sequence of sub-agent invocations, each with isolated context and focused scope.
- The prohibition format (`❌ pattern — alternative`) is not a "suggestion" — it's a pattern-matching rule enforced by automated tests (`prohibition-quality.test.js`).

### The "Just Use Tools" Fallacy

The suggestion to replace protocol constraints with ESLint/CI assumes that all code quality dimensions are tool-expressible. They are not:

| Dimension | ESLint can check? | Archon can check? |
|-----------|-------------------|-------------------|
| No `any` type | ✅ | ✅ |
| File size limits | ⚠️ (custom rule) | ✅ |
| 3-state async handling | ❌ | ✅ |
| Module boundary violations | ❌ | ✅ |
| Test coverage for changes | ❌ | ✅ |
| Architectural consistency | ❌ | ✅ |

**Tools and protocols are complementary layers, not substitutes.**

---

## Summary of Actions

### Immediate (this PR)
1. ✅ Create `docs/decisions/` directory and this ADR
2. ✅ Create `todo/debt_radar.md` with improvement backlog

### Planned (next iterations)
3. Add Linter verification stage to `archon-demand` (Critique 1)
4. Add `proposed-rules.md` staging mechanism (Critique 3)
5. Add `## Examples` section to constraint skills (Critique 5)
6. Design `@archon-exception` annotation system (Critique 8)
7. Document `quick` mode more prominently (Critique 6)
8. Enhance init for multi-language project detection (Critique 7)
