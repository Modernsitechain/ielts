import { Global, Inject, Module, type OnApplicationShutdown } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { drizzle, type NodePgDatabase, schema } from "@ielts-mock/db";
import { Pool } from "pg";

import type { Env } from "../config/env";
import { buildPoolConfig } from "./pool-config";

/** Injection token for the Drizzle client: `@Inject(DATABASE) db: Database`. */
export const DATABASE = Symbol("DATABASE");
const PG_POOL = Symbol("PG_POOL");

/** Drizzle client with the schema from packages/db (enables `db.query.<table>`). */
export type Database = NodePgDatabase<typeof schema>;

/**
 * Provides one shared PostgreSQL connection pool and a Drizzle client on top
 * of it. Global, so any module can inject DATABASE without importing this.
 */
@Global()
@Module({
  providers: [
    {
      provide: PG_POOL,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) =>
        new Pool(
          buildPoolConfig(
            config.get("DATABASE_URL", { infer: true }),
            config.get("DATABASE_CA_CERT", { infer: true }),
          ),
        ),
    },
    {
      provide: DATABASE,
      inject: [PG_POOL],
      useFactory: (pool: Pool): Database => drizzle({ client: pool, schema }),
    },
  ],
  exports: [DATABASE],
})
export class DatabaseModule implements OnApplicationShutdown {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async onApplicationShutdown(): Promise<void> {
    await this.pool.end();
  }
}
