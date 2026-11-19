import { WRAP_H, WRAP_W } from './garment.ts'
import type { FontId, ImageLayer, Layer, TextLayer } from './slices/design.ts'

const DEG = Math.PI / 180
type Box = { w: number; h: number }
type Point = { x: number; y: number }

export const imageHeightCm = (l: ImageLayer) => (l.width * l.pxH) / l.pxW
export const dpiOf = (l: ImageLayer) => l.pxW / (l.width / 2.54)
export const DPI_WARNING = 150

/** Lebar awal gambar baru: muat dalam 16 x 25 cm, rasio terjaga. */
export const fitWidth = (pxW: number, pxH: number) => Math.min(16, (25 * pxW) / pxH)

/** Selisih x terpendek di kanvas yang melingkari badan. */
export const wrapDx = (dx: number) => dx - WRAP_W * Math.round(dx / WRAP_W)

/** x berputar keliling badan, pusat y tetap di dalam kanvas. */
export const placeLayer = (x: number, y: number): Point => ({ x: wrapDx(x), y: Math.min(WRAP_H / 2, Math.max(-WRAP_H / 2, y)) })

/** Titik pegangan seleksi dalam ruang lokal lapisan (cm): empat sudut, lalu pegangan putar di atas. */
export const handlePoints = (b: Box, r: number) => [
  [-b.w / 2, -b.h / 2],
  [b.w / 2, -b.h / 2],
  [b.w / 2, b.h / 2],
  [-b.w / 2, b.h / 2],
  [0, -b.h / 2 - r * 4],
]

/** Titik p (cm kanvas) dalam ruang lokal lapisan: digeser keliling badan, lalu putarannya dibalik. */
function toLocal(l: Layer, p: Point): Point {
  const dx = wrapDx(p.x - l.x)
  const dy = p.y - l.y
  const a = -l.rotation * DEG
  return { x: dx * Math.cos(a) - dy * Math.sin(a), y: dx * Math.sin(a) + dy * Math.cos(a) }
}

/** Lapisan teratas di titik p. */
export const hitLayer = (layers: Layer[], boxOf: (l: Layer) => Box, p: Point) =>
  layers.findLast((l) => {
    const q = toLocal(l, p)
    const b = boxOf(l)
    return Math.abs(q.x) <= b.w / 2 && Math.abs(q.y) <= b.h / 2
  })

/** Indeks pegangan seleksi di titik p (0-3 sudut, 4 putar), atau -1. */
export function hitHandle(l: Layer, b: Box, r: number, p: Point, reach: number) {
  const q = toLocal(l, p)
  return handlePoints(b, r).findIndex(([hx, hy]) => Math.hypot(q.x - hx, q.y - hy) <= r * reach)
}

export type PaintInput = {
  layers: Layer[]
  fonts: Record<FontId, string>
  images: Map<string, CanvasImageSource>
  /** Lapisan terpilih dan jari-jari pegangan (cm), atau null saat ekspor. */
  selection: { id: string; r: number } | null
}

/** Gambar semua lapisan ke kanvas cetak transparan. Warna kain diatur material di Viewer. */
export function paintWrap(ctx: CanvasRenderingContext2D, p: PaintInput) {
  const { width, height } = ctx.canvas
  const k = width / WRAP_W
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, width, height)
  for (const l of p.layers) {
    const b = layerBox(ctx, l, p.fonts[l.kind === 'text' ? l.font : 'anton'])
    const sel = p.selection?.id === l.id ? p.selection.r : 0
    // Lapisan dekat tengah belakang digambar juga di sisi kanvas seberangnya supaya menyambung.
    const reach = Math.hypot(b.w, b.h) / 2 + sel * 5
    for (const off of [0, -WRAP_W, WRAP_W]) {
      const x = l.x + off
      if (off !== 0 && Math.abs(x) - reach > WRAP_W / 2) continue
      ctx.save()
      ctx.translate(width / 2 + x * k, height / 2 + l.y * k)
      ctx.rotate(l.rotation * DEG)
      if (l.kind === 'image') {
        const img = p.images.get(l.src)
        if (img) ctx.drawImage(img, (-b.w * k) / 2, (-b.h * k) / 2, b.w * k, b.h * k)
      } else drawText(ctx, l, k, p.fonts[l.font])
      if (sel) drawSelection(ctx, b, sel, k)
      ctx.restore()
    }
  }
}

