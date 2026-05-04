#!/usr/bin/env node
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

import { runInit } from '../lib/init.mjs'
import { runInstall } from '../lib/install.mjs'
import { runUpdate } from '../lib/update.mjs'
import { runSync } from '../lib/sync.mjs'
import { runUninstall } from '../lib/uninstall.mjs'
import { runDoctor } from '../lib/doctor.mjs'
import { runExport } from '../lib/export.mjs'
import { readCliVersion } from '../lib/common.mjs'

const BIN_DIR = path.dirname(fileURLToPath(import.meta.url))
const CLI_ROOT = path.resolve(BIN_DIR, '..')

const SUBCOMMANDS = {
  install: runInstall,
  init: runInit, // alias for install
  update: runUpdate,
  sync: runSync,
  doctor: runDoctor,
  uninstall: runUninstall,
  export: runExport, // legacy: authoring-side standalone kit builder
}

function printHelp() {
  const version = readCliVersion(CLI_ROOT)
  console.log(`archon ${version} — governance kit CLI`)
  console.log('')
  console.log('Usage:')
  console.log('  archon <command> [args...]')
  console.log('')
  console.log('Lifecycle commands (consume https://aaep.site/manifest.json):')
  console.log('  install [target-dir]   Fresh install into a project')
  console.log('  update  [project-dir]  Upgrade an installed project to canonical')
  console.log('  sync    [project-dir]  Diff project vs canonical (read-only)')
  console.log('  doctor  [project-dir]  Full health check (structural + contract + canonical)')
  console.log('  uninstall [project-dir]  Remove Archon (preserve or archive ledgers)')
  console.log('')
  console.log('Aliases / legacy:')
  console.log('  init <target-dir>      Alias for `install <target-dir>`')
  console.log('  export <output-dir>    Build a standalone kit from a local Archon source checkout')
  console.log('')
  console.log('Shared flags:')
  console.log('  --base-url=<url>       Override manifest source (default: https://aaep.site)')
  console.log('  --with=<list|all|none> Comma-separated optional modules to include (install only)')
  console.log('  --yes, -y              Skip interactive prompts')
  console.log('  --force                Force re-install / re-verify (install, update)')
  console.log('  --dry-run              Print the plan without writing files')
  console.log('  --json                 Machine-readable output (sync only)')
  console.log('  --offline              Skip L4 canonical diff (doctor only)')
  console.log('  --archive-ledgers      Move runtime ledgers to .archon-history-<ts>/ (uninstall only)')
  console.log('  --delete-ledgers       Delete runtime ledgers (uninstall only, DESTRUCTIVE)')
  console.log('  --help, -h             Show this message')
  console.log('  --version, -v          Print CLI version')
  console.log('')
  console.log('Examples:')
  console.log('  archon install ./my-new-project --with=cli,dashboard')
  console.log('  archon update')
  console.log('  archon sync --json')
  console.log('  archon doctor')
  console.log('  archon uninstall --archive-ledgers')
}

async function main() {
  const [rawCmd, ...rest] = process.argv.slice(2)

  if (!rawCmd || rawCmd === '--help' || rawCmd === '-h') {
    printHelp()
    return
  }

  if (rawCmd === '--version' || rawCmd === '-v') {
    console.log(readCliVersion(CLI_ROOT))
    return
  }

  const handler = SUBCOMMANDS[rawCmd]
  if (!handler) {
    console.error(`[archon] Unknown command: ${rawCmd}`)
    console.error('[archon] Run `archon --help` for the command list.')
    process.exitCode = 1
    return
  }

  await handler({ args: rest, cliRoot: CLI_ROOT })
}

main().catch((error) => {
  console.error(`[archon] ${error.message}`)
  if (process.env.ARCHON_DEBUG) {
    console.error(error.stack)
  }
  process.exitCode = 1
})
