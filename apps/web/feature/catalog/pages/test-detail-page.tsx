import Link from "next/link";
import { notFound } from "next/navigation";

import { getTest } from "@/core/services/test.service";
import { startAttemptAction } from "@/feature/session/actions";
import { QUESTION_TYPE_LABEL, SKILL_LABEL } from "@/shared/utils/format";

export default async function TestDetailPage({
  params,
}: {
  params: Promise<{ testId: string }>;
}) {
  const { testId } = await params;
  const test = await getTest(testId);
  if (!test) notFound();

  return (
    <section className="space-y-6">
      <div>
        <Link href="/tests" className="text-sm text-slate-500 hover:text-slate-900">
          ← Katalog tes
        </Link>
        <h1 className="mt-2 text-2xl font-bold">{test.title}</h1>
        <p className="mt-1 text-slate-600">
          {SKILL_LABEL[test.skill]} · {test.questionCount} soal ·{" "}
          {test.durationMinutes} menit · {test.isFree ? "Gratis" : "Berbayar"}
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

      {test.skill === "reading" ? (
        <form action={startAttemptAction.bind(null, test.id)} className="space-y-2">
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Mulai tes
          </button>
          <p className="text-xs text-slate-500">
            Mode Ujian: timer {test.durationMinutes} menit berjalan sejak tes dimulai.
          </p>
        </form>
      ) : (
        <div className="space-y-2">
          <button
            type="button"
            disabled
            className="cursor-not-allowed rounded-md bg-slate-300 px-4 py-2 text-sm font-medium text-slate-600"
          >
            Mulai tes
          </button>
          <p className="text-xs text-slate-500">Sesi Listening belum tersedia.</p>
        </div>
      )}
    </section>
  );
}
