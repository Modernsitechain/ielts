import type { AttemptMode } from "./attempt";
import type { TestDetail } from "./test";

// "Database" shapes, used on the server only (core/datas & core/services).
// They contain answer keys, so never pass them to components or pages.

/** Public test + answer key per question id. */
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
  /** Candidate answers per question id. */
  answers: Record<string, string>;
};
