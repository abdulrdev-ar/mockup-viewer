const TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
export const MAX_BYTES = 20 * 1024 * 1024

/**
 * Baca berkas gambar dari pengguna menjadi data URL. Validasi tipe dan ukuran di batas kepercayaan,
 * lalu decode lewat <img>: SVG dirender sebagai gambar, skrip di dalamnya tidak dijalankan.
 */
export async function readImageFile(file: File): Promise<{ src: string; w: number; h: number } | { error: string }> {
  if (!TYPES.includes(file.type)) return { error: 'File ini tidak bisa dipakai. Gunakan PNG, JPG, WebP, atau SVG.' }
  if (file.size > MAX_BYTES) return { error: 'File ini lebih dari 20 MB. Perkecil ukurannya lalu unggah lagi.' }
  const src = await new Promise<string | null>((resolve) => {
    const r = new FileReader()
    r.onload = () => resolve(typeof r.result === 'string' ? r.result : null)
    r.onerror = () => resolve(null)
    r.readAsDataURL(file)
  })
  if (!src) return { error: 'File ini tidak bisa dibuka. Coba simpan ulang dari aplikasi desainmu lalu unggah lagi.' }
  const size = await new Promise<{ w: number; h: number } | null>((resolve) => {
    const img = new Image()
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight })
    img.onerror = () => resolve(null)
    img.src = src
  })
  if (!size) return { error: 'File ini tidak bisa dibuka. Coba simpan ulang dari aplikasi desainmu lalu unggah lagi.' }
  // SVG tanpa ukuran bawaan: anggap persegi 1000 px.
  return { src, w: size.w || 1000, h: size.h || 1000 }
}
