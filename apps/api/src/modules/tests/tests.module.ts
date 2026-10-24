import { Module } from "@nestjs/common";

import { TestsController } from "./tests.controller";
import { TestsRepository } from "./tests.repository";
import { TestsService } from "./tests.service";

@Module({
  controllers: [TestsController],
  providers: [TestsService, TestsRepository],
  // The attempts module needs answer keys for grading, so it reads the repository.
  exports: [TestsRepository],
})
export class TestsModule {}
