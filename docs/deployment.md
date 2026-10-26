# Rencana Deploy ke DigitalOcean (Docker)

Status: **rencana, belum dikerjakan** (disusun 2026-10-24). Lanjutkan dari
"Keputusan yang masih terbuka" di bawah.

## Keputusan yang sudah diambil

- Frontend (`apps/web`, nanti `apps/admin`) dan backend (`apps/api`)
  di-deploy ke **DigitalOcean**. **Tidak memakai Vercel.**
- Setiap app dikemas sebagai **image Docker**.
- Database: **DigitalOcean Managed PostgreSQL** (backup, update, dan SSL
  diurus DO), region **Singapore (SGP1)**.

## Konteks penting

- API saat ini **belum menyimpan data ke database**: tes & attempt masih
  in-memory, hilang setiap restart/deploy ulang. Database baru dipakai untuk
  `GET /health`. Tabel dibuat di Fase 2.
- Jadi deploy sekarang = **staging / latihan pipeline**: membuktikan jalur
  kode → image → server → database jalan, supaya setelah Fase 2 tinggal deploy.
- API belum punya auth (Fase 3, WorkOS). Karena web hanya memanggil API dari
  server (Server Component/Action), **API tidak perlu dibuka ke publik**:
  cukup bisa diakses web lewat jaringan internal.
- Di Mac developer belum ada Docker. Build image pertama bisa langsung di
  DigitalOcean; untuk tes lokal perlu Docker Desktop atau OrbStack.

## Arsitektur target

```
Internet ──HTTPS──▶ web (Next.js, container, port 3000)
                        │  HTTP internal (API_URL)
                        ▼
                    api (NestJS, container, port 4000) — tidak publik
                        │  SSL
                        ▼
                    Managed PostgreSQL (SGP1)
```

`apps/admin` nanti ditambahkan sebagai container ketiga dengan pola yang
sama seperti web, **setelah login WorkOS ada**. Sebelum itu admin hanya
dipakai di laptop (endpoint `/admin/*` mati jika `APP_ENV` bukan `local`).

## Pilihan tempat menjalankan container

|             | **App Platform** (rekomendasi)                                | Droplet + Docker Compose                                          |
| ----------- | ------------------------------------------------------------- | ----------------------------------------------------------------- |
| Apa itu     | PaaS: DO build & jalankan Dockerfile dari GitHub              | VPS Linux; container dijalankan sendiri dengan `docker compose`   |
| Yang diurus | Hampir tidak ada: HTTPS, restart, deploy otomatis tiap push   | Instal Docker, reverse proxy + SSL (Caddy/Nginx), firewall, update OS, script deploy |
| Web ↔ API   | Satu App berisi 2 komponen; API bisa dibuat internal-only     | Satu jaringan Docker; API tidak di-expose ke host                 |
| Cocok untuk | Bukan orang backend/ops                                       | Mau belajar ops atau menekan biaya                                |

Karena keduanya memakai Dockerfile yang sama, pindah dari satu ke yang lain
nanti tidak perlu mengubah kode. Cek harga terbaru di situs DigitalOcean.

## Langkah-langkah

### Tahap 0 — Siapkan kode (dikerjakan Claude)
1. `apps/api/Dockerfile`: multi-stage, `turbo prune @ielts-mock/api --docker`,
   Node 24, pnpm 12 via Corepack; image akhir hanya berisi `dist` +
   dependency produksi, jalan sebagai user non-root.
2. `apps/web/Dockerfile`: sama, dengan `turbo prune @ielts-mock/web`, dan
   `output: "standalone"` di `apps/web/next.config.ts` agar image kecil.
   `API_URL` dibaca saat runtime (bukan saat build), jadi satu image bisa
   dipakai di staging maupun production.
3. `.dockerignore` di root (tanpa `node_modules`, `.env*`, `dist`, `.next`,
   `.turbo`).
4. ✅ Dukungan SSL database (selesai 2026-10-24): `DATABASE_CA_CERT` di
   `apps/api/src/config/env.ts`, logika di `src/database/pool-config.ts`.
