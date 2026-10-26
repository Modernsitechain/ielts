import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import {
  type AdminTest,
  type AdminTestSummary,
  type CreateTestInput,
  createTestSchema,
  type TestInput,
  testInputSchema,
} from "@ielts-mock/question-schema";

import { Roles } from "../../common/decorators/roles.decorator";
import { AdminAccessGuard } from "../../common/guards/admin-access.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { AdminTestsService } from "./admin-tests.service";

// Responses include answers: for apps/admin only. Editors and admins may
// edit; only admins publish. AdminAccessGuard also accepts the temporary admin
// key until apps/admin signs in with WorkOS.
@Controller("admin/tests")
@UseGuards(AdminAccessGuard, RolesGuard)
@Roles(["editor", "admin"])
export class AdminTestsController {
  constructor(private readonly adminTestsService: AdminTestsService) {}

  /** All tests, drafts included, most recently updated first. */
  @Get()
  list(): Promise<AdminTestSummary[]> {
    return this.adminTestsService.list();
  }

  @Post()
  create(
    @Body(new ZodValidationPipe(createTestSchema)) body: CreateTestInput,
  ): Promise<AdminTest> {
    return this.adminTestsService.create(body.title);
  }

  @Get(":id")
  get(@Param("id") id: string): Promise<AdminTest> {
    return this.adminTestsService.get(id);
  }

  /** Saves the whole content of a draft test. */
  @Put(":id")
  save(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(testInputSchema)) body: TestInput,
  ): Promise<AdminTest> {
    return this.adminTestsService.save(id, body);
  }

  @Post(":id/publish")
  @Roles(["admin"])
  @HttpCode(200)
  publish(@Param("id") id: string): Promise<AdminTest> {
    return this.adminTestsService.publish(id);
  }

  @Post(":id/unpublish")
  @Roles(["admin"])
  @HttpCode(200)
  unpublish(@Param("id") id: string): Promise<AdminTest> {
    return this.adminTestsService.unpublish(id);
  }

  @Delete(":id")
  @HttpCode(204)
  async remove(@Param("id") id: string): Promise<void> {
    await this.adminTestsService.remove(id);
  }
}
