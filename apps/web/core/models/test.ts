// Model tes yang dilihat oleh peserta. Mengikuti sketsa model di
// docs/project-brief.md; akan dipindah ke packages/question-schema (Zod)
// pada Fase 2.
//
// Kunci jawaban SENGAJA tidak ada di sini: tes yang dikirim ke peserta
// tidak boleh membawa jawaban sebelum submit (lihat records.ts).

export type Skill = "reading" | "listening";
export type TestModule = "academic" | null;

export type TestSummary = {
  id: string;
  title: string;
  skill: Skill;
  module: TestModule;
  isFree: boolean;
  durationMinutes: number;
  questionCount: number;
};

export type ChoiceOption = {
  key: string;
  text: string;
};

export type Question = {
  id: string;
  /** Nomor global 1–40 dalam satu tes. */
  number: number;
  prompt: string;
  options: ChoiceOption[] | null;
};

/** Data level group, dibedakan berdasarkan tipe soal. */
export type GroupPayload =
  | { type: "multiple_choice_single" }
  | { type: "true_false_not_given" }
  | { type: "sentence_completion"; maxWords: number; allowNumber: boolean }
  | { type: "form_completion"; maxWords: number; allowNumber: boolean };

export type QuestionType = GroupPayload["type"];

export type QuestionGroup = {
  id: string;
  order: number;
  numberFrom: number;
  numberTo: number;
  instructions: string;
  payload: GroupPayload;
  questions: Question[];
};

export type Section = {
  id: string;
  order: number;
  kind: "passage" | "listening_part";
  title: string;
  /** Teks passage (Reading). Null untuk Listening. */
  content: string | null;
  /** URL audio (Listening). Null untuk Reading atau jika belum diunggah. */
  audioUrl: string | null;
  groups: QuestionGroup[];
};

export type TestDetail = TestSummary & {
  sections: Section[];
};
