import { Inject, Injectable } from "@nestjs/common";
import { eq, users } from "@ielts-mock/db";
import type { CurrentUser } from "@ielts-mock/question-schema";

import { DATABASE, type Database } from "../../database/database.module";
import type { WorkosUser } from "./workos.client";

const columns = { id: users.id, email: users.email, name: users.name, role: users.role };

/** Data access for the users table. */
@Injectable()
export class UsersRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async findByWorkosId(workosUserId: string): Promise<CurrentUser | null> {
    const [user] = await this.db
      .select(columns)
      .from(users)
      .where(eq(users.workosUserId, workosUserId));
    return user ?? null;
  }

  /** Inserts a new student; if a parallel request created it first, returns that row. */
  async create(profile: WorkosUser): Promise<CurrentUser> {
    const [created] = await this.db
      .insert(users)
      .values({ workosUserId: profile.id, email: profile.email, name: profile.name })
      .onConflictDoNothing({ target: users.workosUserId })
      .returning(columns);
    const user = created ?? (await this.findByWorkosId(profile.id));
    if (!user) throw new Error(`User ${profile.id} could not be created`);
    return user;
  }
}
