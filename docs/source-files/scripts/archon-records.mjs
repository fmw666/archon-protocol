#!/usr/bin/env node
// ADR-22 Records-Folder generic regenerator.
//
// Per-event governance state lives as one Markdown file per record under
// .archon/<kind>/records/  (drift, memos)
// .archon/<kind>/items/    (debt — alias for "items" rather than "records")
//
// Hot summary files have **sentinel-bounded sections** that this script
// regenerates from records:
//   <!-- archon-records:<section>:start -->
//   ...content...
//   <!-- archon-records:<section>:end -->
// Everything outside sentinels is preserved verbatim — Archive Index,
// Rules, Review Tiering, Log Format, etc. all stay hand-edited.
//
// Hand-edits between sentinels survive `regen` only when they match
// what records would produce; otherwise `check` fails and the validator
// directs the editor to write a new record file instead.
//
// Zero-deps; mirrors the architecture of scripts/archon-run-state.mjs.
//
// Usage:
//   node scripts/archon-records.mjs regen <drift|memos|debt>
//   node scripts/archon-records.mjs check <drift|memos|debt>
//   node scripts/archon-records.mjs check-all
//   node scripts/archon-records.mjs new <kind> [--id ID] [--type T] [--delta N] [--summary "..."] [--severity S] [--status S] [--deadline D] [--source S] [--topic T] [--conclusion "..."] [--body "..."]

import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, join } from 'node:path'

const ROOT = resolve(process.cwd())

const KINDS = {
  drift: {
    dir: '.archon/drift/records',
    hot: '.archon/drift.md',
    requiredFrontmatter: ['id', 'date', 'type', 'delta'],
    allowedTypes: ['delivery', 'review-release', 'fast-path-delivery'],
    sentinels: ['current-value', 'log'],
  },
  memos: {
    dir: '.archon/memos/records',
    hot: '.archon/memos.md',
    requiredFrontmatter: ['id', 'date', 'topic', 'conclusion', 'source'],
    allowedTypes: null,
    sentinels: ['hot-memos'],
  },
  debt: {
    dir: '.archon/debt/items',
    hot: '.archon/debt.md',
    requiredFrontmatter: ['id', 'severity', 'status', 'deadline', 'source'],
    allowedTypes: null,
    sentinels: ['active-debt'],
  },
}

function usage() {
  return `Usage:
  node scripts/archon-records.mjs regen <drift|memos|debt>
  node scripts/archon-records.mjs check <drift|memos|debt>
  node scripts/archon-records.mjs check-all
  node scripts/archon-records.mjs new <kind> [--id ID] [--type T] [--delta N] [--summary "..."] [--severity S] [--status S] [--deadline D] [--source S] [--topic T] [--conclusion "..."] [--body "..."]
`
}

// ── Record reading ─────────────────────────────────────────────────────────
function readRecords(kind) {
  const cfg = KINDS[kind]
  if (!cfg) throw new Error(`unknown kind: ${kind}`)
  const dir = resolve(ROOT, cfg.dir)
  if (!existsSync(dir)) return []
  const files = readdirSync(dir)
    .filter((name) => name.endsWith('.md') && !name.startsWith('.'))
    .sort()
  return files.map((name) => {
    const path = join(dir, name)
    const raw = readFileSync(path, 'utf-8')
    const parsed = parseRecord(raw, name, kind)
    return { ...parsed, _file: name, _path: path }
  })
}

function parseRecord(raw, filename, kind) {
  const cfg = KINDS[kind]
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!m) throw new Error(`${filename}: missing YAML frontmatter`)
  const fm = parseSimpleYaml(m[1])
  const body = (m[2] || '').trim()
  for (const k of cfg.requiredFrontmatter) {
    if (fm[k] === undefined || fm[k] === '') {
      throw new Error(`${filename}: missing required frontmatter '${k}'`)
    }
  }
  if (cfg.allowedTypes && !cfg.allowedTypes.includes(fm.type)) {
    throw new Error(`${filename}: type='${fm.type}' not in allowed [${cfg.allowedTypes.join(',')}]`)
  }
  if (kind === 'drift') {
    if (typeof fm.delta !== 'number' && !/^[+\-]?\d+$/.test(String(fm.delta))) {
      throw new Error(`${filename}: delta must be integer (got ${JSON.stringify(fm.delta)})`)
    }
    fm.delta = parseInt(String(fm.delta), 10)
  }
  return { frontmatter: fm, body }
}

