#!/usr/bin/env node
// build-manifest.mjs — scan docs/source-files/ and emit a machine-readable
// manifest to docs/public/manifest.json. Agents and the Archon CLI both consume
// this file to know exactly which files the canonical distribution contains,
// where each file should be written into an adopter project, which placeholders
// need filling, and the expected sha256 so a tampered or truncated fetch can be
// rejected.
//
// Usage: node scripts/build-manifest.mjs
//
// Schema (manifest.json):
//   {
//     "schema": "archon.manifest/v1",
//     "version": "<semver from .archon/VERSION>",
//     "generated_at": "<ISO 8601>",
//     "base_url": "https://aaep.site",
//     "source_root": "docs/source-files/",
//     "modules": [ { "id", "title", "description", "required", "files": [...] } ]
//   }
//   File entry:
//   {
//     "path": ".archon/soul.md",          # target path inside adopter project
//     "source": "docs/source-files/.archon/soul.md",
//     "url":    "https://aaep.site/source-files/.archon/soul.md",
//     "sha256": "<hex>",
//     "bytes":  1234,
//     "required": true,
//     "placeholders": ["PROJECT_NAME", ...]  # strings like {{PROJECT_NAME}}
//                                            # that agent should substitute
//                                            # before writing
//   }

import { promises as fs } from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '..')
const SOURCE_ROOT = path.join(REPO_ROOT, 'docs', 'source-files')
const OUTPUT = path.join(REPO_ROOT, 'docs', 'public', 'manifest.json')
const PUBLIC_SOURCE_ROOT = path.join(REPO_ROOT, 'docs', 'public', 'source-files')
const BASE_URL = 'https://aaep.site'

// Module definitions — what to include, where under the adopter project each
// file should land, and whether the module is required or opt-in.
//
// Every entry uses a `match` function that takes a path relative to
// docs/source-files/ (forward slashes) and returns true if the file belongs in
// this module. Modules are tried in order; the first match wins. Files matched
// by no module go into `misc`.
// Author-only paths under docs/source-files/ that exist for the
// archon-protocol *source repository* itself but must NEVER be bundled into
// adopter projects via manifest.json. Tracked under KNOWN-001.
//
// IMPORTANT: removing an entry here makes the file part of the next
// manifest publish — only do that if the file is genuinely intended to ship
// to every adopter project.
const AUTHOR_ONLY_FILES = new Set([
  // KNOWN-001: legacy export pipeline that pre-dates the v2.0.0 reversal in
  // which archon-protocol became canonical. build-manifest.mjs (this file)
  // already replaces what they did. Kept in source-files so authors can still
  // run / test them locally if needed.
  'scripts/export-archon-core.mjs',
  'scripts/test-archon-export.mjs',
  // KNOWN-001: skill exists to refactor framework docs (docs/archon/**) into
  // comic-explainer pages. Adopters never have docs/archon/, so this skill
  // is never relevant on the adopter side; it lives here only because the
  // archon-protocol repository itself dogfoods it.
  '.cursor/skills/archon-comic-doc-refactor/SKILL.md',
])

