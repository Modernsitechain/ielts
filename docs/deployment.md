# Deploy ke DigitalOcean (App Platform + Docker)

Status (2026-10-26): **Tahap 0 selesai** (kode siap). Yang di-deploy dulu
hanya **backend (`apps/api`)**, ke dua environment: **development** dan
**production**. Lanjutkan dari Tahap 1 (dikerjakan developer di dashboard).

## Keputusan yang sudah diambil

- Semua app di-deploy ke **DigitalOcean** sebagai **image Docker**. **Tidak
  memakai Vercel.**
- Tempat menjalankan container: **App Platform** (PaaS; build, HTTPS, restart,
  dan deploy otomatis tiap push diurus DO). Bukan Droplet.
- Database: **satu cluster Managed PostgreSQL 17** bernama `ielts-db`, region
  **Singapore (SGP1)**, berisi **dua database** dengan **user terpisah**:

  | Environment | Branch        | App Platform app         | Database                 | User DB             |
  | ----------- | ------------- | ------------------------ | ------------------------ | ------------------- |
  | development | `development` | `ielts-api-development`  | `ielts_mock_development` | `ielts_development` |
  | production  | `main`        | `ielts-api-production`   | `ielts_mock`             | `ielts_production`  |

  User development tidak bisa membuka database production (dan sebaliknya).
- **Migrasi** dijalankan otomatis sebelum setiap deploy (pre-deploy job
  `node dist/database/migrate.js`). Jika migrasi gagal, versi baru tidak live.
- **Seed demo**: hanya development (dijalankan sekali, manual).
- API diberi **route publik sementara** agar `/health` dan `/tests` bisa dicek
  di browser. Dihapus saat `apps/web` di-deploy (web memanggil API lewat
  jaringan internal). Aman untuk sementara: endpoint yang ada memang untuk
  peserta anonim, dan `/admin/*` mati di luar `APP_ENV=local`.

## Arsitektur

Sekarang (backend saja):

```
Internet ──HTTPS──▶ api (NestJS, App Platform, port 4000)  ← route publik sementara
                        │  SSL (CA cluster)
                        ▼
                    Managed PostgreSQL "ielts-db" (SGP1)
```

Target (setelah web di-deploy):

```
Internet ──HTTPS──▶ web (Next.js, port 3000)
                        │  HTTP internal (API_URL)
                        ▼
                    api (NestJS, port 4000) — tidak publik
                        │  SSL
                        ▼
                    Managed PostgreSQL
```

`apps/admin` baru di-deploy **setelah login WorkOS ada**. Sebelum itu admin
hanya di laptop.

## File deploy di repo

| File                          | Fungsi                                                                 |
| ----------------------------- | ---------------------------------------------------------------------- |
| `apps/api/Dockerfile`         | Build multi-stage: `turbo prune` → `pnpm install` → build → `pnpm deploy --prod`. Image akhir: `dist` + dependency produksi, user non-root, `node dist/main`. |
| `.dockerignore`               | `.env*`, `node_modules`, `dist`, `.next`, `.turbo`, `.git` tidak ikut ke image. |
| `.do/api-development.yaml`    | App spec App Platform untuk development (branch `development`).       |
| `.do/api-production.yaml`     | App spec untuk production (branch `main`).                             |
| `apps/api/src/database/migrate.ts` | Menjalankan migrasi `packages/db/drizzle/` dengan setelan SSL API. |
| `apps/api/src/database/seed.ts`    | Memasukkan tes demo ke database yang sudah di-deploy.            |

App spec tidak berisi rahasia: `DATABASE_URL` dan `DATABASE_CA_CERT` diisi
App Platform dari database yang di-attach (`${db.DATABASE_URL}`,
`${db.CA_CERT}`). Jadi connection string tidak pernah ditulis atau ditempel
di mana pun.

## Langkah-langkah

### Tahap 0 — Siapkan kode ✅ (selesai 2026-10-26)
Dockerfile, `.dockerignore`, app spec, script migrate & seed, dukungan SSL
database, pemisahan environment. Image belum pernah di-build dengan Docker
(belum ada Docker di laptop). Langkah build sudah disimulasikan tanpa Docker
dan API hasil `pnpm deploy` berhasil jalan. Build image pertama terjadi di DO.

### Tahap 1 — Database (developer, dashboard DO)
1. **Databases → Create Database Cluster**: PostgreSQL **17**, region
   **Singapore (SGP1)**, plan terkecil, nama cluster **`ielts-db`** (harus
   sama persis dengan `cluster_name` di app spec).
