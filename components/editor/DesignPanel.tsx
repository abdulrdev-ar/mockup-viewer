'use client'

import { useState } from 'react'
import { PRINT_FONTS } from '@/lib/fonts'
import { garmentDims } from '@/lib/garment'
import { DPI_WARNING, ZONE_LABEL, ZONES, clampToZone, dpiOf, fitWidth, imageHeightCm, zoneSize } from '@/lib/print'
import type { FontId, ImageLayer, Layer, TextLayer, Zone } from '@/lib/slices/design'
import { useEditorStore } from '@/lib/store'
import { ColorField, Section, Segmented, Slider } from './controls'
import { readImageFile } from './image-file'
import styles from './editor.module.css'

const ZONE_OPTIONS = ZONES.map((z) => ({ value: z, label: ZONE_LABEL[z] }))
const cm = (v: number) => `${v.toLocaleString('id-ID', { maximumFractionDigits: 1 })} cm`

/** Dipakai juga oleh tempel dari clipboard di Editor. */
export async function addImageFile(file: File, zone: Zone) {
  const s = useEditorStore.getState()
  const r = await readImageFile(file)
  if ('error' in r) return s.showToast(r.error, 'error')
  const size = zoneSize(garmentDims(s.garment), zone)
  s.addImage(zone, r.src, r.w, r.h, Math.round(fitWidth(r.w, r.h, size) * 10) / 10)
  s.setPanel('design')
}

function layerName(l: Layer) {
  if (l.kind === 'image') return `Gambar, ${ZONE_LABEL[l.zone]}`
  const t = l.text.replace(/\s+/g, ' ').trim()
  return `Tulisan "${t.length > 18 ? `${t.slice(0, 18)}...` : t}", ${ZONE_LABEL[l.zone]}`
}

