#!/usr/bin/env node
// ADR-27 Claim Verifier — unified assertion-vs-reality drift detection.
//
// Single script consolidates the family of "delivery says one thing, repo
// says another" checks that previously lived as separate prose / tests:
//
//   DEBT-058 numeric-claim cross-check    → mode `numeric`      (spot-check N tests / N files claims)
//   DEBT-066 borrowed-concepts substance   → mode `borrowed`    (drift-record substance gate)
//   DEBT-070 soul-edit self-citation       → mode `self-cite`   (soul edits citing newly-added clauses)
//   DEBT-071 missed-trigger guard          → mode `missed-trig` (Critical debt deadlines vs fired triggers)
//   DEBT-074 preservation substance gate   → mode `preservation` (none-this-cycle evidence + first-pass degeneracy)
//
// Each mode is a pure read-only scan returning structured findings. The
// `verify` subcommand runs all modes; `verify --mode=X` runs one. Findings
// land as a stable line-prefixed report so the auditor + pre-commit hook
// can grep them.
//
// Wire-up: `npm run archon:verify` runs `verify`; `npm run validate` is
// extended to call it after `archon:check`. Pre-commit hook calls the same.
//
// Zero dependencies (only `node:fs` + `node:child_process` for git diff).
// Mirrors the architecture of `scripts/archon-records.mjs`.
//
// Usage:
//   node scripts/archon-claim-verifier.mjs verify [--mode=numeric|borrowed|self-cite|missed-trig|preservation|all] [--base=main]
//   node scripts/archon-claim-verifier.mjs help

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { resolve, join, sep } from 'node:path'

const ROOT = resolve(process.cwd())
const REPO_RELATIVE = (p) => p.startsWith(ROOT + sep) ? p.slice(ROOT.length + 1) : p

const MODES = ['numeric', 'borrowed', 'self-cite', 'missed-trig', 'preservation']

function usage() {
  return `Usage:
  node scripts/archon-claim-verifier.mjs verify [--mode=numeric|borrowed|self-cite|missed-trig|preservation|all] [--base=<git-ref>]
  node scripts/archon-claim-verifier.mjs help

Modes:
  numeric        Spot-check 'N tests / N files' claims in manifest hot-path against live repo.
  borrowed       Substance gate for drift records' 'Borrowed concepts (if any):' clauses.
  self-cite      Detect soul edits that cite a clause newly added by the same delivery (DEBT-070).
  missed-trig    Flag pending Critical debts whose deadline names an event already past (DEBT-071).
  preservation   Substance gate for ADR-28 Preservation pass evidence; first-pass degeneracy guard (DEBT-074).
  all            Run every mode (default).
`
}

