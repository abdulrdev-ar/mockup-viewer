# 03. Katalog Fitur

| | |
|---|---|
| Versi | 0.1 (draf) |
| Tanggal | 13 November 2026 |
| Cakupan | Semua fitur Mockup Viewer, dari Fase 1 sampai ide Fase 3, dengan teks produk, perilaku, dan acuan dari riset |

## Cara membaca

Setiap fitur punya:
- **Teks produk**: kalimat yang dibaca pengguna (judul pendek dan satu dua kalimat penjelas). Teks final ada di dokumen 08.
- **Perilaku**: apa yang sebenarnya terjadi.
- **Fase**: Fase 1 (MVP), Fase 2, Fase 3.
- **Acuan**: apa yang terlihat pada VirtualThreads (VT) dan Pacdora (PD) di dokumen 01. "Baru" berarti belum terlihat pada keduanya.

Semua fitur berlaku untuk model kaos polos. Fitur yang butuh aset 3D tambahan ditandai [ASET].

## Ringkasan per modul

| Modul | Fitur | Fase 1 | Fase 2 | Fase 3 |
|---|---|---|---|---|
| A. Pratinjau 3D | 9 | 6 | 2 | 1 |
| B. Warna | 5 | 3 | 2 | 0 |
| C. Gambar dan grafis | 8 | 4 | 4 | 0 |
| D. Teks | 5 | 3 | 2 | 0 |
| E. Bahan dan tekstur | 5 | 3 | 2 | 0 |
| F. Detail model kaos | 8 | 3 | 3 | 2 |
| G. Proyek dan berbagi | 6 | 2 | 3 | 1 |
| H. Ekspor | 5 | 1 | 3 | 1 |
| I. Pengalaman dan kualitas | 8 | 7 | 1 | 0 |
| **Total** | **59** | **32** | **22** | **5** |

---

## A. Pratinjau 3D

### A1. Pratinjau 3D langsung [Fase 1]
- **Teks produk:** "Lihat kaosmu langsung. Setiap perubahan tampil saat itu juga."
- **Perilaku:** Model 3D dirender real-time. Perubahan warna, gambar, teks, dan bahan tampil tanpa tombol terapkan atau menunggu render.
- **Acuan:** VT dan PD punya.

### A2. Putar, perbesar, geser [Fase 1]
- **Teks produk:** "Putar kaos ke segala arah. Perbesar untuk memeriksa jahitan."
- **Perilaku:** Orbit, zoom, dan pan dengan mouse, trackpad, dan sentuhan (satu jari putar, dua jari zoom dan geser). Batas zoom dan putaran menjaga model tetap di layar. Tombol kembali ke tampilan awal.
- **Acuan:** VT dan PD punya.

### A3. Sudut kamera siap pakai [Fase 1]
- **Teks produk:** "Pindah ke depan, belakang, samping, atau close-up detail dengan satu klik."
- **Perilaku:** Preset: depan, belakang, samping kiri, samping kanan, tiga perempat, close-up kerah, close-up lengan. Perpindahan halus.
- **Acuan:** Baru (VT hanya rotasi otomatis, PD tidak terlihat).

### A4. Layar penuh [Fase 1]
- **Teks produk:** "Perluas pratinjau ke seluruh layar."
- **Perilaku:** Mode layar penuh dengan tombol keluar dan tombol Esc. Kontrol utama tetap bisa dibuka.
- **Acuan:** VT punya.

### A5. Pencahayaan studio [Fase 1]
- **Teks produk:** "Pilih cahaya: netral, hangat, atau kontras tinggi. Atur kekuatannya."
- **Perilaku:** 3 preset pencahayaan dengan peta lingkungan berlisensi jelas, slider intensitas, dan bayangan lembut di bawah kaos.
- **Acuan:** Keduanya memakai peta lingkungan (HDR). Kontrol bagi pengguna belum terlihat.

### A6. Latar belakang [Fase 1]
- **Teks produk:** "Latar warna, gradasi, gambar sendiri, atau transparan."
- **Perilaku:** Warna solid (pemilih dan heksadesimal), gradasi dua warna, gambar unggahan (diskalakan menutupi), dan transparan (hanya berpengaruh saat ekspor PNG). Tombol atur ulang.
- **Acuan:** VT punya warna dan gambar. PD punya tab Latar.

