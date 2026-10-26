# Roadmap: Membangun SaaS IELTS Mock Test dengan AI Agent

## Tujuan akhir

Meluncurkan SaaS mock test IELTS Academic (Reading & Listening) yang
sebagian besar kodenya ditulis oleh AI agent, sementara saya berperan
sebagai tech lead: menulis spesifikasi, menetapkan aturan, me-review,
dan mengambil keputusan desain.

Detail produk: lihat `project-brief.md`.
Pengetahuan format IELTS: lihat `ielts-domain.md`.

Target: MVP live dalam ±12–14 minggu (1–2 jam/hari).
(Lebih panjang dari rencana awal karena backend dipisah menjadi app sendiri.)

## Prinsip utama

1. AI menulis kode, saya yang menilai benar/salahnya.
2. Frontend (`apps/web`, `apps/admin`) = area yang saya kuasai → AI boleh
   lebih bebas. Backend (`apps/api`), database, keamanan, pembayaran =
   area yang harus saya pahami setiap keputusan desainnya.
3. Aturan tertulis mengarahkan AI; guardrail mesin (lint, typecheck,
   test, CI) memaksa AI.
4. Seberapa bebas AI dilepas sebanding dengan seberapa kuat test suite.
5. Satu fitur = satu branch. Git adalah tombol undo.
6. Belajar sambil membangun produk nyata; pelajari topik saat dibutuhkan.
7. Frontend tidak pernah mengakses database. Semua data lewat `apps/api`.

## Keputusan stack

- Monorepo: Turborepo + pnpm
- Frontend: Next.js (App Router) + TypeScript strict — `apps/web` & `apps/admin`
- Backend: NestJS — `apps/api`
- UI: Tailwind CSS + shadcn/ui (package bersama)
- Database: PostgreSQL + Drizzle ORM (diakses `apps/api` saja). Development:
  PostgreSQL lokal. Production: [belum diputuskan]
- Storage audio/gambar: [belum diputuskan — kandidat: Cloudflare R2,
  Supabase Storage; dibutuhkan di Fase 3]
- Auth: WorkOS (AuthKit); identitas & role tetap divalidasi di `apps/api`
- Validasi: Zod (dipakai bersama untuk skema soal & input API)
- Pembayaran: Midtrans (Snap, model paket akses; subscription menyusul)
- Test: Jest (bawaan NestJS) untuk `apps/api` (unit & integration),
  Vitest untuk packages & frontend, Playwright (end-to-end)
- Deploy: DigitalOcean untuk ketiga app (web, admin, api), dikemas sebagai
  image Docker; database: DigitalOcean Managed PostgreSQL. Tidak memakai
  Vercel. Rencana: `docs/deployment.md`
- Observability: Sentry + PostHog
- AI tooling: Claude Code (terminal, agent utama) + Antigravity (editor & review)

---

## Fase 1: Fondasi project & AI tooling (minggu 1–2)

**Dibangun:**

- Monorepo: `apps/web`, `apps/admin`, `apps/api`, `packages/db`,
  `packages/question-schema`, `packages/ui`, `packages/config`
- File aturan AI: root + per app + per package
- Guardrail: ESLint/Biome, TS strict, Jest (api) & Vitest, Husky, GitHub Actions
- Endpoint `GET /health` di `apps/api` yang dipanggil dari `apps/web`
  (bukti ketiga app tersambung)

**Dipelajari:**

- Editor agent vs terminal agent, kapan pakai yang mana
- Hierarki file aturan (CLAUDE.md per folder)
- Hooks, custom slash commands, subagents
- Verification loop: AI menjalankan lint/typecheck/test sampai lolos
- Struktur dasar NestJS (module, controller, provider)

**Kriteria selesai:**

- [ ] Monorepo berjalan, ketiga app bisa `dev` dan `build`
- [ ] `apps/web` berhasil memanggil `apps/api` saat development
- [ ] File aturan terpisah untuk web, admin, api, dan db
- [ ] Commit ditolak otomatis jika lint/typecheck/test gagal
- [ ] CI berjalan di setiap push
- [ ] Minimal 2 custom slash command yang benar-benar dipakai

---

## Fase 2: Domain & data model (minggu 2–4) ⚠️ fase paling kritis

**Dibangun:**

- Rancang integrasi WorkOS: tabel `users` (relasi ke WorkOS user id) & role
- Skema Zod untuk setiap tipe soal Reading & Listening di
  `packages/question-schema` (discriminated union berdasarkan `type`)
- Skema database: tests, sections, question_groups, questions,
  attempts, attempt_answers, annotations, users/roles, purchases,
  payment_events
- Migrasi + seed 1 tes Reading Academic dan 1 tes Listening lengkap (40 soal)
- Fungsi penilaian (fungsi murni): cek jawaban per tipe + konversi
  raw score → band (konfigurasi `listening` & `reading_academic`)

**Dipelajari:**

- Desain database relasional, kapan pakai JSONB vs kolom biasa
- Index, foreign key, constraint, migrasi
- Discriminated union & validasi di batas sistem
- Memisahkan domain logic dari framework & database
- Unit test untuk logika penilaian (wajib, bukan opsional)

**Kriteria selesai:**

- [ ] Semua tipe soal di `ielts-domain.md` bisa direpresentasikan
- [ ] Logika penilaian punya unit test untuk setiap tipe
- [ ] Bisa menjelaskan sendiri kenapa skema dirancang seperti itu
- [ ] Seed data bisa di-reset dan diisi ulang dengan satu perintah

