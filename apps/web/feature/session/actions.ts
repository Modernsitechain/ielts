"use server";

import { redirect } from "next/navigation";

import type { Annotation } from "@/core/models/annotation";
import {
  saveAnnotations,
  saveAnswers,
  saveFlags,
  startAttempt,
  submitAttempt,
} from "@/core/services/attempt.service";
import { getSignedInUser } from "@/core/services/auth.service";
import { getTest } from "@/core/services/test.service";

// Server Actions for exam sessions. Every argument comes from the browser,
// so validation still happens in core/services.

export async function startAttemptAction(testId: string): Promise<void> {
  if (!(await getSignedInUser())) {
    redirect(`/sign-in?returnTo=${encodeURIComponent(`/tests/${testId}`)}`);
  }

  const test = await getTest(testId);
  if (!test) throw new Error("Test not found.");
  if (test.skill !== "reading") {
    throw new Error("Listening sessions aren't available yet.");
  }

  const session = await startAttempt(test.id, "exam");
  if (!session) throw new Error("Failed to start the test.");
  redirect(`/session/reading/${session.id}`);
}

export async function saveAnswersAction(
  attemptId: string,
  answers: Record<string, string>,
): Promise<boolean> {
  return saveAnswers(attemptId, answers);
}

export async function saveFlagsAction(attemptId: string, questionIds: string[]): Promise<boolean> {
  return saveFlags(attemptId, questionIds);
}

export async function saveAnnotationsAction(
  attemptId: string,
  annotations: Annotation[],
): Promise<boolean> {
  return saveAnnotations(attemptId, annotations);
}

export async function submitAttemptAction(
  attemptId: string,
  answers: Record<string, string>,
): Promise<void> {
  await submitAttempt(attemptId, answers);
  redirect(`/history/${attemptId}`);
}
