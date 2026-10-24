import Link from "next/link";
import { notFound } from "next/navigation";

import { getAttemptResult } from "@/core/services/attempt.service";
import { formatBand, formatDateTime, MODE_LABEL } from "@/shared/utils/format";

export default async function AttemptResultPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;
  const result = await getAttemptResult(attemptId);
  if (!result) notFound();

  return (
    <section className="space-y-6">
      <div>
        <Link href="/history" className="text-sm text-slate-500 hover:text-slate-900">
          ← Riwayat
        </Link>
        <h1 className="mt-2 text-2xl font-bold">{result.testTitle}</h1>
        <p className="mt-1 text-slate-600">
          {formatDateTime(result.submittedAt)} · {MODE_LABEL[result.mode]}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Raw score</p>
          <p className="text-3xl font-bold">
            {result.rawScore}/{result.totalQuestions}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Band</p>
          <p className="text-3xl font-bold">{formatBand(result.band)}</p>
          {result.band === null && (
            <p className="mt-1 text-xs text-slate-500">
              Band hanya dihitung untuk tes lengkap 40 soal.
            </p>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-slate-500">
            <tr>
              <th className="p-3">No.</th>
              <th className="p-3">Soal</th>
              <th className="p-3">Jawaban kamu</th>
              <th className="p-3">Jawaban benar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {result.items.map((item) => (
              <tr key={item.questionId}>
                <td className="p-3 font-medium">{item.number}</td>
                <td className="p-3 text-slate-600">{item.prompt}</td>
                <td
                  className={
                    item.isCorrect ? "p-3 text-emerald-700" : "p-3 text-red-700"
                  }
                >
                  {item.isCorrect ? "✓ " : "✗ "}
                  {item.given ?? "(kosong)"}
                </td>
                <td className="p-3">{item.accepted.join(" / ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
