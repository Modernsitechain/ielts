import { Injectable } from "@nestjs/common";
import type { CurrentUser } from "@ielts-mock/question-schema";

import { UsersRepository } from "./users.repository";
import { WorkosClient } from "./workos.client";

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly workos: WorkosClient,
  ) {}

  /**
   * Our user for a signed-in WorkOS user. The first time, the profile is
   * fetched from WorkOS and the user is created as a student.
   */
  async resolve(workosUserId: string): Promise<CurrentUser> {
    const existing = await this.usersRepository.findByWorkosId(workosUserId);
    if (existing) return existing;
    return this.usersRepository.create(await this.workos.getUser(workosUserId));
  }
}
