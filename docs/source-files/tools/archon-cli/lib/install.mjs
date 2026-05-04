// lib/install.mjs — implements `archon install [target-dir]`. Installs Archon
// into a fresh (or forced) project by fetching manifest.json and every file
// it lists, verifying sha256, and writing atomically.
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
  formatBytes,
  flattenFiles,
} from './manifest.mjs'
import { parseFlags } from './common.mjs'

export async function runInstall({ args }) {
  const { flags, positional } = parseFlags(args)
  const targetDir = path.resolve(positional[0] || process.cwd())
  const force = Boolean(flags.force)
  const dryRun = Boolean(flags['dry-run'])
  const yes = Boolean(flags.yes || flags.y)
  const includeOptional = parseModuleFlag(flags)
  const excludeOptional = parseWithoutFlag(flags)

  console.log(`[archon install] target: ${targetDir}`)

  if (await pathExists(path.join(targetDir, '.archon', 'soul.md'))) {
    if (!force) {
      throw new Error(
        'This project already has Archon installed (.archon/soul.md exists). Use `archon update` or pass --force to re-install.',
      )
    }
    console.log('[archon install] --force supplied; existing .archon will be overwritten (backup to .archon-backup-<timestamp>/).')
  }

  await fs.mkdir(targetDir, { recursive: true })

  const baseUrl = resolveBaseUrl({ flags })
  console.log(`[archon install] fetching manifest from ${baseUrl}/manifest.json …`)
  const manifest = await fetchManifest({ baseUrl })
  console.log(`[archon install] manifest v${manifest.version} — ${manifest.totals.files} files across ${manifest.totals.modules} modules`)

  const selectedModules = await pickModules({ manifest, includeOptional, excludeOptional, yes })
  const files = flattenFiles(manifest, { moduleIds: selectedModules })

  const totalBytes = files.reduce((s, f) => s + f.bytes, 0)
  console.log(`[archon install] plan: ${files.length} files (${formatBytes(totalBytes)}) from ${selectedModules.size} modules`)

  if (dryRun) {
    console.log('[archon install] dry-run — no files written.')
    return
  }

  console.log('[archon install] downloading and verifying …')
  const buffers = new Map()
  let done = 0
  for (const f of files) {
    const buf = await fetchAndVerify(f)
    buffers.set(f.path, buf)
    done += 1
    if (done % 10 === 0 || done === files.length) {
      process.stdout.write(`\r[archon install] verified ${done}/${files.length}`)
    }
  }
  process.stdout.write('\n')

  let backupRoot = null
  if (force) {
    backupRoot = path.join(targetDir, `.archon-backup-${isoStamp()}`)
    await fs.mkdir(backupRoot, { recursive: true })
    console.log(`[archon install] backups will be written to ${path.relative(targetDir, backupRoot)}`)
  }

  console.log('[archon install] writing files …')
  for (const f of files) {
    await writeFileSafe({
      projectRoot: targetDir,
      relPath: f.path,
      buf: buffers.get(f.path),
      backupRoot,
    })
  }

  await seedRuntimeLedgers({ projectRoot: targetDir, manifest })
  await logInstall({
    projectRoot: targetDir,
    manifest,
    selectedModules,
    filesWritten: files.length,
  })

  console.log('')
  console.log(`[archon install] Done. Archon v${manifest.version} installed into ${targetDir}`)
  console.log('[archon install] Next steps: open the project, say "hi archon" to your agent, or see https://aaep.site/setup/quickstart')
}

function parseModuleFlag(flags) {
  const raw = flags['with']
  if (!raw || raw === true) return null
  if (raw === 'all') return 'all'
  if (raw === 'none') return new Set()
  return new Set(raw.split(',').map((s) => s.trim()).filter(Boolean))
}

function parseWithoutFlag(flags) {
  const raw = flags['without']
  if (!raw || raw === true) return null
  return new Set(String(raw).split(',').map((s) => s.trim()).filter(Boolean))
}

async function pickModules({ manifest, includeOptional, excludeOptional, yes }) {
  const chosen = new Set()
  const optionals = []
  for (const mod of manifest.modules) {
    if (mod.required) {
      chosen.add(mod.id)
    } else {
      optionals.push(mod)
    }
  }

  if (includeOptional === 'all') {
    for (const m of optionals) chosen.add(m.id)
  } else if (includeOptional instanceof Set) {
    for (const id of includeOptional) chosen.add(id)
  } else if (yes) {
    // no prompt, no --with: default = required only
  } else {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    try {
      for (const m of optionals) {
        const answer = await ask(rl, `  Include optional module "${m.id}" (${m.file_count} files)? ${m.title}\n  [y/N] `)
        if (answer.toLowerCase().startsWith('y')) chosen.add(m.id)
      }
    } finally {
      rl.close()
    }
  }

  if (excludeOptional instanceof Set) {
    const requiredIds = new Set(manifest.modules.filter((m) => m.required).map((m) => m.id))
    for (const id of excludeOptional) {
      if (requiredIds.has(id)) {
        console.warn(`[archon install] --without=${id} ignored (required module).`)
        continue
      }
      chosen.delete(id)
    }
  }

  return chosen
}

function ask(rl, question) {
  return new Promise((resolve) => rl.question(question, resolve))
}

async function seedRuntimeLedgers({ projectRoot, manifest }) {
  const headers = {
    'manifest.md': '# Project Manifest\n\n_Identity, tech stack, decision index. Edit this as your project evolves._\n',
    'drift.md': '# Drift Log\n\n_One entry per governance event. Append-only._\n',
    'debt.md': '# Debt Log\n\n_Known technical debt. One line per item; details under debt/items/._\n',
    'memos.md': '# Memos Index\n\n_Evaluations, decisions-in-flight, context captures. Details under memos/records/._\n',
    'signs.md': '# Signs Table\n\n_Trigger-indexed reasoning capsules. One row per sign._\n',
    'decisions.md': '# Decision Index\n\n_ADR-style headers. Details inline or linked._\n',
  }
  for (const [name, body] of Object.entries(headers)) {
    const abs = path.join(projectRoot, '.archon', name)
    if (!(await pathExists(abs))) {
      await fs.mkdir(path.dirname(abs), { recursive: true })
      await fs.writeFile(abs, body)
    }
  }
  const dirs = ['.archon/drift/records', '.archon/debt/items', '.archon/memos/records']
  for (const d of dirs) {
    const abs = path.join(projectRoot, d)
    await fs.mkdir(abs, { recursive: true })
    const keep = path.join(abs, '.gitkeep')
    if (!(await pathExists(keep))) await fs.writeFile(keep, '')
  }
}

async function logInstall({ projectRoot, manifest, selectedModules, filesWritten }) {
  const stamp = isoStamp()
  const drift = path.join(projectRoot, '.archon', 'drift.md')
  const entry =
    `\n## install — Archon v${manifest.version} — ${stamp}\n\n` +
    `- Agent: archon-cli (install)\n` +
    `- Modules: ${[...selectedModules].sort().join(', ')}\n` +
    `- Files written: ${filesWritten}\n` +
    `- Source: ${manifest.base_url}/manifest.json (sha256-verified)\n`
  await fs.appendFile(drift, entry)
}

function isoStamp() {
  return new Date().toISOString().replace(/[:.]/g, '-')
}
