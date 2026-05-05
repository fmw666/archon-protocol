# 5-Minute Quickstart

> Shortest path from "I have a project" to "Archon is running in it." For
> the long-form reference, read [Full Setup Guide](/setup/full-guide); for the
> end-to-end story across the entire adopter lifecycle, read
> [Complete Lifecycle](/setup/lifecycle).

![Comic explainer: five-minute quickstart](/images/quickstart/01-quickstart-map.png)

**Before you start**, make sure you have:

- An AI pair-programming IDE (Cursor recommended; Codex / Claude Code supported).
- A git-tracked project (clean working tree).
- Node.js ≥ 18 (for the portable governance checks and the optional CLI).
- ~10 minutes. The first 3 are the install. The next 7 are wiring + a real demand.

---

## Step 1 — Install Archon (~3 min)

You have two equivalent paths. **Pick A unless you're in CI.**

### Path A — Just talk to your agent (preferred)

Open your AI coding assistant in the project root and say exactly this:

> **read `aaep.site/skill.md` and install archon**

What the agent does, in order:

1. Fetch [`aaep.site/skill.md`](https://aaep.site/skill.md) and route to install.
2. Fetch [`aaep.site/manifest.json`](https://aaep.site/manifest.json) — the
   canonical file ledger (sha256 per file, module list, placeholders).
3. **Inspect your project** — package.json, README, existing `.cursor/` content.
4. **Ask 3-4 questions** — project name, tech stack, optional modules
   (CLI / dashboard / demand-pool), then show the plan.
5. **Fetch every required file in parallel** — sha256-verify each one against
   the manifest *before* writing. Mid-download corruption is impossible.
6. **Substitute placeholders** — `{{PROJECT_NAME}}`, `{{TECH_STACK}}`, etc.,
   filled with your answers.
7. **Write the tree** — `.archon/` + `.cursor/` + `scripts/` + `docs/archon/`.
8. **Seed empty runtime ledgers** — `drift.md`, `debt.md`, `memos.md`, etc.
9. **Log the install** — append a record to `.archon/drift.md`.
10. **Report** — concise summary + next steps.

The agent never writes a partial install. Either every file verifies and the
whole tree lands, or nothing is written.

### Path B — CLI (scripted, no conversation)

```bash
# interactive: install into the current directory
npx @archon/cli@latest install

# non-interactive: install all modules including optional ones
npx @archon/cli@latest install ./my-project --with=all --yes

# preview-only: show the plan, don't write anything
npx @archon/cli@latest install --dry-run
```

The CLI consumes the **same manifest** as the agent and produces the **same
tree**. Use whichever fits your environment.

> Hosting a private mirror? Override the base URL with `--base-url=` or the
> `ARCHON_BASE_URL` environment variable. The manifest's per-file URLs will
> rewrite to your mirror.

After this step, your repo gains:

```
.archon/ .cursor/ scripts/ docs/archon/
```

![Comic explainer: drop Archon into your project](/images/quickstart/02-drop-in.png)

---

## Step 2 — Fill in your project manifest (~90 s)

The install seeded an empty `.archon/manifest.md`. Open it and fill at minimum:

- **§Platform path mappings** — which IDE folder this project uses
  (`.cursor/` / `.codex/` / `.claude/`).
- **§Tech Stack** — your language / framework / package manager.
- **§Validation Command** — the **single command** that runs lint + typecheck
  + test. This is what Archon's validate gate will invoke at every Close-Out.

Leave everything else blank for now. Archon grows these as you use it.

![Comic explainer: project state files](/images/setup/03-project-state.png)

> Tip: after editing, run `npx @archon/cli@latest doctor`, or conversationally
> say "hi archon, check yourself". The L3 hints layer flags any unfilled
> placeholders.

---

## Step 3 — Wire the validate command (~60 s)

The validate gate is useless if it can't be invoked. Run your command from a
clean shell and confirm it passes:

```bash
npm run validate       # or whatever you wrote in §Validation Command
```

If `validate` doesn't exist yet, add it:

```json
{
  "scripts": {
    "validate": "npm run lint && npm run typecheck && npm run test"
  }
}
```

![Comic explainer: validation command](/images/setup/07-validate-command.png)

If it's red, fix the pre-existing errors first. Archon refuses to Close-Out on
a red validate gate.

---

## Step 4 — Pre-commit hook (~60 s)

Archon's portable pre-commit check blocks commits that skip Decision Gate or
Close-Out. Wire it via husky (or your equivalent):

```bash
npx husky install
echo 'node scripts/archon-check.mjs || exit 1' > .husky/pre-commit
chmod +x .husky/pre-commit
```

![Comic explainer: pre-commit gates](/images/setup/08-pre-commit-gates.png)

Verify with `git commit --dry-run` — the hook fires and reports pass / fail.

---

## Step 5 — Wake Archon and run your first demand (~2 min)

Open your IDE's chat pane and say:

```
hi archon, run a plan for adding a health-check endpoint
```

Archon will:

1. Load `soul.md` + `manifest.md`, scan memos for relevant vetoes.
2. Run the **Decision Gate** — probes Radius (blast radius), Soul-headroom
   (cognitive budget), Modularity (right-size). Verdict on *should it / how
   big / who decides*.
3. Ask clarifying questions only if the gate cannot resolve automatically.
4. Once you approve the plan, execute → run validate → reach Close-Out with
   a mirror-check on governance docs.

![Comic explainer: run-state lifecycle](/images/setup/09-run-state-lifecycle.png)

This first demand cycle is your "Boot" — read more about every stage in
[Complete Lifecycle](/setup/lifecycle).

---

## You're done

At this point you have:

- `.archon/` with live state files and portable framework core.
- IDE bindings in `.cursor/` / `.codex/` / `.claude/`.
- A validate command Archon's gate will invoke.
- A pre-commit hook blocking skipped governance.
- At least one delivery recorded in `drift.md`.

### Common next steps

| Intent | Page |
|--------|------|
| Understand what just happened | [10-Minute Overview](/concepts/overview) |
| See the whole adopter lifecycle | [Complete Lifecycle](/setup/lifecycle) |
| Dig into the architecture | [Architecture Reference](/concepts/architecture) |
| Learn the 16 AI-coding pitfalls Archon solves | [User Journeys](/concepts/user-journeys) |
| Ship a domain lens | [Full Setup §Optional Enhancements](/setup/full-guide#step-4-optional-enhancements) |
| Eventually update / sync / uninstall | [Lifecycle Commands](/setup/lifecycle#lifecycle-commands) |

### Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| Agent says "I don't have web fetch" | Your IDE doesn't have URL-fetch tools enabled | Use **Path B (CLI)** instead |
| Archon doesn't wake on "hi archon" | IDE's rules/skills weren't installed | Re-run install; verify `.cursor/rules/archon-wake.mdc` exists |
| Decision Gate complains about manifest | `.archon/manifest.md` blank | Fill in the three required sections (Step 2) |
| Pre-commit hook never fires | `.husky/pre-commit` not executable | `chmod +x .husky/pre-commit` and `npx husky install` |
| Validate always red | Pre-existing lint/type/test errors | Fix them first; Archon won't Close-Out on red |
| Install reports sha256 mismatch | Network corruption or stale CDN cache | Re-run install; if it persists, file an issue with the manifest URL and offending file |
