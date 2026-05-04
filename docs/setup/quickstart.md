# Archon — 5-Minute Quickstart

> The shortest path from "I have a project" to "Archon is running in it." For the detailed reference — including platform variations, guards, and optional extensions — read [setup.md](/setup/full-guide).

![Comic explainer: five-minute quickstart](/images/quickstart/01-quickstart-map.png)

**Before you start**, make sure you have:

- An AI pair-programming IDE (Cursor recommended; Codex / Claude Code supported).
- A git-tracked project (clean working tree).
- Node.js ≥ 18 (needed to run the portable governance checks).
- ~10 minutes. The first 5 are the install. The next 5 are a trial demand.

---

## Option A — Zero-tool path (preferred): tell your agent

Open your AI coding assistant in the project and say:

> **read `aaep.site/skill.md` and install archon**

The agent will:

1. Fetch the skill file and the canonical manifest (`aaep.site/manifest.json`).
2. Ask about your project name, tech stack, and which optional modules you want (CLI, dashboard, demand-pool).
3. Fetch every required file over HTTPS, verify sha256, and write the tree.
4. Seed your runtime ledgers and log the install to `.archon/drift.md`.

Skip to **Step 2** below to fill in the manifest and continue the quickstart.

Details of what the agent does: [Agent Protocol](/agent/).

## Option B — CLI path: run `archon install`

If you prefer a scripted install, or you are in CI:

```bash
npx @archon/cli@latest install           # interactive, install into cwd
npx @archon/cli@latest install ./my-project --with=all --yes
```

The CLI consumes the same manifest, performs the same sha256 verification, and
writes the same tree. Use whichever path fits your environment — the result is
identical.

```
your-project/
├── .archon/                      ← framework core + project state templates
├── .cursor/                      ← (or .codex/ / .claude/ for your IDE)
│   ├── commands/archon-*.md
│   ├── agents/archon-*.md
│   ├── rules/archon*.mdc
│   └── skills/archon-*/SKILL.md
├── docs/archon/                  ← this documentation set
└── scripts/archon-check.{py,sh,mjs}
```

![Comic explainer: drop Archon into your project](/images/quickstart/02-drop-in.png)

> Both paths fetch from [`aaep.site/manifest.json`](https://aaep.site/manifest.json). Override the base URL with `--base-url=` or `ARCHON_BASE_URL` if you host a mirror.

## Step 2 — Fill in your project manifest (~90 s)

The `install` flow seeded empty runtime ledgers for you. Open `.archon/manifest.md`
and fill in at minimum:

- **§Platform path mappings** — which IDE folder (`.cursor/` / `.codex/` / `.claude/`) this project uses.
- **§Tech Stack** — your language / framework / package manager.
- **§Validation Command** — the single command that runs lint + typecheck + test. This is what Archon's validate gate will invoke.

Leave the rest blank for now — Archon will grow these as you use it.

> Tip: after editing, run `npx @archon/cli@latest doctor` (or ask your agent
> to "check archon"). The L3 hints layer flags any remaining template
> placeholders and the missing Validation Command.

## Step 3 — Wire the validation command (~60 s)

Archon's validate gate is useless if it can't be invoked. Make sure the command you listed in §Validation Command actually works from a clean shell:

```bash
# example for a typical Node project
npm run validate
```

If validate isn't defined yet, add it to `package.json`:

```json
{
  "scripts": {
    "validate": "npm run lint && npm run typecheck && npm run test"
  }
}
```

**Smoke test**: run it. It should finish green. If it's red, fix the pre-existing errors before going further — Archon will refuse to Close-Out on a red validate gate.

## Step 4 — Install the pre-commit lifecycle gate (~60 s)

Archon's portable pre-commit check blocks commits that skip governance. Install husky (or your equivalent) and wire the hook:

```bash
# husky-based example
npx husky install
echo 'node scripts/archon-check.mjs || exit 1' > .husky/pre-commit
chmod +x .husky/pre-commit
```

![Comic explainer: pre-commit hook as the tripwire](/images/quickstart/03-pre-commit.png)

Verify by running `git commit --dry-run`: the hook fires and reports pass / fail.

## Step 5 — Wake Archon and run your first demand (~2 min)

Open your IDE's chat pane and say:

```
hi archon, run a plan for adding a health-check endpoint
```

Archon will:

1. Load `soul.md` + manifest, scan memos for any relevant vetoes.
2. Run the **Decision Gate**: probes for Radius, Soul-headroom, Modularity; verdict on *should it be done / how big / who decides*.
3. Ask clarifying questions only if the gate cannot resolve automatically.

Once you approve the plan, it executes, runs validate, and reaches Close-Out with a mirror-check on governance docs.

## You're done

At this point you have:

- `.archon/` with live state files and portable core.
- IDE bindings in `.cursor/` / `.codex/` / `.claude/`.
- A validate command that Archon's gate will invoke.
- A pre-commit hook that blocks skipped governance.
- At least one successful demand in `drift.md`.

### Common next steps

| Intent | Go read |
|--------|---------|
| Understand what just happened | [concepts/overview.md](/concepts/overview.md) (10 min) |
| Dig into the full architecture | [architecture.md](/concepts/architecture) |
| Extend Archon with a domain lens | [setup.md §Step 4 — Optional Enhancements](/setup/full-guide#step-4-optional-enhancements) |
| Add a project-local extension | [architecture.md §Extension Points](/concepts/architecture#extension-points) |
| See 16 pain points Archon solves | [user-journeys.md](/concepts/user-journeys) |
| Adopt the Dashboard redesign | [adoption/dashboard-redesign-prd.md](/setup/dashboard-prd) |

### If something is wrong

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| Archon doesn't wake on "hi archon" | IDE's rules/skills weren't copied | Re-run the export script; verify `.cursor/rules/archon-wake.mdc` exists |
| Decision Gate complains it can't find manifest | `.archon/manifest.md` missing or blank | Copy from template and fill at least the three required sections |
| Pre-commit hook doesn't fire | `.husky/pre-commit` not executable / husky not installed | `chmod +x .husky/pre-commit` and `npx husky install` |
| Validate gate always red | Pre-existing lint/type/test errors | Fix them first; Archon refuses to Close-Out on red |
