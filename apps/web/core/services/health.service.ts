import "server-only";

import type { SystemHealth } from "@/core/models/health";
import { apiFetch } from "./api-client";

type HealthResponse = { status?: string; database?: string };

export async function getSystemHealth(): Promise<SystemHealth> {
  try {
    const response = await apiFetch("/health");
    // The API answers 503 with the same body when the database is down.
    const body = (await response.json()) as HealthResponse;
    return { api: "up", database: body.database === "up" ? "up" : "down" };
  } catch {
    return { api: "down", database: "unknown" };
  }
}
