# apps/web — Panduan struktur (main app peserta)

Next.js (App Router) + TypeScript strict + Tailwind. Frontend murni: semua
data nantinya lewat `apps/api`. Untuk sementara data berasal dari dummy data
di `core/datas` (lihat "Data & keamanan").

Konteks produk: `docs/project-brief.md`, `docs/ielts-domain.md`.

## Struktur folder

```
apps/web/
├── app/                  # HANYA routing Next.js
├── core/
│   ├── models/           # tipe data (model soal, tes, attempt)
│   ├── datas/            # dummy data (pengganti database)
│   └── services/         # satu-satunya pintu data untuk feature
├── feature/
│   └── <nama-feature>/
│       ├── pages/        # komponen halaman (di-re-export oleh app/)
│       ├── components/   # komponen khusus feature ini
│       └── actions.ts    # Server Actions feature ini (jika ada)
└── shared/
    ├── components/       # komponen yang dipakai lebih dari satu feature
    ├── layouts/          # kerangka halaman (SiteLayout, ExamLayout)
    └── utils/            # helper murni (formatter, label)
```

### `app/` — routing saja
- Isi file route hanya re-export halaman dari feature:
  ```tsx
  export { default } from "@/feature/catalog/pages/catalog-page";
  ```
- Boleh berisi config route Next.js (`export const dynamic = ...`),
  `layout.tsx` yang memanggil layout dari `shared/layouts`, dan `globals.css`.
- Jangan menulis UI, logika, atau pengambilan data di sini.
- Route group:
  - `(site)` — halaman umum dengan header & footer (`SiteLayout`)
  - `(exam)` — sesi ujian layar penuh tanpa header (`ExamLayout`)

### `core/models/` — tipe data
- `test.ts`: Test, Section, QuestionGroup, Question, GroupPayload
- `attempt.ts`: AttemptSession, AttemptSummary, AttemptResult
- `records.ts`: bentuk data versi "database" yang berisi kunci jawaban.
  **Hanya untuk `core/datas` dan `core/services`.**
- Hanya tipe, tanpa logika. Akan dipindah ke `packages/question-schema` (Zod).

### `core/datas/` — dummy data
- Satu file per tes (`reading-demo-1.ts`), daftar tes di `index.ts`.
- Konten soal harus orisinal, jangan menyalin dari buku Cambridge/IELTS.
- Hanya boleh di-import oleh `core/services`.

### `core/services/` — pintu data
- Nama file: `<domain>.service.ts` (contoh: `test.service.ts`).
- Fungsi selalu `async` dan mengembalikan tipe dari `core/models`, supaya
  nanti isinya tinggal diganti `fetch` ke `apps/api` tanpa mengubah feature.
- Tempat validasi input dari browser, penilaian, dan pengecekan waktu.
- Fungsi murni (misalnya `scoring.ts`) boleh di sini sampai dipindah ke
  `packages/question-schema`.

### `feature/<nama>/` — satu folder per fitur
Feature saat ini: `home`, `catalog`, `history`, `session` (sub: `reading`,
`listening`), `auth`.

- `pages/`: satu file per halaman, `export default`, nama `<nama>-page.tsx`.
  Biasanya Server Component yang mengambil data dari `core/services`.
- `components/`: komponen yang hanya dipakai feature ini.
- `actions.ts`: Server Actions (`"use server"`). Hanya memanggil
  `core/services`, lalu `redirect`/mengembalikan hasil.
- Feature dengan sub-bagian (contoh `session/reading`, `session/listening`)
  memakai struktur `pages/` + `components/` yang sama di tiap sub-bagian.

### `shared/`
- `components/`: dipakai oleh lebih dari satu feature. Komponen baru
  dimulai di feature-nya; dipindah ke sini saat feature kedua butuh.
- `layouts/`: kerangka halaman, dipanggil dari `app/**/layout.tsx`.
- `utils/`: fungsi murni tanpa akses data (format tanggal, label, dll).

## Aturan import

| Dari ↓ boleh import → | core/models | core/datas | core/services | feature | shared |
| --------------------- | ----------- | ---------- | ------------- | ------- | ------ |
| `app/`                | –           | ✗          | ✗             | pages saja | layouts |
| `feature/`            | ✓           | ✗          | ✓             | lihat bawah | ✓   |
| `shared/`             | ✓           | ✗          | ✗             | ✗       | ✓      |
| `core/services`       | ✓           | ✓          | ✓             | ✗       | ✗      |
| `core/datas`          | ✓           | ✓          | ✗             | ✗       | ✗      |

- Antar feature: hanya boleh import `actions.ts` feature lain (contoh:
  tombol "Mulai tes" di `catalog` memanggil `feature/session/actions.ts`).
  Jangan import `pages/` atau `components/` milik feature lain; jika perlu
  dipakai bersama, pindahkan ke `shared/components`.
- Pakai alias `@/` untuk import antar bagian (`core`, `feature/<nama>`,
  `shared`); relative import (`./`, `../`) hanya di dalam satu feature.

## Data & keamanan (wajib)

- Kunci jawaban (`answerKey`) tidak boleh sampai ke browser sebelum submit.
  Hanya `core/models/records.ts`, `core/datas`, dan `core/services` yang
  boleh menyentuhnya, dan file di `core/datas` & `core/services` wajib
  diawali `import "server-only";`.
- Data untuk halaman memakai tipe publik (`TestDetail`, `AttemptSession`),
  bukan `TestRecord`/`AttemptRecord`.
- Penilaian, batas waktu, dan validasi jawaban selalu di `core/services`
  (sisi server). Timer di browser hanya tampilan.
- Semua argumen Server Action dianggap tidak terpercaya.

## Konvensi

- Nama file & folder: kebab-case (`question-nav.tsx`, `test.service.ts`).
- Halaman: `export default`. Komponen lain: named export.
- `"use client"` hanya di komponen yang butuh state/event browser; halaman
  tetap Server Component.
- Styling dengan class Tailwind; teks UI berbahasa Indonesia, konten soal
  berbahasa Inggris.
- TypeScript strict: hindari `any`, tangani semua tipe soal di `switch`
  dengan cek `never`.

## Menambah feature baru

1. Buat `feature/<nama>/pages/<nama>-page.tsx` (+ `components/` bila perlu).
2. Butuh data baru? Tambah tipe di `core/models`, fungsi di
   `core/services/<domain>.service.ts`, dan dummy data di `core/datas`.
3. Buat route di `app/(site)/...` atau `app/(exam)/...` berisi re-export.
4. Jalankan `pnpm typecheck` dan `pnpm build` dari root repo.

## Perintah

Dari root repo: `pnpm dev`, `pnpm build`, `pnpm typecheck`.
Khusus app ini: `pnpm --filter @ielts-mock/web <script>`.
