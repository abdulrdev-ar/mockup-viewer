'use client'

import { useRef, useState } from 'react'
import { PRINT_FONTS } from '@/lib/fonts'
import { WRAP_W } from '@/lib/garment'
import { DPI_WARNING, dpiOf, fitWidth, imageHeightCm } from '@/lib/print'
import type { FontId, ImageLayer, Layer, TextLayer } from '@/lib/slices/design'
import { useEditorStore, type EditorState } from '@/lib/store'
import { viewerApi } from '@/lib/viewer-api'
import { Section, Slider } from './controls'
import { readImageFile } from './image-file'
import styles from './editor.module.css'

const cm = (v: number) => `${v.toLocaleString('id-ID', { maximumFractionDigits: 1 })} cm`

/** Titik kaos di bawah pointer, atau yang menghadap kamera. Dada depan bila pratinjau belum siap. */
const aimPoint = (clientX?: number, clientY?: number) => viewerApi.aim?.(clientX, clientY) ?? { x: 0, y: -7.5 }

/** Dipakai juga oleh tempel dari clipboard dan seret berkas ke pratinjau. */
export async function addImageFile(file: File, clientX?: number, clientY?: number) {
  const s = useEditorStore.getState()
  const r = await readImageFile(file)
  if ('error' in r) return s.showToast(r.error, 'error')
  s.addImage(aimPoint(clientX, clientY), r.src, r.w, r.h, Math.round(fitWidth(r.w, r.h) * 10) / 10)
}

/** Nama lapisan seperti di Canva: "Gambar 1", atau isi tulisannya. */
export function layerName(l: Layer, layers: Layer[]) {
  if (l.kind === 'image') return `Gambar ${layers.filter((x) => x.kind === 'image').indexOf(l) + 1}`
  const t = l.text.replace(/\s+/g, ' ').trim()
  return t ? (t.length > 24 ? `${t.slice(0, 24)}...` : t) : 'Tulisan kosong'
}

export function UploadPanel() {
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
          aria-label="Unggah gambar"
          className={styles.dropInput}
          onChange={(e) => {
            const file = e.target.files?.[0]
            e.target.value = ''
            if (file) void addImageFile(file)
          }}
        />
      </div>
      <p className={styles.note}>
        Gambar muncul di bagian kaos yang sedang menghadapmu. Kamu juga bisa menyeret file langsung ke kaos 3D atau menempelnya dengan Ctrl+V.
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
  const addText = useEditorStore((s) => s.addText)
  return (
    <Section title="Tulisan">
      <div className={styles.presets}>
        {TEXT_PRESETS.map((p) => (
          <button key={p.label} type="button" className={`${styles.preset} ${p.className}`} onClick={() => addText(aimPoint(), 'Tulisanmu', p.size)}>
            {p.label}
          </button>
        ))}
      </div>
      <p className={styles.note}>Tulisan muncul di bagian kaos yang sedang menghadapmu. Seret untuk memindahkan, tarik sudutnya untuk mengubah ukuran.</p>
    </Section>
  )
}

type RowDrag = { id: string; pointerId: number; startY: number; dy: number; slot: number }

/**
 * Panel lapisan di atas pratinjau. Urutan tampil = paling depan di atas.
 * Seret pegangan untuk mengurutkan (pointer, jadi jalan dengan sentuhan), atau Alt+panah atas/bawah di pegangan.
 */
