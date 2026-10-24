import { ServiceUnavailableException } from "@nestjs/common";
import { Test } from "@nestjs/testing";

import { HealthController } from "./health.controller";
import { HealthService } from "./health.service";

describe("HealthController", () => {
  let controller: HealthController;
  const healthService = { check: jest.fn() };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: HealthService, useValue: healthService }],
    }).compile();

    controller = moduleRef.get(HealthController);
  });

  it("returns the status when the database is up", async () => {
    healthService.check.mockResolvedValue({ status: "ok", database: "up" });

    await expect(controller.check()).resolves.toEqual({ status: "ok", database: "up" });
  });

  it("responds with 503 when the database is down", async () => {
    healthService.check.mockResolvedValue({ status: "error", database: "down" });

    await expect(controller.check()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