### A7. Bandingkan dua varian [Fase 2]
- **Teks produk:** "Letakkan dua warna berdampingan dan lihat mana yang lebih cocok."
- **Perilaku:** Tampilan terbagi dua dengan kamera tersinkron. Setiap sisi punya varian sendiri dari proyek yang sama.
- **Acuan:** Baru.

### A8. Putar otomatis [Fase 2]
- **Teks produk:** "Biarkan kaos berputar sendiri. Cocok untuk dipamerkan ke klien."
- **Perilaku:** Putaran 360 derajat dengan kecepatan yang bisa diatur dan tombol jeda. Dipakai juga oleh ekspor video (H3).
- **Acuan:** VT punya (Rotate).

### A9. Gerak kain [Fase 3]
- **Teks produk:** "Lihat bagaimana kaosmu bergerak: berayun, tertiup angin, melipat."
- **Perilaku:** Animasi kain yang sudah dihitung sebelumnya (bukan simulasi fisik penuh) untuk performa di perangkat kelas menengah.
- **Acuan:** VT punya (Walk, Waves, Knit, label Pro). Perlu uji performa. [ASET]

---

## B. Warna

### B1. Warna kaos [Fase 1]
- **Teks produk:** "Pilih warna kaos dari palet, atau masukkan kode warna sendiri."
- **Perilaku:** Palet siap pakai, pemilih bebas, kolom heksadesimal, pipet layar (bila peramban mendukung), dan riwayat warna terakhir. Perubahan memengaruhi seluruh badan kaos.
- **Acuan:** VT (heksadesimal) dan PD (palet dan warna kustom).

### B2. Warna tiap bagian [Fase 1]
- **Teks produk:** "Warnai badan, lengan, dan kerah secara terpisah untuk gaya dua warna."
- **Perilaku:** Bagian Fase 1: badan, lengan kiri dan kanan (bisa dikunci sama atau dipisah), rib kerah. Bagian Fase 2: manset, rib bawah, label dalam, bagian dalam leher. Tombol "samakan semua". [ASET: peta UV per bagian]
- **Acuan:** PD punya 4 bagian. VT tidak terlihat.

### B3. Palet siap pakai [Fase 1]
- **Teks produk:** "Mulai dari palet warna kaos yang sering dipakai."
- **Perilaku:** Palet terkurasi (misalnya hitam, putih, abu, navy, merah bata, hijau botol, krem). Nama warna ditulis dalam bahasa Indonesia. Tidak memakai nama atau kode merek dagang warna pihak lain.
- **Acuan:** PD punya palet kecil.

### B4. Warna jahitan [Fase 2]
- **Teks produk:** "Ganti warna benang jahitan supaya serasi, atau sengaja kontras."
- **Perilaku:** Warna benang untuk jahitan bahu, lengan, kerah, dan bawah. Pilihan jahitan tersamar atau terlihat.
- **Acuan:** PD punya "Garis jahit" sebagai bagian.

### B5. Warna favorit [Fase 2]
- **Teks produk:** "Simpan warna yang sering kamu pakai."
- **Perilaku:** Daftar swatch pribadi di perangkat. Maksimum jumlah swatch [KEPUTUSAN].
- **Acuan:** Baru.

---

## C. Gambar dan grafis

### C1. Unggah gambar [Fase 1]
- **Teks produk:** "Seret gambarmu ke sini, atau pilih dari perangkat."
- **Perilaku:** Seret dan lepas, pilih berkas, tempel dari clipboard. Format PNG (transparan didukung), JPG, WebP, SVG. Batas ukuran berkas [KEPUTUSAN]. Gambar diproses di browser (D-04).
- **Acuan:** VT dan PD punya.

### C2. Tempatkan di area cetak [Fase 1]
- **Teks produk:** "Pilih letaknya: dada, punggung, lengan, atau logo di dada kiri."
- **Perilaku:** Zona cetak: dada tengah, dada kiri (logo), punggung, lengan kiri, lengan kanan. Fase 2 menambah kerah belakang dan label. Zona ditampilkan sebagai panduan tipis yang bisa disembunyikan.
- **Acuan:** PD punya area cetak (310 x 452 px pada satu model). VT tidak terlihat.

