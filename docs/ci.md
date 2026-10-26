# CI & lint

Disusun 2026-10-27. Workflow: `.github/workflows/ci.yml`.

## Yang dijalankan CI

Setiap push ke `development`/`main` dan setiap pull request, di GitHub
Actions (Ubuntu, Node dari `.nvmrc`, PostgreSQL 17 sebagai service):

| Langkah        | Perintah                                   | Gagal jika…                                  |
| -------------- | ------------------------------------------ | -------------------------------------------- |
| Lint           | `pnpm lint`                                | ada error ESLint (warning tidak menggagalkan) |
| Typecheck      | `pnpm typecheck`                           | ada error TypeScript                          |
| Unit test      | `pnpm test`                                | Jest (api) atau Vitest (question-schema) gagal |
| Migrasi        | `pnpm db:migrate`                          | migrasi tidak bisa dijalankan dari nol        |
| E2E            | `pnpm --filter @ielts-mock/api test:e2e`   | alur API terhadap database nyata gagal        |
| Build          | `pnpm build`                               | ketiga app tidak bisa di-build                |

CI tidak memakai rahasia: database-nya sementara (`ci:ci`), dan WorkOS dipalsukan
di e2e (`apps/api/test/auth-helpers.ts`). Hasil: tab **Actions** di GitHub, atau
tanda ✓/✗ di samping commit.

Status sekarang: CI **memberi tahu**, belum **memblokir** deploy. App Platform
tetap men-deploy setiap push ke `development` walaupun CI merah. Rencana
berikutnya: deploy dijalankan dari GitHub Actions setelah CI hijau (butuh token
DigitalOcean sebagai secret GitHub).

## Menjalankan di laptop

Sama dengan CI (dari root, Node 24):

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm --filter @ielts-mock/api test:e2e && pnpm build
```

Perbaiki otomatis yang bisa diperbaiki: `pnpm --filter <package> exec eslint . --fix`.

## ESLint

- Config bersama di `packages/config/eslint/`:
  - `base.mjs`: `@eslint/js` + `typescript-eslint` recommended, `_nama` untuk
    variabel yang sengaja tidak dipakai, `import type` untuk tipe, `===`,
    `console.log` dilarang (kecuali `warn`/`error`).
  - `next.mjs` (web, admin): + aturan Next.js & React Hooks (v7, termasuk
    aturan React Compiler).
  - `node.mjs` (packages): + global Node/Jest. `nest.mjs` (api): + opsi
    decorator.
- Tiap package punya `eslint.config.mjs` satu baris yang meng-import config itu,
  dan script `lint`.
- **TypeScript 7 tidak punya JavaScript API**, jadi `typescript-eslint`
  memakai TypeScript 6 milik `packages/config`. Aturan yang butuh informasi
  tipe tidak dipakai; tipe dicek `pnpm typecheck`.
- **NestJS**: dependency injection memakai tipe parameter constructor, yang
  harus tetap import biasa (bukan `import type`). `nest.mjs` mengaktifkan
  `emitDecoratorMetadata` agar `consistent-type-imports` memahaminya. Jangan
  menghapus opsi itu.
- `console.log` di script CLI (seed, set-role) ditandai
  `// eslint-disable-next-line no-console -- script output`.
