import type { Metadata, Viewport } from 'next'
import { mono, sans } from '@/lib/fonts'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mockup Kaos 3D Gratis: Warna, Bahan, Kerah | Mockup Viewer',
  description:
    'Buat mockup kaos polos 3D langsung di browser. Ubah warna, gambar, tulisan, bahan, kerah, dan lengan, lalu unduh tanpa watermark.',
  // Belum ada ikon/logo resmi (perlu keputusan pemilik). Ikon kosong mencegah permintaan favicon 404.
  icons: { icon: 'data:,' },
  openGraph: {
    title: 'Mockup Kaos 3D Gratis',
    description: 'Atur warna, gambar, tulisan, bahan, kerah, dan lengan di kaos 3D. Unduh tanpa watermark.',
  },
}

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#E9E5E2' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
