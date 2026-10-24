import type { AttemptMode } from "@ielts-mock/question-schema";

/** An attempt as stored. */
export type AttemptRecord = {
  id: string;
  testId: string;
  mode: AttemptMode;
  startedAt: string;
  /** Deadline decided by the server when the attempt starts. */
  endsAt: string;
  submittedAt: string | null;
  /** Candidate answers per question id. */
  answers: Record<string, string>;
};
