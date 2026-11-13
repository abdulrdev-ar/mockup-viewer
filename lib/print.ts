import { BODY_H, BODY_HALF_W, sleeveFrame, type Dims } from './garment.ts'
import type { FontId, ImageLayer, Layer, TextLayer, Zone } from './slices/design.ts'
import type { Garment } from './slices/garment.ts'

export type CanvasId = 'body' | 'sleeveL' | 'sleeveR'

/** Kerangka zona cetak: pusat (px), skala (px per cm), rotasi dasar (derajat), ukuran maksimum (cm). */
export type ZoneFrame = { canvas: CanvasId; cx: number; cy: number; sx: number; sy: number; rot: number; w: number; h: number }

export const ZONES: Zone[] = ['front', 'chestLeft', 'back', 'sleeveL', 'sleeveR']
export const ZONE_LABEL: Record<Zone, string> = {
  front: 'Dada',
  chestLeft: 'Dada kiri',
  back: 'Punggung',
  sleeveL: 'Lengan kiri',
  sleeveR: 'Lengan kanan',
}

const DEG = Math.PI / 180

/** Ukuran zona dalam cm untuk kaos dengan dimensi d. */
export function zoneSize(d: Dims, zone: Zone): { w: number; h: number } {
  if (zone === 'front') {
    const top = d.H - d.dropFront - 0.06
    return { w: Math.min(30, d.chest * 200 * 0.62), h: Math.min(40, (top - 0.1) * 100) }
  }
  if (zone === 'back') {
    const top = d.H - d.dropBack - 0.08
    return { w: Math.min(32, d.chest * 200 * 0.65), h: Math.min(42, (top - 0.1) * 100) }
  }
  if (zone === 'chestLeft') return { w: 10, h: 10 }
  const f = sleeveFrame(d)
  return { w: Math.min(9, f.circAt(f.sCenter) * 100 * 0.4), h: Math.min(9, d.sleeveLen * 100 - 4) }
}

export function zoneFrames(d: Dims, bodyW: number, sleeveSize: number): Record<Zone, ZoneFrame> {
  const bodyH = bodyW / 2
  const ppc = bodyH / BODY_H / 100
  const frontX = (x: number) => (x + BODY_HALF_W) * ppc * 100
  const backX = (x: number) => bodyW / 2 + (-x + BODY_HALF_W) * ppc * 100
  const rowY = (y: number) => bodyH - y * ppc * 100
  const f = sleeveFrame(d)
  const front = zoneSize(d, 'front')
  const back = zoneSize(d, 'back')
  const sleeve = (canvas: CanvasId): ZoneFrame => ({
    canvas,
    cx: f.sCenter * sleeveSize,
    cy: sleeveSize / 2,
    sx: sleeveSize / (f.total * 100),
    sy: sleeveSize / (f.circAt(f.sCenter) * 100),
    // Atas cetakan mengarah ke bahu.
    rot: -90,
    ...zoneSize(d, 'sleeveL'),
  })
  return {
    front: {
      canvas: 'body',
      cx: frontX(0),
      cy: rowY(d.H - d.dropFront - 0.06 - front.h / 200),
      sx: ppc,
      sy: ppc,
      rot: 0,
      ...front,
    },
    // Dada kiri pemakai = sisi kanan saat kaos dilihat dari depan (+x).
    chestLeft: { canvas: 'body', cx: frontX(d.chest * 0.42), cy: rowY(d.H - 0.17), sx: ppc, sy: ppc, rot: 0, w: 10, h: 10 },
    back: {
      canvas: 'body',
      cx: backX(0),
      cy: rowY(d.H - d.dropBack - 0.08 - back.h / 200),
      sx: ppc,
      sy: ppc,
      rot: 0,
      ...back,
    },
    sleeveL: sleeve('sleeveL'),
    sleeveR: sleeve('sleeveR'),
  }
}

export const imageHeightCm = (l: ImageLayer) => (l.width * l.pxH) / l.pxW
export const dpiOf = (l: ImageLayer) => l.pxW / (l.width / 2.54)
export const DPI_WARNING = 150

/** Lebar awal gambar baru: 80% dari zona, rasio terjaga. */
export const fitWidth = (pxW: number, pxH: number, z: { w: number; h: number }) =>
  Math.min(z.w * 0.8, ((z.h * 0.8) * pxW) / pxH)

/** Jaga gambar tetap di dalam zona. Teks hanya dijaga pusatnya. */
export function clampToZone(l: Layer, z: { w: number; h: number }) {
  const hw = l.kind === 'image' ? l.width / 2 : 0
  const hh = l.kind === 'image' ? imageHeightCm(l) / 2 : 0
  const mx = Math.max(0, z.w / 2 - hw)
  const my = Math.max(0, z.h / 2 - hh)
  return { x: Math.min(mx, Math.max(-mx, l.x)), y: Math.min(my, Math.max(-my, l.y)) }
}

export type PaintInput = {
  garment: Garment
  layers: Layer[]
  frames: Record<Zone, ZoneFrame>
  fonts: Record<FontId, string>
  images: Map<string, CanvasImageSource>
  guide: Zone | null
}

const PART_OF: Record<CanvasId, keyof Garment['colors']> = { body: 'body', sleeveL: 'sleeveL', sleeveR: 'sleeveR' }

/** Gambar satu kanvas cetak: warna kain, lalu lapisan gambar dan teks di zonanya. */
export function paintCanvas(id: CanvasId, ctx: CanvasRenderingContext2D, p: PaintInput) {
  const { width, height } = ctx.canvas
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.fillStyle = p.garment.colors[PART_OF[id]]
  ctx.fillRect(0, 0, width, height)
  for (const layer of p.layers) {
    const f = p.frames[layer.zone]
    if (f.canvas !== id) continue
    ctx.save()
    const k = enterFrame(ctx, f)
    ctx.translate(layer.x * k, layer.y * k)
    ctx.rotate(layer.rotation * DEG)
    if (layer.kind === 'image') {
      const img = p.images.get(layer.src)
      if (img) {
        const w = layer.width * k
        const h = imageHeightCm(layer) * k
        ctx.drawImage(img, -w / 2, -h / 2, w, h)
      }
    } else drawText(ctx, layer, k, p.fonts[layer.font])
    ctx.restore()
  }
  const g = p.guide && p.frames[p.guide]
  if (g && g.canvas === id) {
    ctx.save()
    const k = enterFrame(ctx, g)
    ctx.setLineDash([k * 0.8, k * 0.6])
    ctx.lineWidth = k * 0.15
    ctx.strokeStyle = 'rgba(15, 96, 255, 0.85)'
    ctx.strokeRect((-g.w * k) / 2, (-g.h * k) / 2, g.w * k, g.h * k)
    ctx.restore()
  }
}

/** Masuk ke ruang zona: satuan = cm x k px, rotasi di ruang fisik, lalu skala tak seragam ke kanvas. */
function enterFrame(ctx: CanvasRenderingContext2D, f: ZoneFrame) {
  const k = Math.max(f.sx, f.sy)
  ctx.translate(f.cx, f.cy)
  ctx.scale(f.sx / k, f.sy / k)
  ctx.rotate(f.rot * DEG)
  return k
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
  lines.forEach((l, i) => ctx.fillText(l, x, ((i - (lines.length - 1) / 2) * lh)))
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
