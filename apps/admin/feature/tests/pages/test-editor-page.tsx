import Link from "next/link";
import { notFound } from "next/navigation";

import { getTest } from "@/core/services/test.service";
import { TestEditor } from "../components/test-editor";

export default async function TestEditorPage({
  params,
}: {
  params: Promise<{ testId: string }>;
}) {
  const { testId } = await params;
  const test = await getTest(testId);
  if (!test) notFound();

  return (
    <section className="mx-auto w-full max-w-6xl space-y-4 px-4 py-6 lg:px-8">
      <Link href="/tests" className="text-sm text-slate-500 hover:text-slate-900">
        ← All tests
      </Link>
      <TestEditor key={test.id} initialTest={test} />
    </section>
  );
}
