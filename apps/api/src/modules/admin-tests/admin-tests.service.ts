import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from "@nestjs/common";
import {
  type AdminTest,
  type AdminTestSummary,
  checkPublishReadiness,
  type TestInput,
} from "@ielts-mock/question-schema";

import { TestsRepository } from "../tests/tests.repository";

/**
 * Content management for apps/admin: create, edit, publish and delete tests.
 * Only Reading tests can be edited for now. Published tests are read-only, so
 * candidates never see a test change halfway through.
 */
@Injectable()
export class AdminTestsService {
  constructor(private readonly testsRepository: TestsRepository) {}

  list(): Promise<AdminTestSummary[]> {
    return this.testsRepository.findAllForAdmin();
  }

  async get(id: string): Promise<AdminTest> {
    const test = await this.testsRepository.findAdminById(id);
    if (!test) throw new NotFoundException(`Test ${id} not found`);
    return test;
  }

  async create(title: string): Promise<AdminTest> {
    const id = await this.testsRepository.createReadingDraft(title);
    return this.get(id);
  }

  async save(id: string, input: TestInput): Promise<AdminTest> {
    const test = await this.get(id);
    this.assertEditable(test);
    await this.testsRepository.replaceContent(id, input);
    return this.get(id);
  }

  /** Publishes the test if it passes checkPublishReadiness (422 with the problems otherwise). */
  async publish(id: string): Promise<AdminTest> {
    const test = await this.get(id);
    if (test.status === "published") return test;
    if (test.skill !== "reading") {
      throw new ConflictException("Only Reading tests can be published for now");
    }

    const { errors } = checkPublishReadiness(test);
    if (errors.length > 0) {
      throw new UnprocessableEntityException({ message: "The test isn't ready to publish", errors });
    }
    await this.testsRepository.setStatus(id, "published");
    return this.get(id);
  }

  async unpublish(id: string): Promise<AdminTest> {
    const test = await this.get(id);
    if (test.status === "draft") return test;
    await this.testsRepository.setStatus(id, "draft");
    return this.get(id);
  }

  async remove(id: string): Promise<void> {
    const test = await this.get(id);
    if (test.status === "published") {
      throw new ConflictException("Unpublish the test before deleting it");
    }
    await this.testsRepository.delete(id);
  }

  private assertEditable(test: AdminTest): void {
    if (test.status === "published") {
      throw new ConflictException("Unpublish the test before editing it");
    }
    if (test.skill !== "reading") {
      throw new ConflictException("Only Reading tests can be edited for now");
    }
  }
}
