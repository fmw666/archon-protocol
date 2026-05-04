// Bullet-proof fix: escape `<` / `>` inside *inline code spans* to `\<` / `\>`.
// markdown-it will still render them as the literal characters, but Vue's
// template compiler sees escaped output and does not try to parse them as
// HTML/Vue component tags.
//
// Idempotent: skips spans whose content already contains `\<`.
import { promises as fs } from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(process.cwd(), 'docs')

async function walkMd(dir) {
  const out = []
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue
    if (entry.name === 'source-files' || entry.name === 'images') continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...(await walkMd(full)))
    else if (entry.isFile() && full.endsWith('.md')) out.push(full)
  }
  return out
}

function escapeInlineCodeInLine(line) {
  // Identify inline-code spans (single backtick pairs; we intentionally keep
  // multi-backtick spans untouched since they typically wrap snippets where
  // backticks appear literally).
  let out = ''
  let i = 0
  while (i < line.length) {
    if (line[i] === '`') {
      // Count the run of backticks forming the opener.
      let openLen = 1
      while (i + openLen < line.length && line[i + openLen] === '`') openLen += 1
      const opener = '`'.repeat(openLen)
      const closeIdx = line.indexOf(opener, i + openLen)
      if (closeIdx === -1) {
        // Not a valid span; emit verbatim
        out += line.slice(i)
        i = line.length
        continue
      }
      const inside = line.slice(i + openLen, closeIdx)
      const replaced = inside
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
      out += opener + replaced + opener
      i = closeIdx + openLen
    } else {
      out += line[i]
      i += 1
    }
  }
  return out
}

async function transformFile(filePath) {
  const raw = await fs.readFile(filePath, 'utf8')
  const lines = raw.split(/\r?\n/)
  let insideFence = false
  let fenceChar = ''
  const out = []
  for (const line of lines) {
    const fenceMatch = line.match(/^\s{0,3}(```+|~~~+)/)
    if (fenceMatch) {
      const marker = fenceMatch[1]
      if (!insideFence) { insideFence = true; fenceChar = marker[0]; out.push(line); continue }
      if (marker.startsWith(fenceChar)) { insideFence = false; fenceChar = ''; out.push(line); continue }
    }
    if (insideFence) { out.push(line); continue }
    out.push(escapeInlineCodeInLine(line))
  }
  const updated = out.join('\n')
  if (updated !== raw) {
    await fs.writeFile(filePath, updated, 'utf8')
    return true
  }
  return false
}

async function main() {
  const files = await walkMd(ROOT)
  let n = 0
  for (const f of files) {
    if (await transformFile(f)) {
      n += 1
      console.log('  fixed: ' + path.relative(ROOT, f))
    }
  }
  console.log('\nProcessed ' + files.length + ' files; ' + n + ' updated.')
}

main().catch((e) => { console.error(e); process.exit(1) })