// Minimal YAML subset: key: value (string|integer|boolean) per line.
function parseSimpleYaml(text) {
  const out = {}
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const m = trimmed.match(/^([A-Za-z_][\w\-]*)\s*:\s*(.*)$/)
    if (!m) continue
    const key = m[1]
    let val = m[2].trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = JSON.parse(val.startsWith('"') ? val : `"${val.slice(1, -1).replace(/"/g, '\\"')}"`)
    } else if (/^[+\-]?\d+$/.test(val)) {
      val = parseInt(val, 10)
    } else if (val === 'true' || val === 'false') {
      val = val === 'true'
    }
    out[key] = val
  }
  return out
}

// ── Sentinel-bounded section regeneration ──────────────────────────────────
function replaceSentinelSection(text, name, newContent) {
  const startTag = `<!-- archon-records:${name}:start -->`
  const endTag = `<!-- archon-records:${name}:end -->`
  const startIdx = text.indexOf(startTag)
  const endIdx = text.indexOf(endTag)
  if (startIdx === -1 || endIdx === -1) {
    throw new Error(`hot file missing sentinel section '${name}' (expected ${startTag} ... ${endTag})`)
  }
  const before = text.slice(0, startIdx + startTag.length)
  const after = text.slice(endIdx)
  return `${before}\n${newContent.trimEnd()}\n${after}`
}

function escapeCell(s) {
  return String(s).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ')
}

// ── DRIFT renderer ─────────────────────────────────────────────────────────
function renderDriftSections() {
  const records = readRecords('drift')
  let running = 0
  const rows = []
  // Hot view: keep last 12 entries with compact summaries; older deliveries
  // remain in records folder + (eventually) quarter-fold archive. The hot
  // file stays under its declared line cap regardless of records depth.
  const HOT_TAIL = 12
  const SUMMARY_MAX = 140
  for (const r of records) {
    running = Math.max(0, running + r.frontmatter.delta)
  }
  let postWindow = 0
  for (const r of records) {
    postWindow = Math.max(0, postWindow + r.frontmatter.delta)
  }
  // Re-walk to render only the tail-N rows but with each row's running
  // total reflecting position in the FULL chain.
  let walking = 0
  const rendered = []
  for (const r of records) {
    walking = Math.max(0, walking + r.frontmatter.delta)
    rendered.push({ ...r, _runningAfter: walking })
  }
  for (const r of rendered.slice(-HOT_TAIL)) {
    const date = String(r.frontmatter.date).slice(0, 10)
    let summary = r.frontmatter.summary || r.body.split('\n')[0] || '(no summary)'
    summary = String(summary).replace(/\s+/g, ' ').trim()
    if (summary.length > SUMMARY_MAX) summary = summary.slice(0, SUMMARY_MAX - 1).trimEnd() + '…'
    const crystallized = String(r.frontmatter.crystallized || '—')
      .replace(/\s+/g, ' ')
      .trim()
    const crystShort =
      crystallized.length > 60 ? crystallized.slice(0, 59).trimEnd() + '…' : crystallized
    const sign = r.frontmatter.delta >= 0 ? '+' : ''
    rows.push(
      `| ${date} | ${escapeCell(summary)} | ${sign}${r.frontmatter.delta} | ${escapeCell(crystShort)} | **${r._runningAfter}** |`,
    )
  }
  return {
    'current-value': `**drift: ${running}**`,
    log: ['| Date | Delivery Summary | +Score | Crystallized | Total |', '|------|------------------|--------|--------------|-------|', ...rows].join('\n'),
  }
}

