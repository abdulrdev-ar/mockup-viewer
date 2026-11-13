# 02. Visi, Positioning, dan Persona

| | |
|---|---|
| Versi | 0.1 (draf) |
| Tanggal | 13 November 2026 |
| Status | Persona dan hipotesis belum divalidasi dengan pengguna nyata |

## 1. Visi dan misi

**Visi.** Siapa pun yang punya ide kaos bisa melihat hasilnya dalam 3D, sedetail yang ia bayangkan, tanpa membayar dan tanpa keahlian 3D.

**Misi.**
1. Menyediakan editor mockup kaos 3D gratis yang bisa dipakai langsung di browser.
2. Memberi kendali atas hal yang menentukan wajah kaos: warna, gambar, tulisan, bahan, dan detail kecil seperti kerah, lengan, dan jahitan.
3. Menjaga hasil tetap milik pengguna: tanpa watermark, tanpa akun, gambar tetap di perangkat.
4. Jujur soal batas: pratinjau membantu memutuskan, sampel fisik tetap menjadi pemutus akhir.

## 2. Prinsip produk

| Prinsip | Artinya dalam keputusan sehari-hari |
|---|---|
| Gratis yang sebenarnya | Fitur inti tidak dikunci. Bila ada paket berbayar kelak, ia menambah kenyamanan, tidak mengambil yang sudah gratis. |
| Detail sampai jahitan | Fitur baru dinilai dari seberapa jauh ia mengubah tampilan garmen. |
| Hasil terlihat langsung | Setiap perubahan tampil di model 3D tanpa menunggu render. |
| Milik pengguna | Gambar diproses di perangkat (D-04). Ekspor bersih dari watermark (D-02). |
| Jujur | Tidak ada angka pengguna, testimoni, atau klaim kualitas yang tidak punya sumber. Batas akurasi dijelaskan di dalam produk. |
| Ringan | Halaman dan editor dimuat cepat dan berjalan di perangkat kelas menengah. |

## 3. Masalah yang diselesaikan

### 3.1 Situasi sekarang (cara orang menyiasati)

| Cara | Kekurangan |
|---|---|
| File PSD mockup dan Photoshop | Butuh lisensi dan keahlian. Satu file per model dan warna. Mengganti kerah atau lengan berarti mencari file lain. |
| Mockup 2D di aplikasi desain | Datar. Tidak menunjukkan lipatan, bahan, dan sisi lain kaos. |
| Alat 3D berbayar atau ber-watermark | Hasil gratis ber-watermark. Hak komersial di paket mahal (lihat dokumen 01, bagian 2.4 dan 3.4). |
| Sampel fisik | Memakan waktu dan biaya setiap kali ada revisi kecil. |
| Foto kaos polos yang ditempeli gambar | Tidak konsisten. Sulit mengganti warna atau potongan. |

### 3.2 Pernyataan masalah

Orang yang menyiapkan kaos untuk dijual, disablon, atau dibagikan butuh gambaran yang meyakinkan sebelum uang keluar. Alat yang ada membuat mereka memilih antara hasil datar yang murah dan hasil 3D yang membatasi detail atau menahan hak pakai di balik langganan.

## 4. Persona (hipotesis)

Persona di bawah adalah arketipe kerja, bukan orang nyata dan bukan hasil riset. Validasi lewat wawancara (rencana di dokumen 06) lalu perbarui.

### P1. Pemilik brand kaos kecil

| | |
|---|---|
| Siapa | Menjalankan brand kaos sendiri atau bersama satu dua orang. Menjual lewat marketplace dan media sosial. |
| Tujuan | Menampilkan koleksi baru yang tampak profesional sebelum produksi. Menguji beberapa warna dan tata letak. |
| Frustrasi | Biaya foto produk. Revisi desain yang baru ketahuan salah setelah sampel jadi. |
| Yang dibutuhkan dari produk | Warna per bagian, bahan, ekspor bersih untuk katalog, hak pakai komersial. |
| Hipotesis nilai | Menghemat satu putaran sampel dan menghasilkan gambar katalog sendiri. |

### P2. Desainer grafis dan tukang sablon freelance

