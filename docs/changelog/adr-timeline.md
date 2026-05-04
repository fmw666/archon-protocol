---
title: ADR Timeline
outline: deep
---

# ADR Timeline

Chronological index of every framework-level Architecture Decision Record. For full rationale and trade-offs, see [Architecture Decisions](/concepts/decisions).

## What this page is

The [Architecture Decisions](/concepts/decisions) page lists ADRs by **topic** — decoupling, evolution, preservation, verification — which is the right shape when you want to understand "why does mechanism X exist?"

This page lists the **same set of ADRs in chronological order**, giving you a "how did Archon get here?" view: what problems surfaced first, what answers were tried, which were rejected and re-evaluated later.

## Grouped by era

### Bootstrap era (ADR-1 through ADR-9)

The first ADRs cover **identity + enforcement**: establishing what Archon is, how the cognitive loop runs, which enforcement tiers exist, and which platform-level primitives (husky, Cursor hooks) Archon can assume.

- **ADR-1** — Supabase as BaaS (project-level, not framework)
- **ADR-9** — B4 git-guardrails: pre-push + shell-level two-layer destructive-command interception

### Sovereignty era (ADR-10 through ADR-14)

Focus shifts to **autonomy under failure**: claim verifier, preservation axis, sub-agent independence, run-state machinery.

- **ADR-10** — Sub-agent model-family independence
- **ADR-14** — Run-State v2 (ephemeral per-delivery state)

### Knowledge-evolution era (ADR-15 through ADR-22)

How Archon learns from its own deliveries: evolution loop, drift mechanism, records-folder event sourcing.

- **ADR-17** — Blink Dispatch (sub-agent dispatch thin-slice gate)
- **ADR-20** — Lint-Rule Bridge (promoting load-bearing skills to linter rules)
- **ADR-22** — Records-folder event sourcing (drift / debt / memos as hot summaries)

### Preservation era (ADR-27 through ADR-29)

Protection against silent governance-substance drain.

- **ADR-27** — Claim Verifier (said-vs-truth drift catcher)
- **ADR-28** — Preservation Axis (load-bearing rule pinning: anchor + body-shape test + portable contract)
- **ADR-29** — Source Modularity Probe at the Decision Gate + Verdict card

## Negative ADRs

Options explicitly rejected. Each carries a **re-evaluation condition** so the rejection can be revisited mechanically when the world changes.

- **ADR-N1** — SSR migration (rejected at current scale; re-evaluate if SEO / time-to-first-paint becomes critical).

## Where to read the full text

- [Architecture Decisions](/concepts/decisions) — canonical source, topic-sorted, with trade-offs and re-evaluation conditions.
- [Framework Changelog](/changelog/framework) — which release shipped which ADR.

## Adding a new ADR

New ADRs are added during close-out via `/archon-demand` when a delivery introduces a framework-level decision. The workflow:

1. Propose the ADR at the Decision Gate during `/archon-plan`.
2. User verdict (accept / reject / defer).
3. If accepted, close-out writes the entry into `docs/archon/decisions.md` and increments the next ID.
4. This page (ADR Timeline) is regenerated from the decisions-log table headers.
