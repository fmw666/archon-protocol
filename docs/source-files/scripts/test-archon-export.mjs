import { execFile } from 'node:child_process'
import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')
const EXPORT_SCRIPT = path.join(ROOT, 'scripts/export-archon-core.mjs')

const PLATFORMS = {
  cursor: { prefix: '.cursor', ruleExt: '.mdc' },
  'claude-code': { prefix: '.claude', ruleExt: '.md' },
}

async function loadExportManifest() {
  const src = await fs.readFile(EXPORT_SCRIPT, 'utf8')

  function extractArray(name) {
    const re = new RegExp(`const\\s+${name}\\s*=\\s*\\[([^\\]]*)\\]`, 's')
    const match = src.match(re)
    if (!match) throw new Error(`export script is missing ${name}`)
    return [...match[1].matchAll(/[`'"]([^`'"\n]+)[`'"]/g)]
      .map((item) => item[1])
      .map((file) => file.replace(/\$\{SRC_PREFIX\}/g, '.cursor'))
  }

  function extractMap(name) {
    const re = new RegExp(`const\\s+${name}\\s*=\\s*\\[([^\\]]*)\\]`, 's')
    const match = src.match(re)
    if (!match) throw new Error(`export script is missing ${name}`)
    const out = []
    for (const item of match[1].matchAll(/source\s*:\s*['"`]([^'"`]+)['"`]\s*,\s*target\s*:\s*['"`]([^'"`]+)['"`]/g)) {
      out.push({ source: item[1], target: item[2] })
    }
    return out
  }

  return {
    core: extractArray('ARCHON_CORE_FILES'),
    domainLens: extractArray('DOMAIN_LENS_FILES'),
    platform: extractArray('PLATFORM_FILES'),
    templates: extractMap('TEMPLATE_FILE_MAP'),
    tools: extractArray('UNIVERSAL_TOOL_FILES'),
    docs: extractMap('DOC_FILE_MAP'),
    docAssets: extractArray('DOC_ASSET_FILES'),
  }
}

function rewritePlatformTargetPath(relPath, platformName) {
  const platform = PLATFORMS[platformName]
  let rewritten = relPath.replace(/^\.cursor\//, `${platform.prefix}/`)
  if (platform.ruleExt === '.md') {
    rewritten = rewritten.replace(/\.mdc$/, '.md')
  }
  return rewritten
}

async function expectedFilesForPlatform(platformName) {
  const manifest = await loadExportManifest()
  const expected = [
    ...manifest.core,
    ...manifest.domainLens,
    ...manifest.platform.map((file) => rewritePlatformTargetPath(file, platformName)),
    ...manifest.templates.map((template) => template.target),
    ...manifest.tools.map((file) => rewritePlatformTargetPath(file, platformName)),
    ...manifest.docs.map((doc) => rewritePlatformTargetPath(doc.target, platformName)),
    ...manifest.docAssets,
    'README.md',
  ]
  if (await exists(path.join(ROOT, '.gitignore'))) {
    expected.push('.gitignore')
  }
  if (platformName === 'claude-code') {
    expected.push('CLAUDE.md')
  }
  return expected
}

async function exists(filePath) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function readText(root, relPath) {
  return fs.readFile(path.join(root, relPath), 'utf8')
}

async function assertFile(root, relPath) {
  if (!(await exists(path.join(root, relPath)))) {
    throw new Error(`Missing exported file: ${relPath}`)
  }
}

async function assertContains(root, relPath, needle) {
  const content = await readText(root, relPath)
  if (!content.includes(needle)) {
    throw new Error(`${relPath} does not include expected text: ${needle}`)
  }
}

async function assertNotExists(root, relPath) {
  if (await exists(path.join(root, relPath))) {
    throw new Error(`Unexpected exported file exists: ${relPath}`)
  }
}

async function runExport(platformName, outputDir) {
  await execFileAsync(
    process.execPath,
    [EXPORT_SCRIPT, `--platform=${platformName}`, outputDir],
    { cwd: ROOT, windowsHide: true },
  )
}

async function verifyPlatform(platformName, outputDir) {
  const expectedFiles = await expectedFilesForPlatform(platformName)
  for (const file of expectedFiles) {
    await assertFile(outputDir, file)
  }

  await assertContains(outputDir, '.archon/soul.md', '# Archon Soul')
  await assertContains(outputDir, '.archon/soul/delivery.md', '# Archon Soul — Delivery Extension')
  await assertContains(outputDir, '.archon/soul/review.md', '# Archon Soul — Review Extension')
  await assertContains(outputDir, '.archon/domain-lenses/registry.yaml', '"lenses"')
  await assertContains(outputDir, '.archon/domain-lenses/README.md', 'Domain Classifier')
  await assertContains(outputDir, '.archon/domain-lenses/templates/lens.md', 'domain_lens: <domain>')
  await assertContains(outputDir, '.archon/domain-lenses/templates/tool.md', 'cannot override soul')
  await assertContains(outputDir, '.archon/manifest.md', '# Project Manifest')
  await assertContains(outputDir, '.archon/manifest.md', 'archon-universal-forbidden-terms:start')
  await assertContains(outputDir, '.archon/manifest.md', 'archon-blink-project-high-risk-paths:start')
  await assertContains(outputDir, '.archon/drift.md', '# Drift Counter')
  await assertContains(outputDir, '.archon/debt.md', '# Technical Debt Registry')
  await assertContains(outputDir, '.archon/memos.md', '# Stakeholder Memos')
  await assertContains(outputDir, '.archon/contracts/governance-contract.yaml', 'file_budgets')
  await assertContains(outputDir, 'docs/archon/decisions.md', '# Archon Framework Decision Log')
  await assertContains(outputDir, '.archon/decisions.md', '# Project Architecture Decision Log')
  await assertContains(outputDir, 'scripts/archon-check.py', 'Portable Archon governance contract checker')
  await assertContains(outputDir, 'scripts/archon-check.sh', 'archon-check.py')
  await assertContains(outputDir, 'scripts/archon-run-state.mjs', 'resolve-for-commit')
  await assertContains(outputDir, '.archon/templates/run.template.md', 'permit_commit')
  await assertContains(outputDir, '.archon/templates/run-state.schema.json', '"schemaVersion"')
  await assertContains(outputDir, '.husky/pre-commit', 'permit_commit')
  await assertContains(outputDir, 'README.md', `Archon Standalone Kit`)
  await assertContains(outputDir, expectedFiles.find((file) => file.includes('blink-dispatch')), 'subagent_dispatch')
  await assertContains(outputDir, expectedFiles.find((file) => file.includes('external-agent-patterns')), 'Role Matrix')
}

async function verifyCursor(outputDir) {
  await assertNotExists(outputDir, '.claude/commands/archon.md')
  await assertNotExists(outputDir, 'CLAUDE.md')
  await assertContains(outputDir, '.cursor/rules/archon-wake.mdc', '.cursor/skills/archon-framework/SKILL.md')
}

async function verifyClaudeCode(outputDir) {
  await assertNotExists(outputDir, '.cursor/commands/archon.md')
  await assertNotExists(outputDir, '.claude/rules/archon.mdc')
  await assertContains(outputDir, 'CLAUDE.md', '.claude/skills/archon-framework/SKILL.md')
  await assertContains(outputDir, '.claude/rules/archon-wake.md', '.claude/skills/archon-framework/SKILL.md')
  await assertContains(outputDir, 'README.md', '.claude/commands/archon*.md')
}

async function verifyPortableChecker(outputDir) {
  await execFileAsync(
    'python',
    [path.join(outputDir, 'scripts/archon-check.py'), '--root', outputDir],
    { cwd: ROOT, windowsHide: true },
  )
}

async function verifyPortableCheckerRejectsUniversalTermLeak(outputDir, platformName) {
  const manifestPath = path.join(outputDir, '.archon/manifest.md')
  const leakTarget = path.join(outputDir, rewritePlatformTargetPath('.cursor/rules/archon.mdc', platformName))
  const manifest = await fs.readFile(manifestPath, 'utf8')
  const leakTargetContent = await fs.readFile(leakTarget, 'utf8')
  const markerPattern =
    /<!--\s*archon-universal-forbidden-terms:start\s*-->\s*```json\s*(\[[\s\S]*?\])\s*```\s*<!--\s*archon-universal-forbidden-terms:end\s*-->/
  const forbiddenTerm = 'AdopterStackSentinel'
  const mutatedManifest = manifest.replace(
    markerPattern,
    `<!-- archon-universal-forbidden-terms:start -->\n\`\`\`json\n["${forbiddenTerm}"]\n\`\`\`\n<!-- archon-universal-forbidden-terms:end -->`,
  )

  if (mutatedManifest === manifest) {
    throw new Error('.archon/manifest.md is missing archon-universal-forbidden-terms marker')
  }

  try {
    await fs.writeFile(manifestPath, mutatedManifest, 'utf8')
    await fs.writeFile(leakTarget, `${leakTargetContent}\n\n<!-- ${forbiddenTerm} leak fixture -->\n`, 'utf8')
    await execFileAsync(
      'python',
      [path.join(outputDir, 'scripts/archon-check.py'), '--root', outputDir],
      { cwd: ROOT, windowsHide: true },
    )
  } catch (error) {
    const output = `${error.stdout ?? ''}${error.stderr ?? ''}`
    if (output.includes('project-specific or stack-specific term') && output.includes(forbiddenTerm)) {
      return
    }
    throw error
  } finally {
    await fs.writeFile(manifestPath, manifest, 'utf8')
    await fs.writeFile(leakTarget, leakTargetContent, 'utf8')
  }

  throw new Error(`portable checker accepted a universal module leak for ${forbiddenTerm}`)
}

async function verifyBundledDocImageLinks(outputDir) {
  const manifest = await loadExportManifest()
  const exportedDocs = manifest.docs
    .map((doc) => doc.target)
    .filter((file) => file.startsWith('docs/archon/') && file.endsWith('.md'))
  const missing = []

  for (const docPath of exportedDocs) {
    const absDocPath = path.join(outputDir, docPath)
    const body = await fs.readFile(absDocPath, 'utf8')
    for (const match of body.matchAll(/!\[[^\]]*]\(([^)]+)\)/g)) {
      const target = path.resolve(path.dirname(absDocPath), match[1])
      if (!(await exists(target))) {
        missing.push(`${docPath} -> ${match[1]}`)
      }
    }
  }

  if (missing.length) {
    throw new Error(`Bundled docs reference missing image assets:\n  ${missing.join('\n  ')}`)
  }
}

async function main() {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'archon-export-'))

  try {
    for (const platformName of Object.keys(PLATFORMS)) {
      const outputDir = path.join(tmpRoot, platformName)
      await runExport(platformName, outputDir)
      await verifyPlatform(platformName, outputDir)
      await verifyBundledDocImageLinks(outputDir)
      await verifyPortableChecker(outputDir)
      await verifyPortableCheckerRejectsUniversalTermLeak(outputDir, platformName)

      if (platformName === 'cursor') {
        await verifyCursor(outputDir)
      } else if (platformName === 'claude-code') {
        await verifyClaudeCode(outputDir)
      }
    }

    console.log('[archon-export-test] Cursor and Claude Code bootstrap exports verified.')
  } finally {
    await fs.rm(tmpRoot, { recursive: true, force: true })
  }
}

main().catch((error) => {
  console.error(`[archon-export-test] ${error.message}`)
  process.exitCode = 1
})
