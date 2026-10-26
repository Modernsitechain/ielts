import { ForbiddenException, type ExecutionContext, UnauthorizedException } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";

import type { Env } from "../../config/env";
import { AdminKeyGuard } from "./admin-key.guard";

const KEY = "k".repeat(64);

function guardFor(env: Partial<Env>): AdminKeyGuard {
  const config = { get: (name: keyof Env) => env[name] } as unknown as ConfigService<Env, true>;
  return new AdminKeyGuard(config);
}

function requestWith(key?: string): ExecutionContext {
  const request = { header: (name: string) => (name === "x-admin-key" ? key : undefined) };
  return { switchToHttp: () => ({ getRequest: () => request }) } as unknown as ExecutionContext;
}

describe("AdminKeyGuard", () => {
  it("accepts the right key locally and in development", () => {
    expect(guardFor({ APP_ENV: "local", ADMIN_API_KEY: KEY }).canActivate(requestWith(KEY))).toBe(true);
    expect(guardFor({ APP_ENV: "development", ADMIN_API_KEY: KEY }).canActivate(requestWith(KEY))).toBe(true);
  });

  it("rejects a missing or wrong key", () => {
    const guard = guardFor({ APP_ENV: "development", ADMIN_API_KEY: KEY });
    expect(() => guard.canActivate(requestWith())).toThrow(UnauthorizedException);
    expect(() => guard.canActivate(requestWith("wrong"))).toThrow(UnauthorizedException);
  });

  it("is always disabled in production and without a key", () => {
    expect(() =>
      guardFor({ APP_ENV: "production", ADMIN_API_KEY: KEY }).canActivate(requestWith(KEY)),
    ).toThrow(ForbiddenException);
    expect(() => guardFor({ APP_ENV: "local" }).canActivate(requestWith(KEY))).toThrow(ForbiddenException);
  });
});
