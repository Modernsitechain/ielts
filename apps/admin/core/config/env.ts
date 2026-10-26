import "server-only";

import { z } from "zod";

// Every environment variable the admin app reads on the server is declared and
// validated here. See docs/environments.md.
const envSchema = z.object({
  /** apps/admin only runs locally until WorkOS login exists (Phase 3). */
  APP_ENV: z.literal("local", "apps/admin is local only until WorkOS login exists").default("local"),
  /** Base URL of apps/api, reached from the server only. */
  API_URL: z.url().default("http://localhost:4000"),
  /** Sent as x-admin-key; must match ADMIN_API_KEY in apps/api/.env. Never sent to the browser. */
  ADMIN_API_KEY: z.string().min(32, "Copy ADMIN_API_KEY from apps/api/.env into apps/admin/.env.local"),
});

type Env = z.infer<typeof envSchema>;
let cached: Env | undefined;

/**
 * Validated environment. Read on first use (not at import), so `next build`
 * works without the admin key; a missing key fails the first request instead.
 */
export function getEnv(): Env {
  if (cached) return cached;
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    throw new Error(`Invalid environment variables:\n${z.prettifyError(result.error)}`);
  }
  cached = result.data;
  return cached;
}
