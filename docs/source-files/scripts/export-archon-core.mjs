import { promises as fs } from 'node:fs'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')

const ARCHON_VERSION = readFileSync(
  path.resolve(ROOT, '.archon/VERSION'),
  'utf8',
).trim()

const PLATFORMS = {
  cursor: { prefix: '.cursor', ruleExt: '.mdc' },
  'claude-code': { prefix: '.claude', ruleExt: '.md' },
}

const args = process.argv.slice(2)
const overwrite = args.includes('--overwrite')
const platformFlag = args.find((a) => a.startsWith('--platform='))
const platformName = platformFlag ? platformFlag.split('=')[1] : 'cursor'
const platform = PLATFORMS[platformName]

if (!platform) {
  console.error(
    `[archon-export] Unknown platform: ${platformName}. Available: ${Object.keys(PLATFORMS).join(', ')}`,
  )
  process.exitCode = 1
  process.exit()
}

const positionalArgs = args.filter((a) => !a.startsWith('--'))
const outputArg = positionalArgs[0] ?? 'archon-standalone'
const outputDir = path.isAbsolute(outputArg) ? outputArg : path.resolve(ROOT, outputArg)

const SRC_PREFIX = '.cursor'

const ARCHON_CORE_FILES = [
  '.archon/soul.md',
  '.archon/soul/delivery.md',
  '.archon/soul/review.md',
]

const DOMAIN_LENS_FILES = [
  '.archon/domain-lenses/README.md',
  '.archon/domain-lenses/registry.yaml',
  '.archon/domain-lenses/lenses/dev.md',
  '.archon/domain-lenses/lenses/design.md',
  '.archon/domain-lenses/lenses/platform.md',
  '.archon/domain-lenses/lenses/ecosystem.md',
  '.archon/domain-lenses/lenses/capability.md',
  '.archon/domain-lenses/tools/dev/implementation-path.md',
  '.archon/domain-lenses/tools/dev/blast-radius.md',
  '.archon/domain-lenses/tools/dev/validation-plan.md',
  '.archon/domain-lenses/tools/platform/platform-boundary.md',
  '.archon/domain-lenses/tools/ecosystem/starter-catalog.md',
  '.archon/domain-lenses/tools/ecosystem/evidence-gate.md',
  '.archon/domain-lenses/tools/ecosystem/adoption-path.md',
  '.archon/domain-lenses/tools/capability/need-map.md',
  '.archon/domain-lenses/tools/capability/practice-selector.md',
  '.archon/domain-lenses/tools/capability/adoption-plan.md',
  '.archon/domain-lenses/tools/design/palette-boundary.md',
  '.archon/domain-lenses/tools/design/layout-reference.md',
  '.archon/domain-lenses/tools/design/component-pattern.md',
  '.archon/domain-lenses/tools/design/interaction-state.md',
  '.archon/domain-lenses/tools/design/visual-constraint.md',
  '.archon/domain-lenses/tools/design/critique-audit-loop.md',
  '.archon/domain-lenses/templates/lens.md',
  '.archon/domain-lenses/templates/tool.md',
]

const PLATFORM_FILES = [
  `${SRC_PREFIX}/commands/archon.md`,
  `${SRC_PREFIX}/commands/archon-plan.md`,
  `${SRC_PREFIX}/commands/archon-demand.md`,
  `${SRC_PREFIX}/commands/archon-review.md`,
  `${SRC_PREFIX}/commands/archon-dashboard.md`,
  `${SRC_PREFIX}/agents/archon-reviewer.md`,
  `${SRC_PREFIX}/agents/archon-capture-auditor.md`,
  `${SRC_PREFIX}/rules/archon.mdc`,
  `${SRC_PREFIX}/rules/archon-wake.mdc`,
  `${SRC_PREFIX}/skills/archon-framework/SKILL.md`,
  `${SRC_PREFIX}/skills/archon-git-commit/SKILL.md`,
  `${SRC_PREFIX}/skills/archon-signs/SKILL.md`,
  `${SRC_PREFIX}/skills/blink-dispatch/SKILL.md`,
  `${SRC_PREFIX}/skills/external-agent-patterns/SKILL.md`,
]

