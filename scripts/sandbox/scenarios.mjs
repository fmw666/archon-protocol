// scripts/sandbox/scenarios.mjs — read scenario front-matter + sandbox-spec.
import { promises as fs } from 'node:fs'
import path from 'node:path'

const SPEC_OPEN = '<!-- sandbox-spec:start -->'
const SPEC_CLOSE = '<!-- sandbox-spec:end -->'

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/

export async function readScenario(scenarioFile) {
  const text = await fs.readFile(scenarioFile, 'utf8')
  const fm = parseFrontmatter(text)
  const spec = parseSpec(text, scenarioFile)
  return { file: scenarioFile, frontmatter: fm, spec, raw: text }
}

function parseFrontmatter(text) {
  const m = text.match(FRONTMATTER_RE)
  if (!m) return {}
  const out = {}
  for (const line of m[1].split('\n')) {
    const idx = line.indexOf(':')
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    let val = line.slice(idx + 1).trim()
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1)
    out[key] = val
  }
  return out
}

function parseSpec(text, file) {
  const open = text.indexOf(SPEC_OPEN)
  const close = text.indexOf(SPEC_CLOSE)
  if (open === -1 || close === -1) {
    return { runnable: 'manual', reason: 'no <!-- sandbox-spec --> block' }
  }
  const inside = text.slice(open + SPEC_OPEN.length, close).trim()
  // Accept either a ```json fence (preferred — zero ambiguity) or a ```yaml
  // fence (for human authoring; parsed via parseSimpleYaml below).
  const jsonFence = inside.match(/^```json\s*\n([\s\S]*?)\n```\s*$/)
  if (jsonFence) {
    try {
      return JSON.parse(jsonFence[1])
    } catch (err) {
      throw new Error(`[sandbox-runner] failed to parse JSON spec block in ${file}: ${err.message}`)
    }
  }
  const yamlFence = inside.match(/^```ya?ml\s*\n([\s\S]*?)\n```\s*$/)
  const yamlBody = yamlFence ? yamlFence[1] : inside
  try {
    return parseSimpleYaml(yamlBody)
  } catch (err) {
    throw new Error(`[sandbox-runner] failed to parse YAML spec block in ${file}: ${err.message}`)
  }
}

// Tiny YAML subset parser. We only need:
//   key: value
//   key: ["a", "b"]
//   key:
//     - item
//     - item
//   key:
//     subkey: value
// to keep zero-deps. If we ever need more, swap in `yaml` package.
export function parseSimpleYaml(src) {
  const lines = src.split('\n').filter((l) => l.trim() !== '' && !l.trim().startsWith('#'))
  const root = {}
  const stack = [{ indent: -1, container: root, kind: 'object' }]

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const indent = line.match(/^ */)[0].length
    const trimmed = line.trim()

    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
      stack.pop()
    }
    const top = stack[stack.length - 1]

    if (trimmed.startsWith('- ')) {
      const value = trimmed.slice(2).trim()
      if (top.kind !== 'array') {
        throw new Error(`unexpected list item at line: ${line}`)
      }
      if (value === '' || value.endsWith(':')) {
        const obj = {}
        top.container.push(obj)
        if (value.endsWith(':')) {
          // form: - key:
          const key = value.slice(0, -1)
          const inner = {}
          obj[key] = inner
          stack.push({ indent, container: obj, kind: 'object' })
          stack.push({ indent: indent + 2, container: inner, kind: 'object' })
        } else {
          stack.push({ indent, container: obj, kind: 'object' })
        }
      } else {
        top.container.push(parseScalar(value))
      }
      continue
    }

    const colonIdx = trimmed.indexOf(':')
    if (colonIdx === -1) {
      throw new Error(`expected key:value at line: ${line}`)
    }
    const key = trimmed.slice(0, colonIdx).trim()
    const rest = trimmed.slice(colonIdx + 1).trim()

    if (rest === '') {
      // Empty value → look at next line for indent: object or array.
      const next = lines[i + 1] || ''
      const nextIndent = next.match(/^ */)[0].length
      const nextTrim = next.trim()
      if (nextIndent > indent && nextTrim.startsWith('- ')) {
        const arr = []
        top.container[key] = arr
        stack.push({ indent, container: arr, kind: 'array' })
      } else {
        const obj = {}
        top.container[key] = obj
        stack.push({ indent, container: obj, kind: 'object' })
      }
      continue
    }

    if (rest.startsWith('[') && rest.endsWith(']')) {
      const inner = rest.slice(1, -1).trim()
      const items = inner === '' ? [] : splitTopLevelCsv(inner).map(parseScalar)
      top.container[key] = items
      continue
    }

    top.container[key] = parseScalar(rest)
  }

  return root
}

function parseScalar(raw) {
  if (raw === 'true') return true
  if (raw === 'false') return false
  if (raw === 'null' || raw === '~') return null
  if (/^-?\d+$/.test(raw)) return Number(raw)
  if (/^-?\d+\.\d+$/.test(raw)) return Number(raw)
  if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
    return raw.slice(1, -1)
  }
  return raw
}

function splitTopLevelCsv(s) {
  const out = []
  let depth = 0
  let cur = ''
  let quote = null
  for (const ch of s) {
    if (quote) {
      cur += ch
      if (ch === quote) quote = null
      continue
    }
    if (ch === '"' || ch === "'") {
      quote = ch
      cur += ch
      continue
    }
    if (ch === '[' || ch === '{') depth++
    if (ch === ']' || ch === '}') depth--
    if (ch === ',' && depth === 0) {
      out.push(cur.trim())
      cur = ''
      continue
    }
    cur += ch
  }
  if (cur.trim() !== '') out.push(cur.trim())
  return out
}

export async function listScenarios(rootDir) {
  const dir = path.join(rootDir, 'docs', 'testing', 'sandbox', 'scenarios')
  const files = await fs.readdir(dir)
  return files
    .filter((f) => f.endsWith('.md'))
    .map((f) => path.join(dir, f))
    .sort()
}
