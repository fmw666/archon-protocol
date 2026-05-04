# Lens: capability

Purpose: Focus the delivery on selecting and applying reusable best-practice capabilities without binding the universal toolset to one project stack.

## Classifier Signals

Select this lens when the demand primarily asks for a toolset, best-practice guidance, capability selection, deployment strategy, data platform choice, state management, responsive behavior, loading strategy, skeleton screen policy, or adoption guidance.

## Looks At

- The user-visible capability being requested, such as deployment, data backend, state coordination, responsive behavior, loading feedback, or other reusable practice areas
- The strongest fitting knowledge asset: existing skill, domain tool, editor rule, test guard, design plan, or project manifest fact
- Adoption boundary: what is reusable practice, what must be adapted to the current project, and what proof makes the adoption trustworthy

## Does Not Look At

- Provider-specific commands, APIs, pricing, or runtime facts unless they come from a selected skill or current project evidence
- Product roadmap priority beyond the current capability adoption decision
- Lifecycle hooks, background automation, or durable workflow state
- Persona, tone, or identity changes

## Default Output

```text
domain_lens: capability · tools=[capability/need-map, capability/practice-selector, capability/adoption-plan]
```

The output should name the requested capability, the reusable knowledge vehicle to load or create, the project-specific adoption boundary, and the proof needed before using the practice.

## Selection Recipes

- User asks for a reusable best-practice toolbox: start with `capability/need-map`, then `capability/practice-selector`.
- User names a broad capability area with no chosen implementation: use all three tools to classify the need, select the knowledge vehicle, and plan the first proof.
- User asks to apply an existing practice in this project: use `capability/practice-selector` plus `capability/adoption-plan`; skip `capability/need-map` only when the capability category is already explicit.
- User asks for an external starter or repository: prefer the `ecosystem` lens instead of this lens.
- User asks about deployment, secrets, data, or production runtime risk inside an existing project: prefer the `platform` lens when operational boundaries dominate.

## Boundary Rule

The capability lens cannot override Archon's soul, blend multiple domains into one delivery, create lifecycle gates, or store provider-specific facts in universal tool cards.