const TEMPLATE_FILE_MAP = [
  { source: 'docs/archon/templates/manifest.template.md', target: '.archon/manifest.md' },
  { source: 'docs/archon/templates/drift.template.md', target: '.archon/drift.md' },
  { source: 'docs/archon/templates/debt.template.md', target: '.archon/debt.md' },
  { source: 'docs/archon/templates/memos.template.md', target: '.archon/memos.md' },
  { source: 'docs/archon/templates/decisions.template.md', target: '.archon/decisions.md' },
]

const UNIVERSAL_TOOL_FILES = [
  '.archon/contracts/governance-contract.yaml',
  'scripts/archon-check.py',
  'scripts/archon-check.sh',
  'scripts/archon-run-state.mjs',
  'scripts/archon-claim-verifier.mjs',
]

const DOC_FILE_MAP = [
  { source: 'docs/archon/README.md', target: 'docs/archon/README.md' },
  { source: 'docs/archon/architecture.md', target: 'docs/archon/architecture.md' },
  { source: 'docs/archon/setup.md', target: 'docs/archon/setup.md' },
  { source: 'docs/archon/decisions.md', target: 'docs/archon/decisions.md' },
  { source: '.archon/templates/run.template.md', target: '.archon/templates/run.template.md' },
  { source: '.archon/templates/run-state.schema.json', target: '.archon/templates/run-state.schema.json' },
  { source: '.husky/pre-commit', target: '.husky/pre-commit' },
  { source: '.husky/pre-push', target: '.husky/pre-push' },
  { source: '.cursor/hooks.json', target: '.cursor/hooks.json' },
  { source: '.cursor/hooks/archon-destructive-guard.mjs', target: '.cursor/hooks/archon-destructive-guard.mjs' },
  { source: '.gitattributes', target: '.gitattributes' },
  { source: 'scripts/archon-records.mjs', target: 'scripts/archon-records.mjs' },
  { source: 'scripts/archon-records-fold.mjs', target: 'scripts/archon-records-fold.mjs' },
]

const DOC_ASSET_FILES = [
  'docs/images/archon/readme/01-owner-not-assistant.png',
  'docs/images/archon/readme/02-question-router.png',
  'docs/images/archon/readme/03-mechanism-lanes.png',
  'docs/images/archon/readme/04-delivery-route.png',
  'docs/images/archon/readme/05-domain-tool-theme-palette-case.png',
  'docs/images/archon/architecture/archon-architecture-01-axioms.png',
  'docs/images/archon/architecture/archon-architecture-02-system-map.png',
  'docs/images/archon/architecture/archon-architecture-03-layered-model.png',
  'docs/images/archon/architecture/archon-architecture-04-wake-loop.png',
  'docs/images/archon/architecture/archon-architecture-05-delivery-lifecycle.png',
  'docs/images/archon/architecture/archon-architecture-06-constraint-pyramid.png',
  'docs/images/archon/architecture/archon-architecture-07-evolution-forecast.png',
  'docs/images/archon/architecture/archon-architecture-08-subagent-delegation.png',
  'docs/images/archon/architecture/archon-architecture-09-state-memory.png',
  'docs/images/archon/architecture/archon-architecture-10-extensibility-hygiene.png',
  'docs/images/archon/architecture/archon-architecture-11-records-folder.png',
  'docs/images/archon/architecture/archon-architecture-12-preservation-axis.png',
  'docs/images/archon/architecture/archon-architecture-13-claim-verifier.png',
  'docs/images/archon/architecture/archon-architecture-14-modularity-probe.png',
  'docs/images/archon/setup/01-install-route.png',
  'docs/images/archon/setup/02-two-homes.png',
  'docs/images/archon/setup/03-project-state.png',
  'docs/images/archon/setup/04-mechanical-guards.png',
  'docs/images/archon/setup/05-prereqs.png',
  'docs/images/archon/setup/06-cross-ref.png',
  'docs/images/archon/setup/07-validate-command.png',
  'docs/images/archon/setup/08-pre-commit-gates.png',
  'docs/images/archon/setup/09-run-state-lifecycle.png',
  'docs/images/archon/decisions/01-four-lanes.png',
]

function rewritePlatformPrefix(content) {
  if (platformName === 'cursor') return content
  return content.replaceAll(`${SRC_PREFIX}/`, `${platform.prefix}/`)
}

function rewriteRuleExtension(filePath) {
  if (platform.ruleExt === '.mdc') return filePath
  return filePath.replace(/\.mdc$/, platform.ruleExt)
}