const MODULE_DEFS = [
  {
    id: 'core-soul',
    title: 'Cognitive core (soul)',
    description:
      'The soul defines who the agent is: identity, cognitive loop, ownership contract, autonomy principles, guardrails. Two mode extensions load on demand.',
    required: true,
    match: (p) => p === '.archon/soul.md' || p.startsWith('.archon/soul/'),
  },
  {
    id: 'core-contracts',
    title: 'Governance contract',
    description:
      'Machine-readable schema defining what a valid .archon/ tree looks like. Consumed by the checker scripts and the CLI doctor command.',
    required: true,
    match: (p) => p.startsWith('.archon/contracts/'),
  },
  {
    id: 'core-templates',
    title: 'Runtime templates',
    description:
      'Templates for Run-State v2 and per-run state rows. Authored by the cognitive loop, consumed by the dashboard and claim verifier.',
    required: true,
    match: (p) => p.startsWith('.archon/templates/'),
  },
  {
    id: 'core-version',
    title: 'Version marker',
    description: 'Pinned framework version string.',
    required: true,
    match: (p) => p === '.archon/VERSION',
  },
  {
    id: 'domain-lenses',
    title: 'Domain lenses (pre-verdict lens index)',
    description:
      '5 lenses (dev / design / platform / ecosystem / capability) + 17 domain-specific decision tools. Used at the Decision Gate before committing to an implementation plan.',
    required: true,
    match: (p) => p.startsWith('.archon/domain-lenses/'),
  },
  {
    id: 'commands',
    title: 'Cursor commands',
    description:
      'Entry points (archon, archon-plan, archon-demand, archon-review, archon-dashboard) that route a user message into the governed lifecycle.',
    required: true,
    match: (p) => p.startsWith('.cursor/commands/'),
  },
  {
    id: 'agents',
    title: 'Cursor sub-agents',
    description:
      'Cross-family sub-agents for independence: archon-reviewer (cycle-level) and archon-capture-auditor (per-delivery hygiene).',
    required: true,
    match: (p) => p.startsWith('.cursor/agents/'),
  },
  {
    id: 'rules',
    title: 'Cursor rules (always-on)',
    description:
      'Rules that auto-load into every Cursor session on this project: archon.mdc, archon-wake.mdc, archon-heartbeat.mdc.',
    required: true,
    match: (p) => p.startsWith('.cursor/rules/'),
  },
  {
    id: 'skills-formwork',
    title: 'Formwork structural-guard skills (optional)',
    description:
      'Formwork (结构守卫) authoring skills — structural-guard, guard-from-incident, guard-ci-wiring, constraint-pruner. Portable SKILL.md assets (MIT, upstream github.com/EvoMap/formwork) for writing whole-repository invariant guards over an adopter\'s product code. Opt-in; the .archon/ governance core does not depend on them. See ADR-30.',
    required: false,
    // Placed BEFORE the generic `skills` module so first-match-wins routes these
    // four into the optional module instead of the required core skills bundle.
    match: (p) =>
      p === '.cursor/skills/structural-guard/SKILL.md' ||
      p === '.cursor/skills/guard-from-incident/SKILL.md' ||
      p === '.cursor/skills/guard-ci-wiring/SKILL.md' ||
      p === '.cursor/skills/constraint-pruner/SKILL.md',
  },
  {
    id: 'skills',
    title: 'Cursor skills',
    description:
      'Horizontal capabilities triggered by keywords / file types: framework primer, git-commit workflow, signs reasoning capsules, comic-doc refactor, blink dispatch, external-agent-patterns.',
    required: true,
    match: (p) => p.startsWith('.cursor/skills/'),
  },
  {
    id: 'scripts',
    title: 'Portable helper scripts',
    description:
      'Stdlib / zero-dep Python, Bash, and Node scripts (archon-check, archon-run-state, archon-records, archon-claim-verifier, export pipeline, migration helper).',
    required: true,
    match: (p) => p.startsWith('scripts/'),
  },
  {
    id: 'cli',
    title: 'Archon CLI (optional — agents usually do not need this)',
    description:
      'Human-facing wrapper (`archon init | update | sync | doctor | uninstall`). Agents typically call the agent-facing /install.md /update.md flows instead.',
    required: false,
    match: (p) => p.startsWith('tools/archon-cli/'),
  },
  {
    id: 'dashboard',
    title: 'Local observability dashboard (optional)',
    description:
      'Reference implementation of a local web UI that reads .archon/ ledgers. Adopters can fork, replace, or skip entirely.',
    required: false,
    match: (p) => p.startsWith('.archon/dashboard/'),
  },
  {
    id: 'extensions-demand-pool',
    title: 'Extension: demand-pool (optional)',
    description:
      'Lightweight backlog queue for pending demands before they enter a run. Reference implementation; use as a template when authoring other extensions.',
    required: false,
    match: (p) => p.startsWith('.archon/extensions/demand-pool/'),
  },
  {
    id: 'legal',
    title: 'License & attribution',
    description: 'Apache-2.0 LICENSE + NOTICE. Required to keep Archon redistribution compliant.',
    required: true,
    match: (p) => p === 'LICENSE' || p === 'NOTICE',
  },
]

