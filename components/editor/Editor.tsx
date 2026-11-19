'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { saveEvents, type SaveStatus } from '@/lib/idb-storage'
import { placeLayer } from '@/lib/print'
import type { CameraPreset, PanelId } from '@/lib/slices/ui'
import { redo, undo, useEditorStore } from '@/lib/store'
import { ContextToolbar, LayersPanel, TextPanel, UploadPanel, addImageFile } from './DesignPanel'
import { ColorPanel, ExportPanel, MaterialPanel, ScenePanel, ShapePanel } from './panels'
import Viewer from './Viewer'
import styles from './editor.module.css'

// Urutan rel mengikuti alur kerja: tambah desain dulu, lalu atur kaos, lalu unduh.
const PANELS: { id: PanelId; label: string; render: () => React.ReactNode }[] = [
  { id: 'upload', label: 'Unggah', render: () => <UploadPanel /> },
  { id: 'text', label: 'Teks', render: () => <TextPanel /> },
  { id: 'color', label: 'Warna', render: () => <ColorPanel /> },
  { id: 'material', label: 'Bahan', render: () => <MaterialPanel /> },
  { id: 'shape', label: 'Lengan', render: () => <ShapePanel /> },
  { id: 'scene', label: 'Latar', render: () => <ScenePanel /> },
  { id: 'export', label: 'Unduh', render: () => <ExportPanel /> },
]

const CAMERAS: { id: CameraPreset; label: string }[] = [
  { id: 'front', label: 'Depan' },
  { id: 'back', label: 'Belakang' },
  { id: 'left', label: 'Kiri' },
  { id: 'right', label: 'Kanan' },
  { id: 'threeQuarter', label: 'Tiga perempat' },
  { id: 'collar', label: 'Kerah' },
  { id: 'sleeve', label: 'Lengan' },
]

const MATERIAL_LABEL = { combed: 'katun combed', carded: 'katun carded', dryfit: 'polyester dry-fit', pique: 'pique' }
const STATUS: Record<SaveStatus, string> = { saving: 'Menyimpan', saved: 'Tersimpan di browser ini', error: 'Gagal menyimpan' }
const ARROWS: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }

const typing = (t: EventTarget | null) =>
  t instanceof HTMLElement && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName))

