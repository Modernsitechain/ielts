import { Module } from "@nestjs/common";

import { TestsModule } from "../tests/tests.module";
import { AttemptsController } from "./attempts.controller";
import { AttemptsRepository } from "./attempts.repository";
import { AttemptsService } from "./attempts.service";

@Module({
  imports: [TestsModule],
  controllers: [AttemptsController],
  providers: [AttemptsService, AttemptsRepository],
})
export class AttemptsModule {}
