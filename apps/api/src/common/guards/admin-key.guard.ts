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
/** Never production: the admin is only reachable there after WorkOS login exists. */
const ALLOWED_ENVS: ReadonlySet<Env["APP_ENV"]> = new Set(["local", "development"]);

function sha256(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

/**
 * TEMPORARY protection for /admin endpoints until WorkOS login and roles
 * (Phase 3) replace it with an auth guard + role guard.
 *
 * - Only works with APP_ENV=local or development (where apps/admin is
 *   deployed behind a temporary password); never in production.
 * - Disabled when ADMIN_API_KEY is unset.
 * - The request must send the same key in the x-admin-key header.
 */
@Injectable()
export class AdminKeyGuard implements CanActivate {
  constructor(private readonly config: ConfigService<Env, true>) {}

  canActivate(context: ExecutionContext): boolean {
    const expected = this.config.get("ADMIN_API_KEY", { infer: true });
    if (!ALLOWED_ENVS.has(this.config.get("APP_ENV", { infer: true })) || !expected) {
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
