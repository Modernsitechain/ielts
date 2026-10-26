# apps/web — Panduan struktur (main app peserta)

Next.js (App Router) + TypeScript strict + Tailwind. Frontend murni: semua
data diambil dari `apps/api` (NestJS). Web tidak pernah mengakses database
dan tidak pernah memegang kunci jawaban.

Konteks produk: `docs/project-brief.md`, `docs/ielts-domain.md`.
Backend: `apps/api/AGENTS.md`.

## Struktur folder

```
apps/web/
├── proxy.ts              # sesi WorkOS: refresh token, halaman privat wajib login
├── app/                  # HANYA routing Next.js
├── core/
│   ├── config/           # env.ts: validasi environment variable (Zod)
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

### `core/config/` — environment variable
- `env.ts` memvalidasi semua env var server (Zod) dan mengekspor `env`.
  Baca env lewat `env`, jangan langsung dari `process.env`.
- `auth.ts`: variabel WorkOS (`getAuthEnv()`, `getAppOrigin()`), dicek saat
  request pertama (bukan saat build). Library AuthKit membacanya sendiri dari
  `process.env`.
- Menambah variabel: ikuti langkah di `docs/environments.md`.

### `core/models/` — tipe data
- `test.ts`, `attempt.ts`: re-export tipe dari `@ielts-mock/question-schema`
  (`packages/question-schema`), satu sumber kebenaran bersama `apps/api`.
  Tipe baru untuk soal/tes/attempt ditambahkan di package itu, bukan di sini.
- Tipe khusus web (misalnya `health.ts`) boleh ditulis langsung di sini.
- Hanya tipe (plus konstanta bersama seperti `FIXED_CHOICES`), tanpa logika.

### `core/services/` — pintu data
- Nama file: `<domain>.service.ts` (contoh: `test.service.ts`). Fungsi selalu
  `async` dan mengembalikan tipe dari `core/models`.
- Semua panggilan ke `apps/api` lewat `api-client.ts`:
  - `apiJson<T>(path, { method, body })` — parse JSON; `null` untuk 404,
    `ApiError` untuk error lain.
  - `apiFetch(path, ...)` — jika butuh status HTTP mentah (contoh: autosave).
  - Base URL dari `env.API_URL` (default `http://localhost:4000` hanya untuk
    `APP_ENV=local`).
- API hanya dipanggil dari server (Server Component/Action), tidak dari browser.
- Jika user login, `api-client.ts` otomatis mengirim access token WorkOS
  (`Authorization: Bearer …`). Cek login di feature lewat
  `auth.service.ts` (`getSignedInUser()`), jangan memanggil `withAuth` langsung.
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

## Login (WorkOS AuthKit)

- `@workos-inc/authkit-nextjs`, mode public client (PKCE): web hanya butuh
  `WORKOS_CLIENT_ID`, `WORKOS_COOKIE_PASSWORD`,
  `NEXT_PUBLIC_WORKOS_REDIRECT_URI`. **Tidak ada `WORKOS_API_KEY` di web.**
- `proxy.ts`: semua halaman wajib login **kecuali** yang ada di
  `PUBLIC_PATHS` (`/`, `/tests`, `/tests/*`, `/status`, `/sign-in`,
  `/callback`). Halaman publik baru wajib ditambahkan ke daftar itu.
- Route: `/sign-in?returnTo=/path` (mulai login; tautkan dengan `<a>`, bukan
  `next/link`), `/callback` (WorkOS mengembalikan user ke sini). Sign out:
  `signOutAction` di `feature/auth/actions.ts`.
- Hak akses tetap dicek API: tanpa token, `/attempts` menjawab 401, dan
  attempt milik user lain menjawab 404.
- `NEXT_PUBLIC_WORKOS_REDIRECT_URI` di-inline Next.js saat build, jadi image
  Docker menerimanya sebagai build arg (lihat `Dockerfile`).

## Highlight & catatan (sesi Reading)

- Kode: `feature/session/reading/annotations/`.
  - `HighlightableText`: teks yang bisa di-highlight. Elemennya punya
    `data-block-id` dan **hanya boleh berisi teks itu** (plus ikon SVG tanpa
    teks), karena posisi seleksi dihitung dari isi teksnya (`selection.ts`).
  - `ContextMenu`: **hanya lewat klik kanan** (memilih teks tidak memunculkan
    apa pun). Klik kanan pada teks terpilih → Highlight, Add note, Remove
    highlight (jika mengenai highlight: menghapus **seluruh** highlight yang
    terkena, walaupun yang dipilih hanya sebagian). Klik kanan pada highlight → Add/Edit
    note, Remove highlight. Di tempat lain menu bawaan browser tetap muncul.
  - `NoteEditor`, `NotesPanel` (catatan juga dibuka dari panel ini), konteks
    `AnnotationsProvider`.
