// lib/sync.mjs — `archon sync`. Read-only health check: compare every
// Archon-owned file in the project against the canonical manifest and print
// a diff report. Nothing is written.
import { promises as fs } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

import {
  fetchManifest,
  resolveBaseUrl,
  fileSha256,
  pathExists,
  detectInstalledModules,
  flattenFiles,
  isRuntimeLedgerPath,
} from './manifest.mjs'
import { parseFlags } from './common.mjs'

export async function runSync({ args }) {
  const { flags, positional } = parseFlags(args)
  const projectRoot = path.resolve(positional[0] || process.cwd())
  const json = Boolean(flags.json)

  if (!(await pathExists(path.join(projectRoot, '.archon', 'soul.md')))) {
    throw new Error(`No Archon installation found at ${projectRoot}.`)
  }

  const installedVersion = (await fs.readFile(path.join(projectRoot, '.archon', 'VERSION'), 'utf8')).trim()
  const baseUrl = resolveBaseUrl({ flags })
  const manifest = await fetchManifest({ baseUrl })

  const installedMods = await detectInstalledModules({ projectRoot, manifest })
  const canonicalFiles = flattenFiles(manifest, { moduleIds: installedMods })
  const canonicalByPath = new Map(canonicalFiles.map((f) => [f.path, f]))

  const report = { ok: [], modified: [], missing: [], extra: [], ledgers: [], installedMods: [...installedMods] }

  // Check canonical presence on disk
  for (const f of canonicalFiles) {
    const abs = path.join(projectRoot, f.path)
    if (!(await pathExists(abs))) {
      report.missing.push({ path: f.path, module: f.module })
      continue
    }
    const sha = await fileSha256(abs)
    if (sha === f.sha256) {
      report.ok.push({ path: f.path, module: f.module })
    } else {
      report.modified.push({ path: f.path, module: f.module, installed: sha, canonical: f.sha256 })
    }
  }

  // Scan Archon-owned directories for extras
  const scanRoots = [
    '.archon',
    '.cursor/commands',
    '.cursor/agents',
    '.cursor/rules',
    '.cursor/skills',
    'scripts',
    'tools/archon-cli',
  ]
  for (const dir of scanRoots) {
    const abs = path.join(projectRoot, dir)
    if (!(await pathExists(abs))) continue
    for await (const rel of walk(abs)) {
      const relFromRoot = path
        .relative(projectRoot, path.join(abs, rel))
        .split(path.sep)
        .join('/')
      if (isRuntimeLedgerPath(relFromRoot, manifest)) {
        report.ledgers.push(relFromRoot)
        continue
      }
      if (canonicalByPath.has(relFromRoot)) continue
      // Skip clearly-project-owned Cursor files (non-archon-prefixed)
      if (relFromRoot.startsWith('.cursor/')) {
        const basename = relFromRoot.split('/').pop() || ''
        if (!/^archon/.test(basename) && !/archon/.test(relFromRoot)) continue
      }
      if (relFromRoot.startsWith('scripts/')) {
        const basename = relFromRoot.split('/').pop() || ''
        if (!/^(archon-|export-archon-|test-archon-)/.test(basename)) continue
      }
      report.extra.push(relFromRoot)
    }
  }

  const moduleSummary = summariseByModule(manifest, report)

  if (json) {
    console.log(JSON.stringify({
      installed_version: installedVersion,
      canonical_version: manifest.version,
      report,
      modules: moduleSummary,
    }, null, 2))
    return
  }

  printReport({
    projectRoot,
    installedVersion,
    canonicalVersion: manifest.version,
    report,
    moduleSummary,
  })
}

function summariseByModule(manifest, report) {
  const byMod = {}
  const installedSet = new Set(report.installedMods || [])
  for (const mod of manifest.modules) byMod[mod.id] = { total: mod.file_count, ok: 0, modified: 0, missing: 0, required: Boolean(mod.required), installed: installedSet.has(mod.id) }
  for (const r of report.ok) byMod[r.module].ok += 1
  for (const r of report.modified) byMod[r.module].modified += 1
  for (const r of report.missing) byMod[r.module].missing += 1
  return byMod
}

function printReport({ projectRoot, installedVersion, canonicalVersion, report, moduleSummary }) {
  console.log('Archon sync report')
  console.log('==================')
  console.log(`Project:            ${projectRoot}`)
  console.log(`Installed version:  ${installedVersion}`)
  console.log(`Canonical version:  ${canonicalVersion}${installedVersion === canonicalVersion ? ' (same)' : ' — update available'}`)
  console.log('')
  console.log('Summary:')
  console.log(`  OK        ${report.ok.length}`)
  console.log(`  Modified  ${report.modified.length}`)
  console.log(`  Missing   ${report.missing.length}`)
  console.log(`  Extra     ${report.extra.length}`)
  console.log(`  Ledgers   ${report.ledgers.length} (not checked against canonical)`)
  console.log('')

  if (report.modified.length > 0) {
    console.log('Modified files (sha256 differs from canonical):')
    for (const r of report.modified) {
      console.log(`  ${r.path}`)
      console.log(`      installed:  ${r.installed.slice(0, 12)}…`)
      console.log(`      canonical:  ${r.canonical.slice(0, 12)}…`)
    }
    console.log('')
  }
  if (report.missing.length > 0) {
    console.log('Missing files (in canonical but not in project):')
    for (const r of report.missing) console.log(`  ${r.path}`)
    console.log('')
  }
  if (report.extra.length > 0) {
    console.log('Extra files (under Archon-owned directories, not in canonical):')
    for (const p of report.extra) console.log(`  ${p}`)
    console.log('')
  }

  console.log('Per-module status:')
  for (const [mod, s] of Object.entries(moduleSummary)) {
    if (!s.installed) {
      console.log(`  ${mod.padEnd(26)} not installed (optional, ${s.total} files available)`)
      continue
    }
    const parts = [`${s.ok}/${s.total} ok`]
    if (s.modified) parts.push(`${s.modified} modified`)
    if (s.missing) parts.push(`${s.missing} missing`)
    console.log(`  ${mod.padEnd(26)} ${parts.join(', ')}`)
  }
  console.log('')

  if (report.modified.length || report.missing.length) {
    console.log('Recommendation: run `archon update` to adopt canonical, or preserve your overrides and log the divergence.')
  } else {
    console.log('Integrity: healthy.')
  }
}

async function* walk(root) {
  async function* rec(base, relPrefix) {
    const entries = await fs.readdir(base, { withFileTypes: true })
    for (const e of entries) {
      const full = path.join(base, e.name)
      const rel = relPrefix ? path.join(relPrefix, e.name) : e.name
      if (e.isDirectory()) yield* rec(full, rel)
      else if (e.isFile()) yield rel
    }
  }
  yield* rec(root, '')
}