function rewritePlatformTargetPath(targetRelPath) {
  let rewritten = targetRelPath.replace(
    new RegExp(`^\\${SRC_PREFIX}/`),
    `${platform.prefix}/`,
  )
  rewritten = rewriteRuleExtension(rewritten)
  return rewritten
}

function fillManifestPlatform(content) {
  if (platformName === 'cursor') return content
  const p = platform.prefix
  return content
    .replace(/<!-- Cursor \/ Claude Code -->/, platformName === 'claude-code' ? 'Claude Code' : platformName)
    .replace(/<!-- \.cursor \/ \.claude -->/, `\`${p}\``)
    .replace(/<!-- \.cursor\/rules \/ \.claude\/rules -->/, `\`${p}/rules\``)
    .replace(/<!-- \.cursor\/skills \/ \.claude\/skills -->/, `\`${p}/skills\``)
    .replace(/<!-- \.cursor\/agents \/ \.claude\/agents -->/, `\`${p}/agents\``)
    .replace(/<!-- \.cursor\/commands \/ \.claude\/commands -->/, `\`${p}/commands\``)
}

function generateClaudeMd() {
  const p = platform.prefix
  return `# Archon Engineering Governance Framework

This project uses [Archon](https://github.com/) for engineering governance.

## Agent Primer (read first)

Before doing any archon-related work in this project, load the framework primer skill: \`${p}/skills/archon-framework/SKILL.md\`. It explains the three-tier layout, cross-reference convention, decoupling rule, and where to find deeper detail. Load it once per session.

## Boot

At the start of each Archon session, hot-path read only the sections needed for the current route:
1. \`.archon/soul.md\` — Engineering principles (route-scoped cognitive core sections)
2. \`.archon/manifest.md\` — Project overview (current-state sections)

Mode-specific soul extensions load on demand — do NOT load at boot:
- \`.archon/soul/delivery.md\` — loaded by \`/archon-demand\`
- \`.archon/soul/review.md\` — loaded by \`/archon-plan\` and \`/archon-review\`

## Commands

| Command | Description | Definition |
|------|------|------|
| \`/archon\` | **Unified entry**: wake + intent routing (or manually specify plan/demand/review) | \`${p}/commands/archon.md\` |
| \`/archon-plan\` | Planning mode: assess current state, recommend next steps | \`${p}/commands/archon-plan.md\` |
| \`/archon-demand\` | Delivery mode: decision gate → self-directed execute → validation gate → close-out | \`${p}/commands/archon-demand.md\` |
| \`/archon-review\` | Full review mode: independent reviewer audit + knowledge health audit | \`${p}/commands/archon-review.md\` |
| \`/archon-dashboard\` | Launch governance visualization dashboard (if \`.archon/dashboard/\` is present) | \`${p}/commands/archon-dashboard.md\` |

## Core Files

| File | Responsibility |
|------|------|
| \`.archon/soul.md\` | Cognitive core — universal engineering principles, route-scoped hot-path sections |
| \`.archon/soul/delivery.md\` | Delivery-mode extension — loaded by \`/archon-demand\` |
| \`.archon/soul/review.md\` | Review-mode extension — loaded by \`/archon-plan\` and \`/archon-review\` |
| \`.archon/manifest.md\` | Project hot context — tech stack, milestones, acceptance criteria, current state, latest validation |
| \`.archon/drift.md\` | Cognitive drift hot index — delivery complexity, latest rows, archive index, review trigger |
| \`.archon/debt.md\` | Technical debt hot gate index — active ID/severity/deadline/status tracking |
| \`.archon/memos.md\` | Stakeholder memo hot index — compact pointers to decision-level conclusions |

## Reference Documentation

| Document | Purpose |
|----------|---------|
| \`docs/archon/README.md\` | One-page navigation to the rest of the docs |
| \`docs/archon/architecture.md\` | Full system design and rationale |
| \`docs/archon/setup.md\` | Setup steps for new projects (you've already run these if you're reading this) |
`
}

