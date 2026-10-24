import "server-only";

import { tests } from "@/core/datas";
import type { TestRecord } from "@/core/models/records";
import type { TestDetail, TestSummary } from "@/core/models/test";

// Halaman hanya mengambil data lewat core/services.
// Sekarang membaca dummy data dari core/datas. Saat apps/api (NestJS) siap,
// isi fungsi-fungsi ini diganti dengan fetch ke API; signature tetap sama
// sehingga halaman tidak perlu diubah.

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

/** Tes untuk peserta: tanpa kunci jawaban. */
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