export default function Editor() {
  const hydrated = useEditorStore((s) => s.hydrated)
  const panel = useEditorStore((s) => s.panel)
  const webglError = useEditorStore((s) => s.webglError)
  const toast = useEditorStore((s) => s.toast)
  const canUndo = useEditorStore((s) => s.past.length > 0)
  const canRedo = useEditorStore((s) => s.future.length > 0)
  const g = useEditorStore((s) => s.garment)
  const layerCount = useEditorStore((s) => s.layers.length)
  const transparent = useEditorStore((s) => s.scene.background.type === 'transparent')
  const setPanel = useEditorStore((s) => s.setPanel)
  const requestCamera = useEditorStore((s) => s.requestCamera)
  const showToast = useEditorStore((s) => s.showToast)
  const [status, setStatus] = useState<SaveStatus | null>(null)
  const [hiddenToast, setHiddenToast] = useState<number | null>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const [layersOpen, setLayersOpen] = useState(false)
  const [dropping, setDropping] = useState(false)
  const previewRef = useRef<HTMLElement>(null)
  const layersButton = useRef<HTMLButtonElement>(null)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    void useEditorStore.persist.rehydrate()
  }, [])

  useEffect(() => {
    const onStatus = (e: Event) => {
      const s = (e as CustomEvent<SaveStatus>).detail
      setStatus(s)
      if (s === 'error')
        useEditorStore.getState().showToast('Browser tidak bisa menyimpan proyekmu otomatis. Unduh gambarnya sekarang supaya pekerjaanmu aman.', 'error')
    }
    saveEvents.addEventListener('status', onStatus)
    return () => saveEvents.removeEventListener('status', onStatus)
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setHiddenToast(toast.nonce), 5000)
    return () => clearTimeout(t)
  }, [toast])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (typing(e.target)) return
      const mod = e.ctrlKey || e.metaKey
      const s = useEditorStore.getState()
      const sel = s.layers.find((l) => l.id === s.selectedId)
      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
      } else if (mod && e.key.toLowerCase() === 'y') {
        e.preventDefault()
        redo()
      } else if (mod && e.key.toLowerCase() === 'd' && sel) {
        e.preventDefault()
        s.duplicateLayer(sel.id)
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && sel) {
        e.preventDefault()
        s.removeLayer(sel.id)
      } else if (e.key === 'Escape' && sel) s.selectLayer(null)
      else if (ARROWS[e.key] && sel && !e.altKey) {
        // Geser halus 1 mm, atau 1 cm dengan Shift.
        e.preventDefault()
        const step = e.shiftKey ? 1 : 0.1
        s.updateLayer(sel.id, placeLayer(sel.x + ARROWS[e.key][0] * step, sel.y + ARROWS[e.key][1] * step))
      }
    }
    const onPaste = (e: ClipboardEvent) => {
      if (typing(e.target)) return
      const file = [...(e.clipboardData?.files ?? [])].find((f) => f.type.startsWith('image/'))
      if (file) {
        e.preventDefault()
        void addImageFile(file)
      }
    }
    const onFs = () => setFullscreen(document.fullscreenElement === previewRef.current)
    window.addEventListener('keydown', onKey)
    window.addEventListener('paste', onPaste)
    document.addEventListener('fullscreenchange', onFs)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('paste', onPaste)
      document.removeEventListener('fullscreenchange', onFs)
    }
  }, [])

  function toggleFullscreen() {
    if (document.fullscreenElement) void document.exitFullscreen()
    else previewRef.current?.requestFullscreen().catch(() => showToast('Layar penuh tidak tersedia di browser ini.', 'error'))
  }

  function closeLayers() {
    setLayersOpen(false)
    layersButton.current?.focus()
  }

  function onTabKey(e: React.KeyboardEvent, i: number) {
    const delta = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
    if (!delta) return
    e.preventDefault()
    const next = (i + delta + PANELS.length) % PANELS.length
    setPanel(PANELS[next].id)
    tabRefs.current[next]?.focus()
  }

  const active = PANELS.find((p) => p.id === panel) ?? PANELS[0]
  const description = `Kaos kerah bulat, lengan ${g.sleeve === 'long' ? 'panjang' : 'pendek'}, bahan ${MATERIAL_LABEL[g.material]}, warna badan ${g.colors.body}. ${layerCount === 0 ? 'Belum ada desain.' : `${layerCount} desain terpasang.`}`

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>
          Mockup Viewer
        </Link>
        <p className={`label ${styles.status}`} aria-live="polite">
          {status ? STATUS[status] : ''}
        </p>
        <div className={styles.headerActions}>
          <button type="button" className="btn btn-secondary" disabled={!canUndo} onClick={undo} aria-keyshortcuts="Control+Z">
            Batalkan
          </button>
          <button type="button" className="btn btn-secondary" disabled={!canRedo} onClick={redo} aria-keyshortcuts="Control+Shift+Z">
            Ulangi
          </button>
          <button type="button" className="btn btn-primary" onClick={() => setPanel('export')}>
            Unduh Gambar
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.rail} role="tablist" aria-label="Alat" aria-orientation="vertical">
          {PANELS.map((p, i) => (
            <button
              key={p.id}
              ref={(el) => {
                tabRefs.current[i] = el
              }}
              type="button"
              role="tab"
              id={`tab-${p.id}`}
              aria-selected={p.id === active.id}
              aria-controls="panel-body"
              tabIndex={p.id === active.id ? 0 : -1}
              className={styles.railItem}
              onClick={() => setPanel(p.id)}
              onKeyDown={(e) => onTabKey(e, i)}
            >
              {p.label}
            </button>
          ))}
        </div>

        <aside role="tabpanel" id="panel-body" aria-labelledby={`tab-${active.id}`} className={styles.panel}>
          {active.render()}
        </aside>

        {/* oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- area lepas berkas, juga bisa lewat panel Unggah */}
        <section
          ref={previewRef}
          className={styles.preview}
          aria-label="Pratinjau 3D"
          onDragOver={(e) => {
            if (![...e.dataTransfer.types].includes('Files')) return
            e.preventDefault()
            setDropping(true)
          }}
          onDragLeave={(e) => !e.currentTarget.contains(e.relatedTarget as Node | null) && setDropping(false)}
          onDrop={(e) => {
            const file = [...e.dataTransfer.files].find((f) => f.type.startsWith('image/'))
            setDropping(false)
            if (!file) return
            e.preventDefault()
            void addImageFile(file, e.clientX, e.clientY)
          }}
        >
          <div className={`${styles.stage} ${transparent ? styles.stageTransparent : ''} ${dropping ? styles.stageDrop : ''}`}>
            {webglError ? (
              <div className={styles.stageMessage} role="alert">
                <p>
                  Browsermu belum bisa menampilkan 3D. Perbarui browser, atau aktifkan akselerasi perangkat keras di pengaturan, lalu muat ulang
                  halaman.
                </p>
              </div>
            ) : hydrated ? (
              <Viewer />
            ) : (
              <output className={styles.stageMessage}>
                <p>Memulihkan proyek terakhirmu</p>
              </output>
            )}
            <p id="garment-description" className="sr-only">
              {description}
            </p>
          </div>
          <div className={styles.previewBar}>
            <ContextToolbar />
            <button
              ref={layersButton}
              type="button"
              className={`btn btn-secondary ${styles.layersToggle}`}
              aria-expanded={layersOpen}
              aria-controls="layers-panel"
              onClick={() => setLayersOpen((o) => !o)}
            >
              Lapisan ({layerCount})
            </button>
            {layersOpen && <LayersPanel onClose={closeLayers} />}
          </div>
          <div className={styles.cameraBar} role="toolbar" aria-label="Sudut kamera">
            {CAMERAS.map((c) => (
              <button key={c.id} type="button" className={styles.cameraButton} onClick={() => requestCamera(c.id)}>
                {c.label}
              </button>
            ))}
            <button type="button" className={styles.cameraButton} onClick={() => requestCamera('reset')}>
              Atur Ulang Kamera
            </button>
            <button type="button" className={styles.cameraButton} onClick={toggleFullscreen} aria-pressed={fullscreen}>
              {fullscreen ? 'Keluar dari Layar Penuh' : 'Layar Penuh'}
            </button>
          </div>
        </section>
      </main>

      {toast && toast.nonce !== hiddenToast && (
        <div key={toast.nonce} className={`${styles.toast} ${toast.tone === 'error' ? styles.toastError : ''}`} role={toast.tone === 'error' ? 'alert' : 'status'}>
          <p>{toast.text}</p>
          <button type="button" className={styles.toastClose} onClick={() => setHiddenToast(toast.nonce)}>
            Tutup
          </button>
        </div>
      )}
    </div>
  )
}
