// lib/update.mjs — `archon update`. Upgrades an already-installed project to
// the canonical version on aaep.site. Runtime ledgers are preserved; every
// framework file is re-verified against the manifest. All-or-nothing writes
// with backups of overwritten files.
import { promises as fs } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import readline from 'node:readline'

import {
  fetchManifest,
  resolveBaseUrl,
  fetchAndVerify,
  writeFileSafe,
  pathExists,
  classifyFile,
  detectInstalledModules,
  flattenFiles,
  isRuntimeLedgerPath,
  formatBytes,
} from './manifest.mjs'
import { parseFlags } from './common.mjs'

export async function runUpdate({ args }) {
  const { flags, positional } = parseFlags(args)
  const projectRoot = path.resolve(positional[0] || process.cwd())
  const force = Boolean(flags.force)
  const yes = Boolean(flags.yes || flags.y)
  const dryRun = Boolean(flags['dry-run'])

  if (!(await pathExists(path.join(projectRoot, '.archon', 'soul.md')))) {
    throw new Error(`No Archon installation found at ${projectRoot}. Use \`archon install\` for a fresh install.`)
  }
  const installedVersion = (await fs.readFile(path.join(projectRoot, '.archon', 'VERSION'), 'utf8')).trim()

  const baseUrl = resolveBaseUrl({ flags })
  console.log(`[archon update] project:  ${projectRoot}`)
  console.log(`[archon update] installed: v${installedVersion}`)
  const manifest = await fetchManifest({ baseUrl })
  console.log(`[archon update] canonical: v${manifest.version}`)

  if (installedVersion === manifest.version && !force) {
    console.log('[archon update] already on canonical version. Use --force to re-verify and rewrite any drifted files.')
    return
  }

  const detectedMods = await detectInstalledModules({ projectRoot, manifest })
  const installedMods = applyModuleOverrides({
    detected: detectedMods,
    manifest,
    withFlag: flags['with'],
    withoutFlag: flags['without'],
  })
  if (!setsEqual(detectedMods, installedMods)) {
    const added = [...installedMods].filter((m) => !detectedMods.has(m))
    const removed = [...detectedMods].filter((m) => !installedMods.has(m))
    if (added.length) console.log(`[archon update] --with adds:     ${added.join(', ')}`)
    if (removed.length) console.log(`[archon update] --without skips: ${removed.join(', ')}`)
  }
  const files = flattenFiles(manifest, { moduleIds: installedMods })

  // Plan removals for modules the user explicitly opted out of (--without).
  // Files that exist on disk but are no longer in the installed module set
  // must be removed, otherwise `sync` will flag them as "extra".
  const keepPathSet = new Set(files.map((f) => f.path))
  const removals = []
  const allCanonicalFiles = flattenFiles(manifest)
  for (const f of allCanonicalFiles) {
    if (keepPathSet.has(f.path)) continue
    const abs = path.join(projectRoot, f.path)
    if (await pathExists(abs)) removals.push(f.path)
  }

  const plan = { add: [], update: [], same: [] }
  for (const f of files) {
    const c = await classifyFile({ projectRoot, manifestFile: f })
    if (c === 'missing') plan.add.push(f)
    else if (c === 'modified') plan.update.push(f)
    else plan.same.push(f)
  }

  const totalBytes = [...plan.add, ...plan.update].reduce((s, f) => s + f.bytes, 0)
  console.log(`[archon update] plan:`)
  console.log(`  add:     ${plan.add.length}`)
  console.log(`  update:  ${plan.update.length}`)
  console.log(`  same:    ${plan.same.length}`)
  console.log(`  remove:  ${removals.length}`)
  console.log(`  bytes to fetch: ${formatBytes(totalBytes)}`)

  const changing = [...plan.add, ...plan.update]
  if (changing.length === 0 && removals.length === 0) {
    console.log('[archon update] nothing to do.')
    return
  }

  if (!yes && !dryRun) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    const answer = await new Promise((r) => rl.question('[archon update] proceed? [y/N] ', r))
    rl.close()
    if (!answer.toLowerCase().startsWith('y')) {
      console.log('[archon update] aborted.')
      return
    }
  }

  if (dryRun) {
    console.log('[archon update] dry-run — no files written.')
    return
  }

  console.log('[archon update] downloading and verifying …')
  const buffers = new Map()
  let done = 0
  for (const f of changing) {
    const buf = await fetchAndVerify(f)
    buffers.set(f.path, buf)
    done += 1
    if (done % 10 === 0 || done === changing.length) {
      process.stdout.write(`\r[archon update] verified ${done}/${changing.length}`)
    }
  }
  process.stdout.write('\n')

  const backupRoot = path.join(projectRoot, `.archon-backup-${isoStamp()}`)
  if (plan.update.length > 0 || removals.length > 0) {
    await fs.mkdir(backupRoot, { recursive: true })
    console.log(`[archon update] backups → ${path.relative(projectRoot, backupRoot)}`)
  }

  for (const f of changing) {
    // Safety net: never write a runtime-ledger path (would not happen since
    // manifest never lists them, but defensive anyway).
    if (isRuntimeLedgerPath(f.path, manifest)) continue
    await writeFileSafe({
      projectRoot,
      relPath: f.path,
      buf: buffers.get(f.path),
      backupRoot: plan.update.some((p) => p.path === f.path) ? backupRoot : null,
    })
  }

  for (const rel of removals) {
    if (isRuntimeLedgerPath(rel, manifest)) continue
    const abs = path.join(projectRoot, rel)
    if (await pathExists(abs)) {
      const backupAbs = path.join(backupRoot, rel)
      await fs.mkdir(path.dirname(backupAbs), { recursive: true })
      await fs.rename(abs, backupAbs)
    }
  }
  if (removals.length > 0) {
    console.log(`[archon update] removed ${removals.length} files from opted-out modules (moved to backup).`)
    await pruneEmptyDirs(projectRoot, [
      'tools/archon-cli/bin',
      'tools/archon-cli/lib',
      'tools/archon-cli',
      'tools',
    ])
  }

  // VERSION is written by writeFileSafe above as part of the core-version
  // module. Do not write it manually here — doing so with a synthetic '\n'
  // introduces line-ending drift against the canonical bytes on platforms
  // where upstream uses CRLF.
  await logUpdate({ projectRoot, manifest, installedVersion, plan })

  console.log('')
  console.log(`[archon update] Done. v${installedVersion} → v${manifest.version}.`)
}

