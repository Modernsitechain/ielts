# Environments

Disusun 2026-10-24. Satu-satunya referensi untuk environment, branch, dan
environment variable. Rencana deploy: `docs/deployment.md`.

## Daftar environment

| `APP_ENV`     | Sumber kode           | Tempat jalan          | Database                          | Status          |
| ------------- | --------------------- | --------------------- | --------------------------------- | --------------- |
| `local`       | working copy di laptop | laptop developer      | PostgreSQL lokal `ielts_mock`     | aktif           |
| `development` | branch `development`  | DigitalOcean          | Managed PG `ielts_mock_development` | menunggu aba-aba |
| `staging`     | (belum ditentukan)    | DigitalOcean          | (belum ditentukan)                | nanti           |
| `production`  | branch `main`         | DigitalOcean          | Managed PG `ielts_mock`           | deploy pertama  |

Test otomatis (`pnpm test`) memakai database lokal `ielts_mock_test`.

## `APP_ENV` vs `NODE_ENV`

Dua variabel berbeda, jangan ditukar:

- **`NODE_ENV`** = mode runtime Node/Next/Nest. `development` hanya di laptop
  (`pnpm dev`); **selalu `production` di server yang di-deploy**, termasuk
  environment `development`. Jest mengisi `test` sendiri.
- **`APP_ENV`** = environment deploy (`local`, `development`, `staging`,
  `production`). Dipakai untuk membedakan perilaku antar-deploy (misalnya
  label di `/status`, nanti logging & monitoring).

## Menjalankan di lokal

Di laptop, `APP_ENV` selalu `local`, apa pun branch-nya: branch hanya
menentukan kode yang jalan; database & env tetap milik laptop.

Persiapan sekali per terminal: `nvm use` di root repo (Node 24).

| Mode             | Perintah (dari root)        | Untuk apa                                                  |
| ---------------- | --------------------------- | ---------------------------------------------------------- |
| Development      | `pnpm dev`                  | ngoding sehari-hari: hot reload, error detail              |
| Production lokal | `pnpm start`                | menguji hasil build yang sama dengan server; tanpa hot reload |

- `pnpm start` otomatis menjalankan `pnpm build` dulu (Turbo), lalu
  `node dist/main` (api, port 4000) dan `next start` (web, port 3000).
- Matikan `pnpm dev` dulu sebelum `pnpm start`; keduanya memakai port yang sama.
- Kode branch lain: `git switch <branch>` lalu perintah yang sama.
- Setelah Dockerfile dibuat (Tahap 0 di `docs/deployment.md`), image yang
  persis sama dengan server bisa dijalankan lokal dengan Docker.

## Alur branch

- **Sekarang:** semua pekerjaan langsung di `main`, sampai deploy pertama.
- **Nanti (setelah aba-aba developer):** branch `development` dibuat dari
  `main`; fitur dikerjakan di `development` (atau branch fitur yang di-merge
  ke `development`); `development` → `main` saat siap rilis.
- Push ke `development` → deploy ke environment development.
  Push ke `main` → deploy ke production.

## Environment variable

### `apps/api` (divalidasi di `apps/api/src/config/env.ts`)

| Variabel           | local                          | development                    | production                     | Rahasia |
| ------------------ | ------------------------------ | ------------------------------ | ------------------------------ | ------- |
| `NODE_ENV`         | (default `development`)        | `production`                   | `production`                   | –       |
| `APP_ENV`          | `local`                        | `development`                  | `production`                   | –       |
| `PORT`             | `4000`                         | `4000`                         | `4000`                         | –       |
| `DATABASE_URL`     | `postgresql://USER@localhost:5432/ielts_mock` | URL Managed PG (`ielts_mock_development`) | URL Managed PG (`ielts_mock`) | ya |
| `DATABASE_CA_CERT` | (kosong)                       | CA cluster (PEM/base64)        | CA cluster (PEM/base64)        | ya      |

Catatan `DATABASE_URL` + `DATABASE_CA_CERT`: jika CA diisi, parameter SSL di
URL (`sslmode=require`, dll.) otomatis dibuang dan koneksi memverifikasi
sertifikat server dengan CA tersebut. Jadi connection string dari dashboard
DigitalOcean boleh ditempel apa adanya.

### `apps/web` (divalidasi di `apps/web/core/config/env.ts`)

| Variabel   | local                                  | development               | production                | Rahasia |
| ---------- | -------------------------------------- | ------------------------- | ------------------------- | ------- |
| `NODE_ENV` | (diatur Next.js)                       | `production`              | `production`              | –       |
| `APP_ENV`  | `local`                                | `development`             | `production`              | –       |
| `API_URL`  | (default `http://localhost:4000`)      | URL internal API development | URL internal API production | –    |

`API_URL` wajib di semua environment selain `local`; web menolak start jika
kosong, agar tidak diam-diam memanggil `localhost`.

## File env

| File                                   | Di-commit | Isi                                             |
| -------------------------------------- | --------- | ----------------------------------------------- |
| `apps/*/.env.example`                  | ya        | template **local**                              |
| `apps/*/.env.development.example`      | ya        | referensi variabel environment **development**  |
| `apps/*/.env.production.example`       | ya        | referensi variabel environment **production**   |
| `apps/api/.env`                        | **tidak** | nilai local API (salinan `.env.example`)        |
| `apps/api/.env.test`                   | **tidak** | nilai untuk test (DB `ielts_mock_test`)         |
| `apps/web/.env.local`                  | **tidak** | opsional, override local web                    |

Aturan:

- **Nilai development & production tidak pernah disimpan di file repo.**
  Diisi di DigitalOcean (env var; yang rahasia ditandai Encrypt). File
  `.env.<environment>.example` hanya daftar variabel & nilai non-rahasia.
- Jangan membuat `.env.development` / `.env.production` di laptop:
  Next.js otomatis membaca file itu dan bisa mencampur nilai environment.
- `.env*` tidak ikut ke image Docker (lihat `.dockerignore` saat dibuat).

## Menambah environment variable baru

1. Tambahkan ke skema Zod: `apps/api/src/config/env.ts` atau
   `apps/web/core/config/env.ts`.
2. Tambahkan ke **semua** template: `.env.example`,
   `.env.development.example`, `.env.production.example` app tersebut.
3. Tambahkan baris di tabel dokumen ini.
4. Isi nilainya di `.env` lokal dan di DigitalOcean untuk setiap environment.
