# apps/api — Panduan struktur (backend NestJS)

NestJS 12 + TypeScript strict + PostgreSQL (Drizzle). Satu-satunya app yang
boleh mengakses database dan memegang logika bisnis: autentikasi (WorkOS),
otorisasi, penilaian, akses paket, pembayaran. `apps/web` & `apps/admin`
hanya memanggil API ini.

Konteks produk: `docs/project-brief.md`, `docs/ielts-domain.md`.

## Konsep NestJS singkat

- **Module**: satu folder fitur yang mengumpulkan controller & service-nya.
- **Controller**: menerima HTTP request (`@Get`, `@Post`), validasi input,
  memanggil service, mengembalikan response. Tanpa logika bisnis.
- **Service** (`@Injectable`): logika bisnis. Dipanggil controller.
- **Repository**: satu-satunya tempat query database untuk sebuah fitur.
- **Dependency injection**: kelas tidak membuat dependensinya sendiri;
  NestJS menyuntikkannya lewat constructor. Ini yang membuat test mudah
  (dependensi bisa diganti mock).

Alur request: `Controller → Service → Repository → Database`.

## Struktur folder

```
apps/api/
├── src/
│   ├── main.ts               # titik masuk: membuat app, listen di PORT
│   ├── app.module.ts         # module akar: mendaftarkan semua module
│   ├── config/
│   │   └── env.ts            # skema Zod semua env var; app gagal start jika tidak valid
│   ├── database/
│   │   └── database.module.ts  # koneksi PostgreSQL + Drizzle (global)
│   ├── common/               # dipakai lintas module: guard, filter, pipe, decorator
│   │   ├── guards/admin-key.guard.ts     # SEMENTARA: kunci admin sampai WorkOS
│   │   └── pipes/zod-validation.pipe.ts  # validasi body/params dengan Zod
│   └── modules/
│       ├── health/           # GET /health (cek database)
│       ├── tests/            # GET /tests, GET /tests/:id (hanya published, tanpa kunci jawaban)
│       │                     # + TestsRepository: satu-satunya query tabel konten tes
│       ├── admin-tests/      # /admin/tests: CRUD, publish, unpublish (untuk apps/admin)
│       ├── attempts/         # mulai, autosave, submit, hasil, riwayat
│       └── <fitur>/          # pola umum satu fitur:
│           ├── <fitur>.module.ts
│           ├── <fitur>.controller.ts
│           ├── <fitur>.service.ts
│           ├── <fitur>.repository.ts     # jika fitur menyentuh database
│           ├── dto/                      # skema input/output (Zod)
│           └── <fitur>.service.spec.ts   # unit test di sebelah kodenya
└── test/
    └── <fitur>.e2e-spec.ts   # e2e: menjalankan app utuh terhadap DB test
```

### Aturan per folder
- `modules/<fitur>/`: semua yang khusus satu fitur tinggal di sini. Module
  lain hanya memakai fitur ini lewat service yang di-`exports`.
- `common/`: hanya untuk kode yang dipakai ≥ 2 module (contoh nanti:
  `AuthGuard` WorkOS, `RolesGuard`, pipe validasi Zod).
- `tests.repository.ts` memakai **PostgreSQL** (Drizzle, skema di
  `packages/db`). `attempts.repository.ts` masih **in-memory** (`Map`, hilang
  saat restart) sampai tabel attempt dibuat.
- Satu repository untuk tabel konten tes (`TestsRepository`), dipakai module
  `tests`, `attempts`, dan `admin-tests` (di-`exports` oleh `TestsModule`).
  Method untuk peserta mengembalikan `TestRecord`; method admin mengembalikan
  `AdminTest`.
- Tipe publik (TestDetail, AttemptResult, dll.) dan fungsi penilaian murni
  berasal dari `@ielts-mock/question-schema`. Tipe yang memuat kunci jawaban
  (`TestRecord`) hanya ada di api dan tidak pernah dikembalikan controller.
