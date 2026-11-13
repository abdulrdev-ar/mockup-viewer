# 01. Riset Kompetitor dan Hasil Reverse Engineering

| | |
|---|---|
| Tanggal pengamatan | 13 November 2026 |
| Target | VirtualThreads (`virtualthreads.io`) dan Pacdora, halaman generator mockup kaos 3D (`pacdora.com/id/tools/3d-t-shirt-mockup-generator`) |
| Alat | MCP REA: `capture_browser_scenario` (Chromium 157, headless, 1440x900), pohon aksesibilitas, DOM, log jaringan, konsol. Analisis statis atas string di bundle JavaScript yang dimuat publik. |
| Yang tidak dilakukan | Login, melewati paywall, mengunduh atau mengambil model 3D, tekstur, atau kode untuk dipakai ulang. Lihat dokumen 07. |

Setiap temuan diberi label [TERAMATI] atau [INFERENSI]. Angka yang tertulis di situs kompetitor adalah klaim mereka sendiri dan tidak diverifikasi.

## 1. Ringkasan temuan

1. Kedua kompetitor membangun editor 3D di atas pola yang sama: model garmen dalam format glTF, material fisik (PBR) dengan normal map, sheen, dan clearcoat, dirender di browser dengan WebGL. VirtualThreads juga memakai peta ambient occlusion yang dipanggang terpisah untuk sisi luar dan dalam kaos. [INFERENSI, kuat]
2. VirtualThreads memisahkan variasi bentuk menjadi produk terpisah (Oversized, Women's, Cropped, Hoodie). Di editornya, kontrol yang terlihat adalah warna garmen, latar, animasi, kamera, dan dua slider tampilan (Acid Wash, Puff Print). Tidak terlihat pengaturan kerah, lengan, atau alat teks. [TERAMATI]
3. Pacdora memberi editor yang lebih umum (rel menu: Edit, Model, Tata letak, Latar, Video, Lebih banyak). Model kaos hanya menawarkan 4 bagian yang bisa diwarnai (badan utama, lengan, garis leher, garis jahit) dan pilihan material kapas. [TERAMATI]
4. Versi gratis keduanya memberi watermark pada hasil. Lisensi komersial hanya ada di paket berbayar tertinggi (Pacdora Bisnis) atau paket Pro (VirtualThreads). [TERAMATI]
5. Tidak ada satu pun yang menawarkan satu editor kaos dengan kontrol warna, gambar, teks, bahan, dan detail model (kerah, lengan, potongan, jahitan) sekaligus pada versi gratis, dengan hasil tanpa watermark. Ini celah utama untuk Mockup Viewer. [TERAMATI untuk yang terlihat. Keterbatasan: panel berbayar dan sebagian tab tidak dibuka.]

## 2. VirtualThreads

### 2.1 Posisi dan pesan

| Aspek | Temuan | Label |
|---|---|---|
| Judul beranda | "3D Animated Mockups in Seconds." | TERAMATI |
| Janji | Mengubah desain 2D menjadi 3D dengan efek angin, animasi berjalan, dan ekspor video | TERAMATI |
| Kalimat kaki halaman | "Browser-based 3D clothing mockups, animated, photorealistic, ready in seconds. No Photoshop. No 3D skills." | TERAMATI |
| Tanpa akun | "No sign up required!" untuk memulai | TERAMATI |
| Bahasa | Hanya English | TERAMATI |
| Privasi | Banner persetujuan analitik menyebut "Your uploaded designs are never recorded." | TERAMATI |

### 2.2 Katalog produk (halaman `/products`, kartu di beranda)

| Produk | Label di situs | Jalur |
|---|---|---|
| Oversized T-Shirt | Free | `/pro-configerator` (dialihkan ke `/configurator`) |
| Walking T-Shirt | New Pro | `/walking-t-shirt` |
| Walking Hoodie | New Pro | `/walking-hoodie` |
| Women's T-Shirt | New Pro | `/womens-t-shirt` |
| Women's Oversized T-Shirt | New Pro | `/womens-oversized-t-shirt` |
| Women's Cropped T-Shirt | New Pro | `/womens-cropped-t-shirt` |

Hanya satu model yang bisa dicoba gratis. Variasi bentuk dijual sebagai produk berbeda. [TERAMATI]

### 2.3 Isi editor (versi gratis)

| Kelompok | Kontrol yang terlihat | Catatan |
|---|---|---|
| Berkas | Upload Your Design | Tombol utama |
| Warna garmen | Kolom heksadesimal (nilai awal `#ffffff`) | Satu warna untuk seluruh garmen |
| Latar | Unggah gambar latar, atur ulang, kolom warna (nilai awal `#d2d0cc`) | |
| Animasi (label Pro) | Static, Walk, Waves, Knit. Slider Animation Speed (0,3), Knit Speed (1,0) | Animasi berjalan dan angin adalah pembeda mereka |
| Kamera (label Pro) | Tanpa gerak, Rotate, Rotate and zoom. Slider Rotation Speed | |
| Advanced Controls | Slider Acid Wash dan Puff Print (nilai awal 0,0), tombol Back | Dua efek tampilan: cuci asam dan cetak timbul |
| Ekspor | Export | Hasil gratis ber-watermark |
| Lain | Layar penuh | |

Tidak terlihat: alat teks, warna per bagian, pilihan kerah dan lengan, pilihan bahan, undo dan redo, berbagi tautan. [TERAMATI]

### 2.4 Harga dan lisensi

| Paket | Harga | Isi | Label |
|---|---|---|---|
| Free | $0 | Tanpa daftar, hanya penggunaan pribadi, ekspor ber-watermark, semua mockup dan animasi dapat diakses | TERAMATI |
| Pro Yearly | $8,25 per bulan, ditagih $99 per tahun ("-57%" dibanding bulanan) | Lisensi komersial, tanpa watermark, ekspor gambar dan video resolusi tinggi | TERAMATI |
| Pembayaran | Stripe | | TERAMATI |

### 2.5 Pembaruan produk (halaman `/updates`)

| Tanggal | Pembaruan |
|---|---|
| 4 November 2026 | Studio 3D baru dengan kain, cahaya, dan bayangan lebih realistis |
| 4 November 2026 | Animasi Knit dibangun ulang (benang melengkung ditarik keluar dari kain), slider Knit Speed |
| 4 November 2026 | Walking T-Shirt dan Walking Hoodie (lipatan mengikuti gerak) |
| 4 November 2026 | Seluruh gambar produk dirender ulang di Blender pada satu set studio. Mockup versi 2 dipindah ke "Legacy mockups". |
| 4 November 2026 | Setiap mockup punya halaman info sendiri |
| 28 Oktober 2026 | Pustaka desain kaos gratis (PNG transparan siap cetak) |

Kecepatan rilis tinggi dan fokus ke animasi serta video. [TERAMATI]

### 2.6 Klaim sosial

| Klaim | Lokasi |
|---|---|
| "34,000+ creators have signed up" | Bar di atas beranda |
| "More than one hundred twenty thousand brands use VirtualThreads" | Label aksesibilitas bar yang sama |
| "12k+ active creators", "2,400,043 mockups rendered", "4.9 average satisfaction" | Bagian testimoni |
| Tiga kutipan pengguna dengan label "Verified" | Bagian testimoni |

Tiga angka pengguna berbeda muncul di satu halaman tanpa sumber. Perlakukan semuanya sebagai klaim pemasaran. Mockup Viewer tidak boleh meniru pola ini (aturan di dokumen 07). [TERAMATI]

### 2.7 Teknologi

| Lapisan | Temuan | Label |
|---|---|---|
| Kerangka web | Next.js App Router (potongan `_next/static/chunks/app/...`), penanda deploy `dpl_` menunjukkan Vercel | INFERENSI |
| Penyimpanan aset | DigitalOcean Spaces (`nyc3`), URL bertanda tangan untuk aset garmen di `garments/v1/{free,shared}/` | TERAMATI |
| Format model | glTF terpisah: `static.gltf` dan `static.bin` | TERAMATI |
| Tekstur | WebP: `detail-normal`, `fabric-jersey`, `acid-wash`, `ao-ao-tshirt-inside`, `ao-ao-tshirt-outside` | TERAMATI |
| Mesin 3D | Bundle memuat `WebGLRenderer`, `GLTFLoader`, `MeshPhysicalMaterial`, `normalMap`, `clearcoat`, `sheen`. Sangat mungkin three.js. | INFERENSI |
| Ekspor | Bundle memuat `toBlob` (gambar) dan `MediaRecorder` (video direkam di browser) | INFERENSI |
| Bobot halaman | Beranda: 160 permintaan (145 domain sendiri, 15 CDN). Editor: 123 permintaan. | TERAMATI |
| Pelacakan | Banner persetujuan sebelum analitik dan rekaman sesi | TERAMATI |

Arti bagi kita: pola "model glTF + tekstur AO dan normal + efek cuci sebagai tekstur terpisah" cukup untuk tampilan kain yang meyakinkan, dan ekspor di sisi pengguna menghilangkan biaya server per render.

## 3. Pacdora (generator mockup kaos)

### 3.1 Posisi dan pesan

| Aspek | Temuan | Label |
|---|---|---|
| Judul | "Generator maket kaos gratis" | TERAMATI |
| Sub | Unggah gambar dan sesuaikan maket kaos secara online secara gratis, unduh PNG | TERAMATI |
| Cakupan produk | Platform kemasan: maket, dieline, desain AI, video AI. Kaos adalah salah satu alat gratis dari banyak. | TERAMATI |
| Pembeda yang mereka klaim | Pratinjau dan edit 3D termasuk lengan dan garis leher, dibandingkan alat 2D | TERAMATI |
| Bahasa | Banyak bahasa, termasuk Indonesia | TERAMATI |
| Klaim sosial | "Disukai oleh lebih dari 4 juta pengguna", rating G2 4,9, baris logo perusahaan besar di bawah "Dipercaya oleh perusahaan terkemuka" | TERAMATI sebagai klaim, tidak diverifikasi |

### 3.2 Halaman alat

| Elemen | Temuan |
|---|---|
| Unggah | Area seret dan lepas, petunjuk ukuran 789 x 1186 px |
| Warna | Tombol "Warna kustom" |
| "Mockup serupa" | Kaos kantong, kaos, leher bulat, hitam, polo, crop top, oversized, anak-anak |
| Tombol | "Unduh gratis" dan "Buka di editor" |
| Katalog | "20+ maket kaos untuk dipilih" |
| Format ekspor | PNG dan JPG (klaim 4K), video MP4 |

### 3.3 Editor (model 700004, kaos lengan pendek)

| Area | Isi | Label |
|---|---|---|
| Rel kiri | Edit, Model, Tata letak, Latar, Video, Lebih banyak, Desain AI | TERAMATI |
| Panel Edit | Unggah gambar (area cetak 310 x 452 px), Warna (palet kecil ditambah warna kustom), Material kustom ("Dasar katun"), Bagian kustom ("4 Bagian"), "Temukan yang serupa dengan AI", ID Model | TERAMATI |
| Bagian kustom | Garis jahit, Garis leher, Badan utama, Lengan | TERAMATI |
| Material apparel | Cotton base, Vertical cotton, Knitted cotton, Flannelette, Cotton | TERAMATI |
| Bilah kanan | Pilih, geser, komentar, undo, redo | TERAMATI |
| Bilah bawah | Zoom plus dan minus, tombol tampilan, label "Tanpa Watermark" (ajakan upgrade) | TERAMATI |
| Atas | Berbagi, "Ekspor yang luar biasa", tautan "Desain 3D" | TERAMATI |
| Panel properti objek | Teks "Please select an object from the Outline Menu to see its properties." dan tautan dokumentasi Theatre.js | TERAMATI |

Tidak diperiksa: isi tab Model, Tata letak, Latar, Video, dan Lebih banyak (panel berubah menjadi pustaka umum saat diklik, bukan panel kaos). Alat teks tidak terlihat di panel Edit. [Batasan riset]

### 3.4 Harga (halaman `/id/pricing`, dalam USD)

| Paket | Harga | Batas utama |
|---|---|---|
| Gratis | $0 | Watermark, 50 kredit AI, proyek dan unggahan tak terbatas |
| Lite | $9 per bulan (ditagih $108 per tahun) | Tanpa watermark, gambar 2K, video 720p, hanya penggunaan pribadi, 300 kredit AI |
| Pro | $17 per kursi per bulan ($199 per tahun) | Gambar 4K, video 1080p, ekspor dieline tanpa batas, tim, hanya penggunaan pribadi, 3.000 kredit AI |
| Bisnis | $59 per kursi per bulan ($708 per tahun) | Gambar 8K, video 2K, lisensi komersial dan penjualan kembali, 10.000 kredit AI |

Lisensi komersial baru muncul di paket $59. Pengguna kaos yang menjual produknya harus membayar paket tertinggi. [TERAMATI]

### 3.5 Teknologi

| Lapisan | Temuan | Label |
|---|---|---|
| Front end | Vue 3 dengan bundler Vite (chunk `rolldown-runtime`, `vue`) | INFERENSI |
| Mesin 3D | Paket internal `pacdora-3d`. String `WebGLRenderer`, `GLTFLoader`, `OrbitControls`, `TransformControls`, `MeshPhysicalMaterial`, `normalMap`, `clearcoat`, `sheen`. Sangat mungkin three.js. | INFERENSI |
| Animasi dan timeline | Theatre.js (`UseTheatre`, string `@theatre`) | TERAMATI |
| Format model | Wadah internal berekstensi `.pda` di `rapid_render/glb/`, peta lingkungan `.hdr`, tekstur `.jpg`, modul WebAssembly | TERAMATI |
| Unggah file | Chunk AWS SDK, gambar pengguna kemungkinan ke S3 | INFERENSI |
| API | REST `/api/v2/...`: `models/details`, `models/search`, `models/preview`, `materials/science`, `material_effect`, `project/knife`, `projects` (POST dan PUT, simpan otomatis), `workspace/*`, `pay/unified/stripe/plans`, `box/export/task/count`, `simple/video` | TERAMATI |
| Pembayaran | Stripe, PayPal, PayerMax (dari FAQ harga) | TERAMATI |
| Pelacakan dan pihak ketiga | Google Tag Manager dan GA4, Microsoft Clarity, piksel TikTok, Meta, Google Ads, Bing, Freshchat, Google Sign-In | TERAMATI |
| Bobot halaman | Halaman alat: 390 permintaan dalam 8 detik (295 dari CDN sendiri). Editor: 565 permintaan dalam 15 detik. | TERAMATI |
| Ekspor | Ada hitungan tugas ekspor di server (`box/export/task/count`), kemungkinan render resolusi tinggi dan video dilakukan di server | INFERENSI |

Arti bagi kita: render di server memunculkan biaya, dan biaya itulah yang membuat watermark dan paket berbayar masuk akal bagi Pacdora. Ekspor di sisi pengguna adalah cara menjaga janji gratis tetap sehat.

## 4. Perbandingan fitur

Kolom Mockup Viewer menunjukkan rencana (fase di dokumen 03), bukan kondisi sekarang.

| Kemampuan | VirtualThreads | Pacdora (kaos) | Mockup Viewer (rencana) |
|---|---|---|---|
| Unggah desain | Ya | Ya | Ya (Fase 1) |
| Warna garmen | Satu warna, input heksadesimal | Palet kecil dan warna kustom | Warna utama dan per bagian (Fase 1) |
| Warna per bagian | Tidak terlihat | 4 bagian | Beberapa bagian, termasuk rib kerah, lengan, jahitan (Fase 1 dan 2) |
| Alat teks | Tidak terlihat | Tidak terlihat di panel Edit | Ya (Fase 1) |
| Pilihan bahan | Tidak terlihat di versi gratis | Cotton base, Vertical cotton, Knitted cotton, Flannelette | 4 bahan (Fase 1), lebih banyak (Fase 2) |
| Efek cuci dan cetak | Acid Wash dan Puff Print (slider) | Tidak terlihat | Cuci, cetak timbul, retak (Fase 2) |
| Bentuk kerah dan lengan | Produk terpisah | Model terpisah dan "Bagian kustom" | Satu editor, bisa ganti (Fase 1) |
| Potongan (fit) dan panjang | Produk terpisah | Model terpisah | Slider dan preset (Fase 1 dan 2) |
| Latar | Warna dan gambar | Tab Latar | Warna, gradasi, gambar, transparan (Fase 1) |
| Animasi | Walk, Waves, Knit (Pro) | Video (tab Video) | Putar 360 derajat (Fase 2), gerak kain (Fase 3) |
| Ekspor gambar | Ya, ber-watermark gratis | Ya, ber-watermark gratis | Ya, tanpa watermark (Fase 1) |
| Ekspor video | Ya (Pro untuk resolusi tinggi) | Ya (berbayar untuk resolusi tinggi) | Ya, di browser (Fase 2) |
| Undo dan redo | Tidak terlihat | Ya | Ya (Fase 1) |
| Berbagi tautan | Tidak terlihat | Ya | Ya (Fase 2) |
| Akun | Tidak untuk gratis | Tombol Masuk, proyek tamu tampaknya ada | Tidak (Fase 1) |
| Lisensi komersial | Berbayar | Berbayar (paket $59) | Termasuk, gratis (keputusan D-03) |
| Bahasa Indonesia | Tidak | Ya | Ya (Fase 1) |

## 5. Celah pasar dan hipotesis

| ID | Celah | Bukti | Hipotesis yang harus diuji |
|---|---|---|---|
| G1 | Kedalaman kustomisasi pada satu garmen | VirtualThreads menjual variasi sebagai produk terpisah. Pacdora hanya memberi 4 bagian. | Pengguna yang menyiapkan desain untuk sablon lebih puas bila bisa mengganti kerah dan lengan tanpa pindah model. |
| G2 | Gratis tanpa watermark dengan hak pakai komersial | Keduanya membatasi hal ini di paket berbayar. | Penjual kecil mau memakai editor yang tidak meminta pembayaran untuk hasil yang bersih. |
| G3 | Konteks Indonesia | VirtualThreads hanya English. Pacdora menerjemahkan tetapi berfokus kemasan global dan harga USD. | Istilah lokal (combed 30s, sablon plastisol, DTF, konveksi) dan contoh lokal menaikkan kepercayaan dan aktivasi. |
| G4 | Ringan dan privat | Pacdora memuat ratusan permintaan dan banyak pelacak. VirtualThreads meminta persetujuan analitik. | Halaman cepat dan janji "gambar tetap di perangkatmu" menjadi alasan memilih. |
| G5 | Informasi untuk produksi | Tidak terlihat lembar spesifikasi di keduanya untuk garmen | Konveksi dan penjual lebih sering membagikan lembar spesifikasi (ukuran cetak, posisi, kode warna) daripada gambar saja. |

Semua hipotesis di atas berasal dari pengamatan satu hari. Uji dengan wawancara dan prototipe sebelum dijadikan janji publik (rencana di dokumen 06).

## 6. Yang sengaja tidak ditiru

- Nama, logo, teks, dan struktur halaman kompetitor.
- Model 3D, tekstur, peta lingkungan, dan kode mereka. URL aset terlihat di log jaringan, tetapi tidak dipakai.
- Klaim jumlah pengguna, bar logo perusahaan terkenal, dan testimoni yang tidak bisa diverifikasi.
- Pengumpulan data berlebihan (rekaman sesi, banyak piksel iklan) sebagai bawaan.

## 7. Batasan riset

| Batasan | Dampak |
|---|---|
| Chromium headless, bukan perangkat nyata | Performa WebGL dan tampilan kualitas tidak diukur |
| Tab Model, Tata letak, Latar, Video di Pacdora tidak berhasil dibuka satu per satu, dan panel berbayar tidak diakses | Fitur yang ada di sana belum tercatat. Daftar fitur kompetitor tidak lengkap. |
| Tidak login dan tidak membayar | Isi paket berbayar hanya dari halaman harga |
| Penyelidikan bundle memakai pencocokan string | Penyebutan three.js dan MediaRecorder berstatus INFERENSI |
| Angka sosial dan pengguna dari situs mereka | Tidak dipakai sebagai data pasar |
| Satu hari pengamatan | Situs bisa berubah. Ulangi riset sebelum peluncuran. |

Bukti sesi analisis (ID Evidence REA): VirtualThreads `/updates` `ev_31949505546547817ca8dfe37fd8d3a405f0fc05acf2ffee7026a93413ce41b9`, VirtualThreads editor Advanced Controls `ev_badfc35eb1c38ba423a47a22a2b5e033559415669b7a6ab4ac1f95f0840e52ea`, Pacdora harga `ev_d00cd25a71c3becd861aa03d9e04ccbdc57891b56ae2d528137ce7609aba0eb7`, Pacdora panel Bagian kustom `ev_58bed8f29afeafd35b79ef214b1b73e82ff2c170b0b78a327b73a6a4cce43a63`. Tangkapan lain tersimpan sebagai berkas hasil alat pada sesi kerja dan tidak dikomit ke repositori.

## 8. Langkah riset lanjutan

1. Telusuri tab Model, Tata letak, Latar, dan Video di Pacdora secara manual untuk melengkapi daftar fitur.
2. Coba alat teks dan unggah gambar nyata di kedua editor, catat batas ukuran dan format file.
3. Uji kedua editor di ponsel kelas menengah, catat waktu muat dan kelancaran.
4. Tambahkan 2 sampai 3 kompetitor lain (alat mockup 2D dan PSD, serta alat 3D lain) setelah wawancara pengguna menyebut nama yang mereka pakai.
