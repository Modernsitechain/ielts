import type { Skill } from "./test";

export type AttemptMode = "exam" | "practice";

/** An attempt in progress, limited to what the candidate may see. */
export type AttemptSession = {
  id: string;
  testId: string;
  mode: AttemptMode;
  startedAt: string;
  /** Deadline set by the server; the browser timer is display only. */
  endsAt: string;
  submittedAt: string | null;
  /** Last saved answers per question id. */
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
  /** Null when the band can't be calculated (e.g. a demo test with < 40 questions). */
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
