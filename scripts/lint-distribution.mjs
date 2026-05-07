#!/usr/bin/env node
// scripts/lint-distribution.mjs — author-vs-adopter distribution-boundary lint.
//
// Catches the recurring class of regressions where archon-protocol *repository*
// content (author-only docs, repo-self assertions, internal paths) leaks into
// the *distributed* surface that adopter projects receive via manifest.json.
//
// History this lint exists to prevent (rule of three + 1):
//   • KNOWN-001: tools/archon-cli is required by manifest yet author-only paths
//                referenced it.
//   • KNOWN-006: governance-contract.yaml hard-required docs/archon/* files
//                that are NEVER shipped to adopters.
//   • KNOWN-007: docs/source-files/NOTICE referenced docs/archon/** and
//                docs/images/archon/** sub-license declarations meaningful only
//                inside the source repository.
//   • KNOWN-009: export_manifest.required_files listed .husky/* / .cursor/hooks*
//                / .gitattributes that the manifest never bundles.
//
// Each prior fix was point-by-point. This lint refuses the entire class.
//
// Three checks, each with an explicit rationale shown on failure:
//
// (1) PATH DENY-LIST under docs/source-files/**:
//     No file may live at a path that is structurally author-only
//     (docs/archon/*, docs/images/archon/*, build-manifest.mjs, etc.).
//
// (2) FORBIDDEN TOKENS inside distributed text files:
//     Files under docs/source-files/** must not contain repo-only path
//     substrings (docs/archon/**, docs/images/archon/**, docs/source-files/).
//     Exception: governance-contract.yaml may reference them inside the
//     repo_self_check block (those rules only fire when the trigger path
//     exists, which never happens in adopter projects).
//
// (3) CONTRACT SYMMETRY:
//     Every path mentioned in governance-contract.yaml's mandatory-rule
//     blocks must either (a) be present in manifest.json under SOME module,
//     or (b) live inside an explicitly conditional block (repo_self_check.*,
//     forbidden_substrings.optional_files, universal_module_guard.optional_scan_paths,
//     run_state.required_static_checks[].optional==true).
//
// Usage:
//   node scripts/lint-distribution.mjs              # pretty output, exits non-zero on any violation
//   node scripts/lint-distribution.mjs --json       # machine-readable output

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '..')
const SOURCE_ROOT = path.join(REPO_ROOT, 'docs', 'source-files')
const MANIFEST_PATH = path.join(REPO_ROOT, 'docs', 'public', 'manifest.json')
const CONTRACT_PATH = path.join(SOURCE_ROOT, '.archon', 'contracts', 'governance-contract.yaml')

// Known-debt exemptions: paths that this lint *would* flag, but whose fix is
// tracked under a separate KNOWN-ISSUES entry. Each entry must cite the issue
// and the planned fix. Removing the path from this list once the issue closes
// will surface the violation again so we cannot accidentally drop the fix.
//
// IMPORTANT: only add to this list when the corresponding KNOWN-ISSUES entry
// exists and the fix is explicitly deferred — never to silence findings.
//
// Note: files kept under docs/source-files/ but excluded from manifest.json
// (see build-manifest.mjs::AUTHOR_ONLY_FILES) are skipped automatically by
// the `isDistributed` check; they don't need an entry here.
const EXEMPTIONS = []
const EXEMPT_PATHS = new Set(EXEMPTIONS.map((e) => e.path))

// Author-only path prefixes / patterns: must NOT exist under docs/source-files/.
// Each entry includes a rationale for the failure message.
const PATH_DENYLIST = [
  {
    pattern: /^docs\/archon(\/|$)/,
    rationale:
      'docs/archon/** is the archon-protocol VitePress site, not part of the adopter distribution. ' +
      'Files there must live at the repository root under docs/archon/, not under docs/source-files/.',
  },
  {
    pattern: /^docs\/images\/archon(\/|$)/,
    rationale:
      'docs/images/archon/** holds VitePress-site illustrations, not adopter content. ' +
      'Move them to docs/images/archon/ at the repo root.',
  },
  {
    pattern: /^scripts\/build-manifest\.mjs$/,
    rationale:
      'scripts/build-manifest.mjs is the author-only manifest builder; it must not be redistributed to adopter projects. ' +
      'Keep it at the repo root under scripts/.',
  },
  {
    pattern: /^scripts\/lint-distribution\.mjs$/,
    rationale:
      'scripts/lint-distribution.mjs is the author-only distribution lint (this file); not for adopters.',
  },
  {
    pattern: /^scripts\/(test-|export-)archon-/,
    rationale:
      'Author-only export / test scripts must live at the repo root under scripts/, not under docs/source-files/scripts/.',
  },
]

