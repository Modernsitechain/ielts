import { Module } from "@nestjs/common";

import { TestsModule } from "../tests/tests.module";
import { AdminTestsController } from "./admin-tests.controller";
import { AdminTestsService } from "./admin-tests.service";

@Module({
  imports: [TestsModule],
  controllers: [AdminTestsController],
  providers: [AdminTestsService],
})
export class AdminTestsModule {}
