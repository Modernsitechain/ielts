# Deploy ke DigitalOcean (App Platform + Docker)

Status (2026-10-26):
- Database cluster `ielts-db` ✅ (Tahap 1).
- Development ✅: app **`ielts-development`** (api + web + admin) jalan di
  https://ielts-development-9acd2.ondigitalocean.app (`/admin`, `/api`).
  App lama `ielts-api-development` (api saja) sudah dihapus.
- Production: belum dibuat (Tahap 5).

## Keputusan yang sudah diambil

- Semua app di-deploy ke **DigitalOcean** sebagai **image Docker**. **Tidak
  memakai Vercel.**
- Tempat menjalankan container: **App Platform** (PaaS; build, HTTPS, restart,
  dan deploy otomatis tiap push diurus DO). Bukan Droplet.
- **Satu App Platform app per environment**, berisi beberapa komponen di satu
  domain:

  | Environment | Branch        | App                 | Komponen            | Database                 | User DB             |
  | ----------- | ------------- | ------------------- | ------------------- | ------------------------ | ------------------- |
  | development | `development` | `ielts-development` | api, web, **admin** | `ielts_mock_development` | `ielts_development` |
  | production  | `main`        | `ielts-production`  | api, web            | `ielts_mock`             | `ielts_production`  |

- Database: **satu cluster Managed PostgreSQL 18** `ielts-db` (laptop: 17;
  migrasi cocok untuk keduanya), region **Singapore (SGP1)**, dua database
  dengan user terpisah. User development tidak bisa membuka database
  production (dan sebaliknya).
- **Migrasi** otomatis sebelum setiap deploy (pre-deploy job
  `node dist/database/migrate.js`). Jika gagal, versi baru tidak live.
- **Seed demo**: hanya development (sekali, manual).
- **Admin hanya di development**, di balik **password sementara** (HTTP Basic
  Auth, `apps/admin/proxy.ts`), dan endpoint `/admin/*` API hanya aktif di
  `APP_ENV=local`/`development`. Production tanpa admin sampai login WorkOS ada.
- **API**: web & admin memanggilnya lewat jaringan privat (`http://api:4000`).
  Di development API juga terbuka di `/api` untuk `pnpm dev:remote`. Di
  production API **tidak publik**.

## Arsitektur

```
development (https://ielts-development-xxxxx.ondigitalocean.app)

  /        ──▶ web   (Next.js, 3000) ──┐
  /admin   ──▶ admin (Next.js, 3001) ──┤  http://api:4000 (privat)
               └─ password sementara   ▼
  /api     ──▶ api   (NestJS, 4000) ──SSL──▶ Managed PostgreSQL "ielts-db"
               └─ hanya development, untuk pnpm dev:remote

production (https://ielts-production-xxxxx.ondigitalocean.app)

  /        ──▶ web ──http://api:4000──▶ api (privat) ──SSL──▶ ielts-db
```

Urutan rule di `ingress` penting: prefix paling spesifik (`/api`, `/admin`)
ditulis sebelum `/`. `/api` dipotong (`/api/health` → `/health`); `/admin`
dipertahankan karena admin memakai `basePath: "/admin"`.

## File deploy di repo

| File                        | Fungsi                                                                 |
| --------------------------- | ---------------------------------------------------------------------- |
| `apps/api/Dockerfile`       | `turbo prune` → `pnpm install` → build → `pnpm deploy --prod`; `node dist/main`, user non-root. |
| `apps/web/Dockerfile`       | `turbo prune` → build Next.js `output: "standalone"`; `node apps/web/server.js` (port 3000). |
| `apps/admin/Dockerfile`     | sama seperti web; `node apps/admin/server.js` (port 3001).             |
| `.dockerignore`             | `.env*`, `node_modules`, `dist`, `.next`, `.turbo`, `.git` tidak ikut ke image. |
| `.do/development.yaml`      | app spec development (api, web, admin, job migrate, database).         |
| `.do/production.yaml`       | app spec production (api privat, web, job migrate, database).          |
| `apps/api/src/database/migrate.ts` / `seed.ts` | migrasi & seed demo dengan setelan SSL API.     |

### Rahasia di app spec
`DATABASE_URL` & `DATABASE_CA_CERT` diisi App Platform dari database yang
di-attach (`${db.DATABASE_URL}`, `${db.CA_CERT}`). Rahasia lain
(`ADMIN_API_KEY`, `ADMIN_BASIC_AUTH_PASSWORD`) bertipe `SECRET`:
- Di file repo tertulis `__NAMA__` (placeholder) sebelum app dibuat, atau
  `EV[...]` setelahnya. `EV[...]` adalah nilai terenkripsi yang hanya bisa
  dibuka oleh app itu, jadi aman di-commit.
- Saat membuat app, placeholder diganti nilai acak di **file sementara di luar
  repo**, lalu file itu dihapus (lihat Tahap 3).
- Password admin disimpan developer (password manager); tidak pernah ditulis di
  repo atau di chat.

## Langkah-langkah

### Tahap 0 — Siapkan kode ✅
Dockerfile api/web/admin, `.dockerignore`, app spec, script migrate & seed,
SSL database, pemisahan environment, password gate admin.

### Tahap 1 — Database ✅ (selesai 2026-10-26)
1. **Managed Databases → Create Database Cluster**: PostgreSQL **18**,
   **SGP1**, plan terkecil, nama **`ielts-db`** (harus sama dengan
   `cluster_name` di app spec).
