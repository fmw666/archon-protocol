/**
 * Transcript Providers — platform-specific adapters for reading agent transcripts.
 *
 * Each provider normalizes a platform's JSONL format into a unified event stream
 * so the inference engine works identically regardless of the source tool.
 *
 * Unified event types:
 *   { type: 'user_text',      role: 'user',      text }
 *   { type: 'assistant_text', role: 'assistant',  text }
 *   { type: 'tool_use',       role: 'assistant',  name, input }
 *   { type: 'tool_result',    role: 'tool',       name, content }
 */

const fs = require('node:fs')
const path = require('node:path')

// ═══════════════════════════════════════════════════════════════════════════
// Base Provider
// ═══════════════════════════════════════════════════════════════════════════

class BaseProvider {
  constructor(id) { this.id = id }

  /** Discover transcript directories for the given project root. Returns [{ dir, platform }] */
  discover(_projectRoot) { return [] }

  /** Resolve a session uuid to its .jsonl file path within txDir. Returns string | null */
  resolveJsonl(txDir, uuid) {
    const nested = path.join(txDir, uuid, uuid + '.jsonl')
    try { if (fs.statSync(nested).isFile()) return nested } catch {}
    const flat = path.join(txDir, uuid + '.jsonl')
    try { if (fs.statSync(flat).isFile()) return flat } catch {}
    return null
  }

  /** Parse a raw JSONL line (already JSON.parsed) into unified events[]. */
  parseEntry(_entry) { return [] }

  /** Normalize platform-specific tool names to canonical form. */
  normalizeTool(name) { return name }

  /** Extract input path from a tool_use input object. */
  extractPath(input) { return input.path || input.file_path || input.filePath || '' }

  /** Extract command string from a Shell/Bash tool_use input object. */
  extractCommand(input) { return input.command || '' }

