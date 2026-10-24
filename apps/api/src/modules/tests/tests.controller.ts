import { Controller, Get, Param } from "@nestjs/common";
import type { TestDetail, TestSummary } from "@ielts-mock/question-schema";

import { TestsService } from "./tests.service";

@Controller("tests")
export class TestsController {
  constructor(private readonly testsService: TestsService) {}

  @Get()
  list(): Promise<TestSummary[]> {
    return this.testsService.list();
  }

  /** Test content without the answer key. */
  @Get(":id")
  getById(@Param("id") id: string): Promise<TestDetail> {
    return this.testsService.getById(id);
  }
}
