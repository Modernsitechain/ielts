# apps/web — Panduan struktur (main app peserta)

Next.js (App Router) + TypeScript strict + Tailwind. Frontend murni: semua
data diambil dari `apps/api` (NestJS). Web tidak pernah mengakses database
dan tidak pernah memegang kunci jawaban.

Konteks produk: `docs/project-brief.md`, `docs/ielts-domain.md`.
Backend: `apps/api/AGENTS.md`.

## Struktur folder

```
apps/web/
├── app/                  # HANYA routing Next.js
├── core/
│   ├── models/           # tipe data (re-export dari @ielts-mock/question-schema)
│   └── services/         # satu-satunya pintu data: memanggil apps/api
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
  `layout.tsx` yang memanggil layout dari `shared/layouts`, `error.tsx` yang
  me-re-export `shared/components/route-error`, dan `globals.css`.
- Jangan menulis UI, logika, atau pengambilan data di sini.
- Route group:
  - `(site)` — halaman umum dengan header & footer (`SiteLayout`)
  - `(exam)` — sesi ujian layar penuh tanpa header (`ExamLayout`)

### `core/models/` — tipe data
- `test.ts`, `attempt.ts`: re-export tipe dari `@ielts-mock/question-schema`
  (`packages/question-schema`), satu sumber kebenaran bersama `apps/api`.
  Tipe baru untuk soal/tes/attempt ditambahkan di package itu, bukan di sini.
- Tipe khusus web (misalnya `health.ts`) boleh ditulis langsung di sini.
- Hanya tipe, tanpa logika.

### `core/services/` — pintu data
- Nama file: `<domain>.service.ts` (contoh: `test.service.ts`). Fungsi selalu
  `async` dan mengembalikan tipe dari `core/models`.
- Semua panggilan ke `apps/api` lewat `api-client.ts`:
  - `apiJson<T>(path, { method, body })` — parse JSON; `null` untuk 404,
    `ApiError` untuk error lain.
  - `apiFetch(path, ...)` — jika butuh status HTTP mentah (contoh: autosave).
  - Base URL dari env `API_URL` (default `http://localhost:4000`).
- API hanya dipanggil dari server (Server Component/Action), tidak dari browser.
- Semua file diawali `import "server-only";`.
- Tidak ada logika bisnis di sini: waktu, validasi, dan penilaian dikerjakan
  `apps/api`. Services hanya meneruskan request & memetakan response.

### `feature/<nama>/` — satu folder per fitur
Feature saat ini: `home`, `catalog`, `history`, `status`, `session`
(sub: `reading`, `listening`), `auth`.

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

| Dari ↓ boleh import → | core/models | core/services | feature | shared |
| --------------------- | ----------- | ------------- | ------- | ------ |
| `app/`                | –           | ✗             | pages saja | layouts, route-error |
| `feature/`            | ✓           | ✓             | lihat bawah | ✓   |
| `shared/`             | ✓           | ✗             | ✗       | ✓      |
| `core/services`       | ✓           | ✓             | ✗       | ✗      |

- Antar feature: hanya boleh import `actions.ts` feature lain (contoh:
  tombol "Start test" di `catalog` memanggil `feature/session/actions.ts`).
  Jangan import `pages/` atau `components/` milik feature lain; jika perlu
  dipakai bersama, pindahkan ke `shared/components`.
- Pakai alias `@/` untuk import antar bagian (`core`, `feature/<nama>`,
  `shared`); relative import (`./`, `../`) hanya di dalam satu feature.
- `@ielts-mock/question-schema` di-import lewat `core/models`, bukan langsung
  dari feature.

## Data & keamanan (wajib)

- Web tidak pernah menerima kunci jawaban sebelum submit; API yang menjamin.
  Jangan menambah endpoint/tipe yang mengirim `answerKey` ke web.
- Penilaian, batas waktu, dan validasi jawaban selalu di `apps/api`. Timer di
  browser hanya tampilan.
- Semua argumen Server Action dianggap tidak terpercaya (API memvalidasinya
  lagi dengan Zod).

## Konvensi

- Nama file & folder: kebab-case (`question-nav.tsx`, `test.service.ts`).
- Halaman: `export default`. Komponen lain: named export.
- `"use client"` hanya di komponen yang butuh state/event browser; halaman
  tetap Server Component.
- TypeScript strict: hindari `any`, tangani semua tipe soal di `switch`
  dengan cek `never`.
- Styling dengan class Tailwind (v4). Font: Geist (`next/font`).
- Icon: hanya `lucide-react`. Icon dekoratif diberi `aria-hidden`; tombol
  yang hanya berisi icon wajib punya `aria-label`.
- `SiteLayout` tidak membatasi lebar; setiap halaman mengatur container-nya
  sendiri (`mx-auto max-w-5xl px-4 py-10`), supaya landing page bisa full-width.
- Aksen AI (gradient indigo → violet → fuchsia, icon `Sparkles`) hanya untuk
  halaman marketing. Halaman ujian tetap netral & semirip mungkin dengan
  IELTS on computer. Fitur AI yang belum ada wajib diberi label "Coming soon".

## Bahasa (wajib)

- Semua yang ada di dalam aplikasi ditulis dalam **bahasa Inggris**: teks UI,
  pesan error, metadata, konten soal, nama variabel, dan comment kode.
- Pakai ejaan British (practise, modelled, catalogue) agar konsisten dengan
  IELTS. Format tanggal `en-GB`, zona waktu `Asia/Jakarta`.
- Diskusi dan prompt dengan developer boleh berbahasa Indonesia; itu tidak
  mengubah bahasa aplikasi.
- Dokumen di `docs/` dan file panduan ini tetap berbahasa Indonesia.

## Menambah feature baru

1. Buat `feature/<nama>/pages/<nama>-page.tsx` (+ `components/` bila perlu).
2. Butuh data baru? Pastikan endpoint-nya ada di `apps/api`, tambah tipe di
   `packages/question-schema` (re-export di `core/models`), lalu fungsi di
   `core/services/<domain>.service.ts`.
3. Buat route di `app/(site)/...` atau `app/(exam)/...` berisi re-export.
4. Jalankan `pnpm typecheck` dan `pnpm build` dari root repo.

## Perintah

Dari root repo: `pnpm dev` (web + api + package), `pnpm build`, `pnpm typecheck`,
`pnpm test`. Butuh Node 24.9+ (`nvm use` di root repo). Cek koneksi ke API &
database di halaman `/status`.
Khusus app ini: `pnpm --filter @ielts-mock/web <script>`.
