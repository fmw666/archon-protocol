#!/usr/bin/env node

/**
 * Archon Dashboard Server — Multi-Session
 *
 * Zero-dependency Node.js server. Serves static files from public/,
 * provides governance state via JSON API, and pushes live updates via SSE.
 * Reads drift.md, debt.md, manifest.md, and .archon/decisions.md via schema.js parsers.
 */

const http = require('node:http')
const fs = require('node:fs')
const path = require('node:path')

const {
  parseDrift,
  parseDebt,
  parseManifest,
  parseMemos,
  parseDecisions,
  validate,
} = require('./schema.js')

const { InferenceEngine, RECONCILE_INTERVAL_MS } = require('./inference.js')
const { discoverAllSources, getProvider } = require('./providers.js')

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const PORT = parseInt(process.env.ARCHON_PORT || '3141', 10)
const ARCHON_DIR = path.resolve(__dirname, '..')
const HEARTBEATS_DIR = path.join(__dirname, 'heartbeats')
const PUBLIC_DIR = path.join(__dirname, 'public')
const STALE_MS = 30 * 60 * 1000
const DEAD_MS = 2 * 60 * 60 * 1000
const IDLE_CLEANUP_MS = 5 * 60 * 1000

const FILES = {
  drift: path.join(ARCHON_DIR, 'drift.md'),
  debt: path.join(ARCHON_DIR, 'debt.md'),
  manifest: path.join(ARCHON_DIR, 'manifest.md'),
  memos: path.join(ARCHON_DIR, 'memos.md'),
}
const PROJECT_ROOT = path.resolve(ARCHON_DIR, '..')
FILES.decisions = path.join(ARCHON_DIR, 'decisions.md')

fs.mkdirSync(HEARTBEATS_DIR, { recursive: true })

// ---------------------------------------------------------------------------
// Transcript sources (discovered via providers)
// ---------------------------------------------------------------------------

const TRANSCRIPT_SOURCES = discoverAllSources(PROJECT_ROOT)

// ---------------------------------------------------------------------------
// Inference engines (one per transcript source)
// ---------------------------------------------------------------------------

const inferenceEngines = TRANSCRIPT_SOURCES.map(src =>
  ({ engine: new InferenceEngine(src.dir, src.platform, debouncedRefresh), ...src })
)

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

let state = {}
let sseClients = []

function readFileSafe(filepath) {
  try { return fs.readFileSync(filepath, 'utf-8') } catch { return null }
}

function loadSessions() {
  const heartbeatSessions = loadHeartbeatSessions()
  const inferredSessions = []
  for (const src of inferenceEngines) {
    inferredSessions.push(...src.engine.getActiveSessions())
  }

  const merged = new Map()
  for (const s of heartbeatSessions) merged.set(s.sessionId || s._file, s)

  for (const inf of inferredSessions) {
    let matchKey = null
    for (const [key, hb] of merged) {
      if (hb._transcriptId === inf._transcriptId) { matchKey = key; break }
    }
    if (matchKey) {
      const hb = merged.get(matchKey)
      merged.set(matchKey, {
        ...hb,
        phase: inf.phase !== 'unknown' ? inf.phase : hb.phase,
        demand: hb.demand || inf.demand,
        subagents: (hb.subagents && hb.subagents.length) ? hb.subagents : inf.subagents,
        updatedAt: inf.updatedAt > hb.updatedAt ? inf.updatedAt : hb.updatedAt,
        _source: 'merged',
        _transcriptId: inf._transcriptId,
        _confidence: inf._confidence,
        _eventCount: inf._eventCount,
        _lastTool: inf._lastTool,
      })
    } else {
      merged.set(inf.sessionId, inf)
    }
  }

  return Array.from(merged.values()).filter(s => s.phase !== 'idle')
}

function loadHeartbeatSessions() {
  const sessions = []
  const now = Date.now()
  try {
    const files = fs.readdirSync(HEARTBEATS_DIR).filter(f => f.endsWith('.json'))
    for (const file of files) {
      const filepath = path.join(HEARTBEATS_DIR, file)
      const raw = readFileSafe(filepath)
      if (!raw) continue
      try {
        const session = JSON.parse(raw)
        const updatedAt = session.updatedAt ? new Date(session.updatedAt).getTime() : 0
        const age = now - updatedAt
        if (session.phase === 'idle' && age > IDLE_CLEANUP_MS) {
          try { fs.unlinkSync(filepath) } catch {}
          continue
        }
        if (session.phase !== 'idle' && age > DEAD_MS) {
          try { fs.unlinkSync(filepath) } catch {}
          continue
        }
        if (session.phase !== 'idle' && age > STALE_MS) {
          session._stale = true
        }
        session._file = file.replace('.json', '')
        session._source = 'heartbeat'
        sessions.push(session)
      } catch {}
    }
  } catch {}
  return sessions
}

