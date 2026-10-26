# Progress Log

## Status saat ini
Fase: 1 → sebagian Fase 2 & 3 (database konten + admin Reading) — minggu ke-1

**Lanjut dari sini:** rencana deploy web & api ke DigitalOcean (Docker)
sudah disusun di `docs/deployment.md`, belum dikerjakan. Mulai dari bagian "Keputusan yang
perlu diambil" di file itu.

**WorkOS sedang dikerjakan** (rencana 6 tahap): Tahap 1 (akun WorkOS Staging,
redirect URI, key di `.env` lokal) ✅, Tahap 2–3 (tabel `users` + auth di API)
✅, Tahap 4 (login di web, attempt per user) ✅, Tahap 5 (login di admin,
kunci admin & Basic Auth dihapus) ✅, Tahap 6 (spec development dengan
variabel WorkOS sudah diterapkan ke DigitalOcean) — tinggal push kode, cek
deploy, dan jadikan akun admin di database development.

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
- Auth: WorkOS (AuthKit) di web, admin, dan API. Kunci sementara
  `ADMIN_API_KEY` dan password Basic Auth admin sudah dihapus (2026-10-26)
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
- Auth: role disimpan di tabel `users` kita (bukan fitur Roles WorkOS); user
  baru = `student`; `editor` boleh mengedit tes, hanya `admin` yang boleh
  publish/unpublish. WorkOS Staging untuk local & development, Production
  untuk production
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

## Backlog fitur admin (permintaan developer, 2026-10-27; belum dikerjakan)

Arah admin: **pusat rekap**, bukan hanya editor konten.

1. **Dashboard rekap semua attempt dari semua user**: jumlah attempt, peserta
   aktif, rata-rata skor/band, attempt terbaru, dan tes yang paling sering
   dikerjakan (melengkapi rekap konten tes yang sudah ada).
2. **Menu Tests menjadi dropdown** di sidebar:
   - **All tests**: daftar tes (konten) seperti sekarang.
   - **Attempts** (hasil peserta): tabel berisi email user, tes yang
     dikerjakan, mode, skor/band, waktu submit atau status "in progress",
     dan bisa dibuka untuk melihat detail jawaban.

Catatan teknis:
- Datanya sudah ada di tabel `attempts` + `attempt_answers` + `users`
  (sejak 2026-10-27).
- Butuh endpoint baru di API, misalnya `GET /admin/attempts` (filter per tes,
  per user, paginasi) dan `GET /admin/stats`, dilindungi role `editor`/`admin`.
- Perlu diputuskan: apakah editor boleh melihat data peserta (email), atau
  hanya admin (data pribadi).

## Backlog: deploy hanya jika CI hijau (ditunda, 2026-10-27)

Sekarang CI hanya **memberi tahu** (✓/✗ di GitHub), belum **memblokir** deploy:
App Platform tetap men-deploy setiap push ke `development`/`main`, walaupun CI
merah. Supaya deploy menunggu CI:

1. **Developer:** buat token DigitalOcean (DO → API → Generate New Token) dan
   simpan sebagai secret di GitHub (repo → Settings → Secrets and variables →
   Actions), misalnya `DIGITALOCEAN_ACCESS_TOKEN`.
2. **Claude:** tambah job deploy di `.github/workflows/ci.yml` yang jalan
   setelah semua cek lolos, matikan `deploy_on_push` di `.do/*.yaml`, dan
   sekalian deploy hanya app yang berubah (image ke DigitalOcean Container
   Registry).

Butuh langkah dari developer dulu (token). Detail CI: `docs/ci.md`.

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
- [2026-10-26] WorkOS Tahap 1–3. Akun WorkOS (Staging), redirect URI web &
  admin (lokal + development), key di `.env` lokal. `packages/db`: tabel
  `users` (migrasi `0001_users`), `pnpm db:set-role`. `question-schema`:
  `UserRole`, `CurrentUser`. API: module `auth` (`GET /me`, verifikasi token
  dengan JWKS via `jose`, profil dari WorkOS API saat login pertama),
  `AuthGuard`, `RolesGuard` + `@Roles`, `AdminAccessGuard` sementara (kunci
  admin atau login), publish/unpublish khusus admin. Unit test + e2e dengan
  WorkOS palsu.
- [2026-10-26] WorkOS Tahap 4: login di web dengan
  `@workos-inc/authkit-nextjs` (public client, tanpa API key). `proxy.ts`:
  halaman privat (riwayat, sesi ujian) wajib login. Route `/sign-in`,
  `/callback`, tombol Sign in/Sign out di header, "Sign in to start" di halaman
  tes. Token dikirim ke API lewat `api-client.ts`. API: `/attempts` wajib
  login dan setiap user hanya melihat attempt miliknya; attempt demo bawaan
  dihapus (riwayat mulai kosong).
- [2026-10-26] WorkOS Tahap 5: admin login dengan WorkOS (cookie
  `wos-admin-session`, tanpa API key), `AccessGate` ("No access" untuk
  student), nama & role di header, sign out. Dihapus: `AdminKeyGuard`,
  `AdminAccessGuard`, `ADMIN_API_KEY`, Basic Auth di `proxy.ts`. e2e admin
  memakai WorkOS palsu. Catatan `basePath`: matcher proxy butuh `"/"` agar
  `/admin` tercakup.
- [2026-10-26] WorkOS Tahap 6: `.do/development.yaml` memakai variabel WorkOS
  (Client ID biasa, API key & cookie password sebagai `EV[...]`, redirect URI
  `RUN_AND_BUILD_TIME`), `ADMIN_API_KEY` & Basic Auth dihapus dari app.
  `.do/production.yaml` diberi placeholder WorkOS Production.
  `docs/deployment.md` diperbarui (langkah WorkOS, redirect di dashboard).
- [2026-10-27] Attempt pindah ke PostgreSQL: tabel `attempts` +
  `attempt_answers` (migrasi `0002_attempts`). Skor & benar/salah disimpan saat
  submit; `question_id` tanpa FK; tes yang punya attempt tidak bisa dihapus
  (RESTRICT, API 409); `seedDemoTests` jadi upsert. Submit ganda ditolak secara
  atomik. Riwayat memakai skor tersimpan (satu query, bukan menilai ulang).
  Unit test memakai repository palsu; e2e baru membuktikan data tetap ada
  setelah API di-restart. Belum: daftar attempt "sedang dikerjakan",
  menyelesaikan otomatis attempt yang lewat deadline.
- [2026-10-27] Guardrail: ESLint 10 di kelima package (config bersama
  `packages/config/eslint/`, TypeScript 6 untuk parser karena TS 7 tanpa JS
  API, opsi decorator untuk DI NestJS) dan CI GitHub Actions (lint, typecheck,
  unit, migrasi, e2e dengan PostgreSQL 17, build). Lint menemukan 2 bug React:
  setState di dalam effect (autosave web) dan variabel diubah saat render
  (nomor grup di editor admin); keduanya diperbaiki. Belum: deploy hanya jika
  CI hijau. Detail: `docs/ci.md`.

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
