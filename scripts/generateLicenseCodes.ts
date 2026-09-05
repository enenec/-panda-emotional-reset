/**
 * 识别码生成脚本
 *
 * 生成类似 PANDA-XXXX-XXXX-XXXX 的专属识别码，并输出 CSV 文件。
 *
 * 用法：
 *   npm run generate:licenses               # 默认生成 20 个
 *   npm run generate:licenses -- --count 50 # 生成 50 个
 *
 * 输出文件：licenses/generated-license-codes.csv
 *
 * 注意：
 * 当前 App 使用「本地模拟激活码」（见 src/services/licenseService.ts 的白名单），
 * 本脚本生成的识别码默认只用于将来的服务器验证或线下发放，
 * 如需在本地验证这些码，需要把它们加入 licenseService 的白名单（仅限开发测试）。
 */

import { randomBytes } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

// 去掉易混淆字符（I、L、O、0、1）
const CHARSET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

function randomGroup(length: number): string {
  const bytes = randomBytes(length)
  let result = ''
  for (let i = 0; i < length; i++) {
    // 取模会引入轻微偏差，识别码数量级下可以接受
    result += CHARSET[bytes[i] % CHARSET.length]
  }
  return result
}

function generateCode(): string {
  return ['PANDA', randomGroup(4), randomGroup(4), randomGroup(4)].join('-')
}

function main(): void {
  const args = process.argv.slice(2)
  const countIndex = args.indexOf('--count')
  const count = countIndex >= 0 ? Math.max(1, Number(args[countIndex + 1]) || 20) : 20

  const codes: string[] = []
  const seen = new Set<string>()
  while (codes.length < count) {
    const code = generateCode()
    if (!seen.has(code)) {
      seen.add(code)
      codes.push(code)
    }
  }

  const outDir = path.resolve(process.cwd(), 'licenses')
  mkdirSync(outDir, { recursive: true })

  const now = new Date().toISOString()
  const csvLines = ['识别码,生成时间,状态']
  for (const code of codes) {
    csvLines.push(`${code},${now},未使用`)
  }
  const csvPath = path.join(outDir, 'generated-license-codes.csv')
  writeFileSync(csvPath, `﻿${csvLines.join('\r\n')}\r\n`, 'utf8')

  console.log(`已生成 ${codes.length} 个识别码：`)
  for (const code of codes) console.log(`  ${code}`)
  console.log(`CSV 已保存到：${csvPath}`)
}

main()
