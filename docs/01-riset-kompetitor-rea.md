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
6. TeeMockup (`freeteemockup.com`) sudah gratis, tanpa akun, tanpa watermark, dan memproses gambar di browser. Janji "gratis tanpa watermark" saja tidak lagi membedakan. Pembeda yang tersisa adalah kedalaman kustomisasi satu garmen dan konteks lokal. [TERAMATI, bagian 3a]
7. Mockup yang tampak paling nyata di antara empat kompetitor (TeeMockup dan Dezo) tidak memakai 3D. Keduanya mewarnai ulang foto garmen asli memakai peta bayangan dan masker. [TERAMATI, bagian 3a dan 3b]

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

### 3.6 Penjelajahan editor model 605371 (pengamatan lanjutan)

| | |
|---|---|
| Halaman | `pacdora.com/mockup-detail/short-sleeved-shirt-mockup-605371` ("Men's round neck T-shirt mockup", Model ID 605371) |
| Alat | MCP Chrome DevTools (Chrome 157, desktop 1440 x 900 dan jendela sempit 500 px), klik setiap kontrol, log jaringan, isi `window` |
| Akun | Tidak login. Situs memberi cookie token tamu secara otomatis. |
| Unggahan | Tidak ada. Tombol unggah meminta login sebelum file dipilih. |
| Aset | Model, tekstur, dan HDR tidak diunduh atau disimpan. Hanya nama berkas dan struktur data yang dicatat (dokumen 07). |

**Pemuatan.** Empat tahap dengan teks: "Building model", "Preparing materials", "Creating environment", "Almost done". [TERAMATI]

**Panel Edit.** [TERAMATI]

| Kontrol | Perilaku |
|---|---|
| Upload images | Area cetak 317 x 448 px (model 700004 memakai 310 x 452 px). Input menerima `image/*`, boleh banyak berkas. Klik memunculkan "Log in to upload". Dialog menyebut gambar berlaku untuk semua model di tata letak. |
| Pratinjau kosong | Kaos memakai tekstur pola logo Pacdora di seluruh permukaan dan teks "Upload your images 317 x 448 px" di dada |
| Color | Pemilih warna bebas dan palet swatch (6 warna di awal, tinggal putih dan hitam setelah tata letak diganti, penyebab tidak diketahui). Warna dari palet menimpa semua bagian sekaligus. |
| Custom material | 3 pilihan berupa bola pratinjau: Cotton base, Vertical cotton, Cross knitted. Daftar material global dari API berisi 49 material (kertas, kaca, kain, logam). |
| Custom part | 4 bagian: Sewing line, Body, Cuff, Neckline. Setiap bagian membuka popover warna (kotak saturasi, slider hue, kolom heksadesimal). "Cuff" mewarnai seluruh lengan, bukan manset saja. Label awal "3 Parts" berubah menjadi "4 Parts" setelah model selesai dimuat. |
| Find similar with AI | Grid 6 model mirip, dicari lewat `models/image_search` memakai gambar render model |

Data model menyimpan 5 kelompok bagian (主体 badan, 袖子 lengan, 袖口 manset, 领口 kerah, 缝纫线 benang jahit), tetapi editor hanya menampilkan 4. [TERAMATI]

**Tab lain.** [TERAMATI]

| Tab | Isi | Perilaku |
|---|---|---|
| Models | Library, Projects, Custom. Pencarian teks ("Try 4+ words to describe...") dan pencarian gambar. 12 kategori (Boxes, Bottles, Apparel, Devices, Prints, dan lain-lain). | Kartu model memakai titik material dan tombol "Replace" |
| Layout | 12 preset susunan 1 sampai 3 garmen dengan sudut berbeda | Preset depan dan belakang berdampingan berhasil diterapkan. Warna dan material sama untuk semua salinan. Bilah bawah menambah mode tunggal atau grup, slider Spacing, dan atur ulang tampilan. |
| AI Background | Latar: warna bebas, transparan (pola kotak), 7 warna solid, 14 gradasi dan "See all". "Try AI background": template per kategori (Trending, Minimalism, Indoor, Outdoor, Studio, dan lain-lain) atau Custom (gambar acuan dan prompt 400 karakter), rasio 1:1, 4:3, 3:4, 16:9, 9:16, 4:5, resolusi 1K atau 2K | Latar transparan dan warna berfungsi. Generate AI tidak dijalankan (memakai kredit). |
| Video | Animation dan AI Video. 12 preset: Rhythm 6s, Rotation 4s, Impact 5s, Rhythm Pro 7s, Entrance Pro 5s, Entrance 6s, Showtime 6s, Showtime Pro 10s, Details Pro 8s, Details 8s, Ascent 6s, Drop 8s | Klik kartu memutar animasi langsung di kanvas dengan hitung mundur. Bilah alat nonaktif selama animasi. Tombol unduh meminta login. |
| More | Open AI Background Generator, desain dengan software 3D, Pacdora Editor API, AI Poster, AI Packaging Design, Design in Illustrator, Dieline Template Generator | Tautan ke produk lain |

