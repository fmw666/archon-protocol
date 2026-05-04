// Generate VitePress wrapper pages for every file under docs/source-files/.
// Each wrapper embeds the source file inline via VitePress <<< snippet syntax,
// so the rendered docs site stays a mirror of the actual kit material.
//
// Usage: node scripts/generate-source-pages.mjs
import { promises as fs } from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(process.cwd(), 'docs')
const SOURCE_FILES_DIR = path.join(ROOT, 'source-files')
const OUTPUT_DIR = path.join(ROOT, 'source')

// Map: rel path under source-files → { wrapperPath: rel path under /source/, title, description }
// wrapperPath uses dashes to flatten nested directories into single level when ergonomic.
const WRAPPER_MAP = [
  // Soul
  { src: '.archon/soul.md', out: 'soul.md', title: '.archon/soul.md', lang: 'md' },
  { src: '.archon/soul/delivery.md', out: 'soul-delivery.md', title: '.archon/soul/delivery.md', lang: 'md' },
  { src: '.archon/soul/review.md', out: 'soul-review.md', title: '.archon/soul/review.md', lang: 'md' },
  // Commands
  { src: '.cursor/commands/archon.md', out: 'commands/archon.md', title: '.cursor/commands/archon.md', lang: 'md' },
  { src: '.cursor/commands/archon-plan.md', out: 'commands/archon-plan.md', title: '.cursor/commands/archon-plan.md', lang: 'md' },
  { src: '.cursor/commands/archon-demand.md', out: 'commands/archon-demand.md', title: '.cursor/commands/archon-demand.md', lang: 'md' },
  { src: '.cursor/commands/archon-review.md', out: 'commands/archon-review.md', title: '.cursor/commands/archon-review.md', lang: 'md' },
  { src: '.cursor/commands/archon-dashboard.md', out: 'commands/archon-dashboard.md', title: '.cursor/commands/archon-dashboard.md', lang: 'md' },
  // Agents
  { src: '.cursor/agents/archon-reviewer.md', out: 'agents/archon-reviewer.md', title: '.cursor/agents/archon-reviewer.md', lang: 'md' },
  { src: '.cursor/agents/archon-capture-auditor.md', out: 'agents/archon-capture-auditor.md', title: '.cursor/agents/archon-capture-auditor.md', lang: 'md' },
  // Rules — .mdc is Cursor-specific extension; render as markdown
  { src: '.cursor/rules/archon.mdc', out: 'rules/archon.md', title: '.cursor/rules/archon.mdc', lang: 'md' },
  { src: '.cursor/rules/archon-wake.mdc', out: 'rules/archon-wake.md', title: '.cursor/rules/archon-wake.mdc', lang: 'md' },
  // Skills
  { src: '.cursor/skills/archon-framework/SKILL.md', out: 'skills/archon-framework.md', title: '.cursor/skills/archon-framework/SKILL.md', lang: 'md' },
  { src: '.cursor/skills/archon-git-commit/SKILL.md', out: 'skills/archon-git-commit.md', title: '.cursor/skills/archon-git-commit/SKILL.md', lang: 'md' },
  { src: '.cursor/skills/archon-signs/SKILL.md', out: 'skills/archon-signs.md', title: '.cursor/skills/archon-signs/SKILL.md', lang: 'md' },
  { src: '.cursor/skills/blink-dispatch/SKILL.md', out: 'skills/blink-dispatch.md', title: '.cursor/skills/blink-dispatch/SKILL.md', lang: 'md' },
  { src: '.cursor/skills/external-agent-patterns/SKILL.md', out: 'skills/external-agent-patterns.md', title: '.cursor/skills/external-agent-patterns/SKILL.md', lang: 'md' },
  // Domain lenses
  { src: '.archon/domain-lenses/registry.yaml', out: 'domain-lenses/registry.md', title: '.archon/domain-lenses/registry.yaml', lang: 'yaml' },
  { src: '.archon/domain-lenses/lenses/dev.md', out: 'domain-lenses/dev.md', title: '.archon/domain-lenses/lenses/dev.md', lang: 'md' },
  { src: '.archon/domain-lenses/lenses/design.md', out: 'domain-lenses/design.md', title: '.archon/domain-lenses/lenses/design.md', lang: 'md' },
  { src: '.archon/domain-lenses/lenses/platform.md', out: 'domain-lenses/platform.md', title: '.archon/domain-lenses/lenses/platform.md', lang: 'md' },
  { src: '.archon/domain-lenses/lenses/ecosystem.md', out: 'domain-lenses/ecosystem.md', title: '.archon/domain-lenses/lenses/ecosystem.md', lang: 'md' },
  { src: '.archon/domain-lenses/lenses/capability.md', out: 'domain-lenses/capability.md', title: '.archon/domain-lenses/lenses/capability.md', lang: 'md' },
  // Contracts
  { src: '.archon/contracts/governance-contract.yaml', out: 'contracts/governance-contract.md', title: '.archon/contracts/governance-contract.yaml', lang: 'yaml' },
  // Runtime templates
  { src: '.archon/templates/run.template.md', out: 'runtime-templates/run.template.md', title: '.archon/templates/run.template.md', lang: 'md' },
  { src: '.archon/templates/run-state.schema.json', out: 'runtime-templates/run-state.schema.md', title: '.archon/templates/run-state.schema.json', lang: 'json' },
  // Scripts — .py / .sh / .mjs
  { src: 'scripts/archon-check.py', out: 'scripts/archon-check-py.md', title: 'scripts/archon-check.py', lang: 'python' },
  { src: 'scripts/archon-check.sh', out: 'scripts/archon-check-sh.md', title: 'scripts/archon-check.sh', lang: 'bash' },
  { src: 'scripts/archon-run-state.mjs', out: 'scripts/archon-run-state.md', title: 'scripts/archon-run-state.mjs', lang: 'js' },
  { src: 'scripts/archon-claim-verifier.mjs', out: 'scripts/archon-claim-verifier.md', title: 'scripts/archon-claim-verifier.mjs', lang: 'js' },
  { src: 'scripts/archon-records.mjs', out: 'scripts/archon-records.md', title: 'scripts/archon-records.mjs', lang: 'js' },
  { src: 'scripts/archon-records-fold.mjs', out: 'scripts/archon-records-fold.md', title: 'scripts/archon-records-fold.mjs', lang: 'js' },
  { src: 'scripts/export-archon-core.mjs', out: 'scripts/export-archon-core.md', title: 'scripts/export-archon-core.mjs', lang: 'js' },
  { src: 'scripts/test-archon-export.mjs', out: 'scripts/test-archon-export.md', title: 'scripts/test-archon-export.mjs', lang: 'js' },
  // CLI
  { src: 'tools/archon-cli/package.json', out: 'cli/package.md', title: 'tools/archon-cli/package.json', lang: 'json' },
  { src: 'tools/archon-cli/bin/archon.mjs', out: 'cli/bin-archon.md', title: 'tools/archon-cli/bin/archon.mjs', lang: 'js' },
  { src: 'tools/archon-cli/lib/common.mjs', out: 'cli/lib-common.md', title: 'tools/archon-cli/lib/common.mjs', lang: 'js' },
  { src: 'tools/archon-cli/lib/init.mjs', out: 'cli/lib-init.md', title: 'tools/archon-cli/lib/init.mjs', lang: 'js' },
  { src: 'tools/archon-cli/lib/doctor.mjs', out: 'cli/lib-doctor.md', title: 'tools/archon-cli/lib/doctor.mjs', lang: 'js' },
  { src: 'tools/archon-cli/lib/export.mjs', out: 'cli/lib-export.md', title: 'tools/archon-cli/lib/export.mjs', lang: 'js' },
]

