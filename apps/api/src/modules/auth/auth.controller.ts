import { Controller, Get, UseGuards } from "@nestjs/common";
import type { CurrentUser as CurrentUserData } from "@ielts-mock/question-schema";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { AuthGuard } from "../../common/guards/auth.guard";

@Controller()
@UseGuards(AuthGuard)
export class AuthController {
  /** The signed-in user and their role (apps use it to show or hide pages). */
  @Get("me")
  me(@CurrentUser() user: CurrentUserData): CurrentUserData {
    return user;
  }
}
