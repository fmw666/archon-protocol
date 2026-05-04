# Rules

Cursor rules (`.mdc`) that automatically load into any Cursor-powered session on this project. These are Archon's "always-on" instructions — the ones a human operator does not need to remember.

| File | Role |
|------|------|
| [`archon.mdc`](/source/rules/archon) | Always-applied framework baseline (ownership, routing primer) |
| [`archon-wake.mdc`](/source/rules/archon-wake) | Wake-word handler — triggers soul/manifest/command routing |
| [`archon-heartbeat.mdc`](/source/rules/archon-heartbeat) | Session heartbeat — watches for cadence / debt signals |

Rules are mirrored verbatim from `.cursor/rules/` in the authoring repository. Non-Cursor platforms must translate them to their local rule system.
