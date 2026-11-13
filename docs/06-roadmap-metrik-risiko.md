# 06. Roadmap, Metrik, dan Risiko

| | |
|---|---|
| Versi | 0.1 (draf) |
| Tanggal | 13 November 2026 |
| Catatan | Durasi adalah [ASUMSI] untuk tim kecil (1 sampai 2 orang ditambah seniman 3D). Perkirakan ulang setelah spike teknis di Fase 0. |

## 1. Roadmap per fase

| Fase | Tujuan | Cakupan | Perkiraan durasi |
|---|---|---|---|
| 0. Validasi dan spike | Memastikan masalah nyata dan solusi layak dibangun | Wawancara pengguna, keputusan D-01 sampai D-09, arah visual, spike teknis (satu model dengan warna, gambar, ekspor, uji ponsel) | 2 sampai 3 minggu [ASUMSI] |
| 1. MVP kaos polos | Editor yang bisa dipakai dari awal sampai unduhan | 32 fitur Fase 1 (dokumen 04) | 8 sampai 12 minggu [ASUMSI] |
| 2. Pendalaman | Detail produksi dan berbagi | 22 fitur Fase 2: lapisan, jenis cetak, cuci, hem, jahitan, saku, varian, tautan berbagi, berkas proyek, video, lembar varian, English | 8 sampai 10 minggu [ASUMSI] |
| 3. Perluasan | Menjawab kebutuhan konveksi dan memperluas produk | 5 fitur Fase 3: gerak kain, label dan aksesori, ukuran referensi, embed, lembar spesifikasi. Model garmen lain berdasarkan data permintaan. | Terbuka |

### Kriteria selesai per fase

**Fase 0.**
- Minimal 10 wawancara dari P1 sampai P3 selesai dan dirangkum [TARGET].
- Hipotesis H1 sampai H4 punya hasil (terbukti, terbantahkan, atau perlu uji lagi).
- Keputusan D-01 sampai D-09 terisi atau punya tanggal pembahasan.
- Spike teknis berjalan: satu kaos 3D dengan ganti warna, satu gambar di dada, ekspor PNG, diuji di satu ponsel kelas menengah, dengan catatan kelancaran dan ukuran aset.
- Penawaran atau rencana pembuatan aset 3D untuk varian kerah, lengan, dan potongan.

**Fase 1.**
- Semua user story US-01 sampai US-22 lulus uji.
- Pemeriksaan jaringan membuktikan tidak ada gambar pengguna yang dikirim ke server (US-07, US-21).
- Core Web Vitals mencapai ambang "baik" pada uji laboratorium di halaman alat [TARGET].
- Lulus uji keyboard dan kontras WCAG AA.
- Syarat layanan, kebijakan privasi, dan kebijakan konten tayang (dokumen 07).
- Uji dengan pengguna dari wawancara: mayoritas sampai unduhan tanpa bantuan [TARGET: tetapkan ambang di Fase 0].

**Fase 2.**
- Moderasi dan tombol laporan untuk tautan berbagi aktif.
- Tingkat keberhasilan ekspor video sesuai ambang [TARGET].
- English tersedia.

**Fase 3.**
- Setidaknya satu konveksi atau percetakan memakai embed atau lembar spesifikasi dalam pekerjaan nyata.

## 2. Hipotesis dan cara menguji

| ID | Hipotesis | Cara menguji | Tanda terbukti [TARGET] |
|---|---|---|---|
| H1 | Pengguna yang menyiapkan kaos butuh mengganti kerah dan lengan dalam satu editor | Wawancara dan tes prototipe: minta peserta membuat kaos yang mereka pakai di proyek terakhir | Sebagian besar peserta mengubah detail kerah atau lengan tanpa diminta |
| H2 | Tanpa watermark dan boleh komersial menjadi alasan memilih alat ini | Tanyakan alat yang dipakai sekarang dan alasan berhenti memakainya | Alasan terkait watermark atau biaya muncul berulang |
| H3 | Istilah dan konteks lokal menaikkan kepercayaan | Uji dua versi teks (istilah umum dan istilah lokal) pada peserta | Peserta lebih cepat paham pada versi lokal |
| H4 | Peringatan resolusi dan ukuran cetak dalam cm berguna bagi yang menyiapkan sablon | Uji dengan P2 dan P3 | Peserta memakai informasi itu untuk memperbaiki file |
| H5 | Janji gambar tetap di perangkat meningkatkan kepercayaan | Tanyakan kekhawatiran saat mengunggah desain | Kekhawatiran privasi disebut, dan janji menjawabnya |
| H6 | Konveksi mau memakai penampil di toko mereka | Wawancara P3 | Setidaknya sebagian bersedia mencoba |

