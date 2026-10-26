import { parseSetRoleArgs, setUserRole } from "@ielts-mock/db";

import { runWithDatabase } from "./run-with-database";

// `node dist/database/set-role.js <email> <role>`: gives a user a role on a
// deployed database (App Platform console), e.g. the first admin. The user
// must have signed in once.
const { email, role } = parseSetRoleArgs(process.argv.slice(2));
void runWithDatabase(async (db) => {
  if (await setUserRole(db, email, role)) return `${email} is now ${role}.`;
  throw new Error(`No user with email ${email}. Sign in once first.`);
});
