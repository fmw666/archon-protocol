import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { spawn } from 'node:child_process'

import { parseFlags } from './common.mjs'
import {
  fetchManifest,
  resolveBaseUrl,
  classifyFile,
  detectInstalledModules,
  flattenFiles,
} from './manifest.mjs'

/**
 * `archon doctor [project-dir]`
 *
 * Four-layer health check for an Archon-governed project:
 *   L1 — Structural:  required files present (soul.md, manifest.md, drift.md, ...)
 *   L2 — Contract:    delegates to scripts/archon-check.py when available
 *   L3 — Hints:       cheap readability signals (unfilled template placeholders,
 *                     missing validation command, empty concept glossary)
 *   L4 — Canonical:   diff vs aaep.site/manifest.json (opt-out with --offline)
 *
 * Exit code 0 = green, 1 = any failure. Non-fatal warnings print but do not fail.
 */
export async function runDoctor({ args }) {
  const { flags, positional } = parseFlags(args)
  const projectDir = path.resolve(positional[0] ?? '.')

  console.log(`[archon doctor] Auditing: ${projectDir}`)
  console.log('')

  const results = { fail: 0, warn: 0 }

  await checkStructure(projectDir, results)
  await checkContract(projectDir, results, flags)
  await checkManifestHints(projectDir, results)
  if (!flags.offline) {
    await checkCanonical(projectDir, results, flags)
  }

  console.log('')
  if (results.fail === 0 && results.warn === 0) {
    console.log('[archon doctor] All checks passed. Governance contract is healthy.')
    return
  }
  if (results.fail === 0) {
    console.log(`[archon doctor] ${results.warn} warning(s), 0 failures. Project is usable; address warnings before the next close-out.`)
    return
  }
  console.error(`[archon doctor] ${results.fail} failure(s), ${results.warn} warning(s). Fix failures before running /archon.`)
  process.exitCode = 1
}

const REQUIRED_FILES = [
  '.archon/soul.md',
  '.archon/manifest.md',
  '.archon/drift.md',
  '.archon/debt.md',
  '.archon/memos.md',
  '.archon/decisions.md',
  '.archon/VERSION',
]

const REQUIRED_PLATFORM_HINT = [
  { any: ['.cursor/', '.claude/'], label: 'platform directory (.cursor/ or .claude/)' },
]

async function checkStructure(root, results) {
  console.log('[L1 Structural]')
  for (const rel of REQUIRED_FILES) {
    const abs = path.join(root, rel)
    if (existsSync(abs)) {
      console.log(`  [OK]   ${rel}`)
    } else {
      console.log(`  [FAIL] ${rel} (missing — run \`archon init\` inside this directory first)`)
      results.fail += 1
    }
  }
  for (const { any, label } of REQUIRED_PLATFORM_HINT) {
    const present = any.find((p) => existsSync(path.join(root, p)))
    if (present) {
      console.log(`  [OK]   ${label} → ${present}`)
    } else {
      console.log(`  [FAIL] ${label} (missing)`)
      results.fail += 1
    }
  }
  console.log('')
}

async function checkContract(root, results, flags) {
  console.log('[L2 Contract]')
  const checkScript = path.join(root, 'scripts/archon-check.py')
  if (!existsSync(checkScript)) {
    console.log(`  [WARN] scripts/archon-check.py not found in ${root}. Skipping portable contract check.`)
    results.warn += 1
    console.log('')
    return
  }

  const python = flags.python ?? (process.platform === 'win32' ? 'python' : 'python3')

  try {
    await new Promise((resolve, reject) => {
      const child = spawn(python, [checkScript, '--root', root], {
        cwd: root,
        stdio: 'inherit',
      })
      child.on('exit', (code) => {
        if (code === 0) {
          console.log('  [OK]   archon-check.py passed.')
          resolve()
        } else {
          console.log(`  [FAIL] archon-check.py exited with code ${code}.`)
          results.fail += 1
          resolve()
        }
      })
      child.on('error', (err) => reject(err))
    })
  } catch (err) {
    console.log(`  [WARN] Could not run python contract check: ${err.message}`)
    console.log('         Pass --python=<path> to pick an explicit interpreter.')
    results.warn += 1
  }
  console.log('')
}

async function checkManifestHints(root, results) {
  console.log('[L3 Hints]')
  const manifestPath = path.join(root, '.archon/manifest.md')
  if (!existsSync(manifestPath)) {
    console.log('  [SKIP] .archon/manifest.md not readable (L1 already flagged this).')
    console.log('')
    return
  }

  const content = await readFile(manifestPath, 'utf8')
  const placeholders = (content.match(/<!-- [^>]*? -->/g) ?? []).length
  if (placeholders > 10) {
    console.log(`  [WARN] ${placeholders} unfilled \`<!-- ... -->\` placeholders in manifest.md — fill at least Product / Tech Stack / Validation Command before the first delivery.`)
    results.warn += 1
  } else if (placeholders > 0) {
    console.log(`  [INFO] ${placeholders} remaining \`<!-- ... -->\` placeholders in manifest.md (non-blocking).`)
  } else {
    console.log('  [OK]   manifest.md has no remaining template placeholders.')
  }

  if (!/^## Validation Command/m.test(content)) {
    console.log('  [WARN] Missing `## Validation Command` section in manifest.md.')
    results.warn += 1
  } else {
    const validationBlock = content.split(/^## /m).find((block) => block.startsWith('Validation Command'))
    const body = validationBlock ? validationBlock.replace(/^Validation Command\n/, '').trim() : ''
    if (!body || /^<!--/.test(body)) {
      console.log('  [WARN] `## Validation Command` is empty or still a placeholder. Define the project\'s lint + typecheck + test command.')
      results.warn += 1
    } else {
      console.log('  [OK]   Validation Command declared.')
    }
  }
  console.log('')
}

async function checkCanonical(root, results, flags) {
  console.log('[L4 Canonical diff (vs aaep.site/manifest.json)]')
  let manifest
  try {
    manifest = await fetchManifest({ baseUrl: resolveBaseUrl({ flags }) })
  } catch (err) {
    console.log(`  [WARN] could not fetch canonical manifest: ${err.message}`)
    console.log('         pass --offline to skip this layer.')
    results.warn += 1
    console.log('')
    return
  }
  const installedMods = await detectInstalledModules({ projectRoot: root, manifest })
  const files = flattenFiles(manifest, { moduleIds: installedMods })
  let modified = 0
  let missing = 0
  for (const f of files) {
    const c = await classifyFile({ projectRoot: root, manifestFile: f })
    if (c === 'modified') modified += 1
    else if (c === 'missing') missing += 1
  }
  if (modified === 0 && missing === 0) {
    console.log(`  [OK]   ${files.length}/${files.length} files match canonical v${manifest.version}`)
  } else {
    if (missing > 0) {
      console.log(`  [WARN] ${missing} file(s) missing vs canonical v${manifest.version}. Run \`archon sync\` for details.`)
      results.warn += 1
    }
    if (modified > 0) {
      console.log(`  [WARN] ${modified} file(s) modified vs canonical v${manifest.version}. Run \`archon sync\` for details.`)
      results.warn += 1
    }
  }
  console.log('')
}
