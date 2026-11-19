// Pemeriksaan logika inti tanpa browser: `pnpm check`.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fabricNormalData } from '../lib/fabric.ts'
import { BODY_H, MODELS, WRAP_W, bodySections, wrapUv } from '../lib/garment.ts'
import { dpiOf, hitHandle, hitLayer, imageHeightCm, placeLayer } from '../lib/print.ts'
import type { ImageLayer, Layer } from '../lib/slices/design.ts'
import { DEFAULT_GARMENT } from '../lib/slices/garment.ts'
import { flushHistory, holdHistory, redo, undo, useEditorStore } from '../lib/store.ts'

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
}

// 3. UV bungkus pada badan tiruan berpenampang elips (setengah lebar a, setengah tebal b).
const near = (v: number, want: number, msg: string) => assert.ok(Math.abs(v - want) < 0.005, `${msg}: ${v} bukan ${want}`)
const tube = (a: number, b: number) => {
  const pts: number[] = []
  for (let y = 0; y <= 0.7; y += 0.01) for (let t = 0; t < Math.PI * 2; t += 0.05) pts.push(a * Math.sin(t), y, b * Math.cos(t))
  return bodySections(pts)
}
const oval = tube(0.18, 0.13)
const uvAt = (sec: ReturnType<typeof bodySections>, ...p: number[]) => wrapUv(p, sec)
near(uvAt(oval, 0, 0.4, 0.13)[0], 0.5, 'tengah depan')
near(uvAt(oval, 0, 0.4, 0.13)[1], 0.4 / BODY_H, 'tinggi')
near(uvAt(oval, 0.18, 0.4, 0)[0], 0.75, 'sisi kiri pemakai')
near(uvAt(oval, -0.18, 0.4, 0)[0], 0.25, 'sisi kanan pemakai')
// Pada lingkaran, sudut 45 derajat = seperdelapan keliling.
near(uvAt(tube(0.15, 0.15), 0.15 * Math.SQRT1_2, 0.4, 0.15 * Math.SQRT1_2)[0], 0.625, 'panjang busur')
// Segitiga di tengah belakang tidak menyeret seluruh kanvas: u ketiga titiknya berdekatan.
const seam = uvAt(oval, 0.01, 0.4, -0.13, -0.01, 0.4, -0.13, 0, 0.42, -0.13)
assert.ok(Math.max(seam[0], seam[2], seam[4]) - Math.min(seam[0], seam[2], seam[4]) < 0.05, 'segitiga tengah belakang terbelah')

// 4. Hitungan cetak dan posisi di kanvas yang melingkar.
const img: ImageLayer = { id: 'a', kind: 'image', x: 47, y: 0, rotation: 0, src: '', pxW: 1200, pxH: 600, width: 20 }
assert.equal(Math.round(dpiOf(img)), 152)
assert.deepEqual(placeLayer(50, -50), { x: 50 - WRAP_W, y: -37.5 })
const box = (l: Layer) => (l.kind === 'image' ? { w: l.width, h: imageHeightCm(l) } : { w: 0, h: 0 })
// Gambar di x = 47 (lebar 20) menyeberang tengah belakang, jadi titik x = -40 masih mengenainya.
assert.equal(hitLayer([img], box, { x: -40, y: 0 })?.id, 'a')
assert.equal(hitLayer([img], box, { x: 20, y: 0 }), undefined)
assert.equal(hitHandle(img, box(img), 1, { x: 47, y: -5 - 4 }, 1.4), 4, 'pegangan putar')
assert.equal(hitHandle(img, box(img), 1, { x: 57 - WRAP_W, y: 5 }, 1.4), 2, 'sudut kanan bawah lewat jahitan')

// 5. Migrasi proyek versi 2: zona dihapus, belakang pindah ke tengah belakang.
const migrate = useEditorStore.persist.getOptions().migrate!
const old = { layers: [{ ...img, zone: 'front', x: 1, y: 2 }, { ...img, id: 'b', zone: 'back', x: 0, y: 0 }] }
const migrated = (await migrate(old, 2)) as unknown as { layers: Layer[] }
assert.equal(migrated.layers[0].x, 1)
assert.equal(Math.abs(migrated.layers[1].x), WRAP_W / 2)
assert.ok(migrated.layers.every((l) => !('zone' in l)), 'zona masih ada')

// 6. Riwayat: satu rentetan perubahan = satu langkah undo.
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
// Seret di 3D dengan jeda lebih dari 400 ms tetap satu langkah undo.
const before = useEditorStore.getState().past.length
holdHistory(true)
s.setPartColor('body', '#333333')
await new Promise((r) => setTimeout(r, 450))
s.setPartColor('body', '#444444')
holdHistory(false)
assert.equal(useEditorStore.getState().past.length, before + 1)

// 7. Lapisan: urutan array = urutan tumpukan, duplikat tepat di atas aslinya.
useEditorStore.setState({ layers: [] })
s.addText({ x: 0, y: 0 }, 'A', 5)
s.addText({ x: 0, y: 0 }, 'B', 5)
const names = () => useEditorStore.getState().layers.map((l) => (l.kind === 'text' ? l.text : ''))
const a = useEditorStore.getState().layers[0]
s.moveLayer(a.id, 1)
assert.deepEqual(names(), ['B', 'A'])
s.duplicateLayer(a.id)
assert.deepEqual(names(), ['B', 'A', 'A'])

console.log('check: OK')
