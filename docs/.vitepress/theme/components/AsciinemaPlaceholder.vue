<script setup lang="ts">
defineProps<{ testId: string }>()
</script>

<template>
  <figure class="vp-recording-placeholder vp-recording-placeholder--asciinema">
    <div class="vp-recording-placeholder__frame" role="img" :aria-label="`Asciinema placeholder for ${testId}`">
      <div class="vp-recording-placeholder__topbar">
        <span class="dot" aria-hidden="true"></span>
        <span class="dot" aria-hidden="true"></span>
        <span class="dot" aria-hidden="true"></span>
        <span class="vp-recording-placeholder__topbar-title">{{ testId }}.cast</span>
      </div>
      <pre class="vp-recording-placeholder__pre"><code>$ archon doctor .
[L1 Structural] OK
[L2 Contract]   OK
[L3 Hints]      OK
✔ Recording coming soon — placeholder</code></pre>
    </div>
    <figcaption>
      Will be replaced by <code>docs/public/asciinema/{{ testId }}.cast</code>
      embedded via the asciinema-player web component. See
      <a href="/asciinema-readme">asciinema/README</a> for the recording
      command.
    </figcaption>
  </figure>
</template>

<style scoped>
.vp-recording-placeholder {
  margin: 16px 0;
}

.vp-recording-placeholder__frame {
  width: 100%;
  background: #1e1e1e;
  color: #d4d4d4;
  border: 2px solid #000;
  box-shadow: 8px 8px 0 #000;
  font-family: ui-monospace, "SF Mono", Menlo, Monaco, Consolas, monospace;
}

.vp-recording-placeholder__topbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #2d2d2d;
  border-bottom: 1px solid #000;
}

.vp-recording-placeholder__topbar .dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #555;
}

.vp-recording-placeholder__topbar .dot:nth-child(1) { background: #ff5f57; }
.vp-recording-placeholder__topbar .dot:nth-child(2) { background: #febc2e; }
.vp-recording-placeholder__topbar .dot:nth-child(3) { background: #28c840; }

.vp-recording-placeholder__topbar-title {
  margin-left: auto;
  font-size: 12px;
  opacity: 0.7;
}

.vp-recording-placeholder__pre {
  margin: 0;
  padding: 16px;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  background: transparent;
}

.vp-recording-placeholder figcaption {
  margin-top: 8px;
  font-size: 13px;
  color: var(--vp-c-text-2);
}
</style>
