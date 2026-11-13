import { PRINT_FONT_FAMILIES } from './fonts.ts'
import type { Layer } from './slices/design.ts'

// Satu cache untuk kanvas desain 2D dan pratinjau 3D, supaya tiap gambar dan font hanya dimuat sekali.
const images = new Map<string, HTMLImageElement>()
const fonts = new Set<string>()
const listeners = new Set<() => void>()
const notify = () => listeners.forEach((f) => f())

/** Dipanggil setiap kali gambar atau font baru selesai dimuat. Mengembalikan fungsi berhenti mendengar. */
export function onAssetsReady(f: () => void) {
  listeners.add(f)
  return () => void listeners.delete(f)
}

/** Mulai memuat gambar dan font lapisan. Mengembalikan gambar yang sudah siap digambar. */
export function loadedImages(layers: Layer[], onError: () => void) {
  for (const l of layers) {
    if (l.kind === 'image' && !images.has(l.src)) {
      const img = new Image()
      img.onload = notify
      img.onerror = onError
      img.src = l.src
      images.set(l.src, img)
    }
    if (l.kind === 'text') {
      const family = PRINT_FONT_FAMILIES[l.font]
      if (!fonts.has(family)) {
        fonts.add(family)
        void document.fonts.load(`48px ${family}`).finally(notify)
      }
    }
  }
  const ready = new Map<string, CanvasImageSource>()
  images.forEach((img, src) => img.complete && img.naturalWidth > 0 && ready.set(src, img))
  return ready
}
