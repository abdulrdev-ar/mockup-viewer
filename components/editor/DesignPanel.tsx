'use client'

import { useState } from 'react'
import { PRINT_FONTS } from '@/lib/fonts'
import { garmentDims } from '@/lib/garment'
import { DPI_WARNING, ZONE_LABEL, clampToZone, dpiOf, fitWidth, imageHeightCm, zoneSize } from '@/lib/print'
import type { FontId, ImageLayer, Layer, TextLayer } from '@/lib/slices/design'
import { useEditorStore, type EditorState } from '@/lib/store'
import { Section, Slider } from './controls'
import { readImageFile } from './image-file'
import styles from './editor.module.css'

const cm = (v: number) => `${v.toLocaleString('id-ID', { maximumFractionDigits: 1 })} cm`

/** Dipakai juga oleh tempel dari clipboard dan seret berkas ke kanvas. Gambar baru masuk ke sisi yang sedang diedit. */
export async function addImageFile(file: File) {
  const s = useEditorStore.getState()
  const r = await readImageFile(file)
  if ('error' in r) return s.showToast(r.error, 'error')
  const size = zoneSize(garmentDims(s.garment), s.surface)
  s.addImage(s.surface, r.src, r.w, r.h, Math.round(fitWidth(r.w, r.h, size) * 10) / 10)
}

/** Nama lapisan seperti di Canva: "Gambar 1", atau isi tulisannya. */
export function layerName(l: Layer, layers: Layer[]) {
  if (l.kind === 'image') return `Gambar ${layers.filter((x) => x.kind === 'image').indexOf(l) + 1}`
  const t = l.text.replace(/\s+/g, ' ').trim()
  return t ? (t.length > 24 ? `${t.slice(0, 24)}...` : t) : 'Tulisan kosong'
}

export function UploadPanel() {
  const surface = useEditorStore((s) => s.surface)
  return (
    <Section title="Unggah gambar">
      {/* Input file menutupi seluruh area: klik dan seret-lepas berkas ditangani browser secara native. */}
      <div className={styles.dropzone}>
        <span className={styles.dropTitle}>Seret gambar ke sini, atau pilih dari perangkat</span>
        <span className="label">PNG, JPG, WebP, SVG. Maksimum 20 MB.</span>
        <span className="btn btn-secondary" aria-hidden="true">
          Unggah Gambar
        </span>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          aria-label={`Unggah gambar ke sisi ${ZONE_LABEL[surface].toLowerCase()}`}
          className={styles.dropInput}
          onChange={(e) => {
            const file = e.target.files?.[0]
            e.target.value = ''
            if (file) void addImageFile(file)
          }}
        />
      </div>
      <p className={styles.note}>
        Gambar masuk ke sisi {ZONE_LABEL[surface].toLowerCase()}. Kamu juga bisa menyeret file langsung ke kanvas atau menempelnya dengan Ctrl+V.
      </p>
      <p className={styles.note}>Gambarmu diproses di perangkat ini dan tidak dikirim ke server.</p>
    </Section>
  )
}

const TEXT_PRESETS = [
  { label: 'Tambah Judul', size: 6, className: styles.presetTitle },
  { label: 'Tambah Subjudul', size: 3.5, className: styles.presetSub },
  { label: 'Tambah Teks Kecil', size: 2, className: styles.presetSmall },
]

export function TextPanel() {
  const surface = useEditorStore((s) => s.surface)
  const addText = useEditorStore((s) => s.addText)
  // Lengan lebih sempit, jadi ukuran awal tulisan dikecilkan.
  const scale = surface === 'front' || surface === 'back' ? 1 : 0.4
  return (
    <Section title="Tulisan">
      <div className={styles.presets}>
        {TEXT_PRESETS.map((p) => (
          <button key={p.label} type="button" className={`${styles.preset} ${p.className}`} onClick={() => addText(surface, 'Tulisanmu', p.size * scale)}>
            {p.label}
          </button>
        ))}
      </div>
      <p className={styles.note}>Tulisan muncul di tengah sisi {ZONE_LABEL[surface].toLowerCase()}. Seret untuk memindahkan, tarik sudutnya untuk mengubah ukuran.</p>
    </Section>
  )
}

/** Indeks tetangga di sisi yang sama: maju = lapisan berikutnya di atasnya, mundur = di bawahnya. */
function neighbour(layers: Layer[], l: Layer, dir: 1 | -1) {
  const i = layers.indexOf(l)
  for (let j = i + dir; j >= 0 && j < layers.length; j += dir) if (layers[j].zone === l.zone) return j
  return -1
}

