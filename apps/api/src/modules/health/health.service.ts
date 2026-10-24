import { Inject, Injectable } from "@nestjs/common";
import { sql } from "drizzle-orm";

import { DATABASE, type Database } from "../../database/database.module";

export type HealthStatus = {
  status: "ok" | "error";
  database: "up" | "down";
};

@Injectable()
export class HealthService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async check(): Promise<HealthStatus> {
    const database = await this.pingDatabase();
    return { status: database === "up" ? "ok" : "error", database };
  }

  private async pingDatabase(): Promise<HealthStatus["database"]> {
    try {
      await this.db.execute(sql`select 1`);
      return "up";
    } catch {
      return "down";
    }
  }
}
