// scripts/sandbox/adapters/providers/cursor.mjs
//
// Headless Cursor SDK provider for the sandbox runner. Wraps `@cursor/sdk`
// running in `local` mode so an `Agent.create()` call operates against the
// scenario's tmp project directory directly — no cloud VM, no PR side-effects.
//
// Reference: https://cursor.com/docs/sdk/typescript
//
// Contract used by the dispatcher (see ../agent.mjs):
//
//   provider.name              -> 'cursor'
//   provider.isAvailable()     -> { ok, reason? }   (sync, cheap)
//   provider.runStep(step, ctx)
//     ctx = { projectRoot, baseUrl, manifestVersion, ide }
//     step = { agent: 'install'|'update'|'sync'|'uninstall'|'boot',
//              prompt?: string, model?: string, timeout_ms?: number }
//     returns { code, stdout, stderr, manual?, toolEdits? }
//
// Failure modes (all degrade to manual=true so CI doesn't crash):
//   - SDK package not installed (optional dep)
//   - CURSOR_API_KEY not set
//   - Native sqlite3 binding missing (Windows without VS Build Tools)
//   - Any AuthenticationError / NetworkError surfaced as manual w/ message
//
// Only the runner cares about exit_code; we map RunResult.status:
//   'finished'  -> code=0
//   'cancelled' -> code=124 (mirrors timeout convention)
//   'error'     -> code=1
import process from 'node:process'

const DEFAULT_MODEL = process.env.ARCHON_AGENT_MODEL || 'composer-2'
const DEFAULT_TIMEOUT_MS = Number(process.env.ARCHON_AGENT_TIMEOUT_MS || 600_000) // 10 min

// Cached dynamic import (one attempt per process).
let sdkPromise = null
function loadSdk() {
  if (!sdkPromise) {
    sdkPromise = import('@cursor/sdk').then(
      (m) => ({ ok: true, sdk: m }),
      (err) => ({ ok: false, reason: friendlySdkLoadError(err) }),
    )
  }
  return sdkPromise
}

function friendlySdkLoadError(err) {
  const msg = String(err && (err.message || err))
  if (msg.includes('ERR_MODULE_NOT_FOUND') || msg.includes("Cannot find package '@cursor/sdk'")) {
    return '@cursor/sdk is not installed (optional dependency); run `npm install @cursor/sdk` to enable this provider.'
  }
  if (msg.includes('Could not locate the bindings file') && msg.includes('sqlite3')) {
    return 'native sqlite3 binding missing — install build tools or use a Linux/macOS host where the prebuilt binary is available.'
  }
  return `failed to load @cursor/sdk: ${msg}`
}

