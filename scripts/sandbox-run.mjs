#!/usr/bin/env node
// scripts/sandbox-run.mjs — execute one or more sandbox scenarios end-to-end
// and write structured run records under docs/testing/sandbox/runs/.
//
// Usage:
//   node scripts/sandbox-run.mjs                       # run every runnable scenario via CLI adapter
//   node scripts/sandbox-run.mjs --only=install-cursor-node
//   node scripts/sandbox-run.mjs --only=install-cursor-node,sync-clean
//   node scripts/sandbox-run.mjs --runnable=cli         # restrict to scenarios where runnable includes 'cli'
//   node scripts/sandbox-run.mjs --base-url=https://aaep.site   # use real CDN instead of local mirror
//   node scripts/sandbox-run.mjs --no-update-index      # skip rewriting runs/index.json
//
// Exit codes:
//   0 — every executed scenario produced result=passing OR result=manual (with notes)
//   1 — at least one scenario produced result=failing
//   2 — runner self-error (bad spec, missing fixture, etc.)
import { promises as fs } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import os from 'node:os'

import { listScenarios, readScenario } from './sandbox/scenarios.mjs'
import { runAssertion } from './sandbox/assertions.mjs'
import { CliAdapter } from './sandbox/adapters/cli.mjs'
import { AgentAdapter } from './sandbox/adapters/agent.mjs'
import { startStaticServer } from './sandbox/local-server.mjs'
import { buildRunRecord, writeRunRecord, updateRunsIndex } from './sandbox/results.mjs'
import { copyDir, makeTmpDir, rmrf, isoNow, durationMs, tail, pathExists } from './sandbox/shared.mjs'

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function parseArgs(argv) {
  const out = { only: null, runnable: 'cli', baseUrl: null, updateIndex: true, keepTmp: false, ci: null }
  for (const a of argv.slice(2)) {
    if (a === '--keep-tmp') out.keepTmp = true
    else if (a === '--no-update-index') out.updateIndex = false
    else if (a.startsWith('--only=')) out.only = a.slice('--only='.length).split(',').filter(Boolean)
    else if (a.startsWith('--runnable=')) out.runnable = a.slice('--runnable='.length)
    else if (a.startsWith('--base-url=')) out.baseUrl = a.slice('--base-url='.length)
    else if (a.startsWith('--ci=')) out.ci = a.slice('--ci='.length)
    else if (a === '--help' || a === '-h') {
      console.log(HELP)
      process.exit(0)
    }
  }
  return out
}

const HELP = `archon sandbox runner

Usage:
  node scripts/sandbox-run.mjs [flags]

Flags:
  --only=<id1,id2>     Run only the listed test_ids
  --runnable=<kind>    Filter by spec.runnable: cli (default) | agent | both | any
  --base-url=<url>     Override Archon source URL (default: local mirror of docs/public/)
  --keep-tmp           Don't delete the tmp project dir on success
  --no-update-index    Skip rewriting runs/index.json
  --ci=<url>           Record CI run URL into the result JSON
  --help, -h           Show this help`

async function main() {
  const opts = parseArgs(process.argv)

  const scenarios = await collectScenarios(opts)
  if (scenarios.length === 0) {
    console.error('[sandbox-runner] no scenarios matched the filter.')
    process.exit(2)
  }

  console.log(`[sandbox-runner] selected ${scenarios.length} scenario(s)`)

  // Spin up local mirror unless caller overrode the base URL.
  let server = null
  let baseUrl = opts.baseUrl
  if (!baseUrl) {
    server = await startStaticServer({ rootDir: REPO_ROOT })
    baseUrl = server.baseUrl
    console.log(`[sandbox-runner] local mirror at ${baseUrl}`)
  }

  const manifestVersion = await readManifestVersion(REPO_ROOT)
  console.log(`[sandbox-runner] manifest version under test: v${manifestVersion}`)

  const runsDir = path.join(REPO_ROOT, 'docs', 'testing', 'sandbox', 'runs')
  await fs.mkdir(runsDir, { recursive: true })

  let failingCount = 0
  let manualCount = 0
  let passingCount = 0

  for (const scenario of scenarios) {
    const record = await runOneScenario(scenario, { baseUrl, manifestVersion, ciUrl: opts.ci, keepTmp: opts.keepTmp })
    await writeRunRecord({ runsDir, record })
    if (record.result === 'failing') failingCount++
    else if (record.result === 'manual') manualCount++
    else if (record.result === 'passing') passingCount++

    const icon = record.result === 'passing' ? '\u2705' : record.result === 'failing' ? '\u274c' : '\u23f3'
    console.log(`[sandbox-runner] ${icon} ${record.test_id} — ${record.result} (${record.duration_ms} ms)`)
  }

  if (opts.updateIndex) {
    await updateRunsIndex({ runsDir })
    console.log('[sandbox-runner] runs/index.json updated.')
  }

  if (server) await server.close()

  console.log('')
  console.log(`[sandbox-runner] summary: ${passingCount} passing · ${failingCount} failing · ${manualCount} manual`)
  process.exitCode = failingCount > 0 ? 1 : 0
}

async function collectScenarios(opts) {
  const all = await listScenarios(REPO_ROOT)
  const out = []
  for (const file of all) {
    const sc = await readScenario(file)
    if (opts.only && !opts.only.includes(sc.frontmatter.test_id)) continue
    const runnable = (sc.spec && sc.spec.runnable) || 'manual'
    if (opts.runnable !== 'any') {
      if (opts.runnable === 'cli' && runnable !== 'cli' && runnable !== 'both') continue
      if (opts.runnable === 'agent' && runnable !== 'agent' && runnable !== 'both') continue
      if (opts.runnable === 'both' && runnable !== 'both') continue
    }
    out.push(sc)
  }
  return out
}