// Repo-only substrings that must not appear inside distributed text files.
// `allow` is a relative-path predicate granting the file a contextual exception
// for that specific token (used to allow governance-contract.yaml to mention
// docs/archon paths inside its repo_self_check block).
const TOKEN_DENYLIST = [
  {
    token: 'docs/archon/',
    rationale:
      'docs/archon/** is repo-only and absent from any adopter project; referencing it inside a distributed file produces dead links.',
    allow: (rel, content) => {
      if (rel === '.archon/contracts/governance-contract.yaml') {
        // The whole repo_self_check block is conditional, so mentions there are correct by design.
        return /"repo_self_check"\s*:/.test(content)
      }
      // The contract checker references docs/archon/* paths only inside the
      // _run_docs_self_check helper, which is called solely when the
      // docs/archon/ trigger path exists. Adopter projects never reach this
      // code path, so the literals here are dormant by design.
      if (rel === 'scripts/archon-check.py') return /_run_docs_self_check/.test(content)
      // Claim-verifier diffs against `'docs/archon/decisions.md'` resolve to
      // an empty diff in adopter projects (the path simply does not exist),
      // which is the desired graceful skip.
      if (rel === 'scripts/archon-claim-verifier.mjs') return true
      // archon-demand.md mentions docs/archon only inside the
      // governance-docs-mirror rule, which is explicitly framework-development-
      // only. The file MUST contain the disclaimer "adopter projects skip"
      // for the allowance to apply.
      if (rel === '.cursor/commands/archon-demand.md') {
        return /adopter projects skip|adopters never have this path/.test(content)
      }
      // archon.mdc lists docs/archon/* in its decoupling reference table only
      // when accompanied by an explicit "framework repo only" disclaimer per
      // row.
      if (rel === '.cursor/rules/archon.mdc') {
        // every occurrence of docs/archon must be on a line containing the
        // disclaimer
        const lines = content.split(/\r?\n/)
        return lines
          .filter((l) => l.includes('docs/archon'))
          .every((l) => l.includes('framework repo only'))
      }
      return false
    },
  },
  {
    token: 'docs/images/archon/',
    rationale: 'docs/images/archon/** is repo-only; adopters never receive it.',
    allow: () => false,
  },
  {
    token: 'docs/source-files/',
    rationale:
      'docs/source-files/ is the build-time source tree on the archon-protocol side; an adopter project has no such directory.',
    allow: (rel) => rel === '.archon/contracts/governance-contract.yaml',
  },
]

// Contract-symmetry helpers ------------------------------------------------

// Treat any of the following blocks as "explicitly conditional" — paths
// referenced from these blocks do not need to be present in manifest.json.
const CONDITIONAL_BLOCK_KEYS = new Set([
  'repo_self_check',
  'optional_files',
  'optional_scan_paths',
  'optional_critical_substrings',
])

function manifestPaths(manifest) {
  const out = new Set()
  for (const mod of manifest.modules ?? []) {
    for (const f of mod.files ?? []) out.add(f.path)
  }
  return out
}

// Recursively collect every {file: "...", ...} mention inside the contract
// payload, returning a list of { file, parents: [...keys] } so we can decide
// whether a given mention sits inside a conditional block.
function collectContractFileRefs(node, parents = [], out = []) {
  if (!node || typeof node !== 'object') return out
  if (Array.isArray(node)) {
    for (const item of node) collectContractFileRefs(item, parents, out)
    return out
  }
  // Plain object — check for {file: "<rel>"} and {optional: true}
  if (typeof node.file === 'string') {
    out.push({
      file: node.file,
      parents: parents.slice(),
      optional: node.optional === true,
    })
  }
  for (const [key, value] of Object.entries(node)) {
    collectContractFileRefs(value, [...parents, key], out)
  }
  return out
}

function collectContractRequiredFilePaths(node, parents = [], out = []) {
  if (!node || typeof node !== 'object') return out
  if (Array.isArray(node)) {
    for (const item of node) collectContractRequiredFilePaths(item, parents, out)
    return out
  }
  for (const [key, value] of Object.entries(node)) {
    if (key === 'required_files' && Array.isArray(value)) {
      for (const f of value) {
        if (typeof f === 'string') out.push({ file: f, parents: [...parents, key] })
      }
    } else {
      collectContractRequiredFilePaths(value, [...parents, key], out)
    }
  }
  return out
}

function isInsideConditionalBlock(parents) {
  return parents.some((p) => CONDITIONAL_BLOCK_KEYS.has(p))
}

// Walk docs/source-files and yield every { rel, abs } file.
async function walkSource(dir, baseDir, out = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  for (const e of entries) {
    const abs = path.join(dir, e.name)
    if (e.isDirectory()) {
      await walkSource(abs, baseDir, out)
    } else if (e.isFile()) {
      const rel = path.relative(baseDir, abs).split(path.sep).join('/')
      out.push({ rel, abs })
    }
  }
  return out
}

const TEXT_EXT = new Set([
  '.md', '.mdc', '.mjs', '.js', '.cjs', '.json', '.yaml', '.yml',
  '.py', '.sh', '.txt', '.ts', '.tsx', '.css', '.html', '.toml',
  '.rs', '.go', '',
])

function isTextish(rel) {
  return TEXT_EXT.has(path.extname(rel).toLowerCase())
}

