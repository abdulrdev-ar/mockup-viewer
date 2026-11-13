'use client'

import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { PRINT_FONT_FAMILIES } from '@/lib/fonts'
import { garmentDims } from '@/lib/garment'
import { ZONE_LABEL, ZONES, clampToZone, layerBox, paintCanvas, zoneSize, type CanvasId, type ZoneFrame } from '@/lib/print'
import { loadedImages, onAssetsReady } from '@/lib/print-assets'
import type { Layer, Zone } from '@/lib/slices/design'
import { useEditorStore } from '@/lib/store'
import { addImageFile } from './DesignPanel'
import styles from './editor.module.css'

const DEG = Math.PI / 180
const CANVAS_OF: Record<Zone, CanvasId> = { front: 'body', back: 'body', sleeveL: 'sleeveL', sleeveR: 'sleeveR' }
type Drag =
  | { mode: 'move'; id: string; px: number; py: number; x: number; y: number }
  | { mode: 'resize'; id: string; dist: number; start: number }
  | { mode: 'rotate'; id: string }

/**
 * Halaman desain 2D, seperti halaman di Canva: satu area cetak sisi kaos, digambar dengan paintCanvas yang sama
 * dengan tekstur 3D. Seret lapisan untuk memindahkan, tarik sudut untuk mengubah ukuran, tarik bulatan atas untuk memutar.
 */
