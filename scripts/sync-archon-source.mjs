#!/usr/bin/env node
// sync-archon-source.mjs — pull Archon source files from an authoring repo
// (typically Distilgent) into docs/source-files/, regenerate wrapper pages,
// and lint internal links. Designed to be the single command run after any
// upstream Archon change.
//
// Usage:
//   node scripts/sync-archon-source.mjs                        # uses ../Distilgent
//   node scripts/sync-archon-source.mjs --src=E:/Distilgent    # explicit path
//   node scripts/sync-archon-source.mjs --src=../Distilgent --dry-run
//
// Flags:
//   --src=<path>   Authoring repo root (default: ../Distilgent relative to CWD)
//   --dry-run      Report what would change, don't write
//   --no-lint      Skip link lint step
//
// What it does (in order):
//   1. Resolve source repo; verify it contains .archon/ and tools/archon-cli/
//   2. For each mirror rule, copy matching files into docs/source-files/,
//      removing target-only files so the mirror stays a true reflection.
//   3. Run scripts/generate-source-pages.mjs to regenerate wrappers.
//   4. Run scripts/lint-links.mjs to catch broken internal links.
//
// Mirror rules ARE the contract of what the docs site promises to ship. Edit
// MIRROR_RULES below when the authoring repo grows a new Archon file category.

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '..')
const TARGET_DIR = path.join(REPO_ROOT, 'docs', 'source-files')

// Parse flags
const argv = process.argv.slice(2)
let srcArg = null
let dryRun = false
let runLint = true
for (const a of argv) {
  if (a.startsWith('--src=')) srcArg = a.slice(6)
  else if (a === '--dry-run') dryRun = true
  else if (a === '--no-lint') runLint = false
  else if (a === '--help' || a === '-h') {
    console.log(`Usage: node scripts/sync-archon-source.mjs [--src=<path>] [--dry-run] [--no-lint]`)
    process.exit(0)
  }
}

const DEFAULT_SRC = path.resolve(REPO_ROOT, '..', 'Distilgent')
const SRC_ROOT = srcArg ? path.resolve(srcArg) : DEFAULT_SRC

// Mirror rules: a list of entries describing what to copy.
// Each entry is one of:
//   { kind: 'file', src, dst }                          — single file
//   { kind: 'glob', srcDir, dstDir, include, exclude }  — directory tree
// Paths are relative to their respective roots. `include` matches basenames
// (regex); `exclude` matches relative paths inside the source dir (regex).
const MIRROR_RULES = [
  // === .archon core (project-agnostic cognitive layer) ===
  { kind: 'file', src: '.archon/soul.md', dst: '.archon/soul.md' },
  { kind: 'file', src: '.archon/soul/delivery.md', dst: '.archon/soul/delivery.md' },
  { kind: 'file', src: '.archon/soul/review.md', dst: '.archon/soul/review.md' },
  { kind: 'file', src: '.archon/VERSION', dst: '.archon/VERSION' },
  { kind: 'file', src: '.archon/contracts/governance-contract.yaml', dst: '.archon/contracts/governance-contract.yaml' },
  { kind: 'file', src: '.archon/templates/run.template.md', dst: '.archon/templates/run.template.md' },
  { kind: 'file', src: '.archon/templates/run-state.schema.json', dst: '.archon/templates/run-state.schema.json' },
  // Domain lenses: entire tree (README + registry + lenses + templates + tools)
  { kind: 'glob', srcDir: '.archon/domain-lenses', dstDir: '.archon/domain-lenses', include: /\.(md|yaml|yml)$/i, exclude: null },
  // Dashboard (reference implementation) — source code only, skip heartbeat runtime state
  { kind: 'glob', srcDir: '.archon/dashboard', dstDir: '.archon/dashboard', include: /\.(js|mjs|cjs|json|html|css)$/i, exclude: /(^|[\\/])heartbeats([\\/]|$)/ },
  // Extensions: markdown contracts only (runtime state lives in the authoring project)
  { kind: 'glob', srcDir: '.archon/extensions', dstDir: '.archon/extensions', include: /\.md$/i, exclude: null },

  // === .cursor platform surface (commands · agents · rules · skills) ===
  { kind: 'glob', srcDir: '.cursor/commands', dstDir: '.cursor/commands', include: /^archon.*\.md$/i, exclude: null },
  { kind: 'glob', srcDir: '.cursor/agents', dstDir: '.cursor/agents', include: /^archon.*\.md$/i, exclude: null },
  { kind: 'glob', srcDir: '.cursor/rules', dstDir: '.cursor/rules', include: /^archon.*\.mdc$/i, exclude: null },
  // Archon-named skills + two evaluation skills tightly coupled with Archon
  { kind: 'file', src: '.cursor/skills/archon-framework/SKILL.md', dst: '.cursor/skills/archon-framework/SKILL.md' },
  { kind: 'file', src: '.cursor/skills/archon-git-commit/SKILL.md', dst: '.cursor/skills/archon-git-commit/SKILL.md' },
  { kind: 'file', src: '.cursor/skills/archon-signs/SKILL.md', dst: '.cursor/skills/archon-signs/SKILL.md' },
  { kind: 'file', src: '.cursor/skills/archon-comic-doc-refactor/SKILL.md', dst: '.cursor/skills/archon-comic-doc-refactor/SKILL.md' },
  { kind: 'file', src: '.cursor/skills/blink-dispatch/SKILL.md', dst: '.cursor/skills/blink-dispatch/SKILL.md' },
  { kind: 'file', src: '.cursor/skills/external-agent-patterns/SKILL.md', dst: '.cursor/skills/external-agent-patterns/SKILL.md' },

  // === Scripts (portable helpers) ===
  { kind: 'glob', srcDir: 'scripts', dstDir: 'scripts', include: /^(archon-|export-archon-|test-archon-).*\.(py|sh|mjs)$/i, exclude: null },

  // === Archon CLI ===
  { kind: 'glob', srcDir: 'tools/archon-cli', dstDir: 'tools/archon-cli', include: /\.(md|mjs|json)$/i, exclude: /node_modules/ },

  // === Repo-root legal files ===
  { kind: 'file', src: 'LICENSE', dst: 'LICENSE', optional: true },
  { kind: 'file', src: 'NOTICE', dst: 'NOTICE', optional: true },
]

