import { seedDemoTests } from "@ielts-mock/db";

import { runWithDatabase } from "./run-with-database";

// `node dist/database/seed.js`: (re)inserts the demo tests on a deployed
// database (run once from the App Platform console). Tests created in the
// admin are not touched.
void runWithDatabase(async (db) => `Seeded ${await seedDemoTests(db)} demo tests.`);
