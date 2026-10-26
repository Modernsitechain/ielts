import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";

import { AccessTokenVerifier } from "../../modules/auth/access-token.verifier";
import { UsersService } from "../../modules/auth/users.service";
import type { AuthenticatedRequest } from "../decorators/current-user.decorator";

/**
 * Requires a signed-in user: a valid WorkOS access token in
 * `Authorization: Bearer <token>`. Sets `request.user` (our user and role).
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly verifier: AccessTokenVerifier,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const [scheme, token] = request.header("authorization")?.split(" ") ?? [];
    if (scheme !== "Bearer" || !token) {
      throw new UnauthorizedException("Sign in required");
    }
    request.user = await this.usersService.resolve(await this.verifier.verify(token));
    return true;
  }
}
