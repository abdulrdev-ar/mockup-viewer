import type { Garment } from './slices/garment.ts'

/**
 * Ukuran model dalam meter. Hem di y = 0, tengah badan di x = 0 dan z = 0,
 * sisi depan menghadap +z, lengan kiri pemakai di +x.
 */
export type Dims = {
  H: number
  /** setengah lebar badan */
  chest: number
  dropFront: number
  dropBack: number
  /** titik tengah cetakan di sisi luar lengan kiri. Lengan kanan dicerminkan. */
  sleeve: { x: number; y: number; z: number }
  /** panjang kain (meter) per satu satuan UV asli model, untuk mengulang tekstur serat */
  uvMeters: number
}

// Angka dicetak oleh `pnpm prepare-model`. Ubah bersama berkas modelnya. Sumber dan lisensi: docs/09-aset.md.
export const MODELS = {
  short: {
    url: '/models/tshirt-short.glb',
    dims: { H: 0.694, chest: 0.182, dropFront: 0.068, dropBack: 0.004, sleeve: { x: 0.27, y: 0.474, z: -0.055 }, uvMeters: 0.175 },
  },
  long: {
    url: '/models/tshirt-long.glb',
    dims: { H: 0.692, chest: 0.181, dropFront: 0.067, dropBack: 0.003, sleeve: { x: 0.292, y: 0.277, z: -0.033 }, uvMeters: 0.175 },
  },
} satisfies Record<string, { url: string; dims: Dims }>

export type ModelId = keyof typeof MODELS
// Lengan tiga perempat belum punya model (docs/09-aset.md), jadi memakai model lengan pendek.
export const modelOf = (g: Garment): ModelId => (g.sleeve === 'long' ? 'long' : 'short')
export const garmentDims = (g: Garment): Dims => MODELS[modelOf(g)].dims

/** Tinggi kanvas cetak (meter), diukur dari hem. */
export const BODY_H = 0.75
/** Kanvas cetak membungkus seluruh kaos: lebar = keliling badan setinggi dada, tinggi = BODY_H (cm). */
export const WRAP_W = 96
export const WRAP_H = BODY_H * 100

export type ModelPart = 'body' | 'sleeveL' | 'sleeveR' | 'collar'

/** Penampang badan di satu ketinggian, didekati elips: setengah lebar, pusat z, setengah tebal (meter). */
type Section = { a: number; zc: number; b: number }
const STEP = 0.02

/** Penampang badan tiap 2 cm dari titik-titik mesh badan. Pita tanpa titik memakai pita terdekat. */
export function bodySections(pos: ArrayLike<number>): Section[] {
  const n = Math.round(BODY_H / STEP) + 1
  const raw = Array.from({ length: n }, () => ({ a: 0, zf: -Infinity, zb: Infinity }))
  for (let i = 0; i < pos.length; i += 3) {
    const [x, y, z] = [pos[i], pos[i + 1], pos[i + 2]]
    const r = raw[Math.min(n - 1, Math.max(0, Math.round(y / STEP)))]
    r.a = Math.max(r.a, Math.abs(x))
    // Tebal diukur di garis tengah, jauh dari lengan.
    if (Math.abs(x) < 0.03) {
      r.zf = Math.max(r.zf, z)
      r.zb = Math.min(r.zb, z)
    }
  }
  const out: (Section | null)[] = raw.map((r) => (r.a > 0.02 && r.zf - r.zb > 0.04 ? { a: r.a, zc: (r.zf + r.zb) / 2, b: (r.zf - r.zb) / 2 } : null))
  for (let i = 1; i < n; i++) out[i] ??= out[i - 1]
  for (let i = n - 2; i >= 0; i--) out[i] ??= out[i + 1]
  if (!out[0]) throw new Error('mesh badan kosong')
  return out as Section[]
}

const speed = (t: number, r: number) => Math.hypot(Math.cos(t), r * Math.sin(t))
/** Panjang busur elips (sumbu x = 1, sumbu z = r) dari tengah depan sampai sudut t, metode Simpson. */
function arc(t: number, r: number) {
  const n = 24
  const h = t / n
  let s = speed(0, r) + speed(t, r)
  for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * speed(i * h, r)
  return (s * h) / 3
}

/**
 * UV cetak dari posisi titik untuk segitiga lepas (geometri non-indexed). u = keliling badan
 * (0,5 = tengah depan, 0 dan 1 = tengah belakang), v = tinggi. Karena hanya bergantung pada posisi,
 * cetakan menyambung di jahitan badan, lengan, dan kerah.
 */
export function wrapUv(pos: ArrayLike<number>, sections: Section[]) {
  const count = pos.length / 3
  const uv = new Float32Array(count * 2)
  for (let i = 0; i < count; i++) {
    const [x, y, z] = [pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]]
    const f = Math.min(sections.length - 1, Math.max(0, y / STEP))
    const lo = sections[Math.floor(f)]
    const hi = sections[Math.ceil(f)]
    const w = f - Math.floor(f)
    const a = lo.a + (hi.a - lo.a) * w
    const b = lo.b + (hi.b - lo.b) * w
    const zc = lo.zc + (hi.zc - lo.zc) * w
    // ponytail: lengan dipetakan lewat elips badan, jadi cetakan di lengan sedikit melebar. Ganti dengan UV pola bila kurang rapi.
    const t = Math.atan2(x / a, (z - zc) / b)
    uv[i * 2] = 0.5 + arc(t, b / a) / (4 * arc(Math.PI / 2, b / a))
    uv[i * 2 + 1] = y / BODY_H
  }
  // Segitiga yang melintasi tengah belakang: titik di u kecil digeser ke u > 1, tekstur memakai RepeatWrapping.
  for (let i = 0; i < count; i += 3) {
    const u = [uv[i * 2], uv[i * 2 + 2], uv[i * 2 + 4]]
    if (Math.max(...u) - Math.min(...u) > 0.5) for (let j = 0; j < 3; j++) if (u[j] < 0.5) uv[(i + j) * 2] += 1
  }
  return uv
}
