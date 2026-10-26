import type { AttemptMode } from "@ielts-mock/question-schema";

/** Score stored when an attempt is submitted. */
export type AttemptScore = {
  rawScore: number;
  totalQuestions: number;
  band: number | null;
  /** Whether each answered question was correct, per question id. */
  correct: Record<string, boolean>;
};

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
  /** Null until submitted. */
  score: AttemptScore | null;
};

export type NewAttempt = Pick<AttemptRecord, "userId" | "testId" | "mode" | "startedAt" | "endsAt">;
