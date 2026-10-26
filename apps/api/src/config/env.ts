import { z } from "zod";

// Every environment variable the API reads is declared and validated here.
// The app refuses to start if one is missing or malformed.
// See docs/environments.md for the values used in each environment.
export const envSchema = z.object({
  /** Runtime mode: "production" on every deployed server, including development. */
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  /** Which deployment this is. Independent of NODE_ENV. */
  APP_ENV: z.enum(["local", "development", "staging", "production"]).default("local"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.url(),
  /** CA certificate of a managed database (PEM or base64). Empty locally. */
  DATABASE_CA_CERT: z.string().min(1).optional(),
  /**
   * Shared secret apps/admin sends in the x-admin-key header. Temporary until
   * WorkOS login (Phase 3); admin endpoints are disabled when it is unset.
   */
  ADMIN_API_KEY: z.string().min(32, "Use at least 32 characters (openssl rand -hex 32)").optional(),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    throw new Error(`Invalid environment variables:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}
