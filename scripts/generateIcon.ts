/**
 * 应用图标生成脚本
 *
 * 用纯代码画一个奶油底 + 熊猫头像的图标：
 * - build/icon.png（预览用）
 * - build/icon.ico（electron-builder 打包用，内嵌 PNG 数据）
 *
 * 用法：npm run generate:icon
 */

import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const SIZE = 256

type RGBA = [number, number, number, number]

const PANDA_BLACK: RGBA = [47, 47, 47, 255]
const WHITE: RGBA = [255, 255, 255, 255]
const CREAM: RGBA = [255, 253, 247, 255]
const BLUSH: RGBA = [255, 199, 199, 230]
const BAMBOO: RGBA = [127, 184, 149, 255]
const LEAF: RGBA = [168, 213, 186, 255]

const pixels: RGBA[] = new Array<RGBA>(SIZE * SIZE)

function blend(prev: RGBA, color: RGBA, alpha: number): RGBA {
  const a = Math.min(1, Math.max(0, alpha))
  const r = Math.round(prev[0] * (1 - a) + color[0] * a)
  const g = Math.round(prev[1] * (1 - a) + color[1] * a)
  const b = Math.round(prev[2] * (1 - a) + color[2] * a)
  const outA = prev[3] * (1 - a) + color[3] * a
  return [r, g, b, Math.round(outA)]
}

function setPixel(x: number, y: number, color: RGBA, alpha: number): void {
  const xi = Math.round(x)
  const yi = Math.round(y)
  if (xi < 0 || yi < 0 || xi >= SIZE || yi >= SIZE) return
  const index = yi * SIZE + xi
  pixels[index] = blend(pixels[index] ?? CREAM, color, alpha)
}

function drawCircle(cx: number, cy: number, r: number, color: RGBA, alpha = 1): void {
  const x0 = Math.floor(cx - r - 2)
  const x1 = Math.ceil(cx + r + 2)
  const y0 = Math.floor(cy - r - 2)
  const y1 = Math.ceil(cy + r + 2)
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const d = Math.hypot(x - cx, y - cy)
      const a = Math.min(1, Math.max(0, 1 - (d - r))) * alpha
      if (a > 0) setPixel(x, y, color, a)
    }
  }
}

function drawEllipse(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  rotation: number,
  color: RGBA,
  alpha = 1,
): void {
  const cos = Math.cos(rotation)
  const sin = Math.sin(rotation)
  const x0 = Math.floor(cx - rx - 3)
  const x1 = Math.ceil(cx + rx + 3)
  const y0 = Math.floor(cy - ry - 3)
  const y1 = Math.ceil(cy + ry + 3)
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const dx = x - cx
      const dy = y - cy
      const u = dx * cos + dy * sin
      const v = -dx * sin + dy * cos
      const d = Math.sqrt((u / rx) * (u / rx) + (v / ry) * (v / ry))
      const a = Math.min(1, Math.max(0, 1 - (d - 1))) * alpha
      if (a > 0) setPixel(x, y, color, a)
    }
  }
}

/** 画一段圆弧（嘴巴用） */
function drawArc(
  cx: number,
  cy: number,
  r: number,
  thickness: number,
  startAngle: number,
  endAngle: number,
  color: RGBA,
): void {
  const x0 = Math.floor(cx - r - thickness - 2)
  const x1 = Math.ceil(cx + r + thickness + 2)
  const y0 = Math.floor(cy - r - thickness - 2)
  const y1 = Math.ceil(cy + r + thickness + 2)
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const d = Math.hypot(x - cx, y - cy)
      if (Math.abs(d - r) > thickness) continue
      const angle = Math.atan2(y - cy, x - cx)
      if (angle < startAngle || angle > endAngle) continue
      const a = Math.min(1, Math.max(0, thickness - Math.abs(d - r)))
      if (a > 0) setPixel(x, y, color, a)
    }
  }
}

/** 圆角矩形的角部透明度遮罩（背景使用） */
function roundedMaskAlpha(x: number, y: number, corner: number): number {
  const half = SIZE / 2
  const dx = Math.max(Math.abs(x - half) - (half - corner), 0)
  const dy = Math.max(Math.abs(y - half) - (half - corner), 0)
  const d = Math.hypot(dx, dy) - corner
  return Math.min(1, Math.max(0, 0.5 - d))
}

