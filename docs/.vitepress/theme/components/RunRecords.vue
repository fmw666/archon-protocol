<script setup lang="ts">
import { computed } from 'vue'

// VitePress runs Vite under the hood; `import.meta.glob` with `eager: true`
// inlines every matching JSON at build time. This keeps the runs/ folder
// adjacent to the scenario pages (single source of truth) without requiring
// a separate /public/ copy.
const props = defineProps<{ testId: string }>()

const all = import.meta.glob('../../../testing/sandbox/runs/*/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, any>

const records = computed(() => {
  const out: Array<{ path: string; data: any }> = []
  for (const [p, data] of Object.entries(all)) {
    if (data && typeof data === 'object' && data.test_id === props.testId) {
      out.push({ path: p, data })
    }
  }
  out.sort((a, b) => (a.data.started_at < b.data.started_at ? 1 : -1))
  return out
})

function fmtDate(iso: string) {
  return iso.replace('T', ' ').replace(/\..*/, ' UTC')
}

function fmtDuration(ms: number) {
  if (ms < 1000) return `${ms} ms`
  return `${(ms / 1000).toFixed(2)} s`
}

function emoji(result: string) {
  if (result === 'passing') return '✅'
  if (result === 'failing') return '❌'
  if (result === 'manual') return '⏳'
  if (result === 'skipped') return '⏭'
  return '❔'
}

function recordHref(p: string) {
  // p looks like "../../../testing/sandbox/runs/install-cursor-node/<file>.json".
  const idx = p.indexOf('/runs/')
  return idx === -1 ? p : `https://github.com/fmw666/archon-protocol/blob/main/docs/testing/sandbox${p.slice(idx)}`
}
</script>

<template>
  <div class="run-records">
    <p v-if="records.length === 0" class="run-records-empty">
      <em>No runs recorded yet for <code>{{ testId }}</code>. Run
      <code>node scripts/sandbox-run.mjs --only={{ testId }}</code> to create
      the first record.</em>
    </p>
    <table v-else>
      <thead>
        <tr>
          <th>Started (UTC)</th>
          <th>Manifest</th>
          <th>Runner</th>
          <th>Result</th>
          <th>Duration</th>
          <th>Notes</th>
          <th>Record</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(rec, i) in records" :key="i">
          <td><code>{{ fmtDate(rec.data.started_at) }}</code></td>
          <td><code>{{ rec.data.manifest_version }}</code></td>
          <td>
            {{ rec.data.runner?.kind || '—' }}<template v-if="rec.data.runner?.provider"> <code class="prov">{{ rec.data.runner.provider }}</code></template>
          </td>
          <td>{{ emoji(rec.data.result) }} {{ rec.data.result }}</td>
          <td>{{ fmtDuration(rec.data.duration_ms) }}</td>
          <td>
            <span v-if="rec.data.notes" class="run-notes">{{ rec.data.notes }}</span>
            <span v-else>—</span>
          </td>
          <td>
            <a :href="recordHref(rec.path)" target="_blank" rel="noopener">JSON</a>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.run-records table {
  width: 100%;
  font-size: 0.85rem;
}
.run-records th {
  text-align: left;
  font-weight: 600;
}
.run-records-empty {
  border-left: 3px solid var(--vp-c-warning-1, #d97706);
  padding: 0.5rem 0.75rem;
  background: var(--vp-c-warning-soft, rgba(217, 119, 6, 0.1));
}
.run-notes {
  white-space: pre-wrap;
  font-family: var(--vp-font-family-mono);
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
}
.run-records code.prov {
  font-size: 0.75rem;
  opacity: 0.75;
  margin-left: 0.25rem;
}
</style>
