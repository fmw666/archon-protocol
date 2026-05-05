// scripts/sandbox/adapters/agent.mjs — drives lifecycle commands through a
// headless coding-agent SDK (Cursor / Claude Code / Codex CLI).
//
// First version: stub. We document the contract here so future work can drop
// in a real SDK adapter without changing the runner. If no API key is
// supplied via env vars, runs requested via this adapter are recorded as
// `result: "manual"` and the page makes that explicit.
//
// The contract:
//   - constructor receives { repoRoot, ide, manifestVersion, baseUrl }
//   - runStep(step, { projectRoot }) resolves to
//     { code: number, stdout: string, stderr: string, manual?: true }
//   - When manual === true the runner stops further steps for that scenario
//     and stamps the result as 'manual'.
//
// Env contract for future implementations:
//   ARCHON_AGENT_PROVIDER=cursor|claude|codex
//   ARCHON_AGENT_API_KEY=<provider-specific>
//   ARCHON_AGENT_MODEL=<optional>
import process from 'node:process'

export class AgentAdapter {
  constructor({ repoRoot, ide, manifestVersion, baseUrl }) {
    this.repoRoot = repoRoot
    this.ide = ide
    this.manifestVersion = manifestVersion
    this.baseUrl = baseUrl
    this.provider = process.env.ARCHON_AGENT_PROVIDER || null
    this.apiKey = process.env.ARCHON_AGENT_API_KEY || null
  }

  isAvailable() {
    return Boolean(this.provider && this.apiKey)
  }

  async runStep(step, { projectRoot }) {
    if (!this.isAvailable()) {
      return {
        code: 0,
        manual: true,
        stdout: `[agent-adapter] provider/key not set; scenario marked 'manual'.`,
        stderr: '',
      }
    }
    // Real SDK calls would dispatch on this.provider here. For now any
    // configured provider still falls back to manual until a concrete adapter
    // ships (tracked in KNOWN-ISSUES.md as KNOWN-003).
    return {
      code: 0,
      manual: true,
      stdout: `[agent-adapter] provider=${this.provider} configured but SDK adapter not yet implemented (see KNOWN-003).`,
      stderr: '',
    }
  }
}
