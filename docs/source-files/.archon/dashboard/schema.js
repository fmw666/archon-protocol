/**
 * Archon File Structure Schema
 *
 * Single source of truth for the expected structure of archon governance files.
 * Drives both the dashboard parser (extract structured JSON) and the structure
 * validator (guard against format drift in governance.test.ts).
 *
 * Zero dependencies — pure Node.js.
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractSection(content, heading) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const pattern = new RegExp(`^##\\s+${escaped}`)
  const lines = content.split('\n')
  let startIdx = -1
  for (let i = 0; i < lines.length; i++) {
    if (pattern.test(lines[i])) {
      startIdx = i + 1
      break
    }
  }
  if (startIdx === -1) return null
  let endIdx = lines.length
  for (let i = startIdx; i < lines.length; i++) {
    if (/^## [^#]/.test(lines[i])) {
      endIdx = i
      break
    }
  }
  return lines.slice(startIdx, endIdx).join('\n').trim()
}

function extractSubSection(content, heading) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const pattern = new RegExp(`^###\\s+${escaped}`)
  const lines = content.split('\n')
  let startIdx = -1
  for (let i = 0; i < lines.length; i++) {
    if (pattern.test(lines[i])) {
      startIdx = i + 1
      break
    }
  }
  if (startIdx === -1) return null
  let endIdx = lines.length
  for (let i = startIdx; i < lines.length; i++) {
    if (/^###?\s+[^#]/.test(lines[i]) && i !== startIdx - 1) {
      endIdx = i
      break
    }
  }
  return lines.slice(startIdx, endIdx).join('\n').trim()
}

function parseMarkdownTable(text) {
  if (!text) return []
  const lines = text.split('\n').filter((l) => l.trim().startsWith('|'))
  if (lines.length < 2) return []

  const headerCells = lines[0]
    .split('|')
    .map((c) => c.trim())
    .filter(Boolean)

  const rows = []
  for (let i = 2; i < lines.length; i++) {
    const cells = lines[i]
      .split('|')
      .map((c) => c.trim())
      .filter(Boolean)
    if (cells.length === 0) continue
    const row = {}
    headerCells.forEach((h, idx) => {
      row[h] = cells[idx] || ''
    })
    rows.push(row)
  }
  return rows
}

// ---------------------------------------------------------------------------
// drift.md
// ---------------------------------------------------------------------------

const driftSchema = {
  requiredSections: ['Current Value', 'Rules', 'Log'],
  currentValuePattern: /\*\*drift:\s*(\d+)\*\*/,
  // Tiered thresholds live in §Review Tiering as `**drift ≥ N**` (light / full / emergency).
  // Log-Compression has its own hot-file Threshold: 70 lines — MUST NOT leak into drift threshold parsing.
  tieredThresholdPattern: /\*\*drift\s*[≥?>]=?\s*(\d+)\*\*/g,
  logColumns: ['Date', 'Delivery Summary', '+Score', 'Crystallized', 'Total'],
}

const RESET_ROW_KEYWORDS = ['Light review', 'Full review', 'Emergency review', 'EMERGENCY REVIEW', 'Review reset']
const FULL_OR_EMERGENCY_RESET_KEYWORDS = RESET_ROW_KEYWORDS.filter((keyword) => keyword !== 'Light review')

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function reviewKeywordRegex(keywords) {
  return new RegExp(`^(?:\\*\\*)?(?:${keywords.map(escapeRegex).join('|')})`, 'i')
}

