'use client'

import { useState, useSyncExternalStore } from 'react'
import type { MaterialId, PartId } from '@/lib/slices/garment'
import type { BackgroundType, LightPreset } from '@/lib/slices/scene'
import type { Quality } from '@/lib/slices/ui'
import { useEditorStore } from '@/lib/store'
import { viewerApi } from '@/lib/viewer-api'
import { ColorField, Section, Segmented, Slider } from './controls'
import { readImageFile } from './image-file'
import styles from './editor.module.css'

const PALETTE = [
  { name: 'Putih', hex: '#F7F7F5' },
  { name: 'Hitam', hex: '#1C1C1E' },
  { name: 'Abu muda', hex: '#C9C9C7' },
  { name: 'Abu tua', hex: '#5A5D61' },
  { name: 'Navy', hex: '#1F2A44' },
  { name: 'Merah bata', hex: '#9C3B2E' },
  { name: 'Marun', hex: '#6B1F2A' },
  { name: 'Hijau botol', hex: '#1F4D3A' },
  { name: 'Krem', hex: '#E8DCC4' },
  { name: 'Mustard', hex: '#D9A42B' },
  { name: 'Biru langit', hex: '#8DB8E0' },
  { name: 'Cokelat kopi', hex: '#5B4033' },
]

const PART_OPTIONS: { value: PartId | 'all'; label: string }[] = [
  { value: 'all', label: 'Semua' },
  { value: 'body', label: 'Badan' },
  { value: 'sleeveL', label: 'Lengan kiri' },
  { value: 'sleeveR', label: 'Lengan kanan' },
  { value: 'collar', label: 'Rib kerah' },
]

type EyeDropperCtor = new () => { open: () => Promise<{ sRGBHex: string }> }
const noop = () => () => {}

export function ColorPanel() {
  const colors = useEditorStore((s) => s.garment.colors)
  const recent = useEditorStore((s) => s.recentColors)
  const setPartColor = useEditorStore((s) => s.setPartColor)
  const [part, setPart] = useState<PartId | 'all'>('all')
  const current = colors[part === 'all' ? 'body' : part]
  const apply = (hex: string) => setPartColor(part, hex)
  // Dibaca lewat useSyncExternalStore supaya render server dan klien sama (tanpa hydration mismatch).
  const hasEyeDropper = useSyncExternalStore(
    noop,
    () => 'EyeDropper' in window,
    () => false,
  )
  const EyeDropper = hasEyeDropper ? (window as unknown as { EyeDropper: EyeDropperCtor }).EyeDropper : undefined

  return (
    <>
      <Section title="Bagian yang diwarnai">
        <Segmented label="Bagian yang diwarnai" value={part} options={PART_OPTIONS} onChange={setPart} />
      </Section>
      <Section title="Palet">
        <div className={styles.swatches}>
          {PALETTE.map((c) => (
            <button
              key={c.hex}
              type="button"
              className={styles.swatch}
              style={{ background: c.hex }}
              aria-label={c.name}
              aria-pressed={current.toUpperCase() === c.hex}
              title={c.name}
              onClick={() => apply(c.hex)}
            />
          ))}
        </div>
      </Section>
      <Section title="Warna sendiri">
        <ColorField label="Kode warna" value={current} onChange={apply} />
        {EyeDropper && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() =>
              new EyeDropper()
                .open()
                .then((r) => apply(r.sRGBHex.toUpperCase()))
                .catch(() => {})
            }
          >
            Ambil Warna dari Layar
          </button>
        )}
      </Section>
      <Section title="Terakhir dipakai">
        {recent.length === 0 ? (
          <p className={styles.empty}>Warna yang kamu pakai akan muncul di sini.</p>
        ) : (
          <div className={styles.swatches}>
            {recent.map((hex) => (
              <button
                key={hex}
                type="button"
                className={styles.swatch}
                style={{ background: hex }}
                aria-label={`Warna ${hex}`}
                title={hex}
                onClick={() => apply(hex)}
              />
            ))}
          </div>
        )}
      </Section>
      {part !== 'all' && (
        <button type="button" className="btn btn-secondary" onClick={() => setPartColor('all', current)}>
          Samakan Semua Bagian
        </button>
      )}
    </>
  )
}