function loadState() {
  const drift = readFileSafe(FILES.drift)
  const debt = readFileSafe(FILES.debt)
  const manifest = readFileSafe(FILES.manifest)
  const memosRaw = readFileSafe(FILES.memos)
  const decisions = readFileSafe(FILES.decisions)

  const manifestState = manifest ? parseManifest(manifest) : null
  if (manifestState && memosRaw) {
    manifestState.memos = parseMemos(memosRaw)
  }

  state = {
    drift: drift ? parseDrift(drift) : null,
    debt: debt ? parseDebt(debt) : null,
    manifest: manifestState,
    decisions: decisions ? parseDecisions(decisions) : null,
    sessions: loadSessions(),
    validation: validate({ drift: drift || '', debt: debt || '', manifest: manifest || '', decisions: decisions || '' }),
    _ts: Date.now(),
  }
}

// ---------------------------------------------------------------------------
// File watching + SSE
// ---------------------------------------------------------------------------

function broadcast() {
  const payload = `data: ${JSON.stringify({ type: 'update', ts: state._ts })}\n\n`
  sseClients = sseClients.filter((res) => {
    try { res.write(payload); return true } catch { return false }
  })
}

let debounceTimer = null
function debouncedRefresh() {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => { loadState(); broadcast(); debounceTimer = null }, 300)
}

function watchFiles() {
  for (const filepath of Object.values(FILES)) {
    try { fs.watch(filepath, { persistent: false }, debouncedRefresh) } catch {}
  }
  try { fs.watch(HEARTBEATS_DIR, { persistent: false }, debouncedRefresh) } catch {}

  for (const src of TRANSCRIPT_SOURCES) {
    const engine = inferenceEngines.find(e => e.dir === src.dir)
    if (!engine) continue

    try {
      fs.watch(src.dir, { persistent: false }, (_event, filename) => {
        if (!filename) return
        const name = filename.replace(/\.jsonl$/, '')
        if (/^[a-f0-9-]+$/.test(name)) {
          engine.engine.onTranscriptChange(name)
        }
      })
    } catch {}

    if (src.platform === 'cursor') {
      try {
        const dirs = fs.readdirSync(src.dir)
        for (const d of dirs) {
          const jsonlPath = path.join(src.dir, d, d + '.jsonl')
          try {
            fs.watch(jsonlPath, { persistent: false }, () => {
              engine.engine.onTranscriptChange(d)
            })
          } catch {}
        }
      } catch {}
    }
  }
}

// ---------------------------------------------------------------------------
// Transcript parsing
// ---------------------------------------------------------------------------

function parseTranscriptEvents(lines) {
  var events = []
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim()
    if (!line) continue
    try {
      var entry = JSON.parse(line)
      var role = entry.role
      var blocks = (entry.message && entry.message.content) || []
      for (var b = 0; b < blocks.length; b++) {
        var block = blocks[b]
        if (block.type === 'tool_use') {
          events.push({ idx: events.length, ts: i, type: 'tool', role: role, name: block.name || '?', input: summarizeInput(block.input) })
        } else if (block.type === 'tool_result') {
          events.push({ idx: events.length, ts: i, type: 'tool_result', role: role, name: block.name || '', content: truncate(stringifyContent(block.content), 300) })
        } else if (block.type === 'text' && role === 'assistant') {
          var text = block.text || ''
          var classified = classifyThinking(text)
          for (var c = 0; c < classified.length; c++) {
            events.push(Object.assign({ idx: events.length, ts: i, role: role }, classified[c]))
          }
        } else if (block.type === 'text' && role === 'user') {
          var userText = block.text || ''
          var query = extractUserQuery(userText)
          if (query) events.push({ idx: events.length, ts: i, type: 'user_input', role: role, text: truncate(query, 200) })
        }
      }
    } catch (e) { /* skip malformed lines */ }
  }
  return events
}

