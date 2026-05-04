#!/usr/bin/env node
// One-shot migration: split existing hot rows of .archon/{drift,memos,debt}
// into per-record files under .archon/{drift,memos}/records/ and
// .archon/debt/items/. Run once, then commit + delete this script (or
// keep for adopters bringing in their own legacy state).
//
// Usage:
//   node scripts/archon-records-migrate.mjs <drift|memos|debt> [--dry-run]
//   node scripts/archon-records-migrate.mjs all [--dry-run]

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const ROOT = resolve(process.cwd())

function slugify(s, max = 60) {
  return String(s)
    .toLowerCase()
    .replace(/`[^`]+`/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, max)
}

function escapeYamlString(s) {
  return JSON.stringify(String(s))
}

// Parse hot drift.md and yield an ordered list of records.
function parseDriftHot(text) {
  const lines = text.split('\n')
  const records = []
  let inLog = false
  let date = '2026-04-01' // fallback baseline
  for (const line of lines) {
    if (line.startsWith('## Log')) inLog = true
    if (!inLog) continue
    // Match: | YYYY-MM-DD | summary... | +N or -N | crystallized | **N** |
    const m = line.match(/^\|\s*(\d{4}-\d{2}-\d{2})\s*\|\s*(.+?)\s*\|\s*([+\-]?\d+)\s*\|\s*(.+?)\s*\|\s*\*\*(\d+)\*\*\s*\|\s*$/)
    if (!m) continue
    date = m[1]
    const [, , summary, deltaStr, crystallized, total] = m
    const delta = parseInt(deltaStr, 10)
    const isReset = delta < 0 || /review release|EMERGENCY REVIEW/i.test(summary)
    const type = isReset ? 'review-release' : 'delivery'
    // Take first ~80 chars of summary up to first . or — as slug seed.
    const seed = summary.replace(/\*\*([^*]+)\*\*/g, '$1').split(/[.。]/)[0].slice(0, 80)
    records.push({ date, type, delta, summary, crystallized, total: parseInt(total, 10), seed })
  }
  return records
}

function parseMemosHot(text) {
  const lines = text.split('\n')
  const records = []
  let inHot = false
  for (const line of lines) {
    if (line.startsWith('## Hot Memos')) inHot = true
    if (!inHot) continue
    const m = line.match(/^\|\s*(\d{4}-\d{2}-\d{2})\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*$/)
    if (!m) continue
    if (/^Date\s*$/i.test(m[1])) continue
    const [, date, topic, conclusion, source] = m
    if (date.startsWith('---')) continue
    records.push({ date, topic, conclusion, source })
  }
  return records
}

function parseDebtHot(text) {
  const lines = text.split('\n')
  const records = []
  let inActive = false
  for (const line of lines) {
    if (line.startsWith('## Active Debt Index')) inActive = true
    if (!inActive) continue
    // | DEBT-018 | source | Severity | description | deadline | status | details |
    const m = line.match(/^\|\s*(DEBT-\d+)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*$/)
    if (!m) continue
    const [, id, source, severity, summary, deadline, status, details] = m
    records.push({ id, source, severity: severity.trim(), summary, deadline: deadline.trim(), status: status.trim(), details })
  }
  return records
}

function migrateDrift(dryRun) {
  const hotPath = resolve(ROOT, '.archon/drift.md')
  const text = readFileSync(hotPath, 'utf-8')
  const records = parseDriftHot(text)
  const dir = resolve(ROOT, '.archon/drift/records')
  if (!dryRun) mkdirSync(dir, { recursive: true })
  let order = 0
  for (const r of records) {
    order++
    // Synthetic timestamp: date + sequence (monotonic per migration day).
    const seq = String(order).padStart(3, '0')
    const stamp = `${r.date.replace(/-/g, '')}T0000${seq}Z`
    const slug = slugify(r.seed) || (r.type === 'review-release' ? 'review-release' : 'delivery')
    const id = `drift-${stamp}-${slug}`
    const filename = `${id}.md`
    const fmLines = [
      `id: ${id}`,
      `date: ${r.date}T00:00:${seq}Z`,
      `type: ${r.type}`,
      `delta: ${r.delta >= 0 ? '+' + r.delta : r.delta}`,
      `summary: ${escapeYamlString(r.summary)}`,
      `crystallized: ${escapeYamlString(r.crystallized)}`,
      `migrated_total: ${r.total}`,
    ]
    const content = `---\n${fmLines.join('\n')}\n---\n\n${r.summary}\n`
    if (dryRun) {
      console.log(`would write ${filename} (delta=${r.delta} total=${r.total})`)
    } else {
      writeFileSync(resolve(dir, filename), content, 'utf-8')
    }
  }
  console.log(`[migrate] drift: ${records.length} records ${dryRun ? '(dry-run)' : 'written'}`)
}

function migrateMemos(dryRun) {
  const hotPath = resolve(ROOT, '.archon/memos.md')
  const text = readFileSync(hotPath, 'utf-8')
  const records = parseMemosHot(text)
  const dir = resolve(ROOT, '.archon/memos/records')
  if (!dryRun) mkdirSync(dir, { recursive: true })
  let order = 0
  for (const r of records) {
    order++
    const seq = String(order).padStart(3, '0')
    const stamp = `${r.date.replace(/-/g, '')}T0000${seq}Z`
    const slug = slugify(r.topic) || 'memo'
    const id = `memo-${stamp}-${slug}`
    const filename = `${id}.md`
    const fmLines = [
      `id: ${id}`,
      `date: ${r.date}T00:00:${seq}Z`,
      `topic: ${escapeYamlString(r.topic)}`,
      `conclusion: ${escapeYamlString(r.conclusion)}`,
      `source: ${escapeYamlString(r.source)}`,
    ]
    const content = `---\n${fmLines.join('\n')}\n---\n\n${r.conclusion}\n`
    if (dryRun) {
      console.log(`would write ${filename}`)
    } else {
      writeFileSync(resolve(dir, filename), content, 'utf-8')
    }
  }
  console.log(`[migrate] memos: ${records.length} records ${dryRun ? '(dry-run)' : 'written'}`)
}

function migrateDebt(dryRun) {
  const hotPath = resolve(ROOT, '.archon/debt.md')
  const text = readFileSync(hotPath, 'utf-8')
  const records = parseDebtHot(text)
  const dir = resolve(ROOT, '.archon/debt/items')
  if (!dryRun) mkdirSync(dir, { recursive: true })
  for (const r of records) {
    const slug = slugify(r.summary) || 'item'
    const filename = `${r.id}-${slug}.md`
    const fmLines = [
      `id: ${r.id}`,
      `date: 2026-04-01`, // baseline; original creation dates lost on migration
      `severity: ${r.severity}`,
      `status: ${r.status}`,
      `deadline: ${escapeYamlString(r.deadline)}`,
      `source: ${escapeYamlString(r.source)}`,
      `summary: ${escapeYamlString(r.summary)}`,
      `details: ${escapeYamlString(r.details)}`,
    ]
    const content = `---\n${fmLines.join('\n')}\n---\n\n${r.summary}\n`
    if (dryRun) {
      console.log(`would write ${filename}`)
    } else {
      writeFileSync(resolve(dir, filename), content, 'utf-8')
    }
  }
  console.log(`[migrate] debt: ${records.length} items ${dryRun ? '(dry-run)' : 'written'}`)
}

const args = process.argv.slice(2)
const kind = args[0]
const dryRun = args.includes('--dry-run')
if (kind === 'drift') migrateDrift(dryRun)
else if (kind === 'memos') migrateMemos(dryRun)
else if (kind === 'debt') migrateDebt(dryRun)
else if (kind === 'all') {
  migrateDrift(dryRun)
  migrateMemos(dryRun)
  migrateDebt(dryRun)
} else {
  console.error('Usage: archon-records-migrate.mjs <drift|memos|debt|all> [--dry-run]')
  process.exit(2)
}