export function LayersPanel({ onClose }: { onClose: () => void }) {
  const layers = useEditorStore((s) => s.layers)
  const selectedId = useEditorStore((s) => s.selectedId)
  const selectLayer = useEditorStore((s) => s.selectLayer)
  const removeLayer = useEditorStore((s) => s.removeLayer)
  const moveLayer = useEditorStore((s) => s.moveLayer)
  const [drag, setDrag] = useState<RowDrag | null>(null)
  const [announce, setAnnounce] = useState('')
  const listRef = useRef<HTMLOListElement>(null)
  const rows = [...layers].reverse()

  /** Pindahkan ke posisi tampil v (0 = paling atas) dan umumkan posisinya. */
  function moveTo(l: Layer, v: number) {
    const n = layers.length
    const target = Math.max(0, Math.min(n - 1, v))
    if (target === rows.indexOf(l)) return
    moveLayer(l.id, n - 1 - target)
    setAnnounce(`${layerName(l, layers)} sekarang di urutan ${target + 1} dari ${n}.`)
    // Pindah urutan menyusun ulang node DOM, jadi fokus dikembalikan ke pegangan lapisan ini setelah render.
    requestAnimationFrame(() => listRef.current?.querySelector<HTMLElement>(`[data-handle="${l.id}"]`)?.focus())
  }

  /** Posisi sisipan dari titik tengah baris lain (layout, bukan target event). */
  function slotAt(clientY: number, id: string) {
    const items = [...(listRef.current?.children ?? [])].filter((el) => (el as HTMLElement).dataset.id !== id)
    const i = items.findIndex((el) => {
      const r = el.getBoundingClientRect()
      return clientY < r.top + r.height / 2
    })
    return i < 0 ? items.length : i
  }

  function onHandleDown(e: React.PointerEvent, l: Layer) {
    if (e.button !== 0 || drag) return
    e.currentTarget.setPointerCapture(e.pointerId)
    setDrag({ id: l.id, pointerId: e.pointerId, startY: e.clientY, dy: 0, slot: rows.indexOf(l) })
  }
  function onHandleMove(e: React.PointerEvent) {
    if (!drag || e.pointerId !== drag.pointerId) return
    setDrag({ ...drag, dy: e.clientY - drag.startY, slot: slotAt(e.clientY, drag.id) })
  }
  function onHandleUp(e: React.PointerEvent, l: Layer) {
    if (!drag || e.pointerId !== drag.pointerId) return
    setDrag(null)
    moveTo(l, drag.slot)
  }

  return (
    // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- Escape menutup panel dari kontrol mana pun di dalamnya
    <section
      id="layers-panel"
      className={styles.layersPanel}
      aria-labelledby="layers-title"
      onKeyDown={(e) => {
        if (e.key !== 'Escape') return
        e.stopPropagation()
        if (drag) return setDrag(null)
        onClose()
      }}
    >
      <div className={styles.layersHead}>
        <h2 id="layers-title" className={`label ${styles.sectionTitle}`}>
          Lapisan
        </h2>
        <button type="button" className={styles.layerDelete} onClick={onClose}>
          Tutup
        </button>
      </div>
      {rows.length === 0 ? (
        <p className={styles.empty}>Belum ada gambar atau tulisan. Tambahkan dari panel Unggah atau Teks.</p>
      ) : (
        <ol ref={listRef} className={styles.layerList}>
          {rows.map((l, v) => {
            const name = layerName(l, layers)
            const dragging = drag?.id === l.id
            // Garis sisip di atas baris ke-slot di antara baris lain. Tidak tampil bila posisinya tidak berubah.
            const others = rows.filter((r) => r.id !== drag?.id)
            const moved = drag && drag.slot !== rows.findIndex((r) => r.id === drag.id)
            const dropBefore = moved && others[drag.slot]?.id === l.id
            const dropAfter = moved && drag.slot === others.length && others.at(-1)?.id === l.id
            return (
              <li
                key={l.id}
                data-id={l.id}
                className={`${l.id === selectedId ? styles.layerActive : ''} ${dragging ? styles.layerDragging : ''} ${dropBefore ? styles.dropBefore : ''} ${dropAfter ? styles.dropAfter : ''}`}
                style={dragging ? { translate: `0 ${drag.dy}px` } : undefined}
              >
                <button
                  type="button"
                  data-handle={l.id}
                  className={styles.layerGrip}
                  aria-label={`Urutkan ${name}, urutan ${v + 1} dari ${rows.length}. Seret, atau tekan Alt dan panah atas atau bawah.`}
                  aria-keyshortcuts="Alt+ArrowUp Alt+ArrowDown"
                  onPointerDown={(e) => onHandleDown(e, l)}
                  onPointerMove={onHandleMove}
                  onPointerUp={(e) => onHandleUp(e, l)}
                  onPointerCancel={() => setDrag(null)}
                  onKeyDown={(e) => {
                    if (!e.altKey || (e.key !== 'ArrowUp' && e.key !== 'ArrowDown')) return
                    e.preventDefault()
                    moveTo(l, v + (e.key === 'ArrowUp' ? -1 : 1))
                  }}
                >
                  <span aria-hidden="true">⠿</span>
                </button>
                <button type="button" className={styles.layerSelect} aria-pressed={l.id === selectedId} onClick={() => selectLayer(l.id)}>
                  {name}
                </button>
                <button
                  type="button"
                  className={styles.layerDelete}
                  aria-label={`Hapus ${name}`}
                  onClick={(e) => {
                    removeLayer(l.id)
                    // Baris ini hilang: fokus pindah ke baris berikutnya, atau ke tombol Tutup bila daftar kosong.
                    const panel = e.currentTarget.closest('section')
                    requestAnimationFrame(() =>
                      (panel?.querySelector<HTMLElement>(`li:nth-child(${Math.min(v + 1, rows.length - 1)}) [data-handle]`) ?? panel?.querySelector('button'))?.focus(),
                    )
                  }}
                >
                  Hapus
                </button>
              </li>
            )
          })}
        </ol>
      )}
      {rows.length > 1 && <p className={styles.note}>Paling atas tampil paling depan. Seret pegangan di kiri untuk mengubah urutan.</p>}
      <p className="sr-only" aria-live="polite">
        {announce}
      </p>
    </section>
  )
}

