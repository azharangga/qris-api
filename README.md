<div align="center">
  <h1>Indonesian QRIS Payment Gateway API</h1>
  <p>Lightweight, open-source, and self-hosted dynamic QRIS payment engine and developer gateway built on top of Next.js 16 and TypeScript.</p>
  
  <p>
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge" alt="Status Active" />
  </p>
</div>

---

## 📖 Deskripsi Singkat Proyek

**QRIS API** adalah layanan gateway pembayaran independen untuk memproses, memvalidasi, mengurai (parsing), dan menghasilkan kode QRIS dinamis secara mandiri. Didesain dengan standar EMVCo tanpa ketergantungan pada API komersial pihak ketiga atau database yang berat secara default (menggunakan *in-memory store*), menjadikannya sangat cepat, ringan, serta menjaga privasi data *merchant* sepenuhnya. 

Layanan ini mendukung skenario penuh *payment lifecycle* termasuk pembentukan pesanan (pending), deteksi kadaluwarsa (expired), pembatalan (cancelled), penyelesaian (paid), serta mendukung idempotensi untuk mencegah duplikasi tagihan. Terdapat juga antarmuka UI *Playground / Converter Studio* untuk memudahkan *developer* melakukan uji coba interaktif langsung dari *browser*, serta tersedia *Command-Line Interface (CLI)* untuk konversi QRIS statis menjadi dinamis.

---

## ⚡ Fitur Utama

- **EMVCo Compliant Engine**: Validasi *Tag-Length-Value* (TLV) yang ketat dan penghitungan *checksum* algoritma CRC16-CCITT sesuai dengan standar Bank Indonesia & EMVCo.
- **Konversi Statis ke Dinamis**: Menyisipkan nominal pembayaran (Amount/Tag 54) dan Biaya Layanan (*Convenience Fee*/Tag 55, 56, 57) ke dalam payload QRIS secara instan tanpa mengacaukan susunan tag lainnya.
- **Payment Lifecycle Store**: Siklus hidup *payment order* tersimpan dalam *in-memory cache* dengan status (`pending`, `paid`, `expired`, `cancelled`) lengkap dengan evaluasi kedaluwarsa otomatis (lazy expiration eval).
- **Idempotensi Otomatis**: Mendukung header `Idempotency-Key` pada endpoint pembayaran untuk mencegah pembuatan tagihan duplikat jika terjadi *retry* pada kondisi kegagalan jaringan.
- **Developer Studio / Playground**: *Web interface* interaktif (berbasis Next.js + Tailwind CSS) untuk menguji *parsing*, *decode*, dan *generate* QR langsung secara visual.
- **Integrasi Command-Line (CLI)**: Utilitas via shell/terminal `npm run cli` untuk proses analisis *string* QRIS dengan cepat.

---

## 📁 Struktur Direktori

```text
qris-api/
├── public/                 # Berkas statis publik (gambar, svg, dll)
├── src/                    # Source code utama
│   ├── app/                # Next.js App Router (Halaman dan API Routes)
│   │   ├── api/            # Direktori backend endpoint (health, qris/*, payment/*)
│   │   ├── page.tsx        # UI Playground dan Dokumentasi
│   │   └── globals.css     # Gaya stylesheet global & Tailwind directives
│   ├── components/         # Komponen React (layout, docs, qris converter studio)
│   ├── lib/                # Logika bisnis inti dan utilitas backend
│   │   ├── api/            # Utilitas standardisasi format response API
│   │   ├── core/           # Mesin pemrosesan utama (parser, converter, validator, crc16, types)
│   │   └── store/          # Database engine in-memory (paymentStore.ts)
│   └── cli.ts              # Command Line Interface (CLI) entry point
├── package.json            # Daftar dependensi dan scripts npm
├── tailwind.config.ts      # Konfigurasi Tailwind CSS
└── tsconfig.json           # Konfigurasi kompilator TypeScript
```

---

## 💻 Requirement Sistem

- **Node.js** (Rekomendasi v20.x atau lebih baru)
- **NPM** atau Package Manager lainnya (Yarn, PNPM)
- Terminal/Command Prompt (untuk menggunakan fitur CLI dan menjalankan servis)
- Browser Modern (Chrome, Firefox, Safari) untuk menggunakan Playground.

---

## ⚙️ Petunjuk Setup Environment