**Bilah alat.** [TERAMATI]

| Lokasi | Kontrol | Perilaku |
|---|---|---|
| Kanan | Pilih, geser (hand), komentar, undo, redo | Ctrl+Z membatalkan perubahan warna dan material. Tombol komentar hilang di mode Layout. |
| Bawah | Zoom keluar dan masuk, bayangan, sudut kamera, "Watermark free" | Bayangan menyalakan bayangan di lantai. Sudut kamera meminta login. |
| Atas | Menu (Log in, bahasa), ikon awan, "3D Design", Share, Super export | Ikon awan menampilkan "Unsaved changes" dan "Log in to save". Share dan Super export meminta login. |
| Kanvas | Seret untuk memutar | Berfungsi. Sisi belakang tidak punya area cetak (data model hanya punya satu muka cetak, `F1`). |

**Batas pengguna tamu.** Unggah gambar, sudut kamera, unduh video, Super export, Share, dan simpan ke awan meminta login. Tamu hanya bisa mengubah warna, material, tata letak, dan latar, lalu melihat pratinjau. [TERAMATI]

**Simpan otomatis tamu.** Perubahan pertama membuat proyek di server (`POST /api/v2/projects`, URL berubah menjadi `?id=...`). Setiap perubahan berikutnya mengirim `PUT /api/v2/projects` dan mengunggah tangkapan kanvas ke bucket S3 (`render-cover/*.jpeg` atau `.png`) memakai token sementara dari `/api/v2/home/aws/token`. Ini terjadi walau ikon awan menyebut "Unsaved changes". [TERAMATI]

Isi data proyek yang dikirim (struktur, bukan nilai untuk ditiru): [TERAMATI]

| Bagian | Isi |
|---|---|
| `lights` | Peta lingkungan HDR (intensitas, rotasi) dan satu sinar matahari (posisi bola: phi, theta, radius; intensitas; radius bayangan) |
| `materialSetting` | Satu set parameter `MeshPhysicalMaterial` per bagian: warna, roughness, normal map berulang (pengulangan berbeda untuk badan dan benang jahit), normalScale, aoMapIntensity, specularIntensity, clearcoat, sisi ganda. Ada juga `outsideMaterial` untuk lapisan cetak. |
| `modelConfig` | Posisi kamera, fov 30, transformasi grup, nilai `fold` |
| `background*` | Jenis latar (warna, gradasi linear atau radial dengan titik kontrol, transparan) |
| `partThemeColorData` | Warna aktif dan daftar warna terakhir |
| `viewState` | Mode (tunggal atau layout), bayangan, ID scene layout, skala jarak, kamera layout |

**Teknologi (pembaruan bagian 3.5).** `window.__THREE__` bernilai `149`, jadi mesin 3D adalah three.js r149 [TERAMATI, sebelumnya INFERENSI]. Kanvas memakai konteks WebGL2. Vue dan Theatre.js terdeteksi di halaman. Pihak ketiga yang aktif selama sesi: GA4, Google Ads dan DoubleClick, Microsoft Clarity, Facebook, Google Sign-In, Freshchat. [TERAMATI]

**Ponsel.** Pada jendela selebar 500 px (batas terkecil browser uji), tata letak tetap versi desktop: tombol kanan atas terpotong dan panel menutupi kanvas. Belum diuji di perangkat nyata atau emulasi ponsel. [TERAMATI, dengan batasan]

**Arti bagi Mockup Viewer.**
1. Jalur gratis tamu di Pacdora berhenti di pratinjau. Ekspor dan unggah butuh akun. Ini memperkuat celah G2 dan keputusan D-01.
2. Pacdora mewarnai 4 bagian, dan lengan dihitung satu bagian ("Cuff"). Rencana B2 (badan, lengan kiri dan kanan, rib kerah) sudah lebih dalam.
3. Tamu mengirim tangkapan kanvas ke server pada setiap perubahan. Janji I7 (gambar tetap di perangkat) menjadi pembeda yang bisa dibuktikan lewat tab jaringan.
4. Struktur data proyek mereka (material per bagian, cahaya, kamera, latar, mode tampilan) cocok dengan rencana G1. Skema Mockup Viewer tetap dirancang sendiri.
5. Dua fitur belum ada di katalog dokumen 03: tata letak banyak tampilan dalam satu gambar (depan dan belakang berdampingan) dan preset animasi kamera. [KEPUTUSAN: masukkan ke katalog atau tidak]

