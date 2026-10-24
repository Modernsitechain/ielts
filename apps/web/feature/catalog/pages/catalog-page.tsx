import Link from "next/link";

import { listTests } from "@/core/services/test.service";
import { SKILL_LABEL } from "@/shared/utils/format";

export default async function CatalogPage() {
  const tests = await listTests();

  return (
    <section className="mx-auto w-full max-w-5xl space-y-6 px-4 py-10">
      <h1 className="text-2xl font-bold">Tests</h1>

      <ul className="grid gap-4 sm:grid-cols-2">
        {tests.map((test) => (
          <li key={test.id}>
            <Link
              href={`/tests/${test.id}`}
              className="block rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-400"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {SKILL_LABEL[test.skill]}
                </span>
                <span
                  className={
                    test.isFree
                      ? "rounded-sm bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800"
                      : "rounded-sm bg-amber-100 px-2 py-0.5 text-xs text-amber-800"
                  }
                >
                  {test.isFree ? "Free" : "Paid"}
                </span>
              </div>
              <h2 className="mt-2 font-semibold">{test.title}</h2>
              <p className="mt-1 text-sm text-slate-600">
                {test.questionCount} questions · {test.durationMinutes} minutes
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
