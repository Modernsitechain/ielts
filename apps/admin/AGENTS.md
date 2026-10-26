# apps/admin — Panduan struktur (app konten untuk admin/editor)

Next.js (App Router) + TypeScript strict + Tailwind v4. Frontend murni untuk
membuat dan mengelola tes. Semua data lewat endpoint `/admin/*` di `apps/api`;
admin tidak pernah mengakses database.

Konteks produk: `docs/project-brief.md`, `docs/ielts-domain.md`.
Backend: `apps/api/AGENTS.md`. Skema database: `packages/db/AGENTS.md`.

## Status sekarang

- **Login WorkOS** (sama dengan web, akun yang sama). Hanya role `editor` dan
  `admin` yang bisa memakai admin; user lain melihat halaman "No access"
  (`AccessGate`). Pengecekan sebenarnya di API: `/admin/*` wajib token dengan
  role `editor`/`admin`, publish/unpublish khusus `admin`.
- Memberi role: user login sekali (di web atau admin), lalu
  `pnpm db:set-role <email> admin|editor` (lokal) atau
  `node dist/database/set-role.js <email> <role>` di console komponen api.
- Admin memakai `basePath: "/admin"`: semua URL diawali `/admin`, juga di
  lokal (http://localhost:3001/admin; `/` dialihkan ke sana). Di server admin
  berbagi domain dengan web (`<url>/admin`). `next/link` dan `redirect()`
  menambahkan `/admin` otomatis; jangan menulis `/admin` sendiri di `href`.
- Hanya tes **Reading** yang bisa dibuat dan diedit. Tes Listening tampil
  read-only.
- Tipe soal: multiple choice (satu jawaban), True/False/Not Given,
  Yes/No/Not Given, matching headings, matching information, sentence
  completion, summary completion.
- Belum ada: upload gambar/audio, preview sebagai peserta, tipe soal lain,
  riwayat perubahan (audit).

## Layout

- `AdminLayout`: sidebar kiri (brand, menu, akun di bawah) di layar besar;
  di layar kecil menjadi bar atas dengan menu horizontal.
- Menu ada di `shared/components/sidebar-nav.tsx` (`MAIN`). Menu "Coming
  soon" (Users & roles, Media library, Payments) hanya penanda; pindahkan ke
  `MAIN` saat halamannya dibuat.
- Halaman memakai container `mx-auto max-w-6xl px-4 py-8 lg:px-8`.
- User tanpa akses melihat "No access" tanpa sidebar (`AccessGate` membungkus
  layout).

## Alur konten

1. **New Reading test** → tes dibuat sebagai draft (`POST /admin/tests`).
2. Editor: passage (maks. 3) → paragraf (label A, B, C… opsional) → group
   soal (satu tipe + instruksi) → soal (teks, opsi, jawaban benar).
3. **Save** mengirim seluruh isi tes sekaligus (`PUT /admin/tests/:id`).
   Nomor soal 1–40 dihitung API dari urutan.
4. Panel **Ready to publish?** menjalankan `checkPublishReadiness` dari
   `@ielts-mock/question-schema`, aturan yang sama dengan yang dicek API saat
   publish.
5. **Publish** → tes muncul di katalog peserta. Tes yang sudah publish
   read-only; **Unpublish** dulu untuk mengedit. Hanya draft yang bisa dihapus.

## Struktur folder

Sama dengan `apps/web` (lihat `apps/web/AGENTS.md`): `app/` hanya routing,
`core/` (config, models, services), `feature/`, `shared/`.

```
apps/admin/
├── proxy.ts                  # sesi WorkOS: semua halaman wajib login (kecuali /callback)
├── app/                      # route: / (dashboard), /tests, /tests/new, /tests/[testId], /callback
├── core/
│   ├── config/env.ts         # getEnv(): APP_ENV, API_URL, variabel WorkOS (dibaca saat request pertama)
│   ├── models/               # test.ts (tipe admin), user.ts (CurrentUser, ADMIN_APP_ROLES)
│   └── services/             # api-client.ts (token WorkOS), test.service.ts, user.service.ts (GET /me)
├── feature/auth/             # AccessGate, AccountMenu, signOutAction, route /callback
├── feature/dashboard/        # dashboard: ringkasan tes (stat card, terbaru, per skill)
├── feature/tests/
│   ├── pages/                # tests-page, new-test-page, test-editor-page
│   ├── components/           # test-editor → passage-editor → group-editor → question-editor
│   ├── editor-defaults.ts    # nilai awal, instruksi standar, helper list immutable
│   └── actions.ts            # Server Actions: create, save, publish, unpublish, delete
└── shared/                   # admin-layout (sidebar), sidebar-nav, form, status-badge, format
```

## Aturan wajib

- Login: `@workos-inc/authkit-nextjs` (public client, **tanpa
  `WORKOS_API_KEY`**). Cookie sesi admin wajib bernama beda dari web
  (`WORKOS_COOKIE_NAME=wos-admin-session`) karena keduanya satu domain saat
  di-deploy. Path di `proxy.ts` ditulis tanpa `/admin`; matcher memuat `"/"`
  tersendiri agar `/admin` tercakup.
- `app/layout.tsx` boleh memakai `feature/auth/components` (`AccessGate`,
  `AccountMenu`): pengecualian aturan "app hanya re-export".
- Tipe admin (`AdminTest`, …) memuat kunci jawaban, jadi hanya untuk app ini.
- Validasi di form hanya untuk kenyamanan. API memvalidasi ulang semuanya
  dengan Zod dan menolak publish yang belum lengkap.
- Menambah tipe soal: tambahkan di `packages/question-schema` dulu (skema Zod,
  penilaian, `checkPublishReadiness`). Lalu kompiler menunjukkan `switch` yang
  perlu diperbarui di admin (`editor-defaults.ts`, `question-editor.tsx`) dan
  web (`question-group-view.tsx`). Tambahkan juga ke `READING_TYPES`.
- Komponen form di `shared/components/form.tsx`: lebar default `w-full`.
  Jika memberi `className`, sertakan lebarnya sendiri (misalnya `w-16 shrink-0`),
  supaya tidak ada dua class width yang konflik.
- Konvensi lain (Tailwind v4, lucide-react, bahasa Inggris British, `en-GB`,
  `Asia/Jakarta`, kebab-case) sama dengan `apps/web/AGENTS.md`.

## Menjalankan

1. Salin `.env.example` ke `.env.local`, isi `WORKOS_CLIENT_ID` (Staging) dan
   `WORKOS_COOKIE_PASSWORD` (`openssl rand -base64 32`, beda dari web).
2. Pastikan tabel sudah ada: `pnpm db:migrate` (dan `pnpm db:seed` untuk demo).
3. `pnpm dev` dari root → admin di http://localhost:3001/admin → login.
4. Jika muncul "No access": `pnpm db:set-role <email> admin`, lalu muat ulang.

Deploy (development): `apps/admin/Dockerfile` + `.do/development.yaml`, lihat
`docs/deployment.md`.

Khusus app ini: `pnpm --filter @ielts-mock/admin <script>`.