export const cursorProvider = {
  name: 'cursor',

  isAvailable() {
    if (!process.env.CURSOR_API_KEY) {
      return { ok: false, reason: 'CURSOR_API_KEY env var not set; obtain a key at https://cursor.com/dashboard/integrations' }
    }
    return { ok: true }
  },

  async runStep(step, ctx) {
    const avail = this.isAvailable()
    if (!avail.ok) return manualResult(avail.reason)

    const loaded = await loadSdk()
    if (!loaded.ok) return manualResult(loaded.reason)
    const { Agent, CursorAgentError } = loaded.sdk

    const prompt = buildPrompt(step, ctx)
    const model = { id: step.model || DEFAULT_MODEL }
    const timeoutMs = step.timeout_ms || DEFAULT_TIMEOUT_MS

    const toolEdits = []
    let agent = null
    let timer = null

    try {
      agent = await Agent.create({
        apiKey: process.env.CURSOR_API_KEY,
        model,
        local: {
          cwd: ctx.projectRoot,
          // Load .cursor/rules, .cursor/commands, .cursor/skills, .cursor/agents,
          // and .cursor/mcp.json from the fixture so Archon's repo-side configs
          // (e.g. archon-wake.mdc) reach the agent.
          settingSources: ['project'],
        },
      })

      const run = await agent.send(prompt)

      // Race run.wait() against a hard wall-clock timeout.
      const waitPromise = run.wait()
      const timeoutPromise = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`cursor agent timed out after ${timeoutMs}ms`)), timeoutMs)
      })

      // Drain stream concurrently to capture tool-call summary. tool_call events
      // fire twice per call (status='running' then 'completed'/'error') — only
      // record terminal states.
      let streamErr = null
      const streamPromise = (async () => {
        try {
          for await (const ev of run.stream()) {
            if (ev.type === 'tool_call' && ev.status && ev.status !== 'running') {
              toolEdits.push({ name: ev.name, status: ev.status })
            }
          }
        } catch (e) {
          streamErr = e
        }
      })()

      const result = await Promise.race([waitPromise, timeoutPromise])
      clearTimeout(timer)
      timer = null
      // Make sure stream drain doesn't dangle.
      await streamPromise.catch(() => {})

      if (streamErr) {
        // Not fatal — still report final status, just annotate stderr.
      }

      const stdout = result.result || ''
      const stderr = streamErr ? `stream-error: ${String(streamErr.message || streamErr)}` : ''
      const code = result.status === 'finished' ? 0 : result.status === 'cancelled' ? 124 : 1

      return { code, stdout, stderr, toolEdits }
    } catch (err) {
      if (timer) clearTimeout(timer)
      // CursorAgentError → degrade to manual with a structured reason so the
      // scenario doesn't hard-fail just because (e.g.) the API key is invalid.
      if (CursorAgentError && err instanceof CursorAgentError) {
        const tag = err.constructor.name + (err.code ? ` [${err.code}]` : '')
        return manualResult(`${tag}: ${err.message} (retryable=${Boolean(err.isRetryable)})`)
      }
      // Timeout: surface as failing (non-zero exit), not manual — the scenario
      // really did exceed its budget.
      if (String(err.message || '').includes('timed out')) {
        return { code: 124, stdout: '', stderr: err.message, toolEdits }
      }
      // Any other unknown loader error: degrade.
      return manualResult(`cursor provider error: ${err.message}`)
    } finally {
      // SDK exposes Symbol.asyncDispose; make sure we clean up even on errors.
      if (agent && typeof agent[Symbol.asyncDispose] === 'function') {
        try {
          await agent[Symbol.asyncDispose]()
        } catch {
          // Best effort.
        }
      }
    }
  },
}

function manualResult(reason) {
  return {
    code: 0,
    manual: true,
    stdout: `[cursor-provider] ${reason}`,
    stderr: '',
  }
}

// Map a structured `step.agent` directive to a natural-language prompt that
// matches Archon's user-facing trigger phrasing (see docs/install/*.md).
//
// The runner relies on the fixture being a fresh project copy; we just tell
// the agent what to do, exactly the way an end-user would in their IDE.
function buildPrompt(step, ctx) {
  if (step.prompt) return step.prompt

  const baseUrlNote = ctx.baseUrl
    ? `\n\nNote: For this sandbox run, fetch Archon source files from ${ctx.baseUrl} instead of the public CDN.`
    : ''

  switch (step.agent) {
    case 'install':
      return (
        'Read the install instructions at https://aaep.site/install/SKILL.md and ' +
        'install Archon into this project. Do not ask follow-up questions; if any ' +
        'choice is needed, pick the safe default. When done, briefly report which ' +
        'files were created under .archon/ and which IDE platform integration was ' +
        'set up.' +
        baseUrlNote
      )
    case 'update':
      return (
        'Read https://aaep.site/install/update.md and update Archon in this project ' +
        'to the latest manifest version. Preserve any local edits to .archon/ files. ' +
        'Briefly summarise which files were upgraded.' +
        baseUrlNote
      )
    case 'sync':
      return (
        'Read https://aaep.site/install/sync.md and verify the local Archon files ' +
        'against the canonical manifest. Report any drift and re-pin clean files. ' +
        'Do not modify files marked as customised by the user.' +
        baseUrlNote
      )
    case 'uninstall':
      return (
        'Read https://aaep.site/install/uninstall.md and uninstall Archon from this ' +
        'project. Use the "preserve" mode unless told otherwise: keep .archon/ but ' +
        'remove the IDE platform integration files and any helper tooling. Briefly ' +
        'list what was removed.' +
        baseUrlNote
      )
    case 'boot':
      return (
        'hi archon — please follow the wake protocol described in ' +
        '.cursor/rules/archon-wake.mdc and confirm you have loaded the soul, ' +
        'manifest, and command routing.'
      )
    default:
      return (
        step.agent
          ? `Run the Archon "${step.agent}" lifecycle command in this directory and report the outcome.`
          : 'Run the Archon command described in this scenario and report the outcome.'
      ) + baseUrlNote
  }
}
