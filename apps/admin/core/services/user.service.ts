import "server-only";

import { cache } from "react";

import type { CurrentUser } from "@/core/models/user";
import { apiRequest } from "./api-client";

/**
 * The signed-in user and role from the API, or null when it can't tell (e.g.
 * the session expired). Cached per request: the gate and header both use it.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const result = await apiRequest<CurrentUser>("/me");
  return result.ok ? result.data : null;
});
