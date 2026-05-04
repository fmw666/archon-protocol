/**
 * Passive Inference Engine — infer agent lifecycle phase from transcript JSONL.
 *
 * Platform-agnostic: all format differences are handled by providers.js.
 * This module only deals with unified events and phase inference logic.
 */

const fs = require('node:fs')
const path = require('node:path')
const { getProvider } = require('./providers.js')

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const IDLE_TIMEOUT_MS = 30_000
const MIN_PHASE_DURATION_MS = 2_000
const ACTIVE_WINDOW_MS = 60 * 60 * 1000
const RECONCILE_INTERVAL_MS = 5_000

// ---------------------------------------------------------------------------
// TranscriptTailer — incremental JSONL reader via byte offset
// ---------------------------------------------------------------------------

class TranscriptTailer {
  constructor(filePath, provider) {
    this.filePath = filePath
    this.provider = provider
    this.offset = 0
    this.allEvents = []
  }

  tail() {
    const newEvents = []
    let fd
    try {
      fd = fs.openSync(this.filePath, 'r')
      const stat = fs.fstatSync(fd)
      const size = stat.size
      if (size <= this.offset) { fs.closeSync(fd); return newEvents }

      const readSize = size - this.offset
      const buf = Buffer.alloc(readSize)
      fs.readSync(fd, buf, 0, readSize, this.offset)
      fs.closeSync(fd)
      fd = null
      this.offset = size

      const chunk = buf.toString('utf-8')
      const lines = chunk.split('\n')
      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed) continue
        try {
          const entry = JSON.parse(trimmed)
          const events = this.provider.parseEntry(entry)
          for (const ev of events) {
            ev.idx = this.allEvents.length + newEvents.length
            newEvents.push(ev)
          }
        } catch { /* skip malformed */ }
      }

      this.allEvents = this.allEvents.concat(newEvents)
    } catch (e) {
      if (fd != null) try { fs.closeSync(fd) } catch {}
    }
    return newEvents
  }
}

// ---------------------------------------------------------------------------
// inferPhase — pure function: events[] -> { phase, confidence, lastTool }
//
// Works on unified events regardless of source platform.
// Tool names are already normalized by providers (Bash -> Shell, Edit -> StrReplace, etc.)
// Paths are extracted via provider.extractPath() at the caller site.
// ---------------------------------------------------------------------------

const ARCHON_PATH_RE = /\.archon[/\\].*\.md$/i
const SOUL_PATH_RE = /soul\.md$/i
const ARCHON_CMD_RE = /\.cursor[/\\]commands[/\\]archon-/i
const CLAUDE_COMMANDS_RE = /\.claude[/\\]commands[/\\]/i
const SRC_PATH_RE = /web[/\\]src[/\\]/i
const SRC_GENERIC_RE = /[/\\]src[/\\]/i
const VALIDATE_CMD_RE = /\b(npm\s+run\s+validate|vitest|eslint|tsc|pytest|cargo\s+test)\b/i
const GIT_CMD_RE = /\b(git\s+add|git\s+commit)\b/i
const DECISION_TEXT_RE = /Decision Gate|decision.*gate/i
const WRAPUP_TEXT_RE = /close.?out\s*[1-7]|wrap.?up|drift.*update|capture.?auditor|manifest.*update|close-out/i
const VALIDATION_TEXT_RE = /validation gate|all green|all red|npm run validate|lint.*typecheck.*test/i