const FONT_GROUPS = [...new Set(Object.values(PRINT_FONTS).map((f) => f.group))]

/** Bilah konteks di atas pratinjau: hanya pengaturan untuk lapisan yang sedang dipilih. */
export function ContextToolbar() {
  const layers = useEditorStore((s) => s.layers)
  const selected = useEditorStore((s: EditorState) => s.layers.find((l) => l.id === s.selectedId))
  const updateLayer = useEditorStore((s) => s.updateLayer)
  const removeLayer = useEditorStore((s) => s.removeLayer)
  const duplicateLayer = useEditorStore((s) => s.duplicateLayer)
  const moveLayer = useEditorStore((s) => s.moveLayer)

  if (!selected)
    return (
      <p className={styles.toolbarHint}>
        {layers.length === 0
          ? 'Tambahkan gambar dari panel Unggah atau tulisan dari panel Teks, lalu atur langsung di kaos.'
          : 'Ketuk gambar atau tulisan di kaos untuk mengaturnya. Seret kain atau latar untuk memutar kaos.'}
      </p>
    )

  const update = (patch: Partial<ImageLayer> | Partial<TextLayer>) => updateLayer(selected.id, patch)
  const i = layers.indexOf(selected)

  return (
    <div className={styles.toolbar} role="toolbar" aria-label={`Atur ${layerName(selected, layers)}`}>
      {selected.kind === 'text' ? <TextTools layer={selected} update={update} /> : <ImageTools layer={selected} update={update} />}
      <details className={styles.more}>
        <summary className="btn btn-secondary">Lainnya</summary>
        <div className={styles.moreBody}>
          <Slider label="Putar" value={Math.round(selected.rotation)} min={-180} max={180} step={1} format={(v) => `${v}°`} onChange={(rotation) => update({ rotation })} />
          {selected.kind === 'text' && <TextMore layer={selected} update={update} />}
        </div>
      </details>
      <div className={styles.toolGroup}>
        <button type="button" className="btn btn-secondary" disabled={i === layers.length - 1} onClick={() => moveLayer(selected.id, i + 1)}>
          Ke Depan
        </button>
        <button type="button" className="btn btn-secondary" disabled={i === 0} onClick={() => moveLayer(selected.id, i - 1)}>
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

function ImageTools({ layer, update }: { layer: ImageLayer; update: (p: Partial<ImageLayer>) => void }) {
  const dpi = Math.round(dpiOf(layer))
  return (
    <>
      <label className={styles.toolField}>
        <span className="label">Lebar</span>
        <input
          type="number"
          className={`${styles.input} ${styles.inputNarrow}`}
          value={Math.round(layer.width * 10) / 10}
          min={1}
          max={WRAP_W}
          step={0.5}
          onChange={(e) => update({ width: Math.min(WRAP_W, Math.max(1, Number(e.target.value) || 1)) })}
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