## 3a. TeeMockup (`freeteemockup.com/editor`)

Pengamatan 13 November 2026 dengan MCP REA (`capture_browser_scenario`, Chrome 157, 1440 x 900), MCP Chrome DevTools (klik setiap kontrol, unggah gambar uji buatan sendiri), dan Playwright 1.65 (emulasi Pixel 7). Tanpa akun. Aset tidak disimpan.

| Area | Temuan | Label |
|---|---|---|
| Mode | Flat Lay (8 garmen: Crewneck, Ladies Tee, Polo Collar, Long Sleeve, Hoodie, Sweatshirt, V-Neck, Tank Top; sisi depan dan belakang) dan On Model (24 foto model dan suasana) | TERAMATI |
| Warna | 12 swatch bernama dan kolom heksadesimal. Satu warna untuk seluruh garmen. | TERAMATI |
| Desain | Unggah PNG atau JPG, 3 contoh grafis, seret, pegangan sudut untuk skala, pegangan bawah untuk putar. Slider Size 10 sampai 90, Rotation -180 sampai 180, Opacity 10 sampai 100. | TERAMATI |
| Realisme | Slider "Fold Shadows" (10 sampai 100) dan "Fabric Shine" (0 sampai 60) | TERAMATI |
| Latar | Solid, transparan, papan kayu putih, papan kayu cokelat. Kanvas 1:1, 4:3, 4:5, 9:16. Properti dekorasi (tanaman, topi, sepatu, kacamata, jeans, tas, celana pendek, daun). | TERAMATI |
| Ekspor | Dialog kualitas 1080 x 1080 atau 2160 x 2160, ekspor massal, teks "Free, no watermark, no limit." dan tombol donasi Ko-fi | TERAMATI |
| Privasi | Setelah unggah gambar, tidak ada permintaan POST atau PUT selain analitik. Gambar tetap di browser. | TERAMATI |
| Teknologi | Astro. Mesin `flatlay-engine` berbasis Canvas 2D (tanpa WebGL). Analitik GA4 dan Cloudflare. | TERAMATI |
| Ponsel | Tab bawah (Design, Garment, Canvas, Props), kanvas 378 px, tanpa gulir horizontal | TERAMATI (emulasi) |

**Cara kerja realisme (dari bundle publik, tidak dipakai ulang).** [TERAMATI]
- Flat Lay: foto kaos asli berlatar transparan. Luminans tiap piksel dipecah menjadi peta bayangan (piksel lebih gelap dari ambang 215 diberi kurva pangkat 1,8) dan peta kilau (piksel di atas ambang). Urutan komposit: masker garmen diisi warna kaos, desain digambar dengan `source-atop`, peta bayangan ditimpa dengan `multiply` (opasitas = Fold Shadows), lalu peta kilau dengan `screen` (opasitas = Fabric Shine).
- On Model: setiap foto punya tiga berkas: foto, peta bobot (kanal R = cakupan kain, G = pemotongan, B = kepemilikan warna asli), dan peta shade. Warna baru dibuat dari tabel 256 nilai per warna target (gamma berdasarkan terang warna, rona ambien, nilai di atas 1 untuk kilau). Warna asli foto dikurangi dan warna target ditambahkan sesuai bobot tiap piksel.

## 3b. Dezo Industry (`dezoindustry.com/free-mockup-generator/`)

Alat untuk menarik pesanan produksi pabrik garmen di Sialkot. Pengamatan dengan alat yang sama seperti 3a.