function parseDrift(content) {
  const currentMatch = content.match(driftSchema.currentValuePattern)

  // Scope threshold parsing to §Review Tiering to avoid capturing log-compression threshold.
  const tieringSection = extractSection(content, 'Review Tiering') || ''
  const tierMatches = [...tieringSection.matchAll(driftSchema.tieredThresholdPattern)].map((m) =>
    parseInt(m[1], 10),
  )
  const [light, full, emergency] = [tierMatches[0] || 6, tierMatches[1] || 12, tierMatches[2] || 20]

  const logSection = extractSection(content, 'Log')
  const logLines = logSection ? logSection.split('\n').filter((l) => l.trim().startsWith('|')) : []

  const logs = []
  const reviews = []

  // Structural reset-row recognition (DEBT-060 W-3 co-fix, 2026-04-24): match a
  // review-tier keyword anchored near the start of the summary cell, not a
  // substring anywhere in the row. Prose containing "review reset" as
  // explanatory text no longer misclassifies a delivery row as a reset.
  const resetRowRegex = reviewKeywordRegex(RESET_ROW_KEYWORDS)

  for (let i = 2; i < logLines.length; i++) {
    const cells = logLines[i]
      .split('|')
      .map((c) => c.trim())
      .filter(Boolean)
    if (cells.length === 0) continue

    const summary = cells[1] || ''
    if (resetRowRegex.test(summary)) {
      reviews.push({ date: cells[0] || '', summary: cells.join(' ') })
    } else {
      logs.push({
        date: cells[0] || '',
        summary: cells[1] || '',
        score: cells[2] || '',
        capture: cells[3] || '',
        total: cells[4] || '',
      })
    }
  }

  return {
    current: currentMatch ? parseInt(currentMatch[1], 10) : null,
    threshold: full,
    thresholds: { light, full, emergency },
    logs,
    reviews,
  }
}

// ---------------------------------------------------------------------------
// debt.md
// ---------------------------------------------------------------------------

const debtSchema = {
  requiredSection: 'Active Debt Index',
  tableColumns: ['ID', 'Source', 'Severity', 'Compact Description', 'Deadline', 'Status', 'Details'],
}

function parseDebt(content) {
  const debtSection = extractSection(content, debtSchema.requiredSection) || ''
  const rows = parseMarkdownTable(debtSection)
  return {
    items: rows.map((r) => ({
      id: r['ID'] || '',
      source: r['Source'] || '',
      severity: r['Severity'] || '',
      description: r['Compact Description'] || '',
      deadline: r['Deadline'] || '',
      status: r['Status'] || '',
      details: r['Details'] || '',
    })),
  }
}

// ---------------------------------------------------------------------------
// manifest.md
// ---------------------------------------------------------------------------

const manifestSchema = {
  requiredSections: [
    'Product',
    'Tech Stack',
    'Validation Command',
    'Directory Structure',
    'Knowledge Assets',
    'Milestones & Acceptance Criteria',
    'Current State',
  ],
  milestonePattern: /^###\s+(M\d+)\s*[—–-]\s*(.+)$/gm,
  checkboxDone: /- \[x\]/g,
  checkboxTotal: /- \[[ x~]\]/g,
}

