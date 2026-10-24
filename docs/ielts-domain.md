# Pengetahuan Domain: IELTS Academic — Reading & Listening

Rujukan untuk desain produk, skema data, dan logika penilaian.
Selalu verifikasi detail ke sumber resmi (ielts.org, IDP, British Council)
sebelum dianggap final — format bisa berubah.

## Cakupan

- **Termasuk:** IELTS Academic, tes Reading dan Listening
- **Di luar cakupan:** General Training, Writing, Speaking
- Listening sama untuk Academic dan General Training, jadi tes
  Listening di produk ini tetap sesuai format resmi.

## Gambaran umum

- IELTS on computer: Listening dan Reading dikerjakan di komputer.
- Format, soal, dan penilaian versi komputer sama dengan versi kertas.

## Reading (Academic)

- Durasi: 60 menit, tanpa waktu tambahan
- 40 soal, masing-masing bernilai 1 poin
- 3 passage panjang, total sekitar 2.150–2.750 kata (perkiraan;
  verifikasi ke sumber resmi)
- Sumber teks: buku, jurnal, majalah, koran; topik umum yang
  bersifat akademik, dari deskriptif-faktual hingga argumentatif-analitis
- Tingkat kesulitan biasanya meningkat dari passage 1 ke passage 3
- Peserta bebas berpindah antar passage dan soal, bisa mengubah atau
  mengosongkan jawaban

## Listening

- Durasi total sekitar 30–34 menit (versi komputer)
- 4 part, total 40 soal:
  - Part 1: percakapan dua orang, konteks sehari-hari
  - Part 2: monolog, konteks sehari-hari
  - Part 3: percakapan hingga 4 orang, konteks pendidikan/pelatihan
  - Part 4: monolog akademik (seperti kuliah)
- Audio diputar SATU KALI
- Sebelum setiap part ada waktu membaca soal
- Setelah setiap part ada waktu singkat untuk review
- Di akhir tes ada 2 menit untuk mengecek jawaban
- Versi komputer tidak punya waktu transfer jawaban (berbeda dari kertas)

## Fitur antarmuka IELTS on computer (yang ditiru)

- **Split screen Reading:** teks di kiri, soal di kanan, masing-masing
  bisa di-scroll sendiri
- **Highlight:** pilih teks (double click untuk satu kata, drag untuk
  frasa), lalu klik kanan → highlight. Bisa di passage maupun soal.
- **Catatan (notes):** klik kanan pada teks terpilih → tambah catatan
- **Navigasi soal:** bar di bawah layar menampilkan nomor 1–40,
  menandai mana yang sudah dijawab, bisa lompat langsung ke soal
- **Panah maju/mundur** antar soal
- **Flag for review:** menandai soal untuk dicek ulang
- **Timer** terlihat di layar
- **Pengaturan:** ukuran font, kontras warna, volume (Listening)
- **Help** button
- Jawaban isian bisa di-copy-paste dari teks passage

## Tipe soal — Reading

Untuk setiap tipe: apa yang perlu disimpan (payload) dan bentuk jawabannya.

1. **Multiple choice (satu jawaban)** — opsi A–D; jawaban: 1 huruf
2. **Multiple choice (beberapa jawaban)** — misal "pilih DUA"; jawaban:
   himpunan huruf. Tentukan apakah dinilai per huruf (umum: tiap huruf
   benar = 1 poin, masing-masing punya nomor soal sendiri)
3. **True / False / Not Given** — untuk informasi faktual
4. **Yes / No / Not Given** — untuk pendapat/klaim penulis
5. **Matching headings** — daftar heading (i, ii, iii...) dicocokkan ke
   paragraf; jumlah heading > jumlah paragraf; heading tidak dipakai ulang
6. **Matching information** — pernyataan dicocokkan ke paragraf (A, B, C...);
   satu paragraf bisa dipakai lebih dari sekali
7. **Matching features** — pernyataan dicocokkan ke daftar
   (orang, tempat, tahun, dll); opsi bisa dipakai ulang
8. **Matching sentence endings** — awal kalimat dicocokkan ke akhiran
9. **Sentence completion** — isian, dengan batas kata
10. **Summary completion** — teks ringkasan dengan celah; bisa isian
    bebas ATAU memilih dari word bank
11. **Note / table / flow-chart completion** — struktur tabel/diagram
    alur dengan celah
12. **Diagram label completion** — gambar + label bernomor
13. **Short-answer questions** — jawaban singkat dengan batas kata

## Tipe soal — Listening

1. **Multiple choice** (satu atau beberapa jawaban)
2. **Matching** — misal mencocokkan pembicara dengan pendapat
3. **Plan / map / diagram labelling** — gambar + label bernomor,
   jawaban berupa huruf dari daftar atau isian
4. **Form / note / table / flow-chart / summary completion**
5. **Sentence completion**
6. **Short-answer questions**

## Aturan penilaian jawaban isian

- Batas kata ditentukan instruksi group, contoh:
  "NO MORE THAN TWO WORDS AND/OR A NUMBER", "ONE WORD ONLY"
  → simpan sebagai data terstruktur (`maxWords`, `allowNumber`),
  bukan hanya teks instruksi
- Jawaban yang melebihi batas kata dianggap salah
- Ejaan harus benar; huruf besar/kecil diabaikan
- Ejaan British & American umumnya sama-sama diterima
- Satu soal bisa punya beberapa variasi jawaban benar
  (misal "16", "sixteen"; "the station", "station")
  → editor harus bisa memasukkan daftar variasi yang diterima
- Normalisasi sebelum membandingkan: trim spasi, lowercase,
  rapikan spasi ganda, abaikan tanda baca di ujung

## Konversi skor ke band

Raw score (0–40) dikonversi ke band 0–9 dengan kelipatan 0,5.
Tabel resmi bisa sedikit berbeda antar versi tes, jadi tabel di bawah
adalah **perkiraan umum** dan harus disimpan sebagai konfigurasi.

| Band | Listening | Reading Academic |
| ---- | --------- | ---------------- |
| 9    | 39–40     | 39–40            |
| 8.5  | 37–38     | 37–38            |
| 8    | 35–36     | 35–36            |
| 7.5  | 32–34     | 33–34            |
| 7    | 30–31     | 30–32            |
| 6.5  | 26–29     | 27–29            |
| 6    | 23–25     | 23–26            |
| 5.5  | 18–22     | 19–22            |
| 5    | 16–17     | 15–18            |
| 4.5  | 13–15     | 13–14            |
| 4    | 10–12     | 10–12            |

## Implikasi untuk desain sistem

- Nomor soal (1–40) bersifat global dalam satu tes, tapi soal
  dikelompokkan per group dengan instruksi bersama
- Satu group = satu tipe soal
- Beberapa tipe butuh data bersama di level group (word bank, daftar
  heading, gambar diagram, tabel), bukan di level soal
- Reading: 1 tes = 3 section bertipe passage
- Listening: 1 tes = 4 section bertipe listening_part; butuh file audio
  per part, durasi waktu baca/review per part, dan transcript
  (untuk pembahasan)
- Highlight & catatan harus bisa menempel di passage DAN di teks soal
- Tabel konversi band cukup 2 konfigurasi: `listening` dan
  `reading_academic`
