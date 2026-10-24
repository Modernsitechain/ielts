import type { AttemptMode } from "./attempt";
import type { TestDetail } from "./test";

// Bentuk data versi "database", hanya dipakai di sisi server
// (core/datas & core/services). Berisi kunci jawaban, jadi jangan
// pernah dikirim ke komponen/halaman.

/** Tes publik + kunci jawaban per question id. */
export type TestRecord = Omit<TestDetail, "questionCount"> & {
  answerKey: Record<string, string[]>;
};

export type AttemptRecord = {
  id: string;
  testId: string;
  mode: AttemptMode;
  startedAt: string;
  endsAt: string;
  submittedAt: string | null;
  /** Jawaban peserta per question id. */
  answers: Record<string, string>;
};
