import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function FinalCta() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-24">
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-600 via-violet-600 to-fuchsia-600 px-6 py-14 text-center text-white sm:px-12">
        <div className="bg-grid absolute inset-0 opacity-20 invert" />
        <h2 className="relative text-3xl font-semibold tracking-tight sm:text-4xl">
          Ready for your first mock test?
        </h2>
        <p className="relative mx-auto mt-4 max-w-xl text-indigo-100">
          It takes 60 minutes and gives you a realistic picture of where you
          stand. Your first test is on us.
        </p>
        <Link
          href="/tests/reading-demo-1"
          className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-violet-700 shadow-lg transition hover:bg-violet-50"
        >
          Start the free Reading test
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
