import { ServiceUnavailableException, UnauthorizedException } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import {
  createLocalJWKSet,
  exportJWK,
  generateKeyPair,
  type JWTVerifyGetKey,
  SignJWT,
} from "jose";

import type { Env } from "../../config/env";
import { AccessTokenVerifier } from "./access-token.verifier";

const config = { get: () => undefined } as unknown as ConfigService<Env, true>;

class LocalVerifier extends AccessTokenVerifier {
  constructor(private readonly localKeys: JWTVerifyGetKey) {
    super(config);
  }
  protected override getKeys(): JWTVerifyGetKey {
    return this.localKeys;
  }
}

describe("AccessTokenVerifier", () => {
  let sign: (sub: string, expiresIn?: string) => Promise<string>;
  let verifier: AccessTokenVerifier;

  beforeAll(async () => {
    const { privateKey, publicKey } = await generateKeyPair("RS256");
    const jwk = { ...(await exportJWK(publicKey)), kid: "test", alg: "RS256" };
    verifier = new LocalVerifier(createLocalJWKSet({ keys: [jwk] }));
    sign = (sub, expiresIn = "5m") =>
      new SignJWT({})
        .setProtectedHeader({ alg: "RS256", kid: "test" })
        .setSubject(sub)
        .setIssuedAt()
        .setExpirationTime(expiresIn)
        .sign(privateKey);
  });

  it("returns the WorkOS user id of a valid token", async () => {
    await expect(verifier.verify(await sign("user_123"))).resolves.toBe("user_123");
  });

  it("rejects expired, tampered and foreign tokens", async () => {
    await expect(verifier.verify(await sign("user_123", "-1m"))).rejects.toThrow(UnauthorizedException);
    const token = await sign("user_123");
    await expect(verifier.verify(`${token.slice(0, -4)}abcd`)).rejects.toThrow(UnauthorizedException);
    await expect(verifier.verify("not-a-jwt")).rejects.toThrow(UnauthorizedException);

    const other = await generateKeyPair("RS256");
    const foreign = await new SignJWT({})
      .setProtectedHeader({ alg: "RS256", kid: "test" })
      .setSubject("user_123")
      .setExpirationTime("5m")
      .sign(other.privateKey);
    await expect(verifier.verify(foreign)).rejects.toThrow(UnauthorizedException);
  });

  it("rejects tokens that aren't for a user", async () => {
    await expect(verifier.verify(await sign("client_123"))).rejects.toThrow(UnauthorizedException);
  });

  it("answers 503 when WorkOS isn't configured", async () => {
    await expect(new AccessTokenVerifier(config).verify("token")).rejects.toThrow(
      ServiceUnavailableException,
    );
  });
});
