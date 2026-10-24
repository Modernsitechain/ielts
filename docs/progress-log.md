# Progress Log

## Status saat ini
Fase: 1 (Fondasi project & AI tooling) — minggu ke-1

## Keputusan yang sudah diambil
- Produk: SaaS mock test IELTS Reading & Listening (lihat project-brief.md)
- Struktur: monorepo Turborepo + pnpm, 3 app: `apps/web` & `apps/admin`
  (Next.js, frontend murni) + `apps/api` (backend, satu-satunya akses database)
- Backend: NestJS, termasuk test bawaannya (Jest) untuk `apps/api`
- AI tooling: Claude Code (terminal, agent utama) + Antigravity (editor & review)
- Database: PostgreSQL (Supabase) + Drizzle
- Pembayaran: Midtrans Snap, model paket akses (bukan auto-renewal dulu)
- Soal harus orisinal; ada disclaimer tidak berafiliasi dengan IELTS
- Bahasa: seluruh isi aplikasi (teks UI, pesan error, konten soal, comment
  kode) dalam bahasa Inggris dengan ejaan British, walaupun diskusi/prompt
  dalam bahasa Indonesia. Dokumen di `docs/` tetap berbahasa Indonesia.

## Keputusan yang belum diambil
- Library auth (Better Auth vs Supabase Auth)
- Harga & durasi paket
- Platform deploy `apps/api` (Railway vs Fly.io vs Render)

## Catatan per sesi
<!-- Format: [tanggal] apa yang dikerjakan / dipelajari -->
- [YYYY-MM-DD] Menyusun roadmap, project brief, dan domain knowledge
- [2026-10-24] Merencanakan setup monorepo. Rencana awal (hanya web & admin)
  dibatalkan karena tidak sesuai docs yang mensyaratkan `apps/api`.
  Memutuskan backend NestJS; roadmap & progress log diselaraskan.
- [2026-10-24] Urutan diubah: main app dulu dengan dummy data, api & admin
  menyusul. Dibuat: monorepo Turborepo + pnpm, `packages/config` (tsconfig),
  `apps/web` (Next.js 16, Tailwind) dengan halaman katalog, detail tes,
  riwayat, dan hasil. Data lewat `apps/web/lib/api` (sekarang membaca
  `lib/mock`; nanti diganti fetch ke `apps/api`). Kunci jawaban & penilaian
  hanya di sisi server. Halaman pengerjaan tes belum dibuat.
- [2026-10-24] Struktur `apps/web` diubah ke `core/` (models, datas, services),
  `feature/` (home, catalog, history, session, auth), `shared/` (components,
  layouts, utils). `app/` hanya berisi route tipis yang me-re-export halaman
  dari `feature/*/pages`. Pintu data sekarang `core/services` (menggantikan
  `lib/api`), dummy data di `core/datas`.
- [2026-10-24] Halaman pengerjaan Reading (`/session/reading/[attemptId]`,
  route group `(exam)` layar penuh): split screen, navigasi soal per part,
  flag, timer dari `endsAt` server + auto-submit, autosave via Server Action,
  submit → penilaian di server → halaman hasil. Attempt disimpan di memori
  server (hilang saat restart). Belum: highlight & catatan, pengaturan font/
  kontras, flag belum tersimpan, sesi Listening, pengecekan paket berbayar.
- [2026-10-24] Seluruh teks UI & comment di `apps/web` diubah ke bahasa
  Inggris (British). Aturan bahasa dicatat di keputusan & `apps/web/AGENTS.md`.
- [2026-10-24] Redesign landing page (hero + mock-up layar ujian, fitur,
  cara kerja, teaser AI study coach "coming soon", CTA) & polish UI halaman
  ujian. Icon pakai `lucide-react`, font Geist. Landing menyebut highlight &
  catatan, padahal fitur itu belum dibuat.

## Yang masih bingung
<!-- Tulis di sini, Claude akan menjelaskan ulang -->
-

## Kesalahan AI yang berulang (bahan untuk file aturan)
<!-- Contoh: AI masih pakai `any` di handler webhook -->
- Menyusun rencana tanpa membaca `docs/` lebih dulu → rencana melenceng
  dari arsitektur (lupa `apps/api`)
