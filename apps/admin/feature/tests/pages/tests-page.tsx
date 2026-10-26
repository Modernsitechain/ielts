import { Plus } from "lucide-react";
import Link from "next/link";

import { listTests } from "@/core/services/test.service";
import { StatusBadge } from "@/shared/components/status-badge";
import { formatDateTime, SKILL_LABEL } from "@/shared/utils/format";

export default async function TestsPage() {
  const tests = await listTests();

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6 px-4 py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Tests</h1>
          <p className="mt-1 text-sm text-slate-600">
            Create Reading tests, add passages and questions, then publish them for candidates.
          </p>
        </div>
        <Link
          href="/tests/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          <Plus className="h-4 w-4" aria-hidden />
          New Reading test
        </Link>
      </div>

      {tests.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          No tests yet. Create your first Reading test.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-2.5 font-medium">Title</th>
                <th className="px-4 py-2.5 font-medium">Skill</th>
                <th className="px-4 py-2.5 font-medium">Questions</th>
                <th className="px-4 py-2.5 font-medium">Access</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Last updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tests.map((test) => (
                <tr key={test.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/tests/${test.id}`} className="hover:underline">
                      {test.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{SKILL_LABEL[test.skill]}</td>
                  <td className="px-4 py-3 text-slate-600">{test.questionCount}</td>
                  <td className="px-4 py-3 text-slate-600">{test.isFree ? "Free" : "Paid"}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={test.status} />
                  </td>
                  <td className="px-4 py-3 text-slate-600">{formatDateTime(test.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
