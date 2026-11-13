import * as THREE from 'three'
import type { Fit, Garment, Neck, Sleeve, Thickness } from './slices/garment.ts'

/** Semua ukuran dalam meter, kaos ukuran M. Hem di y = 0, sisi depan menghadap +z. */
export type Dims = {
  H: number
  chest: number
  hem: number
  shoulder: number
  depth: number
  armhole: number
  slope: number
  neck: Neck
  neckHalf: number
  dropFront: number
  dropBack: number
  neckDepth: number
  sleeveRoot: number
  sleeveEnd: number
  sleeveLen: number
  sleeveAngle: number
  rib: number
  wrinkle: number
}

// ponytail: proporsi diperkirakan dari tabel ukuran kaos M umum. Ganti dengan tabel vendor saat ada (F8).
const FIT: Record<Fit, { H: number; chest: number; hem: number; shoulder: number; depth: number; armhole: number; slope: number }> = {
  slim: { H: 0.71, chest: 0.245, hem: 0.235, shoulder: 0.21, depth: 0.1, armhole: 0.2, slope: 0.045 },
  regular: { H: 0.72, chest: 0.26, hem: 0.255, shoulder: 0.225, depth: 0.11, armhole: 0.22, slope: 0.04 },
  boxy: { H: 0.68, chest: 0.285, hem: 0.285, shoulder: 0.25, depth: 0.12, armhole: 0.24, slope: 0.035 },
  oversized: { H: 0.76, chest: 0.3, hem: 0.3, shoulder: 0.285, depth: 0.13, armhole: 0.27, slope: 0.03 },
  cropped: { H: 0.52, chest: 0.27, hem: 0.27, shoulder: 0.235, depth: 0.115, armhole: 0.21, slope: 0.04 },
}
const NECK: Record<Neck, { half: number; front: number; back: number }> = {
  crew: { half: 0.085, front: 0.085, back: 0.02 },
  v: { half: 0.09, front: 0.2, back: 0.02 },
  scoop: { half: 0.12, front: 0.14, back: 0.03 },
}
const SLEEVE: Record<Sleeve, { len: number; end: number; angle: number }> = {
  short: { len: 0.2, end: 0.078, angle: 50 },
  threeQuarter: { len: 0.42, end: 0.058, angle: 60 },
  long: { len: 0.62, end: 0.045, angle: 66 },
}
const RIB = { thin: 0.007, standard: 0.011, thick: 0.016 }
const WRINKLE: Record<Thickness, number> = { thin: 0.0035, medium: 0.002, thick: 0.001 }

export function garmentDims(g: Garment): Dims {
  const f = FIT[g.fit]
  const n = NECK[g.neck]
  const s = SLEEVE[g.sleeve]
  const shoulder = f.shoulder * g.shoulder
  const endScale = g.fit === 'oversized' ? 1.25 : g.fit === 'boxy' ? 1.12 : 1
  return {
    H: f.H * g.bodyLength,
    chest: f.chest,
    hem: f.hem,
    shoulder,
    depth: f.depth,
    armhole: f.armhole,
    slope: f.slope,
    neck: g.neck,
    neckHalf: Math.min(n.half, shoulder * 0.6),
    // Leher depan tidak boleh lebih dalam dari ketiak, supaya permukaan tidak terlipat.
    dropFront: Math.min(n.front, f.armhole * 0.92),
    dropBack: n.back,
    neckDepth: f.depth * 0.62,
    sleeveRoot: f.armhole * 0.4,
    sleeveEnd: s.end * endScale,
    sleeveLen: s.len * g.sleeveLength,
    sleeveAngle: ((g.fit === 'oversized' ? s.angle - 4 : s.angle) * Math.PI) / 180,
    rib: RIB[g.ribWidth],
    wrinkle: WRINKLE[g.thickness],
  }
}

const SEG_U = 160
const SEG_V = 80
const V_ARM = 0.62
const SE = 2 / 2.6 // superelips: sisi kaos lebih rata dari silinder
const se = (c: number) => Math.sign(c) * Math.abs(c) ** SE
const smooth = (t: number) => t * t * (3 - 2 * t)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** Lebar kanvas cetak badan (meter) per sisi dan tinggi total. */
export const BODY_HALF_W = 0.45
export const BODY_H = 0.9

function neckCurve(nx: number, neck: Neck) {
  if (neck === 'v') return (1 - nx) ** 1.1
  if (neck === 'scoop') return (1 - nx * nx) ** 0.7
  return Math.sqrt(1 - nx * nx)
}