export function LayersPanel() {
  const layers = useEditorStore((s) => s.layers)
  const surface = useEditorStore((s) => s.surface)
  const selectedId = useEditorStore((s) => s.selectedId)
  const selectLayer = useEditorStore((s) => s.selectLayer)
  const removeLayer = useEditorStore((s) => s.removeLayer)
  const moveLayer = useEditorStore((s) => s.moveLayer)
  const [dragId, setDragId] = useState<string | null>(null)
  // Paling depan di atas, seperti panel lapisan di Canva.
  const onSide = layers.filter((l) => l.zone === surface).reverse()
  const elsewhere = layers.length - onSide.length

  return (
    <Section title={`Lapisan sisi ${ZONE_LABEL[surface].toLowerCase()}`}>
      {onSide.length === 0 ? (
        <p className={styles.empty}>Belum ada gambar atau tulisan di sisi ini. Pilih Unggah atau Teks untuk menambahkan.</p>
      ) : (
        <ul className={styles.layerList}>
          {onSide.map((l) => (
            <li key={l.id} className={`${l.id === selectedId ? styles.layerActive : ''} ${l.id === dragId ? styles.layerDragging : ''}`}>
              <button
                type="button"
                draggable
                className={styles.layerSelect}
                aria-pressed={l.id === selectedId}
                onClick={() => selectLayer(l.id)}
                onDragStart={() => setDragId(l.id)}
                onDragEnd={() => setDragId(null)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => dragId && dragId !== l.id && moveLayer(dragId, layers.indexOf(l))}
              >
                <span className={styles.layerGrip} aria-hidden="true">
                  ⠿
                </span>
                <span>{layerName(l, layers)}</span>
              </button>
              <button type="button" className={styles.layerDelete} aria-label={`Hapus ${layerName(l, layers)}`} onClick={() => removeLayer(l.id)}>
                Hapus
              </button>
            </li>
          ))}
        </ul>
      )}
      {onSide.length > 1 && <p className={styles.note}>Seret baris untuk mengubah urutan. Yang paling atas tampil paling depan.</p>}
      {elsewhere > 0 && <p className={styles.note}>{elsewhere} lapisan lain ada di sisi kaos lainnya. Ganti sisi di atas kanvas untuk melihatnya.</p>}
    </Section>
  )
}

const FONT_GROUPS = [...new Set(Object.values(PRINT_FONTS).map((f) => f.group))]

/** Bilah konteks di atas kanvas: hanya pengaturan untuk lapisan yang sedang dipilih. */
export function ContextToolbar() {
  const layers = useEditorStore((s) => s.layers)
  const garment = useEditorStore((s) => s.garment)
  const selected = useEditorStore((s: EditorState) => s.layers.find((l) => l.id === s.selectedId))
  const updateLayer = useEditorStore((s) => s.updateLayer)
  const removeLayer = useEditorStore((s) => s.removeLayer)
  const duplicateLayer = useEditorStore((s) => s.duplicateLayer)
  const moveLayer = useEditorStore((s) => s.moveLayer)

  if (!selected) return <p className={`${styles.toolbar} ${styles.toolbarHint}`}>Klik gambar atau tulisan di kanvas untuk mengaturnya.</p>

  const area = zoneSize(garmentDims(garment), selected.zone)
  const update = (patch: Partial<ImageLayer> | Partial<TextLayer>) => {
    const next = { ...selected, ...patch } as Layer
    updateLayer(selected.id, { ...patch, ...clampToZone(next, area) })
  }
  const front = neighbour(layers, selected, 1)
  const back = neighbour(layers, selected, -1)

  return (
    <div className={styles.toolbar} role="toolbar" aria-label={`Atur ${layerName(selected, layers)}`}>
      {selected.kind === 'text' ? <TextTools layer={selected} update={update} /> : <ImageTools layer={selected} area={area} update={update} />}
      <details className={styles.more}>
        <summary className="btn btn-secondary">Lainnya</summary>
        <div className={styles.moreBody}>
          <Slider label="Putar" value={Math.round(selected.rotation)} min={-180} max={180} step={1} format={(v) => `${v}°`} onChange={(rotation) => update({ rotation })} />
          {selected.kind === 'text' && <TextMore layer={selected} update={update} />}
        </div>
      </details>
      <div className={styles.toolGroup}>
        <button type="button" className="btn btn-secondary" disabled={front < 0} onClick={() => moveLayer(selected.id, front)}>
          Ke Depan
        </button>
        <button type="button" className="btn btn-secondary" disabled={back < 0} onClick={() => moveLayer(selected.id, back)}>
          Ke Belakang
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => duplicateLayer(selected.id)}>
          Duplikat
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => removeLayer(selected.id)}>
          Hapus
        </button>
      </div>
    </div>
  )
}

