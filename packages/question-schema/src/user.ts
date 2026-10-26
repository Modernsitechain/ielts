import { z } from "zod";

// Users sign in with WorkOS; their role is stored and checked by apps/api.
// - student: takes tests in apps/web
// - editor: creates and edits tests in apps/admin
// - admin: everything an editor can do, plus publishing and managing users

export const USER_ROLES = ["student", "editor", "admin"] as const;
export const userRoleSchema = z.enum(USER_ROLES);
export type UserRole = z.infer<typeof userRoleSchema>;

/** Roles allowed into apps/admin. */
export const ADMIN_APP_ROLES: readonly UserRole[] = ["editor", "admin"];

/** Response of GET /me: the signed-in user. */
export type CurrentUser = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
};
