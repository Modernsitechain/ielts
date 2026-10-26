# packages/question-schema — Panduan

Satu sumber kebenaran untuk model soal/tes/attempt dan fungsi penilaian,
dipakai oleh `apps/api`, `apps/web`, dan `apps/admin`.

## Isi

- `src/authoring.ts` — **skema Zod** konten tes: `groupPayloadSchema`
  (discriminated union per tipe soal), paragraf, opsi, `testInputSchema`
  (body PUT admin), `createTestSchema`. Tipe `GroupPayload`, `Paragraph`,
  `ChoiceOption`, `TestInput` di-infer dari skema ini. Juga `FIXED_CHOICES`
  dan `isCompletionType`.
- `src/test.ts` — tipe publik: Skill, TestStatus, TestSummary, TestDetail,
  Section (dengan `paragraphs`), QuestionGroup, Question, AnswerKey.
- `src/admin.ts` — tipe response `/admin/*` (memuat jawaban): AdminTest,
  AdminTestSummary, AdminSection, AdminGroup, AdminQuestion.
- `src/publish.ts` — `checkPublishReadiness`: syarat sebelum tes boleh
  publish (dipakai API untuk menolak, admin untuk menampilkan checklist).
- `src/attempt.ts` — AttemptSession, AttemptSummary, AttemptResult, ResultItem.
- `src/annotation.ts` — highlight & catatan: skema Zod, id blok teks
  (`paragraphBlockId`, `promptBlockId`, `promptParts`, `textBlocks`), fungsi
  murni `addHighlight`, `removeHighlights`, `setNote`, `removeAnnotation`,
  `segmentText`, `checkAnnotations` (dipakai web untuk UI, API untuk validasi).
  `BLANK_PATTERN` (gap soal isian) juga di sini. Test: `annotation.test.ts`.
- `src/user.ts` — `USER_ROLES`, `UserRole`, `ADMIN_APP_ROLES`, `CurrentUser`
  (response `GET /me`).
- `src/scoring.ts` — fungsi murni: normalisasi jawaban, batas kata, cek
  jawaban, konversi raw score → band (tabel = konfigurasi).
- `src/index.ts` — semua export publik.

## Aturan

- **Murni**: tanpa NestJS, Next.js, database, atau akses jaringan. Hanya
  TypeScript dan Zod.
- Tipe publik tidak boleh berisi kunci jawaban; `AnswerKey` terpisah dan
  hanya dipakai server (`apps/api`). Tipe di `admin.ts` hanya untuk admin.
- Draft boleh belum lengkap: skema Zod hanya mengecek bentuk & ukuran;
  kelengkapan dicek `checkPublishReadiness` saat publish.
- Menambah tipe soal: tambah varian di `groupPayloadSchema`, tangani di
  `isAnswerCorrect` dan `checkPublishReadiness`, lalu kompiler akan
  menunjukkan setiap `switch` di app yang perlu diperbarui.
- Unit test: Vitest, file `src/*.test.ts` (`pnpm test`). Sudah ada untuk
  `checkPublishReadiness`; belum untuk setiap tipe di `scoring.ts`.
- Kode & comment dalam bahasa Inggris (British).

## Build

ESM, dikompilasi ke `dist/` (`pnpm build`, atau `pnpm dev` untuk watch).
Turbo otomatis mem-build package ini sebelum `dev`, `build`, `typecheck`,
dan `test` di app yang memakainya. Import di source memakai ekstensi `.js`
(`./test.js`), aturan dari `module: nodenext`.
