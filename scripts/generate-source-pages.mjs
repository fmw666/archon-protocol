// Generate VitePress wrapper pages for every file under docs/source-files/.
// Strategy: auto-walk source-files/, derive a wrapper path + language from the
// file location, and allow a manual override table for ergonomic path flattening
// and titles. Each wrapper embeds the original file inline so the rendered docs
// site stays a perfect mirror of the shipped kit.
//
// Usage: node scripts/generate-source-pages.mjs
import { promises as fs } from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(process.cwd(), 'docs')
const SOURCE_FILES_DIR = path.join(ROOT, 'source-files')
const OUTPUT_DIR = path.join(ROOT, 'source')

// Files / globs to skip when auto-walking (runtime noise, hidden, binary, etc.)
const EXCLUDE_BASENAMES = new Set(['.DS_Store', '.gitignore', '.gitkeep'])
const EXCLUDE_EXT = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico'])

function inferLang(relPath) {
  const ext = path.extname(relPath).toLowerCase()
  const base = path.basename(relPath).toLowerCase()
  if (ext === '.md' || ext === '.mdc') return 'md'
  if (ext === '.js' || ext === '.mjs' || ext === '.cjs') return 'js'
  if (ext === '.ts') return 'ts'
  if (ext === '.json') return 'json'
  if (ext === '.yaml' || ext === '.yml') return 'yaml'
  if (ext === '.py') return 'python'
  if (ext === '.sh') return 'bash'
  if (ext === '.css') return 'css'
  if (ext === '.html' || ext === '.htm') return 'html'
  if (base === 'license' || base === 'notice' || base === 'version') return 'text'
  return 'text'
}

// Convert a source path like `.archon/domain-lenses/tools/design/palette-boundary.md`
// into a wrapper output path like `domain-lenses/tools/design/palette-boundary.md`.
// We drop any leading dotfolder (`.archon`, `.cursor`) and collapse deeply-nested
// structures into a sensible URL-friendly layout.
function defaultWrapperPath(relSrc) {
  const normalized = relSrc.split(path.sep).join('/')
  const parts = normalized.split('/')

  // Drop leading dot-folder segment (.archon / .cursor).
  if (parts[0] && parts[0].startsWith('.')) parts.shift()

  // tools/archon-cli/bin/archon.mjs -> cli/bin-archon.md
  // tools/archon-cli/lib/common.mjs -> cli/lib-common.md
  // tools/archon-cli/package.json   -> cli/package.md
  if (parts[0] === 'tools' && parts[1] === 'archon-cli') {
    const tail = parts.slice(2)
    if (tail[0] === 'bin') return 'cli/bin-' + path.basename(tail[1], path.extname(tail[1])) + '.md'
    if (tail[0] === 'lib') return 'cli/lib-' + path.basename(tail[1], path.extname(tail[1])) + '.md'
    return 'cli/' + path.basename(tail.join('/'), path.extname(tail[tail.length - 1])) + '.md'
  }

  // scripts/archon-check.py -> scripts/archon-check-py.md (disambiguate ext)
  if (parts[0] === 'scripts') {
    const filename = parts[parts.length - 1]
    const ext = path.extname(filename).slice(1)
    const stem = path.basename(filename, path.extname(filename))
    const dirs = parts.slice(0, -1).join('/')
    if (ext === 'py' || ext === 'sh') {
      return dirs + '/' + stem + '-' + ext + '.md'
    }
    return dirs + '/' + stem + '.md'
  }

  // skills/<name>/SKILL.md -> skills/<name>.md
  if (parts[0] === 'skills' && parts[parts.length - 1] === 'SKILL.md') {
    return 'skills/' + parts[1] + '.md'
  }

  // Generic: flatten dirs as-is, turn file ext into .md
  const filename = parts[parts.length - 1]
  const ext = path.extname(filename)
  const stem = path.basename(filename, ext)
  const dirs = parts.slice(0, -1)
  return [...dirs, stem + '.md'].join('/')
}

