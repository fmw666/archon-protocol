// scripts/sandbox/adapters/cli.mjs — drives lifecycle commands through the
// local Archon CLI (tools/archon-cli/bin/archon.mjs).
import path from 'node:path'
import { promises as fs } from 'node:fs'
import { captureCmd } from '../assertions.mjs'

export class CliAdapter {
  constructor({ repoRoot, baseUrl, manifestVersion }) {
    this.repoRoot = repoRoot
    this.baseUrl = baseUrl // may be a local file:// or http://127.0.0.1
    this.manifestVersion = manifestVersion
    this.bin = path.join(repoRoot, 'docs', 'source-files', 'tools', 'archon-cli', 'bin', 'archon.mjs')
  }

  async runStep(step, { projectRoot }) {
    if (step.append_to_file) {
      // { append_to_file: { path: "<rel>", content: "<text>" } }
      const target = path.join(projectRoot, step.append_to_file.path)
      await fs.appendFile(target, step.append_to_file.content)
      return { code: 0, stdout: `appended to ${step.append_to_file.path}`, stderr: '' }
    }
    if (step.write_file) {
      const target = path.join(projectRoot, step.write_file.path)
      await fs.mkdir(path.dirname(target), { recursive: true })
      await fs.writeFile(target, step.write_file.content)
      return { code: 0, stdout: `wrote ${step.write_file.path}`, stderr: '' }
    }
    if (step.cmd) {
      // Free-form command execution (e.g. `npm install`, `python3 ...`).
      return await captureCmd(step.cmd, { projectRoot, timeoutMs: step.timeout_ms || 180_000 })
    }
    if (step.cli) {
      return await this.archon(step.cli, projectRoot, step.flags || [])
    }
    throw new Error(`CliAdapter: unknown step shape: ${JSON.stringify(step)}`)
  }

  async archon(subcommand, projectRoot, extraFlags) {
    const cmd = [
      'node',
      this.bin,
      subcommand,
      projectRoot,
      '--yes',
      `--base-url=${this.baseUrl}`,
      ...extraFlags,
    ]
    return await captureCmd(cmd, { projectRoot, timeoutMs: 240_000 })
  }
}