### C3. Atur ukuran, putaran, dan posisi [Fase 1]
- **Teks produk:** "Geser, perbesar, dan putar sampai pas. Garis bantu membantumu menengahkan."
- **Perilaku:** Pegangan di sudut untuk skala (rasio terkunci secara bawaan), putar, geser dengan mouse dan sentuhan, panah keyboard untuk geser halus, garis bantu tengah, dan penyesuaian rata kiri, tengah, kanan. Batas agar gambar tidak keluar dari zona.
- **Acuan:** VT dan PD punya sebagian.

### C4. Ukuran cetak nyata dan peringatan resolusi [Fase 1]
- **Teks produk:** "Lihat ukuran cetakmu dalam sentimeter. Kami kabari kalau gambarmu terlalu kecil untuk dicetak tajam."
- **Perilaku:** Tampilkan lebar dan tinggi cetak (cm) pada zona. Hitung kepadatan piksel efektif pada ukuran itu. Beri peringatan bila di bawah ambang yang disarankan [KEPUTUSAN: ambang, rujukan umum 150 sampai 300 dpi tergantung teknik cetak]. Skala kaos dasar (ukuran M) dijelaskan di keterangan.
- **Acuan:** Baru.

### C5. Beberapa lapisan gambar [Fase 2]
- **Teks produk:** "Tumpuk beberapa gambar. Atur urutan, sembunyikan, atau kunci."
- **Perilaku:** Daftar lapisan dengan seret untuk ubah urutan, ikon mata, kunci, hapus, duplikat. Gambar dan teks berbagi daftar yang sama.
- **Acuan:** Baru pada versi gratis.

### C6. Jenis cetak [Fase 2]
- **Teks produk:** "Pilih tampilan cetak: rata, menyatu dengan kain, timbul, atau retak."
- **Perilaku:** Tampilan material cetak: sablon rata (matte), menyatu serat (blend), cetak timbul (puff, dengan tinggi bisa diatur), retak halus (distressed), kilap (glossy). Ini simulasi visual. Keterangan menyebut bahwa hasil cetak asli bergantung pada teknik dan vendor.
- **Acuan:** VT punya Puff Print. Lainnya baru. [ASET: peta tinggi dan normal]

### C7. Pola berulang di seluruh kaos [Fase 2]
- **Teks produk:** "Ulangi satu pola ke seluruh kaos untuk gaya all-over print."
- **Perilaku:** Pola diulang dengan ukuran, jarak, dan putaran yang bisa diatur. Berlaku pada badan dan lengan dengan penyesuaian di jahitan.
- **Acuan:** Baru. [ASET: peta UV tanpa putus di jahitan]

### C8. Garis bantu dan penyelarasan antar elemen [Fase 2]
- **Teks produk:** "Tengahkan dan sejajarkan elemen dengan garis bantu otomatis."
- **Perilaku:** Snap ke tengah, tepi zona, dan elemen lain. Penggaris cm di tepi zona.
- **Acuan:** Baru.

---

## D. Teks

### D1. Tambah tulisan [Fase 1]
- **Teks produk:** "Ketik tulisanmu, lalu tempatkan di kaos."
- **Perilaku:** Kotak teks dengan isi, ukuran, dan warna. Penempatan dan penskalaan sama seperti gambar (C3). Teks tetap tajam di semua zoom (dirender sebagai grafis, bukan gambar beresolusi rendah).
- **Acuan:** Tidak terlihat pada VT dan PD.

### D2. Pilihan font [Fase 1]
- **Teks produk:** "Pilih huruf yang cocok dengan gaya kaosmu."
- **Perilaku:** Koleksi font terkurasi berlisensi terbuka (misalnya OFL), dikelompokkan: sans, serif, tulisan tangan, display, tebal. Pratinjau nama font dengan font itu sendiri. Lisensi dicek sebelum font dimasukkan. [KEPUTUSAN: daftar font]
- **Acuan:** Baru.

