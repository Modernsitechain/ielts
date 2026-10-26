import "server-only";

import type { AdminTest, AdminTestSummary, TestInput } from "@/core/models/test";
import { adminApi, adminApiOrThrow, type ApiResult } from "./api-client";

// Pages and actions get data only through core/services, which call apps/api.

export async function listTests(): Promise<AdminTestSummary[]> {
  return (await adminApiOrThrow<AdminTestSummary[]>("/tests")) ?? [];
}

/** The test with answers, or null if it doesn't exist. */
export async function getTest(id: string): Promise<AdminTest | null> {
  return adminApiOrThrow<AdminTest>(`/tests/${encodeURIComponent(id)}`);
}

export async function createTest(title: string): Promise<ApiResult<AdminTest>> {
  return adminApi<AdminTest>("/tests", { method: "POST", body: { title } });
}

export async function saveTest(id: string, input: TestInput): Promise<ApiResult<AdminTest>> {
  return adminApi<AdminTest>(`/tests/${encodeURIComponent(id)}`, { method: "PUT", body: input });
}

export async function publishTest(id: string): Promise<ApiResult<AdminTest>> {
  return adminApi<AdminTest>(`/tests/${encodeURIComponent(id)}/publish`, { method: "POST" });
}

export async function unpublishTest(id: string): Promise<ApiResult<AdminTest>> {
  return adminApi<AdminTest>(`/tests/${encodeURIComponent(id)}/unpublish`, { method: "POST" });
}

export async function deleteTest(id: string): Promise<ApiResult<null>> {
  return adminApi<null>(`/tests/${encodeURIComponent(id)}`, { method: "DELETE" });
}
