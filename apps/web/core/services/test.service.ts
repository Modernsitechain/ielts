import "server-only";

import type { TestDetail, TestSummary } from "@/core/models/test";
import { ApiError, apiJson } from "./api-client";

// Pages get data only through core/services, which call apps/api.

export async function listTests(): Promise<TestSummary[]> {
  const tests = await apiJson<TestSummary[]>("/tests");
  if (!tests) throw new ApiError(404, "/tests");
  return tests;
}

/** Test content without the answer key, or null if it doesn't exist. */
export async function getTest(testId: string): Promise<TestDetail | null> {
  return apiJson<TestDetail>(`/tests/${encodeURIComponent(testId)}`);
}