function buildWrapperContent(entry) {
  // Use VitePress `<<< @/...` import. The `@` alias points to the site root
  // (the folder containing .vitepress), i.e. docs/. We reference the file
  // under docs/source-files/…
  const alias = '@/source-files/' + entry.src
  const isMarkdown = entry.lang === 'md'

  const header = `---
title: ${entry.title}
outline: deep
---

# \`${entry.title}\`

> Source location: [\`docs/source-files/${entry.src}\`](https://github.com/fmw666/archon-protocol/blob/main/docs/source-files/${entry.src}) — this page is a rendered mirror; the file is the source of truth.

`

  // For markdown source files, embedding them raw (with <<<) loses their
  // own image refs and header anchors. A cleaner outcome: inline the file
  // contents verbatim. VitePress supports `<!--@include: path/to/file.md-->`
  // for this purpose (v1.x).
  if (isMarkdown) {
    // Include relative path (from the wrapper page's folder)
    // Wrapper is at docs/source/<...>.md, include target at docs/source-files/<src>
    // We need a relative path from the wrapper md to the included file.
    const wrapperAbs = path.join(OUTPUT_DIR, entry.out)
    const wrapperDir = path.dirname(wrapperAbs)
    const includedAbs = path.join(SOURCE_FILES_DIR, entry.src)
    let relIncluded = path.relative(wrapperDir, includedAbs).replace(/\\/g, '/')
    if (!relIncluded.startsWith('.')) relIncluded = './' + relIncluded
    return header + `<!--@include: ${relIncluded}-->\n`
  }

  // For code (py/sh/js/json/yaml), use <<< with a fenced language hint.
  const wrapperAbs = path.join(OUTPUT_DIR, entry.out)
  const wrapperDir = path.dirname(wrapperAbs)
  const includedAbs = path.join(SOURCE_FILES_DIR, entry.src)
  let relIncluded = path.relative(wrapperDir, includedAbs).replace(/\\/g, '/')
  if (!relIncluded.startsWith('.')) relIncluded = './' + relIncluded
  return header + `<<< ${relIncluded}{${entry.lang}}\n`
}

async function main() {
  let written = 0
  for (const entry of WRAPPER_MAP) {
    const srcAbs = path.join(SOURCE_FILES_DIR, entry.src)
    try {
      await fs.access(srcAbs)
    } catch {
      console.warn(`  SKIP (source missing): ${entry.src}`)
      continue
    }
    const outAbs = path.join(OUTPUT_DIR, entry.out)
    await fs.mkdir(path.dirname(outAbs), { recursive: true })
    await fs.writeFile(outAbs, buildWrapperContent(entry), 'utf8')
    written += 1
    console.log(`  wrote: source/${entry.out}`)
  }
  console.log('')
  console.log(`Generated ${written} source wrapper pages.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
