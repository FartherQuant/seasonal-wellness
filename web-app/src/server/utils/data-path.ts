/**
 * 统一数据路径工具
 * 在本地开发和 Vercel Serverless 中都指向 process.cwd() + data/
 */
import { resolve } from 'node:path'
import { existsSync } from 'node:fs'

export function resolveDataDir(): string {
  return resolve(process.cwd(), 'data')
}

export function resolveDataFile(filename: string): string {
  return resolve(resolveDataDir(), filename)
}

export function dataFileExists(filename: string): boolean {
  return existsSync(resolveDataFile(filename))
}