### D3. Susunan teks [Fase 1]
- **Teks produk:** "Atur rata teks, jarak huruf, jarak baris, dan lengkungan."
- **Perilaku:** Rata kiri, tengah, kanan. Jarak antar huruf dan antar baris. Huruf kapital semua. Teks melengkung (busur naik atau turun, derajat bisa diatur) untuk tulisan di atas logo atau di bawahnya.
- **Acuan:** Baru.

### D4. Garis tepi dan bayangan teks [Fase 2]
- **Teks produk:** "Beri garis tepi atau bayangan supaya teks lebih menonjol."
- **Perilaku:** Garis tepi (warna dan ketebalan) dan bayangan (jarak, kabur, warna). Tampil pada cetak sesuai jenis cetak (C6).
- **Acuan:** Baru.

### D5. Nama dan nomor punggung [Fase 2]
- **Teks produk:** "Tulis nama dan nomor di punggung untuk kaos tim, angkatan, atau acara."
- **Perilaku:** Templat nama melengkung di atas dan nomor besar di bawah, dengan font bergaya tim. Beberapa baris nama untuk memperlihatkan satu set kaos (lihat G3 untuk varian).
- **Acuan:** Baru.

---

## E. Bahan dan tekstur

### E1. Pilihan bahan [Fase 1]
- **Teks produk:** "Pilih bahan kaos dan lihat bedanya pada serat dan kilap."
- **Perilaku:** Fase 1 menyediakan 4 bahan dengan tampilan khas: katun combed (halus), katun carded (lebih berserat), polyester dry-fit (kilap dan tipis), pique (tekstur kotak kecil). Fase 2 menambah fleece atau terry, linen, rib. Setiap bahan mengatur tekstur serat, kekasaran, dan kilap. Nama bahan memakai istilah umum yang dipakai vendor.
- **Acuan:** PD menawarkan Cotton base, Vertical cotton, Knitted cotton, Flannelette. VT tidak terlihat. [ASET: tekstur dan normal map orisinal]

### E2. Ketebalan dan gramasi visual [Fase 1]
- **Teks produk:** "Atur kesan tebal atau tipis kain."
- **Perilaku:** Tiga tingkat (tipis, sedang, tebal) mengubah kekuatan relief serat, kerapatan lipatan, dan seberapa terlihat bayangan dalam. Ini estimasi visual, bukan ukuran gramasi nyata. Keterangan menyebut hal itu.
- **Acuan:** Baru.

### E3. Efek cuci dan kerutan [Fase 2]
- **Teks produk:** "Tambahkan kesan cuci, vintage, atau kerutan alami."
- **Perilaku:** Slider acid wash, vintage wash, dan garment dye (warna tidak rata di serat). Slider kerutan mengatur seberapa banyak lipatan halus. Setiap slider mulai dari nol.
- **Acuan:** VT punya Acid Wash. Lainnya baru. [ASET]

### E4. Kilap dan kekasaran [Fase 2]
- **Teks produk:** "Atur kilap kain dari matte sampai mengilap."
- **Perilaku:** Satu slider yang memengaruhi kilap permukaan dan kilap tepi serat (sheen). Batas aman agar tetap masuk akal untuk kain.
- **Acuan:** Material fisik di keduanya (INFERENSI).

### E5. Catatan akurasi bahan [Fase 1]
- **Teks produk:** "Tampilan bahan ini simulasi. Untuk keputusan produksi, minta sampel dari vendor."
- **Perilaku:** Keterangan singkat di panel bahan dan di dialog ekspor, dengan tautan ke penjelasan di FAQ.
- **Acuan:** Baru. Prinsip "jujur" (dokumen 02).

---

## F. Detail model kaos

Semua fitur modul ini bergantung pada model 3D modular atau bentuk yang bisa diubah (morph). Biaya pembuatan aset adalah risiko terbesar modul ini (dokumen 06).

### F1. Bentuk kerah [Fase 1] [ASET]
- **Teks produk:** "Pilih bentuk kerah: bulat, V, atau scoop."
- **Perilaku:** Fase 1: kerah bulat (crew), V, scoop. Fase 2: henley (dengan plaket kancing), boat neck. Fase 3: mock neck, polo. Pengaturan lebar rib (tipis, standar, tebal) dan kedalaman leher.
- **Acuan:** VT dan PD menjual sebagai model terpisah. Satu editor yang bisa mengganti: baru.

