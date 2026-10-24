"use server";

import { redirect } from "next/navigation";

import {
  saveAnswers,
  startAttempt,
  submitAttempt,
} from "@/core/services/attempt.service";
import { getTest } from "@/core/services/test.service";

// Server Actions untuk sesi ujian. Semua argumen datang dari browser,
// jadi validasi tetap dilakukan di core/services.

export async function startAttemptAction(testId: string): Promise<void> {
  const test = await getTest(testId);
  if (!test) throw new Error("Tes tidak ditemukan.");
  if (test.skill !== "reading") {
    throw new Error("Sesi Listening belum tersedia.");
  }

  const session = await startAttempt(test.id, "exam");
  if (!session) throw new Error("Gagal memulai tes.");
  redirect(`/session/reading/${session.id}`);
}

export async function saveAnswersAction(
  attemptId: string,
  answers: Record<string, string>,
): Promise<boolean> {
  return saveAnswers(attemptId, answers);
}

export async function submitAttemptAction(
  attemptId: string,
  answers: Record<string, string>,
): Promise<void> {
  await submitAttempt(attemptId, answers);
  redirect(`/history/${attemptId}`);
}
