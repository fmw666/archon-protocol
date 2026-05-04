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

  const installedMods = await detectInstalledModules({ projectRoot, manifest })
  const files = flattenFiles(manifest, { moduleIds: installedMods })

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
  console.log(`  bytes to fetch: ${formatBytes(totalBytes)}`)

  const changing = [...plan.add, ...plan.update]
  if (changing.length === 0) {
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
  if (plan.update.length > 0) {
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

  await fs.writeFile(path.join(projectRoot, '.archon', 'VERSION'), manifest.version + '\n')
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
