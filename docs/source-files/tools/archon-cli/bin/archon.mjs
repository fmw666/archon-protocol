#!/usr/bin/env node
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

import { runInit } from '../lib/init.mjs'
import { runDoctor } from '../lib/doctor.mjs'
import { runExport } from '../lib/export.mjs'
import { readCliVersion } from '../lib/common.mjs'

const BIN_DIR = path.dirname(fileURLToPath(import.meta.url))
const CLI_ROOT = path.resolve(BIN_DIR, '..')

const SUBCOMMANDS = {
  init: runInit,
  doctor: runDoctor,
  export: runExport,
}

function printHelp() {
  const version = readCliVersion(CLI_ROOT)
  console.log(`archon ${version} — governance kit CLI`)
  console.log('')
  console.log('Usage:')
  console.log('  archon <command> [args...]')
  console.log('')
  console.log('Commands:')
  console.log('  init <target-dir>       Scaffold Archon governance into a target project')
  console.log('  doctor [project-dir]    Audit an Archon-governed project for contract violations')
  console.log('  export <output-dir>     Export a standalone Archon kit from the current repo')
  console.log('')
  console.log('Flags (shared):')
  console.log('  --platform=<cursor|claude-code>   Platform target (default: cursor)')
  console.log('  --overwrite                        Replace existing output directory')
  console.log('  --dry-run                          Print the plan without writing files')
  console.log('  --help, -h                         Show this message')
  console.log('  --version, -v                      Print CLI version')
  console.log('')
  console.log('Examples:')
  console.log('  archon init ./my-new-project --platform=cursor')
  console.log('  archon doctor .')
  console.log('  archon export ./archon-kit --platform=claude-code --overwrite')
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