const MATERIALS: { value: MaterialId; label: string; text: string }[] = [
  { value: 'combed', label: 'Katun combed', text: 'Serat halus dan rapat, kilap lembut.' },
  { value: 'carded', label: 'Katun carded', text: 'Lebih berserat, ada bintil kecil pada kain.' },
  { value: 'dryfit', label: 'Polyester dry-fit', text: 'Jaring halus, lebih mengilap dan tipis.' },
  { value: 'pique', label: 'Pique', text: 'Tekstur bintil kotak, biasa di kaos polo.' },
]

export function MaterialPanel() {
  const material = useEditorStore((s) => s.garment.material)
  const thickness = useEditorStore((s) => s.garment.thickness)
  const setGarment = useEditorStore((s) => s.setGarment)
  return (
    <>
      <Section title="Bahan" note="Tampilan bahan ini simulasi. Untuk keputusan produksi, minta sampel dari vendor.">
        <fieldset className={styles.choiceList}>
          <legend className="sr-only">Bahan</legend>
          {MATERIALS.map((m) => (
            <label key={m.value} className={styles.choice}>
              <input
                type="radio"
                name="material"
                checked={material === m.value}
                onChange={() => setGarment({ material: m.value })}
              />
              <strong>{m.label}</strong>
              <span>{m.text}</span>
            </label>
          ))}
        </fieldset>
      </Section>
      <Section
        title="Ketebalan"
        note="Kesan tebal dan tipis di sini adalah perkiraan visual. Untuk gramasi nyata, tanyakan ke vendor."
      >
        <Segmented
          label="Ketebalan"
          value={thickness}
          options={[
            { value: 'thin', label: 'Tipis' },
            { value: 'medium', label: 'Sedang' },
            { value: 'thick', label: 'Tebal' },
          ]}
          onChange={(v) => setGarment({ thickness: v })}
        />
      </Section>
    </>
  )
}

const pct = (v: number) => `${Math.round(v * 100)}%`

// Kerah, potongan, dan lengan tiga perempat menunggu model 3D (docs/09-aset.md).
export function ShapePanel() {
  const sleeve = useEditorStore((s) => s.garment.sleeve)
  const setGarment = useEditorStore((s) => s.setGarment)
  return (
    <>
      <Section title="Lengan">
        <Segmented
          label="Bentuk lengan"
          value={sleeve === 'long' ? 'long' : 'short'}
          options={[
            { value: 'short', label: 'Pendek' },
            { value: 'long', label: 'Panjang' },
          ]}
          onChange={(v) => setGarment({ sleeve: v })}
        />
      </Section>
      <p className={styles.note}>
        Model 3D:{' '}
        <a href="https://sketchfab.com/3d-models/short-sleeve-t-shirt-0b1df31312444436b390a687875bdbfe" target="_blank" rel="noopener noreferrer">
          Short Sleeve T-Shirt
        </a>{' '}
        dan{' '}
        <a href="https://sketchfab.com/3d-models/long-sleeve-t-shirt-ef22cf345c174b569fdfa6a653a6bf6f" target="_blank" rel="noopener noreferrer">
          Long Sleeve T-Shirt
        </a>{' '}
        oleh chokybali, lisensi{' '}
        <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">
          CC BY 4.0
        </a>
        , disederhanakan untuk web.
      </p>
    </>
  )
}

