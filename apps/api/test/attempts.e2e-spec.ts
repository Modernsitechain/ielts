import { randomUUID } from "node:crypto";

import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { eq, seedDemoTests, setUserRole, users } from "@ielts-mock/db";
import type {
  AdminTest,
  AttemptResult,
  AttemptSession,
  AttemptSummary,
  TestInput,
} from "@ielts-mock/question-schema";
import request from "supertest";
import type { App } from "supertest/types";

import { AppModule } from "../src/app.module";
import { DATABASE, type Database } from "../src/database/database.module";
import { fakeWorkos } from "./auth-helpers";

// Attempts stored in PostgreSQL (.env.test): they survive an API restart, keep
// their score, and protect their test from deletion. WorkOS is faked.

type Workos = Awaited<ReturnType<typeof fakeWorkos>>;

async function startApp(workos: Workos): Promise<INestApplication<App>> {
  const moduleRef = await workos.override(Test.createTestingModule({ imports: [AppModule] })).compile();
  const app = moduleRef.createNestApplication();
  await app.init();
  return app;
}

const content: TestInput = {
  title: "E2E attempts test",
  isFree: true,
  durationMinutes: 60,
  sections: [
    {
      title: "Passage 1",
      paragraphs: [{ label: "A", text: "Bees live in hives." }],
      groups: [
        {
          instructions: "TRUE, FALSE or NOT GIVEN",
          payload: { type: "true_false_not_given" },
          questions: [
            { prompt: "Bees live in hives.", options: null, answers: ["TRUE"] },
            { prompt: "Bees live underwater.", options: null, answers: ["FALSE"] },
          ],
        },
      ],
    },
  ],
};