// ── MEMOS renderer ─────────────────────────────────────────────────────────
function renderMemosSections() {
  const records = readRecords('memos')
  // Hot memos = most recent 5 by date (ADR-21 archive contract).
  const sorted = records
    .map((r) => r.frontmatter)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
  const hotCap = 5
  const hot = sorted.slice(0, hotCap)
  const rows = hot.map((fm) => {
    const date = String(fm.date).slice(0, 10)
    return `| ${date} | ${escapeCell(fm.topic)} | ${escapeCell(fm.conclusion)} | ${escapeCell(fm.source)} |`
  })
  return {
    'hot-memos': ['| Date | Topic | Compact Conclusion | Source |', '|------|------|------|------|', ...rows].join('\n'),
  }
}

// ── DEBT renderer ──────────────────────────────────────────────────────────
function renderDebtSections() {
  const records = readRecords('debt')
  // Hot index = pending items + recently-resolved (kept until next close-out).
  const items = records
    .map((r) => r.frontmatter)
    .sort((a, b) => String(a.id).localeCompare(String(b.id)))
  const rows = items.map((fm) => {
    return `| ${escapeCell(fm.id)} | ${escapeCell(fm.source)} | ${fm.severity} | ${escapeCell(fm.summary || fm.description || '')} | ${fm.deadline} | ${fm.status} | ${escapeCell(fm.details || '`.archon/debt/archive/<period>.md`')} |`
  })
  return {
    'active-debt': ['| ID | Source | Severity | Compact Description | Deadline | Status | Details |', '|----|--------|----------|---------------------|----------|--------|---------|', ...rows].join('\n'),
  }
}

// ── Generic check / regen drivers ──────────────────────────────────────────
function regen(kind) {
  const cfg = KINDS[kind]
  const hotPath = resolve(ROOT, cfg.hot)
  const sections = renderForKind(kind)
  let text = readFileSync(hotPath, 'utf-8')
  for (const [name, content] of Object.entries(sections)) {
    text = replaceSentinelSection(text, name, content)
  }
  return text
}

function renderForKind(kind) {
  if (kind === 'drift') return renderDriftSections()
  if (kind === 'memos') return renderMemosSections()
  if (kind === 'debt') return renderDebtSections()
  throw new Error(`unknown kind: ${kind}`)
}

function check(kind) {
  const cfg = KINDS[kind]
  const hotPath = resolve(ROOT, cfg.hot)
  if (!existsSync(hotPath)) return { ok: false, msg: `${cfg.hot} missing` }
  const recordsDir = resolve(ROOT, cfg.dir)
  if (!existsSync(recordsDir)) return { ok: true, msg: `no records yet (kind=${kind})` }
  const recordCount = readdirSync(recordsDir).filter((n) => n.endsWith('.md')).length
  if (recordCount === 0) return { ok: true, msg: `no records yet (kind=${kind})` }
  // Verify sentinels exist; if missing, kind not yet migrated → skip.
  const hot = readFileSync(hotPath, 'utf-8')
  const missingSentinels = cfg.sentinels.filter(
    (s) => !hot.includes(`<!-- archon-records:${s}:start -->`),
  )
  if (missingSentinels.length === cfg.sentinels.length) {
    return { ok: true, msg: `${cfg.hot} not yet migrated to sentinels (kind=${kind})` }
  }
  if (missingSentinels.length > 0) {
    return { ok: false, msg: `${cfg.hot} missing sentinels: ${missingSentinels.join(',')}` }
  }
  const expected = regen(kind)
  if (expected === hot) return { ok: true, msg: 'in sync' }
  return {
    ok: false,
    msg: `${cfg.hot} drifted from records — run \`node scripts/archon-records.mjs regen ${kind}\` (do not hand-edit between sentinels; create a new record file instead)`,
  }
}

