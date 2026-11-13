import * as THREE from 'three'
import type { MaterialId, Thickness } from './slices/garment.ts'

/** Parameter material per bahan. tile = lebar satu ulangan tekstur serat dalam meter. */
export const FABRIC: Record<
  MaterialId,
  { roughness: number; sheen: number; sheenRoughness: number; normal: number; tile: number }
> = {
  combed: { roughness: 0.86, sheen: 0.25, sheenRoughness: 0.8, normal: 0.45, tile: 0.03 },
  carded: { roughness: 0.93, sheen: 0.15, sheenRoughness: 0.9, normal: 0.75, tile: 0.04 },
  dryfit: { roughness: 0.5, sheen: 0.45, sheenRoughness: 0.4, normal: 0.3, tile: 0.025 },
  pique: { roughness: 0.88, sheen: 0.2, sheenRoughness: 0.85, normal: 0.9, tile: 0.035 },
}

export const THICKNESS_NORMAL: Record<Thickness, number> = { thin: 0.75, medium: 1, thick: 1.3 }

const SIZE = 256
const TAU = Math.PI * 2

// Noise nilai yang berulang (tileable) pada kisi P x P.
const hash = (x: number, y: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return s - Math.floor(s)
}
function noise(x: number, y: number, p: number) {
  const fx = (x / SIZE) * p
  const fy = (y / SIZE) * p
  const ix = Math.floor(fx)
  const iy = Math.floor(fy)
  const tx = fx - ix
  const ty = fy - iy
  const g = (a: number, b: number) => hash(((a % p) + p) % p, ((b % p) + p) % p)
  const sx = tx * tx * (3 - 2 * tx)
  const sy = ty * ty * (3 - 2 * ty)
  const top = g(ix, iy) + (g(ix + 1, iy) - g(ix, iy)) * sx
  const bot = g(ix, iy + 1) + (g(ix + 1, iy + 1) - g(ix, iy + 1)) * sx
  return top + (bot - top) * sy
}

const HEIGHT: Record<MaterialId, (x: number, y: number) => number> = {
  // Rajut jersey: rusuk vertikal dengan jahitan miring bergantian.
  combed: (x, y) => {
    const slant = Math.floor(x / 4) % 2 ? 1.2 : -1.2
    return Math.abs(Math.sin((Math.PI * x) / 8)) ** 0.6 * (0.75 + 0.25 * Math.sin((TAU * y) / 8 + slant)) + 0.08 * noise(x, y, 64)
  },
  // Lebih kasar dan berbintil (slub) dari benang carded.
  carded: (x, y) => {
    const slant = Math.floor(x / 4) % 2 ? 1.2 : -1.2
    const knit = Math.abs(Math.sin((Math.PI * x) / 8)) ** 0.6 * (0.7 + 0.3 * Math.sin((TAU * y) / 8 + slant))
    return knit + 0.35 * noise(x, y, 8) + 0.15 * noise(x, y, 64)
  },
  // Jaring halus berlubang, baris digeser setengah sel.
  dryfit: (x, y) => {
    const row = Math.floor(y / 8)
    const u = (((x + (row % 2) * 4) % 8) + 8) % 8 / 8 - 0.5
    const v = (y % 8) / 8 - 0.5
    return 1 - Math.exp(-(u * u + v * v) / 0.02)
  },
  // Pique: bintil persegi besar.
  pique: (x, y) => 0.5 + 0.5 * Math.cos((TAU * x) / 16) * Math.cos((TAU * y) / 16) + 0.1 * noise(x, y, 32),
}

/** Normal map RGBA (SIZE x SIZE) dari peta tinggi bahan. Murni, bisa diuji tanpa browser. */
export function fabricNormalData(id: MaterialId, strength = 2) {
  const h = HEIGHT[id]
  const heights = new Float32Array(SIZE * SIZE)
  for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) heights[y * SIZE + x] = h(x, y)
  const at = (x: number, y: number) => heights[((y + SIZE) % SIZE) * SIZE + ((x + SIZE) % SIZE)]
  const out = new Uint8Array(SIZE * SIZE * 4)
  for (let y = 0; y < SIZE; y++)
    for (let x = 0; x < SIZE; x++) {
      const dx = (at(x + 1, y) - at(x - 1, y)) * strength
      const dy = (at(x, y + 1) - at(x, y - 1)) * strength
      const len = Math.hypot(dx, dy, 1)
      const k = (y * SIZE + x) * 4
      out[k] = ((-dx / len) * 0.5 + 0.5) * 255
      out[k + 1] = ((-dy / len) * 0.5 + 0.5) * 255
      out[k + 2] = ((1 / len) * 0.5 + 0.5) * 255
      out[k + 3] = 255
    }
  return out
}

const cache = new Map<MaterialId, THREE.DataTexture>()

export function fabricNormalTexture(id: MaterialId) {
  let tex = cache.get(id)
  if (!tex) {
    tex = new THREE.DataTexture(fabricNormalData(id), SIZE, SIZE, THREE.RGBAFormat)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.magFilter = THREE.LinearFilter
    tex.minFilter = THREE.LinearMipmapLinearFilter
    tex.generateMipmaps = true
    tex.needsUpdate = true
    cache.set(id, tex)
  }
  return tex
}