async function logUpdate({ projectRoot, manifest, installedVersion, plan }) {
  const stamp = isoStamp()
  const drift = path.join(projectRoot, '.archon', 'drift.md')
  const entry =
    `\n## update — Archon v${installedVersion} → v${manifest.version} — ${stamp}\n\n` +
    `- Agent: archon-cli (update)\n` +
    `- Files added: ${plan.add.length}\n` +
    `- Files updated: ${plan.update.length}\n` +
    `- Files unchanged: ${plan.same.length}\n` +
    `- Source: ${manifest.base_url}/manifest.json (sha256-verified)\n`
  await fs.appendFile(drift, entry)
}

function isoStamp() {
  return new Date().toISOString().replace(/[:.]/g, '-')
}

function parseModuleList(raw) {
  if (!raw || raw === true) return null
  if (raw === 'all') return 'all'
  if (raw === 'none') return new Set()
  return new Set(String(raw).split(',').map((s) => s.trim()).filter(Boolean))
}

// Refines the auto-detected module set using --with / --without overrides.
// Required modules are never dropped (they are Archon's core contract).
function applyModuleOverrides({ detected, manifest, withFlag, withoutFlag }) {
  const result = new Set(detected)
  const withParsed = parseModuleList(withFlag)
  const withoutParsed = parseModuleList(withoutFlag)
  const optionals = manifest.modules.filter((m) => !m.required).map((m) => m.id)
  const requiredIds = new Set(manifest.modules.filter((m) => m.required).map((m) => m.id))

  if (withParsed === 'all') {
    for (const id of optionals) result.add(id)
  } else if (withParsed instanceof Set) {
    for (const id of withParsed) result.add(id)
  }

  if (withoutParsed instanceof Set) {
    for (const id of withoutParsed) {
      if (requiredIds.has(id)) {
        console.warn(`[archon update] --without=${id} ignored (required module).`)
        continue
      }
      result.delete(id)
    }
  }

  for (const id of requiredIds) result.add(id)
  return result
}

function setsEqual(a, b) {
  if (a.size !== b.size) return false
  for (const v of a) if (!b.has(v)) return false
  return true
}

async function pruneEmptyDirs(projectRoot, dirs) {
  for (const d of dirs) {
    const abs = path.join(projectRoot, d)
    if (!(await pathExists(abs))) continue
    try {
      const entries = await fs.readdir(abs)
      if (entries.length === 0) await fs.rmdir(abs)
    } catch {
      // best-effort
    }
  }
}