  /** Extract user demand text from a user message entry (raw JSON line). Returns string | null */
  extractTitle(entry) {
    const content = (entry.message || {}).content
    if (typeof content === 'string' && content.trim().length > 2 && content.length < 300) {
      return content.trim().replace(/^\/archon[-\w]*\s*/, '').slice(0, 80)
    }
    if (!Array.isArray(content)) return null
    for (const block of content) {
      const text = block.text || ''
      const qm = text.match(/<user_query>\s*([\s\S]*?)\s*<\/user_query>/)
      if (qm && qm[1].trim()) return qm[1].trim().replace(/^\/archon[-\w]*\s*/, '').slice(0, 80)
      const am = text.match(/\/archon[-\w]*\s+(.{5,80})/)
      if (am) return am[1].trim().slice(0, 80)
      if (text.length < 300 && !text.includes('<cursor_commands>') && text.trim().length > 3) {
        return text.trim().replace(/<[^>]+>/g, '').trim().slice(0, 80)
      }
    }
    return null
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Cursor Provider
// ═══════════════════════════════════════════════════════════════════════════

class CursorProvider extends BaseProvider {
  constructor() { super('cursor') }

  discover(projectRoot) {
    const results = []
    const home = process.env.USERPROFILE || process.env.HOME || ''
    const root = process.env.CURSOR_PROJECTS || path.join(home, '.cursor', 'projects')
    const projectName = path.basename(projectRoot).toLowerCase()
    try {
      for (const d of fs.readdirSync(root)) {
        if (!d.toLowerCase().includes(projectName)) continue
        const txDir = path.join(root, d, 'agent-transcripts')
        try { if (fs.statSync(txDir).isDirectory()) results.push({ dir: txDir, platform: this.id }) } catch {}
      }
    } catch {}
    return results
  }

  parseEntry(entry) {
    const events = []
    const role = entry.role
    const blocks = (entry.message && entry.message.content) || []
    if (!Array.isArray(blocks)) return events

    for (const block of blocks) {
      if (block.type === 'tool_use') {
        events.push({
          type: 'tool_use', role: 'assistant',
          name: this.normalizeTool(block.name || '?'),
          input: block.input || {},
        })
      } else if (block.type === 'tool_result') {
        events.push({
          type: 'tool_result', role: 'tool',
          name: this.normalizeTool(block.name || ''),
          content: block.content,
        })
      } else if (block.type === 'text' && role === 'assistant') {
        events.push({ type: 'assistant_text', role: 'assistant', text: block.text || '' })
      } else if (block.type === 'text' && role === 'user') {
        events.push({ type: 'user_text', role: 'user', text: block.text || '' })
      }
    }
    return events
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Claude Code Provider
// ═══════════════════════════════════════════════════════════════════════════

const CLAUDE_SKIP_TYPES = new Set([
  'file-history-snapshot', 'summary', 'lock_acquired', 'lock_released',
])

const CLAUDE_TOOL_MAP = {
  Bash: 'Shell', bash: 'Shell',
  Edit: 'StrReplace', MultiEdit: 'StrReplace',
  ListDir: 'Glob',
}

class ClaudeCodeProvider extends BaseProvider {
  constructor() { super('claude-code') }

  discover(projectRoot) {
    const results = []
    const home = process.env.USERPROFILE || process.env.HOME || ''
    const claudeProjects = path.join(home, '.claude', 'projects')
    const absNorm = path.resolve(projectRoot).replace(/:/g, '-').replace(/[/\\]/g, '-').toLowerCase()
    const baseName = path.basename(projectRoot).toLowerCase()
    try {
      for (const d of fs.readdirSync(claudeProjects)) {
        const dNorm = d.replace(/--/g, '-').toLowerCase()
        if (dNorm === absNorm || d.toLowerCase().includes(baseName)) {
          const fullDir = path.join(claudeProjects, d)
          try { if (fs.statSync(fullDir).isDirectory()) results.push({ dir: fullDir, platform: this.id }) } catch {}
        }
      }
    } catch {}
    return results
  }

  normalizeTool(name) { return CLAUDE_TOOL_MAP[name] || name }

  extractPath(input) { return input.file_path || input.path || input.filePath || '' }

  parseEntry(entry) {
    const entryType = entry.type
    if (CLAUDE_SKIP_TYPES.has(entryType)) return []

    if (entryType === 'progress' && entry.data && entry.data.message) {
      return this.parseEntry(entry.data.message)
    }

    const events = []
    const role = entry.role || entryType
    const content = (entry.message || {}).content

    if (role === 'user' || entryType === 'user') {
      if (typeof content === 'string') {
        events.push({ type: 'user_text', role: 'user', text: content })
      } else if (Array.isArray(content)) {
        for (const b of content) {
          if (b.type === 'text') events.push({ type: 'user_text', role: 'user', text: b.text || '' })
        }
      }
      return events
    }

    if (role === 'assistant' || entryType === 'assistant') {
      const blocks = Array.isArray(content) ? content : []
      for (const block of blocks) {
        if (block.type === 'tool_use') {
          events.push({
            type: 'tool_use', role: 'assistant',
            name: this.normalizeTool(block.name || '?'),
            input: block.input || {},
          })
        } else if (block.type === 'tool_result') {
          events.push({
            type: 'tool_result', role: 'tool',
            name: this.normalizeTool(block.name || ''),
            content: block.content,
          })
        } else if (block.type === 'text') {
          events.push({ type: 'assistant_text', role: 'assistant', text: block.text || '' })
        }
      }
      return events
    }

    if (role === 'tool') {
      events.push({
        type: 'tool_result', role: 'tool',
        name: this.normalizeTool(entry.name || (entry.message || {}).name || ''),
        content: typeof content === 'string' ? content : '',
      })
    }

    return events
  }

  extractTitle(entry) {
    const entryType = entry.type
    if (entryType !== 'user') return null
    const content = (entry.message || {}).content
    if (typeof content === 'string' && content.trim().length > 2 && content.length < 300) {
      return content.trim().replace(/^\/archon[-\w]*\s*/, '').slice(0, 80)
    }
    return super.extractTitle(entry)
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Codex Provider (OpenAI — placeholder, format TBD)
// ═══════════════════════════════════════════════════════════════════════════

class CodexProvider extends BaseProvider {
  constructor() { super('codex') }

  discover(_projectRoot) {
    const results = []
    const home = process.env.USERPROFILE || process.env.HOME || ''
    const codexDir = path.join(home, '.codex', 'sessions')
    try { if (fs.statSync(codexDir).isDirectory()) results.push({ dir: codexDir, platform: this.id }) } catch {}
    return results
  }

  parseEntry(entry) {
    const events = []
    const role = entry.role || entry.type
    const content = (entry.message || {}).content || entry.content

    if (role === 'user') {
      const text = typeof content === 'string' ? content : ''
      if (text) events.push({ type: 'user_text', role: 'user', text })
    } else if (role === 'assistant') {
      const blocks = Array.isArray(content) ? content : []
      for (const block of blocks) {
        if (block.type === 'function_call' || block.type === 'tool_use') {
          events.push({
            type: 'tool_use', role: 'assistant',
            name: this.normalizeTool(block.name || block.function?.name || '?'),
            input: block.input || block.arguments || {},
          })
        } else if (typeof block === 'string' || block.type === 'text') {
          events.push({ type: 'assistant_text', role: 'assistant', text: block.text || block || '' })
        }
      }
      if (typeof content === 'string') {
        events.push({ type: 'assistant_text', role: 'assistant', text: content })
      }
    }
    return events
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Registry
// ═══════════════════════════════════════════════════════════════════════════

const ALL_PROVIDERS = [
  new CursorProvider(),
  new ClaudeCodeProvider(),
  new CodexProvider(),
]

function getProvider(platformId) {
  return ALL_PROVIDERS.find(p => p.id === platformId) || ALL_PROVIDERS[0]
}

function discoverAllSources(projectRoot) {
  const sources = []
  for (const provider of ALL_PROVIDERS) {
    sources.push(...provider.discover(projectRoot))
  }
  return sources
}

module.exports = {
  BaseProvider,
  CursorProvider,
  ClaudeCodeProvider,
  CodexProvider,
  ALL_PROVIDERS,
  getProvider,
  discoverAllSources,
}
