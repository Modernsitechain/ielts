import { Body, Controller, Get, HttpCode, Param, Post, Put, UseGuards } from "@nestjs/common";
import type {
  AttemptResult,
  AttemptSession,
  AttemptSummary,
  CurrentUser as CurrentUserData,
} from "@ielts-mock/question-schema";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { AuthGuard } from "../../common/guards/auth.guard";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { AttemptsService } from "./attempts.service";
import {
  type SaveAnswersDto,
  saveAnswersSchema,
  type StartAttemptDto,
  startAttemptSchema,
  type SubmitAttemptDto,
  submitAttemptSchema,
} from "./dto/attempt.dto";

// Signed-in users only; each user sees only their own attempts.
@Controller("attempts")
@UseGuards(AuthGuard)
export class AttemptsController {
  constructor(private readonly attemptsService: AttemptsService) {}

  @Post()
  start(
    @CurrentUser() user: CurrentUserData,
    @Body(new ZodValidationPipe(startAttemptSchema)) body: StartAttemptDto,
  ): Promise<AttemptSession> {
    return this.attemptsService.start(user.id, body.testId, body.mode);
  }

  /** Submitted attempts (test history), newest first. */
  @Get()
  list(@CurrentUser() user: CurrentUserData): Promise<AttemptSummary[]> {
    return this.attemptsService.listSubmitted(user.id);
  }

  @Get(":id")
  getSession(
    @CurrentUser() user: CurrentUserData,
    @Param("id") id: string,
  ): Promise<AttemptSession> {
    return this.attemptsService.getSession(user.id, id);
  }

  @Put(":id/answers")
  @HttpCode(204)
  async saveAnswers(
    @CurrentUser() user: CurrentUserData,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(saveAnswersSchema)) body: SaveAnswersDto,
  ): Promise<void> {
    await this.attemptsService.saveAnswers(user.id, id, body.answers);
  }

  @Post(":id/submit")
  @HttpCode(200)
  submit(
    @CurrentUser() user: CurrentUserData,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(submitAttemptSchema)) body: SubmitAttemptDto,
  ): Promise<AttemptResult> {
    return this.attemptsService.submit(user.id, id, body.answers);
  }

  /** Score, band and correct answers. Only available after submission. */
  @Get(":id/result")
  getResult(
    @CurrentUser() user: CurrentUserData,
    @Param("id") id: string,
  ): Promise<AttemptResult> {
    return this.attemptsService.getResult(user.id, id);
  }
}