2. Tab **Users & Databases**:
   - Databases: buat `ielts_mock_development` dan `ielts_mock`.
   - Users: buat `ielts_development` dan `ielts_production`.
3. Atur hak akses (sekali saja). Ini butuh `psql` dari laptop sebagai user
   `doadmin`:
   - Tab **Network Access / Trusted Sources**: tambahkan IP laptop Anda
     sementara.
   - Tab **Overview → Connection details**: pilih user `doadmin`, database
     `defaultdb`, lalu salin perintah `psql`. Jalankan di terminal Anda sendiri,
     **jangan ditempel ke chat**.
   - Jalankan:
     ```sql
     -- Each environment's user owns its own database (needed to create tables).
     ALTER DATABASE ielts_mock_development OWNER TO ielts_development;
     ALTER DATABASE ielts_mock OWNER TO ielts_production;
     -- Nobody else may connect (the owner still can).
     REVOKE CONNECT ON DATABASE ielts_mock_development FROM PUBLIC;
     REVOKE CONNECT ON DATABASE ielts_mock FROM PUBLIC;
     ```
   - Hapus lagi IP laptop dari Trusted Sources setelah selesai.

### Tahap 2 — Branch & GitHub
1. Push branch `development` dan `main` ke GitHub (`/axl push`).
2. Saat pertama kali membuat app, DO meminta akses GitHub: pasang
   **DigitalOcean GitHub app** di akun `Modernsitechain` dan beri akses ke repo
   `ielts`.

### Tahap 3 — Buat app development
**Opsi A (disarankan): doctl.** App dibuat persis sesuai file spec.
1. `brew install doctl`
2. DO dashboard → **API → Generate New Token** (scope read + write). Jalankan
   `doctl auth init` dan tempel token di terminal, **bukan di chat**.
3. Dari root repo: `doctl apps create --spec .do/api-development.yaml`

**Opsi B: dashboard.**
1. **Apps → Create App** → GitHub → repo `Modernsitechain/ielts`, branch
   `development` → selesaikan wizard (pengaturan apa saja dulu).
2. **Settings → App Spec → Edit**: ganti seluruh isinya dengan
   `.do/api-development.yaml` → **Save**. App akan deploy ulang.

Lalu di cluster `ielts-db` → **Trusted Sources**: pastikan app
`ielts-api-development` ada di daftar. Biasanya ditambahkan otomatis saat
database di-attach.

### Tahap 4 — Cek development
1. Tab **Activity** / **Deployments**: build, lalu job `migrate` ("Migrations
   applied."), lalu service `api`.
2. Buka `https://<url-app>/health` → `{"status":"ok","database":"up"}`.
3. Seed demo: komponen `api` → tab **Console** → `node dist/database/seed.js`
   → "Seeded 2 demo tests."
4. `https://<url-app>/tests` → dua tes demo. `/admin/tests` → 403 (benar:
   admin mati di luar local).
5. Gagal? Lihat **Build Logs**, **Deploy Logs**, dan **Runtime Logs**.

### Tahap 5 — Buat app production
1. Merge `development` → `main`, lalu push `main`.
2. `doctl apps create --spec .do/api-production.yaml` (atau Opsi B dengan
   branch `main` dan file production).
3. Cek seperti Tahap 4, **tanpa seed**. `/tests` akan berisi `[]`.

## Setiap deploy berikutnya

- Push ke `development` → deploy otomatis ke development.
- Merge ke `main` + push → deploy otomatis ke production.
- Mengubah file spec? Terapkan dengan
  `doctl apps update <app-id> --spec .do/api-<env>.yaml` (ID: `doctl apps list`).
  Mengubah spec di dashboard saja membuat file di repo tertinggal; selalu
  perbarui file-nya juga.

## Biaya

Per environment: satu container `apps-s-1vcpu-0.5gb` (± US$5/bulan menurut
dokumentasi DO saat ini) plus job migrasi yang jalan sebentar setiap deploy.
Ditambah satu cluster database untuk keduanya. Cek harga terbaru di situs
DigitalOcean.

## Catatan & hal yang masih terbuka

- **Konten production**: admin hanya jalan di laptop dan menulis ke database
  lokal. Tes yang dibuat di admin **tidak otomatis ada di production**. Perlu
  diputuskan sebelum launch: deploy admin (setelah WorkOS) atau cara
  export/import konten.
- Attempt masih disimpan di memori API: hilang setiap deploy/restart.
- Sesudah backend: deploy `apps/web` (Dockerfile + `output: "standalone"`),
  hapus route publik API, `API_URL` web = URL internal API.
- GitHub Actions: typecheck & test harus lolos sebelum deploy.
- Domain sendiri (boleh menyusul).
