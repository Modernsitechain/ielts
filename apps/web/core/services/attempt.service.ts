import "server-only";

import type { Annotation } from "@/core/models/annotation";
import type {
  AttemptMode,
  AttemptResult,
  AttemptSession,
  AttemptSummary,
} from "@/core/models/attempt";
import { ApiError, apiFetch, apiJson } from "./api-client";

// Timing, validation and grading all happen in apps/api; these functions
// only forward requests and map responses.

function attemptPath(attemptId: string, suffix = ""): string {
  return `/attempts/${encodeURIComponent(attemptId)}${suffix}`;
}

/** Starts an attempt, or returns null if the test doesn't exist. */
export async function startAttempt(
  testId: string,
  mode: AttemptMode,
): Promise<AttemptSession | null> {
  return apiJson<AttemptSession>("/attempts", { method: "POST", body: { testId, mode } });
}

export async function getAttemptSession(attemptId: string): Promise<AttemptSession | null> {
  return apiJson<AttemptSession>(attemptPath(attemptId));
}

/** Autosave. False when the API refuses it (submitted, time up, invalid). */
export async function saveAnswers(
  attemptId: string,
  answers: Record<string, string>,
): Promise<boolean> {
  const response = await apiFetch(attemptPath(attemptId, "/answers"), {
    method: "PUT",
    body: { answers },
  });
  return response.ok;
}

/** Saves highlights and notes. False when the API refuses (submitted, invalid). */
export async function saveAnnotations(attemptId: string, annotations: Annotation[]): Promise<boolean> {
  const response = await apiFetch(attemptPath(attemptId, "/annotations"), {
    method: "PUT",
    body: { annotations },
  });
  return response.ok;
}

/** Submits the attempt. False if it was already submitted or doesn't exist. */
export async function submitAttempt(
  attemptId: string,
  answers: Record<string, string>,
): Promise<boolean> {
  const response = await apiFetch(attemptPath(attemptId, "/submit"), {
    method: "POST",
    body: { answers },
  });
  return response.ok;
}

/** Graded result, or null if the attempt doesn't exist or isn't submitted. */
export async function getAttemptResult(attemptId: string): Promise<AttemptResult | null> {
  return apiJson<AttemptResult>(attemptPath(attemptId, "/result"));
}

/** Submitted attempts, newest first. */
export async function listAttempts(): Promise<AttemptSummary[]> {
  const attempts = await apiJson<AttemptSummary[]>("/attempts");
  if (!attempts) throw new ApiError(404, "/attempts");
  return attempts;
}
