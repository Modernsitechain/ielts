import "server-only";

import { z } from "zod";

// Every environment variable the admin app reads on the server is declared and
// validated here. See docs/environments.md.
const envSchema = z
  .object({
    /** Never production: the admin is only deployed there once WorkOS login exists. */
    APP_ENV: z.enum(["local", "development"]).default("local"),
    /** Base URL of apps/api, reached from the server only. */
    API_URL: z.url().default("http://localhost:4000"),
    /** Sent as x-admin-key; must match ADMIN_API_KEY in apps/api. Never sent to the browser. */
    ADMIN_API_KEY: z.string().min(32, "Copy ADMIN_API_KEY from apps/api/.env into apps/admin/.env.local"),
    /** Temporary password gate in front of the whole admin (see proxy.ts). */
    ADMIN_BASIC_AUTH_USER: z.string().min(1).optional(),
    ADMIN_BASIC_AUTH_PASSWORD: z.string().min(16).optional(),
  })
  .refine(
    (env) => env.APP_ENV === "local" || (env.ADMIN_BASIC_AUTH_USER && env.ADMIN_BASIC_AUTH_PASSWORD),
    {
      message: "ADMIN_BASIC_AUTH_USER and ADMIN_BASIC_AUTH_PASSWORD are required outside local",
      path: ["ADMIN_BASIC_AUTH_PASSWORD"],
    },
  );

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
