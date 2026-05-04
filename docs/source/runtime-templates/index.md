# Runtime Templates

Templates for Run-State v2 — the per-run state file Archon writes under `.archon/runs/<run_id>/state.json`. Adopters generally don't hand-edit these; they're authored by the cognitive loop and consumed by the dashboard and claim verifier.

| File | Role |
|------|------|
| [`run.template.md`](/source/runtime-templates/run.template) | Human-readable annotated run template (prose version) |
| [`run-state.schema.md`](/source/runtime-templates/run-state.schema) | JSON Schema for the Run-State record (machine-validated) |

See the [ADR](/concepts/decisions) on Run-State v2 for rationale.
