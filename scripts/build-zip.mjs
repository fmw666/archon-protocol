import { createWriteStream } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import archiver from 'archiver'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const PROTOCOL_DIR = resolve(ROOT, 'protocol')
const OUTPUT = resolve(ROOT, 'docs', 'public', 'archon-core.zip')

const output = createWriteStream(OUTPUT)
const archive = archiver('zip', { zlib: { level: 9 } })

output.on('close', () => {
  console.log(`[build-zip] archon-core.zip created (${archive.pointer()} bytes)`)
})

archive.on('error', (err) => {
  throw err
})

archive.pipe(output)
archive.directory(PROTOCOL_DIR, 'archon-protocol')
archive.finalize()
