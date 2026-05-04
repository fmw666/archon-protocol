#!/usr/bin/env node
import { existsSync } from 'node:fs'
import { mkdir, readFile, readdir, rm, writeFile, rename } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { execFileSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'

const ROOT = resolve(process.cwd())
const RUNS_DIR = resolve(ROOT, '.archon/runs')
const LEGACY_RUN = resolve(ROOT, '.archon/run.md')
const REQUIRED_STATUS = [
  'boot.soul_loaded',
  'boot.mode_extension_loaded',
  'boot.manifest_loaded',
  'prescan.memos_scanned',
  'prescan.archive_scanned',
  'prescan.adrs_scanned',
  'prescan.extensions_hooked',
  'decision.fastpath_assessed',
  'decision.convergence_classified',
  'decision.plan_mode_declared',
  'decision.verdict_output',
  'execute.changes_applied',
  'validate.validation_green',
  'closeout.manifest_synced',
  'closeout.subagent_dispatched',
  'closeout.auditor_ran',
  'closeout.auditor_processed',
  'closeout.drift_updated',
  'closeout.milestone_gate',
  'closeout.memos_appended',
  'closeout.extensions_hooked',
  'closeout.statement_output',
]

function usage() {
  return `Usage:
  node scripts/archon-run-state.mjs init --demand "<text>"
  node scripts/archon-run-state.mjs set <run-id> <status-key> <value>
  node scripts/archon-run-state.mjs set-many <run-id> <status-key>=<value> [...]
  node scripts/archon-run-state.mjs check [run-id]
  node scripts/archon-run-state.mjs resolve-for-commit
  node scripts/archon-run-state.mjs cleanup <run-id>
`
}

function git(args) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf-8' }).trim()
}

function currentBranch() {
  try {
    return git(['branch', '--show-current']) || 'detached'
  } catch {
    return 'unknown'
  }
}

function currentHead() {
  try {
    return git(['rev-parse', 'HEAD'])
  } catch {
    return 'unknown'
  }
}

function changedPaths() {
  try {
    const tracked = git(['diff', '--name-only', 'HEAD', '--'])
    const untracked = git(['ls-files', '--others', '--exclude-standard'])
    return `${tracked}\n${untracked}`
      .split(/\r?\n/)
      .map((line) => line.trim().replace(/\\/g, '/'))
      .filter(Boolean)
      .filter((path) => !path.startsWith('.archon/runs/'))
  } catch {
    return []
  }
}

function stagedPaths() {
  try {
    return git(['diff', '--cached', '--name-only', '--'])
      .split(/\r?\n/)
      .map((line) => line.trim().replace(/\\/g, '/'))
      .filter(Boolean)
      .filter((path) => !path.startsWith('.archon/runs/'))
  } catch {
    return []
  }
}

function statePath(runId) {
  return resolve(RUNS_DIR, runId, 'state.json')
}

function eventPath(runId) {
  return resolve(RUNS_DIR, runId, 'events.ndjson')
}

async function writeJsonAtomic(filePath, data) {
  await mkdir(dirname(filePath), { recursive: true })
  const tmpPath = `${filePath}.${process.pid}.tmp`
  await writeFile(tmpPath, `${JSON.stringify(data, null, 2)}\n`, 'utf-8')
  await rename(tmpPath, filePath)
}

async function appendEvent(runId, event) {
  const line = JSON.stringify({ at: new Date().toISOString(), ...event })
  await writeFile(eventPath(runId), `${line}\n`, { encoding: 'utf-8', flag: 'a' })
}

async function readState(runId) {
  return JSON.parse(await readFile(statePath(runId), 'utf-8'))
}

async function listRunIds() {
  if (!existsSync(RUNS_DIR)) return []
  const entries = await readdir(RUNS_DIR, { withFileTypes: true })
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name)
}

function emptyStatus() {
  return Object.fromEntries(REQUIRED_STATUS.map((key) => [key, '0']))
}

function isComplete(value) {
  return value === '1' || value === '2' || /^skip:[a-z0-9-]+$/.test(value)
}

function pendingKeys(state) {
  return REQUIRED_STATUS.filter((key) => !isComplete(state.status?.[key] ?? '0'))
}

function validateState(state) {
  const errors = []
  if (state.schemaVersion !== 2) errors.push('schemaVersion must be 2')
  for (const key of ['runId', 'demand', 'worktree', 'branch', 'baseHead', 'status']) {
    if (!(key in state)) errors.push(`missing ${key}`)
  }
  for (const key of REQUIRED_STATUS) {
    const value = state.status?.[key]
    if (typeof value !== 'string') {
      errors.push(`missing status ${key}`)
    } else if (!/^(?:0|1|2|skip:[a-z0-9-]+)$/.test(value)) {
      errors.push(`invalid status ${key}=${value}`)
    }
  }
  if (state.permitCommit === true && pendingKeys(state).length > 0) {
    errors.push(`permitCommit=true but pending keys remain: ${pendingKeys(state).slice(0, 5).join(', ')}`)
  }
  return errors
}

async function init(args) {
  const demandIndex = args.indexOf('--demand')
  const demand = demandIndex >= 0 ? args[demandIndex + 1] : ''
  if (!demand) throw new Error('init requires --demand "<text>"')
  const runId = `${new Date().toISOString().replace(/[-:]/g, '').replace(/\..+$/, 'Z')}-${randomUUID().slice(0, 8)}`
  const state = {
    schemaVersion: 2,
    runId,
    demand,
    mode: 'standard',
    startedAt: new Date().toISOString(),
    worktree: ROOT.replace(/\\/g, '/'),
    branch: currentBranch(),
    baseHead: currentHead(),
    status: emptyStatus(),
    changedPaths: [],
    permitCommit: false,
  }
  await writeJsonAtomic(statePath(runId), state)
  await appendEvent(runId, { type: 'init', demand })
  console.log(runId)
}

