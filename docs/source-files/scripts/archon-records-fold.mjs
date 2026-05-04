#!/usr/bin/env node
// ADR-22 records-folder quarterly fold companion.
//
// When the active records folder for a kind grows past a threshold, fold
// older records into the matching .archon/<kind>/archive/<year>-Q<N>.md
// (or .archon/memos-archive/<year>-Q<N>.md for memos) cold log file, then
// delete the folded record files. The hot summary regenerates from the
// remaining records.
//
// Records are partitioned by ISO8601 quarter (Q1=Jan-Mar, Q2=Apr-Jun, ...).
// Records belonging to the CURRENT quarter are never folded; only completed
// quarters get folded.
//
// Zero-deps; mirrors archon-records.mjs.
//
// Usage:
//   node scripts/archon-records-fold.mjs <drift|memos|debt> [--dry-run]
//   node scripts/archon-records-fold.mjs all [--dry-run]
//   node scripts/archon-records-fold.mjs check          # exit 1 if any kind exceeds threshold
//
// Defaults:
//   THRESHOLD = 40 records → fold prior quarters
//   ARCHIVE_HEADER must already exist with `Archived On` markers (per
//   memos_archive / debt_archive / drift_gate contracts).

import { existsSync, mkdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs'
import { resolve, join } from 'node:path'

const ROOT = resolve(process.cwd())

const KINDS = {
  drift: {
    dir: '.archon/drift/records',
    archive_dir: '.archon/drift/archive',
    archive_format: 'log-row', // append a Markdown row to existing archive log table
  },
  memos: {
    dir: '.archon/memos/records',
    archive_dir: '.archon/memos-archive',
    archive_format: 'log-row',
  },
  debt: {
    dir: '.archon/debt/items',
    archive_dir: '.archon/debt/archive',
    archive_format: 'log-row',
  },
}

const THRESHOLD = parseInt(process.env.ARCHON_RECORDS_FOLD_THRESHOLD || '40', 10)

function quarterOf(isoDate) {
  // isoDate like 2026-04-30T00:00:00Z or 20260430T0000007Z
  const m = String(isoDate).match(/^(\d{4})-?(\d{2})/)
  if (!m) return null
  const year = parseInt(m[1], 10)
  const month = parseInt(m[2], 10)
  const q = Math.ceil(month / 3)
  return { year, quarter: q, label: `${year}-Q${q}` }
}

function currentQuarter() {
  const now = new Date()
  return { year: now.getUTCFullYear(), quarter: Math.ceil((now.getUTCMonth() + 1) / 3) }
}

function isPastQuarter(q) {
  const cur = currentQuarter()
  if (q.year < cur.year) return true
  if (q.year === cur.year && q.quarter < cur.quarter) return true
  return false
}

function parseFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!m) return null
  const fm = {}
  for (const line of m[1].split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const km = trimmed.match(/^([A-Za-z_][\w\-]*)\s*:\s*(.*)$/)
    if (!km) continue
    let val = km[2].trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    fm[km[1]] = val
  }
  return { fm, body: m[2] || '' }
}

function check(kind) {
  const cfg = KINDS[kind]
  const dir = resolve(ROOT, cfg.dir)
  if (!existsSync(dir)) return { ok: true, count: 0 }
  const count = readdirSync(dir).filter((n) => n.endsWith('.md')).length
  return { ok: count <= THRESHOLD, count }
}

