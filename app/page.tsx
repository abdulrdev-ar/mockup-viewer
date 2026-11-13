import Image from 'next/image'
import Link from 'next/link'
import styles from './page.module.css'

const FEATURES = [
  {
    key: 'Warna',
    title: 'Warna badan, lengan, dan kerah, masing-masing sendiri',
    text: 'Pilih dari palet atau ketik kode warna. Buat kaos dua warna dalam beberapa klik.',
  },
  {
    key: 'Gambar dan tulisan',
    title: 'Gambar di dada, tulisan di punggung',
    text: 'Seret file PNG, JPG, WebP, atau SVG ke kaos. Lihat ukuran cetaknya dalam sentimeter, dan dapatkan peringatan bila gambarnya terlalu kecil untuk dicetak tajam.',
  },
  {
    key: 'Bahan',
    title: 'Katun combed, carded, dry-fit, atau pique',
    text: 'Setiap bahan punya serat dan kilap sendiri. Atur ketebalannya lalu perbesar untuk melihat bedanya.',
    note: 'Tampilan bahan adalah simulasi. Untuk keputusan produksi, minta sampel dari vendor.',
  },
]

const DETAILS = [
  { label: 'Kerah', options: ['Bulat', 'V', 'Scoop', 'Rib tipis sampai tebal'] },
  { label: 'Lengan', options: ['Pendek', 'Tiga perempat', 'Panjang', 'Panjang bisa diatur'] },
  { label: 'Potongan', options: ['Ramping', 'Reguler', 'Boxy', 'Oversized', 'Cropped'] },
]

const STEPS = [
  { title: 'Unggah desainmu', text: 'Seret file ke kaos atau tambahkan tulisan.' },
  { title: 'Atur warna, bahan, dan detail', text: 'Kerah, lengan, dan potongan bisa diganti kapan saja.' },
  { title: 'Putar dan periksa', text: 'Lihat dari depan, belakang, samping, atau perbesar ke jahitan.' },
  { title: 'Unduh gambarnya', text: 'Pilih PNG atau JPG, dengan latar transparan bila perlu.' },
]

const AUDIENCE = [
  { who: 'Pemilik brand', text: 'Lihat koleksi baru di kaos 3D sebelum produksi, lalu pakai gambarnya untuk katalog.' },
  { who: 'Desainer dan tukang sablon', text: 'Tunjukkan desain ke klien di kaos yang bisa diputar, lengkap dengan ukuran cetak dan kode warna.' },
  { who: 'Konveksi dan percetakan', text: 'Bantu pelanggan melihat hasilnya sebelum memesan.' },
  { who: 'Panitia dan komunitas', text: 'Coba beberapa warna dan desain, lalu kirim gambarnya ke anggota untuk dipilih bersama.' },
]

const FAQ = [
  {
    q: 'Apakah benar-benar gratis?',
    a: 'Ya. Semua fitur editor yang ada sekarang gratis, dan hasil unduhan tidak memakai watermark.',
  },
  { q: 'Perlu daftar akun?', a: 'Tidak. Buka editor dan langsung pakai.' },
  {
    q: 'Apakah gambar desainku diunggah ke server?',
    a: 'Tidak. Gambar diproses di browsermu dan tersimpan di perangkatmu. Kamu bisa memeriksanya sendiri lewat tab jaringan di alat pengembang browser.',
  },
  {
    q: 'Format gambar apa yang bisa kuunggah?',
    a: 'PNG (termasuk latar transparan), JPG, WebP, dan SVG, maksimum 20 MB. Gunakan gambar beresolusi tinggi supaya hasil cetak tajam. Editor memberi peringatan bila gambarmu di bawah 150 dpi pada ukuran cetaknya.',
  },
  {
    q: 'Apakah hasilnya sama persis dengan kaos jadi?',
    a: 'Tidak persis. Warna layar berbeda-beda antar perangkat, dan tampilan bahan adalah simulasi. Pratinjau membantumu memilih warna, tata letak, dan bentuk. Untuk produksi, minta sampel dari vendor.',
  },
  {
    q: 'Proyekku tersimpan di mana?',
    a: 'Di browser yang kamu pakai, otomatis setelah setiap perubahan. Menghapus data browser akan menghapus proyek, jadi unduh gambarnya bila ingin menyimpannya di tempat lain.',
  },
  {
    q: 'Bisa dipakai di ponsel?',
    a: 'Bisa. Editor menyesuaikan tampilan untuk layar sentuh. Di perangkat yang berat, kualitas tampilan turun otomatis supaya tetap lancar.',
  },
  {
    q: 'Browser apa yang didukung?',
    a: 'Versi terbaru Chrome, Edge, Firefox, dan Safari yang mendukung WebGL2. Bila 3D tidak tampil, aktifkan akselerasi perangkat keras di pengaturan browser.',
  },
  {
    q: 'Kenapa baru ada kaos polos?',
    a: 'Kami ingin satu produk yang bisa diatur sampai detail. Model lain menyusul berdasarkan apa yang paling sering diminta pengguna.',
  },
]

