import { defineConfig } from "drizzle-kit";

// Same database as apps/api. DATABASE_URL from the environment wins; otherwise
// it is read from apps/api/.env, or apps/api/.env.test with DB_ENV=test.
// Paths are relative to this package (pnpm runs scripts from here).
if (!process.env.DATABASE_URL) {
  process.loadEnvFile(process.env.DB_ENV === "test" ? "../../apps/api/.env.test" : "../../apps/api/.env");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
  strict: true,
  verbose: true,
});
