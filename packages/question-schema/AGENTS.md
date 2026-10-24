# packages/question-schema — Panduan

Satu sumber kebenaran untuk model soal/tes/attempt dan fungsi penilaian,
dipakai oleh `apps/api`, `apps/web`, dan nanti `apps/admin`.

## Isi

- `src/test.ts` — Skill, TestSummary, TestDetail, Section, QuestionGroup,
  Question, GroupPayload (discriminated union per tipe soal), AnswerKey.
- `src/attempt.ts` — AttemptSession, AttemptSummary, AttemptResult, ResultItem.
- `src/scoring.ts` — fungsi murni: normalisasi jawaban, batas kata, cek
  jawaban, konversi raw score → band (tabel = konfigurasi).
- `src/index.ts` — semua export publik.

## Aturan

- **Murni**: tanpa NestJS, Next.js, database, atau akses jaringan. Hanya
  TypeScript (dan nanti Zod).
- Tipe publik tidak boleh berisi kunci jawaban; `AnswerKey` terpisah dan
  hanya dipakai server (`apps/api`).
- Menambah tipe soal: tambah varian di `GroupPayload`, tangani di
  `isAnswerCorrect`, lalu kompiler akan menunjukkan setiap `switch` di app
  yang perlu diperbarui.
- Fase 2: tambah skema Zod per tipe soal & unit test (Vitest) untuk setiap
  tipe di `scoring.ts`.
- Kode & comment dalam bahasa Inggris (British).

## Build

ESM, dikompilasi ke `dist/` (`pnpm build`, atau `pnpm dev` untuk watch).
Turbo otomatis mem-build package ini sebelum `dev`, `build`, `typecheck`,
dan `test` di app yang memakainya. Import di source memakai ekstensi `.js`
(`./test.js`), aturan dari `module: nodenext`.
