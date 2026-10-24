import "server-only";

import { z } from "zod";

// Every environment variable the web app reads on the server is declared and
// validated here. See docs/environments.md for the values per environment.
const envSchema = z
  .object({
    /** Which deployment this is. Independent of NODE_ENV. */
    APP_ENV: z.enum(["local", "development", "staging", "production"]).default("local"),
    /** Base URL of apps/api, reached from the server only. */
    API_URL: z.url().optional(),
  })
  .refine((env) => env.APP_ENV === "local" || env.API_URL !== undefined, {
    message: "API_URL is required outside local development",
    path: ["API_URL"],
  })
  .transform((env) => ({ ...env, API_URL: env.API_URL ?? "http://localhost:4000" }));

const result = envSchema.safeParse(process.env);
if (!result.success) {
  throw new Error(`Invalid environment variables:\n${z.prettifyError(result.error)}`);
}

export const env = result.data;