export function ScenePanel() {
  const sc = useEditorStore((s) => s.scene)
  const quality = useEditorStore((s) => s.quality)
  const showGuides = useEditorStore((s) => s.showGuides)
  const setScene = useEditorStore((s) => s.setScene)
  const setBackground = useEditorStore((s) => s.setBackground)
  const setQuality = useEditorStore((s) => s.setQuality)
  const setShowGuides = useEditorStore((s) => s.setShowGuides)
  const showToast = useEditorStore((s) => s.showToast)
  const bg = sc.background
  return (
    <>
      <Section title="Cahaya">
        <Segmented<LightPreset>
          label="Cahaya"
          value={sc.light}
          options={[
            { value: 'neutral', label: 'Netral' },
            { value: 'warm', label: 'Hangat' },
            { value: 'contrast', label: 'Kontras tinggi' },
          ]}
          onChange={(v) => setScene({ light: v })}
        />
        <Slider label="Kekuatan cahaya" value={sc.lightIntensity} min={0.5} max={1.5} step={0.05} format={pct} onChange={(v) => setScene({ lightIntensity: v })} />
      </Section>
      <Section title="Latar">
        <Segmented<BackgroundType>
          label="Jenis latar"
          value={bg.type}
          options={[
            { value: 'color', label: 'Warna' },
            { value: 'gradient', label: 'Gradasi' },
            { value: 'image', label: 'Gambar' },
            { value: 'transparent', label: 'Transparan' },
          ]}
          onChange={(v) => setBackground({ type: v })}
        />
        {(bg.type === 'color' || bg.type === 'gradient') && (
          <ColorField label={bg.type === 'gradient' ? 'Warna atas' : 'Warna latar'} value={bg.color} onChange={(c) => setBackground({ color: c })} />
        )}
        {bg.type === 'gradient' && <ColorField label="Warna bawah" value={bg.color2} onChange={(c) => setBackground({ color2: c })} />}
        {bg.type === 'image' && (
          <label className={`btn btn-secondary ${styles.fileButton}`}>
            {bg.image ? 'Ganti Gambar Latar' : 'Unggah Gambar Latar'}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                e.target.value = ''
                if (!file) return
                const r = await readImageFile(file)
                if ('error' in r) showToast(r.error, 'error')
                else setBackground({ image: r.src })
              }}
            />
          </label>
        )}
        {bg.type === 'transparent' && <p className={styles.note}>Latar transparan hanya tersimpan saat kamu mengunduh PNG.</p>}
      </Section>
      <Section title="Tampilan">
        <Segmented<Quality>
          label="Kualitas tampilan"
          value={quality}
          options={[
            { value: 'low', label: 'Rendah' },
            { value: 'medium', label: 'Sedang' },
            { value: 'high', label: 'Tinggi' },
          ]}
          onChange={setQuality}
        />
        <label className={styles.check}>
          <input type="checkbox" checked={showGuides} onChange={(e) => setShowGuides(e.target.checked)} />
          Tampilkan garis zona cetak saat desain dipilih
        </label>
      </Section>
    </>
  )
}

export function ExportPanel() {
  const [format, setFormat] = useState<'png' | 'jpeg'>('png')
  const [transparent, setTransparent] = useState(false)
  const sizes = [1080, 2048, 3072, 4096].filter((s) => s <= viewerApi.maxSize)
  const [size, setSize] = useState(Math.min(2048, sizes.at(-1) ?? 1080))
  const [state, setState] = useState<'idle' | 'busy'>('idle')
  const showToast = useEditorStore((s) => s.showToast)

  async function download() {
    if (!viewerApi.exportImage) return showToast('Tampilan 3D belum siap. Tunggu sebentar lalu coba lagi.', 'error')
    setState('busy')
    try {
      const blob = await viewerApi.exportImage({ format, size, transparent: format === 'png' && transparent })
      const stamp = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, '')
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `mockup-kaos-${stamp}.${format === 'png' ? 'png' : 'jpg'}`
      a.click()
      setTimeout(() => URL.revokeObjectURL(a.href), 1000)
      showToast('Gambar sudah diunduh.')
    } catch {
      showToast('Gambar belum berhasil dibuat. Coba resolusi yang lebih kecil, atau muat ulang halaman.', 'error')
    } finally {
      setState('idle')
    }
  }

  return (
    <>
      <Section title="Format">
        <Segmented
          label="Format"
          value={format}
          options={[
            { value: 'png', label: 'PNG' },
            { value: 'jpeg', label: 'JPG' },
          ]}
          onChange={setFormat}
        />
        {format === 'png' && (
          <label className={styles.check}>
            <input type="checkbox" checked={transparent} onChange={(e) => setTransparent(e.target.checked)} />
            Latar transparan
          </label>
        )}
      </Section>
      <Section
        title="Resolusi"
        note={
          viewerApi.maxSize < 4096
            ? `Perangkat ini belum bisa membuat resolusi lebih tinggi dari ${viewerApi.maxSize} px.`
            : 'Gambar persegi. Resolusi lebih tinggi butuh waktu lebih lama.'
        }
      >
        <Segmented
          label="Resolusi"
          value={String(size)}
          options={sizes.map((s) => ({ value: String(s), label: `${s} px` }))}
          onChange={(v) => setSize(Number(v))}
        />
      </Section>
      <p className={styles.note}>Warna di layar bisa berbeda dari hasil cetak.</p>
      <button type="button" className="btn btn-primary" disabled={state === 'busy'} onClick={download}>
        {state === 'busy' ? 'Membuat gambar...' : format === 'png' ? 'Unduh PNG' : 'Unduh JPG'}
      </button>
    </>
  )
}
