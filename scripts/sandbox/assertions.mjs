// scripts/sandbox/assertions.mjs — declarative checks against a tmp dir.
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { pathExists, sha256OfFile } from './shared.mjs'

export async function runAssertion(spec, ctx) {
  const name = describe(spec)
  try {
    const ok = await evaluate(spec, ctx)
    return { name, ok: ok === true, detail: ok === true ? null : String(ok) }
  } catch (err) {
    return { name, ok: false, detail: err.message }
  }
}

function describe(spec) {
  const k = Object.keys(spec)[0]
  const v = spec[k]
  if (typeof v === 'string') return `${k}: ${v}`
  return `${k}: ${JSON.stringify(v)}`
}

async function evaluate(spec, { projectRoot }) {
  const [op] = Object.keys(spec)
  const arg = spec[op]
  switch (op) {
    case 'file_exists':
      return (await pathExists(path.join(projectRoot, arg))) || `missing: ${arg}`
    case 'file_absent':
      return !(await pathExists(path.join(projectRoot, arg))) || `unexpectedly present: ${arg}`
    case 'dir_exists':
      return (await isDir(path.join(projectRoot, arg))) || `missing dir: ${arg}`
    case 'dir_absent':
      return !(await pathExists(path.join(projectRoot, arg))) || `unexpectedly present: ${arg}`
    case 'file_contains': {
      const p = path.join(projectRoot, arg.path)
      if (!(await pathExists(p))) return `missing file: ${arg.path}`
      const text = await fs.readFile(p, 'utf8')
      return text.includes(arg.substr) || `expected ${arg.path} to contain ${JSON.stringify(arg.substr)}`
    }
    case 'file_matches': {
      const p = path.join(projectRoot, arg.path)
      if (!(await pathExists(p))) return `missing file: ${arg.path}`
      const text = await fs.readFile(p, 'utf8')
      return new RegExp(arg.regex).test(text) || `regex /${arg.regex}/ no match in ${arg.path}`
    }
    case 'sha256_equals': {
      const p = path.join(projectRoot, arg.path)
      if (!(await pathExists(p))) return `missing file: ${arg.path}`
      const got = await sha256OfFile(p)
      return got === arg.sha256 || `sha256 mismatch ${arg.path}: expected ${arg.sha256.slice(0, 12)}…, got ${got.slice(0, 12)}…`
    }
    case 'cmd_zero':
      return await runCmdAndCheckExit(arg, { projectRoot, expect: 0 })
    case 'cmd_nonzero':
      return await runCmdAndCheckExit(arg, { projectRoot, expect: 'nonzero' })
    case 'git_clean': {
      const out = await captureCmd(['git', 'status', '--porcelain'], { projectRoot })
      return out.stdout.trim() === '' || `git status not clean:\n${out.stdout}`
    }
    default:
      throw new Error(`unknown assertion op: ${op}`)
  }
}

async function isDir(p) {
  try {
    const s = await fs.stat(p)
    return s.isDirectory()
  } catch {
    return false
  }
}

async function runCmdAndCheckExit(cmdArr, { projectRoot, expect }) {
  if (!Array.isArray(cmdArr)) throw new Error('cmd_zero / cmd_nonzero expects an array')
  const normalized = normalizeCmdForPlatform(cmdArr)
  const result = await captureCmd(normalized, { projectRoot })
  if (expect === 0) {
    return result.code === 0 || `cmd exited ${result.code}: ${normalized.join(' ')}\nstderr-tail: ${result.stderr.slice(-400)}`
  }
  return result.code !== 0 || `cmd unexpectedly exited 0: ${normalized.join(' ')}`
}

// Cross-platform shim for `python3`. On Windows the canonical entry-point is
// the `py` launcher (`py -3 …`); some Windows boxes do ship a `python3.exe`
// shim, but it's not guaranteed. Mirrors what install.md Step 8 documents.
function normalizeCmdForPlatform(cmdArr) {
  if (process.platform !== 'win32') return cmdArr
  if (cmdArr[0] !== 'python3') return cmdArr
  return ['py', '-3', ...cmdArr.slice(1)]
}

export function captureCmd(cmdArr, { projectRoot, env = {}, timeoutMs = 120_000 }) {
  return new Promise((resolve) => {
    const [cmd, ...args] = cmdArr
    const child = spawn(cmd, args, {
      cwd: projectRoot,
      env: { ...process.env, ...env },
      shell: process.platform === 'win32',
    })
    let stdout = ''
    let stderr = ''
    let timedOut = false
    const t = setTimeout(() => {
      timedOut = true
      child.kill('SIGKILL')
    }, timeoutMs)
    child.stdout.on('data', (d) => (stdout += d.toString()))
    child.stderr.on('data', (d) => (stderr += d.toString()))
    child.on('close', (code) => {
      clearTimeout(t)
      resolve({ code: timedOut ? 124 : code ?? 1, stdout, stderr, timedOut })
    })
    child.on('error', (err) => {
      clearTimeout(t)
      resolve({ code: 127, stdout, stderr: stderr + '\n' + err.message, timedOut: false })
    })
  })
}