function classifyThinking(text) {
  var segments = []
  var rules = text.match(/\[([\w-]+\.mdc?)\]/g)
  var skills = text.match(/\[([\w-]+)\/([\w-]+)?\]/g) || text.match(/skill[>：:]\s*[\w-]+/gi)
  var isDecisionGate = /Decision Gate|decision.*gate/i.test(text)
  var isVeto = /veto|reject|should not do/i.test(text)
  var isValidation = /validation gate|all green|all red|npm run validate|lint.*typecheck.*test/i.test(text)
  var isWrapUp = /close.?out\s*[1-7]|wrap.?up|drift.*update|capture.?auditor|manifest.*update|close-out/i.test(text)
  var isSubagent = /sub.?agent.*spawn|capture.?auditor.*sub|launch.*sub.?agent|reviewer.*sub/i.test(text)
  var isMemoOrCommit = /stakeholder memo|git.*commit|git.*strategy|commit.*message/i.test(text)

  if (isDecisionGate) {
    segments.push({ type: 'decision_gate', text: truncate(text, 400), veto: isVeto })
  } else if (isValidation) {
    segments.push({ type: 'validation', text: truncate(text, 300) })
  } else if (isSubagent) {
    segments.push({ type: 'subagent', text: truncate(text, 400) })
  } else if (isWrapUp || isMemoOrCommit) {
    segments.push({ type: 'wrapup', text: truncate(text, 400) })
  } else {
    segments.push({ type: 'thinking', text: truncate(text, 400) })
  }

  if (rules) {
    for (var r = 0; r < rules.length; r++) {
      segments.push({ type: 'rule_adopt', name: rules[r].replace(/[\[\]]/g, '') })
    }
  }
  if (skills) {
    for (var s = 0; s < Math.min(skills.length, 3); s++) {
      segments.push({ type: 'skill_invoke', name: (skills[s] || '').replace(/[\[\]]/g, '') })
    }
  }
  return segments
}

function extractUserQuery(text) {
  var match = text.match(/<user_query>\s*([\s\S]*?)\s*<\/user_query>/)
  if (match) return match[1].trim()
  if (text.length < 500 && !text.includes('<')) return text.trim()
  return null
}

function summarizeInput(input) {
  if (!input) return ''
  if (typeof input === 'string') return truncate(input, 120)
  if (input.command) return 'sh: ' + truncate(input.command, 100)
  if (input.path) return truncate(input.path, 100)
  if (input.pattern) return 'grep: ' + truncate(input.pattern, 80)
  if (input.glob_pattern) return 'glob: ' + truncate(input.glob_pattern, 80)
  if (input.search_term) return 'web: ' + truncate(input.search_term, 80)
  if (input.prompt) return truncate(input.prompt, 100)
  return truncate(JSON.stringify(input), 120)
}

function stringifyContent(c) {
  if (!c) return ''
  if (typeof c === 'string') return c
  if (Array.isArray(c)) return c.map(function(x) { return typeof x === 'string' ? x : (x.text || JSON.stringify(x)) }).join('\n')
  return JSON.stringify(c)
}

function truncate(s, n) { return s && s.length > n ? s.slice(0, n) + '…' : (s || '') }

function resolveTranscriptPath(id) {
  for (var i = 0; i < TRANSCRIPT_SOURCES.length; i++) {
    var src = TRANSCRIPT_SOURCES[i]
    var provider = getProvider(src.platform)
    var jsonl = provider.resolveJsonl(src.dir, id)
    if (jsonl) return { jsonl: jsonl, base: path.dirname(jsonl), platform: src.platform }
  }
  return null
}

function loadTranscriptList() {
  var all = []
  for (var si = 0; si < TRANSCRIPT_SOURCES.length; si++) {
    var src = TRANSCRIPT_SOURCES[si]
    try {
      var entries = fs.readdirSync(src.dir)
      for (var ei = 0; ei < entries.length; ei++) {
        var d = entries[ei]
        var id = d.replace(/\.jsonl$/, '')
        if (!/^[a-f0-9-]+$/.test(id)) continue
        var resolved = resolveTranscriptPath(id)
        if (!resolved) continue
        var stat = null
        try { stat = fs.statSync(resolved.jsonl) } catch { continue }
        all.push({ id: id, jsonl: resolved.jsonl, base: resolved.base, platform: resolved.platform, mtime: stat.mtimeMs, size: stat.size })
      }
    } catch {}
  }

  var seen = new Set()
  all = all.filter(function(t) { if (seen.has(t.id)) return false; seen.add(t.id); return true })
  all.sort(function(a, b) { return b.mtime - a.mtime })
  all = all.slice(0, 50)

  return all.map(function(t) {
    var title = extractTitleFromJsonl(t.jsonl, t.platform)
    var hasSubagents = false
    try { hasSubagents = fs.readdirSync(path.join(t.base, 'subagents')).length > 0 } catch {}
    return { id: t.id, title: title, mtime: t.mtime, size: t.size, hasSubagents: hasSubagents, platform: t.platform }
  })
}

