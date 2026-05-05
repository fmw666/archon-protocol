<script setup lang="ts">
defineProps<{ testId: string }>()
</script>

<template>
  <figure class="vp-recording-placeholder vp-recording-placeholder--video">
    <div class="vp-recording-placeholder__frame" role="img" :aria-label="`Recording placeholder for ${testId}`">
      <span class="vp-recording-placeholder__icon" aria-hidden="true">🎬</span>
      <span class="vp-recording-placeholder__title">Recording coming soon</span>
      <code class="vp-recording-placeholder__id">{{ testId }}.mp4</code>
      <span class="vp-recording-placeholder__hint">IDE chat-panel walkthrough</span>
    </div>
    <figcaption>
      Will be replaced by <code>docs/public/videos/{{ testId }}.mp4</code>
      once recorded. See
      <a href="/videos-readme">videos/README</a> for upload conventions.
    </figcaption>
  </figure>
</template>

<style scoped>
.vp-recording-placeholder {
  margin: 16px 0;
}

.vp-recording-placeholder__frame {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
  color: #fff;
  border: 2px solid #000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  box-shadow: 8px 8px 0 #000;
}

.vp-recording-placeholder__icon {
  font-size: 48px;
  line-height: 1;
}

.vp-recording-placeholder__title {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.vp-recording-placeholder__id {
  font-family: ui-monospace, "SF Mono", Menlo, Monaco, Consolas, monospace;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.1);
  padding: 4px 10px;
  border: 1px solid rgba(255, 255, 255, 0.4);
}

.vp-recording-placeholder__hint {
  font-size: 12px;
  opacity: 0.7;
  letter-spacing: 0.05em;
}

.vp-recording-placeholder figcaption {
  margin-top: 8px;
  font-size: 13px;
  color: var(--vp-c-text-2);
}
</style>