async function setStatus(args) {
  const [runId, key, value] = args
  if (!runId || !key || !value) throw new Error('set requires <run-id> <status-key> <value>')
  if (!REQUIRED_STATUS.includes(key)) throw new Error(`unknown status key: ${key}`)
  if (!/^(?:0|1|2|skip:[a-z0-9-]+)$/.test(value)) throw new Error(`invalid status value: ${value}`)
  const state = await readState(runId)
  state.status[key] = value
  state.changedPaths = changedPaths()
  state.permitCommit = pendingKeys(state).length === 0
  await writeJsonAtomic(statePath(runId), state)
  await appendEvent(runId, { type: 'set', key, value, permitCommit: state.permitCommit })
}

async function setMany(args) {
  const [runId, ...pairs] = args
  if (!runId || pairs.length === 0) throw new Error('set-many requires <run-id> <status-key>=<value> [...]')
  const updates = pairs.map((pair) => {
    const separatorIndex = pair.indexOf('=')
    if (separatorIndex <= 0) throw new Error(`invalid set-many pair: ${pair}`)
    const key = pair.slice(0, separatorIndex)
    const value = pair.slice(separatorIndex + 1)
    if (!REQUIRED_STATUS.includes(key)) throw new Error(`unknown status key: ${key}`)
    if (!/^(?:0|1|2|skip:[a-z0-9-]+)$/.test(value)) throw new Error(`invalid status value: ${value}`)
    return { key, value }
  })
  const state = await readState(runId)
  for (const { key, value } of updates) {
    state.status[key] = value
  }
  state.changedPaths = changedPaths()
  state.permitCommit = pendingKeys(state).length === 0
  await writeJsonAtomic(statePath(runId), state)
  await appendEvent(runId, { type: 'set-many', updates, permitCommit: state.permitCommit })
}

async function check(args) {
  const runIds = args[0] ? [args[0]] : await listRunIds()
  const errors = []
  for (const runId of runIds) {
    try {
      const state = await readState(runId)
      for (const error of validateState(state)) errors.push(`${runId}: ${error}`)
    } catch (error) {
      errors.push(`${runId}: ${error.message}`)
    }
  }
  if (errors.length > 0) throw new Error(errors.join('\n'))
  console.log(runIds.length === 0 ? '[archon-run-state] no v2 runs' : `[archon-run-state] OK: ${runIds.length} v2 run(s)`)
}

async function resolveForCommit() {
  const explicit = process.env.ARCHON_RUN_ID
  const runIds = explicit ? [explicit] : await listRunIds()
  const candidates = []
  const pending = []
  for (const runId of runIds) {
    const state = await readState(runId)
    const errors = validateState(state)
    if (errors.length > 0) throw new Error(`${runId}: ${errors.join('; ')}`)
    if (state.worktree !== ROOT.replace(/\\/g, '/')) continue
    if (state.permitCommit === true) {
      candidates.push(state)
    } else {
      pending.push({ runId, pending: pendingKeys(state).slice(0, 5) })
    }
  }
  if (explicit && candidates.length === 0) {
    const match = pending.find((item) => item.runId === explicit)
    if (match) {
      throw new Error(`v2 run ${explicit} is pending: ${match.pending.join(', ') || 'permitCommit=false'}`)
    }
    throw new Error(`ARCHON_RUN_ID=${explicit} did not resolve to a commit-ready v2 run`)
  }
  if (pending.length > 0) {
    throw new Error(
      `pending v2 run(s) block commit: ${pending
        .map((item) => `${item.runId}${item.pending.length > 0 ? ` (${item.pending.join(', ')})` : ''}`)
        .join(', ')}`,
    )
  }
  if (candidates.length === 0) {
    if (existsSync(LEGACY_RUN)) {
      console.log('[archon-run-state] no v2 commit candidate; legacy run.md gate remains authoritative')
      return
    }
    console.log('[archon-run-state] no active v2 run')
    return
  }
  if (candidates.length > 1) {
    throw new Error(
      `multiple v2 commit candidates: ${candidates.map((state) => state.runId).join(', ')}; set ARCHON_RUN_ID`,
    )
  }
  const staged = stagedPaths()
  if (staged.length > 0) {
    const allowed = new Set((candidates[0].changedPaths ?? []).map((path) => path.replace(/\\/g, '/')))
    const outsideRun = staged.filter((path) => !allowed.has(path))
    if (outsideRun.length > 0) {
      throw new Error(
        `staged paths outside v2 run ${candidates[0].runId}: ${outsideRun.slice(0, 10).join(', ')}`,
      )
    }
  }
  console.log(`[archon-run-state] commit candidate: ${candidates[0].runId}`)
}

async function cleanup(args) {
  const runId = args[0] || process.env.ARCHON_RUN_ID
  if (!runId) throw new Error('cleanup requires <run-id> or ARCHON_RUN_ID')
  await rm(resolve(RUNS_DIR, runId), { recursive: true, force: true })
  console.log(`[archon-run-state] cleaned ${runId}`)
}

async function main() {
  const [command, ...args] = process.argv.slice(2)
  if (!command || command === '--help' || command === '-h') {
    console.log(usage())
    return
  }
  if (command === 'init') return init(args)
  if (command === 'set') return setStatus(args)
  if (command === 'set-many') return setMany(args)
  if (command === 'check') return check(args)
  if (command === 'resolve-for-commit') return resolveForCommit()
  if (command === 'cleanup') return cleanup(args)
  throw new Error(`unknown command: ${command}\n${usage()}`)
}

main().catch((error) => {
  console.error(`[archon-run-state] FAIL: ${error.message}`)
  process.exitCode = 1
})
