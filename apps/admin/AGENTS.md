# apps/admin — Panduan struktur (app konten untuk admin/editor)

Next.js (App Router) + TypeScript strict + Tailwind v4. Frontend murni untuk
membuat dan mengelola tes. Semua data lewat endpoint `/admin/*` di `apps/api`;
admin tidak pernah mengakses database.

Konteks produk: `docs/project-brief.md`, `docs/ielts-domain.md`.
Backend: `apps/api/AGENTS.md`. Skema database: `packages/db/AGENTS.md`.

## Status sekarang (sementara)

- **Hanya untuk lokal.** Belum ada login. API dilindungi kunci bersama
  `ADMIN_API_KEY` (header `x-admin-key`), dan endpoint admin hanya aktif
  dengan `APP_ENV=local`. **Jangan deploy admin** sebelum WorkOS + role
  admin/editor terpasang (Fase 3).
- Hanya tes **Reading** yang bisa dibuat dan diedit. Tes Listening tampil
  read-only.
- Tipe soal: multiple choice (satu jawaban), True/False/Not Given,
  Yes/No/Not Given, matching headings, matching information, sentence
  completion, summary completion.
- Belum ada: upload gambar/audio, preview sebagai peserta, tipe soal lain,
  riwayat perubahan (audit).

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
├── app/                      # route: /, /tests/new, /tests/[testId] (re-export saja)
├── core/
│   ├── config/env.ts         # getEnv(): APP_ENV, API_URL, ADMIN_API_KEY (dibaca saat request pertama)
│   ├── models/test.ts        # re-export tipe admin + aturan bersama dari question-schema
│   └── services/             # api-client.ts (adminApi + x-admin-key), test.service.ts
├── feature/tests/
│   ├── pages/                # tests-page, new-test-page, test-editor-page
│   ├── components/           # test-editor → passage-editor → group-editor → question-editor
│   ├── editor-defaults.ts    # nilai awal, instruksi standar, helper list immutable
│   └── actions.ts            # Server Actions: create, save, publish, unpublish, delete
└── shared/                   # admin-layout, form (Field, TextInput, Button…), status-badge, format
```

## Aturan wajib

- `ADMIN_API_KEY` hanya dibaca di server (`core/config`, `core/services`).
  Jangan pernah mengirimnya ke browser atau memakai prefix `NEXT_PUBLIC_`.
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

1. Buat kunci: `openssl rand -hex 32`.
2. Isi kunci yang sama di `apps/api/.env` dan `apps/admin/.env.local`
   (salin dari `.env.example`) sebagai `ADMIN_API_KEY=...`.
3. Pastikan tabel sudah ada: `pnpm db:migrate` (dan `pnpm db:seed` untuk demo).
4. `pnpm dev` dari root → admin di http://localhost:3001.

Khusus app ini: `pnpm --filter @ielts-mock/admin <script>`.
