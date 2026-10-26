import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { CurrentUser as CurrentUserData } from "@ielts-mock/question-schema";
import type { Request } from "express";

/** A request that passed AuthGuard (or the temporary admin key). */
export type AuthenticatedRequest = Request & { user?: CurrentUserData };

/** The signed-in user set by AuthGuard: `@CurrentUser() user: CurrentUser`. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): CurrentUserData | undefined =>
    context.switchToHttp().getRequest<AuthenticatedRequest>().user,
);
