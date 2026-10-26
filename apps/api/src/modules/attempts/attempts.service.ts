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
import type { AttemptRecord, AttemptScore } from "./attempt-record";
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

/**
 * Grades an attempt against the test's current content. For a submitted
 * attempt, the score and correctness stored at submission win, so editing the
 * test later doesn't change a past result.
 */
function grade(attempt: AttemptRecord, test: TestRecord, submittedAt: string): AttemptResult {
  const stored = attempt.score;
  const items: ResultItem[] = test.sections.flatMap((section) =>
    section.groups.flatMap((group) =>
      group.questions.map((question) => {
        const given = attempt.answers[question.id] ?? null;
        const accepted = test.answerKey[question.id] ?? [];
        const isCorrect = stored
          ? (stored.correct[question.id] ?? false)
          : isAnswerCorrect(group.payload, given, accepted);
        return {
          questionId: question.id,
          number: question.number,
          prompt: question.prompt,
          given,
          accepted,
          isCorrect,
        };
      }),
    ),
  );

  const rawScore = stored?.rawScore ?? items.filter((item) => item.isCorrect).length;
  const totalQuestions = stored?.totalQuestions ?? items.length;
  return {
    id: attempt.id,
    testId: test.id,
    testTitle: test.title,
    skill: test.skill,
    mode: attempt.mode,
    submittedAt,
    rawScore,
    totalQuestions,
    band: stored ? stored.band : rawScoreToBand(test.skill, rawScore, totalQuestions),
    items,
  };
}

/** What is stored at submission. */
function toScore(result: AttemptResult): AttemptScore {
  return {
    rawScore: result.rawScore,
    totalQuestions: result.totalQuestions,
    band: result.band,
    correct: Object.fromEntries(result.items.map((item) => [item.questionId, item.isCorrect])),
  };
}

/**
 * Attempt lifecycle: start → autosave → submit → result.
 * Time limits and grading are decided here, never trusted from the client.
 * Every method takes the signed-in user's id: someone else's attempt is
 * reported as not found.
 */
@Injectable()
export class AttemptsService {
  constructor(
    private readonly attemptsRepository: AttemptsRepository,
    private readonly testsRepository: TestsRepository,
  ) {}

  async start(userId: string, testId: string, mode: AttemptMode): Promise<AttemptSession> {
    const test = await this.requireTest(testId);
    // Drafts can't be started; existing attempts keep working after unpublishing.
    if (test.status !== "published") throw new NotFoundException(`Test ${testId} not found`);
    const startedAt = new Date();
    const endsAt = new Date(startedAt.getTime() + test.durationMinutes * 60_000);

    const attempt = await this.attemptsRepository.create({
      userId,
      testId: test.id,
      mode,
      startedAt: startedAt.toISOString(),
      endsAt: endsAt.toISOString(),
    });
    return toSession(attempt);
  }

  async getSession(userId: string, id: string): Promise<AttemptSession> {
    return toSession(await this.requireAttempt(userId, id));
  }

  /** Autosave. Rejected once the attempt is submitted or its time is up. */
  async saveAnswers(userId: string, id: string, answers: Record<string, string>): Promise<void> {
    const attempt = await this.requireAttempt(userId, id);
    if (attempt.submittedAt) throw new ConflictException("Attempt already submitted");
    if (this.isPastDeadline(attempt)) throw new ConflictException("Time is up");

    const test = await this.requireTest(attempt.testId);
    await this.attemptsRepository.saveAnswers(id, sanitizeAnswers(test, answers));
  }

  /**
   * Submits and grades the attempt. If time is up, the submitted answers are
   * ignored and the last autosave before the deadline is graded instead.
   */
  async submit(userId: string, id: string, answers: Record<string, string>): Promise<AttemptResult> {
    const attempt = await this.requireAttempt(userId, id);
    if (attempt.submittedAt) throw new ConflictException("Attempt already submitted");

    const test = await this.requireTest(attempt.testId);
    const finalAnswers = this.isPastDeadline(attempt)
      ? attempt.answers
      : sanitizeAnswers(test, answers);
    const submittedAt = new Date().toISOString();
    const result = grade({ ...attempt, answers: finalAnswers, score: null }, test, submittedAt);
    const stored = await this.attemptsRepository.submit(id, finalAnswers, toScore(result), submittedAt);
    if (!stored) throw new ConflictException("Attempt already submitted");
    return result;
  }

  async getResult(userId: string, id: string): Promise<AttemptResult> {
    const attempt = await this.requireAttempt(userId, id);
    if (!attempt.submittedAt) throw new NotFoundException(`Attempt ${id} has no result yet`);
    return grade(attempt, await this.requireTest(attempt.testId), attempt.submittedAt);
  }

  /** The user's submitted attempts with their stored scores, newest first. */
  async listSubmitted(userId: string): Promise<AttemptSummary[]> {
    return this.attemptsRepository.findSubmittedSummaries(userId);
  }

  private isPastDeadline(attempt: AttemptRecord): boolean {
    return Date.now() > Date.parse(attempt.endsAt) + DEADLINE_GRACE_MS;
  }

  private async requireAttempt(userId: string, id: string): Promise<AttemptRecord> {
    const attempt = await this.attemptsRepository.findById(id);
    if (!attempt || attempt.userId !== userId) throw new NotFoundException(`Attempt ${id} not found`);
    return attempt;
  }

  private async requireTest(id: string): Promise<TestRecord> {
    const test = await this.testsRepository.findById(id);
    if (!test) throw new NotFoundException(`Test ${id} not found`);
    return test;
  }
}