function ImageTools({ layer, area, update }: { layer: ImageLayer; area: { w: number; h: number }; update: (p: Partial<ImageLayer>) => void }) {
  const dpi = Math.round(dpiOf(layer))
  // Lebar maksimum supaya gambar masih muat di area cetak.
  const maxW = Math.min(area.w, (area.h * layer.pxW) / layer.pxH)
  return (
    <>
      <label className={styles.toolField}>
        <span className="label">Lebar</span>
        <input
          type="number"
          className={`${styles.input} ${styles.inputNarrow}`}
          value={Math.round(layer.width * 10) / 10}
          min={1}
          max={Math.floor(maxW)}
          step={0.5}
          onChange={(e) => update({ width: Math.min(maxW, Math.max(1, Number(e.target.value) || 1)) })}
        />
        <span className="label">cm</span>
      </label>
      <p className={`label ${styles.toolInfo}`}>
        x {cm(imageHeightCm(layer))}, {dpi} dpi
      </p>
      {dpi < DPI_WARNING && (
        <output className={styles.toolWarning}>Resolusi rendah: hasil cetak bisa pecah. Perkecil gambar atau pakai file yang lebih besar.</output>
      )}
    </>
  )
}

function TextTools({ layer, update }: { layer: TextLayer; update: (p: Partial<TextLayer>) => void }) {
  return (
    <>
      <label className={`${styles.toolField} ${styles.toolText}`}>
        <span className="label">Tulisan</span>
        <textarea
          id="layer-text"
          className={styles.input}
          rows={1}
          value={layer.text}
          placeholder="Ketik tulisanmu di sini"
          onChange={(e) => update({ text: e.target.value })}
        />
      </label>
      <label className={styles.toolField}>
        <span className="label">Font</span>
        <select className={styles.input} value={layer.font} onChange={(e) => update({ font: e.target.value as FontId })}>
          {FONT_GROUPS.map((g) => (
            <optgroup key={g} label={g}>
              {Object.entries(PRINT_FONTS)
                .filter(([, f]) => f.group === g)
                .map(([id, f]) => (
                  <option key={id} value={id}>
                    {f.label}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
      </label>
      <label className={styles.toolField}>
        <span className="label">Tinggi</span>
        <input
          type="number"
          className={`${styles.input} ${styles.inputNarrow}`}
          value={Math.round(layer.size * 10) / 10}
          min={0.5}
          max={30}
          step={0.5}
          onChange={(e) => update({ size: Math.min(30, Math.max(0.5, Number(e.target.value) || 0.5)) })}
        />
        <span className="label">cm</span>
      </label>
      <label className={styles.toolField}>
        <span className="label">Warna</span>
        <input type="color" className={styles.toolColor} value={layer.color} onChange={(e) => update({ color: e.target.value.toUpperCase() })} />
      </label>
      <label className={styles.toolField}>
        <span className="label">Rata</span>
        <select className={styles.input} value={layer.align} onChange={(e) => update({ align: e.target.value as TextLayer['align'] })}>
          <option value="left">Kiri</option>
          <option value="center">Tengah</option>
          <option value="right">Kanan</option>
        </select>
      </label>
    </>
  )
}

function TextMore({ layer, update }: { layer: TextLayer; update: (p: Partial<TextLayer>) => void }) {
  return (
    <>
      <Slider label="Jarak huruf" value={layer.letterSpacing} min={-0.05} max={0.5} step={0.01} format={(v) => `${v.toFixed(2)} em`} onChange={(letterSpacing) => update({ letterSpacing })} />
      <Slider label="Jarak baris" value={layer.lineHeight} min={0.8} max={2} step={0.05} format={(v) => v.toFixed(2)} onChange={(lineHeight) => update({ lineHeight })} />
      <Slider label="Lengkungan" value={layer.arc} min={-180} max={180} step={5} format={(v) => (v === 0 ? 'Lurus' : `${v}°`)} onChange={(arc) => update({ arc })} />
      {layer.arc !== 0 && layer.text.includes('\n') && <p className={styles.note}>Tulisan melengkung digabung menjadi satu baris.</p>}
      <label className={styles.check}>
        <input type="checkbox" checked={layer.upper} onChange={(e) => update({ upper: e.target.checked })} />
        Huruf kapital semua
      </label>
    </>
  )
}
