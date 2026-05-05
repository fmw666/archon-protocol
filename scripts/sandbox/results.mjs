// scripts/sandbox/results.mjs — write per-run JSON and update runs/index.json.
import { promises as fs } from 'node:fs'
import path from 'node:path'

const SCHEMA = 'archon.sandbox-run/v1'

export function buildRunRecord({
  testId,
  startedAt,
  finishedAt,
  durationMs,
  manifestVersion,
  runnerKind,
  runnerVersion,
  runnerProvider,
  host,
  fixture,
  idePlatform,
  result,
  steps,
  assertions,
  notes,
  ciRun,
}) {
  return {
    schema: SCHEMA,
    test_id: testId,
    started_at: startedAt,
    finished_at: finishedAt,
    duration_ms: durationMs,
    manifest_version: manifestVersion,
    runner: {
      kind: runnerKind,
      version: runnerVersion,
      host,
      provider: runnerProvider || null,
    },
    fixture,
    ide_platform: idePlatform,
    result, // passing | failing | skipped | manual
    steps,
    assertions,
    notes: notes || null,
    ci_run: ciRun || null,
  }
}

export async function writeRunRecord({ runsDir, record }) {
  const perTestDir = path.join(runsDir, record.test_id)
  await fs.mkdir(perTestDir, { recursive: true })
  const fname = `${record.started_at.replace(/[:.]/g, '-')}.json`
  const fullPath = path.join(perTestDir, fname)
  await fs.writeFile(fullPath, JSON.stringify(record, null, 2) + '\n')
  return fullPath
}

export async function updateRunsIndex({ runsDir }) {
  const index = { schema: 'archon.sandbox-runs-index/v1', generated_at: new Date().toISOString(), latest: {} }
  const entries = await fs.readdir(runsDir, { withFileTypes: true })
  for (const ent of entries) {
    if (!ent.isDirectory()) continue
    const testId = ent.name
    const perDir = path.join(runsDir, testId)
    const files = (await fs.readdir(perDir)).filter((f) => f.endsWith('.json')).sort()
    if (files.length === 0) continue
    const newest = files[files.length - 1]
    const data = JSON.parse(await fs.readFile(path.join(perDir, newest), 'utf8'))
    index.latest[testId] = {
      started_at: data.started_at,
      manifest_version: data.manifest_version,
      result: data.result,
      runner_kind: data.runner?.kind || 'unknown',
      runner_provider: data.runner?.provider || null,
      duration_ms: data.duration_ms,
      record_path: `runs/${testId}/${newest}`,
    }
  }
  await fs.writeFile(path.join(runsDir, 'index.json'), JSON.stringify(index, null, 2) + '\n')
  return index
}