function git(args) {
  try {
    return execSync(`git ${args}`, { cwd: ROOT, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
  } catch {
    return ''
  }
}

function gitFileAtRev(rev, path) {
  try {
    return execSync(`git show ${rev}:${path}`, { cwd: ROOT, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] })
  } catch {
    return ''
  }
}

// ---------------------------------------------------------------------------
// Mode: numeric — manifest 'N files / M tests' must match live repo counts.
// ---------------------------------------------------------------------------

function modeNumeric() {
  const findings = []
  const manifestPath = resolve(ROOT, '.archon/manifest.md')
  if (!existsSync(manifestPath)) return findings
  const manifest = readFileSync(manifestPath, 'utf-8')

  // Scan only the M-quality-gate row (mirror of manifest-numeric-ground-truth.test.ts surface).
  // Pattern: "(N files / M tests"
  const fileMatch = manifest.match(/\((\d+)\s+files\s*\/\s*(\d+)\s+tests/)
  if (!fileMatch) return findings

  const claimedFiles = parseInt(fileMatch[1], 10)
  const claimedTests = parseInt(fileMatch[2], 10)

  // Count actual *.test.ts and *.test.tsx files under web/src/
  const testFiles = walkSync(resolve(ROOT, 'web/src'))
    .filter((p) => /\.test\.tsx?$/.test(p))
  if (testFiles.length !== claimedFiles) {
    findings.push({
      mode: 'numeric',
      severity: 'error',
      file: '.archon/manifest.md',
      message: `M-quality-gate row claims "${claimedFiles} files" but live repo has ${testFiles.length} test files under web/src/`,
    })
  }
  // Test count is harder without running vitest; defer to manifest-numeric-ground-truth.test.ts for that surface.
  return findings
}

function walkSync(dir) {
  const out = []
  if (!existsSync(dir)) return out
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    let st
    try { st = statSync(full) } catch { continue }
    if (st.isDirectory()) {
      if (entry === 'node_modules' || entry === 'dist' || entry === '.git') continue
      out.push(...walkSync(full))
    } else {
      out.push(full)
    }
  }
  return out
}

// ---------------------------------------------------------------------------
// Mode: borrowed — drift records combining external-framework reject/alternative
// semantics with a `Borrowed concepts (if any):` clause must have a substantive
// clause body (mirrors web/src/test/archon/drift-borrowed-concepts-substance.test.ts).
// This mode duplicates the test logic so the same gate fires at validate time
// without a TS toolchain, and so DEBT-066 has a single conceptual owner.
// ---------------------------------------------------------------------------

const PLACEHOLDER_TOKENS = ['n/a', 'na', 'tbd', 'todo', 'pending', 'unknown', 'nothing', 'none', '?', '-', '—', '–']

function normalizeClause(clause) {
  return clause.trim().replace(/^\[+/, '').replace(/\]+$/, '').trim().toLowerCase()
}

function isShallowBorrowed(clause) {
  const trimmed = clause.trim()
  if (trimmed === '' || trimmed === '[]' || trimmed === '[ ]') {
    return { shallow: true, reason: 'empty borrowed-concepts clause' }
  }
  const noneRationale = trimmed.match(/^none\s*,\s*rationale\s*:\s*(.+)$/i)
  if (noneRationale) {
    if (noneRationale[1].trim().length < 60) {
      return { shallow: true, reason: `none, rationale rationale only ${noneRationale[1].trim().length} chars (<60)` }
    }
    return { shallow: false, reason: '' }
  }
  const normalized = normalizeClause(trimmed)
  if (PLACEHOLDER_TOKENS.includes(normalized)) {
    return { shallow: true, reason: `placeholder \`${trimmed}\`` }
  }
  const trailingStripped = normalizeClause(trimmed.replace(/[.,;:!?—–-]+\s*$/, ''))
  if (PLACEHOLDER_TOKENS.includes(trailingStripped)) {
    return { shallow: true, reason: `placeholder with trailing punctuation \`${trimmed}\`` }
  }
  if (trimmed.length < 12) {
    return { shallow: true, reason: `clause only ${trimmed.length} chars (<12 floor)` }
  }
  return { shallow: false, reason: '' }
}

function modeBorrowed() {
  const findings = []
  const recordsDir = resolve(ROOT, '.archon/drift/records')
  if (!existsSync(recordsDir)) return findings
  for (const file of readdirSync(recordsDir).filter((f) => f.endsWith('.md'))) {
    const body = readFileSync(join(recordsDir, file), 'utf-8')
    const lower = body.toLowerCase()
    if (!lower.includes('external')) continue
    if (!/reject|alternative/i.test(body)) continue
    if (!/Borrowed concepts \(if any\)/.test(body)) continue
    const m = body.match(/(?:\*\*)?Borrowed concepts \(if any\)(?:\*\*)?\s*:\s*([^\n]*?)(?=\s*(?:\*\*[A-Z]|\.\s+[A-Z][a-z]|\n)|$)/)
    if (!m) {
      findings.push({
        mode: 'borrowed',
        severity: 'error',
        file: `.archon/drift/records/${file}`,
        message: 'external-framework reject/alternative record has unparseable Borrowed-concepts clause',
      })
      continue
    }
    const verdict = isShallowBorrowed(m[1])
    if (verdict.shallow) {
      findings.push({
        mode: 'borrowed',
        severity: 'error',
        file: `.archon/drift/records/${file}`,
        message: `borrowed-concepts substance gate failed: ${verdict.reason}`,
      })
    }
  }
  return findings
}

// ---------------------------------------------------------------------------
// Mode: self-cite — soul edits that cite a clause newly added by the same
// delivery. Pattern: any line in a NEWLY-ADDED hunk (vs --base) of soul.md /
// soul/*.md that introduces an "MUST/MAY/SHOULD/exempts/requires/forbids"
// clause; cross-check that the same clause is NOT cited as authority in any
// drift / memo / archon-demand / archon-plan diff hunk of the same delivery.
//
// In its current form the script raises the alarm conservatively: it flags
// soul ADD-hunks that contain prose tokens (MUST / SHOULD / exempts /
// requires / forbids / clarification) WHEN the same delivery's diff also
// contains a quoted reference to the same line. Operators interpret the
// finding (full mechanism is the W7 self-coup pattern; this is the
// stop-gap until ADR-27 evolves).
// ---------------------------------------------------------------------------

function modeSelfCite(baseRef) {
  const findings = []
  const base = baseRef || git('merge-base HEAD origin/main') || git('merge-base HEAD main') || 'HEAD~1'
  const changedSoul = git(`diff --name-only ${base}...HEAD -- .archon/soul.md '.archon/soul/*.md'`)
    .split('\n').filter(Boolean)
  if (changedSoul.length === 0) return findings

  // Distinctive normative tokens that identify a NEW exemption / clarification
  // / restriction clause. Generic prose ("the user", "delivery", etc.) is
  // excluded so the probe stays tied to clause-introduction shape.
  const NORMATIVE = /\b(exempts?|requires?|forbids?|clarification|allowed|prohibited|exception|carve-?out|exempt)\b/i

  for (const path of changedSoul) {
    // For each soul file changed, compute the line-level NEW substrings:
    // for any line whose +version differs from its prior-commit content, the
    // NEW substring is what's been added/changed (not the whole +line).
    const priorContent = gitFileAtRev(base, path)
    const priorLines = new Set(priorContent.split('\n').map((l) => l.trim()))

    // Collect ADDED lines from the diff (this captures both new lines and
    // modified-line replacements in unified-diff form).
    const diff = git(`diff ${base}...HEAD -- ${path}`)
    const addedLines = diff.split('\n')
      .filter((l) => l.startsWith('+') && !l.startsWith('+++'))
      .map((l) => l.slice(1))

    // For each added line, extract NEW SUBSTRINGS — sentence-level fragments
    // that are NOT present in any prior-version line. This catches the
    // failure mode where a normative clause is APPENDED to an existing line
    // (the W7 self-coup pattern: line as a whole is "+" but only the tail is
    // genuinely new prose).
    for (const addedLine of addedLines) {
      // Split the added line into clauses on sentence-boundary punctuation.
      // Each clause is a candidate for "new normative content".
      const clauses = addedLine.split(/(?<=[.!?])\s+(?=[A-Z*])|(?<=：)|(?<=。)/)
        .map((c) => c.trim())
        .filter((c) => c.length >= 30 && NORMATIVE.test(c))

      // Cache the rest-of-delivery diff once per file (not per clause).
      const otherDiff = git(`diff ${base}...HEAD -- '.archon/drift/records/*.md' '.archon/memos/records/*.md' '.cursor/commands/*.md' '.archon/decisions.md' 'docs/archon/decisions.md'`).toLowerCase()

      for (const clause of clauses) {
        // Skip if the clause is fully present in any prior-version line.
        const inPrior = [...priorLines].some((pl) => pl.includes(clause.slice(0, Math.min(60, clause.length))))
        if (inPrior) continue

        // Build MULTIPLE probes per clause and OR them — this catches the
        // W7 pattern where the cited fragment is at the tail of the clause,
        // not adjacent to the first normative token. Probes:
        //   (1) 6 words starting at first normative token
        //   (2) last 6 words of the clause
        //   (3) longest 8-word substring around any normative token (overlap with both)
        const allWords = clause.toLowerCase().match(/\b[a-z][a-z\u4e00-\u9fff-]+\b/g) || []
        if (allWords.length < 4) continue

        const probes = new Set()
        // Probe (1): tail starting at first normative token.
        const normMatch = clause.match(NORMATIVE)
        if (normMatch && normMatch.index !== undefined) {
          const tail = clause.slice(normMatch.index).toLowerCase()
          const tailWords = tail.match(/\b[a-z][a-z\u4e00-\u9fff-]+\b/g) || []
          if (tailWords.length >= 4) probes.add(tailWords.slice(0, 6).join(' '))
        }
        // Probe (2): last 6 words of the clause.
        if (allWords.length >= 6) probes.add(allWords.slice(-6).join(' '))
        // Probe (3): for each normative-token occurrence, take 4 words AFTER it.
        const normRe = new RegExp(NORMATIVE.source, 'gi')
        for (const m of clause.matchAll(normRe)) {
          if (m.index === undefined) continue
          const after = clause.slice(m.index + m[0].length).toLowerCase()
          const afterWords = after.match(/\b[a-z][a-z\u4e00-\u9fff-]+\b/g) || []
          if (afterWords.length >= 4) probes.add(afterWords.slice(0, 5).join(' '))
        }

        for (const probe of probes) {
          if (otherDiff.includes(probe)) {
            findings.push({
              mode: 'self-cite',
              severity: 'warn',
              file: path,
              message: `possible soul-edit self-citation — new clause "${clause.slice(0, 80).trim()}…" (probe="${probe}") cited in same-delivery drift/memo/command/ADR diff. Verify the cited clause exists in ${path}@${base} (prior commit), or split into a prior soul-change demand.`,
            })
            break // one finding per clause
          }
        }
      }
    }
  }
  return findings
}

// ---------------------------------------------------------------------------
// Mode: missed-trig — Critical pending debts whose deadline names an event
// already past in drift records or git diff (DEBT-071).
// ---------------------------------------------------------------------------

function modeMissedTrig(baseRef) {
  const findings = []
  const itemsDir = resolve(ROOT, '.archon/debt/items')
  if (!existsSync(itemsDir)) return findings
  const base = baseRef || git('merge-base HEAD origin/main') || git('merge-base HEAD main') || 'HEAD~1'

  // Build the recent drift summary corpus (last 30 records by name).
  const recordsDir = resolve(ROOT, '.archon/drift/records')
  const recentDriftSummaries = !existsSync(recordsDir) ? '' :
    readdirSync(recordsDir).filter((f) => f.endsWith('.md')).sort().slice(-30)
      .map((f) => readFileSync(join(recordsDir, f), 'utf-8')).join('\n').toLowerCase()

  // Build the diff path corpus.
  const diffPaths = git(`diff --name-only ${base}...HEAD`).toLowerCase()

  for (const file of readdirSync(itemsDir).filter((f) => f.endsWith('.md'))) {
    const body = readFileSync(join(itemsDir, file), 'utf-8')
    const fmMatch = body.match(/^---\r?\n([\s\S]*?)\r?\n---/)
    if (!fmMatch) continue
    const fm = fmMatch[1]

    const severity = (fm.match(/severity:\s*(.+)/) || [])[1]?.trim()
    const status = (fm.match(/status:\s*(.+)/) || [])[1]?.trim()
    const deadline = (fm.match(/deadline:\s*(.+)/) || [])[1]?.trim().replace(/^["']|["']$/g, '')
    if (!severity || !status || !deadline) continue
    if (severity !== 'Critical') continue
    if (!/^pending/.test(status)) continue

    // Heuristic: deadline starting with `next-` names an event class.
    // If the recent drift summaries OR the diff path list contains evidence
    // that the named event already happened, the trigger has fired.
    const triggerName = deadline.replace(/^next-/, '').toLowerCase()
    if (!triggerName.includes('-') && triggerName.length < 4) continue
    // Common patterns: "soul-edit" → drift summary mentions soul edit OR diff shows soul.md
    // "framework-evolution-override" → drift summary mentions override OR demand body
    // "external-framework-verdict" → drift mentions external framework Verdict
    const probes = triggerName.split(/-+/).filter((p) => p.length >= 4)
    const hits = probes.filter((probe) =>
      recentDriftSummaries.includes(probe) || diffPaths.includes(probe)
    )
    if (hits.length >= Math.max(1, Math.floor(probes.length / 2))) {
      findings.push({
        mode: 'missed-trig',
        severity: 'warn',
        file: `.archon/debt/items/${file}`,
        message: `Critical/${status} debt deadline \`${deadline}\` matches recent activity (probes hit: ${hits.join(', ')}). Trigger may have fired without countermeasure landing — re-pin deadline (DEBT-063-update protocol) or close the debt with the actual countermeasure.`,
      })
    }
  }
  return findings
}

// ---------------------------------------------------------------------------
// Mode: preservation — ADR-28 Preservation pass output substance gate (DEBT-074).
// Two checks:
//   (a) `Preservation pass: none-this-cycle(<evidence>)` — evidence text MUST
//       be ≥40 chars AND contain a verb-of-scanning AND a target. Empty or
//       hand-wave evidence becomes the frictionless escape valve within ~3
//       cycles otherwise (symmetric to borrowed-concepts substance gate).
//   (b) First-pass degeneracy guard — if a drift record contains
//       `Preservation pass: pinned(...)` AND the same delivery's diff
//       INTRODUCES one or more of those anchors (matches a NEW substring
//       added in the same diff), the record MUST also state "first pass" /
//       "introducing delivery" / "pinned-bootstrap" framing OR use the
//       `pinned-bootstrap(...)` form. Otherwise the introducing delivery
//       self-classifies its just-added anchors as `pin-worthy-now`, which is
//       structurally invalid (cycle has not started — see soul/review.md
//       §Preservation Signals "First-pass degeneracy").
// ---------------------------------------------------------------------------

const PRESERVATION_SCAN_VERBS = /\b(scanned|reviewed|checked|surveyed|examined|inspected|audited|read|searched|grepped|verified)\b/i
const PRESERVATION_TARGETS = /\b(drift\s+records?|resolved[- ]debt|debt\s+items?|memos?|recent\s+cycles?|prior\s+commits?|critical[- ]rule|signs|capsule|anchor|delivery)\b/i

function modePreservation(baseRef) {
  const findings = []
  const recordsDir = resolve(ROOT, '.archon/drift/records')
  if (!existsSync(recordsDir)) return findings
  const base = baseRef || git('merge-base HEAD origin/main') || git('merge-base HEAD main') || 'HEAD~1'
  const diffAdded = git(`diff ${base}...HEAD`)
    .split('\n')
    .filter((l) => l.startsWith('+') && !l.startsWith('+++'))
    .map((l) => l.slice(1))
    .join('\n')
    .toLowerCase()

  for (const file of readdirSync(recordsDir).filter((f) => f.endsWith('.md'))) {
    const body = readFileSync(join(recordsDir, file), 'utf-8')
    if (!/Preservation pass/i.test(body)) continue

    // (a) none-this-cycle substance check
    const noneMatch = body.match(/Preservation pass\*?\*?\s*:\s*none-this-cycle\s*\(([^)]*)\)/i)
    if (noneMatch) {
      const evidence = noneMatch[1].trim()
      const reasons = []
      if (evidence.length < 40) reasons.push(`evidence only ${evidence.length} chars (<40 floor)`)
      if (!PRESERVATION_SCAN_VERBS.test(evidence)) {
        reasons.push('evidence missing verb-of-scanning (scanned / reviewed / checked / etc.)')
      }
      if (!PRESERVATION_TARGETS.test(evidence)) {
        reasons.push('evidence missing scan target (drift records / resolved-debt items / etc.)')
      }
      if (reasons.length > 0) {
        findings.push({
          mode: 'preservation',
          severity: 'error',
          file: `.archon/drift/records/${file}`,
          message: `Preservation pass none-this-cycle evidence shallow: ${reasons.join('; ')}. → Substance gate (DEBT-074) requires evidence ≥40 chars + verb-of-scanning + target.`,
        })
      }
    }

    // (b) first-pass degeneracy guard
    const pinnedMatch = body.match(/Preservation pass\*?\*?\s*:\s*pinned\s*\(([^)]*)\)/i)
    if (pinnedMatch) {
      // Extract anchor candidates from the pinned(...) clause: tokens between
      // backticks, or quoted strings.
      const anchors = [...pinnedMatch[1].matchAll(/`([^`]+)`|"([^"]+)"/g)].map((m) => (m[1] ?? m[2]).trim())
      // For each anchor, check if it appears in the diff's ADDED lines (new
      // anchor introduced by this delivery's same diff).
      const introducedAnchors = anchors.filter((a) => {
        if (!a || a.length < 4) return false
        // Match anchor as substring against added-lines corpus.
        return diffAdded.includes(a.toLowerCase())
      })
      if (introducedAnchors.length > 0) {
        // Require explicit first-pass framing OR `pinned-bootstrap` form.
        const hasFirstPassFraming = /first[-\s]?pass|introducing\s+delivery|pinned-bootstrap|bootstrap\s+pin|pins?\s+the\s+concept/i.test(body)
        if (!hasFirstPassFraming) {
          findings.push({
            mode: 'preservation',
            severity: 'error',
            file: `.archon/drift/records/${file}`,
            message: `Preservation pass pinned(${introducedAnchors.length} anchor(s)) where anchor(s) [${introducedAnchors.slice(0, 3).join(', ')}${introducedAnchors.length > 3 ? '...' : ''}] are introduced by the same delivery's diff — first-pass degeneracy: introducing-delivery cannot meaningfully preservation-classify its own additions. → Add explicit "first pass / introducing delivery" framing OR use \`pinned-bootstrap(...)\` form (soul/review.md §Preservation Signals First-pass degeneracy).`,
          })
        }
      }
    }
  }
  return findings
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const out = { mode: 'all', base: '' }
  for (const arg of argv) {
    if (arg.startsWith('--mode=')) out.mode = arg.slice(7)
    else if (arg.startsWith('--base=')) out.base = arg.slice(7)
  }
  return out
}

