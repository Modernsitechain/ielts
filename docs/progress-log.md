# Progress Log

## Status saat ini
Fase: 1 → sebagian Fase 2 & 3 (database konten + admin Reading) — minggu ke-1

**Lanjut dari sini:** rencana deploy web & api ke DigitalOcean (Docker)
sudah disusun di `docs/deployment.md`, belum dikerjakan. Mulai dari bagian "Keputusan yang
perlu diambil" di file itu.

**Development sudah live**: https://ielts-development-9acd2.ondigitalocean.app
(web di `/`, admin di `/admin` dengan password sementara, API di `/api`).
App lama `ielts-api-development` sudah dihapus. Berikutnya: production
(Tahap 5 di `docs/deployment.md`). Kerja sekarang di branch `development`.

**Admin Reading sudah jalan** (`apps/admin`, http://localhost:3001/admin): buat tes,
passage, group soal (7 tipe Reading), soal & jawaban, publish. Konten tes
tersimpan di PostgreSQL (`packages/db`). Langkah berikut: developer mencoba
admin, me-review skema tabel (`packages/db/AGENTS.md`), lalu commit. Setelah
itu: konten tes asli, tabel attempt, atau deploy.

Belajar PostgreSQL (6 sesi, database `ielts_sandbox`) ditunda; skema konten
tes (`packages/db/src/schema.ts`) bisa dipakai sebagai bahan belajar relasi,
constraint, dan JSONB. Listening & audio ditunda; rekomendasi audio ada di
catatan sesi 2026-10-24.

## Keputusan yang sudah diambil
- Produk: SaaS mock test IELTS Reading & Listening (lihat project-brief.md)
- Struktur: monorepo Turborepo + pnpm, 3 app: `apps/web` & `apps/admin`
  (Next.js, frontend murni) + `apps/api` (backend, satu-satunya akses database)
- Backend: NestJS, termasuk test bawaannya (Jest) untuk `apps/api`
- AI tooling: Claude Code (terminal, agent utama) + Antigravity (editor & review)
- Database: PostgreSQL + Drizzle; development memakai PostgreSQL lokal
- Auth: WorkOS (AuthKit). Sampai terpasang, endpoint admin dilindungi kunci
  sementara `ADMIN_API_KEY` dan hanya aktif di `APP_ENV=local`/`development`;
  admin hanya di-deploy ke development, di balik password sementara (Basic
  Auth); production tanpa admin sampai WorkOS
- Commit message: `<type>: <ringkasan>` dalam bahasa Inggris; type hanya
  `feat` atau `fix`. Perintah `/axl commit` & `/axl push` di
  `.claude/skills/axl/SKILL.md`
- Deploy: web & api (dan nanti admin) di DigitalOcean memakai Docker;
  database DigitalOcean Managed PostgreSQL. Tidak memakai Vercel
- Environment: `local`, `development` (branch `development`), `staging`
  (nanti), `production` (branch `main`), dibedakan dengan `APP_ENV`. Sejak
  2026-10-26 kerja di branch `development`; rilis = merge ke `main`. Detail:
  `docs/environments.md`
- Deploy: App Platform (bukan Droplet); satu app per environment
  (`ielts-development`: api + web + admin; `ielts-production`: api + web);
  satu cluster Managed PostgreSQL 18 `ielts-db` dengan database & user terpisah
  per environment; migrasi sebagai pre-deploy job; API privat (`http://api:4000`),
  di development juga publik di `/api` untuk `pnpm dev:remote`; seed demo hanya
  di development
- Runtime: Node 24 LTS (`.nvmrc`); dibutuhkan Jest untuk NestJS 12 (ESM)
- Admin: fokus Reading dulu. Passage disimpan sebagai daftar paragraf
  berlabel (A, B, C…). Tes published read-only (unpublish untuk edit); publish
  ditolak jika belum lengkap (`checkPublishReadiness`). Tes Listening demo tetap
  lewat seed, tidak bisa diedit di admin
- Pembayaran: Midtrans Snap, model paket akses (bukan auto-renewal dulu)
- Soal harus orisinal; ada disclaimer tidak berafiliasi dengan IELTS
- Bahasa: seluruh isi aplikasi (teks UI, pesan error, konten soal, comment
  kode) dalam bahasa Inggris dengan ejaan British, walaupun diskusi/prompt
  dalam bahasa Indonesia. Dokumen di `docs/` tetap berbahasa Indonesia.

## Keputusan yang belum diambil
- Storage audio & gambar (sebelumnya Supabase Storage; kandidat: Cloudflare R2)
- Harga & durasi paket
- Cara konten buatan admin (lokal) sampai ke production: deploy admin setelah
  WorkOS, atau export/import

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
- [2026-10-24] Menyusun rencana deploy `apps/api` ke DigitalOcean (App
  Platform + Managed PostgreSQL) di `docs/deployment.md`. Ditunda; belum ada
  perubahan kode untuk deploy.
- [2026-10-24] Diputuskan: frontend & backend di-deploy ke DigitalOcean
  dengan Docker, tanpa Vercel. Docs (brief, roadmap, deployment) diselaraskan.
- [2026-10-24] Merapikan class Tailwind ke penamaan v4 (konflik `divide`/
  `border`, `rounded`→`rounded-sm`, `outline-none`→`outline-hidden`, dll.) dan
  menambah aturan "Tailwind CSS v4" di `apps/web/AGENTS.md`.
- [2026-10-24] Menyiapkan pemisahan environment: `APP_ENV` di api & web,
  validasi env web (Zod, `API_URL` wajib di luar local), template
  `.env.example` / `.env.development.example` / `.env.production.example`,
  dukungan SSL + CA untuk Managed PostgreSQL, dan `docs/environments.md`.
  Environment terlihat di halaman `/status`.
- [2026-10-24] Diskusi lanjutan: urutan sisa MVP (Listening dengan audio
  placeholder → database Fase 2 → deploy → auth, admin, highlight, pembayaran).
  Rekomendasi audio: dev pakai `say` macOS (bukan untuk komersial), produksi
  rekaman/TTS berlisensi; MP3/M4A mono 64–96 kbps, satu file per part; simpan
  di DigitalOcean Spaces + signed URL (belum diputuskan). Mulai belajar
  PostgreSQL sesi 1.
- [2026-10-26] Membuat admin Reading. `packages/question-schema`: skema Zod
  konten tes, 4 tipe baru (Yes/No/Not Given, matching headings, matching
  information, summary completion), `checkPublishReadiness` + test Vitest.
  `packages/db` (baru): tabel `tests`, `sections`, `question_groups`,
  `questions` (Drizzle, migrasi pertama, seed 2 tes demo). API: repository tes
  pindah ke PostgreSQL, endpoint peserta hanya mengembalikan tes published,
  module `admin-tests` (`/admin/tests` CRUD + publish/unpublish) dengan
  `AdminKeyGuard` sementara, unit test + e2e. `apps/admin` (baru, port 3001):
  daftar tes, buat tes, editor lengkap. `apps/web`: passage dari daftar
  paragraf dan tampilan 4 tipe soal baru. Varian jawaban "50 000" di demo
  dihapus karena dianggap melebihi batas kata.
- [2026-10-26] Persiapan deploy backend ke 2 environment. Branch
  `development` dibuat. Ditambahkan `apps/api/Dockerfile` (turbo prune + pnpm
  deploy, non-root), `.dockerignore`, app spec App Platform
  `.do/api-development.yaml` & `.do/api-production.yaml`, script
  `dist/database/migrate.js` (pre-deploy job) & `seed.js` di image API.
  `/axl push` kini mendorong `development` atau `main`. Image belum di-build
  dengan Docker (simulasi tahap build tanpa Docker berhasil).
- [2026-10-26] Deploy development pertama (api saja): cluster `ielts-db`
  (PostgreSQL 18, SGP1, 2 database + 2 user), app `ielts-api-development`
  lewat doctl. Masalah: app dari doctl tidak otomatis masuk Trusted Sources
  (migrasi timeout); `psql` dari laptop gagal karena Cloudflare WARP mengganti
  IP. Perbaikan bug: riwayat attempt tidak lagi gagal jika tesnya sudah tidak
  ada. Ditambahkan `pnpm dev:remote` (web lokal + API development).
- [2026-10-26] Persiapan deploy web & admin: Dockerfile web/admin (Next.js
  standalone), admin pindah ke `basePath: "/admin"` + password gate
  (`proxy.ts`, Basic Auth) di luar local, guard API mengizinkan admin di
  development, app spec baru `.do/development.yaml` (api + web + admin, satu
  domain) dan `.do/production.yaml` (api privat + web).

## Yang masih bingung
<!-- Tulis di sini, Claude akan menjelaskan ulang -->
-

## Kesalahan AI yang berulang (bahan untuk file aturan)
<!-- Contoh: AI masih pakai `any` di handler webhook -->
- Menulis class Tailwind dengan kebiasaan v3 / class yang saling konflik
  (lihat aturan Tailwind v4 di `apps/web/AGENTS.md`)
- Menyusun rencana tanpa membaca `docs/` lebih dulu → rencana melenceng
  dari arsitektur (lupa `apps/api`)
- Mengimpor `drizzle-orm` langsung di `apps/api` (CommonJS) → dua salinan
  drizzle, tipe tidak cocok. Impor lewat `@ielts-mock/db`
