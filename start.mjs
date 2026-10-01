/**
 * Production startup script for Hostinger Node.js hosting.
 *
 * Architecture:
 * Hostinger PORT
 *       ↓
 *   HTTP Proxy
 *    ↙       ↘
 * Backend    Next.js
 *  :3001      :3100
 */

import { spawn, spawnSync } from 'child_process'
import { existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import http from 'http'

const __dirname = dirname(fileURLToPath(import.meta.url))

const C = {
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  reset: '\x1b[0m',
}

// ─────────────────────────────────────────────────────────────
// Ports
// ─────────────────────────────────────────────────────────────

const HOSTINGER_PORT = Number(process.env.PORT) || 8080

// Internal ports — do NOT use Hostinger's public PORT here
const BACKEND_PORT = 3001
const FRONTEND_PORT = 3100

// ─────────────────────────────────────────────────────────────
// Build validation
// ─────────────────────────────────────────────────────────────

const backendDist = resolve(
  __dirname,
  'backend',
  'dist',
  'server.js'
)

const frontendBuild = resolve(
  __dirname,
  'frontend',
  '.next'
)

if (!existsSync(backendDist)) {
  console.error(
    `${C.red}❌ backend/dist/server.js not found.${C.reset}`
  )

  process.exit(1)
}

if (!existsSync(frontendBuild)) {
  console.error(
    `${C.red}❌ frontend/.next not found.${C.reset}`
  )

  process.exit(1)
}

// ─────────────────────────────────────────────────────────────
// Environment warnings
// ─────────────────────────────────────────────────────────────

if (!existsSync(resolve(__dirname, 'backend', '.env'))) {
  console.warn(
    `${C.yellow}⚠️ backend/.env not found.${C.reset}`
  )

  console.warn(
    '   Using Hostinger environment variables.'
  )
}

if (!existsSync(resolve(__dirname, 'frontend', '.env.local'))) {
  console.warn(
    `${C.yellow}⚠️ frontend/.env.local not found.${C.reset}`
  )

  console.warn(
    '   Using Hostinger environment variables.'
  )
}

// ─────────────────────────────────────────────────────────────
// Dependency installer
// ─────────────────────────────────────────────────────────────

function ensureDeps(label, cwd) {

  const nm = resolve(
    cwd,
    'node_modules'
  )

  if (!existsSync(nm)) {

    console.log(
      `${C.yellow}📦 ${label}: installing production dependencies...${C.reset}`
    )

    const result = spawnSync(
      'npm',
      [
        'install',
        '--omit=dev'
      ],
      {
        cwd,
        stdio: 'inherit',
        shell: true
      }
    )

    if (result.status !== 0) {

      console.error(
        `${C.red}❌ Failed to install ${label} dependencies.${C.reset}`
      )

      process.exit(1)
    }

    console.log(
      `${C.green}✓ ${label} dependencies installed.${C.reset}`
    )
  }
}

ensureDeps(
  'Backend',
  resolve(__dirname, 'backend')
)

ensureDeps(
  'Frontend',
  resolve(__dirname, 'frontend')
)

// ─────────────────────────────────────────────────────────────
// Process launcher
// ─────────────────────────────────────────────────────────────

function startProcess(
  name,
  command,
  args,
  cwd,
  color,
  extraEnv = {}
) {

  const proc = spawn(
    command,
    args,
    {
      cwd,
      stdio: 'pipe',
      env: {
        ...process.env,
        ...extraEnv
      }
    }
  )

  proc.stdout.on(
    'data',
    (data) => {

      data
        .toString()
        .trim()
        .split('\n')
        .forEach(
          (line) => {

            if (line) {

              console.log(
                `${C[color]}[${name}]${C.reset} ${line}`
              )
            }
          }
        )
    }
  )

  proc.stderr.on(
    'data',
    (data) => {

      data
        .toString()
        .trim()
        .split('\n')
        .forEach(
          (line) => {

            if (line) {

              console.error(
                `${C[color]}[${name}]${C.reset} ${C.red}${line}${C.reset}`
              )
            }
          }
        )
    }
  )

  proc.on(
    'exit',
    (code, signal) => {

      console.log(
        `${C[color]}[${name}]${C.reset} exited with code ${code}${signal ? ` (${signal})` : ''}`
      )

      // Do not immediately kill the whole Hostinger app.
      // The proxy process remains alive.
    }
  )

  proc.on(
    'error',
    (error) => {

      console.error(
        `${C.red}[${name}] process error:${C.reset}`,
        error
      )
    }
  )

  return proc
}

// ─────────────────────────────────────────────────────────────
// Start message
// ─────────────────────────────────────────────────────────────

console.log(
  `\n🚀 Starting Medical Distribution System...\n`
)

console.log(
  `${C.green}Hostinger public PORT: ${HOSTINGER_PORT}${C.reset}`
)

console.log(
  `${C.green}Backend internal PORT: ${BACKEND_PORT}${C.reset}`
)

console.log(
  `${C.green}Frontend internal PORT: ${FRONTEND_PORT}${C.reset}\n`
)

// ─────────────────────────────────────────────────────────────
// Start backend
// ─────────────────────────────────────────────────────────────

const backend = startProcess(
  'BACKEND',
  process.execPath,
  [
    backendDist
  ],
  resolve(
    __dirname,
    'backend'
  ),
  'green',
  {
    PORT: String(BACKEND_PORT)
  }
)

// ─────────────────────────────────────────────────────────────
// Start frontend
// ─────────────────────────────────────────────────────────────

const nextEntry = resolve(
  __dirname,
  'frontend',
  'node_modules',
  'next',
  'dist',
  'bin',
  'next'
)

const frontend = startProcess(
  'FRONTEND',
  process.execPath,
  [
    nextEntry,
    'start',
    '-p',
    String(FRONTEND_PORT)
  ],
  resolve(
    __dirname,
    'frontend'
  ),
  'blue',
  {
    PORT: String(FRONTEND_PORT),
    HOSTNAME: '127.0.0.1'
  }
)

// ─────────────────────────────────────────────────────────────
// Hostinger HTTP proxy
// ─────────────────────────────────────────────────────────────

const proxyServer=http.createServer((req,res)=>{
    let targetPort

    const url = req.url || ''

    // NextAuth routes → Next.js
    if (
      /^\/api\/auth\/(session|csrf|providers|signin|signout)(\?|$)/.test(url) ||
      /^\/api\/auth\/callback\//.test(url)
    ) {
      targetPort = FRONTEND_PORT
    }
    // Our application authentication/API → Backend
    else if (url.startsWith('/api')) {
      targetPort = BACKEND_PORT
    }
    // All frontend pages/assets → Next.js
    else {
      targetPort = FRONTEND_PORT
    }

    const options = {
      hostname: '127.0.0.1',
      port: targetPort,
      path: req.url,
      method: req.method,
      headers: {
        ...req.headers,
        host: `127.0.0.1:${targetPort}`
      }
    }

    const proxyReq = http.request(
      options,
      (proxyRes) => {

        res.writeHead(
          proxyRes.statusCode || 502,
          proxyRes.headers
        )

        proxyRes.pipe(res)
      }
    )

    proxyReq.on(
      'error',
      (error) => {

        console.error(
          `${C.red}Proxy error → ${targetPort}:${C.reset}`,
          error.message
        )

        if (!res.headersSent) {

          res.writeHead(
            502,
            {
              'Content-Type': 'application/json'
            }
          )
        }

        res.end(
          JSON.stringify({
            error: 'Service temporarily unavailable'
          })
        )
      }
    )

    req.pipe(proxyReq)
  }
)

// ─────────────────────────────────────────────────────────────
// IMPORTANT: Main Hostinger process listens here
// ─────────────────────────────────────────────────────────────

proxyServer.listen(
  HOSTINGER_PORT,
  '0.0.0.0',
  () => {

    console.log(
      `${C.green}✅ Hostinger HTTP server listening on port ${HOSTINGER_PORT}${C.reset}`
    )

    console.log(
      `${C.green}✅ /api → backend:${BACKEND_PORT}${C.reset}`
    )

    console.log(
      `${C.green}✅ /api/auth → frontend:${FRONTEND_PORT}${C.reset}`
    )

    console.log(
      `${C.green}✅ frontend → frontend:${FRONTEND_PORT}${C.reset}\n`
    )
  }
)

// ─────────────────────────────────────────────────────────────
// Graceful shutdown
// ─────────────────────────────────────────────────────────────

function cleanup(signal) {

  console.log(
    `\n${C.yellow}Shutting down...${C.reset}`
  )

  try {
    proxyServer.close()
  } catch {}

  try {
    frontend.kill(signal)
  } catch {}

  try {
    backend.kill(signal)
  } catch {}

  setTimeout(
    () => process.exit(0),
    1000
  )
}

process.on(
  'SIGINT',
  () => cleanup('SIGINT')
)

process.on(
  'SIGTERM',
  () => cleanup('SIGTERM')
)