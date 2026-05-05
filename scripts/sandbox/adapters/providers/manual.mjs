// scripts/sandbox/adapters/providers/manual.mjs
//
// Fallback provider for IDE platforms whose headless SDK has not been wired
// into the sandbox runner yet. Always returns manual=true so the scenario is
// recorded as 'manual' rather than 'failing'.
//
// To replace this with a real provider in the future, follow the cursor.mjs
// shape (isAvailable + runStep) and register the new file in agent.mjs.

export function makeManualProvider(name) {
  return {
    name,
    isAvailable() {
      return { ok: false, reason: `no headless SDK provider implemented for "${name}" yet (see KNOWN-003)` }
    },
    async runStep(step) {
      return {
        code: 0,
        manual: true,
        stdout:
          `[manual-provider:${name}] no headless SDK adapter for this IDE platform; ` +
          `step "${step.agent || step.name || 'agent'}" must be performed by hand. ` +
          `Track progress in KNOWN-003.`,
        stderr: '',
      }
    },
  }
}
