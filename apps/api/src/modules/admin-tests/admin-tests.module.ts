import { Module } from "@nestjs/common";

import { AdminAccessGuard } from "../../common/guards/admin-access.guard";
import { AdminKeyGuard } from "../../common/guards/admin-key.guard";
import { AuthGuard } from "../../common/guards/auth.guard";
import { TestsModule } from "../tests/tests.module";
import { AdminTestsController } from "./admin-tests.controller";
import { AdminTestsService } from "./admin-tests.service";

@Module({
  imports: [TestsModule],
  controllers: [AdminTestsController],
  // Guards AdminAccessGuard combines (it receives them by injection).
  providers: [AdminTestsService, AdminAccessGuard, AdminKeyGuard, AuthGuard],
})
export class AdminTestsModule {}
