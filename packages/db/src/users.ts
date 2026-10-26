import type { UserRole } from "@ielts-mock/question-schema";
import { eq, sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import * as schema from "./schema.js";

/**
 * Gives an existing user a role (e.g. the first admin). Users only exist after
 * their first sign-in. Returns false when no user has that email.
 */
export async function setUserRole(
  db: NodePgDatabase<typeof schema>,
  email: string,
  role: UserRole,
): Promise<boolean> {
  const updated = await db
    .update(schema.users)
    .set({ role, updatedAt: sql`now()` })
    .where(eq(sql`lower(${schema.users.email})`, email.trim().toLowerCase()))
    .returning({ id: schema.users.id });
  return updated.length > 0;
}

/** Parses `<email> <role>` from a script's arguments. */
export function parseSetRoleArgs(args: readonly string[]): { email: string; role: UserRole } {
  const [email, role] = args;
  if (!email || !schema.userRoleEnum.enumValues.includes(role as UserRole)) {
    throw new Error(
      `Usage: set-role <email> <${schema.userRoleEnum.enumValues.join("|")}>`,
    );
  }
  return { email, role: role as UserRole };
}
