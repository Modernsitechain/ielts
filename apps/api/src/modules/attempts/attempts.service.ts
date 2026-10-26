import { randomUUID } from "node:crypto";

import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import {
  type AttemptMode,
  type AttemptResult,
  type AttemptSession,
  type AttemptSummary,
  isAnswerCorrect,
  type ResultItem,
  rawScoreToBand,
} from "@ielts-mock/question-schema";

import type { TestRecord } from "../tests/test-record";
import { TestsRepository } from "../tests/tests.repository";
import type { AttemptRecord } from "./attempt-record";
import { AttemptsRepository } from "./attempts.repository";

/** Allowance for network delay when the client auto-submits in the last second. */
export const DEADLINE_GRACE_MS = 30_000;

function toSession(attempt: AttemptRecord): AttemptSession {
  return {
    id: attempt.id,
    testId: attempt.testId,
    mode: attempt.mode,
    startedAt: attempt.startedAt,
    endsAt: attempt.endsAt,
    submittedAt: attempt.submittedAt,
    answers: attempt.answers,
  };
}

/** Keeps only answers to this test's questions, trimmed and non-empty. */
function sanitizeAnswers(test: TestRecord, answers: Record<string, string>) {
  const result: Record<string, string> = {};
  for (const questionId of Object.keys(test.answerKey)) {
    const value = answers[questionId]?.trim();
    if (value) result[questionId] = value;
  }
  return result;
}

function grade(attempt: AttemptRecord, test: TestRecord, submittedAt: string): AttemptResult {
  const items: ResultItem[] = test.sections.flatMap((section) =>
    section.groups.flatMap((group) =>
      group.questions.map((question) => {
        const given = attempt.answers[question.id] ?? null;
        const accepted = test.answerKey[question.id] ?? [];
        return {
          questionId: question.id,
          number: question.number,
          prompt: question.prompt,
          given,
          accepted,
          isCorrect: isAnswerCorrect(group.payload, given, accepted),
        };
      }),
    ),
  );

  const rawScore = items.filter((item) => item.isCorrect).length;
  return {
    id: attempt.id,
    testId: test.id,
    testTitle: test.title,
    skill: test.skill,
    mode: attempt.mode,
    submittedAt,
    rawScore,
    totalQuestions: items.length,
    band: rawScoreToBand(test.skill, rawScore, items.length),
    items,
  };
}

/**
 * Attempt lifecycle: start → autosave → submit → result.
 * Time limits and grading are decided here, never trusted from the client.
 */
@Injectable()
export class AttemptsService {
  constructor(
    private readonly attemptsRepository: AttemptsRepository,
    private readonly testsRepository: TestsRepository,
  ) {}

  async start(testId: string, mode: AttemptMode): Promise<AttemptSession> {
    const test = await this.requireTest(testId);
    // Drafts can't be started; existing attempts keep working after unpublishing.
    if (test.status !== "published") throw new NotFoundException(`Test ${testId} not found`);
    const startedAt = new Date();
    const endsAt = new Date(startedAt.getTime() + test.durationMinutes * 60_000);

    const attempt = await this.attemptsRepository.create({
      id: randomUUID(),
      testId: test.id,
      mode,
      startedAt: startedAt.toISOString(),
      endsAt: endsAt.toISOString(),
      submittedAt: null,
      answers: {},
    });
    return toSession(attempt);
  }

  async getSession(id: string): Promise<AttemptSession> {
    return toSession(await this.requireAttempt(id));
  }

  /** Autosave. Rejected once the attempt is submitted or its time is up. */
  async saveAnswers(id: string, answers: Record<string, string>): Promise<void> {
    const attempt = await this.requireAttempt(id);
    if (attempt.submittedAt) throw new ConflictException("Attempt already submitted");
    if (this.isPastDeadline(attempt)) throw new ConflictException("Time is up");

    const test = await this.requireTest(attempt.testId);
    await this.attemptsRepository.update(id, { answers: sanitizeAnswers(test, answers) });
  }

  /**
   * Submits and grades the attempt. If time is up, the submitted answers are
   * ignored and the last autosave before the deadline is graded instead.
   */
  async submit(id: string, answers: Record<string, string>): Promise<AttemptResult> {
    const attempt = await this.requireAttempt(id);
    if (attempt.submittedAt) throw new ConflictException("Attempt already submitted");

    const test = await this.requireTest(attempt.testId);
    const finalAnswers = this.isPastDeadline(attempt)
      ? attempt.answers
      : sanitizeAnswers(test, answers);
    const submittedAt = new Date().toISOString();
    await this.attemptsRepository.update(id, { answers: finalAnswers, submittedAt });

    return grade({ ...attempt, answers: finalAnswers }, test, submittedAt);
  }

  async getResult(id: string): Promise<AttemptResult> {
    const attempt = await this.requireAttempt(id);
    if (!attempt.submittedAt) throw new NotFoundException(`Attempt ${id} has no result yet`);
    return grade(attempt, await this.requireTest(attempt.testId), attempt.submittedAt);
  }

  /**
   * Submitted attempts, newest first. Attempts whose test no longer exists
   * (e.g. deleted in the admin) are left out instead of failing the list.
   */
  async listSubmitted(): Promise<AttemptSummary[]> {
    const attempts = await this.attemptsRepository.findSubmitted();
    const summaries = await Promise.all(
      attempts.map(async (attempt) => {
        const test = await this.testsRepository.findById(attempt.testId);
        if (!test || !attempt.submittedAt) return null;
        const { items: _items, ...summary } = grade(attempt, test, attempt.submittedAt);
        return summary;
      }),
    );
    return summaries
      .filter((summary) => summary !== null)
      .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  }

  private isPastDeadline(attempt: AttemptRecord): boolean {
    return Date.now() > Date.parse(attempt.endsAt) + DEADLINE_GRACE_MS;
  }

  private async requireAttempt(id: string): Promise<AttemptRecord> {
    const attempt = await this.attemptsRepository.findById(id);
    if (!attempt) throw new NotFoundException(`Attempt ${id} not found`);
    return attempt;
  }

  private async requireTest(id: string): Promise<TestRecord> {
    const test = await this.testsRepository.findById(id);
    if (!test) throw new NotFoundException(`Test ${id} not found`);
    return test;
  }
}
