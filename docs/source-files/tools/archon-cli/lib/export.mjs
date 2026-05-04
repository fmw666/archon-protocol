import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import process from 'node:process'

import { parseFlags, resolveArchonSourceRoot, readVersion } from './common.mjs'

const VALID_PLATFORMS = new Set(['cursor', 'claude-code'])

/**
 * `archon export <output-dir> [--platform=...] [--overwrite]`
 *
 * Thin wrapper that delegates to the in-repo `scripts/export-archon-core.mjs`
 * until a self-contained package is shipped. This keeps a single source of
 * truth for the DOC_FILE_MAP / PLATFORM_FILES / TEMPLATE_FILE_MAP listings.
 */
export async function runExport({ args, cliRoot }) {
  const { flags, positional } = parseFlags(args)
  const outputDir = positional[0]
  if (!outputDir) {
    throw new Error('archon export: missing <output-dir>. Example: `archon export ./my-archon-kit`')
  }

  const platform = flags.platform ?? 'cursor'
  if (!VALID_PLATFORMS.has(platform)) {
    throw new Error(
      `archon export: invalid --platform=${platform} (expected one of: ${[...VALID_PLATFORMS].join(', ')})`,
    )
  }

  const sourceRoot = resolveArchonSourceRoot({
    cliRoot,
    explicitSource: flags.source,
  })

  const version = readVersion(sourceRoot)
  console.log(`[archon export] Source repo: ${sourceRoot}`)
  console.log(`[archon export] Archon version: ${version}`)
  console.log(`[archon export] Platform: ${platform}`)
  console.log(`[archon export] Output: ${path.resolve(outputDir)}`)

  if (flags['dry-run']) {
    console.log('[archon export] --dry-run: skipping file writes.')
    return
  }

  const scriptPath = path.join(sourceRoot, 'scripts/export-archon-core.mjs')
  const childArgs = [scriptPath, outputDir, `--platform=${platform}`]
  if (flags.overwrite) childArgs.push('--overwrite')

  await runNode(childArgs, sourceRoot)
}

function runNode(childArgs, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, childArgs, {
      cwd,
      stdio: 'inherit',
    })
    child.on('exit', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`archon export failed with exit code ${code}`))
    })
    child.on('error', (err) => reject(err))
  })
}