function inferPhase(events, provider) {
  if (!events || events.length === 0) {
    return { phase: 'unknown', confidence: 'low', lastTool: null }
  }

  const p = provider || getProvider('cursor')
  let phase = 'started'
  let confidence = 'high'
  let lastTool = null

  for (const ev of events) {
    if (ev.type === 'tool_use') {
      const name = ev.name
      const input = ev.input || {}
      const inputPath = p.extractPath(input)
      const command = p.extractCommand(input)

      if (name === 'Read' || name === 'Grep' || name === 'Glob' || name === 'Task') {
        if (name === 'Read' && (ARCHON_PATH_RE.test(inputPath) || SOUL_PATH_RE.test(inputPath)
            || ARCHON_CMD_RE.test(inputPath) || CLAUDE_COMMANDS_RE.test(inputPath))) {
          phase = 'decision-gate'
          confidence = 'high'
          lastTool = name
        } else if (name === 'Task') {
          lastTool = 'Task'
        }
      }

      if (name === 'StrReplace' || name === 'Write' || name === 'EditNotebook') {
        if (SRC_PATH_RE.test(inputPath) || (!ARCHON_PATH_RE.test(inputPath) && SRC_GENERIC_RE.test(inputPath))) {
          phase = 'executing'
          confidence = 'high'
          lastTool = name
        } else if (ARCHON_PATH_RE.test(inputPath)) {
          phase = 'wrapping-up'
          confidence = 'high'
          lastTool = name
        }
      }

      if (name === 'Shell') {
        if (VALIDATE_CMD_RE.test(command)) {
          phase = 'validating'
          confidence = 'high'
          lastTool = 'Shell'
        } else if (GIT_CMD_RE.test(command)) {
          phase = 'wrapping-up'
          confidence = 'high'
          lastTool = 'Shell'
        }
      }
    }

    if (ev.type === 'assistant_text') {
      const text = ev.text || ''
      if (DECISION_TEXT_RE.test(text) && phase === 'started') {
        phase = 'decision-gate'
        confidence = 'medium'
      }
      if (VALIDATION_TEXT_RE.test(text) && (phase === 'executing' || phase === 'validating')) {
        phase = 'validating'
        confidence = 'medium'
      }
      if (WRAPUP_TEXT_RE.test(text) && (phase === 'executing' || phase === 'validating')) {
        phase = 'wrapping-up'
        confidence = 'medium'
      }
    }
  }

  return { phase, confidence, lastTool }
}

// ---------------------------------------------------------------------------
// extractDemand — first user_query from unified events
// ---------------------------------------------------------------------------

function extractDemand(events) {
  for (const ev of events) {
    if (ev.type === 'user_text' && ev.text) {
      const match = ev.text.match(/<user_query>\s*([\s\S]*?)\s*<\/user_query>/)
      if (match) {
        return match[1].trim().replace(/^\/archon[-\w]*\s*/, '').slice(0, 80)
      }
      if (ev.text.length < 500 && !ev.text.includes('<')) {
        return ev.text.trim().slice(0, 80)
      }
    }
  }
  return '(untitled)'
}

// ---------------------------------------------------------------------------
// isL0Idle — last entry is pure assistant text (no tool_use pending)
// ---------------------------------------------------------------------------

function isL0Idle(events) {
  if (events.length === 0) return false
  const last = events[events.length - 1]
  if (last.type !== 'assistant_text') return false
  if (events.length >= 2) {
    const prev = events[events.length - 2]
    if (prev.type === 'tool_result') return false
  }
  return true
}

// ---------------------------------------------------------------------------
// InferenceEngine — manages all active inferred sessions
//
// Receives a provider instance so all platform differences are delegated.
// ---------------------------------------------------------------------------

class InferenceEngine {
  constructor(transcriptsDir, platform, onChange) {
    this.transcriptsDir = transcriptsDir
    this.platform = platform || 'cursor'
    this.provider = getProvider(this.platform)
    this.onChange = onChange || (() => {})
    this.sessions = new Map()
  }

  onTranscriptChange(uuid) {
    const jsonlPath = this.provider.resolveJsonl(this.transcriptsDir, uuid)
    if (!jsonlPath) return

    let session = this.sessions.get(uuid)
    if (!session) {
      let stat
      try { stat = fs.statSync(jsonlPath) } catch { return }
      session = {
        id: uuid,
        sessionId: 'tx-' + uuid.slice(0, 8),
        phase: 'started',
        phaseEnteredAt: Date.now(),
        pendingPhase: null,
        demand: '(untitled)',
        startedAt: new Date(stat.birthtimeMs || stat.mtimeMs).toISOString(),
        updatedAt: new Date().toISOString(),
        platform: this.platform,
        subagents: [],
        _source: 'inferred',
        _transcriptId: uuid,
        _confidence: 'high',
        _eventCount: 0,
        _lastTool: null,
        _lastEventAt: Date.now(),
        _tailer: new TranscriptTailer(jsonlPath, this.provider),
      }
      this.sessions.set(uuid, session)
    }

    if (session.phase === 'idle') {
      session.phase = 'started'
      session.phaseEnteredAt = Date.now()
      session.pendingPhase = null
    }

    const newEvents = session._tailer.tail()
    if (newEvents.length === 0) return

    session._lastEventAt = Date.now()
    session.updatedAt = new Date().toISOString()
    session._eventCount = session._tailer.allEvents.length

    const result = inferPhase(session._tailer.allEvents, this.provider)
    session._confidence = result.confidence
    session._lastTool = result.lastTool

    if (session.demand === '(untitled)') {
      session.demand = extractDemand(session._tailer.allEvents)
    }

    this._collectSubagents(session)

    if (isL0Idle(session._tailer.allEvents)) {
      session.phase = 'idle'
      session.phaseEnteredAt = Date.now()
      session.pendingPhase = null
    } else {
      this._maybeTransition(session, result.phase)
    }

    this.onChange()
  }

