import { fileURLToPath } from "node:url";

/**
 * Absolute path of the SQL migrations (packages/db/drizzle), both in the repo
 * and inside the API image, where this package is installed with its drizzle/ folder.
 */
export const MIGRATIONS_FOLDER = fileURLToPath(new URL("../drizzle", import.meta.url));