| | |
|---|---|
| Siapa | Mengerjakan pesanan desain kaos untuk klien atau komunitas. |
| Tujuan | Memperlihatkan desain di kaos sebelum klien setuju. Menyerahkan spesifikasi ke vendor. |
| Frustrasi | Klien sulit membayangkan dari file datar. Banyak revisi lewat chat. |
| Yang dibutuhkan | Posisi dan ukuran cetak yang jelas, banyak varian warna cepat, berbagi tautan, lembar spesifikasi. |
| Hipotesis nilai | Persetujuan klien lebih cepat dan revisi lebih sedikit. |

### P3. Konveksi dan vendor cetak

| | |
|---|---|
| Siapa | Pemilik atau staf toko sablon dan konveksi yang berhadapan dengan pelanggan. |
| Tujuan | Memperlihatkan hasil ke pelanggan di tempat. Mengurangi salah paham tentang bahan dan posisi cetak. |
| Frustrasi | Pelanggan membawa desain tanpa tahu bagaimana tampil di kaos nyata. |
| Yang dibutuhkan | Pilihan bahan dengan istilah yang dikenal, ukuran cetak nyata dalam cm, embed di situs toko (Fase 3). |
| Hipotesis nilai | Alat bantu penjualan yang tidak perlu dilatih lama. |

### P4. Panitia acara, komunitas, dan angkatan

| | |
|---|---|
| Siapa | Mahasiswa, panitia, anggota komunitas yang memesan kaos kelompok. |
| Tujuan | Memilih desain, warna, dan tulisan bersama anggota. |
| Frustrasi | Voting dari gambar datar. Pilihan warna sulit dibandingkan. |
| Yang dibutuhkan | Berbagi tautan, banyak varian warna sekaligus, teks nama dan nomor, tanpa daftar akun. |
| Hipotesis nilai | Keputusan kelompok lebih cepat. |

### P5. Penjual reseller dan dropship

| | |
|---|---|
| Siapa | Menjual kaos dari pemasok tanpa foto produk sendiri. |
| Tujuan | Gambar produk menarik untuk lapak. |
| Frustrasi | Foto pemasok seragam dengan penjual lain. |
| Yang dibutuhkan | Ekspor resolusi tinggi, latar transparan, banyak warna. |
| Hipotesis nilai | Tampilan lapak yang berbeda tanpa studio foto. |

### Prioritas awal

Fase 1 dirancang untuk P1 dan P2 (kebutuhan fitur paling mirip). P3 dan P4 mendapat dukungan dari Fase 2. P5 ikut terlayani oleh ekspor dan latar transparan.

## 5. Jobs to be done

| Ketika saya... | Saya ingin... | Supaya... |
|---|---|---|
| punya desain baru dan belum yakin cocok di kaos | melihatnya di kaos 3D dalam beberapa warna | saya bisa memilih tanpa membuat sampel |
| harus menunjukkan desain ke klien | memutar kaos dan mengganti warna di depan mereka | klien paham dan setuju lebih cepat |
| menyiapkan pesanan ke vendor sablon | menyerahkan ukuran, posisi, dan warna yang jelas | hasil cetak sesuai dan tidak ada revisi |
| mengisi katalog toko | mengunduh gambar bersih dari beberapa sudut | saya tidak perlu sesi foto |
| menanyakan pendapat anggota kelompok | membagikan tautan pratinjau | semua melihat hal yang sama |

## 6. Proposisi nilai

**Satu kalimat.** Editor mockup kaos 3D gratis di browser, dengan kendali penuh atas warna, gambar, tulisan, bahan, dan detail seperti kerah dan lengan.

**Per persona.**

| Persona | Pesan inti |
|---|---|
| P1 Brand kecil | Lihat koleksimu di kaos 3D sebelum produksi, unduh tanpa watermark, pakai untuk jualan. |
| P2 Desainer dan sablon | Tunjukkan desain di kaos yang bisa diputar, kirim tautannya, serahkan spesifikasi yang jelas. |
| P3 Konveksi | Bantu pelanggan melihat hasil sebelum memesan, di layar toko. |
| P4 Panitia dan komunitas | Pilih warna dan desain bersama, tanpa ada yang perlu daftar akun. |
| P5 Reseller | Buat gambar produk yang beda dari penjual lain. |

