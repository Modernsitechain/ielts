import { notFound, redirect } from "next/navigation";

import { getAttemptSession } from "@/core/services/attempt.service";
import { getTest } from "@/core/services/test.service";
import { ReadingSession } from "../components/reading-session";

export default async function ReadingSessionPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;
  const session = await getAttemptSession(attemptId);
  if (!session) notFound();
  if (session.submittedAt) redirect(`/history/${session.id}`);

  // getTest returns the test without the answer key.
  const test = await getTest(session.testId);
  if (!test || test.skill !== "reading") notFound();

  return <ReadingSession test={test} session={session} />;
}