export default function DesignCanvas() {
  const surface = useEditorStore((s) => s.surface)
  const layers = useEditorStore((s) => s.layers)
  const garment = useEditorStore((s) => s.garment)
  const selectedId = useEditorStore((s) => s.selectedId)
  const selectLayer = useEditorStore((s) => s.selectLayer)
  const updateLayer = useEditorStore((s) => s.updateLayer)
  const showToast = useEditorStore((s) => s.showToast)
  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dragRef = useRef<Drag | null>(null)
  const [host, setHost] = useState({ w: 0, h: 0 })
  const [assetTick, bump] = useReducer((n: number) => n + 1, 0)
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [dropping, setDropping] = useState(false)

  const area = zoneSize(garmentDims(garment), surface)
  const { w: areaW, h: areaH } = area
  // Piksel layar per cm: halaman dimuat utuh di ruang kerja.
  // Tepi atas 56 px memberi ruang untuk pegangan putar di atas kotak seleksi.
  const k = host.w && host.h ? Math.min((host.w - 48) / area.w, (host.h - 112) / area.h) : 0
  const pageW = area.w * k
  const pageH = area.h * k
  const onSide = layers.filter((l) => l.zone === surface)
  const measure = useMemo(() => (typeof document === 'undefined' ? null : document.createElement('canvas').getContext('2d')), [])
  // Diukur ulang setiap render (murah), termasuk setelah font selesai dimuat (assetTick memicu render).
  const boxes = new Map(onSide.map((l) => [l.id, measure ? layerBox(measure, l, PRINT_FONT_FAMILIES[l.kind === 'text' ? l.font : 'anton']) : { w: 0, h: 0 }]))

  useEffect(() => onAssetsReady(bump), [])

  useEffect(() => {
    const el = hostRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setHost({ w: el.clientWidth, h: el.clientHeight }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Gambar halaman: warna kain dan lapisan sisi ini.
  useEffect(() => {
    const c = canvasRef.current
    const ctx = c?.getContext('2d')
    // assetTick berubah saat gambar atau font selesai dimuat, supaya halaman digambar ulang.
    if (!c || !ctx || !k || assetTick < 0) return
    const dpr = Math.min(window.devicePixelRatio, 2)
    c.width = Math.round(pageW * dpr)
    c.height = Math.round(pageH * dpr)
    const frame: ZoneFrame = { canvas: CANVAS_OF[surface], cx: c.width / 2, cy: c.height / 2, sx: k * dpr, sy: k * dpr, rot: 0, w: areaW, h: areaH }
    paintCanvas(CANVAS_OF[surface], ctx, {
      garment,
      layers,
      frames: Object.fromEntries(ZONES.map((z) => [z, frame])) as Record<Zone, ZoneFrame>,
      fonts: PRINT_FONT_FAMILIES,
      images: loadedImages(layers, () => showToast('Gambar tidak bisa dibuka. Coba simpan ulang lalu unggah lagi.', 'error')),
      guide: null,
      only: surface,
    })
  }, [layers, garment, surface, k, pageW, pageH, areaW, areaH, assetTick, showToast, canvasRef])

  /** Titik pointer dalam cm, relatif ke pusat halaman (y ke bawah). */
  const toCm = (e: React.PointerEvent) => {
    const r = e.currentTarget.getBoundingClientRect()
    return { x: (e.clientX - r.left - r.width / 2) / k, y: (e.clientY - r.top - r.height / 2) / k }
  }
  /** Lapisan teratas di titik p. */
  const hit = (p: { x: number; y: number }) =>
    [...onSide].reverse().find((l) => {
      const b = boxes.get(l.id)
      if (!b) return false
      const dx = p.x - l.x
      const dy = p.y - l.y
      const a = -l.rotation * DEG
      const lx = dx * Math.cos(a) - dy * Math.sin(a)
      const ly = dx * Math.sin(a) + dy * Math.cos(a)
      return Math.abs(lx) <= b.w / 2 && Math.abs(ly) <= b.h / 2
    })

  function onPointerDown(e: React.PointerEvent) {
    const p = toCm(e)
    const handle = (e.target as HTMLElement).dataset.handle
    const sel = layers.find((l) => l.id === selectedId)
    if (handle && sel) {
      if (handle === 'rotate') dragRef.current = { mode: 'rotate', id: sel.id }
      else dragRef.current = { mode: 'resize', id: sel.id, dist: Math.hypot(p.x - sel.x, p.y - sel.y), start: sel.kind === 'image' ? sel.width : sel.size }
    } else {
      const l = hit(p)
      selectLayer(l?.id ?? null)
      dragRef.current = l ? { mode: 'move', id: l.id, px: p.x, py: p.y, x: l.x, y: l.y } : null
    }
    if (dragRef.current) e.currentTarget.setPointerCapture(e.pointerId)
  }

  function onPointerMove(e: React.PointerEvent) {
    const p = toCm(e)
    const d = dragRef.current
    if (!d) return setHoverId(hit(p)?.id ?? null)
    const l = layers.find((x) => x.id === d.id)
    if (!l) return
    if (d.mode === 'move') {
      const next = { ...l, x: d.x + p.x - d.px, y: d.y + p.y - d.py } as Layer
      updateLayer(l.id, clampToZone(next, area))
    } else if (d.mode === 'resize') {
      const s = Math.hypot(p.x - l.x, p.y - l.y) / Math.max(0.1, d.dist)
      if (l.kind === 'image') {
        const maxW = Math.min(area.w, (area.h * l.pxW) / l.pxH)
        const width = Math.min(maxW, Math.max(1, d.start * s))
        updateLayer(l.id, { width, ...clampToZone({ ...l, width }, area) })
      } else updateLayer(l.id, { size: Math.min(30, Math.max(0.5, d.start * s)) })
    } else {
      // Bulatan putar ada di atas kotak, jadi sudut 0 = pointer tepat di atas pusat. Menempel ke kelipatan 45° dalam 4°.
      let deg = Math.atan2(p.y - l.y, p.x - l.x) / DEG + 90
      deg = ((deg + 540) % 360) - 180
      const snap = Math.round(deg / 45) * 45
      updateLayer(l.id, { rotation: Math.abs(deg - snap) < 4 ? snap : Math.round(deg) })
    }
  }

  const sel = onSide.find((l) => l.id === selectedId)
  const selBox = sel && boxes.get(sel.id)
  const hover = hoverId && hoverId !== selectedId ? onSide.find((l) => l.id === hoverId) : undefined
  const hoverBox = hover && boxes.get(hover.id)
  const place = (l: Layer, b: { w: number; h: number }) => ({
    width: b.w * k,
    height: b.h * k,
    transform: `translate(${pageW / 2 + l.x * k - (b.w * k) / 2}px, ${pageH / 2 + l.y * k - (b.h * k) / 2}px) rotate(${l.rotation}deg)`,
  })

  // Seret dan pegangan di bawah ini khusus pointer. Padanan keyboard: daftar Lapisan untuk memilih,
  // tombol panah untuk menggeser, dan kolom di bilah konteks untuk ukuran dan putaran.
  return (
    // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- area lepas berkas, juga bisa lewat panel Unggah
    <div
      ref={hostRef}
      className={`${styles.pageHost} ${dropping ? styles.pageDrop : ''}`}
      onDragOver={(e) => {
        if (![...e.dataTransfer.types].includes('Files')) return
        e.preventDefault()
        setDropping(true)
      }}
      onDragLeave={() => setDropping(false)}
      onDrop={(e) => {
        const file = [...e.dataTransfer.files].find((f) => f.type.startsWith('image/'))
        setDropping(false)
        if (!file) return
        e.preventDefault()
        void addImageFile(file)
      }}
    >
      {k > 0 && (
        // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- permukaan seret pointer, padanan keyboard di atas
        <figure
          className={styles.page}
          style={{ width: pageW, height: pageH, cursor: hover ? 'move' : 'default' }}
          aria-label={`Halaman desain sisi ${ZONE_LABEL[surface].toLowerCase()}, area cetak ${Math.round(area.w)} x ${Math.round(area.h)} cm. ${
            onSide.length ? `${onSide.length} lapisan.` : 'Belum ada desain.'
          } Pilih lapisan, lalu geser dengan tombol panah.`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={() => (dragRef.current = null)}
          onPointerCancel={() => (dragRef.current = null)}
          onPointerLeave={() => !dragRef.current && setHoverId(null)}
          onDoubleClick={() => sel?.kind === 'text' && document.getElementById('layer-text')?.focus()}
        >
          <canvas ref={canvasRef} className={styles.pageCanvas} />
          {onSide.length === 0 && <p className={styles.pageEmpty}>Seret gambar ke sini, atau pilih Unggah atau Teks untuk menambahkan.</p>}
          {hover && hoverBox && <div className={styles.hoverBox} style={place(hover, hoverBox)} aria-hidden="true" />}
          {sel && selBox && (
            <div className={styles.selectBox} style={place(sel, selBox)} aria-hidden="true">
              {(['nw', 'ne', 'se', 'sw'] as const).map((h) => (
                <span key={h} data-handle={h} className={`${styles.handle} ${styles[`handle_${h}`]}`} />
              ))}
              <span data-handle="rotate" className={styles.rotateHandle} />
            </div>
          )}
        </figure>
      )}
      <p className={`label ${styles.pageMeta}`}>
        Area cetak {ZONE_LABEL[surface].toLowerCase()}: {Math.round(area.w)} x {Math.round(area.h)} cm
      </p>
    </div>
  )
}