2. **Users & Databases**: database `ielts_mock_development` & `ielts_mock`;
   user `ielts_development` & `ielts_production`.
3. Hak akses (sekali, `psql` sebagai `doadmin`, IP laptop sementara di
   Trusted Sources; **matikan VPN seperti Cloudflare WARP** karena IP-nya
   berganti-ganti):
   ```sql
   ALTER DATABASE ielts_mock_development OWNER TO ielts_development;
   ALTER DATABASE ielts_mock OWNER TO ielts_production;
   REVOKE CONNECT ON DATABASE ielts_mock_development FROM PUBLIC;
   REVOKE CONNECT ON DATABASE ielts_mock FROM PUBLIC;
   ```
   Hapus lagi IP laptop dari Trusted Sources setelahnya.

### Tahap 2 — GitHub & doctl ✅
- DigitalOcean GitHub app terpasang di akun `Modernsitechain` (akses repo `ielts`).
- `brew install doctl`, token API (DO → API → Generate New Token), `doctl auth init`.
- Kode yang akan di-deploy harus sudah di-push ke branch-nya (`/axl push`).

### Tahap 3 — Buat app development
Dari root repo (shell zsh/bash):
```bash
SPEC=$(mktemp)    # di luar repo
sed -e "s|__ADMIN_API_KEY__|$(openssl rand -hex 32)|g" \
    -e "s|__ADMIN_BASIC_AUTH_PASSWORD__|$(openssl rand -base64 24 | tr -d '=+/')|g" \
    .do/development.yaml > "$SPEC"
grep ADMIN_BASIC_AUTH_PASSWORD -A1 "$SPEC"   # catat password admin ke password manager
doctl apps create --spec "$SPEC"
rm "$SPEC"
```
Lalu:
1. **Wajib:** izinkan app mengakses database (app dari doctl **tidak**
   otomatis masuk Trusted Sources; tanpa ini job `migrate` gagal dengan
   `Connection terminated due to connection timeout`):
   ```bash
   doctl databases list            # ID cluster ielts-db
   doctl apps list                 # ID app
   doctl databases firewalls append <cluster-id> --rule app:<app-id>
   doctl apps create-deployment <app-id>
   ```
   (atau dashboard: `ielts-db` → **Network Access** → tambah **App**.)
2. Simpan versi terenkripsi rahasia ke repo: `doctl apps spec get <app-id>`,
   salin nilai `EV[...]` ke `.do/development.yaml` menggantikan placeholder,
   commit. Mulai saat itu `doctl apps update <app-id> --spec .do/development.yaml`
   aman dipakai. (✅ sudah dilakukan untuk `ielts-development`.)

Catatan: `EV[...]` hanya berlaku untuk app yang sudah ada.
`doctl apps spec validate` dan `doctl apps create` menolaknya ("secret env
value must not be encrypted before app is created"). Jika app perlu dibuat
ulang, ganti dulu nilai `EV[...]` di file sementara dengan nilai acak baru
(cara sama seperti di atas).

### Tahap 4 — Cek development
1. **Activity / Deployments**: build 3 image → job `migrate` ("Migrations
   applied.") → service `api`, `web`, `admin`.
2. `https://<url>/` → web; `/status` → semua "Operational".
3. `https://<url>/api/health` → `{"status":"ok","database":"up"}`.
4. `https://<url>/admin` → browser meminta username (`admin`) & password.
5. Seed demo (sekali): komponen `api` → **Console** →
   `node dist/database/seed.js` → "Seeded 2 demo tests."
6. Gagal? **Build Logs**, **Deploy Logs**, **Runtime Logs** per komponen, atau
   `doctl apps logs <app-id> <komponen> --type deploy`.

### Tahap 5 — Buat app production
1. Merge `development` → `main`, push `main`.
2. `doctl apps create --spec .do/production.yaml` (tanpa rahasia tambahan),
   lalu tambahkan app ke Trusted Sources seperti Tahap 3.
3. Cek seperti Tahap 4 tanpa `/api`, `/admin`, dan seed. `/tests` kosong.

## Setiap deploy berikutnya

- Push ke `development` → deploy otomatis ke development.
- Merge ke `main` + push → deploy otomatis ke production.
- Mengubah file spec → `doctl apps update <app-id> --spec .do/<env>.yaml`
  (setelah placeholder diganti `EV[...]`). Ubah spec selalu lewat file, bukan
  hanya di dashboard, supaya repo tidak tertinggal.

## Biaya

Per komponen service satu container `apps-s-1vcpu-0.5gb` (± US$5/bulan menurut
dokumentasi DO saat ini): development 3 (api, web, admin), production 2 (api,
web), plus job migrasi yang jalan sebentar setiap deploy dan satu cluster
database. Cek harga terbaru di situs DigitalOcean.

## Catatan & hal yang masih terbuka

- **Konten production**: admin tidak ada di production. Konten dibuat di admin
  development; cara memindahkannya ke production (export/import) atau admin
  production (setelah WorkOS) masih perlu diputuskan.
- Attempt masih disimpan di memori API: hilang setiap deploy/restart.
- Password admin & `/api` publik di development bersifat sementara; diganti
  login WorkOS (Fase 3).
- GitHub Actions: typecheck & test harus lolos sebelum deploy.
- Domain sendiri (boleh menyusul): app → Settings → Domains.