### F2. Bentuk lengan [Fase 1] [ASET]
- **Teks produk:** "Pilih lengan pendek, tiga perempat, atau panjang. Atur panjangnya sendiri."
- **Perilaku:** Fase 1: pendek, tiga perempat, panjang, dengan slider panjang. Fase 2: tanpa lengan (singlet), raglan, bahu turun (dropped shoulder), cap sleeve. Manset rib dapat dinyalakan pada lengan panjang.
- **Acuan:** Model terpisah pada VT dan PD. Baru sebagai satu editor.

### F3. Potongan dan panjang badan [Fase 1] [ASET]
- **Teks produk:** "Pilih potongan: ramping, reguler, boxy, atau oversized. Atur panjang kaos."
- **Perilaku:** Preset slim, regular, boxy, oversized, cropped, dengan slider panjang badan dan lebar bahu. Perubahan menggeser zona cetak dan menyesuaikan ukuran cetak nyata (C4).
- **Acuan:** VT punya Oversized, Women's, Cropped sebagai produk. Baru sebagai satu editor.

### F4. Bagian bawah (hem) [Fase 2] [ASET]
- **Teks produk:** "Pilih bentuk ujung bawah: lurus, melengkung, atau dengan belahan samping."
- **Perilaku:** Lurus, melengkung (shirttail), belahan samping, rib bawah. Terkait dengan panjang badan.
- **Acuan:** Baru.

### F5. Jenis jahitan [Fase 2] [ASET]
- **Teks produk:** "Atur gaya jahitan: satu jarum atau dua jarum, terlihat atau tersamar."
- **Perilaku:** Gaya jahitan di bahu, lengan, kerah, dan bawah. Taping leher (pita di bagian dalam) dapat dinyalakan. Terhubung dengan warna jahitan (B4).
- **Acuan:** PD menyebut "Garis jahit" sebagai bagian yang bisa dikustom.

### F6. Saku dada [Fase 2] [ASET]
- **Teks produk:** "Tambahkan saku di dada. Pilih bentuk dan ukurannya."
- **Perilaku:** Saku persegi dan melengkung, posisi kiri atau kanan, ukuran, warna sendiri. Menggeser zona cetak dada kiri.
- **Acuan:** PD punya "kaos kantong" sebagai model terpisah.

### F7. Label dan aksesori [Fase 3] [ASET]
- **Teks produk:** "Tambahkan label leher dan label dalam dengan logo brandmu."
- **Perilaku:** Label tenun di dalam leher, cetak label dalam (tanpa label tenun), dan gantungan label (hang tag) sebagai objek pendamping.
- **Acuan:** Baru.

### F8. Ukuran referensi [Fase 3] [ASET]
- **Teks produk:** "Lihat kaosmu dalam ukuran S sampai XXL."
- **Perilaku:** Skala model per ukuran dengan tabel ukuran dasar. Zona cetak dan ukuran cetak nyata ikut menyesuaikan. Sumber tabel ukuran [NEED: tabel dari vendor atau standar yang jelas].
- **Acuan:** Baru.

---

## G. Proyek dan berbagi

### G1. Simpan otomatis di perangkat [Fase 1]
- **Teks produk:** "Pekerjaanmu tersimpan otomatis di browser ini. Tanpa akun."
- **Perilaku:** Setiap perubahan disimpan ke penyimpanan browser (IndexedDB). Saat dibuka lagi, proyek terakhir dipulihkan. Indikator "tersimpan". Bila penyimpanan penuh atau diblokir, tampil peringatan dan tawaran ekspor berkas proyek.
- **Acuan:** PD menyimpan proyek lewat server (`projects` POST dan PUT).

### G2. Undo dan redo [Fase 1]
- **Teks produk:** "Salah klik? Batalkan dengan Ctrl+Z."
- **Perilaku:** Riwayat perubahan dengan batas dalam (misalnya 100 langkah) [KEPUTUSAN], pintasan keyboard, dan tombol di layar.
- **Acuan:** PD punya.

