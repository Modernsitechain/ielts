import { ConflictException, NotFoundException } from "@nestjs/common";
import { Test } from "@nestjs/testing";

import { TestsRepository } from "../tests/tests.repository";
import { AttemptsRepository } from "./attempts.repository";
import { AttemptsService, DEADLINE_GRACE_MS } from "./attempts.service";

const READING_TEST = "reading-demo-1";

describe("AttemptsService", () => {
  let service: AttemptsService;
  let attempts: AttemptsRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [AttemptsService, AttemptsRepository, TestsRepository],
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

  it("rejects unknown tests", async () => {
    await expect(service.start("missing", "exam")).rejects.toBeInstanceOf(NotFoundException);
  });

  it("keeps only answers to the test's own questions", async () => {
    const { id } = await service.start(READING_TEST, "exam");

    await service.saveAnswers(id, { "r1-q1": "  TRUE ", "other-q": "x", "r1-q2": "" });

    expect((await service.getSession(id)).answers).toEqual({ "r1-q1": "TRUE" });
  });

  it("grades on submit and blocks further changes", async () => {
    const { id } = await service.start(READING_TEST, "exam");

    const result = await service.submit(id, { "r1-q1": "true", "r1-q5": "B", "r1-q8": "green roofs" });

    expect(result.rawScore).toBe(3);
    expect(result.totalQuestions).toBe(9);
    expect(result.band).toBeNull();
    await expect(service.saveAnswers(id, {})).rejects.toBeInstanceOf(ConflictException);
    await expect(service.submit(id, {})).rejects.toBeInstanceOf(ConflictException);
  });

  it("grades the last autosave when submitted after the deadline", async () => {
    const { id } = await service.start(READING_TEST, "exam");
    await service.saveAnswers(id, { "r1-q1": "TRUE" });

    jest.useFakeTimers({ now: Date.now() + 60 * 60_000 + DEADLINE_GRACE_MS + 1 });
    const result = await service.submit(id, { "r1-q1": "TRUE", "r1-q5": "B" });

    expect(result.rawScore).toBe(1);
  });

  it("has no result before submission", async () => {
    const { id } = await service.start(READING_TEST, "exam");

    await expect(service.getResult(id)).rejects.toBeInstanceOf(NotFoundException);
    expect(await attempts.findById(id)).not.toBeNull();
  });
});
