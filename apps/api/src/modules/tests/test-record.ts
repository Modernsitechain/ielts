import type { AnswerKey, TestDetail } from "@ielts-mock/question-schema";

/**
 * A test as stored, including its answer key. Never return this from a
 * controller; map it to TestSummary/TestDetail first.
 */
export type TestRecord = Omit<TestDetail, "questionCount"> & {
  answerKey: AnswerKey;
};
