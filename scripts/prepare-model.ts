// Ubah model kaos mentah (ekspor CLO3D atau Marvelous Designer dari Sketchfab) jadi model web.
// Pakai: `pnpm prepare-model assets/models/<mentah>.glb public/models/<nama>.glb`
// Keluaran: empat node bernama body, sleeveL, sleeveR, collar dalam meter (hem di y = 0, depan menghadap +z),
// lalu ukuran yang dicetak di akhir disalin ke MODELS di lib/garment.ts.
import { Document, NodeIO } from '@gltf-transform/core'
import { simplify, weld } from '@gltf-transform/functions'
import { MeshoptSimplifier } from 'meshoptimizer'

const [input, output, ratioArg] = process.argv.slice(2)
if (!input || !output) throw new Error('Pakai: pnpm prepare-model <mentah.glb> <keluaran.glb> [rasio, bawaan 0.3]')
const RATIO = Number(ratioArg ?? 0.3)
type Part = 'body' | 'sleeveL' | 'sleeveR' | 'collar'

const io = new NodeIO()
const src = await io.read(input)

// 1. Kumpulkan segitiga kain dalam koordinat dunia. Benang jahit (material tanpa "FRONT") dibuang.
const pos: number[] = []
const nor: number[] = []
const uv: number[] = []
const idx: number[] = []
for (const node of src.getRoot().listNodes()) {
  const mesh = node.getMesh()
  if (!mesh) continue
  const m = node.getWorldMatrix()
  for (const prim of mesh.listPrimitives()) {
    if (!/FRONT/.test(prim.getMaterial()?.getName() ?? '')) continue
    const p = prim.getAttribute('POSITION')!.getArray()!
    const n = prim.getAttribute('NORMAL')!.getArray()!
    const t = prim.getAttribute('TEXCOORD_0')!.getArray()!
    const base = pos.length / 3
    for (let i = 0; i < p.length; i += 3) {
      const [x, y, z] = [p[i], p[i + 1], p[i + 2]]
      pos.push(m[0] * x + m[4] * y + m[8] * z + m[12], m[1] * x + m[5] * y + m[9] * z + m[13], m[2] * x + m[6] * y + m[10] * z + m[14])
      const [a, b, c] = [n[i], n[i + 1], n[i + 2]]
      const nx = m[0] * a + m[4] * b + m[8] * c
      const ny = m[1] * a + m[5] * b + m[9] * c
      const nz = m[2] * a + m[6] * b + m[10] * c
      const l = Math.hypot(nx, ny, nz) || 1
      nor.push(nx / l, ny / l, nz / l)
    }
    for (const v of t) uv.push(v)
    for (const i of prim.getIndices()!.getArray()!) idx.push(base + i)
  }
}
const V = pos.length / 3

// 2. Satuan meter bila sumbernya sentimeter.
// Math.max(...array) melempar error pada array sebesar ini, jadi pakai reduce.
const max = (a: number[]) => a.reduce((m, v) => Math.max(m, v), -Infinity)
const ys = pos.filter((_, i) => i % 3 === 1)
const unit = max(ys) + max(ys.map((y) => -y)) > 10 ? 0.01 : 1
for (let i = 0; i < pos.length; i++) pos[i] *= unit

// 3. Pulau (panel pola) lewat sambungan indeks.
const parent = Int32Array.from({ length: V }, (_, i) => i)
const find = (x: number) => {
  while (parent[x] !== x) x = parent[x] = parent[parent[x]]
  return x
}
for (let t = 0; t < idx.length; t += 3) {
  const a = find(idx[t])
  parent[find(idx[t + 1])] = a
  parent[find(idx[t + 2])] = a
}
// Sketchfab memecah mesh tiap 65 ribu titik, jadi satu panel bisa terbelah. Titik di posisi yang persis sama disatukan.
const seen = new Map<string, number>()
for (let v = 0; v < V; v++) {
  const key = `${pos[v * 3]},${pos[v * 3 + 1]},${pos[v * 3 + 2]}`
  const other = seen.get(key)
  if (other === undefined) seen.set(key, v)
  else parent[find(v)] = find(other)
}
const islands = new Map<number, number[]>()
for (let v = 0; v < V; v++) {
  const r = find(v)
  const list = islands.get(r)
  if (list) list.push(v)
  else islands.set(r, [v])
}

// 4. Badan diukur dari pulau terbesar (panel depan atau belakang).
const biggest = [...islands.values()].sort((a, b) => b.length - a.length)[0]
const span = (vs: number[], k: number) => {
  let lo = Infinity
  let hi = -Infinity
  for (const v of vs) {
    lo = Math.min(lo, pos[v * 3 + k])
    hi = Math.max(hi, pos[v * 3 + k])
  }
  return [lo, hi]
}
const [bx0, bx1] = span(biggest, 0)
const cx = (bx0 + bx1) / 2
const halfW = (bx1 - bx0) / 2
const [, top] = span(biggest, 1)

