import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import type { AdminTest, TestInput } from "@ielts-mock/question-schema";
import request from "supertest";
import type { App } from "supertest/types";

import { AppModule } from "../src/app.module";

// Full admin flow against the test database (.env.test). Needs the tables:
// run `DB_ENV=test pnpm db:migrate` once (see packages/db/AGENTS.md).
// Set in test/setup-env.ts, before the app's configuration is loaded.
const ADMIN_KEY = process.env.ADMIN_API_KEY ?? "";

const content: TestInput = {
  title: "E2E Reading test",
  isFree: true,
  durationMinutes: 60,
  sections: [
    {
      title: "Passage 1",
      paragraphs: [
        { label: "A", text: "Bees live in hives." },
        { label: "B", text: "Hives are kept on roofs." },
      ],
      groups: [
        {
          instructions: "Which paragraph contains the following information?",
          payload: { type: "matching_information" },
          questions: [{ prompt: "Where bees are kept", options: null, answers: ["B"] }],
        },
      ],
    },
  ],
};

describe("Admin tests (e2e)", () => {
  let app: INestApplication<App>;
  let testId: string | undefined;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (testId) {
      const admin = () => request(app.getHttpServer());
      await admin().post(`/admin/tests/${testId}/unpublish`).set("x-admin-key", ADMIN_KEY);
      await admin().delete(`/admin/tests/${testId}`).set("x-admin-key", ADMIN_KEY);
    }
    await app.close();
  });

  it("rejects requests without the admin key", async () => {
    await request(app.getHttpServer()).get("/admin/tests").expect(401);
    await request(app.getHttpServer()).get("/admin/tests").set("x-admin-key", "wrong").expect(401);
  });

  it("creates, fills, publishes and unpublishes a test", async () => {
    const server = app.getHttpServer();
    const created = await request(server)
      .post("/admin/tests")
      .set("x-admin-key", ADMIN_KEY)
      .send({ title: "Draft" })
      .expect(201);
    testId = (created.body as AdminTest).id;

    // Drafts are invisible to candidates.
    await request(server).get(`/tests/${testId}`).expect(404);

    const saved = await request(server)
      .put(`/admin/tests/${testId}`)
      .set("x-admin-key", ADMIN_KEY)
      .send(content)
      .expect(200);
    const question = (saved.body as AdminTest).sections[0]?.groups[0]?.questions[0];
    expect(question).toMatchObject({ answers: ["B"] });

    // Saving again keeps existing ids.
    const resaved = await request(server)
      .put(`/admin/tests/${testId}`)
      .set("x-admin-key", ADMIN_KEY)
      .send(saved.body)
      .expect(200);
    expect((resaved.body as AdminTest).sections[0]?.groups[0]?.questions[0]?.id).toBe(question?.id);

    await request(server)
      .post(`/admin/tests/${testId}/publish`)
      .set("x-admin-key", ADMIN_KEY)
      .expect(200);

    const publicTest = await request(server).get(`/tests/${testId}`).expect(200);
    expect(publicTest.body).toMatchObject({ title: "E2E Reading test", questionCount: 1 });
    expect(JSON.stringify(publicTest.body)).not.toContain("answers");

    // Published tests are read-only.
    await request(server)
      .put(`/admin/tests/${testId}`)
      .set("x-admin-key", ADMIN_KEY)
      .send(content)
      .expect(409);

    await request(server)
      .post(`/admin/tests/${testId}/unpublish`)
      .set("x-admin-key", ADMIN_KEY)
      .expect(200);
    await request(server).get(`/tests/${testId}`).expect(404);
  });

  it("refuses to publish an incomplete test", async () => {
    const created = await request(app.getHttpServer())
      .post("/admin/tests")
      .set("x-admin-key", ADMIN_KEY)
      .send({ title: "Empty" })
      .expect(201);
    const id = (created.body as AdminTest).id;

    const response = await request(app.getHttpServer())
      .post(`/admin/tests/${id}/publish`)
      .set("x-admin-key", ADMIN_KEY)
      .expect(422);
    expect(response.body).toMatchObject({ errors: ["Add at least one passage."] });

    await request(app.getHttpServer()).delete(`/admin/tests/${id}`).set("x-admin-key", ADMIN_KEY).expect(204);
  });
});