---

## Fase 3: Auth & Admin app (minggu 4–7)

**Dibangun:**

- Auth di `apps/api` + sesi yang dipakai bersama oleh web & admin
- Role (admin, editor) — hanya role ini yang bisa masuk admin
- Endpoint API CRUD: tes → section (passage / part audio) →
  question group → soal
- Form dinamis per tipe soal di admin (form berbeda untuk tiap `type`)
- Upload audio Listening & gambar (diagram/peta) via signed URL dari API
- Status draft/published + preview "tampilan peserta"

**Dipelajari:**

- Autentikasi vs otorisasi (cek role di API, bukan hanya sembunyikan UI)
- Sesi lintas app: cookie, domain/subdomain, CORS, CSRF
- Middleware/guard di framework backend, validasi input dengan Zod
- Upload file: signed URL, batas ukuran, tipe file
- Integration test untuk endpoint API
- Audit: siapa mengubah soal apa

**Kriteria selesai:**

- [x] User non-admin ditolak di level API (ada test-nya)
- [ ] Editor bisa membuat 1 tes lengkap tanpa menyentuh database langsung
- [ ] Tes draft tidak pernah dikembalikan oleh endpoint untuk peserta

---

## Fase 4: Main app — mesin tes (minggu 7–10)

**Dibangun:**

- Endpoint API sesi ujian: mulai attempt, simpan jawaban, simpan
  anotasi, submit
- UI tes menyerupai IELTS on computer: split screen Reading,
  navigasi 40 soal, flag for review, timer, ukuran font & kontras
- Highlight & catatan pada teks bacaan dan soal
- Alur Listening: waktu baca soal, audio sekali putar (mode ujian),
  waktu review per part, 2 menit cek akhir
- Autosave jawaban & anotasi, lanjut tes setelah refresh
- Submit → skor & band dihitung di API → pembahasan jawaban benar/salah
- Mode: "Ujian" (persis seperti tes asli) vs "Latihan" (audio bisa diulang)

**Dipelajari:**

- Selection/Range API & penyimpanan highlight berbasis offset teks
- State management kompleks untuk sesi ujian
- Timer yang divalidasi di server (waktu mulai disimpan di DB)
- Jawaban benar tidak pernah dikirim ke browser sebelum submit
- Playwright test untuk alur ujian end-to-end

**Kriteria selesai:**

- [ ] 1 tes Reading Academic & 1 tes Listening bisa dikerjakan end-to-end
- [ ] Highlight tetap ada setelah refresh
- [ ] Waktu tidak bisa dimanipulasi dari browser
- [ ] Kunci jawaban tidak terlihat di response API sebelum submit
- [ ] Playwright test untuk alur: mulai → jawab → submit → hasil

---

## Fase 5: Lapisan SaaS & production (minggu 10–13)

**Dibangun:**

- Paket akses (free: 1 tes contoh; berbayar: semua tes selama X hari)
- Pembayaran Midtrans Snap + webhook notifikasi di `apps/api`
- Pengecekan akses di API untuk setiap tes berbayar
- Email transaksional (pembayaran berhasil, akses hampir habis)
- Sentry, PostHog, halaman legal (syarat, privasi, disclaimer)
- Deploy production ketiga app

**Dipelajari:**

- Webhook: verifikasi signature, idempotency, log event
- Status pembayaran hanya diubah dari notifikasi/Get Status Midtrans,
  bukan dari redirect di browser
- Secrets & environment per app, rate limiting
- Deploy server backend (bukan serverless), domain & CORS production

**Kriteria selesai:**

- [ ] Alur bayar end-to-end di sandbox Midtrans, termasuk gagal & expired
- [ ] Webhook yang dikirim dua kali tidak membuat akses ganda
- [ ] Error production otomatis tercatat (ketiga app)
- [ ] Ketiga app live di domain sendiri

---

## Fase 6: Workflow "AI yang ngerjain" (paralel sejak Fase 3)

**Topik:**

- Spec-driven: spesifikasi fitur → rencana teknis → review → eksekusi
- Simpan spesifikasi & rencana di repo (`docs/specs/`, `docs/plans/`)
- Agent paralel dengan git worktrees (misal: satu agent di api,
  satu di web)
- Naikkan otonomi AI bertahap seiring kuatnya test

**Kriteria selesai:**

- [ ] Minimal 3 fitur dibangun lewat alur spesifikasi → rencana → eksekusi
- [ ] Pernah menjalankan 2+ agent paralel
- [ ] File aturan terus diperbarui dari kesalahan AI yang berulang

---

## Fase 7 (setelah MVP): Fitur AI di dalam produk & ekspansi

Ide yang cocok untuk produk ini:

- Pembahasan otomatis: kenapa jawaban benar, di bagian teks mana buktinya
- Asisten editor: AI membuat draf soal dari passage, editor me-review
- Ekspansi ke Reading General Training
- Ekspansi ke Writing (penilaian esai) & Speaking

**Topik:** API model, structured output, evals, biaya token.

---

## Milestone

1. Minggu 2: monorepo 3 app + aturan AI + guardrail aktif
2. Minggu 4: semua tipe soal ter-modelkan + penilaian ter-test + auth diputuskan
3. Minggu 7: auth jalan, admin bisa membuat tes lengkap
4. Minggu 10: peserta bisa mengerjakan tes end-to-end
5. Minggu 13–14: pembayaran aktif, MVP live
