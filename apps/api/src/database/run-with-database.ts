import { drizzle, schema } from "@ielts-mock/db";
import { Pool } from "pg";

import { validateEnv } from "../config/env";
import type { Database } from "./database.module";
import { buildPoolConfig } from "./pool-config";

/**
 * For one-off scripts (migrate, seed) that run in the API image without
 * starting NestJS. Uses the same env validation and SSL settings as the API.
 */
export async function runWithDatabase(task: (db: Database) => Promise<string>): Promise<void> {
  const env = validateEnv(process.env);
  const pool = new Pool(buildPoolConfig(env.DATABASE_URL, env.DATABASE_CA_CERT));
  try {
    console.log(await task(drizzle({ client: pool, schema })));
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}
