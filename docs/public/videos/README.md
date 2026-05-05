# Sandbox test recordings — videos

This folder hosts MP4 recordings of the sandbox test scenarios. **It is
intentionally near-empty** — recordings are uploaded as scenarios mature.

## Naming convention

```
<test-id>.mp4           ← required
<test-id>.poster.png    ← optional, 1280×720 cover frame
```

`<test-id>` is the `test_id` front-matter value of the matching scenario
page under [`docs/testing/sandbox/scenarios/`](../../testing/sandbox/test-matrix). One mp4 per scenario.

## Recommended recording settings

| | |
|---|---|
| Resolution | 1920 × 1080 (or 2560 × 1440 max) |
| Frame rate | 30 fps |
| Codec | H.264 (mp4) |
| Duration | ≤ 90 s per scenario — trim setup/teardown |
| Audio | None (the scenario page is the narration) |
| Subtitles | None — paste the prompt + expected output as text in the scenario page instead |

## What to capture

1. The IDE chat panel with the **first prompt** typed but not yet sent.
2. The agent's response stream (especially placeholder collection +
   sha256 verification lines).
3. The final summary line / exit message.
4. (For `update` / `sync`) the diff of changed files.

Stop recording before any genuinely long pauses (npm install, cargo
build) — cut them to 1× speed text overlay rather than letting the video
run.

## Privacy

- Crop or blur any side panels showing personal repos, identifiers, or
  API keys before uploading.
- Use the sandbox fixture's simulated identity (`acme-todos` / `pyflux`
  / `goping` / `rustyq`) so nothing in the frame is real.

## How a scenario page consumes the file

The page renders the placeholder while the file is missing:

```md
<VideoPlaceholder test-id="install-cursor-node" />
```

When `videos/install-cursor-node.mp4` is uploaded, replace that line
with a normal HTML5 video tag:

```md
<video controls width="100%" poster="/videos/install-cursor-node.poster.png">
  <source src="/videos/install-cursor-node.mp4" type="video/mp4" />
</video>
```

The page's `status` front-matter must move from `pending` to `passing`
in the same commit that uploads the recording.

## Index of expected files

See [Test Matrix](../../testing/sandbox/test-matrix) for the full
`test-id` list; every row maps 1:1 to a file in this folder.
