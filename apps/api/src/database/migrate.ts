import { MIGRATIONS_FOLDER, migrate } from "@ielts-mock/db";

import { runWithDatabase } from "./run-with-database";

// `node dist/database/migrate.js`: applies pending migrations from
// packages/db/drizzle. Runs as the App Platform pre-deploy job, so a failed
// migration stops the deploy before the new API version goes live.
void runWithDatabase(async (db) => {
  await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
  return "Migrations applied.";
});
