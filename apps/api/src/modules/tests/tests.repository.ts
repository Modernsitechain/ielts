import { randomUUID } from "node:crypto";

import { Inject, Injectable } from "@nestjs/common";
import {
  asc,
  desc,
  eq,
  flattenContent,
  questionGroups,
  questions,
  type SQL,
  sections,
  type SectionNode,
  tests,
} from "@ielts-mock/db";
import type {
  AdminTest,
  AdminTestSummary,
  AnswerKey,
  TestInput,
  TestStatus,
} from "@ielts-mock/question-schema";

import { DATABASE, type Database } from "../../database/database.module";
import type { TestRecord } from "./test-record";

/** Loads one or more tests with all their content, in order. */
function loadTests(db: Pick<Database, "query">, where?: SQL) {
  return db.query.tests.findMany({
    where,
    orderBy: [desc(tests.updatedAt)],
    with: {
      sections: {
        orderBy: [asc(sections.position)],
        with: {
          groups: {
            orderBy: [asc(questionGroups.position)],
            with: { questions: { orderBy: [asc(questions.position)] } },
          },
        },
      },
    },
  });
}

type StoredTest = Awaited<ReturnType<typeof loadTests>>[number];

function countQuestions(test: StoredTest): number {
  return test.sections.reduce(
    (total, section) =>
      total + section.groups.reduce((sum, group) => sum + group.questions.length, 0),
    0,
  );
}

function toTestRecord(test: StoredTest): TestRecord {
  const answerKey: AnswerKey = {};
  return {
    id: test.id,
    title: test.title,
    skill: test.skill,
    module: test.module ?? null,
    isFree: test.isFree,
    durationMinutes: test.durationMinutes,
    status: test.status,
    sections: test.sections.map((section) => ({
      id: section.id,
      order: section.position,
      kind: section.kind,
      title: section.title,
      paragraphs: section.paragraphs,
      audioUrl: section.audioUrl,
      groups: section.groups.map((group) => ({
        id: group.id,
        order: group.position,
        numberFrom: group.questions[0]?.number ?? 0,
        numberTo: group.questions.at(-1)?.number ?? 0,
        instructions: group.instructions,
        payload: group.payload,
        questions: group.questions.map((question) => {
          answerKey[question.id] = question.answers;
          return {
            id: question.id,
            number: question.number,
            prompt: question.prompt,
            options: question.options,
          };
        }),
      })),
    })),
    answerKey,
  };
}

function toAdminSummary(test: StoredTest): AdminTestSummary {
  return {
    id: test.id,
    title: test.title,
    skill: test.skill,
    module: test.module ?? null,
    isFree: test.isFree,
    durationMinutes: test.durationMinutes,
    questionCount: countQuestions(test),
    status: test.status,
    updatedAt: test.updatedAt.toISOString(),
  };
}

function toAdminTest(test: StoredTest): AdminTest {
  return {
    id: test.id,
    title: test.title,
    skill: test.skill,
    module: test.module ?? null,
    isFree: test.isFree,
    durationMinutes: test.durationMinutes,
    status: test.status,
    createdAt: test.createdAt.toISOString(),
    updatedAt: test.updatedAt.toISOString(),
    publishedAt: test.publishedAt?.toISOString() ?? null,
    sections: test.sections.map((section) => ({
      id: section.id,
      title: section.title,
      paragraphs: section.paragraphs ?? [],
      groups: section.groups.map((group) => ({
        id: group.id,
        instructions: group.instructions,
        payload: group.payload,
        questions: group.questions.map((question) => ({
          id: question.id,
          prompt: question.prompt,
          options: question.options,
          answers: question.answers,
        })),
      })),
    })),
  };
}

/**
 * The only place that queries the test tables (tests → sections →
 * question_groups → questions). Candidate-facing reads return TestRecord;
 * the admin methods return AdminTest, which includes answers.
 */
@Injectable()
export class TestsRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async findPublished(): Promise<TestRecord[]> {
    const rows = await loadTests(this.db, eq(tests.status, "published"));
    return rows.map(toTestRecord);
  }

  /** Any status: attempts on a test that was later unpublished still need grading. */
  async findById(id: string): Promise<TestRecord | null> {
    const [row] = await loadTests(this.db, eq(tests.id, id));
    return row ? toTestRecord(row) : null;
  }

  async findAllForAdmin(): Promise<AdminTestSummary[]> {
    const rows = await loadTests(this.db);
    return rows.map(toAdminSummary);
  }

  async findAdminById(id: string): Promise<AdminTest | null> {
    const [row] = await loadTests(this.db, eq(tests.id, id));
    return row ? toAdminTest(row) : null;
  }

  /** New Reading test as an empty draft. */
  async createReadingDraft(title: string): Promise<string> {
    const id = randomUUID();
    await this.db.insert(tests).values({
      id,
      title,
      skill: "reading",
      module: "academic",
      durationMinutes: 60,
    });
    return id;
  }

  /**
   * Replaces the whole content of a test in one transaction. Ids the test
   * already has are kept, so saved answers keep pointing at the same
   * questions; any other id (new items, or ids of another test) gets a new UUID.
   *
   * Content rows are deleted and re-inserted, which is simple and keeps
   * positions consistent. Once attempt answers reference questions by foreign
   * key (Phase 2), this needs to become an upsert.
   */
  async replaceContent(id: string, input: TestInput): Promise<void> {
    await this.db.transaction(async (tx) => {
      const existing = await loadTests(tx, eq(tests.id, id));
      const ownIds = new Set(
        existing.flatMap((test) =>
          test.sections.flatMap((section) => [
            section.id,
            ...section.groups.flatMap((group) => [
              group.id,
              ...group.questions.map((question) => question.id),
            ]),
          ]),
        ),
      );
      const keepId = (itemId?: string) => (itemId && ownIds.has(itemId) ? itemId : randomUUID());

      const tree: SectionNode[] = input.sections.map((section) => ({
        id: keepId(section.id),
        kind: "passage",
        title: section.title,
        paragraphs: section.paragraphs,
        audioUrl: null,
        groups: section.groups.map((group) => ({
          id: keepId(group.id),
          instructions: group.instructions,
          payload: group.payload,
          questions: group.questions.map((question) => ({
            id: keepId(question.id),
            prompt: question.prompt,
            options: question.options,
            answers: question.answers,
          })),
        })),
      }));

      // Groups and questions go with their section (ON DELETE CASCADE).
      await tx.delete(sections).where(eq(sections.testId, id));
      const rows = flattenContent(id, tree);
      if (rows.sections.length) await tx.insert(sections).values(rows.sections);
      if (rows.groups.length) await tx.insert(questionGroups).values(rows.groups);
      if (rows.questions.length) await tx.insert(questions).values(rows.questions);

      await tx
        .update(tests)
        .set({
          title: input.title,
          isFree: input.isFree,
          durationMinutes: input.durationMinutes,
          updatedAt: new Date(),
        })
        .where(eq(tests.id, id));
    });
  }

  async setStatus(id: string, status: TestStatus): Promise<void> {
    const now = new Date();
    await this.db
      .update(tests)
      .set({ status, publishedAt: status === "published" ? now : null, updatedAt: now })
      .where(eq(tests.id, id));
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(tests).where(eq(tests.id, id));
  }
}
