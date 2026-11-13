// Pemeriksaan logika inti tanpa browser: `pnpm check`.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fabricNormalData } from '../lib/fabric.ts'
import { BODY_H, MODELS, printAttributes } from '../lib/garment.ts'
import { clampToZone, dpiOf, zoneFrames, zoneSize, ZONES } from '../lib/print.ts'
import type { ImageLayer } from '../lib/slices/design.ts'
import { DEFAULT_GARMENT } from '../lib/slices/garment.ts'
import { flushHistory, redo, undo, useEditorStore } from '../lib/store.ts'

// 1. Normal map bahan valid (komponen z selalu menghadap keluar).
for (const id of ['combed', 'carded', 'dryfit', 'pique'] as const) {
  const d = fabricNormalData(id)
  assert.equal(d.length, 256 * 256 * 4)
  for (let i = 0; i < d.length; i += 4) assert.ok(d[i + 2] >= 127, `${id}: normal z ke dalam`)
}

// 2. Berkas model punya keempat bagian, dan ukuran di MODELS cocok dengan isinya (salin ulang dari `pnpm prepare-model`).
for (const [id, m] of Object.entries(MODELS)) {
  const glb = readFileSync(new URL(`../public${m.url}`, import.meta.url))
  const json = JSON.parse(glb.subarray(20, 20 + glb.readUInt32LE(12)).toString('utf8'))
  const names: string[] = json.nodes.map((n: { name: string }) => n.name)
  for (const part of ['body', 'sleeveL', 'sleeveR', 'collar']) assert.ok(names.includes(part), `${id}: bagian ${part} tidak ada`)
  const body = json.nodes.find((n: { name: string }) => n.name === 'body')
  const max = json.accessors[json.meshes[body.mesh].primitives[0].attributes.POSITION].max
  assert.ok(Math.abs(max[1] - m.dims.H) < 0.002, `${id}: tinggi model ${max[1]} tidak sama dengan dims.H ${m.dims.H}`)
  assert.ok(m.dims.H < BODY_H, `${id}: model lebih tinggi dari kanvas badan`)

  // Zona cetak di dalam kanvas.
  const frames = zoneFrames(m.dims, 4096, 1024)
  for (const z of ZONES) {
    const fr = frames[z]
    const size = zoneSize(m.dims, z)
    assert.ok(size.w > 0 && size.h > 0, `${id}: zona ${z} kosong`)
    const limit = fr.canvas === 'body' ? [4096, 2048] : [1024, 1024]
    assert.ok(fr.cx > 0 && fr.cx < limit[0] && fr.cy > 0 && fr.cy < limit[1], `${id}: zona ${z} di luar kanvas`)
  }
}

// 3. UV cetak: depan ke separuh kiri kanvas badan, belakang ke kanan.
const d = MODELS.short.dims
const sp = d.sleeve
const pa = printAttributes([0, 0.4, 0.1, 0, 0.4, -0.1], [0, 0, 1, 0, 0, -1], 'body', d)
assert.deepEqual([pa.uv[0], +pa.uv[1].toFixed(4), pa.mask[0]], [0.25, +(0.4 / BODY_H).toFixed(4), 1])
assert.deepEqual([pa.uv[2], pa.mask[1]], [0.75, 1])
// Sisi luar lengan di titik cetak jatuh di tengah kanvas lengan, lengan kanan dicerminkan. Sisi yang menghadap badan tidak tercetak.
for (const [part, side] of [['sleeveL', 1], ['sleeveR', -1]] as const) {
  const a = printAttributes([side * sp.x, sp.y, sp.z, side * 0.2, sp.y, sp.z], [side, 0, 0, -side, 0, 0], part, d)
  assert.deepEqual([a.uv[0], a.uv[1], a.mask[0], a.mask[1]], [0.5, 0.5, 1, 0], `${part}: cetakan lengan salah tempat`)
}

// 4. Hitungan cetak.
const img: ImageLayer = { id: 'a', kind: 'image', zone: 'front', x: 50, y: -50, rotation: 0, src: '', pxW: 1200, pxH: 600, width: 20 }
assert.equal(Math.round(dpiOf(img)), 152)
assert.deepEqual(clampToZone(img, { w: 30, h: 40 }), { x: 5, y: -15 })

// 5. Riwayat: satu rentetan perubahan = satu langkah undo.
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
