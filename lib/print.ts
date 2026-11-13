import { BODY_H, BODY_HALF_W, SLEEVE_SPAN, type Dims } from './garment.ts'
import type { FontId, ImageLayer, Layer, TextLayer, Zone } from './slices/design.ts'
import type { Garment } from './slices/garment.ts'

export type CanvasId = 'body' | 'sleeveL' | 'sleeveR'

/** Kerangka zona cetak: pusat (px), skala (px per cm), rotasi dasar (derajat), ukuran maksimum (cm). */
export type ZoneFrame = { canvas: CanvasId; cx: number; cy: number; sx: number; sy: number; rot: number; w: number; h: number }

export const ZONES: Zone[] = ['front', 'back', 'sleeveL', 'sleeveR']
export const ZONE_LABEL: Record<Zone, string> = {
  front: 'Depan',
  back: 'Belakang',
  sleeveL: 'Lengan kiri',
  sleeveR: 'Lengan kanan',
}

const DEG = Math.PI / 180
/** Area cetak badan: dari bawah kerah sampai di atas hem. */
const HEM_GAP = 0.06
const topOf = (d: Dims, zone: 'front' | 'back') => (zone === 'front' ? d.H - d.dropFront - 0.05 : d.H - d.dropBack - 0.08)

/** Tinggi titik tengah area cetak badan dari hem (meter). */
export const zoneCenterY = (d: Dims, zone: 'front' | 'back') => (topOf(d, zone) + HEM_GAP) / 2

/** Ukuran area cetak dalam cm. Lebar diukur pada tampak depan (proyeksi datar). */
export function zoneSize(d: Dims, zone: Zone): { w: number; h: number } {
  if (zone === 'front' || zone === 'back') return { w: d.chest * 200 * 0.9, h: (topOf(d, zone) - HEM_GAP) * 100 }
  return { w: 10, h: 10 }
}

export function zoneFrames(d: Dims, bodyW: number, sleeveSize: number): Record<Zone, ZoneFrame> {
  const bodyH = bodyW / 2
  const ppc = bodyH / BODY_H / 100
  const frontX = (x: number) => (x + BODY_HALF_W) * ppc * 100
  const backX = (x: number) => bodyW / 2 + (-x + BODY_HALF_W) * ppc * 100
  const rowY = (y: number) => bodyH - y * ppc * 100
  const front = zoneSize(d, 'front')
  const back = zoneSize(d, 'back')
  // Kanvas lengan berpusat di titik cetak lengan (lihat printAttributes), tegak seperti dilihat dari samping.
  const sleeve = (canvas: CanvasId): ZoneFrame => ({
    canvas,
    cx: sleeveSize / 2,
    cy: sleeveSize / 2,
    sx: sleeveSize / (SLEEVE_SPAN * 100),
    sy: sleeveSize / (SLEEVE_SPAN * 100),
    rot: 0,
    ...zoneSize(d, 'sleeveL'),
  })
  return {
    front: {
      canvas: 'body',
      cx: frontX(0),
      cy: rowY(zoneCenterY(d, 'front')),
      sx: ppc,
      sy: ppc,
      rot: 0,
      ...front,
    },
    back: {
      canvas: 'body',
      cx: backX(0),
      cy: rowY(zoneCenterY(d, 'back')),
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

/** Lebar awal gambar baru: setengah area cetak, rasio terjaga. */
export const fitWidth = (pxW: number, pxH: number, z: { w: number; h: number }) =>
  Math.min(z.w * 0.5, ((z.h * 0.5) * pxW) / pxH)

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
  /** Hanya gambar lapisan di sisi ini (halaman kanvas desain). */
  only?: Zone
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
    if (f.canvas !== id || (p.only && layer.zone !== p.only)) continue
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

/** Lebar dan tinggi kotak lapisan dalam cm, sebelum diputar. Dipakai pegangan seleksi di kanvas desain. */
export function layerBox(ctx: CanvasRenderingContext2D, l: Layer, family: string): { w: number; h: number } {
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