function fold(kind, dryRun) {
  const cfg = KINDS[kind]
  const dir = resolve(ROOT, cfg.dir)
  if (!existsSync(dir)) {
    console.log(`[fold] ${kind}: no records folder, skip`)
    return 0
  }
  const files = readdirSync(dir).filter((n) => n.endsWith('.md')).sort()
  if (files.length === 0) {
    console.log(`[fold] ${kind}: 0 records, skip`)
    return 0
  }

  // Group by quarter; only past-quarter records are foldable.
  const byQuarter = new Map()
  for (const file of files) {
    const path = join(dir, file)
    const raw = readFileSync(path, 'utf-8')
    const parsed = parseFrontmatter(raw)
    if (!parsed) {
      console.error(`[fold] ${kind}: skip ${file} (no frontmatter)`)
      continue
    }
    const q = quarterOf(parsed.fm.date)
    if (!q) {
      console.error(`[fold] ${kind}: skip ${file} (no parseable date)`)
      continue
    }
    if (!isPastQuarter(q)) continue
    if (!byQuarter.has(q.label)) byQuarter.set(q.label, [])
    byQuarter.get(q.label).push({ file, path, ...parsed })
  }

  if (byQuarter.size === 0) {
    console.log(`[fold] ${kind}: ${files.length} records, all in current quarter, nothing to fold`)
    return 0
  }

  let foldedTotal = 0
  for (const [label, recs] of byQuarter) {
    const archiveFile = resolve(ROOT, cfg.archive_dir, `${label}.md`)
    if (!existsSync(archiveFile)) {
      console.error(
        `[fold] ${kind}: archive ${cfg.archive_dir}/${label}.md does not exist; create it first with required headers (Archive Index / Archived On / Keywords).`,
      )
      continue
    }
    const arch = readFileSync(archiveFile, 'utf-8')
    if (!arch.includes('## Archived')) {
      console.error(
        `[fold] ${kind}: archive ${label}.md missing "## Archived..." section; aborting fold for this quarter.`,
      )
      continue
    }

    // Render each record as a row appended to the archive log table.
    const newRows = []
    for (const r of recs) {
      const date = String(r.fm.date).slice(0, 10)
      const sign = r.fm.delta && parseInt(r.fm.delta, 10) >= 0 ? '+' : ''
      if (kind === 'drift') {
        const summary = (r.fm.summary || r.body.split('\n')[0] || '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ')
        const cryst = (r.fm.crystallized || '—').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ')
        const total = r.fm.migrated_total || ''
        newRows.push(`| ${date} | ${summary} | ${sign}${r.fm.delta} | ${cryst} | **${total}** |`)
      } else if (kind === 'memos') {
        const topic = (r.fm.topic || '').replace(/\|/g, '\\|')
        const conclusion = (r.fm.conclusion || '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ')
        const source = (r.fm.source || '').replace(/\|/g, '\\|')
        newRows.push(`| ${date} | ${topic} | ${conclusion} | ${source} |`)
      } else if (kind === 'debt') {
        const sev = r.fm.severity || ''
        const desc = (r.fm.summary || r.fm.description || '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ')
        const dl = r.fm.deadline || ''
        const st = r.fm.status || ''
        const det = (r.fm.details || '').replace(/\|/g, '\\|')
        newRows.push(`| ${r.fm.id} | ${sev} | ${desc} | ${dl} | ${st} | ${det} |`)
      }
    }

    if (dryRun) {
      console.log(`[fold] ${kind} ${label}: would fold ${recs.length} records into ${cfg.archive_dir}/${label}.md`)
      continue
    }

    const updated = arch.trimEnd() + '\n' + newRows.join('\n') + '\n'
    writeFileSync(archiveFile, updated, 'utf-8')

    // Update Rows archived count if the archive declares one (drift archive does).
    const updatedAgain = readFileSync(archiveFile, 'utf-8')
    const rowsArchivedMatch = updatedAgain.match(/Rows archived:\s*(\d+)/)
    if (rowsArchivedMatch) {
      const newCount = parseInt(rowsArchivedMatch[1], 10) + recs.length
      writeFileSync(
        archiveFile,
        updatedAgain.replace(/Rows archived:\s*\d+/, `Rows archived: ${newCount}`),
        'utf-8',
      )
    }

    for (const r of recs) {
      unlinkSync(r.path)
    }

    console.log(`[fold] ${kind} ${label}: folded ${recs.length} records → ${cfg.archive_dir}/${label}.md`)
    foldedTotal += recs.length
  }

  console.log(`[fold] ${kind}: total ${foldedTotal} records folded`)
  return foldedTotal
}

const args = process.argv.slice(2)
const cmd = args[0]
const dryRun = args.includes('--dry-run')

if (cmd === 'check') {
  let bad = 0
  for (const kind of Object.keys(KINDS)) {
    const r = check(kind)
    if (!r.ok) {
      console.error(`[fold] ${kind}: ${r.count} records exceeds threshold ${THRESHOLD}; run \`node scripts/archon-records-fold.mjs ${kind}\``)
      bad++
    } else {
      console.log(`[fold] ${kind}: ${r.count} records (threshold ${THRESHOLD})`)
    }
  }
  process.exit(bad === 0 ? 0 : 1)
} else if (KINDS[cmd]) {
  fold(cmd, dryRun)
} else if (cmd === 'all') {
  for (const kind of Object.keys(KINDS)) fold(kind, dryRun)
} else {
  console.error(`Usage: archon-records-fold.mjs <drift|memos|debt|all|check> [--dry-run]`)
  process.exit(2)
}
