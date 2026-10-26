import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { loadDatabaseUrl } from "./load-env.js";
import * as schema from "./schema.js";
import { parseSetRoleArgs, setUserRole } from "./users.js";

// `pnpm db:set-role <email> <role>` on a laptop. Deployed databases use the API
// image instead (apps/api/src/database/set-role.ts), which adds the SSL settings.

const { email, role } = parseSetRoleArgs(process.argv.slice(2));
const pool = new Pool({ connectionString: loadDatabaseUrl() });
try {
  const found = await setUserRole(drizzle({ client: pool, schema }), email, role);
  console.log(found ? `${email} is now ${role}.` : `No user with email ${email}. Sign in once first.`);
  if (!found) process.exitCode = 1;
} finally {
  await pool.end();
}
