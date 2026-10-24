import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Logo } from "@/shared/components/logo";

/**
 * Layout for general pages: sticky navigation header + disclaimer footer.
 * Pages own their width, so landing sections can span the full screen.
 */
export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
        <nav className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-4">
          <Logo />
          <div className="flex items-center gap-6 text-sm text-slate-600">
            <Link href="/tests" className="transition-colors hover:text-slate-900">
              Tests
            </Link>
            <Link href="/history" className="transition-colors hover:text-slate-900">
              History
            </Link>
          </div>
          <Link
            href="/tests"
            className="ml-auto hidden items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 sm:inline-flex"
          >
            Start practising
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-start sm:justify-between">
          <Logo />
          <p className="max-w-xl text-xs leading-relaxed text-slate-500">
            IELTS is a registered trademark of its respective owners. This product
            is not affiliated with IELTS, the British Council, IDP or Cambridge, and
            does not use official test material.
          </p>
        </div>
      </footer>
    </div>
  );
}