Ambang kuantitatif ditetapkan di Fase 0 setelah jumlah peserta diketahui. Dengan 10 sampai 15 peserta, hasil bersifat arahan, bukan bukti statistik.

## 3. Metrik

### 3.1 Metrik utama (North Star)

**Jumlah ekspor selesai per minggu.** Ekspor selesai berarti pengguna menerima berkas gambar, tanda bahwa editor memberi hasil yang berguna.

### 3.2 Metrik pendukung

| Tahap | Metrik | Definisi | Target |
|---|---|---|---|
| Perolehan | Sesi editor per minggu | Jumlah `editor_opened` unik per sesi | Baseline 4 minggu, lalu tetapkan |
| Aktivasi | Tingkat aktivasi | Sesi editor yang memiliki `design_added` lalu `export_completed`, dibagi sesi editor, pada minggu yang sama | Baseline 4 minggu, lalu tetapkan |
| Aktivasi | Waktu ke ekspor pertama | Median selisih waktu `editor_opened` ke `export_completed` pertama | Baseline 4 minggu, lalu tetapkan |
| Keterlibatan | Kedalaman kustomisasi | Median jumlah jenis kontrol berbeda yang dipakai per sesi ekspor (warna, bagian, gambar, teks, bahan, kerah, lengan, potongan) | Baseline 4 minggu |
| Retensi | Kembali 7 hari | Pengguna perangkat unik yang kembali dalam 7 hari setelah kunjungan pertama, dibagi pengguna perangkat unik pada minggu kunjungan pertama | Baseline 4 minggu |
| Kualitas | Keberhasilan ekspor | `export_completed` dibagi (`export_completed` + `export_failed`) | 95 persen atau lebih [TARGET] |
| Kualitas | Tidak didukung | Sesi dengan `webgl_unsupported` dibagi sesi editor | Pantau, kurangi lewat fallback bila tinggi |
| Kualitas | Performa | LCP, INP, CLS di lapangan | Ambang "baik" [TARGET] |
| Rujukan | Pembukaan tautan berbagi (Fase 2) | `shared_link_opened` per tautan dibuat | Baseline |
| Biaya | Biaya per pengguna aktif | Tagihan dibagi MAU | Dipantau untuk rumus titik impas (dokumen 05) |

Aturan pembagian: metrik rasio memakai pembilang dan penyebut dari jendela waktu yang sama dan sudah tertutup. Jangan membagi total biaya satu bulan penuh dengan hasil dari periode yang belum selesai.

## 4. Rencana pelacakan

### 4.1 Prinsip

- Penamaan: `objek_aksi` dalam snake_case, kata lampau untuk peristiwa yang sudah terjadi.
- Tidak ada isi pengguna: tidak mengirim gambar, teks yang diketik, nama berkas, atau data pribadi.
- Tanpa cookie dan tanpa rekaman sesi (D-07). Identitas pengguna anonim dan tidak lintas situs.
- Parameter kampanye (UTM) dicatat pada kunjungan pertama saja.
- Alat belum dipilih. Pilih alat yang dapat memenuhi prinsip di atas dan bisa dihosting sendiri bila perlu.

### 4.2 Peristiwa

| Peristiwa | Kapan | Properti |
|---|---|---|
| `editor_opened` | Editor selesai dimuat | `locale`, `device_class` (desktop atau ponsel), `quality_level`, `load_ms` |
| `webgl_unsupported` | Tidak bisa membuat konteks WebGL | `browser_family` |
| `design_added` | Gambar atau teks ditambahkan | `type` (image atau text), `zone`, `file_format` (untuk gambar) |
| `color_changed` | Warna kaos atau bagian diubah | `scope` (all atau part), `part` |
| `material_changed` | Bahan diubah | `material`, `thickness` |
| `shape_changed` | Kerah, lengan, atau potongan diubah | `control` (neck, sleeve, fit), `value` |
| `camera_preset_used` | Preset kamera dipakai | `preset` |
| `background_changed` | Latar diubah | `type` |
| `resolution_warning_shown` | Peringatan resolusi tampil | `zone` |
| `export_started` | Dialog unduh dikonfirmasi | `format`, `resolution`, `transparent_bg` |
| `export_completed` | Berkas berhasil dibuat | `format`, `resolution`, `duration_ms` |
| `export_failed` | Ekspor gagal | `reason` |
| `project_restored` | Proyek dipulihkan dari penyimpanan | `age_days_bucket` |
| `storage_unavailable` | Penyimpanan browser gagal | `reason` |
| `quality_downgraded` | Kualitas turun otomatis | `from`, `to` |
| `shared_link_created` (Fase 2) | Tautan dibuat | `ttl_bucket` |
| `shared_link_opened` (Fase 2) | Tautan dibuka | |

