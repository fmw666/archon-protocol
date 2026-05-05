// scripts/sandbox/shared.mjs — common helpers for the sandbox runner.
import { promises as fs } from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'

export function isoStamp() {
  return new Date().toISOString().replace(/[:.]/g, '-')
}

export function isoNow() {
  return new Date().toISOString()
}

export async function makeTmpDir(prefix) {
  const base = path.join(os.tmpdir(), `archon-sandbox-${prefix}-${isoStamp()}`)
  await fs.mkdir(base, { recursive: true })
  return base
}

export async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true })
  for (const entry of await fs.readdir(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath)
    } else if (entry.isFile()) {
      await fs.copyFile(srcPath, destPath)
    }
  }
}

export async function rmrf(target) {
  await fs.rm(target, { recursive: true, force: true })
}

export async function pathExists(p) {
  try {
    await fs.access(p)
    return true
  } catch {
    return false
  }
}

export async function sha256OfFile(p) {
  const data = await fs.readFile(p)
  return crypto.createHash('sha256').update(data).digest('hex')
}

export function tail(s, lines = 40) {
  if (!s) return ''
  const arr = s.split(/\r?\n/)
  return arr.slice(Math.max(0, arr.length - lines)).join('\n')
}

export function durationMs(start) {
  return Date.now() - start
}