async function runOneScenario(scenario, { baseUrl, manifestVersion, ciUrl, keepTmp }) {
  const startedAt = isoNow()
  const startMs = Date.now()
  const testId = scenario.frontmatter.test_id || path.basename(scenario.file, '.md')
  const fixture = scenario.spec.fixture || scenario.frontmatter.fixture
  const idePlatform = scenario.spec.ide_platform || 'cursor'
  const runnable = scenario.spec.runnable || 'manual'

  const stepsRun = []
  const assertionsRun = []
  let result = 'failing'
  let notes = null
  let lastProvider = null

  let projectRoot = null
  try {
    if (!fixture) throw new Error(`scenario ${testId} missing fixture`)
    const fixturePath = path.resolve(REPO_ROOT, fixture)
    if (!(await pathExists(fixturePath))) throw new Error(`fixture not found: ${fixturePath}`)

    projectRoot = await makeTmpDir(testId)
    await copyDir(fixturePath, projectRoot)
    stepsRun.push({ name: 'copy fixture', exit_code: 0, duration_ms: durationMs(startMs) })

    // Pre-run prerequisites — install Archon if the scenario stage is not 'install'.
    const prereqs = scenario.spec.prerequisites || []
    for (const prereq of prereqs) {
      const pStart = Date.now()
      const adapter = new CliAdapter({ repoRoot: REPO_ROOT, baseUrl, manifestVersion })
      const r = await adapter.runStep(prereq, { projectRoot })
      stepsRun.push({
        name: `prereq: ${stepName(prereq)}`,
        exit_code: r.code,
        duration_ms: durationMs(pStart),
        stdout_tail: tail(r.stdout, 30),
        stderr_tail: tail(r.stderr, 30),
      })
      if (r.code !== 0) throw new Error(`prereq failed: ${stepName(prereq)} exit ${r.code}`)
    }

    // Main steps.
    const adapter =
      runnable === 'agent' || runnable === 'both'
        ? new AgentAdapter({ repoRoot: REPO_ROOT, ide: idePlatform, manifestVersion, baseUrl })
        : new CliAdapter({ repoRoot: REPO_ROOT, baseUrl, manifestVersion })

    let manualEncountered = false
    for (const step of scenario.spec.steps || []) {
      const sStart = Date.now()
      const r = await adapter.runStep(step, { projectRoot })
      if (r.provider) lastProvider = r.provider
      stepsRun.push({
        name: stepName(step),
        exit_code: r.code,
        duration_ms: durationMs(sStart),
        stdout_tail: tail(r.stdout, 30),
        stderr_tail: tail(r.stderr, 30),
        manual: r.manual === true,
        provider: r.provider || null,
        tool_edits: Array.isArray(r.toolEdits) ? r.toolEdits : null,
      })
      if (r.manual) {
        manualEncountered = true
        notes = (notes ? notes + ' ' : '') + (r.stdout || '').trim()
        break
      }
      if (r.code !== 0 && step.allow_nonzero !== true) {
        throw new Error(`step "${stepName(step)}" exit ${r.code}`)
      }
    }

    if (manualEncountered) {
      result = 'manual'
    } else {
      // Assertions.
      for (const aSpec of scenario.spec.assertions || []) {
        const a = await runAssertion(aSpec, { projectRoot })
        assertionsRun.push(a)
      }
      const allOk = assertionsRun.every((a) => a.ok)
      result = allOk ? 'passing' : 'failing'
      if (!allOk) {
        const fails = assertionsRun.filter((a) => !a.ok).map((a) => `${a.name}: ${a.detail}`)
        notes = `failed assertions:\n  ${fails.join('\n  ')}`
      }
    }
  } catch (err) {
    result = 'failing'
    notes = err.message
  } finally {
    if (projectRoot && !keepTmp && result !== 'failing') {
      await rmrf(projectRoot).catch(() => {})
    } else if (projectRoot && (result === 'failing' || keepTmp)) {
      console.log(`[sandbox-runner] (${testId}) tmp project preserved at ${projectRoot}`)
    }
  }

  const finishedAt = isoNow()
  return buildRunRecord({
    testId,
    startedAt,
    finishedAt,
    durationMs: Date.now() - startMs,
    manifestVersion: `v${manifestVersion}`,
    runnerKind: result === 'manual' ? 'manual' : runnable === 'agent' ? 'agent' : 'cli',
    runnerVersion: 'sandbox-runner/0.1.0',
    runnerProvider: runnable === 'agent' || runnable === 'both' ? lastProvider : null,
    host: `${os.platform()} ${os.arch()} node ${process.version}`,
    fixture,
    idePlatform,
    result,
    steps: stepsRun,
    assertions: assertionsRun,
    notes,
    ciRun: ciUrl ? { platform: 'github-actions', url: ciUrl } : null,
  })
}

function stepName(step) {
  if (step.name) return step.name
  if (step.cli) return `archon ${step.cli}${step.flags ? ' ' + step.flags.join(' ') : ''}`
  if (step.cmd) return step.cmd.join(' ')
  return JSON.stringify(step)
}

async function readManifestVersion(repoRoot) {
  const m = JSON.parse(await fs.readFile(path.join(repoRoot, 'docs', 'public', 'manifest.json'), 'utf8'))
  return m.version
}

main().catch((err) => {
  console.error('[sandbox-runner] fatal:', err.message)
  console.error(err.stack)
  process.exit(2)
})