function drawIcon(): void {
  // 背景（圆角方形）
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      pixels[y * SIZE + x] = [CREAM[0], CREAM[1], CREAM[2], Math.round(255 * roundedMaskAlpha(x, y, 56))]
    }
  }

  // 脸：黑描边圆 + 白脸
  drawCircle(128, 126, 99, PANDA_BLACK)
  drawCircle(128, 126, 96, WHITE)

  // 耳朵（画在脸上面）
  drawCircle(56, 44, 33, PANDA_BLACK)
  drawCircle(200, 44, 33, PANDA_BLACK)

  // 眼斑（倾斜椭圆）
  drawEllipse(98, 118, 30, 42, 0.35, PANDA_BLACK)
  drawEllipse(158, 118, 30, 42, -0.35, PANDA_BLACK)

  // 眼睛：白底 + 黑瞳孔
  drawCircle(98, 120, 12, WHITE)
  drawCircle(158, 120, 12, WHITE)
  drawCircle(99, 123, 6, PANDA_BLACK)
  drawCircle(159, 123, 6, PANDA_BLACK)

  // 鼻子
  drawEllipse(128, 158, 13, 10, 0, PANDA_BLACK)

  // 嘴巴（微微向上的弧）
  drawArc(128, 150, 22, 2.5, 0.45, Math.PI - 0.45, PANDA_BLACK)

  // 腮红
  drawCircle(66, 166, 15, BLUSH)
  drawCircle(190, 166, 15, BLUSH)

  // 右上角竹叶装饰
  drawEllipse(202, 46, 27, 9, -0.55, LEAF)
  drawEllipse(224, 60, 24, 8, 0.45, LEAF)
  drawEllipse(216, 50, 26, 8, 0, BAMBOO)
}

// ---------- PNG 编码 ----------

const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c >>> 0
  }
  return table
})()

function crc32(buf: Buffer): number {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function pngChunk(type: string, data: Buffer): Buffer {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const typeBuf = Buffer.from(type, 'ascii')
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])))
  return Buffer.concat([length, typeBuf, data, crc])
}

function encodePng(): Buffer {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(SIZE, 0)
  ihdr.writeUInt32BE(SIZE, 4)
  ihdr[8] = 8 // 位深
  ihdr[9] = 6 // RGBA
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  const raw = Buffer.alloc(SIZE * (SIZE * 4 + 1))
  for (let y = 0; y < SIZE; y++) {
    const rowStart = y * (SIZE * 4 + 1)
    raw[rowStart] = 0 // 行过滤类型：None
    for (let x = 0; x < SIZE; x++) {
      const pixel = pixels[y * SIZE + x] ?? [0, 0, 0, 0]
      const offset = rowStart + 1 + x * 4
      raw[offset] = pixel[0]
      raw[offset + 1] = pixel[1]
      raw[offset + 2] = pixel[2]
      raw[offset + 3] = pixel[3]
    }
  }

  const idat = deflateSync(raw, { level: 9 })
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idat),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
}

/** 把 PNG 包进 ICO 容器（Vista+ 支持内嵌 PNG 的 ICO） */
function wrapIco(png: Buffer): Buffer {
  const header = Buffer.alloc(22)
  header.writeUInt16LE(0, 0) // 保留
  header.writeUInt16LE(1, 2) // 类型：图标
  header.writeUInt16LE(1, 4) // 数量
  header[6] = 0 // 宽 256
  header[7] = 0 // 高 256
  header[8] = 0 // 调色板
  header[9] = 0 // 保留
  header.writeUInt16LE(1, 10) // 平面数
  header.writeUInt16LE(32, 12) // 位深
  header.writeUInt32LE(png.length, 14) // 数据大小
  header.writeUInt32LE(22, 18) // 数据偏移
  return Buffer.concat([header, png])
}

function main(): void {
  drawIcon()
  const png = encodePng()
  const outDir = path.resolve(process.cwd(), 'build')
  mkdirSync(outDir, { recursive: true })
  writeFileSync(path.join(outDir, 'icon.png'), png)
  writeFileSync(path.join(outDir, 'icon.ico'), wrapIco(png))
  console.log(`图标已生成：${path.join(outDir, 'icon.png')} 与 ${path.join(outDir, 'icon.ico')}`)
}

main()
