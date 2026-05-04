import { promises as fs } from 'node:fs'
import { existsSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { spawn } from 'node:child_process'

import { parseFlags, resolveArchonSourceRoot, readVersion } from './common.mjs'

const VALID_PLATFORMS = new Set(['cursor', 'claude-code'])

/**
 * `archon init <target-dir> [--platform=...] [--overwrite]`
 *
 * Scaffolds a new Archon-governed project. Under the hood, this is
 * `archon export` plus:
 *   - README pointing to the adopter-facing quickstart
 *   - A success banner reminding the adopter of the first 3 manifest edits
 *     required before the governance contract can pass.
 *
 * Rationale: first-time adopters should not need to understand the
 * export/standalone-kit distinction. `init` is the human-facing name;
 * `export` is the mechanical operation. Both land the same file tree today.
 */
export async function runInit({ args, cliRoot }) {
  const { flags, positional } = parseFlags(args)
  const targetDir = positional[0]
  if (!targetDir) {
    throw new Error(
      'archon init: missing <target-dir>. Example: `archon init ./my-new-project`',
    )
  }

  const platform = flags.platform ?? 'cursor'
  if (!VALID_PLATFORMS.has(platform)) {
    throw new Error(
      `archon init: invalid --platform=${platform} (expected one of: ${[...VALID_PLATFORMS].join(', ')})`,
    )
  }

  const sourceRoot = resolveArchonSourceRoot({
    cliRoot,
    explicitSource: flags.source,
  })
  const version = readVersion(sourceRoot)
  const resolvedTarget = path.resolve(targetDir)

  console.log(`[archon init] Archon version: ${version}`)
  console.log(`[archon init] Platform: ${platform}`)
  console.log(`[archon init] Target: ${resolvedTarget}`)

  if (flags['dry-run']) {
    console.log('[archon init] --dry-run: skipping file writes.')
    printPostInitBanner(resolvedTarget, platform, version, /* dryRun */ true)
    return
  }

  await runExportScript({
    sourceRoot,
    outputDir: resolvedTarget,
    platform,
    overwrite: Boolean(flags.overwrite),
  })

  printPostInitBanner(resolvedTarget, platform, version, false)
}

async function runExportScript({ sourceRoot, outputDir, platform, overwrite }) {
  if (existsSync(outputDir) && !overwrite) {
    throw new Error(
      `archon init: target already exists: ${outputDir}\nPass --overwrite to replace it.`,
    )
  }

  const scriptPath = path.join(sourceRoot, 'scripts/export-archon-core.mjs')
  const childArgs = [scriptPath, outputDir, `--platform=${platform}`]
  if (overwrite) childArgs.push('--overwrite')

  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, childArgs, {
      cwd: sourceRoot,
      stdio: 'inherit',
    })
    child.on('exit', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`archon init: export step failed with exit code ${code}`))
    })
    child.on('error', (err) => reject(err))
  })
}

function printPostInitBanner(target, platform, version, dryRun) {
  const rel = path.relative(process.cwd(), target) || '.'
  console.log('')
  console.log('================================================================')
  console.log(`  Archon v${version} kit${dryRun ? ' (dry-run plan)' : ''} ready at: ${rel}`)
  console.log('================================================================')
  console.log('')
  console.log('Next steps (before the first /archon run):')
  console.log('  1. Open `.archon/manifest.md` and fill in Product · Tech Stack · Validation Command')
  console.log('  2. Open `.archon/decisions.md` and replace ADR-1 with your project\'s first real decision')
  console.log('  3. Wire `npm run validate` (or equivalent) to cover lint + typecheck + test')
  console.log('  4. Read `docs/archon/adoption/quickstart.md` — it walks through the first delivery cycle')
  console.log('')
  console.log(`Platform directory is \`${platform === 'cursor' ? '.cursor/' : '.claude/'}\``)
  console.log('After the manifest is filled, verify with: `archon doctor`')
}