export default function Home() {
  return (
    <>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>
          Mockup Viewer
        </Link>
        <nav aria-label="Navigasi halaman" className={styles.nav}>
          <a href="#fitur" className="label">
            Yang bisa diatur
          </a>
          <a href="#cara-kerja" className="label">
            Cara kerja
          </a>
          <a href="#faq" className="label">
            FAQ
          </a>
        </nav>
        <Link href="/editor" className={`btn btn-primary ${styles.headerCta}`}>
          Buka Editor Kaos
        </Link>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <h1 className={styles.display}>Mockup kaos 3D gratis. Atur warna, gambar, bahan, sampai kerahnya.</h1>
            <p className={styles.lead}>
              Unggah gambar, tambah tulisan, pilih bahan, lalu ganti bentuk kerah dan lengan. Hasilnya tampil langsung di kaos 3D dan
              bisa kamu unduh tanpa watermark.
            </p>
            <div className={styles.ctaRow}>
              <Link href="/editor" className="btn btn-primary">
                Buka Editor Kaos
              </Link>
              <a href="#fitur" className="btn btn-secondary">
                Lihat yang Bisa Diatur
              </a>
            </div>
            <p className={`label ${styles.small}`}>Tanpa daftar.</p>
          </div>
          <figure className={styles.heroMedia}>
            <Image
              src="/editor-preview.jpg"
              alt="Editor Mockup Viewer: daftar lapisan di kiri, halaman desain sisi depan berisi gambar dan tulisan di tengah, dan pratinjau kaos 3D hijau di kanan."
              width={1440}
              height={900}
              priority
              unoptimized
              className={styles.heroImage}
            />
            <figcaption className={styles.annotations}>
              <span className="label">Area cetak depan: 33 x 52 cm</span>
              <span className="label">Kerah bulat, lengan pendek, katun combed</span>
            </figcaption>
          </figure>
        </section>

        <section id="fitur" className={styles.features} aria-labelledby="fitur-title">
          <h2 id="fitur-title" className={styles.h2}>
            Semua yang menentukan wajah kaosmu
          </h2>
          <dl className={styles.featureList}>
            {FEATURES.map((f) => (
              <div key={f.key} className={styles.featureRow}>
                <dt className="label">{f.key}</dt>
                <dd>
                  <h3 className={styles.h3}>{f.title}</h3>
                  <p>{f.text}</p>
                  {f.note && <p className={styles.muted}>{f.note}</p>}
                </dd>
              </div>
            ))}
          </dl>
          <div className={styles.detailBlock}>
            <div>
              <p className="label">Detail</p>
              <h3 className={styles.h3}>Kerah bulat atau V. Lengan pendek atau panjang. Potongan reguler atau oversized.</h3>
              <p>Ganti semuanya di satu editor, tanpa pindah model.</p>
            </div>
            <ul className={styles.detailGroups}>
              {DETAILS.map((d) => (
                <li key={d.label}>
                  <span className="label">{d.label}</span>
                  <span className={styles.chips}>
                    {d.options.map((o) => (
                      <span key={o} className={styles.chip}>
                        {o}
                      </span>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="cara-kerja" className={styles.steps} aria-labelledby="cara-kerja-title">
          <h2 id="cara-kerja-title" className={styles.h2}>
            Dari file desain sampai gambar siap kirim
          </h2>
          <ol className={styles.stepList}>
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <span className="label">{String(i + 1).padStart(2, '0')}</span>
                <h3 className={styles.h3}>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.audience} aria-labelledby="audience-title">
          <h2 id="audience-title" className={styles.h2}>
            Dipakai untuk apa
          </h2>
          <ul className={styles.audienceList}>
            {AUDIENCE.map((a) => (
              <li key={a.who}>
                <p className="label">{a.who}</p>
                <p>{a.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.notes} aria-label="Privasi dan batas pratinjau">
          <div className={styles.noteCard}>
            <h2 className={styles.h3}>Gambarmu tetap di perangkatmu</h2>
            <p>Mockup Viewer memproses gambar di browsermu. Desainmu tidak dikirim ke server kami.</p>
          </div>
          <div className={styles.noteCard}>
            <h2 className={styles.h3}>Pratinjau ini membantu kamu memilih</h2>
            <p>
              Warna di layar bisa berbeda dari hasil cetak, dan tampilan bahan adalah simulasi. Sampel fisik dari vendor tetap menjadi
              penentu akhir sebelum produksi.
            </p>
          </div>
        </section>

        <section id="faq" className={styles.faq} aria-labelledby="faq-title">
          <h2 id="faq-title" className={styles.h2}>
            Pertanyaan yang sering muncul
          </h2>
          <div className={styles.faqList}>
            {FAQ.map((f) => (
              <details key={f.q} className={styles.faqItem}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className={styles.final}>
          <h2 className={styles.h2}>Siap lihat kaosmu dalam 3D?</h2>
          <Link href="/editor" className="btn btn-primary">
            Buka Editor Kaos
          </Link>
          <p className={`label ${styles.small}`}>Gratis. Tanpa daftar.</p>
        </section>
      </main>

      <footer className={styles.footer}>
        <span>Mockup Viewer</span>
        <span className="label">2026</span>
      </footer>
    </>
  )
}
