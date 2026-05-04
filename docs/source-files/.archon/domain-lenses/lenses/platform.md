# Lens: platform

Purpose: Focus the delivery on the platform boundary that affects production reliability.

## Classifier Signals

Select this lens when the demand primarily asks about persisted data, schema or migration safety, auth-coupled access, deployment/runtime behavior, scheduled jobs, environment configuration, secrets, permissions, domains, or production readiness.

## Looks At

- Data ownership, schema change risk, access boundaries, and transaction shape
- Runtime constraints for hosted functions, builds, scheduled jobs, and production traffic
- Secret storage, privileged credentials, environment variables, and permission scope
- Rollback, observability, and launch-readiness implications

## Does Not Look At

- UI layout, visual hierarchy, or interaction polish
- Generic code sequencing unless it changes a platform boundary
- Product roadmap priority beyond production risk and operational readiness
- Lifecycle hook behavior inside Archon itself

## Default Output

```text
domain_lens: platform · tools=[platform/platform-boundary]
```

The output should name the platform boundary at risk, the recommended planning stance, and the proof needed before treating the demand as ready.

## Tool Selection Recipes

- Persisted data, auth-coupled reads/writes, schema, migration, or RPC-like boundary: `platform/platform-boundary`
- Hosting, build, serverless runtime, scheduled job, domain, or launch-readiness concern: `platform/platform-boundary`
- Tokens, keys, privileged credentials, webhook secrets, CI env, or admin permission concern: `platform/platform-boundary`

## Boundary Rule

The platform lens cannot replace project-specific stack docs, cannot call provider APIs, and cannot create lifecycle gates; it only improves Archon's reasoning about one demand.
