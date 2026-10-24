import type { PoolConfig } from "pg";

// SSL parameters in the URL would override the `ssl` option below (pg merges
// the parsed connection string on top), so they are removed when a CA is given.
const URL_SSL_PARAMS = ["sslmode", "sslrootcert", "sslcert", "sslkey", "uselibpqcompat"];

/** Accepts a PEM certificate, a PEM with literal "\n", or base64-encoded PEM. */
export function decodeCaCert(value: string): string {
  if (value.includes("-----BEGIN")) return value.replace(/\\n/g, "\n");
  return Buffer.from(value, "base64").toString("utf8");
}

/**
 * Pool settings for PostgreSQL. Without a CA certificate (local development)
 * the URL is used as is; with one (managed databases such as DigitalOcean)
 * the connection is encrypted and the server certificate is verified.
 */
export function buildPoolConfig(databaseUrl: string, caCert?: string): PoolConfig {
  const base: PoolConfig = { connectionTimeoutMillis: 2_000 };
  if (!caCert) return { ...base, connectionString: databaseUrl };

  const url = new URL(databaseUrl);
  for (const param of URL_SSL_PARAMS) url.searchParams.delete(param);

  return {
    ...base,
    connectionString: url.toString(),
    ssl: { ca: decodeCaCert(caCert), rejectUnauthorized: true },
  };
}
