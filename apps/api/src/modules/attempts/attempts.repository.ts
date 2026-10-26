import { Inject, Injectable } from "@nestjs/common";
import {
  and,
  annotations,
  asc,
  attemptAnswers,
  attempts,
  desc,
  eq,
  isNotNull,
  isNull,
  sql,
  tests,
} from "@ielts-mock/db";
import type { Annotation, AttemptSummary } from "@ielts-mock/question-schema";

import { DATABASE, type Database } from "../../database/database.module";
import type { AttemptRecord, AttemptScore, NewAttempt } from "./attempt-record";

/** Data access for attempts and their answers (PostgreSQL). */
@Injectable()
export class AttemptsRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async create(attempt: NewAttempt): Promise<AttemptRecord> {
    const [row] = await this.db
      .insert(attempts)
      .values({
        ...attempt,
        startedAt: new Date(attempt.startedAt),
        endsAt: new Date(attempt.endsAt),
      })
      .returning({ id: attempts.id });
    if (!row) throw new Error("Attempt was not created");
    return { ...attempt, id: row.id, submittedAt: null, answers: {}, annotations: [], score: null };
  }

  async findById(id: string): Promise<AttemptRecord | null> {
    const row = await this.db.query.attempts.findFirst({
      where: eq(attempts.id, id),
      with: {
        answers: true,
        annotations: { orderBy: [asc(annotations.blockId), asc(annotations.startOffset)] },
      },
    });
    if (!row) return null;

    const answers: Record<string, string> = {};
    const correct: Record<string, boolean> = {};
    for (const answer of row.answers) {
      answers[answer.questionId] = answer.value;
      if (answer.isCorrect !== null) correct[answer.questionId] = answer.isCorrect;
    }
    return {
      id: row.id,
      userId: row.userId,
      testId: row.testId,
      mode: row.mode,
      startedAt: row.startedAt.toISOString(),
      endsAt: row.endsAt.toISOString(),
      submittedAt: row.submittedAt?.toISOString() ?? null,
      answers,
      annotations: row.annotations.map((a) => ({
        blockId: a.blockId,
        start: a.startOffset,
        end: a.endOffset,
        note: a.note,
      })),
      score:
        row.submittedAt && row.rawScore !== null && row.totalQuestions !== null
          ? { rawScore: row.rawScore, totalQuestions: row.totalQuestions, band: row.band, correct }
          : null,
    };
  }

  /** Autosave: replaces all answers of an attempt that is still in progress. */
  async saveAnswers(id: string, answers: Record<string, string>): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.delete(attemptAnswers).where(eq(attemptAnswers.attemptId, id));
      const rows = Object.entries(answers).map(([questionId, value]) => ({
        attemptId: id,
        questionId,
        value,
      }));
      if (rows.length) await tx.insert(attemptAnswers).values(rows);
      await tx.update(attempts).set({ updatedAt: sql`now()` }).where(eq(attempts.id, id));
    });
  }

  /** Replaces all highlights and notes of an attempt. */
  async saveAnnotations(id: string, list: Annotation[]): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.delete(annotations).where(eq(annotations.attemptId, id));
      if (list.length) {
        await tx.insert(annotations).values(
          list.map((a) => ({
            attemptId: id,
            blockId: a.blockId,
            startOffset: a.start,
            endOffset: a.end,
            note: a.note,
          })),
        );
      }
    });
  }

  /**
   * Stores the final answers and score. Returns false if the attempt was
   * already submitted (e.g. two submits racing), leaving it unchanged.
   */
  async submit(
    id: string,
    answers: Record<string, string>,
    score: AttemptScore,
    submittedAt: string,
  ): Promise<boolean> {
    return this.db.transaction(async (tx) => {
      const updated = await tx
        .update(attempts)
        .set({
          submittedAt: new Date(submittedAt),
          rawScore: score.rawScore,
          totalQuestions: score.totalQuestions,
          band: score.band,
          updatedAt: sql`now()`,
        })
        .where(and(eq(attempts.id, id), isNull(attempts.submittedAt)))
        .returning({ id: attempts.id });
      if (updated.length === 0) return false;

      await tx.delete(attemptAnswers).where(eq(attemptAnswers.attemptId, id));
      const rows = Object.entries(answers).map(([questionId, value]) => ({
        attemptId: id,
        questionId,
        value,
        isCorrect: score.correct[questionId] ?? false,
      }));
      if (rows.length) await tx.insert(attemptAnswers).values(rows);
      return true;
    });
  }

  /** A user's submitted attempts with their stored scores, newest first. */
  async findSubmittedSummaries(userId: string): Promise<AttemptSummary[]> {
    const rows = await this.db
      .select({
        id: attempts.id,
        testId: attempts.testId,
        testTitle: tests.title,
        skill: tests.skill,
        mode: attempts.mode,
        submittedAt: attempts.submittedAt,
        rawScore: attempts.rawScore,
        totalQuestions: attempts.totalQuestions,
        band: attempts.band,
      })
      .from(attempts)
      .innerJoin(tests, eq(tests.id, attempts.testId))
      .where(and(eq(attempts.userId, userId), isNotNull(attempts.submittedAt)))
      .orderBy(desc(attempts.submittedAt));

    return rows.map((row) => ({
      ...row,
      // Never null here: filtered by the where clause above.
      submittedAt: row.submittedAt?.toISOString() ?? "",
      rawScore: row.rawScore ?? 0,
      totalQuestions: row.totalQuestions ?? 0,
    }));
  }
}
