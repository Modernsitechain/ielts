import { type ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { UserRole } from "@ielts-mock/question-schema";

import { RolesGuard } from "./roles.guard";

function contextFor(role?: UserRole): ExecutionContext {
  const request = { user: role ? { id: "u1", email: "a@example.com", name: null, role } : undefined };
  return {
    getHandler: () => () => undefined,
    getClass: () => class {},
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe("RolesGuard", () => {
  const reflector = new Reflector();
  const guard = new RolesGuard(reflector);
  const withRoles = (roles: UserRole[] | undefined) =>
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(roles);

  it("allows a user with one of the roles", () => {
    withRoles(["editor", "admin"]);
    expect(guard.canActivate(contextFor("editor"))).toBe(true);
  });

  it("rejects other roles and missing users", () => {
    withRoles(["admin"]);
    expect(() => guard.canActivate(contextFor("editor"))).toThrow(ForbiddenException);
    expect(() => guard.canActivate(contextFor())).toThrow(ForbiddenException);
  });

  it("allows anyone when no roles are set", () => {
    withRoles(undefined);
    expect(guard.canActivate(contextFor())).toBe(true);
  });
});