5. ✅ Pemisahan environment (selesai 2026-10-24): `APP_ENV`, template
   `.env.<environment>.example`, validasi env web. Lihat `docs/environments.md`.
6. (Opsional, untuk Droplet atau tes lokal) `docker-compose.yml`.
7. Uji build image di lokal jika Docker tersedia.

### Tahap 1 — Database (developer, lewat dashboard DO)
1. Buat **Managed PostgreSQL** versi 17, region **SGP1**.
2. Buat database `ielts_mock`.
3. Simpan **connection string** dan unduh **CA certificate**. Jangan
   ditempel ke chat atau di-commit.

### Tahap 2a — App Platform (jika dipilih; developer, dipandu Claude)
1. **Create App** → GitHub → repo `Modernsitechain/ielts`, branch `main`,
   region SGP1.
2. Komponen **api** (Dockerfile `apps/api/Dockerfile`):
   - port `4000`, health check `/health`
   - tanpa route publik (internal saja)
   - env: `NODE_ENV=production`, `PORT=4000`, `DATABASE_URL` (Encrypt),
     `DATABASE_CA_CERT` (Encrypt)
3. Komponen **web** (Dockerfile `apps/web/Dockerfile`):
   - port `3000`, route publik `/`
   - env: `API_URL` = URL internal komponen api (App Platform menyediakan
     variabel URL privat antar-komponen; cek nama tepatnya di dokumentasi DO)
4. Database → **Trusted Sources**: tambahkan App ini.
5. Deploy; pantau **Build Logs** & **Runtime Logs** tiap komponen.

### Tahap 2b — Droplet (jika dipilih)
1. Buat Droplet Ubuntu LTS di SGP1, login dengan SSH key (bukan password).
2. Instal Docker; aktifkan firewall (hanya port 22, 80, 443).
3. `docker compose` menjalankan web, api, dan reverse proxy (Caddy, HTTPS
   otomatis). API hanya di jaringan internal compose.
4. Database → **Trusted Sources**: tambahkan Droplet ini.
5. Deploy: GitHub Actions build image → push ke DigitalOcean Container
   Registry → Droplet menarik image baru & restart.

### Tahap 3 — Verifikasi
- Buka web → halaman `/status`: Web, API, dan Database harus "Operational".
- Katalog `/tests` tampil, mulai & submit tes berjalan.
- Opsional: domain sendiri (`domainanda.com`) lewat DNS; HTTPS otomatis.

### Tahap 4 — Setelahnya
- GitHub Actions: typecheck & test harus lolos sebelum deploy (guardrail Fase 1).
- **Migrasi database sudah ada** (`packages/db/drizzle/`), jadi deploy pertama
  wajib menjalankan `pnpm db:migrate` (dan `pnpm db:seed` jika ingin tes
  demo) ke database production sebelum API dipakai. Selanjutnya migrasi
  dijalankan sebelum versi baru API aktif (App Platform: **pre-deploy job**;
  Droplet: langkah di script deploy). Masih perlu diputuskan: menjalankan
  migrasi dari container api (butuh drizzle-kit atau `migrate()` dari
  drizzle-orm dengan CA database) atau dari GitHub Actions.
- Tambahkan `apps/admin` sebagai container ketiga (Fase 3).
- Pasang auth (Fase 3) sebelum app dibuka untuk umum.

## Environment

Deploy pertama hanya **production** (branch `main`). Environment
**development** (branch `development`) dibuat setelah aba-aba developer,
dengan langkah yang sama tapi app & database terpisah (database
`ielts_mock_development`). Variabel per environment: `docs/environments.md`.

## Keputusan yang masih terbuka

1. **App Platform atau Droplet?** Rekomendasi: App Platform.
2. **Mulai Tahap 0?** Jika ya, Claude membuat Dockerfile web & api,
   `.dockerignore`, `output: "standalone"`, dan dukungan SSL database, lalu
   developer mengikuti Tahap 1–3.
3. **Domain** yang akan dipakai (boleh menyusul).