- `database/`: koneksi saja. Skema tabel, migrasi, dan seed ada di
  `packages/db` (lihat `packages/db/AGENTS.md`).
- Import drizzle (`eq`, `asc`, `sql`, `drizzle`, …) **dari `@ielts-mock/db`**,
  jangan dari `drizzle-orm` langsung (app ini CommonJS; impor langsung memuat
  salinan drizzle kedua yang tipenya tidak cocok dengan skema).
- `config/`: setiap env var baru wajib ditambahkan ke `env.ts`. Baca nilainya
  lewat `ConfigService<Env, true>` dengan `{ infer: true }`, jangan langsung
  dari `process.env`.

## Aturan wajib

- **Query database hanya di repository.** Controller & service tidak menulis
  SQL/Drizzle query langsung.
- **Semua input dari luar divalidasi** (body, params, query) dengan Zod
  sebelum dipakai.
- **Hak akses dicek di API**, bukan di frontend: setiap endpoint non-publik
  wajib memakai guard auth + role. Sementara (sebelum WorkOS), `/admin/*`
  memakai `AdminKeyGuard`: header `x-admin-key` harus sama dengan
  `ADMIN_API_KEY`, dan hanya aktif jika `APP_ENV=local`.
- **Kunci jawaban tidak pernah dikirim** di response sebelum attempt di-submit.
  Pengecualian: endpoint `/admin/*` (untuk editor konten, dilindungi guard).
- **Tes draft tidak pernah dikembalikan** endpoint peserta (`/tests`,
  `/attempts`). Tes published read-only di admin; unpublish dulu untuk edit.
- **Waktu & penilaian dihitung di server**; jangan percaya skor, waktu,
  atau status dari client.
- Bahasa: kode, comment, pesan error, dan response dalam bahasa Inggris
  (British). Panduan ini tetap berbahasa Indonesia.

## Konvensi

- Nama file: `<fitur>.<peran>.ts` (`tests.controller.ts`, `tests.service.ts`).
- Nama route: kata benda jamak, kebab-case (`/tests`, `/attempts/:id/submit`).
- Import relatif (`./`, `../`), tanpa alias path.
- Unit test (`*.spec.ts`) di sebelah file yang dites; e2e di `test/`.
  Unit test me-mock dependensi; e2e memakai database `ielts_mock_test`.

## Menambah fitur baru

1. Buat `src/modules/<fitur>/` berisi module, controller, service
   (+ repository & dto bila perlu).
2. Daftarkan module di `src/app.module.ts`.
3. Tulis unit test untuk service (repository di-mock); e2e untuk alur
   endpoint utama.
4. Jalankan `pnpm typecheck`, `pnpm test`, dan `pnpm build` dari root.

## Environment & menjalankan

- Butuh **Node 24.9+** (lihat `.nvmrc`; jalankan `nvm use` di root repo).
  Jest butuh versi ini untuk memuat paket NestJS 12 yang berformat ESM.
- Salin `.env.example` ke `.env` (local, DB `ielts_mock`) dan `.env.test`
  (test, DB `ielts_mock_test`). Keduanya tidak di-commit.
- Tabel dibuat lewat migrasi dari root: `pnpm db:migrate` (+ `pnpm db:seed`
  untuk tes demo) dan `DB_ENV=test pnpm db:migrate` untuk database test (e2e).
- Environment (`APP_ENV`: local/development/staging/production), branch, dan
  semua env var dijelaskan di `docs/environments.md`. Nilai development &
  production disimpan di DigitalOcean, bukan di file.
- Perintah (dari folder ini): `pnpm dev` (watch, port 4000), `pnpm build`,
  `pnpm typecheck`, `pnpm test`, `pnpm test:e2e`.
- TypeScript 6 dipakai di app ini (sesuai template resmi NestJS 12), bukan
  TypeScript 7 seperti `apps/web`.
