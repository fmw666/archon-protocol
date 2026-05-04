---
name: external-agent-patterns
description: >-
  Evaluates external AI-agent frameworks, prompts, harnesses, plugins, and workflow
  systems against Archon's ownership model. Use when reviewing an outside agent
  product, importing practices from another framework, or deciding whether a
  pattern assumes assistant-following vs owner-accountability behavior.
---

# External Agent Patterns

Use this skill before borrowing from an external AI-agent product, prompt system,
workflow harness, plugin architecture, or governance framework.

## Core Question

Do not start with "is this good?" Start with:

> What role does the external system assume the agent has, and does that match
> Archon's role for the agent in this project?

Archon treats the agent as the engineering owner. Many external systems treat
the agent as an assistant, tool user, executor, reviewer, or policy follower.
Those assumptions can be useful, but copying them without translation creates
role drift.

## Role Matrix

Classify the pattern before judging it.

| External assumption | Archon need | Default disposition |
|---------------------|-------------|---------------------|
| assistant -> assistant | Low relevance | Usually reject or treat as UX inspiration |
| assistant -> ownership | Translate carefully | Borrow mechanism only if it strengthens ownership |
| ownership -> ownership | Strong candidate | Compare constraints, blast radius, and validation layer |
| ownership -> assistant | Watch for demotion | Reject if it weakens autonomy or accountability |

## Evaluation Steps

1. Name the external pattern and its presumed agent role.
2. Identify the Archon responsibility it would affect: decision, execution,
   validation, review, memory, or distribution.
3. Separate mechanism from philosophy:
   - Mechanism: concrete guardrail, file shape, hook, command, test, schema.
   - Philosophy: assumptions about who decides, who verifies, who owns risk.
4. Map the mechanism to the constraint pyramid:
   - L0/L1 if machine-enforceable.
   - L2/L3 if it is guidance or editor-time prompting.
   - L4 only when it changes architectural direction.
   - L5 only for project-specific context.
5. Decide one of:
   - Adopt: same role model, clear enforcement path, bounded blast radius.
   - Translate: useful mechanism, but rewrite around ownership.
   - Reject with borrowed concepts: role conflict exists, but a smaller idea is
     still valuable.
   - Reject: conflict or cost dominates and no reusable concept remains.

## Red Flags

- The pattern makes the user choose from a menu instead of having the agent form
  and justify a decision.
- The pattern optimizes obedience while weakening responsibility for outcome.
- The pattern shifts verification to the user, reviewer, or future session.
- The pattern adds process artifacts without raising enforcement strength.
- The pattern assumes platform hooks that the current IDE cannot provide.

## Output Template

```markdown
External Pattern Assessment

Pattern:
Presumed external role:
Archon role affected:
Role-matrix cell:
Mechanism worth considering:
Role conflict:
Disposition: adopt | translate | reject-with-borrowed-concepts | reject
Borrowed concepts, if any:
Validation layer:
```

## Examples

### Assistant Workflow Template

If a prompt template tells the agent to ask the user to choose among three
implementation options, classify it as `assistant -> ownership`. Translate only
the useful comparison criteria; do not copy the menu behavior.

### Harness With Hard Tool Gates

If a harness blocks tool calls until a plan is approved, classify the mechanism
separately from its platform assumptions. If the IDE cannot enforce that hook,
translate the idea into the strongest available local layer instead of claiming
equivalent runtime protection.
