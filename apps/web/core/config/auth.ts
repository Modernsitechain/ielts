import "server-only";

import { z } from "zod";

// WorkOS AuthKit (@workos-inc/authkit-nextjs) reads its settings from
// process.env itself. They are checked here so a missing value fails with a
// clear message on the first request instead of deep inside the library.
// No WORKOS_API_KEY: the web app signs users in as a public client (PKCE) and
// never needs the secret key. See docs/environments.md.
const authEnvSchema = z.object({
  WORKOS_CLIENT_ID: z.string().startsWith("client_"),
  /** Encrypts the session cookie. */
  WORKOS_COOKIE_PASSWORD: z.string().min(32),
  /**
   * Where WorkOS sends users back after sign-in (…/callback). NEXT_PUBLIC_, so
   * Next.js inlines it at build time: the Docker build needs it as a build arg.
   */
  NEXT_PUBLIC_WORKOS_REDIRECT_URI: z.url(),
});

let checked: z.infer<typeof authEnvSchema> | undefined;

export function getAuthEnv(): z.infer<typeof authEnvSchema> {
  if (!checked) {
    const result = authEnvSchema.safeParse({
      WORKOS_CLIENT_ID: process.env.WORKOS_CLIENT_ID,
      WORKOS_COOKIE_PASSWORD: process.env.WORKOS_COOKIE_PASSWORD,
      NEXT_PUBLIC_WORKOS_REDIRECT_URI: process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI,
    });
    if (!result.success) {
      throw new Error(`Invalid WorkOS environment variables:\n${z.prettifyError(result.error)}`);
    }
    checked = result.data;
  }
  return checked;
}

/** The public address of this app, e.g. http://localhost:3000. */
export function getAppOrigin(): string {
  return new URL(getAuthEnv().NEXT_PUBLIC_WORKOS_REDIRECT_URI).origin;
}