function columnTop(d: Dims, cx: number, front: boolean) {
  const xTop = d.shoulder * cx
  const nx = Math.abs(xTop) / d.neckHalf
  if (nx < 1) {
    const drop = front ? d.dropFront * neckCurve(nx, d.neck) : d.dropBack * Math.sqrt(1 - nx * nx)
    return { nx, top: d.H - drop, bTop: d.neckDepth * Math.sqrt(1 - nx * nx) }
  }
  return { nx, top: d.H - (d.slope * (Math.abs(xTop) - d.neckHalf)) / (d.shoulder - d.neckHalf), bTop: 0 }
}

/** Grid badan yang melingkar (kolom tidak diduplikasi). */
function bodyGrid(d: Dims) {
  const pos = new Float32Array(SEG_U * (SEG_V + 1) * 3)
  const yArm = d.H - d.armhole
  for (let j = 0; j <= SEG_V; j++) {
    const v = j / SEG_V
    for (let i = 0; i < SEG_U; i++) {
      const th = (i / SEG_U) * Math.PI * 2
      const cx = se(Math.cos(th))
      const cz = se(Math.sin(th))
      const col = columnTop(d, cx, cz >= 0)
      let y: number, a: number, b: number, wr: number
      if (v <= V_ARM) {
        const t = v / V_ARM
        y = t * yArm
        a = lerp(d.hem, d.chest, smooth(t))
        b = d.depth
        wr = 1
      } else {
        const t = (v - V_ARM) / (1 - V_ARM)
        y = yArm + t * (col.top - yArm)
        a = lerp(d.chest, d.shoulder, smooth(t))
        b = col.bTop + (d.depth - col.bTop) * Math.sqrt(Math.max(0, 1 - t ** 2.2))
        // Kerutan hilang di atas supaya jahitan bahu depan dan belakang tetap menempel.
        wr = 1 - smooth(t)
      }
      const x = a * cx
      const z = b * cz
      const w = d.wrinkle * wr * (Math.sin(41 * y + 7 * x) * 0.6 + Math.sin(17 * x - 29 * y + 1.3) * 0.4)
      const k = (j * SEG_U + i) * 3
      pos[k] = x + w * Math.cos(th)
      pos[k + 1] = y
      pos[k + 2] = z + w * Math.sin(th)
    }
  }
  return pos
}

function bodyGeometry(d: Dims) {
  const grid = bodyGrid(d)
  // Normal dihitung pada grid melingkar supaya sambungan samping tidak tampak patah.
  const full = new THREE.BufferGeometry()
  full.setAttribute('position', new THREE.BufferAttribute(grid, 3))
  const idx: number[] = []
  for (let j = 0; j < SEG_V; j++)
    for (let i = 0; i < SEG_U; i++) {
      const a = j * SEG_U + i
      const b = j * SEG_U + ((i + 1) % SEG_U)
      const c = a + SEG_U
      const e = b + SEG_U
      idx.push(a, c, b, b, c, e)
    }
  full.setIndex(idx)
  full.computeVertexNormals()
  const nrm = full.getAttribute('normal').array as Float32Array

  // Dua belahan (depan, belakang) dengan UV terpisah ke kiri dan kanan kanvas cetak.
  const half = SEG_U / 2
  const cols = half + 1
  const pos = new Float32Array(2 * cols * (SEG_V + 1) * 3)
  const nor = new Float32Array(pos.length)
  const uv = new Float32Array(2 * cols * (SEG_V + 1) * 2)
  const index: number[] = []
  for (let h = 0; h < 2; h++) {
    const base = h * cols * (SEG_V + 1)
    for (let j = 0; j <= SEG_V; j++)
      for (let c = 0; c < cols; c++) {
        const src = (j * SEG_U + ((h * half + c) % SEG_U)) * 3
        const dst = base + j * cols + c
        pos.set(grid.subarray(src, src + 3), dst * 3)
        nor.set(nrm.subarray(src, src + 3), dst * 3)
        const x = grid[src]
        const u = (x * (h === 0 ? 1 : -1)) / BODY_HALF_W / 2 + 0.5
        uv[dst * 2] = h * 0.5 + u * 0.5
        uv[dst * 2 + 1] = grid[src + 1] / BODY_H
      }
    for (let j = 0; j < SEG_V; j++)
      for (let c = 0; c < half; c++) {
        const a = base + j * cols + c
        const b = a + 1
        const cc = a + cols
        const e = b + cols
        index.push(a, cc, b, b, cc, e)
      }
  }
  full.dispose()
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3))
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
  geo.setIndex(index)
  return { geo, grid }
}

