# Core Principles

These are the first principles of Archon Protocol. Every design decision traces back to one of these. If a new feature contradicts a principle, the feature is wrong.

## Principle 1: Environment Predictability > Agent Intelligence

> **Don't try to make the AI smarter. Make the environment more predictable.**

An operating system doesn't make the CPU faster — it makes the CPU's power reliably, consistently, efficiently utilized. Archon Protocol doesn't make AI more capable — it makes AI's capability reliably, consistently, efficiently directed at the right problems.

This means:
- Constraints shape behavior more reliably than instructions
- Structure eliminates decisions more effectively than guidelines
- Predictable environments produce predictable output, regardless of which AI model runs within them

## Principle 2: Boring Consistency > Local Brilliance

> **10 consistent but ordinary modules are more valuable than 5 brilliant but inconsistent ones.**

AI is a pattern-matching machine. When it sees 10 features with identical directory structure, naming conventions, and data-fetching patterns, it will replicate the 11th perfectly. When 10 features use 3 different styles, AI randomly picks one — or invents a 4th.

This means:
- Rigid numeric limits (`≤ 300 lines`) beat vague guidance ("appropriate size")
- One data-fetching pattern everywhere beats the "best" pattern per module
- Conformity to project standards outranks conformity to framework best practices when they conflict

## Principle 3: Prohibitions > Instructions

> **"Don't do X" is more enforceable than "Do Y."**

When AI faces a problem, it generates 10 possible solutions. A positive instruction ("use pattern A") can be interpreted differently in different contexts. A prohibition ("never use pattern B, C, D") works regardless of context — the banned patterns are concrete and grep-verifiable.

This means:
- Every constraint skill leads with `❌` prohibitions, not guidelines
- Prohibitions must contain backtick-wrapped code patterns (verifiable by search)
- Prohibitions never change meaning with context (empty `catch {}` is always wrong)
- Instructions may vary by context (when to use RTK Query vs useState depends on the task)

## Principle 4: Benchmark Imitation > Abstract Guidance

> **AI learns by imitating real code, not by understanding abstract rules.**

A benchmark module — real, compiling, tested, running in production — teaches AI more than any documentation. When a constraint skill says "refer to `features/account/`", AI replicates the directory structure, naming, data flow, test patterns, and type organization. When it says "follow this example snippet", AI only copies the snippet's style.

This means:
- `archon.config.yaml` declares `benchmarks:` — real modules that represent the target architecture
- `/archon-demand` Stage 1 reads benchmarks before writing new code
- Skills reference benchmark paths, not hypothetical code
- When documentation and benchmark code conflict, benchmark code wins (then update the documentation)

## Principle 5: Local Self-Sufficiency > Global Documentation

> **AI should be able to start working after reading only the current directory + its immediate dependencies.**

AI's context window is finite. If understanding a module requires jumping to 20 files, reading 3 docs, and tracing 5 historical decisions, AI will lose context halfway through. Architecture must ensure each module is locally comprehensible.

This means:
- Feature directories are self-contained: components, hooks, utils, types, tests
- Cross-feature imports are prohibited (use shared store or libs)
- Each module's dependencies are explicit and minimal
- The "fan-in" of knowledge required to work on any file stays low

## Principle 6: Negative Freedom > Positive Direction

> **Constrain what AI must NOT do. Leave creative space for HOW it accomplishes goals.**

AI's creativity doesn't need constraints — it naturally explores diverse solutions. AI's consistency needs constraints — it naturally produces different implementations each time. The optimal constraint set maximizes consistency while preserving flexibility.

This means:
- Constraints define boundaries, not paths
- The constraint set grows monotonically (prohibitions are added, rarely removed)
- Each `❌` kills a specific failure mode without prescribing the solution
- `@archon-exception` annotations provide escape hatches for justified violations

## Principle 7: Self-Maintenance > Manual Updates

> **Every problem the system encounters must strengthen the system's defenses.**

The system must have a feedback loop: bug discovered → root cause analyzed → prohibition added → bug class permanently eliminated. Without this loop, the same mistakes recur across sessions because AI has no persistent memory.

The document lifecycle:

```
Discover problem → Temporary fix → Codify as rule → Expand to workflow → Document as reference

                    proposed-rules.md    Constraint skill    Architecture doc
                    "don't do this"      "do it this way"    "why we do it this way"
```

This means:
- Stage 3.6 (Knowledge Evolution) is not optional — it's the growth mechanism
- `proposed-rules.md` is the staging area, not a suggestion box
- Refactor reports capture what was learned (immune memory)
- The constraint set approaches the project's "perfect defense" over time

## The Time Triangle

Documentation serves three temporal perspectives. All three are necessary:

```
         Architecture docs
         (present — how it works now)
        ╱                            ╲
       ╱                              ╲
Refactor reports ──────────────── ADRs
(past — what changed              (why — what we chose
 and what we learned)              and what we rejected)
```

- Creating a new module → read architecture docs ("how does account/ work?")
- Fixing a regression → read refactor reports ("what changed during the account migration?")
- Evaluating alternatives → read ADRs ("why did we choose RTK Query over React Query?")
