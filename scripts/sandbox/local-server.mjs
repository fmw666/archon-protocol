// scripts/sandbox/local-server.mjs — minimal static http server that serves
// docs/public/ so the runner can use --base-url=http://127.0.0.1:<port>
// without depending on aaep.site reachability.
import http from 'node:http'
import { promises as fs, createReadStream } from 'node:fs'
import path from 'node:path'

const MIME = {
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.yaml': 'application/yaml; charset=utf-8',
  '.yml': 'application/yaml; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
}

export async function startStaticServer({ rootDir, host = '127.0.0.1' }) {
  const docsPublic = path.join(rootDir, 'docs', 'public')
  const server = http.createServer(async (req, res) => {
    try {
      let urlPath = decodeURIComponent(req.url.split('?')[0])
      if (urlPath === '/' || urlPath === '') urlPath = '/index.html'
      const safe = path.normalize(urlPath).replace(/^([./\\]+)/, '')
      const fullPath = path.join(docsPublic, safe)
      if (!fullPath.startsWith(docsPublic)) {
        res.statusCode = 403
        res.end('forbidden')
        return
      }
      const stat = await fs.stat(fullPath).catch(() => null)
      if (!stat || !stat.isFile()) {
        res.statusCode = 404
        res.end('not found')
        return
      }
      const ext = path.extname(fullPath).toLowerCase()
      res.setHeader('content-type', MIME[ext] || 'application/octet-stream')
      res.setHeader('cache-control', 'no-store')
      createReadStream(fullPath).pipe(res)
    } catch (err) {
      res.statusCode = 500
      res.end(String(err && err.message))
    }
  })

  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, host, resolve)
  })
  const { port } = server.address()
  const baseUrl = `http://${host}:${port}`
  return {
    baseUrl,
    close: () => new Promise((r) => server.close(() => r())),
  }
}
