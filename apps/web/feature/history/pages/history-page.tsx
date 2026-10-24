import Link from "next/link";

import { listAttempts } from "@/core/services/attempt.service";
import { formatBand, formatDateTime, MODE_LABEL } from "@/shared/utils/format";

export default async function HistoryPage() {
  const attempts = await listAttempts();

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Riwayat tes</h1>

      {attempts.length === 0 ? (
        <p className="text-slate-600">Belum ada tes yang dikerjakan.</p>
      ) : (
        <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
          {attempts.map((attempt) => (
            <li key={attempt.id}>
              <Link
                href={`/history/${attempt.id}`}
                className="flex items-center justify-between gap-4 p-4 hover:bg-slate-50"
              >
                <div>
                  <p className="font-medium">{attempt.testTitle}</p>
                  <p className="text-sm text-slate-500">
                    {formatDateTime(attempt.submittedAt)} · {MODE_LABEL[attempt.mode]}
                  </p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-semibold">
                    {attempt.rawScore}/{attempt.totalQuestions}
                  </p>
                  <p className="text-slate-500">Band {formatBand(attempt.band)}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