### G3. Beberapa varian dalam satu proyek [Fase 2]
- **Teks produk:** "Buat varian warna lain dari desain yang sama, tanpa mengulang dari awal."
- **Perilaku:** Duplikat varian, beri nama, beralih cepat, hapus. Dipakai oleh lembar varian (H4) dan perbandingan (A7).
- **Acuan:** Baru.

### G4. Tautan pratinjau untuk dibagikan [Fase 2]
- **Teks produk:** "Kirim tautan supaya orang lain bisa memutar kaosmu."
- **Perilaku:** Tautan hanya-lihat dengan masa berlaku [KEPUTUSAN: lama]. Penerima memutar dan memperbesar tanpa bisa mengubah. Perlu penyimpanan di server (D-04 diubah untuk fitur ini saja, dan pengguna diberi tahu sebelum membuat tautan). Moderasi dan tombol laporan wajib (dokumen 07).
- **Acuan:** PD punya Bagikan. VT tidak terlihat.

### G5. Berkas proyek [Fase 2]
- **Teks produk:** "Simpan proyek sebagai berkas dan buka lagi kapan saja, di perangkat mana pun."
- **Perilaku:** Ekspor ke satu berkas (data proyek dan gambar di dalamnya) dan impor kembali. Versi berkas dicatat untuk kompatibilitas.
- **Acuan:** Baru.

### G6. Sematkan di situs lain [Fase 3]
- **Teks produk:** "Pasang pratinjau kaos di situs tokomu."
- **Perilaku:** Penampil hanya-lihat dalam iframe dengan parameter warna dan desain. Untuk toko sablon, konveksi, dan penjual. Syarat penggunaan dan atribusi [KEPUTUSAN].
- **Acuan:** Baru.

---

## H. Ekspor

### H1. Unduh gambar [Fase 1]
- **Teks produk:** "Unduh kaosmu sebagai gambar PNG atau JPG, tanpa watermark."
- **Perilaku:** PNG (dengan latar transparan bila dipilih) dan JPG. Pilihan resolusi, batas atas mengikuti kemampuan perangkat (ukuran render maksimum GPU). Pengguna melihat resolusi yang tersedia sebelum mengunduh. Tanpa watermark (D-02).
- **Acuan:** VT dan PD punya, dengan watermark pada versi gratis.

### H2. Paket beberapa sudut [Fase 2]
- **Teks produk:** "Unduh depan, belakang, dan samping sekaligus dalam satu berkas ZIP."
- **Perilaku:** Pilih sudut dari preset (A3), hasil dalam ZIP dengan nama berkas yang jelas.
- **Acuan:** Baru.

### H3. Video putar 360 derajat [Fase 2]
- **Teks produk:** "Rekam kaosmu berputar dan unduh sebagai video."
- **Perilaku:** Rekam di browser (WebM, dan MP4 bila peramban mendukung). Durasi dan kecepatan diatur. Tampil kemajuan dan tombol batalkan. Resolusi mengikuti kemampuan perangkat.
- **Acuan:** VT dan PD punya (berbayar untuk resolusi tinggi).

### H4. Lembar varian warna [Fase 2]
- **Teks produk:** "Satu gambar berisi semua varian warnamu, rapi untuk katalog."
- **Perilaku:** Grid varian dengan nama warna dan kode heksadesimal sebagai keterangan. Pilihan jumlah kolom dan latar.
- **Acuan:** Baru.

### H5. Lembar spesifikasi untuk vendor [Fase 3]
- **Teks produk:** "Buat lembar spesifikasi berisi model, bahan, warna, posisi, dan ukuran cetak."
- **Perilaku:** PDF satu atau dua halaman: tampilan depan dan belakang, nama bahan, kode warna per bagian, posisi dan ukuran cetak (cm), jenis cetak, catatan. Bisa dikirim ke vendor sablon.
- **Acuan:** Baru. Jawaban untuk celah G5 di dokumen 01.

---

## I. Pengalaman dan kualitas

### I1. Langsung dipakai tanpa akun [Fase 1]
- **Teks produk:** "Buka, lalu mulai. Tidak perlu daftar."
- **Perilaku:** Tidak ada layar login. Tidak ada pembatasan fitur berdasarkan akun.
- **Acuan:** VT: tanpa akun untuk gratis. PD: tombol Masuk, proyek tamu.

