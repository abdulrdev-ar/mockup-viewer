# 09. Daftar Aset dan Model yang Dibutuhkan

| | |
|---|---|
| Versi | 0.1 |
| Tanggal | 14 November 2026 |
| Aturan | Setiap aset di rilis harus tercatat di sini dengan sumber dan lisensinya (dokumen 07, bagian 2). Aset tanpa catatan tidak boleh masuk rilis. |

## 1. Aset yang dipakai

| Berkas di repo | Isi | Sumber | Pembuat | Lisensi | Diunduh | Bukti lisensi |
|---|---|---|---|---|---|---|
| `public/models/tshirt-short.glb` | Kaos lengan pendek, kerah bulat, potongan reguler | [Short Sleeve T- Shirt](https://sketchfab.com/3d-models/short-sleeve-t-shirt-0b1df31312444436b390a687875bdbfe) | chokybali | CC BY 4.0 | 13 November 2026 | Metadata `asset.extras` di GLB mentah dan halaman model |
| `public/models/tshirt-long.glb` | Kaos lengan panjang, kerah bulat, potongan reguler | [Long Sleeve T- Shirt](https://sketchfab.com/3d-models/long-sleeve-t-shirt-ef22cf345c174b569fdfa6a653a6bf6f) | chokybali | CC BY 4.0 | 13 November 2026 | Metadata `asset.extras` di GLB mentah dan halaman model |
| (dibuat oleh kode) normal map serat kain | Pola rajut combed, carded, dry-fit, pique | `lib/fabric.ts` | Mockup Viewer | Milik proyek | | |
| (dibuat oleh kode) cahaya studio | `RoomEnvironment` dari three.js | Paket `three` | three.js | MIT | | Lisensi paket `three` |

**Syarat CC BY 4.0 yang dipenuhi.** Nama pembuat, judul, tautan sumber, dan tautan lisensi tampil di panel Detail editor. Pernyataan "disederhanakan untuk web" menandai bahwa model diubah (benang jahit dan lapisan dalam dibuang, jumlah segitiga dikurangi).

**Model mentah tidak masuk repo.** Berkas asli (33 MB dan 37 MB) disimpan di `assets/models/` dan masuk `.gitignore`. Siapa pun bisa mengunduh ulang dari tautan sumber di atas.

**Tidak dipakai:** `tshirt_basic_marvelous.glb` (NairoDraw, CC BY 4.0) ada di `assets/models/` sebagai cadangan. Bentuk badan dan kerahnya berbeda dari pasangan chokybali, jadi tidak dicampur.

## 2. Cara mengolah model baru

1. Unduh model glTF atau GLB dari sumber berlisensi jelas, simpan di `assets/models/`.
2. Jalankan `pnpm prepare-model assets/models/<mentah>.glb public/models/<nama>.glb`.
   Skrip ini membuang benang jahit, menyimpan hanya permukaan luar kain, mengelompokkan panel menjadi `body`, `sleeveL`, `sleeveR`, `collar`, memindahkan model ke satuan meter (hem di y = 0, depan menghadap +z), lalu mengurangi jumlah segitiga.
3. Salin baris `dims` yang dicetak skrip ke `MODELS` di `lib/garment.ts`.
4. Jalankan `pnpm check`. Pemeriksaan gagal bila keempat bagian tidak ada atau tinggi model tidak cocok dengan `dims`.
5. Buka editor, periksa warna per bagian, cetakan depan, belakang, dan lengan, lalu tampilan dalam leher.
6. Tambahkan baris di tabel bagian 1 dan kredit di panel Detail.

Syarat model agar skrip bekerja: diekspor dari CLO3D atau Marvelous Designer, panel pola tidak digabung, kerah rib berupa panel sendiri, lengan berada di luar lebar badan. Model hasil sculpt tanpa panel pola belum didukung.

## 3. Model yang belum ada dan dibutuhkan

Kontrol yang modelnya belum ada disembunyikan dari editor, supaya tidak ada tombol yang tidak berfungsi. Kolom "Fitur" merujuk dokumen 03.

Supaya pergantian bentuk tidak terasa janggal, semua varian sebaiknya dibuat di atas avatar, pola dasar, dan skala yang sama dengan pasangan chokybali, atau seluruh set dibuat ulang sekaligus dari satu sumber.

### Fase 1 (dibutuhkan untuk menyelesaikan MVP)

| Prioritas | Model | Fitur | Catatan |
|---|---|---|---|
| 1 | Lengan tiga perempat | F2 | Sekarang memakai model lengan pendek |
| 2 | Kerah V | F1 | Dengan lengan pendek dan panjang |
| 3 | Kerah scoop | F1 | Dengan lengan pendek dan panjang |
| 4 | Potongan oversized (bahu turun) | F3 | Paling sering diminta di pasar kaos lokal [ASUMSI, validasi lewat wawancara] |
| 5 | Potongan boxy | F3 | |
| 6 | Potongan ramping | F3 | Model NairoDraw bisa dipertimbangkan bila bentuk kerahnya diterima |
| 7 | Potongan cropped | F3 | |
| 8 | Rib kerah tipis dan tebal | F1 | Bisa berupa varian panel kerah saja, tanpa membuat ulang badan |
| 9 | Panjang lengan, panjang badan, lebar bahu (slider) | F2, F3 | Paling murah lewat morph target pada satu model dasar, bukan model terpisah. Butuh model dengan topologi sama di setiap ujung slider. |

Jumlah kombinasi: 3 kerah x 3 lengan x 5 potongan = 45 model bila dibuat terpisah. Usul: buat per potongan satu model dasar, lalu kerah dan lengan sebagai panel yang bisa ditukar (mesh terpisah per bagian), sehingga jumlahnya menjadi 5 badan + 3 kerah + 3 lengan per potongan. [KEPUTUSAN: model terpisah, panel tukar, atau morph target, dibahas bersama seniman 3D]

### Fase 2

| Model | Fitur |
|---|---|
| Kerah henley (dengan plaket kancing) dan boat neck | F1 |
| Singlet, raglan, bahu turun, cap sleeve | F2 |
| Manset rib untuk lengan panjang (model lengan panjang sekarang sudah punya manset) | F2 |
| Hem lurus, melengkung, belahan samping, rib bawah | F4 |
| Saku dada persegi dan melengkung | F6 |
| Normal map jahitan satu jarum dan dua jarum | F5 |

### Fase 3

| Model | Fitur |
|---|---|
| Kerah mock neck dan polo | F1 |
| Label tenun leher, label cetak, hang tag | F7 |
| Ukuran S sampai XXL dengan tabel ukuran vendor | F8 |

### Aset lain yang dibutuhkan

| Aset | Untuk | Sumber yang disarankan |
|---|---|---|
| Peta lingkungan HDR studio | Cahaya lebih nyata (A5) | Poly Haven, CC0. Belum dipasang. |
| Tabel ukuran garmen | Ukuran cetak nyata dalam cm (C4) | Vendor atau standar ukuran yang jelas. Model sekarang tidak berlabel ukuran, jadi zona cetak diukur dari tampak depan model. |

## 4. Batas yang diketahui

- Hanya permukaan luar kain yang disimpan, jadi tepi hem dan ujung lengan tampak setipis kertas bila diperbesar sangat dekat.
- Cetakan memakai proyeksi datar dari depan, belakang, dan samping lengan. Cetakan yang sangat lebar akan tampak menyempit di sisi badan.
- Setiap model sekitar 0,8 MB. Kompresi meshopt bisa menurunkannya lebih jauh bila waktu muat di ponsel menjadi masalah.
