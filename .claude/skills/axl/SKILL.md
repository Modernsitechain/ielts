---
name: axl
description: Perintah pribadi Axel untuk git di repo ini. `/axl commit` meng-commit semua perubahan dengan pesan sesuai konvensi; `/axl push` mem-push branch aktif (development atau main) ke origin.
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

## `push` — push branch aktif

1. Cek branch saat ini (`git branch --show-current`). Hanya `development`
   atau `main` yang boleh di-push. Jika branch lain, berhenti dan tanyakan.
2. Jika ada perubahan yang belum di-commit, ingatkan (jangan commit otomatis).
3. Jika branch-nya `main`, ingatkan bahwa push ini men-deploy ke
   **production**; minta konfirmasi dulu kecuali developer sudah memintanya
   secara eksplisit.
4. `git push origin <branch>` (tambahkan `-u` jika branch belum ada di remote).
   **Jangan pernah force push.**
5. Jika push ditolak karena remote lebih baru, berhenti dan jelaskan;
   jangan pull/rebase otomatis.
6. Tampilkan rentang commit yang ter-push dan environment yang akan
   ter-deploy (`development` → development, `main` → production).

## Sub-perintah yang tersedia

| Perintah      | Fungsi                                      |
| ------------- | ------------------------------------------- |
| `/axl commit` | Commit semua perubahan dengan pesan konvensi |
| `/axl push`   | Push `development` atau `main` ke `origin`  |