// ── new (create a new record file) ─────────────────────────────────────────
function newRecord(kind, opts) {
  const cfg = KINDS[kind]
  const dir = resolve(ROOT, cfg.dir)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  const date = opts.date || new Date().toISOString()
  const stamp = date.replace(/[:.]/g, '').replace(/-/g, '').slice(0, 15) // YYYYMMDDTHHMMSS
  const slug = String(opts.slug || opts.id || 'record').replace(/[^a-z0-9-]+/gi, '-').toLowerCase()
  const id = opts.id || `${kind}-${stamp}Z-${slug}`
  const filename = `${id}.md`
  const fmLines = [`id: ${id}`, `date: ${date}`]
  if (opts.type) fmLines.push(`type: ${opts.type}`)
  if (opts.delta !== undefined && opts.delta !== true) fmLines.push(`delta: ${opts.delta}`)
  if (opts.summary) fmLines.push(`summary: ${JSON.stringify(opts.summary)}`)
  if (opts.crystallized) fmLines.push(`crystallized: ${JSON.stringify(opts.crystallized)}`)
  if (opts.severity) fmLines.push(`severity: ${opts.severity}`)
  if (opts.status) fmLines.push(`status: ${opts.status}`)
  if (opts.deadline) fmLines.push(`deadline: ${opts.deadline}`)
  if (opts.source) fmLines.push(`source: ${JSON.stringify(opts.source)}`)
  if (opts.topic) fmLines.push(`topic: ${JSON.stringify(opts.topic)}`)
  if (opts.conclusion) fmLines.push(`conclusion: ${JSON.stringify(opts.conclusion)}`)
  if (opts.details) fmLines.push(`details: ${JSON.stringify(opts.details)}`)
  if (opts.description) fmLines.push(`description: ${JSON.stringify(opts.description)}`)
  const body = opts.body || opts.summary || ''
  const content = `---\n${fmLines.join('\n')}\n---\n\n${body}\n`
  writeFileSync(resolve(dir, filename), content, 'utf-8')
  return { id, file: resolve(dir, filename) }
}

// ── CLI ────────────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const out = { _: [] }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a.startsWith('--')) {
      const key = a.slice(2)
      const val = argv[i + 1] !== undefined && !argv[i + 1].startsWith('--') ? argv[++i] : true
      out[key] = val
    } else {
      out._.push(a)
    }
  }
  return out
}

async function main() {
  const argv = process.argv.slice(2)
  const cmd = argv[0]
  const opts = parseArgs(argv.slice(1))
  if (!cmd || cmd === '--help' || cmd === '-h') {
    process.stdout.write(usage())
    return 0
  }
  if (cmd === 'regen') {
    const kind = opts._[0]
    if (!KINDS[kind]) {
      process.stderr.write(`unknown kind: ${kind}\n`)
      return 2
    }
    const cfg = KINDS[kind]
    const recordsDir = resolve(ROOT, cfg.dir)
    if (!existsSync(recordsDir) || readdirSync(recordsDir).filter((n) => n.endsWith('.md')).length === 0) {
      process.stdout.write(`[archon-records] no records for ${kind}, hot file unchanged\n`)
      return 0
    }
    const out = regen(kind)
    writeFileSync(resolve(ROOT, cfg.hot), out, 'utf-8')
    process.stdout.write(`[archon-records] regenerated ${cfg.hot}\n`)
    return 0
  }
  if (cmd === 'check') {
    const kind = opts._[0]
    if (!KINDS[kind]) {
      process.stderr.write(`unknown kind: ${kind}\n`)
      return 2
    }
    const r = check(kind)
    if (!r.ok) {
      process.stderr.write(`[archon-records] FAIL ${kind}: ${r.msg}\n`)
      return 1
    }
    process.stdout.write(`[archon-records] ok ${kind}: ${r.msg}\n`)
    return 0
  }
  if (cmd === 'check-all') {
    let bad = 0
    for (const kind of Object.keys(KINDS)) {
      const r = check(kind)
      if (!r.ok) {
        process.stderr.write(`[archon-records] FAIL ${kind}: ${r.msg}\n`)
        bad++
      } else {
        process.stdout.write(`[archon-records] ok ${kind}: ${r.msg}\n`)
      }
    }
    return bad === 0 ? 0 : 1
  }
  if (cmd === 'new') {
    const kind = opts._[0]
    if (!KINDS[kind]) {
      process.stderr.write(`unknown kind: ${kind}\n`)
      return 2
    }
    const result = newRecord(kind, opts)
    process.stdout.write(`${result.id}\n`)
    return 0
  }
  process.stderr.write(usage())
  return 2
}

main().then((code) => process.exit(code))
