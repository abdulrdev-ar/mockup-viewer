import type { NextConfig } from 'next'

// Situs statis: semua halaman dirender saat build ke `out/`, lalu disajikan sebagai aset Cloudflare Workers
// (wrangler.jsonc). Tidak ada fitur server, gambar dan proyek pengguna diproses di browser.
const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
}

export default nextConfig
