import { ArrowRight, CheckCircle2, FilePen, FileText, ListChecks, Plus } from "lucide-react";
import Link from "next/link";

import type { AdminTestSummary, Skill } from "@/core/models/test";
import { listTests } from "@/core/services/test.service";
import { getCurrentUser } from "@/core/services/user.service";
import { StatusBadge } from "@/shared/components/status-badge";
import { formatDateTime, SKILL_LABEL } from "@/shared/utils/format";

import { StatCard } from "../components/stat-card";

const RECENT_COUNT = 5;
const SKILLS: Skill[] = ["reading", "listening"];

function countBy(tests: AdminTestSummary[], skill: Skill) {
  const ofSkill = tests.filter((test) => test.skill === skill);
  return {
    total: ofSkill.length,
    published: ofSkill.filter((test) => test.status === "published").length,
  };
}

export default async function DashboardPage() {
  const [tests, user] = await Promise.all([listTests(), getCurrentUser()]);
  const published = tests.filter((test) => test.status === "published");
  const drafts = tests.filter((test) => test.status === "draft");
  const questionCount = tests.reduce((sum, test) => sum + test.questionCount, 0);
  // listTests returns the most recently updated first.
  const recent = tests.slice(0, RECENT_COUNT);

  return (
    <section className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">
            Welcome back{user?.name ? `, ${user.name}` : ""}. Here's where the test library stands.
          </p>
        </div>
        <Link
          href="/tests/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
        >
          <Plus className="h-4 w-4" aria-hidden />
          New Reading test
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total tests" value={tests.length} hint="Reading and Listening" icon={FileText} />
        <StatCard
          label="Published"
          value={published.length}
          hint="Visible to candidates"
          icon={CheckCircle2}
        />
        <StatCard label="Drafts" value={drafts.length} hint="Not visible yet" icon={FilePen} />
        <StatCard
          label="Questions"
          value={questionCount}
          hint="Across all tests"
          icon={ListChecks}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold">Recently updated</h2>
            <Link
              href="/tests"
              className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
            >
              All tests
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="p-8 text-center text-sm text-slate-500">No tests yet. Create your first Reading test.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recent.map((test) => (
                <li key={test.id}>
                  <Link
                    href={`/tests/${test.id}`}
                    className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{test.title}</p>
                      <p className="text-xs text-slate-500">
                        {SKILL_LABEL[test.skill]} · {test.questionCount} questions ·{" "}
                        {formatDateTime(test.updatedAt)}
                      </p>
                    </div>
                    <StatusBadge status={test.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white">
          <h2 className="border-b border-slate-200 px-5 py-4 font-semibold">By skill</h2>
          <ul className="space-y-5 p-5">
            {SKILLS.map((skill) => {
              const { total, published: live } = countBy(tests, skill);
              const percent = total === 0 ? 0 : Math.round((live / total) * 100);
              return (
                <li key={skill}>
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="font-medium">{SKILL_LABEL[skill]}</span>
                    <span className="text-slate-500">
                      {live} of {total} published
                    </span>
                  </div>
                  <div
                    className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"
                    role="progressbar"
                    aria-label={`${SKILL_LABEL[skill]} tests published`}
                    aria-valuenow={percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${percent}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
          {drafts.length > 0 && (
            <p className="border-t border-slate-200 px-5 py-4 text-sm text-slate-600">
              {drafts.length === 1 ? "1 draft is" : `${drafts.length} drafts are`} waiting to be finished
              and published.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
