# 05. Model Bisnis dan Go-to-Market

| | |
|---|---|
| Versi | 0.1 (draf) |
| Tanggal | 13 November 2026 |
| Catatan | Dokumen ini sengaja tidak memuat angka pasar, jumlah pengguna, atau proyeksi pendapatan. Semua angka harus berasal dari data nyata. Tempat yang membutuhkan data diberi [NEED]. |

## 1. Prinsip

1. Fitur inti gratis untuk pengguna. Tidak ada watermark dan tidak ada akun wajib (D-01, D-02).
2. Biaya dibuat rendah oleh desain: render, ekspor, dan penyimpanan proyek berjalan di perangkat pengguna.
3. Pendapatan, bila ada, tidak boleh mengambil sesuatu yang sudah gratis. Ia menambah, tidak menarik mundur.
4. Keputusan keuangan memakai data pemakaian nyata, bukan perkiraan optimistis.

## 2. Struktur biaya

| Pos | Pendorong | Cara menekan | Catatan |
|---|---|---|---|
| Pembuatan aset 3D | Jam kerja seniman 3D untuk model, bagian, UV, tekstur | Mulai dari satu model dengan tiga varian. Tambah varian berdasarkan data pemakaian. | Biaya terbesar dan paling tidak pasti. Belum ada angka: [NEED: penawaran seniman 3D]. |
| Hosting aset statis dan CDN | Jumlah kunjungan dikali ukuran model dan tekstur | Kompresi aset, cache panjang, pemuatan bertahap | [NEED: tarif penyedia terpilih] |
| Domain dan sertifikat | Tetap | | [NEED] |
| Penyimpanan tautan berbagi (Fase 2) | Jumlah proyek dibagikan dikali ukuran, masa berlaku | Masa berlaku tautan, batas ukuran, kompresi | Satu-satunya biaya server yang tumbuh sesuai pemakaian |
| Moderasi dan laporan (Fase 2) | Volume tautan dan laporan | Tombol laporan, penghapusan otomatis setelah kedaluwarsa | |
| Analitik | Volume peristiwa | Alat tanpa cookie dan hemat peristiwa | [NEED: pilihan alat dan tarifnya] |
| Dukungan pengguna | Jumlah pertanyaan | FAQ, pesan galat yang jelas | |
| Pengembangan | Waktu tim | Cakupan Fase 1 yang sempit | |

## 3. Opsi pendapatan

| Opsi | Cara kerja | Selaras dengan janji gratis? | Risiko | Kapan dievaluasi |
|---|---|---|---|---|
| A. Donasi dan sponsor | Tombol dukungan sukarela. Sponsor bisnis sablon atau percetakan dengan penempatan jelas berlabel. | Ya | Pendapatan kecil dan tidak pasti. Sponsor bisa mengaburkan kenetralan bila tidak diberi batas. | Setelah ada pengguna aktif yang stabil |
| B. Rujukan vendor | Tautan ke vendor sablon dan konveksi mitra, berlabel jelas sebagai kemitraan. Komisi atau biaya per rujukan. | Ya, bila fitur inti tetap gratis dan label jelas | Konflik kepentingan. Perlu aturan yang jelas tentang kemitraan dan pengungkapan. | Setelah ada data bahwa pengguna melanjutkan ke produksi |
| C. Paket Pro opsional | Tambahan kenyamanan: penyimpanan awan dan sinkronisasi, banyak proyek, kit brand (font dan warna tersimpan), tautan berbagi lebih lama, lembar spesifikasi lanjutan. Semua fitur inti tetap gratis. | Ya, bila batasnya hanya kenyamanan | Perlu akun dan pembayaran (biaya dan kompleksitas). Salah menarik garis dapat merusak kepercayaan. | Setelah Fase 2 dan ada bukti permintaan |
| D. Embed untuk toko sablon dan konveksi | Penampil yang bisa dipasang di situs toko, dengan langganan atau biaya pemasangan. | Ya (pengguna akhir tetap gratis) | Membutuhkan dukungan pelanggan bisnis. Perlu syarat atribusi. | Fase 3, setelah wawancara dengan P3 |
| E. White-label | Versi dengan merek mitra | Tidak ideal untuk fokus awal | Menambah kompleksitas | Tidak direncanakan |

