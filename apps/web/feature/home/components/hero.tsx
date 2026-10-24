import { ArrowRight, Check, Sparkles } from "lucide-react";
import Link from "next/link";

import { ExamPreview } from "./exam-preview";

const HIGHLIGHTS = ["Computer-delivered format", "Instant marking", "Free to start"];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="bg-grid absolute inset-0 mask-[radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
      <div className="absolute -top-40 left-1/2 h-96 w-160 -translate-x-1/2 rounded-full bg-linear-to-r from-indigo-400/30 via-violet-400/25 to-fuchsia-400/30 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-16 px-4 pt-20 pb-28 lg:grid-cols-2 lg:pt-28">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-white/70 px-3 py-1 text-xs font-medium text-violet-700 shadow-sm backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            AI study coach coming soon
          </span>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Walk into test day like you&apos;ve{" "}
            <span className="bg-linear-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              done it before
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
            Realistic IELTS Academic Reading &amp; Listening mock tests in an
            interface modelled on IELTS on computer, so nothing on the screen
            surprises you on the day.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/tests/reading-demo-1"
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-700"
            >
              Try a free Reading test
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/tests"
              className="inline-flex items-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
            >
              Browse all tests
            </Link>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-600" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <ExamPreview />
      </div>
    </section>
  );
}
