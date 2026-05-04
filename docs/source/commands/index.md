# Commands

Archon ships **5 command entry points** under `.cursor/commands/` (`.claude/commands/` on Claude Code). Every user message that starts with `/archon`, `/archon-plan`, `/archon-demand`, `/archon-review`, or `/archon-dashboard` routes into the matching command file.

| Command | Role |
|---------|------|
| [`archon.md`](/source/commands/archon) | Top-level router (wake entry + routing to plan/demand/review/dashboard) |
| [`archon-plan.md`](/source/commands/archon-plan) | Plan mode: research + design + Decision Gate — no file writes |
| [`archon-demand.md`](/source/commands/archon-demand) | Delivery mode: full cognitive loop + Validation Gate + Close-Out |
| [`archon-review.md`](/source/commands/archon-review) | Review mode: drift reset + full audit + reviewer sub-agent dispatch |
| [`archon-dashboard.md`](/source/commands/archon-dashboard) | Dashboard mode: governance state visualization |

These are the **active entry points** — everything else (skills, rules, agents, soul extensions) is loaded **by** one of these commands when its preconditions are met.
