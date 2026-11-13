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

/** Lebar kanvas cetak badan (meter) per sisi dan tinggi total. Lebar total = 2 x tinggi supaya skala piksel sama. */
export const BODY_HALF_W = 0.375
export const BODY_H = 0.75
/** Lebar dan tinggi kanvas cetak lengan (meter). */
export const SLEEVE_SPAN = 0.2

export type ModelPart = 'body' | 'sleeveL' | 'sleeveR' | 'collar'

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/**
 * UV cetak dari proyeksi datar, dan masker cetak per titik (0 = hanya warna kain, 1 = isi kanvas).
 * Depan dan belakang badan masuk ke kanvas badan, sisi luar lengan ke kanvas lengan.
 * Masker menjaga cetakan tidak muncul di sisi lengan yang menghadap badan tanpa memutus UV,
 * sehingga segitiga di perbatasan tidak menyeret isi kanvas. Model hanya berisi permukaan luar
 * (`pnpm prepare-model`); bagian dalam kaos adalah sisi belakangnya dan diurus shader di Viewer.
 */
export function printAttributes(pos: ArrayLike<number>, nor: ArrayLike<number>, part: ModelPart, d: Dims) {
  const count = pos.length / 3
  const uv = new Float32Array(count * 2)
  const mask = new Float32Array(count)
  const side = part === 'sleeveR' ? -1 : 1
  for (let i = 0; i < count; i++) {
    if (part === 'collar') continue
    const [x, y, z] = [pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]]
    if (part === 'body') {
      uv[i * 2] = z > 0 ? 0.25 + x / (4 * BODY_HALF_W) : 0.75 - x / (4 * BODY_HALF_W)
      uv[i * 2 + 1] = y / BODY_H
      mask[i] = 1
    } else {
      uv[i * 2] = 0.5 - (side * (z - d.sleeve.z)) / SLEEVE_SPAN
      uv[i * 2 + 1] = 0.5 + (y - d.sleeve.y) / SLEEVE_SPAN
      // Hanya sisi lengan yang menghadap keluar. Sisi yang menghadap badan tidak ikut tercetak.
      mask[i] = smoothstep(0.1, 0.4, nor[i * 3] * side)
    }
  }
  return { uv, mask }
}