## 7. Positioning

**Pernyataan positioning.** Untuk pemilik brand, desainer, dan penyedia sablon yang perlu melihat kaos sebelum diproduksi, Mockup Viewer adalah editor mockup 3D di browser yang bisa diatur sampai kerah, lengan, bahan, dan jahitan, gratis tanpa watermark. Berbeda dengan alat 3D yang menaruh watermark dan lisensi komersial di balik langganan, Mockup Viewer memberi hasil bersih dan hak pakai sejak awal.

**Peta posisi (kualitatif, berdasarkan dokumen 01).**

| Kelompok alat | Kedalaman kustomisasi satu garmen | Biaya untuk hasil bersih dan komersial | Konteks lokal |
|---|---|---|---|
| Mockup PSD dan 2D | Rendah (satu file satu model) | Bergantung lisensi aplikasi dan file | Beragam |
| Alat 3D animasi (contoh VirtualThreads) | Sedang (variasi sebagai produk terpisah, efek cuci dan cetak) | Berbayar | Rendah (English) |
| Platform kemasan dengan alat kaos (contoh Pacdora) | Rendah sampai sedang (4 bagian, material kapas) | Berbayar, komersial di paket tertinggi | Sedang (diterjemahkan) |
| **Mockup Viewer** | **Tinggi (rencana)** | **Gratis** | **Tinggi (rencana)** |

Penilaian "rencana" adalah arah, bukan klaim kondisi saat ini.

## 8. Pembeda dan bukti yang dibutuhkan

| Pembeda | Syarat sebelum dipakai di pemasaran |
|---|---|
| Atur sampai detail kerah dan lengan | Fitur bentuk kerah dan bentuk lengan (katalog fitur, modul F) selesai dan teruji |
| Gratis tanpa watermark | Keputusan D-02 dikunci |
| Boleh dipakai komersial | Keputusan D-03 dikunci dan ada syarat layanan |
| Gambar tetap di perangkat | Arsitektur D-04 terverifikasi (uji lalu lintas jaringan saat unggah) |
| Istilah lokal | Daftar istilah divalidasi dengan vendor sablon |

## 9. Bukan tujuan (Fase 1)

| Tidak dikerjakan | Alasan |
|---|---|
| Produk selain kaos polos | Kedalaman lebih penting daripada keluasan |
| Pembuatan gambar dengan AI | Di luar tujuan, menambah biaya dan risiko hak cipta |
| Akun, login, dan penyimpanan awan | Menambah biaya dan gesekan |
| Pemesanan atau pembayaran cetak | Mockup Viewer adalah alat pratinjau |
| Marketplace desain | Fokus pada editor |
| Simulasi kain fisik penuh | Biaya komputasi tinggi. Ditinjau di Fase 3. |

## 10. Suara merek dan gaya bahasa

Arah visual belum ditentukan (D-09). Bagian ini hanya mengatur bahasa.

| Aspek | Pedoman |
|---|---|
| Sapaan | "Kamu". Hangat dan langsung, bukan formal. |
| Nada | Lugas, ramah, sedikit santai. Boleh bercanda ringan, tidak di pesan error. |
| Kalimat | Pendek, satu gagasan per kalimat. Kata kerja di depan untuk tombol. |
| Istilah | Pakai istilah yang dipakai pengguna: kaos, sablon, bahan, kerah, lengan, jahitan, cetak. Jelaskan istilah teknis sekali di tempat pertama muncul. |
| Janji | Hanya yang bisa dibuktikan. Tidak ada "paling realistis" atau angka pengguna tanpa sumber. |
| Hindari | Kata hampa seperti revolusioner, canggih, mulus, powerful. Pola "bukan X, tapi Y". Daftar "tanpa A, tanpa B, tanpa C". Tanda seru berulang. |

**Contoh nada yang dipakai.**
- Tombol: "Unduh Gambar", "Tambah Tulisan", "Ganti Warna".
- Error: "Gambar ini terlalu besar (lebih dari 20 MB). Perkecil lalu unggah lagi." [KEPUTUSAN: batas ukuran file]
- Info: "Warna di layar bisa berbeda dari hasil cetak. Minta sampel sebelum produksi."

Daftar teks lengkap ada di dokumen 08.