/** Kotak seleksi dan pegangan. Garis putih di bawah biru supaya terlihat di kain gelap maupun terang. */
function drawSelection(ctx: CanvasRenderingContext2D, b: Box, r: number, k: number) {
  const pts = handlePoints(b, r)
  for (const [color, width] of [
    ['#FFFFFF', r * 0.45],
    ['#0F60FF', r * 0.22],
  ] as const) {
    ctx.strokeStyle = color
    ctx.lineWidth = width * k
    ctx.strokeRect((-b.w * k) / 2, (-b.h * k) / 2, b.w * k, b.h * k)
    ctx.beginPath()
    ctx.moveTo(0, (-b.h * k) / 2)
    ctx.lineTo(0, pts[4][1] * k)
    ctx.stroke()
  }
  ctx.fillStyle = '#FFFFFF'
  ctx.strokeStyle = '#0F60FF'
  ctx.lineWidth = r * 0.3 * k
  for (const [i, [hx, hy]] of pts.entries()) {
    ctx.beginPath()
    if (i === 4) ctx.arc(hx * k, hy * k, r * k, 0, Math.PI * 2)
    else ctx.rect((hx - r * 0.6) * k, (hy - r * 0.6) * k, r * 1.2 * k, r * 1.2 * k)
    ctx.fill()
    ctx.stroke()
  }
}

/** Lebar dan tinggi kotak lapisan dalam cm, sebelum diputar. */
export function layerBox(ctx: CanvasRenderingContext2D, l: Layer, family: string): Box {
  if (l.kind === 'image') return { w: l.width, h: imageHeightCm(l) }
  const K = 20
  const text = l.upper ? l.text.toUpperCase() : l.text
  ctx.font = `${l.size * K}px ${family}`
  const spacing = l.letterSpacing * l.size * K
  const widthOf = (s: string) => ctx.measureText(s).width + spacing * [...s].length
  if (l.arc === 0) {
    const lines = text.split('\n')
    return { w: Math.max(...lines.map(widthOf)) / K, h: lines.length * l.size * l.lineHeight }
  }
  const total = widthOf(text.replace(/\n/g, ' ')) / K
  const a = Math.abs(l.arc) * DEG
  const r = total / a
  return { w: a < Math.PI ? 2 * r * Math.sin(a / 2) : 2 * r, h: l.size + r * (1 - Math.cos(Math.min(a, Math.PI) / 2)) }
}

function drawText(ctx: CanvasRenderingContext2D, t: TextLayer, k: number, family: string) {
  const px = t.size * k
  const text = t.upper ? t.text.toUpperCase() : t.text
  ctx.font = `${px}px ${family}`
  ctx.fillStyle = t.color
  ctx.textBaseline = 'middle'
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${t.letterSpacing * px}px`
  if (t.arc !== 0) return drawArc(ctx, text.replace(/\n/g, ' '), t.arc * DEG, t.letterSpacing * px)
  const lines = text.split('\n')
  const lh = px * t.lineHeight
  const maxW = Math.max(...lines.map((l) => ctx.measureText(l).width))
  ctx.textAlign = t.align
  const x = t.align === 'left' ? -maxW / 2 : t.align === 'right' ? maxW / 2 : 0
  lines.forEach((l, i) => ctx.fillText(l, x, (i - (lines.length - 1) / 2) * lh))
}

/** Teks melengkung. arc > 0 melengkung ke atas, arc < 0 ke bawah. */
function drawArc(ctx: CanvasRenderingContext2D, line: string, arc: number, spacing: number) {
  const chars = [...line]
  const widths = chars.map((c) => ctx.measureText(c).width + spacing)
  const total = widths.reduce((a, b) => a + b, 0)
  if (total === 0) return
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0px'
  const r = total / Math.abs(arc)
  const up = arc > 0
  const lift = (r - r * Math.cos(Math.abs(arc) / 2)) / 2
  ctx.textAlign = 'center'
  let beta = -Math.abs(arc) / 2
  chars.forEach((c, i) => {
    beta += widths[i] / 2 / r
    ctx.save()
    if (up) {
      ctx.translate(r * Math.sin(beta), r - r * Math.cos(beta) - lift)
      ctx.rotate(beta)
    } else {
      ctx.translate(r * Math.sin(beta), -r + r * Math.cos(beta) + lift)
      ctx.rotate(-beta)
    }
    ctx.fillText(c, 0, 0)
    ctx.restore()
    beta += widths[i] / 2 / r
  })
}
