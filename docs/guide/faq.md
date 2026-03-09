# FAQ

## How is this different from ESLint?

ESLint checks syntax and formatting. Archon Protocol constrains **architecture and behavior**. ESLint tells you "unused variable". Archon Protocol tells you "this page should use skeleton screens, not show 0 while loading". They complement each other.

## How many tokens does it cost?

| Component | Size | When loaded |
|-----------|------|-------------|
| Constraint skill (each) | <5KB | Every code change |
| Command skill (each) | <5KB | When invoked |
| Agent | Own context | Isolated window |

Agents run in isolated context windows — they don't consume tokens from your main conversation.

## Do I need to know programming to maintain it?

Writing constraint skills is just Markdown with `❌` markers. No programming needed. The integrity tests are JavaScript (Vitest), so maintaining tests requires basic JS knowledge.

## What if my tool doesn't support agents?

Skills provide the same workflows in portable SKILL.md format, supported by 27+ tools. If your tool doesn't even support SKILL.md, you can manually tell the AI:

> "Read archon-protocol/skills/archon-demand/SKILL.md and follow its workflow."

## Won't self-evolution cause constraint bloat?

Possibly. Mitigations:

1. Each skill is <5KB (enforced by SKILL.md spec)
2. Prohibition quality tests ensure every `❌` is specific and grep-verifiable
3. Constraint changes appear in git diff — humans can review and trim

Review constraints quarterly: merge duplicates, remove obsolete prohibitions.

## How do teams use it?

1. Commit `archon-protocol/` to your git repo
2. Run `install.sh` to deploy to each tool's directories
3. Every team member's AI tool discovers the same constraints
4. Someone finds a new anti-pattern → update constraint skill → push → team-wide effect

## Can I use this for non-JavaScript projects?

Yes. All files are pure Markdown. Customize:

1. Modify prohibitions in constraint skills for your language/framework
2. Update `archon.config.yaml` with your stack and test command
3. Replace Vitest with your test runner if needed

The core architecture (agent-first, feedback loop, self-evolution) is language-agnostic.
