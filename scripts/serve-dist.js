const http = require('node:http')
const fs = require('node:fs')
const path = require('node:path')

const distDir = path.resolve(process.cwd(), 'dist')
const port = Number(process.env.PORT || 5173)
const host = process.env.HOST || '0.0.0.0'

const contentTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'application/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.ico', 'image/x-icon'],
  ['.txt', 'text/plain; charset=utf-8'],
])

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase()
  const contentType = contentTypes.get(ext) || 'application/octet-stream'
  const stream = fs.createReadStream(filePath)

  res.writeHead(200, { 'Content-Type': contentType })
  stream.on('error', () => {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Failed to read file')
  })
  stream.pipe(res)
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0])
  const cleanPath = urlPath === '/' ? '/index.html' : urlPath
  const filePath = path.join(distDir, cleanPath)

  if (filePath.startsWith(distDir) && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    sendFile(res, filePath)
    return
  }

  const spaIndex = path.join(distDir, 'index.html')
  if (fs.existsSync(spaIndex)) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    fs.createReadStream(spaIndex).pipe(res)
    return
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
  res.end('dist/index.html not found')
})

server.listen(port, host, () => {
  console.log(`Serving ${distDir} at http://${host}:${port}`)
})
