import type { Slice } from '../store.ts'

export type PartId = 'body' | 'sleeveL' | 'sleeveR' | 'collar'
export type MaterialId = 'combed' | 'carded' | 'dryfit' | 'pique'
export type Thickness = 'thin' | 'medium' | 'thick'
export type Neck = 'crew' | 'v' | 'scoop'
export type RibWidth = 'thin' | 'standard' | 'thick'
export type Sleeve = 'short' | 'threeQuarter' | 'long'
export type Fit = 'slim' | 'regular' | 'boxy' | 'oversized' | 'cropped'

export type Garment = {
  colors: Record<PartId, string>
  material: MaterialId
  thickness: Thickness
  neck: Neck
  ribWidth: RibWidth
  sleeve: Sleeve
  /** 0.8 sampai 1.2, pengali panjang lengan */
  sleeveLength: number
  fit: Fit
  /** 0.85 sampai 1.15, pengali panjang badan */
  bodyLength: number
  /** 0.9 sampai 1.1, pengali lebar bahu */
  shoulder: number
}

export const PARTS: PartId[] = ['body', 'sleeveL', 'sleeveR', 'collar']

export const DEFAULT_GARMENT: Garment = {
  colors: { body: '#F7F7F5', sleeveL: '#F7F7F5', sleeveR: '#F7F7F5', collar: '#F7F7F5' },
  material: 'combed',
  thickness: 'medium',
  neck: 'crew',
  ribWidth: 'standard',
  sleeve: 'short',
  sleeveLength: 1,
  fit: 'regular',
  bodyLength: 1,
  shoulder: 1,
}

export type GarmentSlice = {
  garment: Garment
  setGarment: (patch: Partial<Omit<Garment, 'colors'>>) => void
  setPartColor: (part: PartId | 'all', color: string) => void
}

export const createGarmentSlice: Slice<GarmentSlice> = (set) => ({
  garment: DEFAULT_GARMENT,
  setGarment: (patch) => set((s) => ({ garment: { ...s.garment, ...patch } })),
  setPartColor: (part, color) =>
    set((s) => {
      const colors =
        part === 'all'
          ? (Object.fromEntries(PARTS.map((p) => [p, color])) as Garment['colors'])
          : { ...s.garment.colors, [part]: color }
      const recentColors = [color, ...s.recentColors.filter((c) => c !== color)].slice(0, 8)
      return { garment: { ...s.garment, colors }, recentColors }
    }),
})