function generatePackageReadme() {
  const p = platform.prefix
  const platformLabel =
    platformName === 'cursor'
      ? 'Cursor'
      : platformName === 'claude-code'
        ? 'Claude Code'
        : platformName
  return `# Archon Standalone Kit (${platformLabel})

**Version ${ARCHON_VERSION}** · Apache-2.0 · See \`docs/archon/CHANGELOG.md\` for release notes.

> Exported from Distilgent's Archon core. For quickly reusing Archon governance capabilities in other projects.

## Target Platform

**${platformLabel}** — Platform-specific files (commands/agents/rules/skills) adapted for \`${p}/\` directory. Core files unified in \`.archon/\`.

## Contents

- Project-agnostic core (\`.archon/\`, same path across platforms):
  - \`.archon/soul.md\` (cognitive core — route-scoped hot-path sections)
  - \`.archon/soul/delivery.md\` (delivery-mode extension — loaded by demand)
  - \`.archon/soul/review.md\` (review-mode extension — loaded by plan and review)
  - \`.archon/domain-lenses/\` (Domain Lens pre-Verdict index and proceed-only lens/tool contracts)
- Platform-specific files (\`${p}/\`):
  - \`${p}/commands/archon*.md\` (unified entry + plan / demand / review / dashboard)
  - \`${p}/agents/archon-*.md\` (reviewer / capture-auditor)
  - \`${p}/rules/archon${platform.ruleExt}\` (decoupling rules) + \`${p}/rules/archon-wake${platform.ruleExt}\` (wake trigger)
  - \`${p}/skills/archon-framework/SKILL.md\` (agent primer — loaded on demand when the agent first touches Archon)
  - \`${p}/skills/archon-git-commit/SKILL.md\` (commit-gate skill — reads Run-State v2 or legacy .archon/run.md before any commit)
  - \`${p}/skills/blink-dispatch/SKILL.md\` (thin-slice subagent dispatch gate — decides skip vs use:<subagent>)
  - \`${p}/skills/external-agent-patterns/SKILL.md\` (external-framework evaluation skill — checks role assumptions before borrowing patterns)
- Project state templates (\`.archon/\`, same path across platforms):
  - \`.archon/manifest.md\`
  - \`.archon/drift.md\`
  - \`.archon/debt.md\`
  - \`.archon/memos.md\`
  - \`.archon/decisions.md\` (project-specific ADR ledger template)
- Portable governance contract + reference checkers:
  - \`.archon/contracts/governance-contract.yaml\`
  - \`scripts/archon-check.py\`
  - \`scripts/archon-check.sh\`
  - \`scripts/archon-run-state.mjs\`
- Bundled documentation (universal):
  - \`docs/archon/README.md\` (one-page navigation)
  - \`docs/archon/architecture.md\` (full system design)
  - \`docs/archon/setup.md\` (integration steps)
  - \`docs/archon/decisions.md\` (framework decision log)
  - \`docs/images/archon/...\` (comic explainer assets referenced by bundled docs)
  - \`.archon/templates/run.template.md\` (legacy ephemeral per-delivery run-state schema)
  - \`.archon/templates/run-state.schema.json\` (Run-State v2 JSON schema)
- Commit hook:
  - \`.husky/pre-commit\` (lifecycle + run-state commit gate)
- Runtime artifacts (created on-demand, NOT shipped with the kit):
  - \`.archon/memos-archive/<year>-Q<N>.md\` (cold archive of full stakeholder memo rationale)
  - \`.archon/drift/archive/<year>-Q<N>.md\` (cold archive of older drift rows)
  - \`.archon/debt/archive/<year>-Q<N>.md\` (cold archive of full debt rationale)
  - \`.archon/manifest/archive/<year>-Q<N>.md\` (cold archive of long latest-review detail)
  - \`.archon/extensions/\` (project-local lifecycle hooks — create per project)
  - \`.archon/dashboard/\` (optional governance visualization — copy from authoring source if you want it)
${platformName === 'claude-code' ? '- Claude Code entry: `CLAUDE.md`\n' : ''}
## Quick Start

1. Copy this directory's contents to the target project root.
2. Have the AI agent read \`${p}/skills/archon-framework/SKILL.md\` first — it's the framework primer.
3. Fill in \`.archon/manifest.md\` per your project (especially §Platform path mappings and §Tech Stack).
4. Register a validation command in your project (lint + typecheck + test).
5. Configure pre-commit lifecycle gate per \`docs/archon/setup.md\`.
6. Run \`/archon-plan\` to verify successful integration.
`
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath)
    return true
  } catch {
    return false
  }
}

