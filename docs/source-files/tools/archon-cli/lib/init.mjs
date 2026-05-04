// lib/init.mjs — `archon init <target-dir>` is the friendly alias for
// `archon install <target-dir>`. Kept for backwards compatibility; the
// new canonical entry is `archon install`.
import { runInstall } from './install.mjs'

export async function runInit({ args }) {
  // Delegate to the install pipeline. `archon init` and `archon install` are
  // equivalent in the new manifest-driven world. The platform= flag that the
  // old init accepted is no longer meaningful (the canonical distribution
  // contains the `.cursor/` surface directly and is agent-family agnostic);
  // if the user passes --platform we ignore it with a one-line notice so we
  // don't silently change behaviour.
  console.log('[archon init] (alias for `archon install`)')
  if (args.some((a) => a.startsWith('--platform='))) {
    console.log('[archon init] note: --platform is deprecated; Archon ships a single canonical surface that works with Cursor today and with Claude Code / other agents via the same `.cursor/` + `.archon/` files.')
  }
  await runInstall({ args })
}
