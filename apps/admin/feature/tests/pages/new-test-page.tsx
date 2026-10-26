import Link from "next/link";

import { NewTestForm } from "../components/new-test-form";

export default function NewTestPage() {
  return (
    <section className="mx-auto w-full max-w-xl space-y-6 px-4 py-8 lg:px-8">
      <div>
        <Link href="/tests" className="text-sm text-slate-500 hover:text-slate-900">
          ← All tests
        </Link>
        <h1 className="mt-2 text-2xl font-bold">New Reading test</h1>
        <p className="mt-1 text-sm text-slate-600">
          The test starts as a draft. Candidates only see it after you publish it.
        </p>
      </div>
      <NewTestForm />
    </section>
  );
}
