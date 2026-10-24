# Project Brief: SaaS IELTS Mock Test

## Ringkasan

Platform latihan IELTS Academic Reading & Listening yang meniru
pengalaman IELTS on computer semirip mungkin (split screen, highlight,
catatan, navigasi soal, timer), supaya peserta terbiasa dengan
antarmuka ujian sebelum hari tes.

Target pengguna awal: calon peserta IELTS Academic di Indonesia
yang memilih tes berbasis komputer.

## Tiga aplikasi

### 1. Main app (`apps/web`) — untuk peserta

- Daftar & login
- Katalog tes (Reading Academic, Listening)
- Mengerjakan tes dengan antarmuka seperti IELTS on computer
- Hasil: raw score, band, pembahasan per soal
- Riwayat tes & perkembangan skor
- Pembelian paket akses

### 2. Admin app (`apps/admin`) — untuk tim konten

- Login khusus, hanya role `admin` dan `editor`
- Mengelola tes, section, question group, dan soal per tipe
- Upload audio & gambar
- Preview tes sebagai peserta
- Publish / unpublish
- (admin saja) kelola user, role, dan lihat data pembayaran

### 3. Backend (`apps/api`) — API untuk kedua app

- Framework: NestJS
- Satu-satunya app yang boleh mengakses database
- Memegang semua logika bisnis: autentikasi, otorisasi, penilaian,
  pengecekan akses paket, pembayaran
- Menerima webhook Midtrans
- Membuat signed URL untuk upload/akses audio & gambar

`apps/web` dan `apps/admin` adalah frontend murni: hanya memanggil
`apps/api`, tidak pernah mengakses database secara langsung.

## Role & hak akses

| Role    | Main app                     | Admin app                                      |
| ------- | ---------------------------- | ---------------------------------------------- |
| student | mengerjakan tes sesuai paket | tidak bisa masuk                               |
| editor  | —                            | buat/edit soal, tidak bisa publish (opsional)  |
| admin   | —                            | semua akses termasuk publish, user, pembayaran |

Aturan keras: hak akses SELALU dicek di `apps/api`. Menyembunyikan
tombol atau halaman di frontend bukan bentuk keamanan.

## Fitur MVP (wajib)

- Reading Academic: split screen, highlight, catatan, navigasi soal,
  flag, timer 60 menit, auto-submit saat waktu habis
- Listening: audio per part, waktu baca soal, review per part,
  2 menit cek akhir, navigasi soal
- Semua tipe soal Reading & Listening (lihat `ielts-domain.md`)
- Autosave jawaban & anotasi
- Penilaian otomatis + konversi band
- Pembahasan setelah submit
- Admin CRUD lengkap + upload audio
- Paket akses via Midtrans Snap

## Bukan bagian MVP

- IELTS General Training
- Writing & Speaking
- Auto-renewal langganan (Midtrans Subscription API)
- Aplikasi mobile native
- Fitur AI di dalam produk
- Leaderboard / fitur sosial

## Mode tes

- **Mode Ujian:** meniru tes asli. Audio Listening diputar sekali,
  tidak bisa pause, waktu ketat.
- **Mode Latihan:** audio bisa diulang/pause, waktu bisa dimatikan,
  pembahasan bisa dilihat per bagian.

## Arsitektur

```
apps/
  web/                 → Next.js, app peserta (frontend)
  admin/               → Next.js, app admin (frontend)
  api/                 → backend, satu-satunya akses ke database
packages/
  db/                  → skema Drizzle, migrasi, seed, query (dipakai api saja)
  question-schema/     → skema Zod per tipe soal + fungsi penilaian
  ui/                  → komponen shadcn/ui bersama
  config/              → eslint, tsconfig, tailwind preset
```

Aturan batas:

- `packages/db` hanya boleh di-import oleh `apps/api`
- `packages/question-schema` dipakai ketiga app: admin untuk validasi
  form, web untuk render, api untuk validasi input & penilaian.
  Satu sumber kebenaran.
- Fungsi penilaian berupa fungsi murni (tanpa framework, tanpa database)
  supaya mudah di-unit test
- Penilaian yang hasilnya disimpan SELALU dihitung di `apps/api`,
  bukan dipercaya dari frontend

## Sketsa model data

- `users` — id, email, name, role (student | editor | admin)
- `tests` — id, title, skill (reading | listening), module
  (academic; null untuk listening — disiapkan untuk ekspansi
  General Training nanti), status (draft | published), is_free
- `sections` — test_id, order, kind (passage | listening_part),
  title, content (rich text) | audio_url, transcript
- `question_groups` — section_id, order, type, instructions,
  number_from, number_to, payload (JSONB, divalidasi Zod sesuai type)
- `questions` — group_id, number (1–40), prompt, payload (JSONB),
  answer (JSONB: jawaban & variasi yang diterima)
- `attempts` — user_id, test_id, mode, started_at, submitted_at,
  raw_score, band
- `attempt_answers` — attempt_id, question_id, value, is_correct
- `annotations` — attempt_id, target (section/question), start_offset,
  end_offset, color, note
- `purchases` — user_id, plan, midtrans_order_id, amount, status,
  access_until
- `payment_events` — log mentah webhook Midtrans (untuk idempotency & audit)

Catatan desain: IELTS mengelompokkan soal dalam "group" dengan instruksi
bersama (misal "Questions 1–5, NO MORE THAN TWO WORDS"). Karena itu
`question_groups` adalah entitas tersendiri, bukan sekadar label.

## Pembayaran (Midtrans)

- MVP: paket akses sekali bayar (contoh: 30 hari / 90 hari) via Snap,
  semua metode pembayaran (QRIS, VA, e-wallet, kartu)
- Masa aktif dikelola aplikasi (`access_until`)
- Webhook diterima oleh `apps/api`
- Status pembayaran hanya diubah dari HTTP notification Midtrans
  (diverifikasi signature) atau Get Status API — tidak pernah dari
  halaman redirect browser
- Setiap notifikasi dicatat di `payment_events`; proses harus idempotent
- Nanti: Subscription API (hanya kartu kredit & GoPay tokenization)

## Risiko & hal yang perlu diperhatikan

- **Konten:** soal harus orisinal. Jangan menyalin soal dari buku
  resmi Cambridge/IELTS atau situs lain (hak cipta).
- **Merek:** "IELTS" adalah merek dagang milik pemiliknya. Cantumkan
  disclaimer bahwa produk ini tidak berafiliasi, dan hindari klaim
  "soal resmi".
- **Auth lintas app:** tiga app harus sepakat soal identitas user
  (cookie lintas domain/subdomain, CORS, atau token). Rancang di awal,
  jangan ditambal belakangan.
- **Deploy:** web & admin di Vercel; api butuh platform terpisah
  untuk server yang berjalan terus (kandidat: Railway, Fly.io, Render).
- **Highlight:** teknis paling rumit di frontend. Highlight yang
  tumpang tindih, lintas paragraf, dan tetap konsisten setelah
  refresh butuh desain penyimpanan berbasis offset yang matang.
- **Audio:** ukuran file besar; perlu streaming yang lancar dan
  preload sebelum part dimulai.
- **Konversi band:** tabel konversi resmi bisa sedikit berbeda antar
  tes; simpan sebagai konfigurasi, jangan di-hardcode.

## Definisi "MVP selesai"

- Minimal 3 tes Reading Academic dan 3 tes Listening dipublikasikan
- Peserta bisa daftar, bayar, mengerjakan, dan melihat hasil
- Admin bisa membuat tes baru tanpa bantuan developer
- Ketiga app live, error termonitor
