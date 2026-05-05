// scripts/sandbox/adapters/agent.mjs — drives lifecycle commands through a
// headless coding-agent SDK.
//
// This file is a thin dispatcher: it picks a provider based on the scenario's
// `ide_platform`, and forwards `runStep` to it. Each provider lives under
// `./providers/<name>.mjs` and conforms to:
//
//   {
//     name,
//     isAvailable() -> { ok, reason? },
//     runStep(step, ctx) -> { code, stdout, stderr, manual?, toolEdits? }
//   }
//
// Currently registered:
//   - cursor → ./providers/cursor.mjs (real, uses @cursor/sdk)
//   - claude → manual fallback (no headless SDK adapter yet)
//   - codex  → manual fallback
//   - aider  → manual fallback
//   - <any>  → manual fallback
//
// Override via env var ARCHON_AGENT_PROVIDER=<name> (e.g. force cursor for a
// scenario whose ide_platform is set to a different value during local dev).
import process from 'node:process'

import { cursorProvider } from './providers/cursor.mjs'
import { makeManualProvider } from './providers/manual.mjs'

const REGISTRY = {
  cursor: cursorProvider,
  // Future slots (currently manual fallbacks):
  claude: makeManualProvider('claude'),
  codex: makeManualProvider('codex'),
  aider: makeManualProvider('aider'),
}

function pickProvider(ide) {
  const override = process.env.ARCHON_AGENT_PROVIDER
  const key = (override || ide || 'cursor').toLowerCase()
  return REGISTRY[key] || makeManualProvider(key)
}

export class AgentAdapter {
  constructor({ repoRoot, ide, manifestVersion, baseUrl }) {
    this.repoRoot = repoRoot
    this.ide = ide
    this.manifestVersion = manifestVersion
    this.baseUrl = baseUrl
    this.provider = pickProvider(ide)
  }

  isAvailable() {
    return this.provider.isAvailable()
  }

  async runStep(step, { projectRoot }) {
    const ctx = {
      projectRoot,
      baseUrl: this.baseUrl,
      manifestVersion: this.manifestVersion,
      ide: this.ide,
    }
    const result = await this.provider.runStep(step, ctx)
    // Tag the result with which provider produced it (useful in step logs).
    return { ...result, provider: this.provider.name }
  }
}
