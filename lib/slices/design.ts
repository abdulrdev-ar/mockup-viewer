import type { Slice } from '../store.ts'

export type Zone = 'front' | 'chestLeft' | 'back' | 'sleeveL' | 'sleeveR'
export type FontId = 'instrument' | 'anton' | 'bebas' | 'archivo' | 'playfair' | 'caveat' | 'pacifico' | 'oswald'

type LayerBase = {
  id: string
  zone: Zone
  /** posisi pusat dalam cm, relatif ke pusat zona (x ke kanan, y ke bawah) */
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
  layers: Layer[]
  selectedId: string | null
  addImage: (zone: Zone, src: string, pxW: number, pxH: number, width: number) => void
  addText: (zone: Zone) => void
  updateLayer: (id: string, patch: Partial<ImageLayer> | Partial<TextLayer>) => void
  removeLayer: (id: string) => void
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
  addText: (zone) => {
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
          text: 'Tulisanmu',
          font: 'anton',
          color: '#1C1C1E',
          size: zone === 'chestLeft' || zone.startsWith('sleeve') ? 2 : 5,
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
  selectLayer: (id) => set({ selectedId: id }),
})
