import { ConflictException, NotFoundException } from "@nestjs/common";
import { Test } from "@nestjs/testing";

import type { TestRecord } from "../tests/test-record";
import { TestsRepository } from "../tests/tests.repository";
import { AttemptsRepository } from "./attempts.repository";
import { AttemptsService, DEADLINE_GRACE_MS } from "./attempts.service";

const READING_TEST = "reading-test";

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

describe("AttemptsService", () => {
  let service: AttemptsService;
  let attempts: AttemptsRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AttemptsService,
        AttemptsRepository,
        { provide: TestsRepository, useValue: fakeTestsRepository },
      ],
    }).compile();

    service = moduleRef.get(AttemptsService);
    attempts = moduleRef.get(AttemptsRepository);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("sets the deadline from the test duration", async () => {
    const session = await service.start(READING_TEST, "exam");

    const durationMs = Date.parse(session.endsAt) - Date.parse(session.startedAt);
    expect(durationMs).toBe(60 * 60_000);
    expect(session.submittedAt).toBeNull();
  });

  it("rejects unknown and draft tests", async () => {
    await expect(service.start("missing", "exam")).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.start("draft-test", "exam")).rejects.toBeInstanceOf(NotFoundException);
  });

  it("keeps only answers to the test's own questions", async () => {
    const { id } = await service.start(READING_TEST, "exam");

    await service.saveAnswers(id, { "r1-q1": "  TRUE ", "other-q": "x", "r1-q2": "" });

    expect((await service.getSession(id)).answers).toEqual({ "r1-q1": "TRUE" });
  });

  it("grades on submit and blocks further changes", async () => {
    const { id } = await service.start(READING_TEST, "exam");

    const result = await service.submit(id, { "r1-q1": "true", "r1-q2": "FALSE", "r1-q3": "green roofs" });

    expect(result.rawScore).toBe(2);
    expect(result.totalQuestions).toBe(4);
    expect(result.band).toBeNull();
    await expect(service.saveAnswers(id, {})).rejects.toBeInstanceOf(ConflictException);
    await expect(service.submit(id, {})).rejects.toBeInstanceOf(ConflictException);
  });

  it("grades the last autosave when submitted after the deadline", async () => {
    const { id } = await service.start(READING_TEST, "exam");
    await service.saveAnswers(id, { "r1-q1": "TRUE" });

    jest.useFakeTimers({ now: Date.now() + 60 * 60_000 + DEADLINE_GRACE_MS + 1 });
    const result = await service.submit(id, { "r1-q1": "TRUE", "r1-q2": "NOT GIVEN" });

    expect(result.rawScore).toBe(1);
  });

  it("has no result before submission", async () => {
    const { id } = await service.start(READING_TEST, "exam");

    await expect(service.getResult(id)).rejects.toBeInstanceOf(NotFoundException);
    expect(await attempts.findById(id)).not.toBeNull();
  });
});
