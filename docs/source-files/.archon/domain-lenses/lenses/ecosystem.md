# Lens: ecosystem

Purpose: Focus the delivery on selecting, verifying, and adopting external starter systems for a new environment.

## Classifier Signals

Select this lens when the demand primarily asks for starter system selection, framework recommendation, repository catalog use, template adoption, ecosystem research, or directly using an external project in a new environment.

## Looks At

- Known starter-system records: repository, ecosystem, primary use, evidence, and confidence
- Fit between the target environment and the candidate system's language, runtime, and operational assumptions
- Adoption path quality: setup entrypoint, first runnable proof, rollback or fallback, and unresolved blockers

## Does Not Look At

- Product prioritization beyond the current adoption decision
- Deployment, secrets, or runtime operations after the starter system is chosen
- Lifecycle hooks, background automation, or durable workflow state
- Persona, tone, or identity changes

## Default Output

```text
domain_lens: ecosystem · tools=[ecosystem/starter-catalog, ecosystem/evidence-gate, ecosystem/adoption-path]
```

The output should name the recommended system, the evidence boundary, and the first runnable adoption path.

## Selection Recipes

- New environment with no chosen stack: start with `ecosystem/starter-catalog`, then `ecosystem/evidence-gate`, then `ecosystem/adoption-path`.
- User names a repository or framework: use `ecosystem/evidence-gate` before recommending it, then `ecosystem/adoption-path` only if the evidence clears.
- Candidate is useful but unverified: keep it as a catalog record with low confidence; do not present it as the recommendation.

## Boundary Rule

The ecosystem lens cannot override Archon's soul, blend multiple domains into one delivery, create lifecycle gates, or treat an external project's popularity as proof of fit.
