#!/usr/bin/env node
/**
 * Post-build: compile server code to api/server/ for Vercel function bundling
 */
import { cpSync, mkdirSync, readdirSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'

const src = resolve(process.cwd(), 'dist/api/server')
const dest = resolve(process.cwd(), 'api/server')

try {
  // Remove old compiled files
  rmSync(dest, { recursive: true, force: true })
  mkdirSync(dest, { recursive: true })
  cpSync(src, dest, { recursive: true, force: true })
  console.log(`✓ Compiled server → api/server/ (${readdirSync(dest).length} files)`)
} catch (err) {
  console.error('✗ Failed to compile server to api/server/:', err.message)
  process.exit(1)
}
