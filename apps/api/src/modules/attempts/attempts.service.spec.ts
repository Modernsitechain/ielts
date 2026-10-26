import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import { Test } from "@nestjs/testing";

import { randomUUID } from "node:crypto";

import type { Annotation, AttemptSummary } from "@ielts-mock/question-schema";

import type { TestRecord } from "../tests/test-record";
import { TestsRepository } from "../tests/tests.repository";
import type { AttemptRecord, AttemptScore, NewAttempt } from "./attempt-record";
import { AttemptsRepository } from "./attempts.repository";
import { AttemptsService, DEADLINE_GRACE_MS } from "./attempts.service";

const READING_TEST = "reading-test";
const USER = "user-1";

function question(id: string, number: number) {
  return { id, number, prompt: `Question ${number}`, options: null };
}

const readingTest: TestRecord = {
  id: READING_TEST,
  title: "Reading test",
  skill: "reading",
  module: "academic",
  isFree: true,
  durationMinutes: 60,
  status: "published",
  sections: [
    {
      id: "s1",
      order: 1,
      kind: "passage",
      title: "Passage 1",
      paragraphs: [{ label: "A", text: "Text." }],
      audioUrl: null,
      groups: [
        {
          id: "g1",
          order: 1,
          numberFrom: 1,
          numberTo: 2,
          instructions: "TRUE, FALSE or NOT GIVEN",
          payload: { type: "true_false_not_given" },
          questions: [question("r1-q1", 1), question("r1-q2", 2)],
        },
        {
          id: "g2",
          order: 2,
          numberFrom: 3,
          numberTo: 4,
          instructions: "Complete the sentences.",
          payload: { type: "sentence_completion", maxWords: 2, allowNumber: true },
          questions: [question("r1-q3", 3), question("r1-q4", 4)],
        },
      ],
    },
  ],
  answerKey: {
    "r1-q1": ["TRUE"],
    "r1-q2": ["NOT GIVEN"],
    "r1-q3": ["green roofs"],
    "r1-q4": ["native flowering"],
  },
};

/** Stands in for the database-backed repository. */
const storedTests: Record<string, TestRecord> = {
  [READING_TEST]: readingTest,
  "draft-test": { ...readingTest, id: "draft-test", status: "draft" },
};
const fakeTestsRepository: Pick<TestsRepository, "findById"> = {
  findById: async (id) => storedTests[id] ?? null,
};

/** In-memory stand-in for the PostgreSQL repository. */
class FakeAttemptsRepository
  implements
    Pick<
      AttemptsRepository,
      "create" | "findById" | "saveAnswers" | "saveAnnotations" | "submit" | "findSubmittedSummaries"
    >
{
  readonly rows = new Map<string, AttemptRecord>();

  async create(attempt: NewAttempt): Promise<AttemptRecord> {
    const record: AttemptRecord = {
      ...attempt,
      id: randomUUID(),
      submittedAt: null,
      answers: {},
      annotations: [],
      score: null,
    };
    this.rows.set(record.id, record);
    return structuredClone(record);
  }

  async findById(id: string): Promise<AttemptRecord | null> {
    const record = this.rows.get(id);
    return record ? structuredClone(record) : null;
  }

  async saveAnswers(id: string, answers: Record<string, string>): Promise<void> {
    const record = this.rows.get(id);
    if (record) record.answers = { ...answers };
  }

  async saveAnnotations(id: string, list: Annotation[]): Promise<void> {
    const record = this.rows.get(id);
    if (record) record.annotations = structuredClone(list);
  }

  async submit(id: string, answers: Record<string, string>, score: AttemptScore, submittedAt: string) {
    const record = this.rows.get(id);
    if (!record || record.submittedAt) return false;
    Object.assign(record, { answers: { ...answers }, score, submittedAt });
    return true;
  }

  async findSubmittedSummaries(userId: string): Promise<AttemptSummary[]> {
    return [...this.rows.values()]
      .filter((record) => record.userId === userId && record.score && record.submittedAt)
      .map((record) => ({
        id: record.id,
        testId: record.testId,
        testTitle: storedTests[record.testId]?.title ?? "",
        skill: "reading" as const,
        mode: record.mode,
        submittedAt: record.submittedAt ?? "",
        rawScore: record.score?.rawScore ?? 0,
        totalQuestions: record.score?.totalQuestions ?? 0,
        band: record.score?.band ?? null,
      }));
  }
}