### 4.3 Verifikasi

Sebelum rilis, uji dengan membuka tab jaringan: setiap permintaan analitik berisi hanya properti di tabel, dan tidak ada permintaan yang membawa isi gambar atau teks.

## 5. Daftar risiko

Peringkat kualitatif: T (tinggi), S (sedang), R (rendah).

| ID | Risiko | Kemungkinan | Dampak | Mitigasi | Pemilik |
|---|---|---|---|---|---|
| R-01 | Aset 3D modular (kerah, lengan, potongan) lebih lama dan mahal dari rencana | T | T | Spike satu model. Mulai dengan 3 kerah, 3 lengan, 3 potongan. Kontrak hasil bertahap. | Produk dan seniman 3D |
| R-02 | Performa buruk di ponsel kelas menengah | S | T | Anggaran ukuran aset, kualitas adaptif, uji di perangkat nyata sejak spike | Pengembang |
| R-03 | Biaya tidak tertutup karena pendapatan nol | S | T | Biaya variabel rendah, opsi pendapatan bertahap (dokumen 05), pantau tagihan bulanan | Pemilik produk |
| R-04 | Kompetitor memperluas versi gratis | S | S | Fokus pada kedalaman detail dan konteks lokal. Pantau ulang tiap kuartal. | Produk |
| R-05 | Aset atau font melanggar lisensi atau hak pihak lain | R | T | Daftar sumber dan lisensi setiap aset. Tidak memakai aset kompetitor. | Pemilik produk |
| R-06 | Pengguna kecewa karena warna atau bahan berbeda dari kenyataan | T | S | Catatan akurasi di produk, FAQ jujur, jangan menjanjikan kecocokan penuh | Produk dan konten |
| R-07 | Batas resolusi ekspor lebih rendah dari harapan | S | S | Tampilkan resolusi yang tersedia sebelum unduh. Uji batas pada perangkat umum. | Pengembang |
| R-08 | Trafik organik tumbuh lambat | T | S | Video pendek, komunitas, kemitraan, panduan | Pemasaran |
| R-09 | Penyalahgunaan tautan berbagi (konten melanggar) | S | S | Tombol laporan, masa berlaku, penghapusan, kebijakan konten | Produk |
| R-10 | Ketidakpatuhan privasi (UU Pelindungan Data Pribadi) | R | T | Data minimal, tanpa isi pengguna, kebijakan privasi, tinjauan hukum | Pemilik produk |
| R-11 | Ketergantungan pada satu pengembang | S | S | Dokumentasi, kode sederhana, pembagian pengetahuan | Pemilik produk |
| R-12 | Nama atau merek bentrok dengan pihak lain | S | S | Periksa pangkalan data merek dan domain sebelum peluncuran (D-08) | Pemilik produk |
| R-13 | Klaim berlebihan atau data tidak berdasar di pemasaran | R | T | Aturan klaim dokumen 07, tinjauan sebelum terbit | Pemasaran |
| R-14 | Peramban tertentu tidak mendukung fitur (misalnya perekaman video di Safari) | S | S | Deteksi kemampuan, sembunyikan opsi yang tidak didukung dengan penjelasan | Pengembang |

## 6. Kalender keputusan

| Keputusan | Dibutuhkan sebelum |
|---|---|
| D-01 sampai D-04, D-07 | Spike teknis dan desain teknis |
| D-05 | Mulai pembuatan aset |
| D-08 | Pembuatan merek dan domain |
| D-09 | Desain antarmuka |
| Model bisnis opsi A sampai D | Akhir Fase 2 |
