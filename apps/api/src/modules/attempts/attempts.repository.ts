import { Injectable } from "@nestjs/common";

import type { AttemptRecord } from "./attempt-record";

const SEED: AttemptRecord[] = [
  {
    id: "attempt-1",
    testId: "reading-demo-1",
    mode: "exam",
    startedAt: "2026-10-20T09:00:00+07:00",
    endsAt: "2026-10-20T10:00:00+07:00",
    submittedAt: "2026-10-20T09:52:00+07:00",
    answers: {
      "r1-q1": "TRUE",
      "r1-q2": "FALSE",
      "r1-q3": "FALSE",
      "r1-q4": "FALSE",
      "r1-q5": "B",
      "r1-q6": "A",
      "r1-q7": "50000",
      "r1-q8": "Green Roofs",
      // Exceeds the two-word limit, so it's marked wrong.
      "r1-q9": "native flowering plants",
    },
  },
];

/**
 * Data access for attempts. Kept in memory for now, so attempts are lost when
 * the API restarts; will be stored in PostgreSQL once the schema exists.
 */
@Injectable()
export class AttemptsRepository {
  private readonly attempts = new Map<string, AttemptRecord>(
    SEED.map((attempt) => [attempt.id, structuredClone(attempt)]),
  );

  async create(attempt: AttemptRecord): Promise<AttemptRecord> {
    this.attempts.set(attempt.id, structuredClone(attempt));
    return attempt;
  }

  async findById(id: string): Promise<AttemptRecord | null> {
    const attempt = this.attempts.get(id);
    return attempt ? structuredClone(attempt) : null;
  }

  async findSubmitted(): Promise<AttemptRecord[]> {
    return [...this.attempts.values()]
      .filter((attempt) => attempt.submittedAt !== null)
      .map((attempt) => structuredClone(attempt));
  }

  async update(
    id: string,
    changes: Partial<Pick<AttemptRecord, "answers" | "submittedAt">>,
  ): Promise<void> {
    const attempt = this.attempts.get(id);
    if (attempt) this.attempts.set(id, { ...attempt, ...changes });
  }
}