function extractTitleFromJsonl(jsonlPath, platform) {
  var title = '(untitled)'
  var provider = getProvider(platform)
  try {
    var fd = fs.openSync(jsonlPath, 'r')
    var buf = Buffer.alloc(8192)
    fs.readSync(fd, buf, 0, 8192, 0)
    fs.closeSync(fd)
    var allLines = buf.toString('utf-8')
    var jlines = allLines.split('\n').filter(Boolean).slice(0, 6)
    for (var li = 0; li < jlines.length && title === '(untitled)'; li++) {
      try {
        var parsed = JSON.parse(jlines[li])
        var extracted = provider.extractTitle(parsed)
        if (extracted) { title = extracted; break }
      } catch {}
    }
  } catch {}
  return title
}

function loadTranscriptDetail(id) {
  var resolved = resolveTranscriptPath(id)
  if (!resolved) return null
  var content = readFileSafe(resolved.jsonl)
  if (!content) return null
  var lines = content.split('\n').filter(Boolean)
  var events = parseTranscriptEvents(lines)
  var subagentEvents = []
  try {
    var saDir = path.join(resolved.base, 'subagents')
    var saFiles = fs.readdirSync(saDir).filter(function(f) { return f.endsWith('.jsonl') })
    for (var i = 0; i < saFiles.length; i++) {
      var saContent = readFileSafe(path.join(saDir, saFiles[i]))
      if (!saContent) continue
      var saLines = saContent.split('\n').filter(Boolean)
      var saEvt = parseTranscriptEvents(saLines)
      subagentEvents.push({ id: saFiles[i].replace('.jsonl', ''), events: saEvt })
    }
  } catch {}
  return { id: id, events: events, subagents: subagentEvents, totalLines: lines.length, platform: resolved.platform }
}

// ---------------------------------------------------------------------------
// Static file serving
// ---------------------------------------------------------------------------

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
}

function serveStatic(req, res) {
  const urlPath = req.url.split('?')[0]
  let filePath = path.join(PUBLIC_DIR, urlPath === '/' ? 'index.html' : urlPath)

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403)
    res.end('Forbidden')
    return
  }

  try {
    const stat = fs.statSync(filePath)
    if (stat.isDirectory()) filePath = path.join(filePath, 'index.html')
  } catch {
    filePath = path.join(PUBLIC_DIR, 'index.html')
  }

  try {
    const content = fs.readFileSync(filePath)
    const ext = path.extname(filePath)
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
    res.end(content)
  } catch {
    res.writeHead(404)
    res.end('Not Found')
  }
}

// ---------------------------------------------------------------------------
// HTTP Server
// ---------------------------------------------------------------------------

const server = http.createServer((req, res) => {
  if (req.url === '/sse') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    })
    res.write('data: {"type":"connected"}\n\n')
    sseClients.push(res)
    req.on('close', () => { sseClients = sseClients.filter(c => c !== res) })
    return
  }

  if (req.url === '/api/state') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
    res.end(JSON.stringify(state))
    return
  }

  if (req.url === '/api/transcripts') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
    res.end(JSON.stringify(loadTranscriptList()))
    return
  }

  var txMatch = req.url.match(/^\/api\/transcripts\/([a-f0-9-]+)$/)
  if (txMatch) {
    var detail = loadTranscriptDetail(txMatch[1])
    if (!detail) { res.writeHead(404); res.end('Not found'); return }
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
    res.end(JSON.stringify(detail))
    return
  }

  serveStatic(req, res)
})

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

loadState()
watchFiles()
setInterval(() => {
  for (const src of inferenceEngines) src.engine.reconcile()
}, RECONCILE_INTERVAL_MS)

server.listen(PORT, () => {
  console.log('\n  ⚡ Archon Dashboard (multi-session)')
  console.log('  → http://localhost:' + PORT)
  console.log('  → Watching: ' + Object.values(FILES).map(f => path.relative(PROJECT_ROOT, f)).join(', '))
  console.log('  → Heartbeats: ' + path.relative(PROJECT_ROOT, HEARTBEATS_DIR) + '/')
  console.log('  → Public: ' + path.relative(PROJECT_ROOT, PUBLIC_DIR) + '/')
  for (const src of TRANSCRIPT_SOURCES) {
    console.log('  → Transcripts [' + src.platform + ']: ' + src.dir)
  }
  if (TRANSCRIPT_SOURCES.length === 0) {
    console.log('  → Transcripts: (none found)')
  }
  console.log('  → Ctrl+C to stop\n')
})
