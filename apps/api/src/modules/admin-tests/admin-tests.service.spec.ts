import {
  ConflictException,
  NotFoundException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { Test } from "@nestjs/testing";
import type { AdminTest, TestInput } from "@ielts-mock/question-schema";

import { TestsRepository } from "../tests/tests.repository";
import { AdminTestsService } from "./admin-tests.service";

const completeDraft: AdminTest = {
  id: "t1",
  title: "Reading test",
  skill: "reading",
  module: "academic",
  isFree: false,
  durationMinutes: 60,
  status: "draft",
  createdAt: "2026-10-26T00:00:00.000Z",
  updatedAt: "2026-10-26T00:00:00.000Z",
  publishedAt: null,
  sections: [
    {
      id: "s1",
      title: "Passage 1",
      paragraphs: [{ label: null, text: "Some text." }],
      groups: [
        {
          id: "g1",
          instructions: "Write TRUE, FALSE or NOT GIVEN.",
          payload: { type: "true_false_not_given" },
          questions: [{ id: "q1", prompt: "A statement.", options: null, answers: ["TRUE"] }],
        },
      ],
    },
  ],
};

describe("AdminTestsService", () => {
  let service: AdminTestsService;
  let stored: AdminTest | null;
  const repository = {
    findAdminById: jest.fn(async () => stored),
    replaceContent: jest.fn(async () => undefined),
    setStatus: jest.fn(async () => undefined),
    delete: jest.fn(async () => true),
  };

  beforeEach(async () => {
    stored = structuredClone(completeDraft);
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [AdminTestsService, { provide: TestsRepository, useValue: repository }],
    }).compile();
    service = moduleRef.get(AdminTestsService);
  });

  const input: TestInput = { title: "New title", isFree: true, durationMinutes: 60, sections: [] };

  it("returns 404 for unknown tests", async () => {
    stored = null;
    await expect(service.get("missing")).rejects.toBeInstanceOf(NotFoundException);
  });

  it("saves drafts", async () => {
    await service.save("t1", input);
    expect(repository.replaceContent).toHaveBeenCalledWith("t1", input);
  });

  it("doesn't edit published or Listening tests", async () => {
    stored = { ...completeDraft, status: "published" };
    await expect(service.save("t1", input)).rejects.toBeInstanceOf(ConflictException);

    stored = { ...completeDraft, skill: "listening", module: null };
    await expect(service.save("t1", input)).rejects.toBeInstanceOf(ConflictException);

    expect(repository.replaceContent).not.toHaveBeenCalled();
  });

  it("publishes a complete test", async () => {
    await service.publish("t1");
    expect(repository.setStatus).toHaveBeenCalledWith("t1", "published");
  });

  it("refuses to publish an incomplete test and lists the problems", async () => {
    stored = { ...completeDraft, sections: [] };

    const error = await service.publish("t1").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(UnprocessableEntityException);
    expect((error as UnprocessableEntityException).getResponse()).toMatchObject({
      errors: ["Add at least one passage."],
    });
    expect(repository.setStatus).not.toHaveBeenCalled();
  });

  it("only deletes drafts", async () => {
    stored = { ...completeDraft, status: "published" };
    await expect(service.remove("t1")).rejects.toBeInstanceOf(ConflictException);

    stored = completeDraft;
    await service.remove("t1");
    expect(repository.delete).toHaveBeenCalledWith("t1");
  });

  it("refuses to delete a test that has attempts", async () => {
    stored = completeDraft;
    repository.delete.mockResolvedValueOnce(false);
    await expect(service.remove("t1")).rejects.toBeInstanceOf(ConflictException);
  });
});
