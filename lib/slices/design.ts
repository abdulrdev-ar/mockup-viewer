import type { Slice } from '../store.ts'

/** Sisi kaos yang bisa dicetak. Satu sisi = satu halaman di kanvas desain. */
export type Zone = 'front' | 'back' | 'sleeveL' | 'sleeveR'
export type FontId = 'instrument' | 'anton' | 'bebas' | 'archivo' | 'playfair' | 'caveat' | 'pacifico' | 'oswald'

type LayerBase = {
  id: string
  zone: Zone
  /** posisi pusat dalam cm, relatif ke pusat area cetak sisi (x ke kanan, y ke bawah) */
  x: number
  y: number
  /** derajat */
  rotation: number
}

export type ImageLayer = LayerBase & {
  kind: 'image'
  src: string
  pxW: number
  pxH: number
  /** lebar cetak dalam cm, tinggi mengikuti rasio */
  width: number
}

export type TextLayer = LayerBase & {
  kind: 'text'
  text: string
  font: FontId
  color: string
  /** tinggi baris dalam cm */
  size: number
  align: 'left' | 'center' | 'right'
  /** em */
  letterSpacing: number
  lineHeight: number
  /** derajat lengkungan, 0 = lurus */
  arc: number
  upper: boolean
}

export type Layer = ImageLayer | TextLayer

export type DesignSlice = {
  /** Urutan = urutan tumpukan: elemen terakhir tampil paling depan. */
  layers: Layer[]
  selectedId: string | null
  addImage: (zone: Zone, src: string, pxW: number, pxH: number, width: number) => void
  addText: (zone: Zone, text: string, size: number) => void
  updateLayer: (id: string, patch: Partial<ImageLayer> | Partial<TextLayer>) => void
  removeLayer: (id: string) => void
  duplicateLayer: (id: string) => void
  /** Pindahkan ke posisi tumpukan `to` (0 = paling belakang). */
  moveLayer: (id: string, to: number) => void
  selectLayer: (id: string | null) => void
}

const newId = () => Math.random().toString(36).slice(2, 10)

export const createDesignSlice: Slice<DesignSlice> = (set) => ({
  layers: [],
  selectedId: null,
  addImage: (zone, src, pxW, pxH, width) => {
    const id = newId()
    set((s) => ({
      layers: [...s.layers, { id, kind: 'image', zone, x: 0, y: 0, rotation: 0, src, pxW, pxH, width }],
      selectedId: id,
    }))
  },
  addText: (zone, text, size) => {
    const id = newId()
    set((s) => ({
      layers: [
        ...s.layers,
        {
          id,
          kind: 'text',
          zone,
          x: 0,
          y: 0,
          rotation: 0,
          text,
          font: 'anton',
          color: '#1C1C1E',
          size,
          align: 'center',
          letterSpacing: 0,
          lineHeight: 1.1,
          arc: 0,
          upper: false,
        },
      ],
      selectedId: id,
    }))
  },
  updateLayer: (id, patch) =>
    set((s) => ({ layers: s.layers.map((l) => (l.id === id ? ({ ...l, ...patch } as Layer) : l)) })),
  removeLayer: (id) =>
    set((s) => ({
      layers: s.layers.filter((l) => l.id !== id),
      selectedId: s.selectedId === id ? null : s.selectedId,
    })),
  duplicateLayer: (id) =>
    set((s) => {
      const i = s.layers.findIndex((l) => l.id === id)
      if (i < 0) return {}
      const copy = { ...s.layers[i], id: newId(), x: s.layers[i].x + 1, y: s.layers[i].y + 1 }
      return { layers: [...s.layers.slice(0, i + 1), copy, ...s.layers.slice(i + 1)], selectedId: copy.id }
    }),
  moveLayer: (id, to) =>
    set((s) => {
      const from = s.layers.findIndex((l) => l.id === id)
      if (from < 0) return {}
      const layers = [...s.layers]
      const [l] = layers.splice(from, 1)
      layers.splice(Math.max(0, Math.min(layers.length, to)), 0, l)
      return { layers }
    }),
  selectLayer: (id) => set({ selectedId: id }),
})