function main(argv) {
  const cmd = argv[0]
  if (!cmd || cmd === 'help' || cmd === '-h' || cmd === '--help') {
    process.stdout.write(usage())
    return 0
  }
  if (cmd !== 'verify') {
    process.stderr.write(`unknown command \`${cmd}\`\n${usage()}`)
    return 2
  }

  const { mode, base } = parseArgs(argv.slice(1))
  const requested = mode === 'all' ? MODES : [mode]
  for (const m of requested) {
    if (!MODES.includes(m)) {
      process.stderr.write(`unknown mode \`${m}\`. Valid: ${MODES.join(', ')}, all\n`)
      return 2
    }
  }

  const findings = []
  for (const m of requested) {
    if (m === 'numeric') findings.push(...modeNumeric())
    else if (m === 'borrowed') findings.push(...modeBorrowed())
    else if (m === 'self-cite') findings.push(...modeSelfCite(base))
    else if (m === 'missed-trig') findings.push(...modeMissedTrig(base))
    else if (m === 'preservation') findings.push(...modePreservation(base))
  }

  // Report.
  if (findings.length === 0) {
    process.stdout.write(`[claim-verifier] OK: ${requested.join(', ')} — no findings.\n`)
    return 0
  }

  const errors = findings.filter((f) => f.severity === 'error')
  const warns = findings.filter((f) => f.severity === 'warn')

  for (const f of findings) {
    const tag = f.severity === 'error' ? 'FAIL' : 'WARN'
    process.stdout.write(`[claim-verifier:${f.mode}] ${tag}: ${f.file} — ${f.message}\n`)
  }

  if (errors.length > 0) {
    process.stdout.write(`[claim-verifier] FAIL: ${errors.length} error(s), ${warns.length} warning(s).\n`)
    return 1
  }
  process.stdout.write(`[claim-verifier] OK with warnings: 0 errors, ${warns.length} warning(s).\n`)
  return 0
}

const exitCode = main(process.argv.slice(2))
process.exit(exitCode)
