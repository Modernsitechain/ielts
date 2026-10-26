// Scripts in this package (migrate, seed) use the same database as apps/api.
// DATABASE_URL already set in the environment (e.g. on a server) wins;
// otherwise it is read from apps/api/.env, or apps/api/.env.test with DB_ENV=test.

export function loadDatabaseUrl(): string {
  if (!process.env.DATABASE_URL) {
    const file = process.env.DB_ENV === "test" ? ".env.test" : ".env";
    process.loadEnvFile(new URL(`../../../apps/api/${file}`, import.meta.url));
  }
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set (see docs/environments.md)");
  return url;
}
