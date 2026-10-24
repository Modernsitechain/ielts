import type { Skill } from "./test";

export type AttemptMode = "exam" | "practice";

/** Attempt yang sedang dikerjakan, sesuai yang boleh dilihat peserta. */
export type AttemptSession = {
  id: string;
  testId: string;
  mode: AttemptMode;
  startedAt: string;
  /** Batas waktu dari server; timer di browser hanya tampilan. */
  endsAt: string;
  submittedAt: string | null;
  /** Jawaban tersimpan terakhir per question id. */
  answers: Record<string, string>;
};

export type AttemptSummary = {
  id: string;
  testId: string;
  testTitle: string;
  skill: Skill;
  mode: AttemptMode;
  submittedAt: string;
  rawScore: number;
  totalQuestions: number;
  /** Null jika band tidak bisa dihitung (misalnya tes demo < 40 soal). */
  band: number | null;
};

export type ResultItem = {
  questionId: string;
  number: number;
  prompt: string;
  given: string | null;
  accepted: string[];
  isCorrect: boolean;
};

export type AttemptResult = AttemptSummary & {
  items: ResultItem[];
};
