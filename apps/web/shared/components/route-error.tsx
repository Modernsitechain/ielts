"use client";

import { RotateCcw, ServerCrash } from "lucide-react";

/** Error boundary content for route groups, e.g. when apps/api is unreachable. */
export function RouteError({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
        <ServerCrash className="h-6 w-6" aria-hidden />
      </span>
      <h1 className="mt-5 text-xl font-semibold">We couldn&apos;t load this page</h1>
      <p className="mt-2 text-sm text-slate-600">
        The server may be unavailable. Please try again in a moment.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
      >
        <RotateCcw className="h-4 w-4" aria-hidden />
        Try again
      </button>
    </section>
  );
}
