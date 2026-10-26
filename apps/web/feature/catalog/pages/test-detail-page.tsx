import { LogIn } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getSignedInUser } from "@/core/services/auth.service";
import { getTest } from "@/core/services/test.service";
import { startAttemptAction } from "@/feature/session/actions";
import { QUESTION_TYPE_LABEL, SKILL_LABEL } from "@/shared/utils/format";

export default async function TestDetailPage({
  params,
}: {
  params: Promise<{ testId: string }>;
}) {
  const { testId } = await params;
  const [test, user] = await Promise.all([getTest(testId), getSignedInUser()]);
  if (!test) notFound();

  return (
    <section className="mx-auto w-full max-w-5xl space-y-6 px-4 py-10">
      <div>
        <Link href="/tests" className="text-sm text-slate-500 hover:text-slate-900">
          ← All tests
        </Link>
        <h1 className="mt-2 text-2xl font-bold">{test.title}</h1>
        <p className="mt-1 text-slate-600">
          {SKILL_LABEL[test.skill]} · {test.questionCount} questions ·{" "}
          {test.durationMinutes} minutes · {test.isFree ? "Free" : "Paid"}
        </p>
      </div>

      <ol className="space-y-4">
        {test.sections.map((section) => (
          <li key={section.id} className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="font-semibold">{section.title}</h2>
            <ul className="mt-2 space-y-1 text-sm text-slate-600">
              {section.groups.map((group) => (
                <li key={group.id}>
                  Questions {group.numberFrom}–{group.numberTo}:{" "}
                  {QUESTION_TYPE_LABEL[group.payload.type]}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      {test.skill === "reading" && !user ? (
        <div className="space-y-2">
          <a
            href={`/sign-in?returnTo=${encodeURIComponent(`/tests/${test.id}`)}`}
            className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            <LogIn className="h-4 w-4" aria-hidden />
            Sign in to start
          </a>
          <p className="text-xs text-slate-500">You need an account so your results are saved.</p>
        </div>
      ) : test.skill === "reading" ? (
        <form action={startAttemptAction.bind(null, test.id)} className="space-y-2">
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Start test
          </button>
          <p className="text-xs text-slate-500">
            Exam mode: the {test.durationMinutes}-minute timer starts as soon as you begin.
          </p>
        </form>
      ) : (
        <div className="space-y-2">
          <button
            type="button"
            disabled
            className="cursor-not-allowed rounded-md bg-slate-300 px-4 py-2 text-sm font-medium text-slate-600"
          >
            Start test
          </button>
          <p className="text-xs text-slate-500">Listening sessions aren't available yet.</p>
        </div>
      )}
    </section>
  );
}
