import "server-only";

import { env } from "@/core/config/env";
import type { SystemHealth } from "@/core/models/health";
import { apiFetch } from "./api-client";

type HealthResponse = { status?: string; database?: string };

export async function getSystemHealth(): Promise<SystemHealth> {
  try {
    const response = await apiFetch("/health");
    // The API answers 503 with the same body when the database is down.
    const body = (await response.json()) as HealthResponse;
    return {
      environment: env.APP_ENV,
      api: "up",
      database: body.database === "up" ? "up" : "down",
    };
  } catch {
    return { environment: env.APP_ENV, api: "down", database: "unknown" };
  }
}
