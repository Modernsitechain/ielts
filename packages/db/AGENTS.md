# packages/db — Panduan (skema database, migrasi, seed)

Skema Drizzle untuk PostgreSQL, file migrasi, dan seed data demo.
**Hanya boleh di-import oleh `apps/api`.** `apps/web` dan `apps/admin` tidak
pernah menyentuh database.

## Isi

```
packages/db/
├── drizzle.config.ts     # konfigurasi drizzle-kit (generate / migrate / studio)
├── drizzle/              # file migrasi SQL hasil generate — DI-COMMIT, jangan diedit manual
└── src/
    ├── schema.ts         # tabel, enum, constraint, relations
    ├── content.ts        # tipe pohon konten + flattenContent (pohon → baris)
    ├── demo.ts           # seedDemoTests(db): dipakai pnpm db:seed & image API
    ├── users.ts          # setUserRole(db, email, role): dipakai pnpm db:set-role & image API
    ├── set-role.ts       # pnpm db:set-role <email> <role> (laptop)
    ├── migrations.ts     # MIGRATIONS_FOLDER: lokasi drizzle/ (repo & image)
    ├── load-env.ts       # membaca DATABASE_URL untuk script seed lokal
    ├── seed.ts           # pnpm db:seed (laptop)
    ├── seed-data/        # tes demo (konten orisinal)
    └── index.ts          # export publik untuk apps/api
```

## Tabel (konten tes)

```
tests ──< sections ──< question_groups ──< questions
```

| Tabel             | Isi penting                                                                 |
| ----------------- | --------------------------------------------------------------------------- |
| `tests`           | `title`, `skill` (enum), `module`, `status` (`draft`/`published`), `is_free`, `duration_minutes` (CHECK > 0), `published_at` |
| `sections`        | satu passage (Reading) / part (Listening): `position`, `kind`, `title`, `paragraphs` (JSONB), `audio_url` |
| `question_groups` | satu tipe soal + instruksi bersama: `position`, `instructions`, `payload` (JSONB, divalidasi Zod) |
| `questions`       | `position`, `number` (1–40 global, diisi API), `prompt`, `options` (JSONB), `answers` (JSONB) |

Alasan desain:
- **Foreign key + `ON DELETE CASCADE`**: menghapus tes otomatis menghapus
  section, group, dan soal di bawahnya.
- **`UNIQUE (parent_id, position)`**: urutan dalam satu induk tidak boleh kembar.
- **JSONB** untuk data yang bentuknya berbeda per tipe soal (`payload`,
  `options`, `answers`) atau selalu dibaca utuh (`paragraphs`). Bentuknya
  dijaga skema Zod di `@ielts-mock/question-schema` sebelum disimpan.
- **Kolom biasa** untuk data yang difilter atau diurutkan (`status`,
  `position`, `number`).
- **Enum PostgreSQL** (`skill`, `test_status`, `section_kind`) untuk nilai
  yang tetap. Menambah nilai enum = migrasi baru.
- **ID bertipe `text`**: tes demo memakai id yang mudah dibaca
  (`reading-demo-1`); baris baru dari API memakai UUID.
- `questions.answers` adalah kunci jawaban: API tidak pernah mengirimnya ke
  peserta sebelum submit.

## Tabel `users`

| Kolom            | Isi                                                                 |
| ---------------- | ------------------------------------------------------------------- |
| `id`             | UUID (dibuat PostgreSQL)                                            |
| `workos_user_id` | id user WorkOS (`user_01…`, claim `sub` di access token), UNIQUE    |
| `email`, `name`  | dari profil WorkOS saat user pertama kali login                     |
| `role`           | enum `user_role`: `student` (default), `editor`, `admin`            |

Identitas (siapa user ini) dari WorkOS; **role milik kita** dan dicek di API.
Baris dibuat otomatis oleh API saat request pertama user yang login. Nilai enum
role berasal dari `USER_ROLES` di `@ielts-mock/question-schema`.

Belum ada tabel `attempts`, `purchases`, dll. Attempt masih disimpan di memori
`apps/api`.

## Perintah (dari root repo)

| Perintah                     | Fungsi                                                        |
| ---------------------------- | ------------------------------------------------------------- |
| `pnpm db:generate --name x`  | membuat file migrasi baru dari perubahan `schema.ts`          |
| `pnpm db:migrate`            | menjalankan migrasi yang belum jalan ke database `ielts_mock` |
| `pnpm db:seed`               | memasukkan ulang tes demo (tes buatan admin tidak disentuh)   |
| `pnpm db:set-role <email> <role>` | memberi role ke user yang sudah pernah login (misalnya admin pertama) |
| `pnpm db:studio`             | membuka Drizzle Studio (lihat isi tabel di browser)           |

Database test: tambahkan `DB_ENV=test` di depan, misalnya
`DB_ENV=test pnpm db:migrate` (memakai `apps/api/.env.test`).

`DATABASE_URL` diambil dari environment jika sudah di-set (server), atau dari
`apps/api/.env` (laptop). Satu sumber dengan `apps/api`, jadi tidak ada file
`.env` di package ini.

## Mengubah skema

1. Ubah `src/schema.ts`.
2. `pnpm db:generate --name <deskripsi_singkat>`.
3. **Baca SQL yang dihasilkan** di `drizzle/`. Perhatikan kolom yang di-drop
   atau di-rename, karena drizzle-kit bisa menganggapnya hapus + buat baru
   (data hilang).
4. `pnpm db:migrate`, lalu `DB_ENV=test pnpm db:migrate`.
5. Sesuaikan mapping di `apps/api/src/modules/tests/tests.repository.ts`.
6. Commit `schema.ts` **dan** file baru di `drizzle/` bersamaan.

Jangan mengedit migrasi yang sudah di-commit atau sudah jalan di server.
Buat migrasi baru.

## Di server (App Platform)

Folder `drizzle/` ikut terpasang di image API (`"files"` di package.json).
Migrasi dijalankan oleh pre-deploy job `node dist/database/migrate.js` dan
seed demo oleh `node dist/database/seed.js`, role oleh
`node dist/database/set-role.js <email> <role>` (semuanya di `apps/api`, memakai
setelan SSL/CA yang sama dengan API). Lihat `docs/deployment.md`.

## Aturan

- `apps/api` mengimpor drizzle (`eq`, `asc`, `sql`, `drizzle`, …) **dari
  package ini**, bukan dari `drizzle-orm` langsung. `apps/api` berformat
  CommonJS; impor langsung akan memuat salinan drizzle-orm kedua yang tipenya
  tidak cocok dengan skema. Butuh operator lain? Tambahkan ke `src/index.ts`.
- Query tetap ditulis di repository `apps/api`, bukan di sini. Package ini
  hanya berisi skema dan helper murni (`flattenContent`).
- Seed hanya berisi konten orisinal, bukan soal resmi IELTS.
- Kode & comment dalam bahasa Inggris (British). Panduan ini berbahasa Indonesia.

## Build

ESM, dikompilasi ke `dist/` (`pnpm build`). Turbo mem-build package ini
sebelum `apps/api`.
