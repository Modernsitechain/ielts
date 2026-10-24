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
│   │   └── pipes/zod-validation.pipe.ts  # validasi body/params dengan Zod
│   └── modules/
│       ├── health/           # GET /health (cek database)
│       ├── tests/            # GET /tests, GET /tests/:id (tanpa kunci jawaban)
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
- Repository saat ini **in-memory** (`tests.repository.ts` membaca demo di
  `modules/tests/data/`, `attempts.repository.ts` menyimpan di `Map`, hilang
  saat restart). Di Fase 2 isinya diganti query Drizzle; method & signature
  tetap, jadi service & controller tidak berubah.
- Tipe publik (TestDetail, AttemptResult, dll.) dan fungsi penilaian murni
  berasal dari `@ielts-mock/question-schema`. Tipe yang memuat kunci jawaban
  (`TestRecord`) hanya ada di api dan tidak pernah dikembalikan controller.
- `database/`: koneksi saja. Skema tabel, migrasi, dan seed akan tinggal di
  `packages/db` (Fase 2) dan hanya boleh di-import oleh `apps/api`.
- `config/`: setiap env var baru wajib ditambahkan ke `env.ts`. Baca nilainya
  lewat `ConfigService<Env, true>` dengan `{ infer: true }`, jangan langsung
  dari `process.env`.

## Aturan wajib

- **Query database hanya di repository.** Controller & service tidak menulis
  SQL/Drizzle query langsung.
- **Semua input dari luar divalidasi** (body, params, query) dengan Zod
  sebelum dipakai.
- **Hak akses dicek di API**, bukan di frontend: setiap endpoint non-publik
  wajib memakai guard auth + role.
- **Kunci jawaban tidak pernah dikirim** di response sebelum attempt di-submit.
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
3. Tulis unit test untuk service; e2e untuk alur endpoint utama.
4. Jalankan `pnpm typecheck`, `pnpm test`, dan `pnpm build` dari root.

## Environment & menjalankan

- Butuh **Node 24.9+** (lihat `.nvmrc`; jalankan `nvm use` di root repo).
  Jest butuh versi ini untuk memuat paket NestJS 12 yang berformat ESM.
- Salin `.env.example` ke `.env` (development, DB `ielts_mock`) dan
  `.env.test` (test, DB `ielts_mock_test`). Keduanya tidak di-commit.
- Perintah (dari folder ini): `pnpm dev` (watch, port 4000), `pnpm build`,
  `pnpm typecheck`, `pnpm test`, `pnpm test:e2e`.
- TypeScript 6 dipakai di app ini (sesuai template resmi NestJS 12), bukan
  TypeScript 7 seperti `apps/web`.