async function main() {
  const args = new Set(process.argv.slice(2))
  const jsonOut = args.has('--json')

  const violations = []

  // Read manifest.json once: any source file not listed in any module is
  // author-only by construction and exempt from distribution-surface lints.
  const sourceFiles = await walkSource(SOURCE_ROOT, SOURCE_ROOT)
  let manifestForLint
  try {
    manifestForLint = JSON.parse(await fs.readFile(MANIFEST_PATH, 'utf8'))
  } catch {
    manifestForLint = null
  }
  const distributedPaths = manifestForLint
    ? manifestPaths(manifestForLint)
    : new Set(sourceFiles.map((f) => f.rel))
  const isDistributed = (rel) => distributedPaths.has(rel)

  // ------ Check (1): path deny-list ------
  for (const { rel } of sourceFiles) {
    if (EXEMPT_PATHS.has(rel)) continue
    if (!isDistributed(rel)) continue
    for (const rule of PATH_DENYLIST) {
      if (rule.pattern.test(rel)) {
        violations.push({
          check: 'path-denylist',
          file: `docs/source-files/${rel}`,
          rationale: rule.rationale,
        })
      }
    }
  }

  // ------ Check (2): forbidden tokens inside distributed files ------
  for (const { rel, abs } of sourceFiles) {
    if (EXEMPT_PATHS.has(rel)) continue
    if (!isDistributed(rel)) continue
    if (!isTextish(rel)) continue
    let content
    try {
      content = await fs.readFile(abs, 'utf8')
    } catch {
      continue
    }
    for (const rule of TOKEN_DENYLIST) {
      if (!content.includes(rule.token)) continue
      if (rule.allow(rel, content)) continue
      violations.push({
        check: 'token-denylist',
        file: `docs/source-files/${rel}`,
        token: rule.token,
        rationale: rule.rationale,
      })
    }
  }

  // ------ Check (3): contract symmetry ------
  const manifest = manifestForLint
  if (!manifest) {
    violations.push({
      check: 'contract-symmetry',
      file: 'docs/public/manifest.json',
      rationale: `Failed to read manifest.json (regen with \`node scripts/build-manifest.mjs\`).`,
    })
  }

  let contract
  try {
    // governance-contract.yaml is JSON-shaped (the file is JSON written under a .yaml extension).
    contract = JSON.parse(await fs.readFile(CONTRACT_PATH, 'utf8'))
  } catch (err) {
    violations.push({
      check: 'contract-symmetry',
      file: path.relative(REPO_ROOT, CONTRACT_PATH),
      rationale: `Failed to parse governance-contract.yaml: ${err.message}`,
    })
  }

  if (manifest && contract) {
    const inManifest = manifestPaths(manifest)
    const ledgerFiles = new Set(manifest.runtime_ledger_paths?.files ?? [])
    const ledgerDirs = manifest.runtime_ledger_paths?.directories ?? []
    const isLedgerPath = (p) => ledgerFiles.has(p) || ledgerDirs.some((d) => p.startsWith(d))
    const fileRefs = [
      ...collectContractFileRefs(contract),
      ...collectContractRequiredFilePaths(contract),
    ]
    for (const ref of fileRefs) {
      if (ref.optional) continue // run_state.required_static_checks[].optional===true
      if (isInsideConditionalBlock(ref.parents)) continue
      if (inManifest.has(ref.file)) continue
      // Adopter-owned runtime ledgers are seeded by install/sync, never by the
      // manifest itself, but always exist in a healthy adopter project.
      if (isLedgerPath(ref.file)) continue
      // Allow root-only paths the contract intentionally checks at adopter
      // root that are NOT in the manifest because they are adopter-managed
      // (e.g. .gitignore). Such paths must be opted in via `optional: true`,
      // which is the canonical way; if a hard reference reaches here, that's
      // the very class of regression this lint exists to catch.
      violations.push({
        check: 'contract-symmetry',
        file: ref.file,
        rationale:
          `governance-contract.yaml unconditionally requires ${ref.file}, but the manifest does not bundle it. ` +
          `Either add the file to a manifest module, or move the rule into a conditional block ` +
          `(repo_self_check.*, optional_files, optional_scan_paths, or mark with "optional": true). ` +
          `Parents: ${ref.parents.join(' → ')}`,
      })
    }
  }

  if (jsonOut) {
    process.stdout.write(JSON.stringify({ violations, exemptions: EXEMPTIONS }, null, 2) + '\n')
  } else if (violations.length === 0) {
    console.log(
      `[lint-distribution] OK: distribution boundary clean (0 violations, ${EXEMPTIONS.length} known-debt exemption(s) tracked).`,
    )
    if (EXEMPTIONS.length > 0) {
      for (const e of EXEMPTIONS) {
        console.log(`  • exempt: ${e.path}  (${e.issue}) — ${e.note}`)
      }
    }
  } else {
    console.error(`[lint-distribution] FAIL: ${violations.length} violation(s) found.\n`)
    for (const v of violations) {
      console.error(`  • [${v.check}] ${v.file}` + (v.token ? `  (token: ${v.token})` : ''))
      console.error(`    ${v.rationale}\n`)
    }
  }
  process.exit(violations.length === 0 ? 0 : 1)
}

main().catch((err) => {
  console.error(err)
  process.exit(2)
})
