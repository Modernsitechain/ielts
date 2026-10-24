import "server-only";

import { tests } from "@/core/datas";
import type { TestRecord } from "@/core/models/records";
import type { TestDetail, TestSummary } from "@/core/models/test";

// Pages get data only through core/services.
// For now this reads dummy data from core/datas. Once apps/api (NestJS) is
// ready, these functions will fetch from the API instead; the signatures stay
// the same, so pages don't need to change.

export function countQuestions(test: TestRecord): number {
  return test.sections.reduce(
    (total, section) =>
      total +
      section.groups.reduce((sum, group) => sum + group.questions.length, 0),
    0,
  );
}

function toSummary(test: TestRecord): TestSummary {
  return {
    id: test.id,
    title: test.title,
    skill: test.skill,
    module: test.module,
    isFree: test.isFree,
    durationMinutes: test.durationMinutes,
    questionCount: countQuestions(test),
  };
}

/** Test for candidates: without the answer key. */
function toDetail(test: TestRecord): TestDetail {
  const { answerKey: _answerKey, ...publicTest } = test;
  return { ...publicTest, questionCount: countQuestions(test) };
}

export async function listTests(): Promise<TestSummary[]> {
  return tests.map(toSummary);
}

export async function getTest(testId: string): Promise<TestDetail | null> {
  const test = tests.find((t) => t.id === testId);
  return test ? toDetail(test) : null;
}
