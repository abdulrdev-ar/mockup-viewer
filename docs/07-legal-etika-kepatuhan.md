# 07. Legal, Etika, dan Kepatuhan

| | |
|---|---|
| Versi | 0.1 (draf) |
| Tanggal | 13 November 2026 |
| Penting | Dokumen ini adalah panduan kerja internal, bukan nasihat hukum. Tinjau dengan penasihat hukum sebelum peluncuran, terutama bagian syarat layanan, privasi, dan merek. |

## 1. Etika dan batas reverse engineering

Riset di dokumen 01 memakai analisis terhadap perilaku publik situs kompetitor. Batas yang dipegang:

| Dilakukan | Tidak dilakukan |
|---|---|
| Membuka halaman publik dengan browser otomatis, membaca teks, struktur halaman, dan permintaan jaringan | Login, membuat akun, atau memakai akun orang lain |
| Membaca nama berkas dan string di bundle JavaScript yang dimuat publik untuk menyimpulkan teknologi | Mengambil, menyalin, atau memakai ulang model 3D, tekstur, peta lingkungan, font, atau kode kompetitor |
| Mencatat harga dan batas paket dari halaman harga publik | Melewati paywall, watermark, atau batas penggunaan |
| Menyimpulkan pola fitur dan celah pasar | Meniru nama, logo, teks pemasaran, atau tata letak khas kompetitor |
| Mencatat klaim mereka sebagai klaim | Mengutip klaim mereka sebagai fakta pasar |

Catatan: URL aset model dan tekstur kompetitor terlihat di log jaringan. Terlihat tidak berarti boleh dipakai. Aset Mockup Viewer harus dibuat sendiri atau berlisensi jelas (D-05).

Bila ada keraguan tentang batas ini, hentikan dan konsultasikan sebelum melanjutkan.

## 2. Kekayaan intelektual

| Objek | Aturan | Tindakan |
|---|---|---|
| Model 3D kaos | Milik Mockup Viewer. Dibuat sendiri atau oleh seniman dengan kontrak pengalihan hak. | Simpan kontrak dan berkas sumber |
| Tekstur dan material | Sama dengan di atas, atau dari sumber berlisensi yang mengizinkan penggunaan komersial dan tertanam | Catat sumber dan lisensi di daftar aset |
| Peta lingkungan (HDR) | Buat sendiri atau pakai sumber berlisensi bebas (misalnya Poly Haven, CC0). Baca lisensi sebelum memakai. | Catat sumber di daftar aset |
| Font | Lisensi terbuka (misalnya SIL OFL) yang mengizinkan penggunaan pada gambar hasil pengguna | Cek lisensi per font, catat |
| Ikon dan ilustrasi | Buat sendiri atau lisensi jelas | Catat sumber |
| Nama "Mockup Viewer" | Belum dicek | Periksa pangkalan data merek (DJKI) dan ketersediaan domain sebelum merek dan domain dibeli (D-08) |
| Hasil ekspor pengguna | Lihat bagian 4 | |

**Daftar aset.** Siapkan satu berkas daftar aset (nama, sumber, lisensi, tanggal, tautan bukti). Setiap aset tanpa catatan tidak boleh masuk rilis.

## 3. Konten pengguna

| Topik | Kebijakan |
|---|---|
| Hak atas gambar unggahan | Pengguna menyatakan memiliki hak atas gambar yang diunggah. Mockup Viewer tidak mengklaim hak atas gambar pengguna. |
| Desain bermerek pihak lain | Pengguna bertanggung jawab atas desain yang dipakai. Syarat layanan melarang penggunaan untuk memalsukan merek atau menyesatkan. |
| Konten dilarang | Konten ilegal, melecehkan, atau melanggar hak pihak lain tidak diperbolehkan. Daftar rinci di kebijakan konten. |
| Pemeriksaan di Fase 1 | Tidak ada, karena gambar tidak meninggalkan perangkat pengguna (D-04). |
| Tautan berbagi (Fase 2) | Karena berkas disimpan di server, wajib ada: masa berlaku, tombol laporan, jalur penghapusan, kebijakan konten, dan tindak lanjut laporan dalam waktu yang ditetapkan. [KEPUTUSAN: batas waktu tindak lanjut] |
| Pengguna di bawah umur | Kebijakan usia minimum dan penjelasan di syarat layanan [KEPUTUSAN] |

## 4. Lisensi hasil ekspor

Rekomendasi (D-03, perlu konfirmasi dan tinjauan hukum):

1. Pengguna memiliki hasil ekspor gambar dan video, dan boleh memakainya untuk keperluan pribadi dan komersial, termasuk promosi dan penjualan produk.
2. Aset Mockup Viewer (model, tekstur, peta lingkungan) dilisensikan kepada pengguna hanya sejauh tampil dalam hasil ekspor. Pengguna tidak boleh mengekstrak atau mendistribusikan ulang aset mentah.
3. Pengguna tetap bertanggung jawab atas hak gambar yang diunggah.
4. Atribusi ke Mockup Viewer tidak diwajibkan, namun boleh dilakukan.
5. Ketentuan embed (Fase 3) diatur terpisah.