  reconcile() {
    const now = Date.now()
    let changed = false

    for (const [, session] of this.sessions) {
      if (session.phase === 'idle') continue
      const elapsed = now - session._lastEventAt
      if (elapsed > IDLE_TIMEOUT_MS) {
        session.phase = 'idle'
        session.phaseEnteredAt = now
        session.pendingPhase = null
        session.updatedAt = new Date().toISOString()
        changed = true
      }
    }

    this._discoverNew()

    for (const [, session] of this.sessions) {
      if (session.phase !== 'idle' && session.pendingPhase) {
        const sinceEntry = now - session.phaseEnteredAt
        if (sinceEntry >= MIN_PHASE_DURATION_MS) {
          session.phase = session.pendingPhase
          session.phaseEnteredAt = now
          session.pendingPhase = null
          changed = true
        }
      }
    }

    if (changed) this.onChange()
  }

  getActiveSessions() {
    const result = []
    for (const [, session] of this.sessions) {
      result.push({
        sessionId: session.sessionId,
        phase: session.phase,
        demand: session.demand,
        startedAt: session.startedAt,
        updatedAt: session.updatedAt,
        platform: session.platform,
        subagents: session.subagents,
        _source: session._source,
        _transcriptId: session._transcriptId,
        _confidence: session._confidence,
        _eventCount: session._eventCount,
        _lastTool: session._lastTool,
      })
    }
    return result
  }

  _maybeTransition(session, newPhase) {
    if (newPhase === session.phase) return false
    if (newPhase === 'idle' || newPhase === 'started') {
      session.phase = newPhase
      session.phaseEnteredAt = Date.now()
      session.pendingPhase = null
      return true
    }
    const elapsed = Date.now() - session.phaseEnteredAt
    if (elapsed < MIN_PHASE_DURATION_MS) {
      session.pendingPhase = newPhase
      return false
    }
    session.phase = newPhase
    session.phaseEnteredAt = Date.now()
    session.pendingPhase = null
    return true
  }

  _collectSubagents(session) {
    const events = session._tailer.allEvents
    const running = new Map()
    for (const ev of events) {
      if (ev.type === 'tool_use' && ev.name === 'Task') {
        const prompt = (ev.input && ev.input.prompt) || ''
        const desc = (ev.input && ev.input.description) || prompt.slice(0, 60)
        running.set(ev.idx, { type: desc, status: 'running', startedAt: session.updatedAt })
      }
    }
    session.subagents = Array.from(running.values()).slice(-5)
  }

  _discoverNew() {
    try {
      const entries = fs.readdirSync(this.transcriptsDir)
      const now = Date.now()
      for (const d of entries) {
        const id = d.replace(/\.jsonl$/, '')
        if (!/^[a-f0-9-]+$/.test(id)) continue
        if (this.sessions.has(id)) continue
        const jsonlPath = this.provider.resolveJsonl(this.transcriptsDir, id)
        if (!jsonlPath) continue
        try {
          const stat = fs.statSync(jsonlPath)
          if (now - stat.mtimeMs < ACTIVE_WINDOW_MS) {
            this.onTranscriptChange(id)
          }
        } catch {}
      }
    } catch {}
  }
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  TranscriptTailer,
  inferPhase,
  extractDemand,
  isL0Idle,
  InferenceEngine,
  IDLE_TIMEOUT_MS,
  RECONCILE_INTERVAL_MS,
}
