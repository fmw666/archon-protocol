// Fix all markdown cross-references after migration from Distilgent to archon-protocol.
// Usage: node scripts/fix-migrated-links.mjs
import { promises as fs } from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(process.cwd(), 'docs')

async function walkMd(dir) {
  const out = []
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue
    if (entry.name === 'source-files') continue  // Do not rewrite links inside copied source
    if (entry.name === 'images') continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...(await walkMd(full)))
    else if (entry.isFile() && full.endsWith('.md')) out.push(full)
  }
  return out
}

const REPLACEMENTS = [
  // Image paths: ../images/archon/xxx → /images/xxx
  { from: /\]\(\.\.\/images\/archon\//g, to: '](/images/' },
  // dashboard-prd was at adoption/, so two-levels-up images were also used
  { from: /\]\(\.\.\/\.\.\/images\/archon\//g, to: '](/images/' },
  // README internal cross-links (from docs/archon/README.md perspective)
  { from: /\]\(architecture\.md/g, to: '](/concepts/architecture' },
  { from: /\]\(setup\.md/g, to: '](/setup/full-guide' },
  { from: /\]\(user-journeys\.md/g, to: '](/concepts/user-journeys' },
  { from: /\]\(decisions\.md/g, to: '](/concepts/decisions' },
  { from: /\]\(concepts\/overview\.md/g, to: '](/concepts/overview' },
  { from: /\]\(concepts\/model-vs-harness\.md/g, to: '](/concepts/model-vs-harness' },
  { from: /\]\(concepts\/product-architecture-workflow\.md/g, to: '](/concepts/product-architecture-workflow' },
  { from: /\]\(concepts\/superpowers-comparison\.md/g, to: '](/concepts/superpowers-comparison' },
  { from: /\]\(concepts\/refactoring-adoption\.md/g, to: '](/concepts/refactoring-adoption' },
  { from: /\]\(mechanisms\/drift-mechanism\.md/g, to: '](/concepts/drift-mechanism' },
  { from: /\]\(adoption\/quickstart\.md/g, to: '](/setup/quickstart' },
  { from: /\]\(adoption\/dashboard-redesign-prd\.md/g, to: '](/setup/dashboard-prd' },
  // decisions.md cross-link to CHANGELOG
  { from: /\]\(CHANGELOG\.md/g, to: '](/changelog/framework' },
  // templates folder references
  { from: /\]\(templates\/manifest\.template\.md/g, to: '](/setup/templates/manifest.template' },
  { from: /\]\(templates\/decisions\.template\.md/g, to: '](/setup/templates/decisions.template' },
  { from: /\]\(templates\/drift\.template\.md/g, to: '](/setup/templates/drift.template' },
  { from: /\]\(templates\/debt\.template\.md/g, to: '](/setup/templates/debt.template' },
  { from: /\]\(templates\/memos\.template\.md/g, to: '](/setup/templates/memos.template' },
  // mechanisms folder cross-link (from architecture.md) – keep file names stable
  { from: /\]\(mechanisms\//g, to: '](/concepts/' },
  // Quickstart link forms
  { from: /\]\(\.\.\/README\.md/g, to: '](/concepts/introduction' },
  { from: /\]\(\.\.\/architecture\.md/g, to: '](/concepts/architecture' },
  { from: /\]\(\.\.\/setup\.md/g, to: '](/setup/full-guide' },
  { from: /\]\(\.\.\/decisions\.md/g, to: '](/concepts/decisions' },
  { from: /\]\(\.\.\/user-journeys\.md/g, to: '](/concepts/user-journeys' },
  { from: /\]\(\.\.\/concepts\//g, to: '](/concepts/' },
  { from: /\]\(\.\.\/mechanisms\//g, to: '](/concepts/' },
  { from: /\]\(\.\.\/templates\//g, to: '](/setup/templates/' },
  { from: /\]\(\.\.\/adoption\//g, to: '](/setup/' },
]

async function fixFile(filePath) {
  const original = await fs.readFile(filePath, 'utf8')
  let updated = original
  for (const { from, to } of REPLACEMENTS) {
    updated = updated.replace(from, to)
  }
  if (updated !== original) {
    await fs.writeFile(filePath, updated, 'utf8')
    return true
  }
  return false
}

async function main() {
  const files = await walkMd(ROOT)
  let changed = 0
  for (const f of files) {
    const didChange = await fixFile(f)
    if (didChange) {
      console.log(`  fixed: ${path.relative(ROOT, f)}`)
      changed += 1
    }
  }
  console.log('')
  console.log(`Processed ${files.length} files; ${changed} updated.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
