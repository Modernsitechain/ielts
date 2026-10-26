import { createHash, timingSafeEqual } from "node:crypto";

import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Request } from "express";

import type { Env } from "../../config/env";

const HEADER = "x-admin-key";

function sha256(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

/**
 * TEMPORARY protection for /admin endpoints until WorkOS login and roles
 * (Phase 3) replace it with an auth guard + role guard.
 *
 * - Only works with APP_ENV=local: apps/admin is not deployed before WorkOS.
 * - Disabled when ADMIN_API_KEY is unset.
 * - The request must send the same key in the x-admin-key header.
 */
@Injectable()
export class AdminKeyGuard implements CanActivate {
  constructor(private readonly config: ConfigService<Env, true>) {}

  canActivate(context: ExecutionContext): boolean {
    const expected = this.config.get("ADMIN_API_KEY", { infer: true });
    if (this.config.get("APP_ENV", { infer: true }) !== "local" || !expected) {
      throw new ForbiddenException("Admin endpoints are disabled in this environment");
    }

    const given = context.switchToHttp().getRequest<Request>().header(HEADER);
    // Comparing hashes keeps the comparison constant-time for any input length.
    if (!given || !timingSafeEqual(sha256(given), sha256(expected))) {
      throw new UnauthorizedException("Invalid admin key");
    }
    return true;
  }
}