| Area | Temuan | Label |
|---|---|---|
| Produk | 22 garmen dari foto studio (hoodie, kaos, polo, jaket, celana, topi, kaus kaki) dan "Upload your product" untuk foto produk sendiri | TERAMATI |
| Warna per bagian | Whole garment, Front body, Back body, Sleeves, Hood, Inside/lining, Cuffs, Hem band, Pocket, Drawcords. 22 swatch bernama dengan heksadesimal dan warna bebas. | TERAMATI |
| Tekstur | Fabric look: Smooth, Heather, Ribbed knit, Leather grain. 141 motif (camo, tie-dye, garis, kotak, hewan, abstrak) dengan slider ukuran motif, per bagian. | TERAMATI |
| Logo dan teks | Unggah logo (SVG, AI, PDF, EPS, PSD, PNG, JPG, ZIP), teks dengan 15 font, bold, italic, outline, lengkung, jarak huruf. Zona: dada tengah, dada kiri, dada kanan, depan bawah, lengan kiri, lengan kanan. Ukuran dalam inci atau cm. | TERAMATI |
| Jenis dekorasi | 24 pilihan, antara lain sablon, DTG/DTF, puff, foil, rhinestone, bordir datar dan 3D, chenille, patch | TERAMATI |
| Alat lain | Undo, redo, grid, area aman, zoom, putar 360, 150 suasana gaya hidup, line sheet, desain AI, vektorisasi logo | TERAMATI |
| Pratinjau | Kanvas 2D dengan watermark "© DEZO INDUSTRY" | TERAMATI |
| Privasi | Teks "Your files go only to Dezo". Halaman mengirim beberapa `POST admin-ajax.php` saat dimuat. Formulir penawaran melampirkan gambar mockup otomatis. | TERAMATI |
| Teknologi | WordPress, skrip tema `mockup.js` (146 KB) dan modul terpisah per fitur | TERAMATI |

**Cara kerja realisme.** Setiap garmen punya foto (`mockups/{produk}-{sisi}.webp`) dan masker (`mockups/masks/{produk}-{sisi}.webp`). Masker menyimpan nomor bagian di kanal warna. Logo digambar di atas foto dengan `soft-light` (opasitas berbeda per jenis dekorasi) lalu dipotong dengan `destination-in` sesuai masker. [TERAMATI pada nama berkas dan bundle, rincian pewarnaan per bagian INFERENSI]

**Arti bagi Mockup Viewer.**
1. Kesan "nyata" di kedua alat ini datang dari foto garmen asli. Bayangan lipatan dan kilau diambil dari luminans foto, tidak dihitung dari geometri.
2. Mesin 3D prosedural Mockup Viewer (badan superelips, lengan silinder, kerah tabung) tidak punya lipatan nyata, sehingga tidak akan menyamai foto hanya dengan mengubah material. [KEPUTUSAN: pendekatan pratinjau, foto 2D, model 3D hasil simulasi kain, atau gabungan]
3. Kontrol yang layak ditiru polanya: slider bayangan lipatan dan kilau kain, ukuran cetak dalam cm, warna per bagian dengan masker, area aman.

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
| Tab Model, Tata letak, Latar, Video di Pacdora sudah dibuka pada model 605371 (bagian 3.6). Fitur yang meminta login dan AI berbayar tidak dijalankan. | Perilaku ekspor, unggah, berbagi, dan hasil AI Pacdora belum tercatat |
| Tidak login dan tidak membayar | Isi paket berbayar hanya dari halaman harga |
| Penyelidikan bundle memakai pencocokan string | Penyebutan three.js dan MediaRecorder berstatus INFERENSI |
| Angka sosial dan pengguna dari situs mereka | Tidak dipakai sebagai data pasar |
| Satu hari pengamatan | Situs bisa berubah. Ulangi riset sebelum peluncuran. |

Bukti sesi analisis (ID Evidence REA): VirtualThreads `/updates` `ev_31949505546547817ca8dfe37fd8d3a405f0fc05acf2ffee7026a93413ce41b9`, VirtualThreads editor Advanced Controls `ev_badfc35eb1c38ba423a47a22a2b5e033559415669b7a6ab4ac1f95f0840e52ea`, Pacdora harga `ev_d00cd25a71c3becd861aa03d9e04ccbdc57891b56ae2d528137ce7609aba0eb7`, Pacdora panel Bagian kustom `ev_58bed8f29afeafd35b79ef214b1b73e82ff2c170b0b78a327b73a6a4cce43a63`. Tangkapan lain tersimpan sebagai berkas hasil alat pada sesi kerja dan tidak dikomit ke repositori.

## 8. Langkah riset lanjutan

1. Selesai untuk Pacdora model 605371 (bagian 3.6).
2. Coba alat teks dan unggah gambar nyata di VirtualThreads. Di Pacdora, unggah meminta login, jadi batas ukuran dan format file belum tercatat.
3. Uji kedua editor di ponsel kelas menengah, catat waktu muat dan kelancaran.
4. Tambahkan 2 sampai 3 kompetitor lain (alat mockup 2D dan PSD, serta alat 3D lain) setelah wawancara pengguna menyebut nama yang mereka pakai.