describe("AttemptsService", () => {
  let service: AttemptsService;
  let attempts: FakeAttemptsRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AttemptsService,
        { provide: AttemptsRepository, useClass: FakeAttemptsRepository },
        { provide: TestsRepository, useValue: fakeTestsRepository },
      ],
    }).compile();

    service = moduleRef.get(AttemptsService);
    attempts = moduleRef.get(AttemptsRepository) as unknown as FakeAttemptsRepository;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("sets the deadline from the test duration", async () => {
    const session = await service.start(USER, READING_TEST, "exam");

    const durationMs = Date.parse(session.endsAt) - Date.parse(session.startedAt);
    expect(durationMs).toBe(60 * 60_000);
    expect(session.submittedAt).toBeNull();
  });

  it("rejects unknown and draft tests", async () => {
    await expect(service.start(USER, "missing", "exam")).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.start(USER, "draft-test", "exam")).rejects.toBeInstanceOf(NotFoundException);
  });

  it("keeps only answers to the test's own questions", async () => {
    const { id } = await service.start(USER, READING_TEST, "exam");

    await service.saveAnswers(USER, id, { "r1-q1": "  TRUE ", "other-q": "x", "r1-q2": "" });

    expect((await service.getSession(USER, id)).answers).toEqual({ "r1-q1": "TRUE" });
  });

  it("grades on submit and blocks further changes", async () => {
    const { id } = await service.start(USER, READING_TEST, "exam");

    const result = await service.submit(USER, id, { "r1-q1": "true", "r1-q2": "FALSE", "r1-q3": "green roofs" });

    expect(result.rawScore).toBe(2);
    expect(result.totalQuestions).toBe(4);
    expect(result.band).toBeNull();
    await expect(service.saveAnswers(USER, id, {})).rejects.toBeInstanceOf(ConflictException);
    await expect(service.submit(USER, id, {})).rejects.toBeInstanceOf(ConflictException);
  });

  it("grades the last autosave when submitted after the deadline", async () => {
    const { id } = await service.start(USER, READING_TEST, "exam");
    await service.saveAnswers(USER, id, { "r1-q1": "TRUE" });

    jest.useFakeTimers({ now: Date.now() + 60 * 60_000 + DEADLINE_GRACE_MS + 1 });
    const result = await service.submit(USER, id, { "r1-q1": "TRUE", "r1-q2": "NOT GIVEN" });

    expect(result.rawScore).toBe(1);
  });

  it("has no result before submission", async () => {
    const { id } = await service.start(USER, READING_TEST, "exam");

    await expect(service.getResult(USER, id)).rejects.toBeInstanceOf(NotFoundException);
    expect(await attempts.findById(id)).not.toBeNull();
  });

  it("stores the score at submission and lists it in the history", async () => {
    const { id } = await service.start(USER, READING_TEST, "exam");
    await service.submit(USER, id, { "r1-q1": "TRUE", "r1-q2": "FALSE" });

    expect(attempts.rows.get(id)?.score).toMatchObject({
      rawScore: 1,
      totalQuestions: 4,
      correct: { "r1-q1": true, "r1-q2": false },
    });
    expect(await service.listSubmitted(USER)).toMatchObject([{ id, rawScore: 1, totalQuestions: 4 }]);
  });

  it("keeps a past result when the answer key changes later", async () => {
    const { id } = await service.start(USER, READING_TEST, "exam");
    await service.submit(USER, id, { "r1-q1": "TRUE" });

    storedTests[READING_TEST] = { ...readingTest, answerKey: { ...readingTest.answerKey, "r1-q1": ["FALSE"] } };
    try {
      const result = await service.getResult(USER, id);
      expect(result.rawScore).toBe(1);
      expect(result.items.find((item) => item.questionId === "r1-q1")?.isCorrect).toBe(true);
    } finally {
      storedTests[READING_TEST] = readingTest;
    }
  });

  it("rejects a second submit", async () => {
    const { id } = await service.start(USER, READING_TEST, "exam");
    await service.submit(USER, id, {});
    await expect(service.submit(USER, id, {})).rejects.toBeInstanceOf(ConflictException);
  });

  it("saves annotations that point at the test's text", async () => {
    const { id } = await service.start(USER, READING_TEST, "exam");
    const highlight = { blockId: "p:s1:0", start: 0, end: 4, note: "why" };
    await service.saveAnnotations(USER, id, [highlight]);
    expect((await service.getSession(USER, id)).annotations).toEqual([highlight]);

    await expect(
      service.saveAnnotations(USER, id, [{ ...highlight, blockId: "p:other:0" }]),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.saveAnnotations(USER, id, [{ ...highlight, end: 99 }])).rejects.toBeInstanceOf(
      BadRequestException,
    );

    await service.submit(USER, id, {});
    await expect(service.saveAnnotations(USER, id, [])).rejects.toBeInstanceOf(ConflictException);
  });

  it("hides attempts from other users", async () => {
    const { id } = await service.start(USER, READING_TEST, "exam");
    await service.submit(USER, id, {});

    await expect(service.getSession("user-2", id)).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.saveAnswers("user-2", id, {})).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.getResult("user-2", id)).rejects.toBeInstanceOf(NotFoundException);
    expect(await service.listSubmitted("user-2")).toEqual([]);
  });
});
