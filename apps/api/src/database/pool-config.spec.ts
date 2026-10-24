import { buildPoolConfig, decodeCaCert } from "./pool-config";

const PEM = "-----BEGIN CERTIFICATE-----\nMIIB\n-----END CERTIFICATE-----";

describe("buildPoolConfig", () => {
  it("uses the URL as is without a CA (local development)", () => {
    const config = buildPoolConfig("postgresql://me@localhost:5432/ielts_mock");

    expect(config.connectionString).toBe("postgresql://me@localhost:5432/ielts_mock");
    expect(config.ssl).toBeUndefined();
  });

  it("verifies the server with the CA and drops SSL params from the URL", () => {
    const config = buildPoolConfig(
      "postgresql://user:pw@db.example.com:25060/ielts_mock?sslmode=require",
      PEM,
    );

    expect(config.connectionString).toBe("postgresql://user:pw@db.example.com:25060/ielts_mock");
    expect(config.ssl).toEqual({ ca: PEM, rejectUnauthorized: true });
  });
});

describe("decodeCaCert", () => {
  it("accepts PEM, PEM with literal \\n, and base64", () => {
    expect(decodeCaCert(PEM)).toBe(PEM);
    expect(decodeCaCert(PEM.replace(/\n/g, "\\n"))).toBe(PEM);
    expect(decodeCaCert(Buffer.from(PEM).toString("base64"))).toBe(PEM);
  });
});
