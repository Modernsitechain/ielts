import { z } from "zod";

const MAX_ANSWER_LENGTH = 200;

/** Candidate answers per question id. Unknown question ids are dropped later. */
const answersSchema = z.record(z.string().max(100), z.string().max(MAX_ANSWER_LENGTH));

export const startAttemptSchema = z.object({
  testId: z.string().min(1).max(100),
  mode: z.enum(["exam", "practice"]).default("exam"),
});
export type StartAttemptDto = z.infer<typeof startAttemptSchema>;

export const saveAnswersSchema = z.object({ answers: answersSchema });
export type SaveAnswersDto = z.infer<typeof saveAnswersSchema>;

/** Question ids flagged for review; a test has at most 40 questions. */
export const saveFlagsSchema = z.object({
  questionIds: z.array(z.string().min(1).max(100)).max(100),
});
export type SaveFlagsDto = z.infer<typeof saveFlagsSchema>;

export const submitAttemptSchema = z.object({ answers: answersSchema });
export type SubmitAttemptDto = z.infer<typeof submitAttemptSchema>;
