import {
  Anton,
  Archivo_Black,
  Bebas_Neue,
  Caveat,
  DM_Mono,
  Instrument_Sans,
  Oswald,
  Pacifico,
  Playfair_Display,
} from 'next/font/google'
import type { FontId } from './slices/design.ts'

// Pengganti fontSprigSans dan fontRedwardMono di DESIGN.md (keputusan pemilik).
export const sans = Instrument_Sans({ subsets: ['latin'], variable: '--font-sans', display: 'swap' })
export const mono = DM_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono', display: 'swap' })

// Font cetak, semua lisensi SIL OFL. Tidak di-preload: dimuat saat dipakai di kanvas.
const anton = Anton({ subsets: ['latin'], weight: '400', preload: false, display: 'swap' })
const bebas = Bebas_Neue({ subsets: ['latin'], weight: '400', preload: false, display: 'swap' })
const archivo = Archivo_Black({ subsets: ['latin'], weight: '400', preload: false, display: 'swap' })
const playfair = Playfair_Display({ subsets: ['latin'], preload: false, display: 'swap' })
const caveat = Caveat({ subsets: ['latin'], preload: false, display: 'swap' })
const pacifico = Pacifico({ subsets: ['latin'], weight: '400', preload: false, display: 'swap' })
const oswald = Oswald({ subsets: ['latin'], preload: false, display: 'swap' })

export const PRINT_FONTS: Record<FontId, { label: string; group: string; family: string }> = {
  instrument: { label: 'Instrument Sans', group: 'Sans', family: sans.style.fontFamily },
  oswald: { label: 'Oswald', group: 'Sans', family: oswald.style.fontFamily },
  anton: { label: 'Anton', group: 'Tebal', family: anton.style.fontFamily },
  archivo: { label: 'Archivo Black', group: 'Tebal', family: archivo.style.fontFamily },
  bebas: { label: 'Bebas Neue', group: 'Display', family: bebas.style.fontFamily },
  playfair: { label: 'Playfair Display', group: 'Serif', family: playfair.style.fontFamily },
  caveat: { label: 'Caveat', group: 'Tulisan tangan', family: caveat.style.fontFamily },
  pacifico: { label: 'Pacifico', group: 'Tulisan tangan', family: pacifico.style.fontFamily },
}

export const PRINT_FONT_FAMILIES = Object.fromEntries(
  Object.entries(PRINT_FONTS).map(([id, f]) => [id, f.family]),
) as Record<FontId, string>