describe("Attempts (e2e)", () => {
  let workos: Workos;
  let app: INestApplication<App>;
  let db: Database;
  const userIds: string[] = [];
  let candidate: { Authorization: string };
  let admin: { Authorization: string };
  let testId: string;
  let questionIds: string[];

  async function signIn(role: "student" | "admin") {
    const id = `user_e2e_${randomUUID()}`;
    userIds.push(id);
    const email = `${id}@example.com`;
    const auth = { Authorization: `Bearer ${await workos.signIn({ id, email, name: null })}` };
    await request(app.getHttpServer()).get("/me").set(auth).expect(200);
    if (role !== "student") await setUserRole(db, email, role);
    return auth;
  }

  beforeAll(async () => {
    workos = await fakeWorkos();
    app = await startApp(workos);
    db = app.get(DATABASE);
    await seedDemoTests(db);
    candidate = await signIn("student");
    admin = await signIn("admin");

    // A published test of our own, so the deletion check below is isolated.
    const server = app.getHttpServer();
    const created = await request(server).post("/admin/tests").set(admin).send({ title: "Draft" }).expect(201);
    testId = (created.body as AdminTest).id;
    const saved = await request(server).put(`/admin/tests/${testId}`).set(admin).send(content).expect(200);
    questionIds = (saved.body as AdminTest).sections[0]?.groups[0]?.questions.map((q) => q.id) ?? [];
    await request(server).post(`/admin/tests/${testId}/publish`).set(admin).expect(200);
  });

  afterAll(async () => {
    // The candidate first: deleting a user removes their attempts (ON DELETE
    // CASCADE), which makes the test deletable; the admin goes last.
    const [candidateId, adminId] = userIds;
    if (candidateId) await db.delete(users).where(eq(users.workosUserId, candidateId));
    const server = app.getHttpServer();
    await request(server).post(`/admin/tests/${testId}/unpublish`).set(admin);
    await request(server).delete(`/admin/tests/${testId}`).set(admin).expect(204);
    if (adminId) await db.delete(users).where(eq(users.workosUserId, adminId));
    await app.close();
  });

  it("keeps answers and results across an API restart", async () => {
    const started = await request(app.getHttpServer())
      .post("/attempts")
      .set(candidate)
      .send({ testId, mode: "exam" })
      .expect(201);
    const attemptId = (started.body as AttemptSession).id;
    const [first = "", second = ""] = questionIds;

    await request(app.getHttpServer())
      .put(`/attempts/${attemptId}/answers`)
      .set(candidate)
      .send({ answers: { [first]: "TRUE" } })
      .expect(204);

    // A fresh app instance (like a redeploy) reads the same database.
    const restarted = await startApp(workos);
    try {
      const session = await request(restarted.getHttpServer())
        .get(`/attempts/${attemptId}`)
        .set(candidate)
        .expect(200);
      expect((session.body as AttemptSession).answers).toEqual({ [first]: "TRUE" });

      const submitted = await request(restarted.getHttpServer())
        .post(`/attempts/${attemptId}/submit`)
        .set(candidate)
        .send({ answers: { [first]: "TRUE", [second]: "TRUE" } })
        .expect(200);
      expect(submitted.body).toMatchObject({ rawScore: 1, totalQuestions: 2 });

      await request(restarted.getHttpServer())
        .post(`/attempts/${attemptId}/submit`)
        .set(candidate)
        .send({ answers: {} })
        .expect(409);
    } finally {
      await restarted.close();
    }

    const history = await request(app.getHttpServer()).get("/attempts").set(candidate).expect(200);
    expect(history.body as AttemptSummary[]).toEqual([
      expect.objectContaining({ id: attemptId, testTitle: "E2E attempts test", rawScore: 1 }),
    ]);
    const result = await request(app.getHttpServer())
      .get(`/attempts/${attemptId}/result`)
      .set(candidate)
      .expect(200);
    expect((result.body as AttemptResult).items.map((item) => item.isCorrect)).toEqual([true, false]);
  });

  it("stores flagged questions", async () => {
    const server = app.getHttpServer();
    const started = await request(server).post("/attempts").set(candidate).send({ testId, mode: "exam" }).expect(201);
    const session = started.body as AttemptSession;
    expect(session.flaggedQuestionIds).toEqual([]);

    const flagged = [questionIds[1] ?? ""];
    await request(server).put(`/attempts/${session.id}/flags`).set(candidate).send({ questionIds: flagged }).expect(204);
    const reloaded = await request(server).get(`/attempts/${session.id}`).set(candidate).expect(200);
    expect((reloaded.body as AttemptSession).flaggedQuestionIds).toEqual(flagged);

    await request(server)
      .put(`/attempts/${session.id}/flags`)
      .set(candidate)
      .send({ questionIds: ["not-a-question"] })
      .expect(400);
  });

  it("stores highlights and notes on the test's text", async () => {
    const server = app.getHttpServer();
    const started = await request(server).post("/attempts").set(candidate).send({ testId, mode: "exam" }).expect(201);
    const session = started.body as AttemptSession;
    expect(session.annotations).toEqual([]);

    const sectionId = (
      (await request(server).get(`/admin/tests/${testId}`).set(admin).expect(200)).body as AdminTest
    ).sections[0]?.id;
    const annotations = [
      { blockId: `p:${sectionId}:0`, start: 0, end: 4, note: "Key word" },
      { blockId: `q:${questionIds[0]}:0`, start: 5, end: 9, note: null },
    ];
    await request(server).put(`/attempts/${session.id}/annotations`).set(candidate).send({ annotations }).expect(204);

    const reloaded = await request(server).get(`/attempts/${session.id}`).set(candidate).expect(200);
    expect((reloaded.body as AttemptSession).annotations).toEqual(annotations);

    // Unknown text, out-of-range offsets and other users are refused.
    await request(server)
      .put(`/attempts/${session.id}/annotations`)
      .set(candidate)
      .send({ annotations: [{ blockId: "p:nope:0", start: 0, end: 4, note: null }] })
      .expect(400);
    await request(server)
      .put(`/attempts/${session.id}/annotations`)
      .set(candidate)
      .send({ annotations: [{ ...annotations[0], end: 9999 }] })
      .expect(400);
    await request(server).put(`/attempts/${session.id}/annotations`).set(admin).send({ annotations }).expect(404);
  });

  it("refuses to delete a test that has attempts", async () => {
    const server = app.getHttpServer();
    await request(server).post(`/admin/tests/${testId}/unpublish`).set(admin).expect(200);
    const response = await request(server).delete(`/admin/tests/${testId}`).set(admin).expect(409);
    expect(response.body).toMatchObject({ message: expect.stringContaining("can't be deleted") });
    await request(server).post(`/admin/tests/${testId}/publish`).set(admin).expect(200);
  });
});
