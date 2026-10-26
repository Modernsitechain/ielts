import { Global, Module } from "@nestjs/common";

import { AccessTokenVerifier } from "./access-token.verifier";
import { AuthController } from "./auth.controller";
import { UsersRepository } from "./users.repository";
import { UsersService } from "./users.service";
import { WorkosClient } from "./workos.client";

/**
 * Sign-in with WorkOS and our users table. Global, so AuthGuard (in common/)
 * can be used by any module's controllers.
 */
@Global()
@Module({
  controllers: [AuthController],
  providers: [AccessTokenVerifier, WorkosClient, UsersRepository, UsersService],
  exports: [AccessTokenVerifier, UsersService],
})
export class AuthModule {}