async function walk(dir) {
  const out = []
  async function rec(current) {
    const entries = await fs.readdir(current, { withFileTypes: true })
    for (const e of entries) {
      const full = path.join(current, e.name)
      if (e.isDirectory()) await rec(full)
      else if (e.isFile()) out.push(full)
    }
  }
  await rec(dir)
  return out
}

function sha256(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex')
}

// Extract {{PLACEHOLDER}} tokens from file text. Only applies to text files; we
// skip binaries (none in source-files today, but defensive).
function extractPlaceholders(buf, relPath) {
  // Binary-ish extensions — skip placeholder scan.
  const ext = path.extname(relPath).toLowerCase()
  if (['.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.zip'].includes(ext)) {
    return []
  }
  const text = buf.toString('utf8')
  const set = new Set()
  const re = /\{\{\s*([A-Z][A-Z0-9_]*)\s*\}\}/g
  let m
  while ((m = re.exec(text)) !== null) {
    set.add(m[1])
  }
  return [...set].sort()
}

async function main() {
  const absFiles = await walk(SOURCE_ROOT)
  const entries = []
  for (const abs of absFiles) {
    const rel = path.relative(SOURCE_ROOT, abs).split(path.sep).join('/')
    if (AUTHOR_ONLY_FILES.has(rel)) continue // KNOWN-001: keep in source-files, exclude from manifest
    const buf = await fs.readFile(abs)
    entries.push({
      rel,
      buf,
      sha: sha256(buf),
      bytes: buf.length,
      placeholders: extractPlaceholders(buf, rel),
    })
  }
  entries.sort((a, b) => a.rel.localeCompare(b.rel))

  // Bucket into modules
  const bucket = new Map(MODULE_DEFS.map((m) => [m.id, []]))
  const miscModule = {
    id: 'misc',
    title: 'Miscellaneous',
    description: 'Files not matched by any other module.',
    required: false,
    match: () => true,
  }
  bucket.set('misc', [])

  for (const entry of entries) {
    const found = MODULE_DEFS.find((m) => m.match(entry.rel))
    const moduleId = found ? found.id : 'misc'
    bucket.get(moduleId).push(entry)
  }

  const version = (await fs.readFile(path.join(SOURCE_ROOT, '.archon', 'VERSION'), 'utf8')).trim()

  const allModules = [...MODULE_DEFS, miscModule]
  const modules = allModules
    .map((def) => {
      const files = bucket.get(def.id) ?? []
      if (files.length === 0) return null
      return {
        id: def.id,
        title: def.title,
        description: def.description,
        required: def.required,
        file_count: files.length,
        files: files.map((f) => ({
          path: f.rel,
          url: `${BASE_URL}/source-files/${f.rel}`,
          sha256: f.sha,
          bytes: f.bytes,
          ...(f.placeholders.length > 0 ? { placeholders: f.placeholders } : {}),
        })),
      }
    })
    .filter(Boolean)

  const totalFiles = modules.reduce((s, m) => s + m.file_count, 0)

  // Global placeholder catalogue — aggregate every placeholder found in any
  // file, so the agent knows what to ask the user up front.
  const placeholderCat = {
    PROJECT_NAME: {
      description: 'Human-readable project name, used in soul.md identity and manifest.md headers.',
      required: true,
      example: 'Acme Dashboard',
    },
    PROJECT_SLUG: {
      description: 'kebab-case slug derived from PROJECT_NAME.',
      required: false,
      derived_from: 'PROJECT_NAME',
      derivation: 'lowercase + non-alphanum → hyphen + collapse',
    },
    TECH_STACK: {
      description: 'One-line summary of primary tech stack (e.g. "React 19 + Vite + Supabase").',
      required: true,
      example: 'React 19 + Vite + Supabase',
    },
    DOMAIN: {
      description: 'Primary business / product domain one-liner.',
      required: false,
      example: 'Developer productivity tooling',
    },
    OWNER: {
      description: 'GitHub handle or name of the primary owner.',
      required: false,
      example: 'octocat',
    },
  }

  const allSeenPlaceholders = new Set()
  for (const m of modules) {
    for (const f of m.files) {
      for (const p of f.placeholders ?? []) allSeenPlaceholders.add(p)
    }
  }
  // Only publish definitions for placeholders that actually appear in at least
  // one file.
  const placeholders = {}
  for (const name of [...allSeenPlaceholders].sort()) {
    placeholders[name] = placeholderCat[name] ?? {
      description: `Placeholder ${name} (no catalogue entry — ask the user).`,
      required: false,
    }
  }

  const manifest = {
    schema: 'archon.manifest/v1',
    version,
    generated_at: new Date().toISOString(),
    base_url: BASE_URL,
    source_root: 'docs/source-files/',
    docs: {
      skill: `${BASE_URL}/skill.md`,
      install: `${BASE_URL}/install.md`,
      update: `${BASE_URL}/update.md`,
      sync: `${BASE_URL}/sync.md`,
      uninstall: `${BASE_URL}/uninstall.md`,
    },
    runtime_ledger_paths: {
      // Paths the agent MUST NOT overwrite during update. Owned by the adopter.
      files: [
        '.archon/debt.md',
        '.archon/drift.md',
        '.archon/manifest.md',
        '.archon/memos.md',
        '.archon/signs.md',
        '.archon/decisions.md',
      ],
      directories: [
        '.archon/debt/',
        '.archon/drift/',
        '.archon/memos/',
        '.archon/memos-archive/',
        '.archon/manifest/',
        '.archon/dashboard/heartbeats/',
        '.archon/runs/',
      ],
    },
    placeholders,
    totals: {
      modules: modules.length,
      files: totalFiles,
    },
    modules,
  }

  await fs.mkdir(path.dirname(OUTPUT), { recursive: true })
  await fs.writeFile(OUTPUT, JSON.stringify(manifest, null, 2) + '\n', 'utf8')
  console.log(
    `Wrote manifest: ${path.relative(REPO_ROOT, OUTPUT)}  —  version ${version}, ${modules.length} modules, ${totalFiles} files`,
  )

  // Also mirror every source file into docs/public/source-files/ so that
  // VitePress's build step publishes the raw bytes at the URL the manifest
  // advertises. (source-files/ itself is excluded from VitePress page
  // rendering via srcExclude, but that only prevents markdown-to-HTML
  // rendering — we still need the raw bytes at /source-files/*.)
  await mirrorSourceFilesToPublic(entries)
  console.log(`Mirrored ${entries.length} source files → ${path.relative(REPO_ROOT, PUBLIC_SOURCE_ROOT)}/`)

  // Distribution-boundary lint (KNOWN-010) — refuses to publish a manifest
  // whose source-files tree contains repo-only paths or unconditional
  // contract assertions that the manifest itself does not bundle.
  runLintDistribution()
}

function runLintDistribution() {
  const lintScript = path.join(REPO_ROOT, 'scripts', 'lint-distribution.mjs')
  const result = spawnSync(process.execPath, [lintScript], {
    cwd: REPO_ROOT,
    stdio: 'inherit',
  })
  if (result.status !== 0) {
    console.error(
      '\n[build-manifest] lint-distribution failed — refusing to publish a manifest with distribution-boundary violations.',
    )
    process.exit(result.status ?? 1)
  }
}

async function mirrorSourceFilesToPublic(entries) {
  // Clear existing mirror to avoid orphaned files.
  await fs.rm(PUBLIC_SOURCE_ROOT, { recursive: true, force: true })
  for (const e of entries) {
    const dst = path.join(PUBLIC_SOURCE_ROOT, e.rel)
    await fs.mkdir(path.dirname(dst), { recursive: true })
    await fs.writeFile(dst, e.buf)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