**Rekomendasi bertahap.**
1. Fase 1 dan 2: tanpa pendapatan. Fokus memvalidasi pemakaian. Opsi A boleh dipasang bila biaya mulai terasa.
2. Fase 2 akhir: uji opsi B secara kecil dengan satu atau dua vendor yang bersedia, dengan label kemitraan yang jelas.
3. Fase 3: evaluasi opsi C dan D berdasarkan data. Pilih satu, jangan keduanya sekaligus.

Keputusan terkait: D-02 (tanpa watermark) dan D-03 (boleh komersial) mengunci bahwa pendapatan tidak datang dari menahan hak pakai.

## 4. Titik impas (rumus, tanpa angka)

| Simbol | Arti |
|---|---|
| F | Biaya tetap bulanan (domain, hosting dasar, alat, langganan) |
| v | Biaya variabel per pengguna aktif bulanan (bandwidth, penyimpanan berbagi) |
| r | Pendapatan rata-rata per pengguna aktif bulanan dari semua sumber |
| MAU | Pengguna aktif bulanan |

Titik impas bulanan: `MAU = F / (r - v)`. Berlaku bila r lebih besar dari v. Bila r nol (tanpa pendapatan), biaya F + v x MAU harus ditanggung pemilik atau donasi.

Cara memakainya: isi F dan v dari tagihan nyata setelah soft launch, hitung r dari sumber pendapatan yang sudah berjalan, lalu lihat berapa MAU yang dibutuhkan. Hasil menentukan apakah opsi di bagian 3 perlu dipercepat.

| Masukan | Nilai | Sumber |
|---|---|---|
| F | [NEED] | Tagihan bulan ke-1 setelah rilis |
| v | [NEED] | Tagihan CDN dan penyimpanan dibagi MAU |
| r | [NEED] | Laporan pendapatan |

## 5. Pasar

Tidak ada angka pasar di dokumen ini. Rencana estimasi bottom-up setelah wawancara:

1. Tentukan segmen awal (P1 dan P2).
2. Hitung jumlah unit di segmen dari sumber yang bisa dicek (misalnya asosiasi, data pelaku usaha, hasil pencarian marketplace). [NEED: sumber]
3. Kalikan dengan proporsi yang membutuhkan mockup secara rutin, dari hasil wawancara. [NEED: data wawancara]
4. Kalikan dengan proporsi yang realistis dijangkau lewat saluran yang tersedia.

Sampai ada data, dokumen lain tidak boleh mengutip angka pasar.

## 6. Go-to-market

### 6.1 Pesan inti

| Audiens | Pesan | Bukti yang harus ada sebelum dipakai |
|---|---|---|
| Brand kaos kecil | Lihat koleksimu di kaos 3D sebelum produksi. Unduh tanpa watermark. | Fitur selesai dan ekspor tanpa watermark (D-02) |
| Desainer dan tukang sablon | Tunjukkan desain di kaos yang bisa diputar. | Fitur putar dan ganti warna cepat |
| Konveksi | Bantu pelanggan melihat hasil sebelum memesan. | Ukuran cetak nyata dan lembar spesifikasi (Fase 3) |
| Panitia dan komunitas | Pilih warna dan desain bersama. | Tautan berbagi (Fase 2) |

### 6.2 Saluran

