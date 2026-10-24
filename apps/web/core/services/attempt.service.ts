import "server-only";

import { attempts, tests } from "@/core/datas";
import type {
  AttemptMode,
  AttemptResult,
  AttemptSession,
  AttemptSummary,
  ResultItem,
} from "@/core/models/attempt";
import type { AttemptRecord, TestRecord } from "@/core/models/records";
import { isAnswerCorrect, rawScoreToBand } from "./scoring";

// Meniru perilaku apps/api di atas dummy data. Waktu dan penilaian
// ditentukan di sini (sisi server), bukan dipercaya dari browser.

/** Toleransi keterlambatan jaringan saat auto-submit di detik terakhir. */
const DEADLINE_GRACE_MS = 30_000;
const MAX_ANSWER_LENGTH = 200;

function isPastDeadline(attempt: AttemptRecord): boolean {
  return Date.now() > Date.parse(attempt.endsAt) + DEADLINE_GRACE_MS;
}

function toSession(attempt: AttemptRecord): AttemptSession {
  return {
    id: attempt.id,
    testId: attempt.testId,
    mode: attempt.mode,
    startedAt: attempt.startedAt,
    endsAt: attempt.endsAt,
    submittedAt: attempt.submittedAt,
    answers: { ...attempt.answers },
  };
}

/** Input dari browser tidak dipercaya: hanya soal milik tes ini, hanya string. */
function sanitizeAnswers(
  test: TestRecord,
  answers: unknown,
): Record<string, string> {
  if (typeof answers !== "object" || answers === null) return {};

  const input = answers as Record<string, unknown>;
  const result: Record<string, string> = {};
  for (const questionId of Object.keys(test.answerKey)) {
    const value = input[questionId];
    if (typeof value !== "string") continue;
    const trimmed = value.trim().slice(0, MAX_ANSWER_LENGTH);
    if (trimmed !== "") result[questionId] = trimmed;
  }
  return result;
}

function grade(
  attempt: AttemptRecord,
  test: TestRecord,
  submittedAt: string,
): AttemptResult {
  const items: ResultItem[] = test.sections.flatMap((section) =>
    section.groups.flatMap((group) =>
      group.questions.map((question) => {
        const given = attempt.answers[question.id] ?? null;
        const accepted = test.answerKey[question.id] ?? [];
        return {
          questionId: question.id,
          number: question.number,
          prompt: question.prompt,
          given,
          accepted,
          isCorrect: isAnswerCorrect(group.payload, given, accepted),
        };
      }),
    ),
  );

  const rawScore = items.filter((item) => item.isCorrect).length;
  return {
    id: attempt.id,
    testId: test.id,
    testTitle: test.title,
    skill: test.skill,
    mode: attempt.mode,
    submittedAt,
    rawScore,
    totalQuestions: items.length,
    band: rawScoreToBand(test.skill, rawScore, items.length),
    items,
  };
}

export async function startAttempt(
  testId: string,
  mode: AttemptMode,
): Promise<AttemptSession | null> {
  const test = tests.find((t) => t.id === testId);
  if (!test) return null;

  const startedAt = new Date();
  const endsAt = new Date(startedAt.getTime() + test.durationMinutes * 60_000);
  const attempt: AttemptRecord = {
    id: crypto.randomUUID(),
    testId,
    mode,
    startedAt: startedAt.toISOString(),
    endsAt: endsAt.toISOString(),
    submittedAt: null,
    answers: {},
  };
  attempts.push(attempt);
  return toSession(attempt);
}

export async function getAttemptSession(
  attemptId: string,
): Promise<AttemptSession | null> {
  const attempt = attempts.find((a) => a.id === attemptId);
  return attempt ? toSession(attempt) : null;
}

/** Autosave. Ditolak jika attempt sudah submit atau waktunya habis. */
export async function saveAnswers(
  attemptId: string,
  answers: unknown,
): Promise<boolean> {
  const attempt = attempts.find((a) => a.id === attemptId);
  const test = attempt && tests.find((t) => t.id === attempt.testId);
  if (!attempt || !test || attempt.submittedAt || isPastDeadline(attempt)) {
    return false;
  }
  attempt.answers = sanitizeAnswers(test, answers);
  return true;
}

/**
 * Submit. Jika waktu sudah lewat, jawaban dari browser diabaikan dan yang
 * dinilai adalah jawaban autosave terakhir sebelum batas waktu.
 */
export async function submitAttempt(
  attemptId: string,
  answers: unknown,
): Promise<boolean> {
  const attempt = attempts.find((a) => a.id === attemptId);
  const test = attempt && tests.find((t) => t.id === attempt.testId);
  if (!attempt || !test || attempt.submittedAt) return false;

  if (!isPastDeadline(attempt)) {
    attempt.answers = sanitizeAnswers(test, answers);
  }
  attempt.submittedAt = new Date().toISOString();
  return true;
}

export async function getAttemptResult(
  attemptId: string,
): Promise<AttemptResult | null> {
  const attempt = attempts.find((a) => a.id === attemptId);
  const test = attempt && tests.find((t) => t.id === attempt.testId);
  if (!attempt?.submittedAt || !test) return null;
  return grade(attempt, test, attempt.submittedAt);
}

export async function listAttempts(): Promise<AttemptSummary[]> {
  return attempts
    .flatMap((attempt) => {
      const test = tests.find((t) => t.id === attempt.testId);
      if (!attempt.submittedAt || !test) return [];
      const { items: _items, ...summary } = grade(
        attempt,
        test,
        attempt.submittedAt,
      );
      return [summary];
    })
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
}
