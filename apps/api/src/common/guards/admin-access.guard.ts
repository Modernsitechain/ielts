import { type CanActivate, type ExecutionContext, Injectable } from "@nestjs/common";
import type { CurrentUser } from "@ielts-mock/question-schema";

import type { AuthenticatedRequest } from "../decorators/current-user.decorator";
import { AdminKeyGuard } from "./admin-key.guard";
import { AuthGuard } from "./auth.guard";

/** Who a request with the temporary admin key acts as. */
const ADMIN_KEY_USER: CurrentUser = {
  id: "admin-key",
  email: "admin-key@localhost",
  name: "Admin key",
  role: "admin",
};

/**
 * TEMPORARY, for /admin endpoints while apps/admin still sends the shared key:
 * - with an x-admin-key header: AdminKeyGuard rules (local/development only),
 *   acting as an admin;
 * - otherwise: AuthGuard (WorkOS sign-in).
 * Use with RolesGuard. Once apps/admin signs in with WorkOS, replace it with
 * AuthGuard and delete AdminKeyGuard.
 */
@Injectable()
export class AdminAccessGuard implements CanActivate {
  constructor(
    private readonly adminKeyGuard: AdminKeyGuard,
    private readonly authGuard: AuthGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (request.header("x-admin-key") === undefined) {
      return this.authGuard.canActivate(context);
    }
    this.adminKeyGuard.canActivate(context);
    request.user = ADMIN_KEY_USER;
    return true;
  }
}