- Logika gabung/potong highlight ada di `@ielts-mock/question-schema`
  (`annotation.ts`), di-import lewat `core/models/annotation.ts`.
- Teks baru yang ingin bisa di-highlight: bungkus dengan `HighlightableText`
  dan tambahkan bloknya di `textBlocks()` (API menolak blok yang tidak dikenal).
- Disimpan otomatis ke API (`PUT /attempts/:id/annotations`), 0,8 detik setelah
  perubahan terakhir, sama seperti jawaban.

## Pengaturan tampilan ujian

- `feature/session/reading/settings/`: tombol **Settings** di header ujian.
  - Ukuran teks Standard / Large / Extra large: CSS `zoom` pada isi passage dan
    soal (`TEXT_SIZE_ZOOM`). Jangan menambah kompensasi lebar: di Chrome versi
    sekarang persen tidak ikut dikalikan zoom.
  - Warna: Black on white, White on black, Yellow on black. Root sesi memberi
    `data-contrast`; `app/globals.css` memetakan ulang variabel warna Tailwind
    (`--color-slate-*`, `--color-white`, …). Warna baru di halaman ujian harus
    memakai warna yang dipetakan di sana, atau ditambahkan ke daftar itu.
  - Disimpan per browser (`localStorage`, lewat `useSyncExternalStore`), bukan
    di server.

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

## Tailwind CSS v4 (wajib)

Project ini memakai **Tailwind CSS v4** (lihat `package.json`). Tulis class
dengan nama & sintaks v4, dan targetkan **nol warning** dari Tailwind CSS
IntelliSense di editor.

- Konfigurasi ada di CSS (`app/globals.css`): token lewat `@theme`, utility
  custom lewat `@utility`. Tidak ada `tailwind.config.js`.
- Nama yang berubah dari v3 — selalu pakai kolom kanan:

  | v3 (jangan dipakai)               | v4                              |
  | --------------------------------- | ------------------------------- |
  | `bg-gradient-to-r`                | `bg-linear-to-r`                |
  | `shadow-sm` / `shadow` (ukuran v3) | `shadow-xs` / `shadow-sm`       |
  | `rounded-sm` / `rounded`          | `rounded-xs` / `rounded-sm`     |
  | `blur`, `backdrop-blur` (tanpa ukuran) | `blur-sm`, `backdrop-blur-sm` |
  | `outline-none`                    | `outline-hidden`                |
  | `ring` (3px)                      | `ring-3` (`ring` di v4 = 1px)   |
  | `flex-shrink-0`, `flex-grow`      | `shrink-0`, `grow`              |
  | `bg-opacity-50`, `text-opacity-*` | modifier slash: `bg-black/50`   |
  | `!font-bold` (important di depan) | `font-bold!` (di belakang)      |

  `shadow-sm` & `rounded-sm` tetap valid di v4, tapi ukurannya mengikuti
  skala v4 — pilih berdasarkan tampilan, bukan kebiasaan v3.
- **Tidak boleh ada dua class yang mengatur properti CSS yang sama** pada
  satu elemen (warning `cssConflict`). Contoh: `border-slate-200` dan
  `divide-slate-200` sama-sama mengatur `border-color` → taruh `border` di
  elemen pembungkus dan `divide-*` di list-nya.
- Utamakan skala bawaan daripada arbitrary value: `rounded-4xl` bukan
  `rounded-[2rem]`, `w-160` bukan `w-[40rem]`, `h-4.5` bukan `h-[18px]`.
  Arbitrary value (`text-[15px]`) hanya jika tidak ada padanannya.
- Variant v4 yang boleh dipakai: `has-checked:`, `not-*:`, `inert:`, dll.;
  ukuran shadow `shadow-xs`; gradient `bg-linear-*`, `bg-radial`, `bg-conic`.

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
4. Jalankan `pnpm lint`, `pnpm typecheck`, dan `pnpm build` dari root repo
   (CI menjalankan semuanya, lihat `docs/ci.md`).

## Perintah

Dari root repo: `pnpm dev` (web + api + package), `pnpm build`, `pnpm lint`, `pnpm typecheck`,
`pnpm test`. Butuh Node 24.9+ (`nvm use` di root repo). Cek koneksi ke API &
database di halaman `/status`.
Khusus app ini: `pnpm --filter @ielts-mock/web <script>`.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