function parseManifest(content) {
  const productSection = extractSection(content, 'Product')
  const product = productSection ? productSection.split('\n')[0] : ''

  const glossarySection = extractSection(content, 'Concept Glossary')
  const glossary = glossarySection ? parseMarkdownTable(glossarySection) : []

  const milestones = []
  const msSection = extractSection(content, 'Milestones & Acceptance Criteria')
  if (msSection) {
    const msLines = msSection.split('\n')
    for (let i = 0; i < msLines.length; i++) {
      const headerMatch = msLines[i].match(/^###\s+(M\d+)\s*[—–-]\s*(.+)/)
      if (!headerMatch) continue

      const msId = headerMatch[1]
      const msTitle = headerMatch[2].trim()
      const isComplete = msTitle.includes('✅')
      const isInProgress = msTitle.includes('🔧')

      let endIdx = msLines.length
      for (let j = i + 1; j < msLines.length; j++) {
        if (/^### /.test(msLines[j])) {
          endIdx = j
          break
        }
      }
      const msBlock = msLines.slice(i + 1, endIdx).join('\n')
      const doneCount = (msBlock.match(manifestSchema.checkboxDone) || []).length
      const totalCount = (msBlock.match(manifestSchema.checkboxTotal) || []).length

      let status = '⬜'
      if (isComplete) status = '✅'
      else if (isInProgress) status = '🔧'

      milestones.push({
        id: msId,
        name: msTitle.replace(/[✅🔧⬜]/g, '').trim(),
        status,
        checks: { done: doneCount, total: totalCount },
      })
    }
  }

  const kaSection = extractSection(content, 'Knowledge Assets')
  const knowledgeAssets = {
    rules: [],
    skills: [],
    hooks: [],
    decisions: [],
  }
  if (kaSection) {
    const rulesTable = extractSubSection(kaSection, 'Rules')
    if (rulesTable) knowledgeAssets.rules = parseMarkdownTable(rulesTable)

    const skillsTable = extractSubSection(kaSection, 'Skills')
    if (skillsTable) knowledgeAssets.skills = parseMarkdownTable(skillsTable)

    const hooksTable = extractSubSection(kaSection, 'Lifecycle Hooks')
    if (hooksTable) knowledgeAssets.hooks = parseMarkdownTable(hooksTable)

    const decisionsTable = extractSubSection(kaSection, 'Architecture Decisions')
    if (decisionsTable) knowledgeAssets.decisions = parseMarkdownTable(decisionsTable)
  }

  const memoSection = extractSubSection(content, 'Stakeholder Memos')
  const memos = memoSection ? parseMarkdownTable(memoSection) : []

  const stateSection = extractSection(content, 'Current State')
  const currentState = stateSection ? stateSection.split('\n').slice(0, 3).join(' ') : ''

  return {
    product,
    glossary,
    milestones,
    knowledgeAssets,
    memos,
    currentState,
  }
}

// ---------------------------------------------------------------------------
// memos.md (standalone, split from manifest)
// ---------------------------------------------------------------------------

function parseMemos(content) {
  return content ? parseMarkdownTable(content) : []
}

// ---------------------------------------------------------------------------
// decisions.md
// ---------------------------------------------------------------------------

const decisionsSchema = {
  adrPattern: /^##\s+(ADR-(?:N?\d+))\s*[·]\s*(.+)$/gm,
  fieldPatterns: {
    date: /^-\s*\*\*(?:Date|日期)\*\*[：:]\s*(.+)$/m,
    status: /^-\s*\*\*(?:Status|状态)\*\*[：:]\s*(.+)$/m,
    decision: /^-\s*\*\*(?:Decision|决策)\*\*[：:]\s*(.+)$/m,
    proposal: /^-\s*\*\*(?:Proposal|提案)\*\*[：:]\s*(.+)$/m,
    reason: /^-\s*\*\*(?:Rationale|Rejection Rationale|理由|否决理由)\*\*[：:]\s*(.+)$/m,
  },
}

function parseDecisions(content) {
  const active = []
  const rejected = []

  const blocks = content.split(/(?=^## ADR-)/m).filter((b) => b.startsWith('## ADR-'))

  for (const block of blocks) {
    const headerMatch = block.match(/^## (ADR-(?:N?\d+))\s*[·]\s*(.+)$/m)
    if (!headerMatch) continue

    const id = headerMatch[1]
    const title = headerMatch[2].replace(/\[(?:Rejected|否决)\]\s*/, '').trim()

    const dateMatch = block.match(decisionsSchema.fieldPatterns.date)
    const statusMatch = block.match(decisionsSchema.fieldPatterns.status)
    const reasonMatch = block.match(decisionsSchema.fieldPatterns.reason)

    const entry = {
      id,
      title,
      date: dateMatch ? dateMatch[1].trim() : '',
      status: statusMatch ? statusMatch[1].trim() : '',
      reason: reasonMatch ? reasonMatch[1].trim() : '',
    }

    if (id.includes('N') || (statusMatch && (statusMatch[1].includes('Rejected') || statusMatch[1].includes('否决')))) {
      rejected.push(entry)
    } else {
      active.push(entry)
    }
  }

  return { active, rejected }
}

// ---------------------------------------------------------------------------
// Validator
// ---------------------------------------------------------------------------

function validateDrift(content) {
  const errors = []
  for (const section of driftSchema.requiredSections) {
    if (!extractSection(content, section)) {
      errors.push({ file: 'drift.md', message: `Missing required section: ## ${section}` })
    }
  }
  const cvMatch = content.match(driftSchema.currentValuePattern)
  if (!cvMatch) {
    errors.push({ file: 'drift.md', message: 'Missing **drift: N** current value declaration' })
  }
  const logSection = extractSection(content, 'Log')
  if (logSection) {
    const headerLine = logSection.split('\n').find((l) => l.trim().startsWith('|'))
    if (headerLine) {
      const headers = headerLine
        .split('|')
        .map((c) => c.trim())
        .filter(Boolean)
      for (const col of driftSchema.logColumns) {
        if (!headers.includes(col)) {
          errors.push({
            file: 'drift.md',
            message: `Log table missing column: ${col}`,
            section: 'Log',
          })
        }
      }
    }

    if (cvMatch) {
      const headerValue = parseInt(cvMatch[1], 10)
      const logLines = logSection.split('\n').filter((l) => l.trim().startsWith('|'))
      for (let i = logLines.length - 1; i >= 2; i--) {
        const cells = logLines[i].split('|').map((c) => c.trim()).filter(Boolean)
        const lastTotal = cells[cells.length - 1].replace(/\*+/g, '').trim()
        const totalNum = parseInt(lastTotal, 10)
        if (!isNaN(totalNum)) {
          if (totalNum !== headerValue) {
            errors.push({
              file: 'drift.md',
              message: `Current value (${headerValue}) inconsistent with last log entry total (${totalNum})`,
              section: 'Current Value vs Log',
            })
          }
          break
        }
      }
    }
  }
  return errors
}

function validateDebt(content) {
  const errors = []
  const debtSection = extractSection(content, debtSchema.requiredSection)
  if (!debtSection) {
    errors.push({ file: 'debt.md', message: `Missing required section: ## ${debtSchema.requiredSection}` })
    return errors
  }
  const headerLine = debtSection.split('\n').find((l) => l.trim().startsWith('|') && l.includes('ID'))
  if (!headerLine) {
    errors.push({ file: 'debt.md', message: 'Missing debt table or header row' })
    return errors
  }
  const headers = headerLine
    .split('|')
    .map((c) => c.trim())
    .filter(Boolean)
  for (const col of debtSchema.tableColumns) {
    if (!headers.includes(col)) {
      errors.push({ file: 'debt.md', message: `Table missing column: ${col}` })
    }
  }
  return errors
}

function validateManifest(content) {
  const errors = []
  for (const section of manifestSchema.requiredSections) {
    if (!extractSection(content, section)) {
      errors.push({ file: 'manifest.md', message: `Missing required section: ## ${section}` })
    }
  }
  return errors
}

function validateDecisions(content) {
  const errors = []
  const hasAdr = /^## ADR-/m.test(content)
  if (!hasAdr) {
    errors.push({ file: 'decisions.md', message: 'No ADR entries (at least one expected)' })
  }
  const hasNegativeSection = /^## Negative ADRs/m.test(content)
  if (!hasNegativeSection) {
    errors.push({ file: 'decisions.md', message: 'Missing ## Negative ADRs section' })
  }
  return errors
}

function validate(files) {
  const errors = []
  if (files.drift !== undefined) errors.push(...validateDrift(files.drift))
  if (files.debt !== undefined) errors.push(...validateDebt(files.debt))
  if (files.manifest !== undefined) errors.push(...validateManifest(files.manifest))
  if (files.decisions !== undefined) errors.push(...validateDecisions(files.decisions))
  return { ok: errors.length === 0, errors }
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  driftSchema,
  debtSchema,
  manifestSchema,
  decisionsSchema,

  RESET_ROW_KEYWORDS,
  FULL_OR_EMERGENCY_RESET_KEYWORDS,

  parseDrift,
  parseDebt,
  parseManifest,
  parseMemos,
  parseDecisions,

  validate,

  extractSection,
  parseMarkdownTable,
}
