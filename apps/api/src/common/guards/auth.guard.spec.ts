import { type ExecutionContext, UnauthorizedException } from "@nestjs/common";
import type { CurrentUser } from "@ielts-mock/question-schema";

import type { AccessTokenVerifier } from "../../modules/auth/access-token.verifier";
import type { UsersService } from "../../modules/auth/users.service";
import { AuthGuard } from "./auth.guard";

const user: CurrentUser = { id: "u1", email: "a@example.com", name: null, role: "student" };

function requestWith(authorization?: string) {
  const request: { user?: CurrentUser; header: (name: string) => string | undefined } = {
    header: (name) => (name === "authorization" ? authorization : undefined),
  };
  const context = {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
  return { request, context };
}

describe("AuthGuard", () => {
  const verifier = { verify: jest.fn().mockResolvedValue("user_1") };
  const usersService = { resolve: jest.fn().mockResolvedValue(user) };
  const guard = new AuthGuard(
    verifier as unknown as AccessTokenVerifier,
    usersService as unknown as UsersService,
  );

  it("sets the signed-in user from a bearer token", async () => {
    const { request, context } = requestWith("Bearer token-1");
    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(verifier.verify).toHaveBeenCalledWith("token-1");
    expect(usersService.resolve).toHaveBeenCalledWith("user_1");
    expect(request.user).toEqual(user);
  });

  it("requires a bearer token", async () => {
    await expect(guard.canActivate(requestWith().context)).rejects.toThrow(UnauthorizedException);
    await expect(guard.canActivate(requestWith("Basic abc").context)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
