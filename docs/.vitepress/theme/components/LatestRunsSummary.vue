<script setup lang="ts">
import { computed } from 'vue'

// Inline runs/index.json at build time. The runner regenerates this file on
// every invocation; VitePress will pick up the latest values on the next
// build / dev hot-reload.
import indexData from '../../../testing/sandbox/runs/index.json'

type LatestRow = {
  started_at: string
  manifest_version: string
  result: 'passing' | 'failing' | 'manual' | 'skipped'
  runner_kind: string
  duration_ms: number
  record_path: string
}

const SCENARIO_ORDER = [
  'install-cursor-node',
  'install-claude-python',
  'install-codex-go',
  'install-aider-rust',
  'boot-cursor-node',
  'boot-claude-python',
  'update-cursor-node',
  'update-cli-without-cli',
  'sync-clean',
  'sync-modified',
  'uninstall-preserve',
  'uninstall-archive',
]

const STAGE_OF: Record<string, string> = {
  'install-cursor-node': 'install',
  'install-claude-python': 'install',
  'install-codex-go': 'install',
  'install-aider-rust': 'install',
  'boot-cursor-node': 'boot',
  'boot-claude-python': 'boot',
  'update-cursor-node': 'update',
  'update-cli-without-cli': 'update',
  'sync-clean': 'sync',
  'sync-modified': 'sync',
  'uninstall-preserve': 'uninstall',
  'uninstall-archive': 'uninstall',
}

const latest = (indexData as any).latest || {}
const generatedAt = (indexData as any).generated_at || null

const rows = computed(() => {
  return SCENARIO_ORDER.map((id) => {
    const r = latest[id] as LatestRow | undefined
    return {
      id,
      stage: STAGE_OF[id] || '—',
      ...(r || null),
    }
  })
})

const counts = computed(() => {
  const c = { passing: 0, failing: 0, manual: 0, skipped: 0, pending: 0 }
  for (const id of SCENARIO_ORDER) {
    const r = latest[id]
    if (!r) c.pending++
    else c[r.result as keyof typeof c]++
  }
  return c
})

function fmtDate(iso?: string) {
  if (!iso) return '—'
  return iso.replace('T', ' ').replace(/\..*/, '')
}

function emoji(result?: string) {
  if (result === 'passing') return '✅'
  if (result === 'failing') return '❌'
  if (result === 'manual') return '⏳'
  if (result === 'skipped') return '⏭'
  return '·'
}

function fmtDuration(ms?: number) {
  if (ms == null) return '—'
  if (ms < 1000) return `${ms} ms`
  return `${(ms / 1000).toFixed(2)} s`
}
</script>

<template>
  <div class="latest-runs-summary">
    <p class="lrs-meta">
      <strong>Index generated:</strong>
      <code v-if="generatedAt">{{ fmtDate(generatedAt) }} UTC</code>
      <code v-else>never</code>
      &nbsp;·&nbsp;
      <strong>{{ counts.passing }}</strong> passing
      &nbsp;·&nbsp;
      <strong>{{ counts.failing }}</strong> failing
      &nbsp;·&nbsp;
      <strong>{{ counts.manual }}</strong> manual
      <template v-if="counts.pending > 0">
        &nbsp;·&nbsp;
        <strong>{{ counts.pending }}</strong> pending
      </template>
    </p>
    <table>
      <thead>
        <tr>
          <th>Scenario</th>
          <th>Stage</th>
          <th>Latest result</th>
          <th>Manifest</th>
          <th>Runner</th>
          <th>Duration</th>
          <th>Recorded</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.id">
          <td>
            <a :href="`/testing/sandbox/scenarios/${row.id}`">{{ row.id }}</a>
          </td>
          <td><code>{{ row.stage }}</code></td>
          <td>
            <template v-if="row.result">
              {{ emoji(row.result) }} {{ row.result }}
            </template>
            <em v-else>· pending</em>
          </td>
          <td>
            <code v-if="row.manifest_version">{{ row.manifest_version }}</code>
            <span v-else>—</span>
          </td>
          <td>{{ row.runner_kind || '—' }}</td>
          <td>{{ fmtDuration(row.duration_ms) }}</td>
          <td><code>{{ fmtDate(row.started_at) }}</code></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.latest-runs-summary table {
  width: 100%;
  font-size: 0.85rem;
}
.latest-runs-summary th {
  text-align: left;
  font-weight: 600;
}
.lrs-meta {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  margin-bottom: 0.75rem;
}
</style>
