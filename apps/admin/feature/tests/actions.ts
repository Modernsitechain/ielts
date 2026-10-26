"use server";

import { redirect } from "next/navigation";

import type { AdminTest, TestInput } from "@/core/models/test";
import {
  createTest,
  deleteTest,
  publishTest,
  saveTest,
  unpublishTest,
} from "@/core/services/test.service";

// Server Actions only forward to core/services. Arguments are untrusted:
// apps/api validates everything again.

export type EditorActionResult =
  | { ok: true; test: AdminTest }
  | { ok: false; message: string; errors: string[] };

export type CreateTestState = { message: string | null };

export async function createTestAction(
  _previous: CreateTestState,
  formData: FormData,
): Promise<CreateTestState> {
  const result = await createTest(String(formData.get("title") ?? ""));
  if (!result.ok) return { message: [result.message, ...result.errors].join(" ") };
  redirect(`/tests/${result.data.id}`);
}

export async function saveTestAction(id: string, input: TestInput): Promise<EditorActionResult> {
  const result = await saveTest(id, input);
  return result.ok ? { ok: true, test: result.data } : result;
}

export async function publishTestAction(id: string): Promise<EditorActionResult> {
  const result = await publishTest(id);
  return result.ok ? { ok: true, test: result.data } : result;
}

export async function unpublishTestAction(id: string): Promise<EditorActionResult> {
  const result = await unpublishTest(id);
  return result.ok ? { ok: true, test: result.data } : result;
}

export async function deleteTestAction(id: string): Promise<EditorActionResult> {
  const result = await deleteTest(id);
  if (!result.ok) return result;
  redirect("/tests");
}
