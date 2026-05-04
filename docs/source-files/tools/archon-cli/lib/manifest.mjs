// lib/manifest.mjs — manifest.json fetch, verify, and plan helpers. Every
// other CLI command (install / update / sync / doctor) builds on these.
//
// Why: the canonical Archon distribution is described by a single file at
// https://aaep.site/manifest.json. Files carry sha256 checksums so a partial
// or tampered fetch can be rejected without writing anything.
import { createHash } from 'node:crypto'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

export const DEFAULT_BASE_URL = 'https://aaep.site'
const MANIFEST_PATH = '/manifest.json'
const USER_AGENT = 'archon-cli/1.x'

export function resolveBaseUrl({ flags }) {
  return (flags && flags['base-url']) || process.env.ARCHON_BASE_URL || DEFAULT_BASE_URL
}

export async function fetchText(url) {
  const res = await fetch(url, {
    redirect: 'follow',
    headers: { 'user-agent': USER_AGENT, accept: '*/*' },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}`)
  return await res.text()
}

export async function fetchBytes(url) {
  const res = await fetch(url, {
    redirect: 'follow',
    headers: { 'user-agent': USER_AGENT, accept: '*/*' },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}`)
  const buf = Buffer.from(await res.arrayBuffer())
  return buf
}

export async function fetchManifest({ baseUrl }) {
  const url = baseUrl.replace(/\/+$/, '') + MANIFEST_PATH
  let body
  try {
    body = await fetchText(url)
  } catch (err) {
    throw new Error(`Failed to fetch manifest from ${url}: ${err.message}`)
  }
  let manifest
  try {
    manifest = JSON.parse(body)
  } catch (err) {
    throw new Error(`Manifest at ${url} is not valid JSON: ${err.message}`)
  }
  if (manifest.schema !== 'archon.manifest/v1') {
    throw new Error(
      `Unsupported manifest schema: ${manifest.schema}. This CLI understands archon.manifest/v1 only.`,
    )
  }
  // If the user supplied a base_url override (mirror, local dev), rewrite
  // every file URL to that base. The manifest was published with absolute URLs
  // under its canonical base_url, so a simple prefix swap is sufficient.
  const canonicalBase = manifest.base_url?.replace(/\/+$/, '')
  const actualBase = baseUrl.replace(/\/+$/, '')
  if (canonicalBase && canonicalBase !== actualBase) {
    for (const mod of manifest.modules || []) {
      for (const f of mod.files || []) {
        if (f.url && f.url.startsWith(canonicalBase)) {
          f.url = actualBase + f.url.slice(canonicalBase.length)
        }
      }
    }
    manifest.base_url = actualBase
  }
  return manifest
}

export function sha256Hex(buf) {
  return createHash('sha256').update(buf).digest('hex')
}

export async function fileSha256(absPath) {
  const buf = await fs.readFile(absPath)
  return sha256Hex(buf)
}

export async function pathExists(p) {
  try { await fs.access(p); return true } catch { return false }
}

/**
 * Classify a manifest vs project-on-disk diff for one file.
 * Returns 'ok' | 'modified' | 'missing'.
 */
export async function classifyFile({ projectRoot, manifestFile }) {
  const abs = path.join(projectRoot, manifestFile.path)
  if (!(await pathExists(abs))) return 'missing'
  const sha = await fileSha256(abs)
  return sha === manifestFile.sha256 ? 'ok' : 'modified'
}

/**
 * Returns the set of module ids that are "installed" in a project:
 * a module is installed iff at least one of its files exists on disk.
 * Used by update / sync / uninstall to decide which optional modules to
 * include in the working set.
 */
export async function detectInstalledModules({ projectRoot, manifest }) {
  const installed = new Set()
  for (const mod of manifest.modules) {
    for (const f of mod.files) {
      if (await pathExists(path.join(projectRoot, f.path))) {
        installed.add(mod.id)
        break
      }
    }
  }
  return installed
}

export function flattenFiles(manifest, { moduleIds } = {}) {
  const out = []
  for (const mod of manifest.modules) {
    if (moduleIds && !moduleIds.has(mod.id)) continue
    for (const f of mod.files) out.push({ ...f, module: mod.id })
  }
  return out
}

export function formatBytes(n) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(2)} MB`
}

/**
 * Check whether a given relative path matches any runtime-ledger path or
 * directory declared in the manifest. Paths already use forward slashes.
 */
export function isRuntimeLedgerPath(relPath, manifest) {
  const { files = [], directories = [] } = manifest.runtime_ledger_paths || {}
  if (files.includes(relPath)) return true
  for (const dir of directories) {
    if (relPath.startsWith(dir)) return true
  }
  return false
}

/**
 * Download one file and verify sha256. Returns Buffer or throws.
 */
export async function fetchAndVerify(manifestFile) {
  const buf = await fetchBytes(manifestFile.url)
  const sha = sha256Hex(buf)
  if (sha !== manifestFile.sha256) {
    throw new Error(
      `sha256 mismatch for ${manifestFile.path}: expected ${manifestFile.sha256}, got ${sha}`,
    )
  }
  return buf
}

/**
 * Write a buffer to {projectRoot}/{relPath}, creating parent directories.
 * Optional backup: if the file exists and backupRoot is set, copy the
 * existing file to {backupRoot}/{relPath} before overwriting.
 */
export async function writeFileSafe({ projectRoot, relPath, buf, backupRoot }) {
  const abs = path.join(projectRoot, relPath)
  if (backupRoot && (await pathExists(abs))) {
    const backupAbs = path.join(backupRoot, relPath)
    await fs.mkdir(path.dirname(backupAbs), { recursive: true })
    await fs.copyFile(abs, backupAbs)
  }
  await fs.mkdir(path.dirname(abs), { recursive: true })
  await fs.writeFile(abs, buf)
}
