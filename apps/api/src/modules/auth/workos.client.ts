import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { z } from "zod";

import type { Env } from "../../config/env";

const workosUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  first_name: z.string().nullish(),
  last_name: z.string().nullish(),
});

export type WorkosUser = { id: string; email: string; name: string | null };

/** The few WorkOS API calls the API needs (plain fetch, no SDK). */
@Injectable()
export class WorkosClient {
  constructor(private readonly config: ConfigService<Env, true>) {}

  /** Profile of a WorkOS user, to create our users row on first sign-in. */
  async getUser(workosUserId: string): Promise<WorkosUser> {
    const apiKey = this.config.get("WORKOS_API_KEY", { infer: true });
    if (!apiKey) throw new ServiceUnavailableException("Sign-in is not configured");

    const response = await fetch(
      `https://api.workos.com/user_management/users/${encodeURIComponent(workosUserId)}`,
      { headers: { Authorization: `Bearer ${apiKey}` }, signal: AbortSignal.timeout(10_000) },
    );
    if (!response.ok) {
      throw new ServiceUnavailableException(`WorkOS user lookup failed (${response.status})`);
    }
    const user = workosUserSchema.parse(await response.json());
    const name = [user.first_name, user.last_name].filter(Boolean).join(" ");
    return { id: user.id, email: user.email, name: name || null };
  }
}
