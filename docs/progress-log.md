# Progress Log

## Status saat ini
Fase: 1 (Fondasi project & AI tooling) — minggu ke-1

## Keputusan yang sudah diambil
- Produk: SaaS mock test IELTS Reading & Listening (lihat project-brief.md)
- Struktur: monorepo Turborepo + pnpm, 3 app: `apps/web` & `apps/admin`
  (Next.js, frontend murni) + `apps/api` (backend, satu-satunya akses database)
- Backend: NestJS, termasuk test bawaannya (Jest) untuk `apps/api`
- AI tooling: Claude Code (terminal, agent utama) + Antigravity (editor & review)
- Database: PostgreSQL + Drizzle; development memakai PostgreSQL lokal
- Auth: WorkOS (AuthKit)
- Commit message: `<type>: <ringkasan>` dalam bahasa Inggris; type hanya
  `feat` atau `fix`. Perintah `/axl commit` & `/axl push` di
  `.claude/skills/axl/SKILL.md`
- Runtime: Node 24 LTS (`.nvmrc`); dibutuhkan Jest untuk NestJS 12 (ESM)
- Pembayaran: Midtrans Snap, model paket akses (bukan auto-renewal dulu)
- Soal harus orisinal; ada disclaimer tidak berafiliasi dengan IELTS
- Bahasa: seluruh isi aplikasi (teks UI, pesan error, konten soal, comment
  kode) dalam bahasa Inggris dengan ejaan British, walaupun diskusi/prompt
  dalam bahasa Indonesia. Dokumen di `docs/` tetap berbahasa Indonesia.

## Keputusan yang belum diambil
- Hosting PostgreSQL untuk production
- Storage audio & gambar (sebelumnya Supabase Storage; kandidat: Cloudflare R2)
- Harga & durasi paket
- Platform deploy `apps/api` (Railway vs Fly.io vs Render)

## Catatan per sesi
<!-- Format: [tanggal] apa yang dikerjakan / dipelajari -->
- [YYYY-MM-DD] Menyusun roadmap, project brief, dan domain knowledge
- [2026-10-24] Merencanakan setup monorepo. Rencana awal (hanya web & admin)
  dibatalkan karena tidak sesuai docs yang mensyaratkan `apps/api`.
  Memutuskan backend NestJS; roadmap & progress log diselaraskan.
- [2026-10-24] Urutan diubah: main app dulu dengan dummy data, api & admin
  menyusul. Dibuat: monorepo Turborepo + pnpm, `packages/config` (tsconfig),
  `apps/web` (Next.js 16, Tailwind) dengan halaman katalog, detail tes,
  riwayat, dan hasil. Data lewat `apps/web/lib/api` (sekarang membaca
  `lib/mock`; nanti diganti fetch ke `apps/api`). Kunci jawaban & penilaian
  hanya di sisi server. Halaman pengerjaan tes belum dibuat.
- [2026-10-24] Struktur `apps/web` diubah ke `core/` (models, datas, services),
  `feature/` (home, catalog, history, session, auth), `shared/` (components,
  layouts, utils). `app/` hanya berisi route tipis yang me-re-export halaman
  dari `feature/*/pages`. Pintu data sekarang `core/services` (menggantikan
  `lib/api`), dummy data di `core/datas`.
- [2026-10-24] Halaman pengerjaan Reading (`/session/reading/[attemptId]`,
  route group `(exam)` layar penuh): split screen, navigasi soal per part,
  flag, timer dari `endsAt` server + auto-submit, autosave via Server Action,
  submit → penilaian di server → halaman hasil. Attempt disimpan di memori
  server (hilang saat restart). Belum: highlight & catatan, pengaturan font/
  kontras, flag belum tersimpan, sesi Listening, pengecekan paket berbayar.
- [2026-10-24] Seluruh teks UI & comment di `apps/web` diubah ke bahasa
  Inggris (British). Aturan bahasa dicatat di keputusan & `apps/web/AGENTS.md`.
- [2026-10-24] Redesign landing page (hero + mock-up layar ujian, fitur,
  cara kerja, teaser AI study coach "coming soon", CTA) & polish UI halaman
  ujian. Icon pakai `lucide-react`, font Geist. Landing menyebut highlight &
  catatan, padahal fitur itu belum dibuat.
- [2026-10-24] Memutuskan auth: WorkOS (AuthKit); database development:
  PostgreSQL lokal (tanpa Supabase). Akibatnya hosting DB production & storage
  audio/gambar kembali menjadi keputusan terbuka.
- [2026-10-24] Membuat `apps/api` (NestJS 12, mengikuti template resmi:
  TypeScript 6, Jest + ts-jest). Struktur module per fitur: `config/`,
  `database/` (Pool pg + Drizzle, global), `common/`, `modules/health`.
  `GET /health` mengecek koneksi PostgreSQL lokal (200/503), ada unit &
  e2e test (DB `ielts_mock_test`). `apps/web` memanggilnya di halaman
  `/status` lewat `core/services/api-client.ts`. Project distandarkan ke
  Node 24 karena Jest butuh Node 24.9+ untuk paket ESM NestJS 12.
  Panduan backend: `apps/api/AGENTS.md`.
- [2026-10-24] Web memakai API untuk soal Reading & Listening. Dibuat
  `packages/question-schema` (tipe tes/attempt + fungsi penilaian murni,
  ESM, di-build ke `dist/`). API: module `tests` (GET /tests, /tests/:id)
  dan `attempts` (POST /attempts, GET /attempts[/:id], PUT /:id/answers,
  POST /:id/submit, GET /:id/result), validasi body dengan Zod, repository
  masih in-memory. Web: dummy data, `records.ts`, dan `scoring.ts` dihapus;
  services memanggil API; `error.tsx` saat API tidak terjangkau. Unit test
  AttemptsService (deadline, sanitasi jawaban, penilaian). Belum: tabel
  database (Fase 2), auth/kepemilikan attempt (Fase 3), unit test scoring.

## Yang masih bingung
<!-- Tulis di sini, Claude akan menjelaskan ulang -->
-

## Kesalahan AI yang berulang (bahan untuk file aturan)
<!-- Contoh: AI masih pakai `any` di handler webhook -->
- Menyusun rencana tanpa membaca `docs/` lebih dulu → rencana melenceng
  dari arsitektur (lupa `apps/api`)
