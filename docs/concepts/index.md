# Core Concepts

The **why** behind Archon. Read these to understand what the framework
believes, how it models the cognitive loop, and which concrete pitfalls each
mechanism is designed to catch.

## Reading order

If you have **10 minutes**: read just the [10-Minute Overview](/concepts/overview).

If you have **an hour**: read in this order:

1. [10-Minute Overview](/concepts/overview) — the shape of the system.
2. [User Journeys](/concepts/user-journeys) — 16 real pitfalls of AI-assisted
   coding, mapped to the mechanisms that catch each one. **This is the best
   "why" document** if you want to feel Archon's problem-fit before committing.
3. [Architecture Reference](/concepts/architecture) — the complete structural
   description: cognitive loop · delivery lifecycle · constraint pyramid ·
   preservation axis · claim verifier · sub-agent delegation · state memory.
4. [Architecture Decisions](/concepts/decisions) — every ADR, in order, with
   the trade-offs and re-evaluation triggers.

If you want the **full Archon introduction** as originally written for adopter
projects: [Introduction (full README)](/concepts/introduction).

## Deeper dives

For specific mechanisms or comparisons:

| Page | Why you might read it |
|------|----------------------|
| [Drift Mechanism](/concepts/drift-mechanism) | How the drift counter · mechanical floors · dynamic thresholds · log compression work. |
| [Model vs. Harness](/concepts/model-vs-harness) | Why stronger models do not remove the need for an engineering environment. Six-question frame. |
| [Product-Architecture Workflow](/concepts/product-architecture-workflow) | Product-facing workflow: new-project onboarding · existing-project intake · demand execution boundaries. |
| [Superpowers Comparison](/concepts/superpowers-comparison) | Comparative analysis against the Superpowers framework — anti-rationalization, systematic debugging, sub-agent cost awareness. |
| [Refactoring Adoption](/concepts/refactoring-adoption) | Distilled refactoring discipline (two hats · rule of three · gradual replacement · tempo · characterization tests). |

## Next step

Once you understand the concepts, move to [Install & Boot](/setup/) to
scaffold a project, or jump to [Full Source](/source/) to read every file
Archon ships.