export default function DesignPanel() {
  const layers = useEditorStore((s) => s.layers)
  const selectedId = useEditorStore((s) => s.selectedId)
  const addText = useEditorStore((s) => s.addText)
  const selectLayer = useEditorStore((s) => s.selectLayer)
  const removeLayer = useEditorStore((s) => s.removeLayer)
  const [zone, setZone] = useState<Zone>('front')
  const selected = layers.find((l) => l.id === selectedId)

  return (
    <>
      <Section title="Tambahkan ke">
        <Segmented label="Zona cetak untuk desain baru" value={zone} options={ZONE_OPTIONS} onChange={setZone} />
      </Section>

      <Section title="Gambar dan tulisan">
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
            aria-label="Unggah gambar desain"
            className={styles.dropInput}
            onChange={(e) => {
              const file = e.target.files?.[0]
              e.target.value = ''
              if (file) void addImageFile(file, zone)
            }}
          />
        </div>
        <button type="button" className="btn btn-secondary" onClick={() => addText(zone)}>
          Tambah Tulisan
        </button>
        <p className={styles.note}>Gambarmu diproses di perangkat ini dan tidak dikirim ke server.</p>
      </Section>

      <Section title="Lapisan">
        {layers.length === 0 ? (
          <p className={styles.empty}>Belum ada gambar atau tulisan. Unggah gambar atau tekan Tambah Tulisan untuk memulai.</p>
        ) : (
          <ul className={styles.layerList}>
            {layers.map((l) => (
              <li key={l.id} className={l.id === selectedId ? styles.layerActive : undefined}>
                <button type="button" className={styles.layerSelect} aria-pressed={l.id === selectedId} onClick={() => selectLayer(l.id === selectedId ? null : l.id)}>
                  {layerName(l)}
                </button>
                <button type="button" className={styles.layerDelete} aria-label={`Hapus ${layerName(l)}`} onClick={() => removeLayer(l.id)}>
                  Hapus
                </button>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {selected && <LayerEditor key={selected.id} layer={selected} />}
    </>
  )
}

function LayerEditor({ layer }: { layer: Layer }) {
  const garment = useEditorStore((s) => s.garment)
  const updateLayer = useEditorStore((s) => s.updateLayer)
  const size = zoneSize(garmentDims(garment), layer.zone)
  const update = (patch: Partial<ImageLayer> | Partial<TextLayer>) => {
    const next = { ...layer, ...patch } as Layer
    updateLayer(layer.id, { ...patch, ...clampToZone(next, zoneSize(garmentDims(garment), next.zone)) })
  }

  return (
    <Section title={layer.kind === 'image' ? 'Atur gambar' : 'Atur tulisan'}>
      <Segmented
        label="Zona cetak"
        value={layer.zone}
        options={ZONE_OPTIONS}
        onChange={(z) => {
          const zs = zoneSize(garmentDims(garment), z)
          const width = layer.kind === 'image' ? Math.min(layer.width, fitWidth(layer.pxW, layer.pxH, zs) / 0.8) : undefined
          update({ zone: z, x: 0, y: 0, ...(width ? { width } : {}) })
        }}
      />
      {layer.kind === 'text' && <TextFields layer={layer} update={update} />}
      {layer.kind === 'image' && (
        <>
          <Slider label="Lebar" value={layer.width} min={1} max={Math.max(1, size.w)} step={0.1} format={cm} onChange={(width) => update({ width })} />
          <ImageInfo layer={layer} />
        </>
      )}
      <Slider label="Geser kiri dan kanan" value={layer.x} min={-size.w / 2} max={size.w / 2} step={0.1} format={cm} onChange={(x) => update({ x })} />
      <Slider label="Geser atas dan bawah" value={layer.y} min={-size.h / 2} max={size.h / 2} step={0.1} format={cm} onChange={(y) => update({ y })} />
      <Slider label="Putar" value={layer.rotation} min={-180} max={180} step={1} format={(v) => `${v}°`} onChange={(rotation) => update({ rotation })} />
      <div className={styles.row}>
        <button type="button" className="btn btn-secondary" onClick={() => update({ x: 0, y: 0 })}>
          Tengahkan
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => update({ rotation: 0 })}>
          Luruskan
        </button>
      </div>
      <p className={styles.note}>Zona {ZONE_LABEL[layer.zone].toLowerCase()} berukuran {cm(size.w)} x {cm(size.h)} pada kaos ukuran M.</p>
    </Section>
  )
}

function ImageInfo({ layer }: { layer: ImageLayer }) {
  const dpi = Math.round(dpiOf(layer))
  return (
    <div className={styles.info}>
      <p className="label">
        Ukuran cetak: {cm(layer.width)} x {cm(imageHeightCm(layer))}
      </p>
      <p className="label">
        Kerapatan: {dpi} dpi ({layer.pxW} x {layer.pxH} px)
      </p>
      {dpi < DPI_WARNING && (
        <output className={styles.warning}>
          <strong>Resolusi rendah.</strong> Gambar ini hanya {dpi} dpi pada ukuran cetak ini, sehingga hasil cetak bisa tampak pecah.
          Perkecil gambar atau pakai file yang lebih besar.
        </output>
      )}
    </div>
  )
}

const FONT_GROUPS = [...new Set(Object.values(PRINT_FONTS).map((f) => f.group))]

function TextFields({ layer, update }: { layer: TextLayer; update: (p: Partial<TextLayer>) => void }) {
  return (
    <>
      <label className={styles.field}>
        <span className="label">Isi tulisan</span>
        <textarea
          className={styles.input}
          rows={2}
          value={layer.text}
          placeholder="Ketik tulisanmu di sini"
          onChange={(e) => update({ text: e.target.value })}
        />
      </label>
      <label className={styles.field}>
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
      <Slider label="Ukuran huruf" value={layer.size} min={0.8} max={15} step={0.1} format={cm} onChange={(size) => update({ size })} />
      <ColorField label="Warna tulisan" value={layer.color} onChange={(color) => update({ color })} />
      <Segmented
        label="Rata teks"
        value={layer.align}
        options={[
          { value: 'left', label: 'Kiri' },
          { value: 'center', label: 'Tengah' },
          { value: 'right', label: 'Kanan' },
        ]}
        onChange={(align) => update({ align })}
      />
      <Slider label="Jarak huruf" value={layer.letterSpacing} min={-0.05} max={0.5} step={0.01} format={(v) => `${v.toFixed(2)} em`} onChange={(letterSpacing) => update({ letterSpacing })} />
      <Slider label="Jarak baris" value={layer.lineHeight} min={0.8} max={2} step={0.05} format={(v) => v.toFixed(2)} onChange={(lineHeight) => update({ lineHeight })} />
      <Slider
        label="Lengkungan"
        value={layer.arc}
        min={-180}
        max={180}
        step={5}
        format={(v) => (v === 0 ? 'Lurus' : `${v}°`)}
        onChange={(arc) => update({ arc })}
      />
      {layer.arc !== 0 && layer.text.includes('\n') && <p className={styles.note}>Tulisan melengkung digabung menjadi satu baris.</p>}
      <label className={styles.check}>
        <input type="checkbox" checked={layer.upper} onChange={(e) => update({ upper: e.target.checked })} />
        Huruf kapital semua
      </label>
    </>
  )
}
