import "server-only";

import type { AttemptRecord } from "@/core/models/records";

const seed: AttemptRecord[] = [
  {
    id: "attempt-1",
    testId: "reading-demo-1",
    mode: "exam",
    startedAt: "2026-10-20T09:00:00+07:00",
    endsAt: "2026-10-20T10:00:00+07:00",
    submittedAt: "2026-10-20T09:52:00+07:00",
    answers: {
      "r1-q1": "TRUE",
      "r1-q2": "FALSE",
      "r1-q3": "FALSE",
      "r1-q4": "FALSE",
      "r1-q5": "B",
      "r1-q6": "A",
      "r1-q7": "50000",
      "r1-q8": "Green Roofs",
      // Exceeds the two-word limit, so it's marked wrong.
      "r1-q9": "native flowering plants",
    },
  },
];

// New attempts live in server memory (standing in for a database), so they
// are lost when the server restarts. Kept on globalThis so hot reload during
// development doesn't reset them.
const store = globalThis as typeof globalThis & {
  __ieltsMockAttempts?: AttemptRecord[];
};

export const attempts: AttemptRecord[] = (store.__ieltsMockAttempts ??= seed);
