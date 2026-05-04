# Sub-Agents

Sub-agents exist for **independence**. They are launched with a **different model family** from the main agent so the main agent cannot self-approve its own work.

| Agent | Trigger | Role |
|-------|---------|------|
| [`archon-capture-auditor.md`](/source/agents/archon-capture-auditor) | After every delivery close-out (Blink Dispatch gate; ADR-17) | Per-delivery lightweight hygiene: knowledge capture + blindspot reflection + debt trigger |
| [`archon-reviewer.md`](/source/agents/archon-reviewer) | drift ≥ 12 (Full tier) or manual trigger | Cycle-level heavyweight review: full audit + root-cause analysis + remediation plan |

See [Blink Dispatch](/source/skills/blink-dispatch) for the thin-slice gate that decides whether the capture-auditor is worth launching for a given delivery.
