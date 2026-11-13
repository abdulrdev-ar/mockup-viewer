# Mockup Viewer: Dokumen Bisnis

| | |
|---|---|
| Versi | 0.1 (draf untuk ditinjau) |
| Tanggal | 13 November 2026 |
| Cakupan | Dokumen bisnis, produk, dan copywriting. Belum ada kode, desain UI, atau arsitektur teknis final. |
| Bahasa | Indonesia (produk dirancang Indonesia-first, English menyusul) |

## Apa itu Mockup Viewer

Mockup Viewer adalah editor mockup kaos 3D yang berjalan di browser, gratis untuk semua orang. Pengguna mengunggah gambar, menambah tulisan, memilih warna dan bahan, lalu mengatur detail kecil seperti bentuk kerah, panjang lengan, dan jahitan. Setiap perubahan langsung terlihat di model 3D yang bisa diputar.

Saat ini model yang tersedia hanya kaos polos. Fokus ini disengaja: satu produk yang bisa diatur sampai detail lebih berguna daripada banyak produk yang hanya bisa diganti warna.

## Ringkasan satu halaman

| Pertanyaan | Jawaban |
|---|---|
| Masalah apa yang diselesaikan? | Membuat mockup kaos yang meyakinkan butuh Photoshop dan file PSD, atau tool 3D yang memberi watermark di versi gratis dan mengunci lisensi komersial di paket berbayar. Detail seperti kerah dan lengan hampir tidak bisa diatur dalam satu editor. |
| Untuk siapa? | Pemilik brand kaos kecil, desainer dan tukang sablon freelance, konveksi dan vendor cetak, panitia acara dan komunitas, penjual reseller. Semua adalah hipotesis awal (lihat dokumen 02). |
| Apa solusinya? | Editor 3D di browser dengan kontrol warna, gambar, teks, bahan, dan detail model. Pengguna tidak perlu akun, dan hasil diunduh tanpa watermark. |
| Apa pembedanya? | Kedalaman kustomisasi pada satu garmen, gratis penuh, konteks lokal (istilah bahan dan cetak yang dipakai orang Indonesia), dan gambar yang tetap di perangkat pengguna. |
| Bagaimana bisnisnya bertahan? | Biaya dibuat rendah dengan render dan ekspor di sisi pengguna. Pendapatan dievaluasi bertahap (donasi, rujukan vendor, embed untuk toko sablon, paket Pro opsional). Detail di dokumen 05. |
| Apa yang dibangun lebih dulu? | Fase 1: kaos polos, warna, gambar, teks dasar, 4 bahan, kerah, lengan, potongan, ekspor PNG. Detail di dokumen 03 dan 06. |

## Daftar dokumen

| No | Dokumen | Isi | Pembaca utama |
|---|---|---|---|
| 01 | [Riset kompetitor dan hasil reverse engineering](01-riset-kompetitor-rea.md) | Temuan dari VirtualThreads dan Pacdora: fitur, harga, teknologi, celah pasar | Seluruh tim |
| 02 | [Visi, positioning, dan persona](02-visi-positioning-persona.md) | Visi, masalah, persona, proposisi nilai, suara merek | Pemilik produk, pemasaran |
| 03 | [Katalog fitur](03-katalog-fitur.md) | Semua fitur lengkap dengan teks produk, perilaku, dan fase | Produk, desain, pengembang |
| 04 | [PRD dan user story](04-prd-user-stories.md) | Alur pengguna, user story, kriteria penerimaan, kebutuhan non-fungsional | Produk, pengembang, QA |
| 05 | [Model bisnis dan go-to-market](05-model-bisnis-gtm.md) | Struktur biaya, opsi pendapatan, strategi peluncuran dan pertumbuhan | Pemilik produk, pemasaran |
| 06 | [Roadmap, metrik, dan risiko](06-roadmap-metrik-risiko.md) | Fase, kriteria selesai, KPI, rencana pelacakan, daftar risiko | Seluruh tim |
| 07 | [Legal, etika, dan kepatuhan](07-legal-etika-kepatuhan.md) | Batas reverse engineering, hak kekayaan intelektual, privasi, syarat layanan | Pemilik produk, penasihat hukum |
| 08 | [Copywriting](08-copywriting.md) | Teks landing page, teks di dalam editor, FAQ, meta SEO | Pemasaran, desain, pengembang |
| 09 | [Daftar aset dan model yang dibutuhkan](09-aset.md) | Sumber dan lisensi setiap aset, cara mengolah model, model yang belum ada | Pemilik produk, pengembang, seniman 3D |

## Keputusan

Keputusan di bawah memakai nilai bawaan (rekomendasi) supaya dokumen lain bisa konsisten. Ubah di sini bila berbeda, lalu sesuaikan dokumen terkait.

| ID | Keputusan | Nilai bawaan | Status | Dipakai di |
|---|---|---|---|---|
| D-01 | Pengguna perlu akun? | Tidak. Langsung pakai. | Rekomendasi, perlu konfirmasi | 02, 04, 08 |
| D-02 | Ada watermark di hasil ekspor? | Tidak. | Rekomendasi, perlu konfirmasi | 02, 05, 08 |
| D-03 | Hasil ekspor boleh dipakai komersial? | Ya, pengguna memiliki hasil ekspor. | Rekomendasi, perlu konfirmasi | 05, 07, 08 |
| D-04 | Gambar pengguna diunggah ke server? | Tidak pada Fase 1. Semua diproses di browser. | Rekomendasi, perlu konfirmasi arsitektur | 04, 07, 08 |
| D-05 | Sumber model 3D dan tekstur | Dibuat sendiri atau berlisensi jelas. Tidak mengambil aset kompetitor. | Wajib | 07 |
| D-06 | Bahasa awal | Indonesia, lalu English | Rekomendasi | 08 |
| D-07 | Alat analitik | Tanpa cookie dan tanpa session replay | Rekomendasi, belum dipilih alatnya | 06, 07 |
| D-08 | Nama produk "Mockup Viewer" | Dipakai sementara | Belum dicek ketersediaan merek dan domain | 07 |
| D-09 | Arah visual (DESIGN.md) | Belum ada | Harus ditulis pemilik produk sebelum UI dibuat | 02 |

## Label pada dokumen

| Label | Arti |
|---|---|
| [TERAMATI] | Fakta yang dilihat langsung saat analisis pada 13 November 2026 |
| [INFERENSI] | Kesimpulan dari bukti tidak langsung (misalnya nama file atau string di bundle JavaScript). Belum diverifikasi saat berjalan. |
| [ASUMSI] | Dugaan kerja yang perlu divalidasi sebelum dijadikan dasar keputusan |
| [TARGET] | Angka sasaran internal, bukan klaim tentang kenyataan |
| [NEED: ...] | Data atau aset nyata yang belum ada. Jangan diisi dengan angka karangan. |
| [KEPUTUSAN: ...] | Butuh keputusan pemilik produk |

## Yang sengaja belum dikerjakan

- Kode, struktur proyek, dan arsitektur teknis final.
- Desain visual dan komponen UI. Menunggu arah visual dari pemilik produk (D-09).
- Dokumen SEO mendalam. Dokumen 05 hanya memuat arah awal.
- Angka pasar, jumlah pengguna, dan testimoni. Semua harus berasal dari sumber nyata.
