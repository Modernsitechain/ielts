import "server-only";

import { z } from "zod";

// Every environment variable the admin app reads on the server is declared and
// validated here. See docs/environments.md.
const envSchema = z.object({
  /** Which deployment this is. */
  APP_ENV: z.enum(["local", "development", "staging", "production"]).default("local"),
  /** Base URL of apps/api, reached from the server only. */
  API_URL: z.url().default("http://localhost:4000"),
  // WorkOS AuthKit reads these from process.env itself; they are checked here
  // so a missing value fails with a clear message. No WORKOS_API_KEY: the
  // admin signs users in as a public client (PKCE).
  WORKOS_CLIENT_ID: z.string().startsWith("client_"),
  /** Encrypts the session cookie. Use a different value from apps/web. */
  WORKOS_COOKIE_PASSWORD: z.string().min(32),
  /**
   * Must differ from apps/web's cookie (default "wos-session"): both apps
   * share one domain when deployed, and cookies are per domain.
   */
  WORKOS_COOKIE_NAME: z
    .string()
    .min(1)
    .refine((name) => name !== "wos-session", "Use a name different from apps/web's cookie"),
  /**
   * Where WorkOS sends users back after sign-in (…/admin/callback). Inlined by
   * Next.js at build time: the Docker build needs it as a build arg.
   */
  NEXT_PUBLIC_WORKOS_REDIRECT_URI: z.url(),
});

type Env = z.infer<typeof envSchema>;
let cached: Env | undefined;

/**
 * Validated environment. Read on first use (not at import), so `next build`
 * works without the values; a missing one fails the first request instead.
 */
export function getEnv(): Env {
  if (cached) return cached;
  const result = envSchema.safeParse({
    ...process.env,
    NEXT_PUBLIC_WORKOS_REDIRECT_URI: process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI,
  });
  if (!result.success) {
    throw new Error(`Invalid environment variables:\n${z.prettifyError(result.error)}`);
  }
  cached = result.data;
  return cached;
}

/** The public address of this app, e.g. http://localhost:3001 (no /admin). */
export function getAppOrigin(): string {
  return new URL(getEnv().NEXT_PUBLIC_WORKOS_REDIRECT_URI).origin;
}