// 5. Golongkan pulau. Lengan: sebagian besar titiknya di luar lebar badan. Kerah: pulau kecil di sekitar leher.
const partOf = new Map<number, Part>()
for (const [root, vs] of islands) {
  const outside = vs.filter((v) => Math.abs(pos[v * 3] - cx) > halfW).length
  const [x0, x1] = span(vs, 0)
  const [y0, y1] = span(vs, 1)
  const mid = (x0 + x1) / 2 - cx
  let part: Part = 'body'
  if (outside > vs.length / 2) part = mid > 0 ? 'sleeveL' : 'sleeveR'
  else if (y0 > top - 0.12 && y1 - y0 < 0.12 && Math.abs(mid) < halfW * 0.55) part = 'collar'
  partOf.set(root, part)
}

// 6. Normalkan: tengah badan di x = 0 dan z = 0, hem di y = 0.
const bodyVs = [...islands.entries()].filter(([r]) => partOf.get(r) === 'body').flatMap(([, vs]) => vs)
const [z0, z1] = span(bodyVs, 2)
const [y0] = span(bodyVs, 1)
const cz = (z0 + z1) / 2
for (let v = 0; v < V; v++) {
  pos[v * 3] -= cx
  pos[v * 3 + 1] -= y0
  pos[v * 3 + 2] -= cz
}

// 7. Skala UV asli (sentimeter kain per satuan UV), dipakai untuk mengulang tekstur serat.
let geo = 0
let tex = 0
for (let t = 0; t < idx.length; t += 3) {
  const [a, b] = [idx[t], idx[t + 1]]
  geo += Math.hypot(pos[a * 3] - pos[b * 3], pos[a * 3 + 1] - pos[b * 3 + 1], pos[a * 3 + 2] - pos[b * 3 + 2])
  tex += Math.hypot(uv[a * 2] - uv[b * 2], uv[a * 2 + 1] - uv[b * 2 + 1])
}
const uvMeters = geo / tex

// 8. Ukuran untuk zona cetak.
const bodyAt = (test: (v: number) => boolean) => bodyVs.filter(test).map((v) => pos[v * 3 + 1])
const H = max(bodyVs.map((v) => pos[v * 3 + 1]))
const frontTop = max(bodyAt((v) => Math.abs(pos[v * 3]) < 0.01 && pos[v * 3 + 2] > 0))
const backTop = max(bodyAt((v) => Math.abs(pos[v * 3]) < 0.01 && pos[v * 3 + 2] < 0))
const sleeveVs = [...islands.entries()].filter(([r]) => partOf.get(r) === 'sleeveL').flatMap(([, vs]) => vs)
const mean = (k: number) => sleeveVs.reduce((s, v) => s + pos[v * 3 + k], 0) / sleeveVs.length
const sy = mean(1)
const sz = mean(2)
const sx = max(sleeveVs.filter((v) => Math.abs(pos[v * 3 + 1] - sy) < 0.02 && Math.abs(pos[v * 3 + 2] - sz) < 0.02).map((v) => pos[v * 3]))

// 9. Lapisan luar dan dalam. Kain punya dua permukaan (tebal kain sekitar 2,5 mm) yang hanya bertemu lewat posisi
// di tepi, tidak lewat indeks. Setelah disederhanakan, kedua permukaan saling tembus, jadi hanya permukaan luar
// yang disimpan. Bagian dalam kaos digambar dari sisi belakang permukaan luar (Viewer menggelapkannya).
// Permukaan = pulau sambungan indeks saja (tanpa penyatuan posisi di langkah 3). Tiap permukaan dinilai lewat
// suara semua titiknya: luar bila normal kebanyakan menjauhi sumbu bagiannya. Suara per permukaan tahan
// terhadap lipatan, yang membuat penilaian per titik sering keliru.
const shell = Int32Array.from({ length: V }, (_, i) => i)
const findShell = (x: number) => {
  while (shell[x] !== x) x = shell[x] = shell[shell[x]]
  return x
}
for (let t = 0; t < idx.length; t += 3) {
  const a = findShell(idx[t])
  shell[findShell(idx[t + 1])] = a
  shell[findShell(idx[t + 2])] = a
}
// Sumbu lengan: dari pangkal bahu ke titik tengah lengan.
const axisOf = (side: 1 | -1) => {
  const vs = [...islands.entries()].filter(([r]) => partOf.get(r) === (side > 0 ? 'sleeveL' : 'sleeveR')).flatMap(([, list]) => list)
  const c = [0, 1, 2].map((k) => vs.reduce((s, v) => s + pos[v * 3 + k], 0) / vs.length)
  const a = [side * halfW * 0.9, H - 0.05, 0]
  const d = c.map((x, k) => x - a[k])
  const l = Math.hypot(d[0], d[1], d[2])
  return { a, d: d.map((x) => x / l) }
}
const axes = { sleeveL: axisOf(1), sleeveR: axisOf(-1) }
const votes = new Map<number, number>()
for (let v = 0; v < V; v++) {
  const part = partOf.get(find(v))!
  const p = [pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2]]
  let r = [p[0], 0, p[2]]
  if (part === 'sleeveL' || part === 'sleeveR') {
    const { a, d } = axes[part]
    const q = p.map((x, k) => x - a[k])
    const t = q[0] * d[0] + q[1] * d[1] + q[2] * d[2]
    r = q.map((x, k) => x - d[k] * t)
  }
  const dot = nor[v * 3] * r[0] + nor[v * 3 + 1] * r[1] + nor[v * 3 + 2] * r[2]
  const s = findShell(v)
  votes.set(s, (votes.get(s) ?? 0) + Math.sign(dot))
}
// Pengekspor lain bisa membalik arah normal. Jadi arahnya dipastikan lewat geometri: di tiap sel badan
// (sudut keliling x tinggi), permukaan luar harus lebih jauh dari sumbu. Bila kelompok "normal keluar"
// lebih dekat ke sumbu, semua label dibalik.
const cells = new Map<string, number[]>()
for (const v of bodyVs) {
  const [x, y, z] = [pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2]]
  const key = `${Math.round(Math.atan2(z, x) * 20)},${Math.round(y * 50)}`
  const cell = cells.get(key) ?? [0, 0, 0, 0]
  const k = (votes.get(findShell(v)) ?? 0) > 0 ? 0 : 2
  cell[k] += Math.hypot(x, z)
  cell[k + 1]++
  cells.set(key, cell)
}
let agree = 0
for (const [a, na, b, nb] of cells.values()) if (na && nb) agree += a / na > b / nb ? 1 : -1
const flip = agree < 0
const isOuter = (v: number) => ((votes.get(findShell(v)) ?? 0) > 0) !== flip

