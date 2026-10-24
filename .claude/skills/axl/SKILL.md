---
name: axl
description: Perintah pribadi Axel untuk git di repo ini. `/axl commit` meng-commit semua perubahan dengan pesan sesuai konvensi; `/axl push` mem-push branch main ke origin.
argument-hint: commit | push
disable-model-invocation: true
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git add:*), Bash(git commit:*), Bash(git push:*), Bash(git branch:*), Bash(git rev-parse:*), Bash(git fetch:*)
---

# /axl

Argumen: `$ARGUMENTS`

Jalankan sub-perintah sesuai argumen pertama. Jika argumen kosong atau tidak
dikenal, tampilkan daftar sub-perintah di bawah dan berhenti.

## `commit` — commit semua perubahan

1. Lihat perubahan: `git status --short`, `git diff`, dan `git diff --staged`.
   Jika tidak ada perubahan, katakan begitu dan berhenti.
2. Pastikan tidak ada file rahasia atau hasil build yang ikut (`.env`,
   `.env.*` selain `.env.example`, `node_modules/`, `dist/`, `.next/`). Jika
   ada yang tidak di-ignore, berhenti dan tanyakan.
3. `git add -A`, lalu buat **satu** commit untuk semua perubahan.
4. Format pesan (bahasa Inggris):
   ```
   <type>: <ringkasan>

   - <poin perubahan penting>
   - ...
   ```
   - `type` hanya boleh salah satu:
     - `feat` — fitur atau perubahan perilaku baru
     - `fix` — perbaikan bug
     Jika perubahannya campuran, pakai type dari perubahan terbesar.
   - Ringkasan: huruf kecil, kalimat perintah ("add", bukan "added"),
     maksimal 72 karakter, tanpa titik di akhir.
   - Body berisi poin-poin singkat; boleh dihilangkan untuk perubahan kecil.
   - Akhiri dengan baris attribution yang diminta sistem, jika ada.
5. Tampilkan hash dan judul commit. Jangan push.

## `push` — push ke main

1. Pastikan branch saat ini `main` (`git branch --show-current`). Jika bukan,
   berhenti dan tanyakan dulu.
2. Jika ada perubahan yang belum di-commit, ingatkan (jangan commit otomatis).
3. `git push origin main`. **Jangan pernah force push.**
4. Jika push ditolak karena remote lebih baru, berhenti dan jelaskan;
   jangan pull/rebase otomatis.
5. Tampilkan rentang commit yang ter-push.

## Sub-perintah yang tersedia

| Perintah      | Fungsi                                      |
| ------------- | ------------------------------------------- |
| `/axl commit` | Commit semua perubahan dengan pesan konvensi |
| `/axl push`   | Push branch `main` ke `origin`              |
