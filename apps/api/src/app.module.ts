import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { validateEnv } from "./config/env";
import { DatabaseModule } from "./database/database.module";
import { AdminTestsModule } from "./modules/admin-tests/admin-tests.module";
import { AttemptsModule } from "./modules/attempts/attempts.module";
import { HealthModule } from "./modules/health/health.module";
import { TestsModule } from "./modules/tests/tests.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // `.env.test` is used when NODE_ENV=test (Jest sets it), then `.env`.
      envFilePath: [`.env.${process.env.NODE_ENV ?? "development"}`, ".env"],
      validate: validateEnv,
    }),
    DatabaseModule,
    HealthModule,
    TestsModule,
    AttemptsModule,
    AdminTestsModule,
  ],
})
export class AppModule {}
