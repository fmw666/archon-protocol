# Lens: dev

Purpose: Focus the delivery on implementation feasibility, system boundaries, and validation.

## Classifier Signals

Select this lens when the demand primarily asks for implementation, code changes, architecture-boundary impact, refactoring risk, or validation planning.

## Looks At

- Existing architecture and ownership boundaries
- Implementation path and affected modules
- Reversibility, blast radius, and validation cost
- Whether the change introduces a new pattern, module, or dependency
- Whether a fixed cross-file bug or an enforced boundary should become a structural guard (a whole-repository invariant test)

## Does Not Look At

- Product prioritization beyond the current demand
- Visual taste or branding decisions
- QA matrix expansion beyond the validation plan needed for the change
- Persona, tone, or stakeholder messaging

## Default Output

```text
domain_lens: dev · tools=[dev/implementation-path, dev/blast-radius, dev/validation-plan]
```

The output should name the implementation path, the main risk boundary, and the validation command or focused checks. Add `dev/structural-guard` only when the demand is to enforce a codebase-wide invariant or freeze a recurring incident as a guard.

## Boundary Rule

The dev lens cannot weaken Archon's soul, skip validation when files changed, or merge refactoring with feature work unless the delivery explicitly qualifies for an existing emergency exception.
