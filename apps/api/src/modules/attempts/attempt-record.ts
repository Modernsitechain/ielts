import type { AttemptMode } from "@ielts-mock/question-schema";

/** An attempt as stored. */
export type AttemptRecord = {
  id: string;
  /** Owner (users.id). Only they can see or change the attempt. */
  userId: string;
  testId: string;
  mode: AttemptMode;
  startedAt: string;
  /** Deadline decided by the server when the attempt starts. */
  endsAt: string;
  submittedAt: string | null;
  /** Candidate answers per question id. */
  answers: Record<string, string>;
};
