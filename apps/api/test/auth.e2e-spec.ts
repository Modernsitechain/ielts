import { randomUUID } from "node:crypto";

import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { eq, setUserRole, users } from "@ielts-mock/db";
import type { AdminTest, CurrentUser } from "@ielts-mock/question-schema";
import request from "supertest";
import type { App } from "supertest/types";

import { AppModule } from "../src/app.module";
import { DATABASE, type Database } from "../src/database/database.module";
import { fakeWorkos } from "./auth-helpers";

// Sign-in and roles against the test database (.env.test), with WorkOS faked.

describe("Auth (e2e)", () => {
  let app: INestApplication<App>;
  let db: Database;
  let workos: Awaited<ReturnType<typeof fakeWorkos>>;
  const workosUserId = `user_e2e_${randomUUID()}`;
  const email = `${workosUserId}@example.com`;
  let token: string;
  let testId: string | undefined;

  beforeAll(async () => {
    workos = await fakeWorkos();
    const moduleRef = await workos
      .override(Test.createTestingModule({ imports: [AppModule] }))
      .compile();
    app = moduleRef.createNestApplication();
    await app.init();
    db = app.get(DATABASE);
    token = await workos.signIn({ id: workosUserId, email, name: "Eve Tester" });
  });

  afterAll(async () => {
    if (testId) {
      await request(app.getHttpServer())
        .delete(`/admin/tests/${testId}`)
        .set("Authorization", `Bearer ${token}`);
    }
    await db.delete(users).where(eq(users.workosUserId, workosUserId));
    await app.close();
  });

  it("rejects requests without a valid token", async () => {
    await request(app.getHttpServer()).get("/me").expect(401);
    await request(app.getHttpServer()).get("/me").set("Authorization", "Bearer nope").expect(401);
  });

  it("creates a student on first sign-in", async () => {
    const response = await request(app.getHttpServer())
      .get("/me")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
    expect(response.body).toMatchObject({ email, name: "Eve Tester", role: "student" });

    // Signing in again returns the same user.
    const again = await request(app.getHttpServer())
      .get("/me")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
    expect((again.body as CurrentUser).id).toBe((response.body as CurrentUser).id);
  });

  it("keeps students out of the admin endpoints", async () => {
    await request(app.getHttpServer())
      .get("/admin/tests")
      .set("Authorization", `Bearer ${token}`)
      .expect(403);
  });

  it("lets editors edit but only admins publish", async () => {
    const server = app.getHttpServer();
    const auth = { Authorization: `Bearer ${token}` };
    await setUserRole(db, email, "editor");

    const created = await request(server).post("/admin/tests").set(auth).send({ title: "Draft" }).expect(201);
    testId = (created.body as AdminTest).id;
    await request(server).post(`/admin/tests/${testId}/publish`).set(auth).expect(403);

    await setUserRole(db, email, "admin");
    // Not publishable (empty), but past the role check.
    await request(server).post(`/admin/tests/${testId}/publish`).set(auth).expect(422);
  });
});
