import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import type { App } from "supertest/types";

import { AppModule } from "../src/app.module";

// Boots the whole app against the test database (.env.test).
describe("GET /health (e2e)", () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("reports the API and database as up", () => {
    return request(app.getHttpServer())
      .get("/health")
      .expect(200)
      .expect({ status: "ok", database: "up" });
  });
});
