import {
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createRemoteJWKSet, type JWTVerifyGetKey, jwtVerify } from "jose";

import type { Env } from "../../config/env";

/**
 * Checks WorkOS access tokens (JWTs sent by apps/web and apps/admin as
 * `Authorization: Bearer <token>`): signature against the public keys of our
 * WorkOS client, and expiry. No call to WorkOS per request; the keys are
 * fetched once and cached by jose.
 */
@Injectable()
export class AccessTokenVerifier {
  private keys: JWTVerifyGetKey | undefined;

  constructor(private readonly config: ConfigService<Env, true>) {}

  /** Returns the WorkOS user id of a valid token. */
  async verify(token: string): Promise<string> {
    const keys = this.getKeys();
    let sub: string | undefined;
    try {
      ({ payload: { sub } } = await jwtVerify(token, keys, { algorithms: ["RS256"] }));
    } catch {
      throw new UnauthorizedException("Invalid or expired access token");
    }
    if (!sub?.startsWith("user_")) {
      throw new UnauthorizedException("Invalid access token");
    }
    return sub;
  }

  /** Replaced in tests with local keys. */
  protected getKeys(): JWTVerifyGetKey {
    if (!this.keys) {
      const clientId = this.config.get("WORKOS_CLIENT_ID", { infer: true });
      if (!clientId) throw new ServiceUnavailableException("Sign-in is not configured");
      this.keys = createRemoteJWKSet(new URL(`https://api.workos.com/sso/jwks/${clientId}`));
    }
    return this.keys;
  }
}
