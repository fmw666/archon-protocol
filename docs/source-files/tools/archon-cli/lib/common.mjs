import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export function readCliVersion(cliRoot) {
  const pkgPath = path.resolve(cliRoot, 'package.json')
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
  return pkg.version
}

export function parseFlags(args) {
  const flags = {}
  const positional = []
  for (const a of args) {
    if (a.startsWith('--')) {
      const [key, value] = a.slice(2).split('=')
      flags[key] = value === undefined ? true : value
    } else {
      positional.push(a)
    }
  }
  return { flags, positional }
}

/**
 * Locate the Archon source repo root to draw kit material from.
 *
 * Strategy:
 * 1. If `--source=<path>` flag set, trust the user.
 * 2. Otherwise walk up from cwd looking for a directory containing both
 *    `.archon/VERSION` and `scripts/export-archon-core.mjs`.
 * 3. Finally, fall back to the CLI's own install location if it is itself
 *    inside an Archon source checkout (dev mode).
 *
 * Throws if no valid source root is found.
 */
export function resolveArchonSourceRoot({ cliRoot, explicitSource }) {
  if (explicitSource) {
    const abs = path.resolve(explicitSource)
    assertArchonSourceRoot(abs)
    return abs
  }

  let cursor = process.cwd()
  const root = path.parse(cursor).root
  while (true) {
    if (looksLikeArchonSource(cursor)) return cursor
    if (cursor === root) break
    cursor = path.dirname(cursor)
  }

  if (looksLikeArchonSource(path.resolve(cliRoot, '..', '..'))) {
    return path.resolve(cliRoot, '..', '..')
  }

  throw new Error(
    'Could not locate an Archon source repo (looking for `.archon/VERSION` + `scripts/export-archon-core.mjs`). Pass --source=<path> or run from within the Archon source tree.',
  )
}

function looksLikeArchonSource(dir) {
  return (
    existsSync(path.join(dir, '.archon/VERSION')) &&
    existsSync(path.join(dir, 'scripts/export-archon-core.mjs'))
  )
}

function assertArchonSourceRoot(dir) {
  if (!looksLikeArchonSource(dir)) {
    throw new Error(
      `Not a valid Archon source root: ${dir} (expected .archon/VERSION and scripts/export-archon-core.mjs).`,
    )
  }
}

export function readVersion(sourceRoot) {
  return readFileSync(path.join(sourceRoot, '.archon/VERSION'), 'utf8').trim()
}