async function ensureParent(targetPath) {
  await fs.mkdir(path.dirname(targetPath), { recursive: true })
}

async function copyDirect(sourceRelPath, targetRelPath = sourceRelPath) {
  const source = path.resolve(ROOT, sourceRelPath)
  const destination = path.resolve(outputDir, targetRelPath)
  if (!(await pathExists(source))) {
    throw new Error(`Source file not found: ${sourceRelPath}`)
  }
  await ensureParent(destination)
  const content = await fs.readFile(source, 'utf8')
  await fs.writeFile(destination, content, 'utf8')
  return targetRelPath
}

async function copyPlatformFile(sourceRelPath, targetRelPath = sourceRelPath) {
  const source = path.resolve(ROOT, sourceRelPath)
  const destRelPath = rewritePlatformTargetPath(targetRelPath)
  const destination = path.resolve(outputDir, destRelPath)
  if (!(await pathExists(source))) {
    throw new Error(`Source file not found: ${sourceRelPath}`)
  }
  let content = await fs.readFile(source, 'utf8')
  content = rewritePlatformPrefix(content)
  await ensureParent(destination)
  await fs.writeFile(destination, content, 'utf8')
  return destRelPath
}

async function copyTemplateFile(sourceRelPath, targetRelPath) {
  const source = path.resolve(ROOT, sourceRelPath)
  const destination = path.resolve(outputDir, targetRelPath)
  if (!(await pathExists(source))) {
    throw new Error(`Source file not found: ${sourceRelPath}`)
  }
  let content = await fs.readFile(source, 'utf8')
  content = rewritePlatformPrefix(content)
  content = fillManifestPlatform(content)
  await ensureParent(destination)
  await fs.writeFile(destination, content, 'utf8')
  return targetRelPath
}

async function main() {
  const exists = await pathExists(outputDir)
  if (exists && !overwrite) {
    throw new Error(
      `Output directory already exists: ${outputDir}\nUse --overwrite to replace it.`,
    )
  }
  if (exists && overwrite) {
    await fs.rm(outputDir, { recursive: true, force: true })
  }
  await fs.mkdir(outputDir, { recursive: true })

  const exported = []

  for (const file of ARCHON_CORE_FILES) {
    const dest = await copyDirect(file)
    exported.push(dest)
  }

  for (const file of DOMAIN_LENS_FILES) {
    const dest = await copyDirect(file)
    exported.push(dest)
  }

  for (const file of PLATFORM_FILES) {
    const dest = await copyPlatformFile(file)
    exported.push(dest)
  }

  for (const { source, target } of TEMPLATE_FILE_MAP) {
    const dest = await copyTemplateFile(source, target)
    exported.push(dest)
  }

  for (const file of UNIVERSAL_TOOL_FILES) {
    const dest = await copyPlatformFile(file)
    exported.push(dest)
  }

  for (const { source, target } of DOC_FILE_MAP) {
    const dest = await copyPlatformFile(source, target)
    exported.push(dest)
  }

  for (const file of DOC_ASSET_FILES) {
    const dest = await copyDirect(file)
    exported.push(dest)
  }

  if (await pathExists(path.resolve(ROOT, '.gitignore'))) {
    await copyDirect('.gitignore', '.gitignore')
  }

  for (const file of ['LICENSE', 'NOTICE', '.archon/VERSION', 'docs/archon/CHANGELOG.md']) {
    if (await pathExists(path.resolve(ROOT, file))) {
      const dest = await copyDirect(file)
      exported.push(dest)
    }
  }

  if (platformName === 'claude-code') {
    const claudeMdPath = path.resolve(outputDir, 'CLAUDE.md')
    await fs.writeFile(claudeMdPath, generateClaudeMd(), 'utf8')
    exported.push('CLAUDE.md')
  }

  const readme = generatePackageReadme()
  await fs.writeFile(path.resolve(outputDir, 'README.md'), readme, 'utf8')

  console.log(`[archon-export] Platform: ${platformName}`)
  console.log(`[archon-export] Version: ${ARCHON_VERSION}`)
  console.log(`[archon-export] Exported ${exported.length} files to: ${outputDir}`)
}

main().catch((error) => {
  console.error(`[archon-export] ${error.message}`)
  process.exitCode = 1
})