function log(msg) {
  const prefix = dryRun ? '[dry-run] ' : ''
  console.log(prefix + msg)
}

async function exists(p) {
  try { await fs.access(p); return true } catch { return false }
}

async function walkDir(root, include, exclude) {
  const results = []
  async function walk(current) {
    let entries
    try { entries = await fs.readdir(current, { withFileTypes: true }) }
    catch { return }
    for (const entry of entries) {
      const full = path.join(current, entry.name)
      const rel = path.relative(root, full)
      if (exclude && exclude.test(rel)) continue
      if (entry.isDirectory()) {
        await walk(full)
      } else if (entry.isFile()) {
        if (!include || include.test(entry.name)) {
          results.push(rel)
        }
      }
    }
  }
  await walk(root)
  return results
}

async function copyFile(srcAbs, dstAbs) {
  if (dryRun) return
  await fs.mkdir(path.dirname(dstAbs), { recursive: true })
  await fs.copyFile(srcAbs, dstAbs)
}

async function run() {
  log(`Source:  ${SRC_ROOT}`)
  log(`Target:  ${TARGET_DIR}`)

  if (!(await exists(path.join(SRC_ROOT, '.archon', 'soul.md')))) {
    console.error(`ERROR: source repo does not look like an Archon-governed project`)
    console.error(`       missing: ${path.join(SRC_ROOT, '.archon', 'soul.md')}`)
    console.error(`Hint: pass --src=<path> to point at your authoring repo.`)
    process.exit(1)
  }

  const plannedTargets = new Set()
  let copied = 0
  let skipped = 0

  for (const rule of MIRROR_RULES) {
    if (rule.kind === 'file') {
      const srcAbs = path.join(SRC_ROOT, rule.src)
      const dstAbs = path.join(TARGET_DIR, rule.dst)
      if (!(await exists(srcAbs))) {
        if (rule.optional) {
          log(`  skip (optional, missing upstream): ${rule.src}`)
          skipped += 1
          continue
        }
        console.error(`  MISSING required source file: ${rule.src}`)
        process.exit(1)
      }
      plannedTargets.add(path.relative(TARGET_DIR, dstAbs).split(path.sep).join('/'))
      await copyFile(srcAbs, dstAbs)
      log(`  file  ${rule.src}`)
      copied += 1
    } else if (rule.kind === 'glob') {
      const srcDirAbs = path.join(SRC_ROOT, rule.srcDir)
      if (!(await exists(srcDirAbs))) {
        log(`  skip (missing dir): ${rule.srcDir}`)
        continue
      }
      const files = await walkDir(srcDirAbs, rule.include, rule.exclude)
      for (const rel of files) {
        const srcAbs = path.join(srcDirAbs, rel)
        const dstAbs = path.join(TARGET_DIR, rule.dstDir, rel)
        plannedTargets.add(path.relative(TARGET_DIR, dstAbs).split(path.sep).join('/'))
        await copyFile(srcAbs, dstAbs)
      }
      log(`  glob  ${rule.srcDir} (${files.length} files)`)
      copied += files.length
    }
  }

  // Remove stale files in target that are no longer in the mirror plan.
  const existingTargets = await walkDir(TARGET_DIR, null, null)
  let removed = 0
  for (const rel of existingTargets) {
    const normalized = rel.split(path.sep).join('/')
    if (!plannedTargets.has(normalized)) {
      const abs = path.join(TARGET_DIR, rel)
      if (!dryRun) await fs.unlink(abs)
      log(`  remove stale: ${normalized}`)
      removed += 1
    }
  }

  // Tidy empty directories
  if (!dryRun) {
    async function prune(dir) {
      const entries = await fs.readdir(dir, { withFileTypes: true })
      for (const e of entries) {
        if (e.isDirectory()) await prune(path.join(dir, e.name))
      }
      const after = await fs.readdir(dir)
      if (after.length === 0 && dir !== TARGET_DIR) await fs.rmdir(dir)
    }
    await prune(TARGET_DIR)
  }

  console.log('')
  log(`Mirror summary: copied=${copied}, removed=${removed}, optional-skipped=${skipped}`)

  if (dryRun) {
    console.log('\n(dry-run) Skipping wrapper regeneration and lint.')
    return
  }

  // Regenerate wrapper pages
  console.log('\nRegenerating wrapper pages…')
  await spawnChild('node', ['scripts/generate-source-pages.mjs'])

  if (runLint) {
    console.log('\nLinting internal links…')
    await spawnChild('node', ['scripts/lint-links.mjs'])
  }

  console.log('\nDone. Review `git status` / `git diff` and commit the sync when ready.')
}

function spawnChild(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit', cwd: REPO_ROOT, shell: process.platform === 'win32' })
    child.on('close', (code) => code === 0 ? resolve() : reject(new Error(`${cmd} exited with code ${code}`)))
  })
}

run().catch((err) => { console.error(err); process.exit(1) })