1. **Kloning Repository**
   ```bash
   git clone https://github.com/azharanggakusuma/qris-api.git
   cd qris-api
   ```

2. **Instalasi Dependensi**
   Jalankan perintah instalasi standar npm:
   ```bash
   npm install
   ```
   *Dependensi utama termasuk: `next`, `react`, `jsqr`, `qrcode`, `lucide-react`, dan komponen UI Radix.*

3. **Konfigurasi Lingkungan (Environment Variables)**
   Secara default, proyek siap dijalankan tanpa `.env`. Jika ingin mengganti versi API pada health check, Anda dapat membuat file `.env` di direktori utama:
   ```env
   NEXT_PUBLIC_APP_VERSION=1.0.0
   ```

---

## 🚀 Cara Menjalankan Aplikasi

Layanan dapat dijalankan dalam beberapa mode sesuai kebutuhan Anda:

### 1. Development Mode (Web App & API Server)
Menjalankan *hot-reload* API dan halaman web dokumentasi.
```bash
npm run dev
```
Akses UI Playground dan Dokumentasi di: [http://localhost:3000](http://localhost:3000)

### 2. Production Mode (Build & Start)
Untuk penggunaan lingkungan *production*, Anda harus melakukan kompilasi proyek terlebih dahulu.
```bash
npm run build
npm run start
```
Servis akan berjalan dalam mode teroptimasi.

### 3. CLI Mode (Command-Line Tool)
Gunakan interaktif *command-line* untuk men-decode QRIS dan mengkonversinya ke versi dinamis dengan terminal.
```bash
npm run cli
```
Ikuti petunjuk interaktif pada terminal untuk memasukkan kode QRIS Statis, nominal, serta penambahan biaya layanan (opsional).

---

## 📡 Dokumentasi API

Seluruh respons dari API menggunakan pembungkus standar berikut, menghasilkan format yang mudah diolah:

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "requestId": "req_xyz123",
    "timestamp": "2026-08-31T07:00:00.000Z"
  }
}
```

Bila terjadi error, `success` akan bernilai `false`, dan terdapat *object* `error` yang berisi rincian kesalahan.

### Endpoint Utama
* **Health Check**
  - `GET /api/health` — Menampilkan status *uptime* dan ketersediaan layanan.

* **Fungsi Inti QRIS**
  - `POST /api/qris/validate` — Memvalidasi integritas struktur, tag mandatori, dan kecocokan algoritma CRC16 CCITT dari suatu string QRIS.
  - `POST /api/qris/parse` — Menguraikan *raw payload* menjadi format JSON terstruktur lengkap dengan informasi rinci setiap ID dan isi tag.
  - `POST /api/qris/convert` — Mengubah QRIS Statis menjadi Dinamis dengan menyisipkan parameter `amount` (nominal tagihan) dan `fee` (biaya). Format output juga dapat mengembalikan format `data_url` (Base64) atau `svg`.
  - `POST /api/qris/decode` — Endpoint untuk memproses *string* pemindaian (scanner) mentah dan memvalidasinya secara bersamaan.

* **Siklus Pembayaran (Payment Gateway)**
  - `POST /api/qris/payment` — Membuat tagihan pembayaran (invoice) QRIS baru dengan dukungan header `Idempotency-Key` dan parameter durasi kadaluwarsa (`expiresIn`).
  - `GET /api/qris/payment` — Menampilkan daftar riwayat tagihan *(paginated)* dengan opsi filter `status`.
  - `GET /api/qris/payment/:id` — Mengambil detail spesifik dari pesanan beserta string QR dinamis miliknya.
  - `GET /api/qris/payment/:id/qr` — Mengunduh langsung gambar QR Code (format didukung: `png`, `webp`, `jpeg`, `svg` via *query parameter* `?format=`). Sangat berguna untuk ditaruh langsung ke dalam *tag* `<img src="..."/>`.
  - `POST /api/qris/payment/:id/confirm` — Endpoint administratif untuk merubah status *payment order* menjadi `paid`.
  - `POST /api/qris/payment/:id/cancel` — Membatalkan pesanan (merubah status menjadi `cancelled`).

---

## 📄 Lisensi

Proyek ini menggunakan lisensi **MIT**. Anda bebas untuk menggunakan, menyalin, memodifikasi, dan mendistribusikan perangkat lunak ini secara komersial maupun non-komersial.
Hak cipta dilindungi © Azharangga Kusuma.
