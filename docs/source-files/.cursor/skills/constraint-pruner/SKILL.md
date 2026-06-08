---
name: constraint-pruner
description: >
  Audit and trim a structural-guard / rule set that has grown too large or
  redundant. Cheap-to-author guards accumulate and tax every AI session's
  context; pruning rarely happens on its own. Use periodically once the suite
  passes ~15 guards, or when the user says "prune guards", "清理规则",
  "audit guards", "瘦身约束", "constraint cleanup", "too many guards",
  "guard sprawl", "约束膨胀".
version: 1.0.0
license: MIT
---

<!-- Source: Formwork (结构守卫) — https://github.com/EvoMap/formwork — MIT.
     Bundled into Archon as an optional skill (manifest module: skills-formwork).
     Archon-native sibling: soul "Lean > Bloat" axiom + soul/review §Memory Layer Consolidation. -->

# Constraint pruner — keep the guard set lean

Authoring guards is cheap; the cost lands on every future session that must read
and obey them (context budget) and on maintainers who must keep them correct.
Sprawl is the predictable failure mode of a cheap-to-add system with no
deletion ritual. This skill is that ritual.

## When to run

- The guard + rule + skill count passes roughly **15 + 15**.
- After a burst of `guard-from-incident` additions.
- On a schedule (e.g. each release), not on agent whim.

## What to look for (and the action for each)

| Finding | Action |
|---|---|
| **Redundant** — two guards enforce the same invariant | Merge into one; delete the loser. |
| **Absorbed** — a linter/type rule now covers it | Delete the guard; keep the linter rule. |
| **Toothless** — regex so conservative it can never match (verify by introducing a violation: it stays green) | Tighten it, or delete it — a guard that can't fire is dead weight that reads as coverage. |
| **Stale** — references a file/dir/convention that no longer exists | Delete or update; fix dangling `[Rule: ...]` refs. |
| **One-shot** — guarded a migration that is now complete | Delete. |
| **Over-grandfathered** — exemption set never shrank | Pay down the debt or justify; the cap must trend down. |
| **Contradictory** — two guards pull opposite directions (e.g. "split large files" vs "cap files per directory") | Resolve the tension explicitly; document the chosen plateau. |

## Steps

1. **Inventory**: list every guard with its one-line invariant and last-known
   effectiveness (does it still bite?).
2. **Classify** each against the table above.
3. **Verify before deleting**: for "toothless", prove it can't fire; for
   "absorbed", confirm the linter/type rule truly covers it.
4. **Execute**: delete / merge / tighten / fix references.
5. **Report what was removed** and the new total against a stated budget — never
   silently drop coverage.

## Guardrail for the pruner itself

Deleting a guard removes protection. For any guard that came from a real
incident (`guard-from-incident`), require an explicit reason to remove it and
prefer tightening over deletion. Record removals so a future session can see
what protection was intentionally retired and why. In Archon, this deletion is
exactly the "explicit, auditable edit" the Preservation Axis (ADR-28) demands —
a pin is a tripwire, not a wall, but removing it must leave a visible scar.
