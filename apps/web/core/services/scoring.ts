import "server-only";

import type { GroupPayload, Skill } from "@/core/models/test";

// Fungsi penilaian murni (tanpa framework, tanpa database).
// Pada Fase 2 dipindah ke packages/question-schema dan dipanggil oleh apps/api.

/** trim, lowercase, rapikan spasi ganda, buang tanda baca di ujung. */
export function normalizeAnswer(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[.,;:!?]+$/, "");
}

const NUMBER_TOKEN = /^\d[\d,.]*$/;

/**
 * Cek batas kata, misalnya "NO MORE THAN TWO WORDS AND/OR A NUMBER":
 * jika allowNumber, satu token angka tidak dihitung sebagai kata.
 */
export function withinWordLimit(
  value: string,
  maxWords: number,
  allowNumber: boolean,
): boolean {
  const tokens = normalizeAnswer(value).split(" ").filter(Boolean);
  if (!allowNumber) return tokens.length <= maxWords;

  const numbers = tokens.filter((t) => NUMBER_TOKEN.test(t));
  const words = tokens.length - numbers.length;
  return numbers.length <= 1 && words <= maxWords;
}

export function isAnswerCorrect(
  payload: GroupPayload,
  given: string | null,
  accepted: string[],
): boolean {
  if (given === null || normalizeAnswer(given) === "") return false;

  if (
    (payload.type === "sentence_completion" ||
      payload.type === "form_completion") &&
    !withinWordLimit(given, payload.maxWords, payload.allowNumber)
  ) {
    return false;
  }

  const normalized = normalizeAnswer(given);
  return accepted.some((a) => normalizeAnswer(a) === normalized);
}

// Perkiraan umum dari docs/ielts-domain.md. Tabel resmi bisa berbeda
// antar tes, jadi ini konfigurasi, bukan logika.
type BandTable = { band: number; minRaw: number }[];

const BAND_TABLES: Record<"listening" | "reading_academic", BandTable> = {
  listening: [
    { band: 9, minRaw: 39 },
    { band: 8.5, minRaw: 37 },
    { band: 8, minRaw: 35 },
    { band: 7.5, minRaw: 32 },
    { band: 7, minRaw: 30 },
    { band: 6.5, minRaw: 26 },
    { band: 6, minRaw: 23 },
    { band: 5.5, minRaw: 18 },
    { band: 5, minRaw: 16 },
    { band: 4.5, minRaw: 13 },
    { band: 4, minRaw: 10 },
  ],
  reading_academic: [
    { band: 9, minRaw: 39 },
    { band: 8.5, minRaw: 37 },
    { band: 8, minRaw: 35 },
    { band: 7.5, minRaw: 33 },
    { band: 7, minRaw: 30 },
    { band: 6.5, minRaw: 27 },
    { band: 6, minRaw: 23 },
    { band: 5.5, minRaw: 19 },
    { band: 5, minRaw: 15 },
    { band: 4.5, minRaw: 13 },
    { band: 4, minRaw: 10 },
  ],
};

/**
 * Konversi raw score ke band. Null jika tes bukan 40 soal (band tidak
 * bermakna) atau skor di bawah tabel yang tersedia.
 */
export function rawScoreToBand(
  skill: Skill,
  rawScore: number,
  totalQuestions: number,
): number | null {
  if (totalQuestions !== 40) return null;
  const table =
    skill === "listening" ? BAND_TABLES.listening : BAND_TABLES.reading_academic;
  return table.find((row) => rawScore >= row.minRaw)?.band ?? null;
}
