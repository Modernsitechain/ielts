import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { seedDemoTests } from "./demo.js";
import { loadDatabaseUrl } from "./load-env.js";
import * as schema from "./schema.js";

// `pnpm db:seed` on a laptop. Deployed databases are seeded from the API
// image instead (apps/api/src/database/seed.ts), which adds the SSL settings.

const pool = new Pool({ connectionString: loadDatabaseUrl() });
try {
  const count = await seedDemoTests(drizzle({ client: pool, schema }));
  // eslint-disable-next-line no-console -- script output
  console.log(`Seeded ${count} demo tests.`);
} finally {
  await pool.end();
}
