import type { INestApplication } from "@nestjs/common";
import { randomUUID } from "node:crypto";

import { Test } from "@nestjs/testing";
import { eq, setUserRole, users } from "@ielts-mock/db";
import type { AdminTest, TestInput } from "@ielts-mock/question-schema";
import request from "supertest";
import type { App } from "supertest/types";

import { AppModule } from "../src/app.module";
import { DATABASE, type Database } from "../src/database/database.module";
import { fakeWorkos } from "./auth-helpers";

// Full admin flow against the test database (.env.test), signed in as an
// admin through a fake WorkOS. Needs the tables: run `DB_ENV=test pnpm
// db:migrate` once (see packages/db/AGENTS.md). Roles: test/auth.e2e-spec.ts.

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
  let db: Database;
  let auth: { Authorization: string };
  let testId: string | undefined;
  const workosUserId = `user_e2e_${randomUUID()}`;

  beforeAll(async () => {
    const workos = await fakeWorkos();
    const moduleRef = await workos
      .override(Test.createTestingModule({ imports: [AppModule] }))
      .compile();
    app = moduleRef.createNestApplication();
    await app.init();
    db = app.get(DATABASE);

    const email = `${workosUserId}@example.com`;
    auth = { Authorization: `Bearer ${await workos.signIn({ id: workosUserId, email, name: null })}` };
    await request(app.getHttpServer()).get("/me").set(auth).expect(200); // creates the user
    await setUserRole(db, email, "admin");
  });

  afterAll(async () => {
    if (testId) {
      const admin = () => request(app.getHttpServer());
      await admin().post(`/admin/tests/${testId}/unpublish`).set(auth);
      await admin().delete(`/admin/tests/${testId}`).set(auth);
    }
    await db.delete(users).where(eq(users.workosUserId, workosUserId));
    await app.close();
  });

  it("rejects requests without a signed-in user", async () => {
    await request(app.getHttpServer()).get("/admin/tests").expect(401);
    await request(app.getHttpServer()).get("/admin/tests").set("x-admin-key", "old-key").expect(401);
  });

  it("creates, fills, publishes and unpublishes a test", async () => {
    const server = app.getHttpServer();
    const created = await request(server)
      .post("/admin/tests")
      .set(auth)
      .send({ title: "Draft" })
      .expect(201);
    testId = (created.body as AdminTest).id;

    // Drafts are invisible to candidates.
    await request(server).get(`/tests/${testId}`).expect(404);

    const saved = await request(server)
      .put(`/admin/tests/${testId}`)
      .set(auth)
      .send(content)
      .expect(200);
    const question = (saved.body as AdminTest).sections[0]?.groups[0]?.questions[0];
    expect(question).toMatchObject({ answers: ["B"] });

    // Saving again keeps existing ids.
    const resaved = await request(server)
      .put(`/admin/tests/${testId}`)
      .set(auth)
      .send(saved.body)
      .expect(200);
    expect((resaved.body as AdminTest).sections[0]?.groups[0]?.questions[0]?.id).toBe(question?.id);

    await request(server)
      .post(`/admin/tests/${testId}/publish`)
      .set(auth)
      .expect(200);

    const publicTest = await request(server).get(`/tests/${testId}`).expect(200);
    expect(publicTest.body).toMatchObject({ title: "E2E Reading test", questionCount: 1 });
    expect(JSON.stringify(publicTest.body)).not.toContain("answers");

    // Published tests are read-only.
    await request(server)
      .put(`/admin/tests/${testId}`)
      .set(auth)
      .send(content)
      .expect(409);

    await request(server)
      .post(`/admin/tests/${testId}/unpublish`)
      .set(auth)
      .expect(200);
    await request(server).get(`/tests/${testId}`).expect(404);
  });

  it("refuses to publish an incomplete test", async () => {
    const created = await request(app.getHttpServer())
      .post("/admin/tests")
      .set(auth)
      .send({ title: "Empty" })
      .expect(201);
    const id = (created.body as AdminTest).id;

    const response = await request(app.getHttpServer())
      .post(`/admin/tests/${id}/publish`)
      .set(auth)
      .expect(422);
    expect(response.body).toMatchObject({ errors: ["Add at least one passage."] });

    await request(app.getHttpServer()).delete(`/admin/tests/${id}`).set(auth).expect(204);
  });
});