/**
 * Kerangka lengan, dipakai bersama oleh geometri dan kanvas cetak lengan.
 * s = 0 di pangkal tersembunyi di dalam badan, s = sIn di lubang lengan, s = 1 di ujung lengan.
 */
export function sleeveFrame(d: Dims) {
  const inside = d.sleeveRoot * 0.45
  const total = d.sleeveLen + inside
  const sIn = inside / total
  const radiusAt = (s: number) =>
    s < sIn ? d.sleeveRoot * (0.7 + 0.3 * (s / sIn)) : lerp(d.sleeveRoot, d.sleeveEnd, ((s - sIn) / (1 - sIn)) ** 0.8)
  const sCenter = (inside + Math.min(0.09, d.sleeveLen * 0.5)) / total
  // Keliling elips penampang (sumbu kedalaman 0.86 r), pendekatan Ramanujan.
  const circAt = (s: number) => {
    const a = radiusAt(s)
    const b = a * 0.86
    return Math.PI * (3 * (a + b) - Math.sqrt((3 * a + b) * (a + 3 * b)))
  }
  return { inside, total, sIn, radiusAt, sCenter, circAt }
}

const SEG_S = 28
const SEG_P = 48

function sleeveGeometry(d: Dims, side: 1 | -1) {
  const f = sleeveFrame(d)
  const dir = new THREE.Vector3(side * Math.cos(d.sleeveAngle), -Math.sin(d.sleeveAngle), 0)
  const up = new THREE.Vector3(side * Math.sin(d.sleeveAngle), Math.cos(d.sleeveAngle), 0)
  // Pusat lubang lengan: cincin menyentuh titik bahu.
  const seam = new THREE.Vector3(side * d.shoulder, d.H - d.slope, 0).addScaledVector(up, -d.sleeveRoot)
  // Pangkal tersembunyi masuk mendatar ke dalam badan, bukan menyusuri sumbu, supaya tidak mencuat di atas bahu.
  const hidden = seam.clone().add(new THREE.Vector3(-side * f.inside, -f.inside * 0.3, 0))
  const pos: number[] = []
  const uv: number[] = []
  const c = new THREE.Vector3()
  for (let i = 0; i <= SEG_S; i++) {
    const s = i / SEG_S
    const r = f.radiusAt(s)
    if (s < f.sIn) c.lerpVectors(hidden, seam, s / f.sIn)
    else c.copy(seam).addScaledVector(dir, ((s - f.sIn) / (1 - f.sIn)) * d.sleeveLen)
    for (let j = 0; j <= SEG_P; j++) {
      const p = (j / SEG_P) * Math.PI * 2
      // p = pi menghadap sisi luar lengan (arah up). Arah z dibalik per sisi supaya cetakan tidak tercermin.
      pos.push(
        c.x + up.x * -Math.cos(p) * r,
        c.y + up.y * -Math.cos(p) * r,
        c.z - side * Math.sin(p) * r * 0.86,
      )
      uv.push(s, j / SEG_P)
    }
  }
  const index: number[] = []
  const row = SEG_P + 1
  for (let i = 0; i < SEG_S; i++)
    for (let j = 0; j < SEG_P; j++) {
      const a = i * row + j
      const b = a + 1
      const cc = a + row
      const e = cc + 1
      index.push(a, b, cc, b, e, cc)
    }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  geo.setIndex(index)
  geo.computeVertexNormals()
  return geo
}

function collarGeometry(d: Dims, grid: Float32Array) {
  const pts: THREE.Vector3[] = []
  const top = SEG_V * SEG_U
  for (let i = 0; i < SEG_U; i++) {
    const th = (i / SEG_U) * Math.PI * 2
    if (columnTop(d, se(Math.cos(th)), true).nx >= 1) continue
    const k = (top + i) * 3
    pts.push(new THREE.Vector3(grid[k], grid[k + 1] + d.rib * 0.4, grid[k + 2]))
  }
  const curve = new THREE.CatmullRomCurve3(pts, true, 'centripetal')
  return { geo: new THREE.TubeGeometry(curve, 160, d.rib, 10, true), length: curve.getLength() }
}

export function buildGarment(d: Dims) {
  const body = bodyGeometry(d)
  const collar = collarGeometry(d, body.grid)
  return {
    body: body.geo,
    sleeveL: sleeveGeometry(d, 1),
    sleeveR: sleeveGeometry(d, -1),
    collar: collar.geo,
    collarLength: collar.length,
  }
}