// Manual overrides — only override when the default heuristic is wrong or a
// nicer URL is desired. Everything else is auto-derived.
const OVERRIDES = {
  // soul layout: flatten soul/delivery.md → soul-delivery.md
  '.archon/soul/delivery.md': { out: 'soul-delivery.md' },
  '.archon/soul/review.md': { out: 'soul-review.md' },
  // registry + contract: .yaml source, wrapper named without the .yaml infix
  '.archon/domain-lenses/registry.yaml': { out: 'domain-lenses/registry.md' },
  '.archon/contracts/governance-contract.yaml': { out: 'contracts/governance-contract.md' },
  // Lenses live under domain-lenses/lenses/ in source but read better flat.
  '.archon/domain-lenses/lenses/dev.md': { out: 'domain-lenses/dev.md' },
  '.archon/domain-lenses/lenses/design.md': { out: 'domain-lenses/design.md' },
  '.archon/domain-lenses/lenses/platform.md': { out: 'domain-lenses/platform.md' },
  '.archon/domain-lenses/lenses/ecosystem.md': { out: 'domain-lenses/ecosystem.md' },
  '.archon/domain-lenses/lenses/capability.md': { out: 'domain-lenses/capability.md' },
  // Domain-lenses README becomes the section index elsewhere; wrapper still useful.
  '.archon/domain-lenses/README.md': { out: 'domain-lenses/README.md' },
  // Runtime templates
  '.archon/templates/run.template.md': { out: 'runtime-templates/run.template.md' },
  '.archon/templates/run-state.schema.json': { out: 'runtime-templates/run-state.schema.md' },
  // VERSION is a plain text file
  '.archon/VERSION': { out: 'version.md' },
  // License/notice at repo root
  'LICENSE': { out: 'license.md' },
  'NOTICE': { out: 'notice.md' },
  // Dashboard: rename the public/index.html mirror to avoid colliding with
  // VitePress section index convention.
  '.archon/dashboard/public/index.html': { out: 'dashboard/public/public-index.md' },
  // Domain-lens templates contain prose placeholders like `<tool-name>` and
  // `<domain>` that Vue's template parser mistakes for unclosed HTML tags.
  // Render them as literal markdown code blocks instead of inlining, which
  // preserves the visual layout while side-stepping the compiler.
  '.archon/domain-lenses/templates/lens.md': { out: 'domain-lenses/templates/lens.md', renderAs: 'code', lang: 'markdown' },
  '.archon/domain-lenses/templates/tool.md': { out: 'domain-lenses/templates/tool.md', renderAs: 'code', lang: 'markdown' },
}

async function walkDir(dir) {
  const entries = []
  async function walk(current) {
    const list = await fs.readdir(current, { withFileTypes: true })
    for (const entry of list) {
      const full = path.join(current, entry.name)
      if (entry.isDirectory()) {
        await walk(full)
      } else if (entry.isFile()) {
        if (EXCLUDE_BASENAMES.has(entry.name)) continue
        if (EXCLUDE_EXT.has(path.extname(entry.name).toLowerCase())) continue
        entries.push(full)
      }
    }
  }
  await walk(dir)
  return entries
}

function buildWrapperContent(entry) {
  // Special-case: render this markdown file as a fenced code block instead of
  // inlining it, to protect Vue's template compiler from prose-level HTML-like
  // placeholders (e.g. `<tool-name>` in a doc template).
  const renderAsCode = entry.renderAs === 'code'
  const isMarkdown = entry.lang === 'md' && !renderAsCode

  const header = `---
title: ${entry.title}
outline: deep
---

# \`${entry.title}\`

> Source location: [\`docs/source-files/${entry.src}\`](https://github.com/fmw666/archon-protocol/blob/main/docs/source-files/${entry.src}) — this page is a rendered mirror; the file is the source of truth.

`

  const wrapperAbs = path.join(OUTPUT_DIR, entry.out)
  const wrapperDir = path.dirname(wrapperAbs)
  const includedAbs = path.join(SOURCE_FILES_DIR, entry.src)
  let relIncluded = path.relative(wrapperDir, includedAbs).replace(/\\/g, '/')
  if (!relIncluded.startsWith('.')) relIncluded = './' + relIncluded

  if (isMarkdown) {
    return header + `<!--@include: ${relIncluded}-->\n`
  }
  return header + `<<< ${relIncluded}{${entry.lang}}\n`
}

async function main() {
  const absFiles = await walkDir(SOURCE_FILES_DIR)
  const entries = []
  for (const abs of absFiles) {
    const relSrc = path.relative(SOURCE_FILES_DIR, abs).split(path.sep).join('/')
    const override = OVERRIDES[relSrc]
    const out = override?.out ?? defaultWrapperPath(relSrc)
    const lang = override?.lang ?? inferLang(relSrc)
    const title = override?.title ?? relSrc
    const renderAs = override?.renderAs
    entries.push({ src: relSrc, out, title, lang, renderAs })
  }

  let written = 0
  const conflictCheck = new Map()
  for (const entry of entries) {
    if (conflictCheck.has(entry.out)) {
      console.error(`  CONFLICT: ${entry.out} maps from both ${conflictCheck.get(entry.out)} and ${entry.src}`)
      process.exit(1)
    }
    conflictCheck.set(entry.out, entry.src)
    const outAbs = path.join(OUTPUT_DIR, entry.out)
    await fs.mkdir(path.dirname(outAbs), { recursive: true })
    await fs.writeFile(outAbs, buildWrapperContent(entry), 'utf8')
    written += 1
  }
  console.log(`Generated ${written} source wrapper pages from ${absFiles.length} source files.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
