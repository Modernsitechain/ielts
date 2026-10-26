import { Injectable } from "@nestjs/common";

import type { AttemptRecord } from "./attempt-record";

/**
 * Data access for attempts. Kept in memory for now, so attempts are lost when
 * the API restarts; will be stored in PostgreSQL once the schema exists.
 */
@Injectable()
export class AttemptsRepository {
  private readonly attempts = new Map<string, AttemptRecord>();

  async create(attempt: AttemptRecord): Promise<AttemptRecord> {
    this.attempts.set(attempt.id, structuredClone(attempt));
    return attempt;
  }

  async findById(id: string): Promise<AttemptRecord | null> {
    const attempt = this.attempts.get(id);
    return attempt ? structuredClone(attempt) : null;
  }

  async findSubmittedByUser(userId: string): Promise<AttemptRecord[]> {
    return [...this.attempts.values()]
      .filter((attempt) => attempt.userId === userId && attempt.submittedAt !== null)
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
