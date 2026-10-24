import { Body, Controller, Get, HttpCode, Param, Post, Put } from "@nestjs/common";
import type {
  AttemptResult,
  AttemptSession,
  AttemptSummary,
} from "@ielts-mock/question-schema";

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

// No auth yet: every attempt is visible to everyone. Ownership checks come
// with WorkOS in Phase 3.
@Controller("attempts")
export class AttemptsController {
  constructor(private readonly attemptsService: AttemptsService) {}

  @Post()
  start(
    @Body(new ZodValidationPipe(startAttemptSchema)) body: StartAttemptDto,
  ): Promise<AttemptSession> {
    return this.attemptsService.start(body.testId, body.mode);
  }

  /** Submitted attempts (test history), newest first. */
  @Get()
  list(): Promise<AttemptSummary[]> {
    return this.attemptsService.listSubmitted();
  }

  @Get(":id")
  getSession(@Param("id") id: string): Promise<AttemptSession> {
    return this.attemptsService.getSession(id);
  }

  @Put(":id/answers")
  @HttpCode(204)
  async saveAnswers(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(saveAnswersSchema)) body: SaveAnswersDto,
  ): Promise<void> {
    await this.attemptsService.saveAnswers(id, body.answers);
  }

  @Post(":id/submit")
  @HttpCode(200)
  submit(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(submitAttemptSchema)) body: SubmitAttemptDto,
  ): Promise<AttemptResult> {
    return this.attemptsService.submit(id, body.answers);
  }

  /** Score, band and correct answers. Only available after submission. */
  @Get(":id/result")
  getResult(@Param("id") id: string): Promise<AttemptResult> {
    return this.attemptsService.getResult(id);
  }
}
