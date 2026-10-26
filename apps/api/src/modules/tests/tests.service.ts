import { Injectable, NotFoundException } from "@nestjs/common";
import type { TestDetail, TestSummary } from "@ielts-mock/question-schema";

import type { TestRecord } from "./test-record";
import { TestsRepository } from "./tests.repository";

export function countQuestions(test: TestRecord): number {
  return test.sections.reduce(
    (total, section) =>
      total + section.groups.reduce((sum, group) => sum + group.questions.length, 0),
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

/** Public view of a test: everything except the answer key. */
function toDetail(test: TestRecord): TestDetail {
  const { answerKey: _answerKey, status: _status, ...publicTest } = test;
  return { ...publicTest, questionCount: countQuestions(test) };
}

/** Candidate-facing reads. Drafts are never returned. */
@Injectable()
export class TestsService {
  constructor(private readonly testsRepository: TestsRepository) {}

  async list(): Promise<TestSummary[]> {
    const tests = await this.testsRepository.findPublished();
    return tests.map(toSummary);
  }

  async getById(id: string): Promise<TestDetail> {
    const test = await this.testsRepository.findById(id);
    if (!test || test.status !== "published") throw new NotFoundException(`Test ${id} not found`);
    return toDetail(test);
  }
}