### I2. Bahasa Indonesia dan English [Fase 1: ID, Fase 2: EN]
- **Teks produk:** "Pilih bahasa di pojok atas."
- **Perilaku:** Seluruh teks antarmuka tersedia dalam dua bahasa. Bahasa terakhir diingat.
- **Acuan:** PD punya banyak bahasa. VT hanya English.

### I3. Berjalan di ponsel [Fase 1]
- **Teks produk:** "Edit dari ponsel, dengan layar sentuh."
- **Perilaku:** Tata letak ringkas (panel bawah yang bisa ditarik), gestur sentuhan, area sentuh minimal 44 piksel. Kualitas render turun otomatis di perangkat lemah (I5).
- **Acuan:** Tidak terukur pada riset.

### I4. Aksesibilitas [Fase 1]
- **Teks produk:** "Bisa dipakai dengan keyboard dan pembaca layar untuk semua kontrol."
- **Perilaku:** Semua kontrol dapat dijangkau dengan Tab, Enter, Spasi, dan Esc. Fokus terlihat jelas. Kontras teks memenuhi WCAG AA. Label untuk setiap kontrol. Catatan: kanvas 3D itu sendiri tidak dapat dibaca pembaca layar, sehingga ada deskripsi teks keadaan kaos (warna, bahan, bentuk).
- **Acuan:** Baru.

### I5. Kualitas menyesuaikan perangkat [Fase 1]
- **Teks produk:** "Kualitas gambar turun otomatis di perangkat yang berat, dan bisa kamu atur sendiri."
- **Perilaku:** Deteksi performa awal. Pengaturan kualitas (rendah, sedang, tinggi) dengan resolusi render, bayangan, dan antialiasing. Pemuatan bertahap model dan tekstur dengan indikator kemajuan.
- **Acuan:** Baru.

### I6. Keadaan kosong, memuat, dan gagal [Fase 1]
- **Teks produk:** Lihat dokumen 08, bagian teks keadaan.
- **Perilaku:** Setiap panel dan aksi punya tiga keadaan: kosong (belum ada gambar atau teks), memuat (model, ekspor), dan gagal (WebGL tidak tersedia, berkas tidak didukung, penyimpanan penuh, ekspor gagal). Setiap pesan gagal menyebut penyebab dan langkah berikutnya.
- **Acuan:** Baru.

### I7. Privasi bawaan [Fase 1]
- **Teks produk:** "Gambarmu diproses di perangkatmu dan tidak dikirim ke server kami."
- **Perilaku:** Tidak ada unggahan gambar pengguna ke server pada Fase 1 (D-04). Analitik hanya mengirim peristiwa penggunaan tanpa isi gambar, tanpa rekaman sesi (D-07). Pernyataan ini hanya boleh dipasang setelah diverifikasi lewat pemeriksaan lalu lintas jaringan.
- **Acuan:** VT menyebut desain unggahan tidak direkam. PD banyak pihak ketiga.

### I8. Pintasan keyboard [Fase 2]
- **Teks produk:** "Tekan ? untuk melihat semua pintasan."
- **Perilaku:** Pintasan umum (undo, redo, hapus, duplikat, geser halus, reset kamera). Panel bantuan dengan daftar.
- **Acuan:** Baru.

---

## Fitur yang sengaja ditunda atau tidak dikerjakan

| Ide | Keputusan | Alasan |
|---|---|---|
| Model garmen lain (polo, hoodie, kaos anak, tote bag) | Setelah kaos polos matang. Urutan ditentukan oleh data permintaan. | Fokus pada kedalaman. |
| Desain gambar dengan AI | Tidak dikerjakan | Biaya, risiko hak cipta, di luar tujuan |
| Simulasi kain fisik penuh | Ditinjau di Fase 3 | Biaya komputasi |
| Akun dan sinkronisasi antar perangkat | Ditinjau setelah ada bukti kebutuhan | Menambah gesekan dan biaya |
| Pemesanan cetak langsung | Tidak dikerjakan | Mockup Viewer adalah alat pratinjau |
| Komentar kolaboratif waktu nyata | Ditinjau setelah G4 terbukti dipakai | Biaya dan moderasi |