| Saluran | Cara | Pengukuran |
|---|---|---|
| Pencarian organik | Halaman alat dan panduan dengan kata kunci yang dicari orang (hipotesis: "mockup kaos 3D gratis", "mockup kaos polos", "desain kaos online", "mockup kaos tanpa watermark"). Validasi volume dengan alat riset kata kunci sebelum memilih. | Impresi, klik, posisi, aktivasi dari organik |
| Konten edukasi | Panduan: memilih bahan kaos (combed, carded, dry-fit), menyiapkan file untuk sablon, memilih ukuran cetak, membaca istilah vendor. Setiap panduan mengarah ke editor. | Kunjungan dan klik ke editor |
| Video pendek | Video putar 360 hasil editor di TikTok dan Reels, tampilan proses sebelum dan sesudah | Tontonan dan kunjungan |
| Komunitas | Grup brand clothing, komunitas desainer dan sablon, grup kampus dan panitia. Hadir sebagai pengguna yang membantu, bukan iklan massal. Ikuti aturan setiap grup. | Kunjungan dari rujukan, umpan balik |
| Kemitraan sablon dan konveksi | Tawarkan editor sebagai alat bantu di toko mereka. Dasar untuk embed (Fase 3). | Jumlah mitra aktif |
| Peluncuran publik | Komunitas teknologi dan desain, dengan cerita produk yang jujur | Kunjungan dan aktivasi |

### 6.3 Tahap peluncuran

| Tahap | Tujuan | Kegiatan | Syarat lanjut |
|---|---|---|---|
| 0. Validasi | Menguji hipotesis sebelum membangun penuh | Wawancara 10 sampai 15 calon pengguna dari P1 sampai P3 [TARGET], uji prototipe | Bukti masalah dan minat (dokumen 06) |
| 1. Uji tertutup | Mencari galat dan hambatan | Undang pengguna wawancara memakai build awal | Pengguna bisa sampai ekspor tanpa bantuan |
| 2. Soft launch | Mengukur aktivasi dan biaya nyata | Publikasi terbatas, pantau metrik dan tagihan | Metrik dasar terkumpul 4 minggu |
| 3. Peluncuran publik | Menarik pengguna dalam jumlah lebih besar | Konten, video, komunitas, tulisan peluncuran | Stabil dan biaya terkendali |
| 4. Pertumbuhan | Memperluas fitur dan saluran | Fase 2 dan 3 produk, kemitraan | Berdasarkan data |

### 6.4 Corong dan peristiwa

| Tahap | Definisi | Peristiwa (dokumen 06) |
|---|---|---|
| Kunjungan | Sesi di halaman mana pun | halaman dilihat |
| Masuk editor | Sesi yang membuka editor | `editor_opened` |
| Aktivasi | Sesi editor yang mengunggah gambar atau menambah tulisan, lalu mengunduh | `design_added`, `export_completed` |
| Kembali | Pengguna perangkat sama yang kembali dalam 7 hari | `editor_opened` dengan pengguna berulang |
| Rujukan | Pengguna yang tiba lewat tautan berbagi (Fase 2) | `shared_link_opened` |

### 6.5 SEO dan konten (arah awal)

Dokumen SEO mendalam dikerjakan terpisah bila diminta. Arah awal:
- Satu halaman alat utama, satu halaman per panduan edukasi, dan indeks panduan.
- Kerangka data aplikasi web (SoftwareApplication atau WebApplication) dengan harga nol, hanya setelah fitur dan harga final.
- Setiap klaim di halaman memiliki dasar (aturan di dokumen 07).

## 7. Risiko bisnis

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Biaya aset 3D lebih tinggi dari rencana | Fase 1 mundur | Spike satu model, kontrak seniman dengan hasil bertahap |
| Pengguna gratis banyak, pendapatan nol | Biaya tidak tertutup | Biaya variabel rendah, opsi A dan B lebih awal bila perlu |
| Kompetitor memperluas versi gratis | Pembeda mengecil | Fokus pada kedalaman detail dan konteks lokal, pantau mereka berkala |
| Ketergantungan pada trafik organik | Pertumbuhan lambat | Video pendek, komunitas, kemitraan |
| Kemitraan vendor merusak kepercayaan | Reputasi | Label jelas, fitur inti tetap netral |
| Klaim berlebihan | Kepercayaan hilang, risiko hukum | Aturan klaim di dokumen 07 |
