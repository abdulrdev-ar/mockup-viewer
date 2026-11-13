// Pemeriksaan logika inti tanpa browser: `pnpm check`.
import assert from 'node:assert/strict'
import * as THREE from 'three'
import { fabricNormalData } from '../lib/fabric.ts'
import { buildGarment, garmentDims, sleeveFrame } from '../lib/garment.ts'
import { clampToZone, dpiOf, zoneFrames, zoneSize, ZONES } from '../lib/print.ts'
import type { ImageLayer } from '../lib/slices/design.ts'
import { DEFAULT_GARMENT, type Fit, type Neck, type Sleeve } from '../lib/slices/garment.ts'
import { flushHistory, redo, undo, useEditorStore } from '../lib/store.ts'

// 1. Normal map bahan valid (komponen z selalu menghadap keluar).
for (const id of ['combed', 'carded', 'dryfit', 'pique'] as const) {
  const d = fabricNormalData(id)
  assert.equal(d.length, 256 * 256 * 4)
  for (let i = 0; i < d.length; i += 4) assert.ok(d[i + 2] >= 127, `${id}: normal z ke dalam`)
}

// 2. Semua kombinasi bentuk menghasilkan geometri sehat dengan normal menghadap keluar.
const fits: Fit[] = ['slim', 'regular', 'boxy', 'oversized', 'cropped']
const necks: Neck[] = ['crew', 'v', 'scoop']
const sleeves: Sleeve[] = ['short', 'threeQuarter', 'long']
for (const fit of fits)
  for (const neck of necks)
    for (const sleeve of sleeves) {
      const label = `${fit}/${neck}/${sleeve}`
      const d = garmentDims({ ...DEFAULT_GARMENT, fit, neck, sleeve, bodyLength: 1.15 })
      const g = buildGarment(d)
      for (const geo of [g.body, g.sleeveL, g.sleeveR, g.collar]) {
        const p = geo.getAttribute('position').array
        for (const v of p) assert.ok(Number.isFinite(v), `${label}: posisi tidak valid`)
      }
      // Badan: titik tengah depan setinggi dada, normal mengarah +z.
      const pos = g.body.getAttribute('position')
      const nor = g.body.getAttribute('normal')
      let best = -1
      let bestScore = Infinity
      for (let i = 0; i < pos.count; i++) {
        const score = Math.abs(pos.getX(i)) + Math.abs(pos.getY(i) - d.H * 0.4) - pos.getZ(i)
        if (score < bestScore) {
          bestScore = score
          best = i
        }
      }
      assert.ok(nor.getZ(best) > 0.5, `${label}: normal badan depan ke dalam`)
      // UV badan di dalam kanvas.
      const uv = g.body.getAttribute('uv')
      for (let i = 0; i < uv.count; i++) {
        assert.ok(uv.getX(i) >= 0 && uv.getX(i) <= 1 && uv.getY(i) >= 0 && uv.getY(i) <= 1, `${label}: UV keluar`)
      }
      // Lengan: normal searah vektor dari sumbu ke permukaan.
      for (const [geo, side] of [[g.sleeveL, 1], [g.sleeveR, -1]] as const) {
        const sp = geo.getAttribute('position')
        const sn = geo.getAttribute('normal')
        const f = sleeveFrame(d)
        const up = new THREE.Vector3(side * Math.sin(d.sleeveAngle), Math.cos(d.sleeveAngle), 0)
        const i = 10 * 49 + 24 // baris tengah, sisi luar (p = pi)
        const n = new THREE.Vector3(sn.getX(i), sn.getY(i), sn.getZ(i))
        assert.ok(n.dot(up) > 0.5, `${label}: normal lengan ke dalam (sisi ${side}, total ${f.total.toFixed(2)})`)
        assert.ok(sp.count === 29 * 49)
      }
      // Zona cetak di dalam kanvas.
      const frames = zoneFrames(d, 4096, 1024)
      for (const z of ZONES) {
        const fr = frames[z]
        const size = zoneSize(d, z)
        assert.ok(size.w > 0 && size.h > 0, `${label}: zona ${z} kosong`)
        const limit = fr.canvas === 'body' ? [4096, 2048] : [1024, 1024]
        assert.ok(fr.cx > 0 && fr.cx < limit[0] && fr.cy > 0 && fr.cy < limit[1], `${label}: zona ${z} di luar kanvas`)
      }
    }

// 3. Hitungan cetak.
const img: ImageLayer = { id: 'a', kind: 'image', zone: 'front', x: 50, y: -50, rotation: 0, src: '', pxW: 1200, pxH: 600, width: 20 }
assert.equal(Math.round(dpiOf(img)), 152)
assert.deepEqual(clampToZone(img, { w: 30, h: 40 }), { x: 5, y: -15 })

// 4. Riwayat: satu rentetan perubahan = satu langkah undo.
useEditorStore.setState({ hydrated: true })
const s = useEditorStore.getState()
s.setPartColor('body', '#111111')
s.setPartColor('body', '#222222')
flushHistory()
assert.equal(useEditorStore.getState().past.length, 1)
undo()
assert.equal(useEditorStore.getState().garment.colors.body, DEFAULT_GARMENT.colors.body)
redo()
assert.equal(useEditorStore.getState().garment.colors.body, '#222222')

console.log('check: OK')
