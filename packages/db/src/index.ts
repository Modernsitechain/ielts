// Database schema and helpers. Only apps/api may import this package.
export * from "./content.js";
export * from "./demo.js";
export * from "./migrations.js";
export * from "./schema.js";
export * from "./users.js";
/** All tables and relations, for `drizzle({ client, schema })`. */
export * as schema from "./schema.js";

// apps/api imports drizzle from here, never from "drizzle-orm" directly:
// apps/api is CommonJS and would otherwise load a second copy of drizzle-orm
// (its CJS build) whose types don't match the schema's.
export { and, asc, desc, eq, inArray, isNotNull, isNull, type SQL, sql } from "drizzle-orm";
export { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
export { migrate } from "drizzle-orm/node-postgres/migrator";