## 5. Privasi dan perlindungan data

Rujukan hukum utama di Indonesia: Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi. Tinjau kewajiban yang berlaku bagi layanan ini bersama penasihat hukum.

| Topik | Rancangan |
|---|---|
| Data yang diproses di Fase 1 | Tidak ada data pribadi yang dikirim ke server untuk fungsi inti. Gambar, teks, dan proyek tinggal di perangkat. |
| Analitik | Peristiwa penggunaan anonim yang tidak memuat isi pengguna. Tanpa cookie dan tanpa rekaman sesi (D-07). Bila alat yang dipilih memakai cookie atau pengenal, tampilkan persetujuan sebelum aktif. |
| Pernyataan "gambar tetap di perangkatmu" | Boleh dipasang hanya setelah diverifikasi lewat pemeriksaan jaringan (dokumen 04, US-07) dan harus ditarik bila arsitektur berubah |
| Tautan berbagi (Fase 2) | Data yang disimpan, lamanya, dan cara menghapus dijelaskan di kebijakan privasi dan di dialog sebelum membuat tautan |
| Hak pengguna | Jalur untuk bertanya dan meminta penghapusan data pada tautan berbagi |
| Pihak ketiga | Setiap layanan pihak ketiga (hosting, CDN, analitik) dicatat beserta data yang mereka terima |

## 6. Dokumen yang harus ada sebelum rilis

| Dokumen | Isi minimal |
|---|---|
| Syarat Layanan | Penggunaan yang diperbolehkan dan dilarang, hak atas konten, lisensi hasil ekspor, batas tanggung jawab, perubahan layanan |
| Kebijakan Privasi | Data yang diproses, tujuan, penyimpanan, pihak ketiga, hak pengguna, kontak |
| Kebijakan Konten | Konten dilarang, jalur laporan, tindak lanjut |
| Halaman Kontak | Surel yang dipantau |
| Catatan akurasi | Penjelasan bahwa warna dan bahan adalah simulasi (juga di produk, lihat E5) |

## 7. Aturan klaim pemasaran

Aturan ini berlaku untuk semua teks publik, termasuk dokumen 08.

| Boleh | Tidak boleh |
|---|---|
| Menyebut fitur yang benar-benar sudah rilis | Menyebut fitur yang belum ada |
| Menyebut "gratis", "tanpa akun", "tanpa watermark" setelah D-01, D-02 terkunci dan terimplementasi | Menyebutnya sebelum terkunci |
| Menyebut "gambar diproses di perangkatmu" setelah diverifikasi | Menyebutnya tanpa verifikasi |
| Menyebut angka pemakaian yang bersumber dari analitik sendiri, dengan periode yang jelas | Menyebut jumlah pengguna, ekspor, atau rating tanpa sumber |
| Menampilkan kutipan pengguna nyata yang memberi izin tertulis | Testimoni rekaan, avatar rekaan, atau nama dan jabatan rekaan |
| Menampilkan logo pelanggan yang memberi izin | Bar logo perusahaan terkenal yang tidak memberi izin atau bukan pelanggan |
| Membandingkan dengan kompetitor memakai fakta yang bisa dicek dan bertanggal | Menyebut kompetitor "buruk", atau klaim perbandingan tanpa bukti |
| Menjelaskan batas akurasi | Menjanjikan hasil identik dengan kaos jadi |
| Klaim performa dengan hasil uji yang bisa diulang | Klaim seperti "paling cepat" atau "paling realistis" tanpa uji |
| Klaim keamanan dan kepatuhan yang punya bukti | Klaim sertifikasi atau kepatuhan tanpa bukti |

## 8. Aksesibilitas sebagai kewajiban kualitas

Pemenuhan WCAG 2.2 AA (dokumen 04, bagian 5) diperlakukan sebagai syarat rilis, bukan peningkatan opsional. Hasil uji keyboard dan kontras dicatat sebelum rilis.

## 9. Daftar periksa sebelum rilis publik

- [ ] Semua aset 3D, tekstur, HDR, font, dan ikon punya catatan sumber dan lisensi
- [ ] Tidak ada aset atau teks yang berasal dari kompetitor
- [ ] Syarat Layanan, Kebijakan Privasi, Kebijakan Konten, dan Kontak tayang
- [ ] Pemeriksaan jaringan membuktikan tidak ada gambar atau teks pengguna yang terkirim
- [ ] Nama dan domain diperiksa (D-08)
- [ ] Semua klaim di halaman publik punya dasar (bagian 7)
- [ ] Tidak ada angka pengguna, testimoni, atau logo yang tidak bisa dibuktikan
- [ ] Catatan akurasi tampil di produk
- [ ] Hasil uji keyboard dan kontras tercatat
- [ ] Tinjauan hukum atas dokumen publik selesai