// 10. Tulis satu mesh per bagian, lalu sambung titik kembar dan sederhanakan.
const doc = new Document()
const buffer = doc.createBuffer()
const scene = doc.createScene()
const srcAsset = src.getRoot().getAsset()
doc.getRoot().getAsset().copyright = JSON.stringify(srcAsset.extras ?? srcAsset.copyright ?? '')
for (const part of ['body', 'sleeveL', 'sleeveR', 'collar'] as Part[]) {
  const remap = new Map<number, number>()
  const p: number[] = []
  const n: number[] = []
  const t: number[] = []
  const ix: number[] = []
  for (let k = 0; k < idx.length; k += 3) {
    if (partOf.get(find(idx[k])) !== part || !isOuter(idx[k])) continue
    let tri = [idx[k], idx[k + 1], idx[k + 2]]
    // Urutan titik harus searah normal supaya sisi depan segitiga = sisi luar kaos (Viewer memakai gl_FrontFacing).
    const [a, b, c] = tri.map((v) => [pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2]])
    const e1 = b.map((x, i) => x - a[i])
    const e2 = c.map((x, i) => x - a[i])
    const face = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]]
    const along = tri.reduce((s, v) => s + face[0] * nor[v * 3] + face[1] * nor[v * 3 + 1] + face[2] * nor[v * 3 + 2], 0)
    if (along < 0) tri = [tri[0], tri[2], tri[1]]
    for (const v of tri) {
      let j = remap.get(v)
      if (j === undefined) {
        j = p.length / 3
        remap.set(v, j)
        p.push(pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2])
        n.push(nor[v * 3], nor[v * 3 + 1], nor[v * 3 + 2])
        t.push(uv[v * 2], uv[v * 2 + 1])
      }
      ix.push(j)
    }
  }
  const acc = (type: 'VEC3' | 'VEC2' | 'SCALAR', array: Float32Array<ArrayBuffer> | Uint32Array<ArrayBuffer>) =>
    doc.createAccessor().setType(type).setArray(array).setBuffer(buffer)
  const prim = doc
    .createPrimitive()
    .setAttribute('POSITION', acc('VEC3', new Float32Array(p)))
    .setAttribute('NORMAL', acc('VEC3', new Float32Array(n)))
    .setAttribute('TEXCOORD_0', acc('VEC2', new Float32Array(t)))
    .setIndices(acc('SCALAR', new Uint32Array(ix)))
  scene.addChild(doc.createNode(part).setMesh(doc.createMesh(part).addPrimitive(prim)))
}
await MeshoptSimplifier.ready
await doc.transform(weld(), simplify({ simplifier: MeshoptSimplifier, ratio: RATIO, error: 0.0005 }))
await io.write(output, doc)

const round = (v: number) => Math.round(v * 1000) / 1000
const tris = doc.getRoot().listMeshes().map((m) => `${m.getName()} ${m.listPrimitives()[0].getIndices()!.getCount() / 3}`)
console.log('segitiga:', tris.join(', '))
console.log(
  'dims:',
  JSON.stringify({
    H: round(H),
    chest: round(halfW),
    dropFront: round(H - frontTop),
    dropBack: round(H - backTop),
    sleeve: { x: round(sx), y: round(sy), z: round(sz) },
    uvMeters: round(uvMeters),
  }),
)
