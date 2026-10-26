import { Module } from "@nestjs/common";

import { TestsController } from "./tests.controller";
import { TestsRepository } from "./tests.repository";
import { TestsService } from "./tests.service";

@Module({
  controllers: [TestsController],
  providers: [TestsService, TestsRepository],
  // Attempts need answer keys for grading and admin-tests manages content,
  // so both use the repository directly.
  exports: [TestsRepository],
})
export class TestsModule {}
