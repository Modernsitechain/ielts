import { Injectable } from "@nestjs/common";

import { listeningDemo1 } from "./data/listening-demo-1";
import { readingDemo1 } from "./data/reading-demo-1";
import type { TestRecord } from "./test-record";

/**
 * Data access for tests. Reads in-memory demo data for now; will query
 * PostgreSQL through Drizzle once the schema exists (Phase 2), keeping the
 * same methods.
 */
@Injectable()
export class TestsRepository {
  private readonly tests: TestRecord[] = [readingDemo1, listeningDemo1];

  async findAll(): Promise<TestRecord[]> {
    return this.tests;
  }

  async findById(id: string): Promise<TestRecord | null> {
    return this.tests.find((test) => test.id === id) ?? null;
  }
}
