// lib/uninstall.mjs — `archon uninstall`. Removes Archon-owned files from a
// project. Runtime ledgers are preserved in place by default; the user can
// opt into `--archive-ledgers` or the destructive `--delete-ledgers`.
import { promises as fs } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import readline from 'node:readline'

import {
  fetchManifest,
  resolveBaseUrl,
  pathExists,
  flattenFiles,
  isRuntimeLedgerPath,
} from './manifest.mjs'
import { parseFlags } from './common.mjs'

export async function runUninstall({ args }) {
  const { flags, positional } = parseFlags(args)
  const projectRoot = path.resolve(positional[0] || process.cwd())
  const yes = Boolean(flags.yes || flags.y)
  const archiveLedgers = Boolean(flags['archive-ledgers'])
  const deleteLedgers = Boolean(flags['delete-ledgers'])
  const dryRun = Boolean(flags['dry-run'])

  if (archiveLedgers && deleteLedgers) {
    throw new Error('--archive-ledgers and --delete-ledgers are mutually exclusive.')
  }
  const ledgerMode = deleteLedgers ? 'delete' : archiveLedgers ? 'archive' : 'preserve'

  if (!(await pathExists(path.join(projectRoot, '.archon', 'soul.md')))) {
    throw new Error(`No Archon installation found at ${projectRoot}.`)
  }

  const baseUrl = resolveBaseUrl({ flags })
  const manifest = await fetchManifest({ baseUrl })
  const canonicalFiles = flattenFiles(manifest).map((f) => f.path)

  const removable = []
  for (const rel of canonicalFiles) {
    const abs = path.join(projectRoot, rel)
    if (await pathExists(abs)) removable.push(rel)
  }

  console.log(`[archon uninstall] project: ${projectRoot}`)
  console.log(`[archon uninstall] canonical files present: ${removable.length}`)
  console.log(`[archon uninstall] ledger mode: ${ledgerMode}`)

  if (!yes) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    const confirm = await new Promise((r) => rl.question(
      `[archon uninstall] will remove ${removable.length} files. Continue? [y/N] `,
      r,
    ))
    rl.close()
    if (!confirm.toLowerCase().startsWith('y')) {
      console.log('[archon uninstall] aborted.')
      return
    }
  }

  if (ledgerMode === 'delete' && !yes) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    const typed = await new Promise((r) => rl.question(
      `[archon uninstall] --delete-ledgers will PERMANENTLY remove your governance history. Type DELETE to confirm: `,
      r,
    ))
    rl.close()
    if (typed.trim() !== 'DELETE') {
      console.log('[archon uninstall] aborted (delete not confirmed).')
      return
    }
  }

  if (dryRun) {
    console.log('[archon uninstall] dry-run — the following files would be removed:')
    for (const rel of removable) console.log(`  ${rel}`)
    return
  }

  let removed = 0
  for (const rel of removable) {
    if (isRuntimeLedgerPath(rel, manifest)) continue
    const abs = path.join(projectRoot, rel)
    try {
      await fs.unlink(abs)
      removed += 1
    } catch (e) {
      if (e.code !== 'ENOENT') throw e
    }
  }

  if (ledgerMode === 'archive') {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-')
    const archiveRoot = path.join(projectRoot, `.archon-history-${stamp}`)
    await fs.mkdir(archiveRoot, { recursive: true })
    const { files = [], directories = [] } = manifest.runtime_ledger_paths || {}
    for (const f of files) {
      const from = path.join(projectRoot, f)
      if (await pathExists(from)) {
        const to = path.join(archiveRoot, f)
        await fs.mkdir(path.dirname(to), { recursive: true })
        await fs.rename(from, to)
      }
    }
    for (const d of directories) {
      const from = path.join(projectRoot, d)
      if (await pathExists(from)) {
        const to = path.join(archiveRoot, d)
        await fs.mkdir(path.dirname(to), { recursive: true })
        await fs.rename(from, to)
      }
    }
    console.log(`[archon uninstall] ledgers moved to ${path.relative(projectRoot, archiveRoot)}`)
  } else if (ledgerMode === 'delete') {
    const { files = [], directories = [] } = manifest.runtime_ledger_paths || {}
    for (const f of files) {
      const abs = path.join(projectRoot, f)
      if (await pathExists(abs)) await fs.unlink(abs)
    }
    for (const d of directories) {
      const abs = path.join(projectRoot, d)
      if (await pathExists(abs)) await fs.rm(abs, { recursive: true, force: true })
    }
  }

  await pruneEmptyDirs(projectRoot, [
    '.archon',
    '.cursor/commands',
    '.cursor/agents',
    '.cursor/rules',
    '.cursor/skills',
    'tools/archon-cli',
    'tools',
  ])

  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const logPath = path.join(projectRoot, `.archon-uninstall-${stamp}.log`)
  const body =
    `Archon uninstall\n` +
    `================\n` +
    `Timestamp: ${new Date().toISOString()}\n` +
    `Canonical version (manifest): v${manifest.version}\n` +
    `Ledger mode: ${ledgerMode}\n` +
    `Files removed: ${removed}\n\n` +
    removable.join('\n') + '\n'
  await fs.writeFile(logPath, body)

  console.log('')
  console.log(`[archon uninstall] Done. Removed ${removed} files. Log: ${path.relative(projectRoot, logPath)}`)
}

// Recursively remove a directory if (and only if) every entry inside it is
// itself an empty directory. Best-effort: a non-empty leaf simply stops the
// upward sweep at that branch. KNOWN-005: previous version did not recurse,
// so `tools/archon-cli/bin/` and `tools/archon-cli/lib/` survived uninstall.
async function pruneEmptyDirs(projectRoot, dirs) {
  for (const d of dirs) {
    const abs = path.join(projectRoot, d)
    await pruneIfEmptyRec(abs)
  }
}

async function pruneIfEmptyRec(abs) {
  let stat
  try {
    stat = await fs.stat(abs)
  } catch {
    return false
  }
  if (!stat.isDirectory()) return false
  let entries
  try {
    entries = await fs.readdir(abs)
  } catch {
    return false
  }
  for (const name of entries) {
    await pruneIfEmptyRec(path.join(abs, name))
  }
  // Re-check after recursion — children may have just emptied this dir.
  try {
    const remaining = await fs.readdir(abs)
    if (remaining.length === 0) {
      await fs.rmdir(abs)
      return true
    }
  } catch {
    // best-effort
  }
  return false
}
