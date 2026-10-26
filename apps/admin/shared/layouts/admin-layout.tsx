import { FileText, GraduationCap } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

/** Header with navigation; pages own their width. */
export function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <nav className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 text-white">
              <GraduationCap className="h-4 w-4" aria-hidden />
            </span>
            IELTS Mock Admin
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 transition-colors hover:text-slate-900"
          >
            <FileText className="h-4 w-4" aria-hidden />
            Tests
          </Link>
          <span
            className="ml-auto rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800"
            title="Protected by a temporary admin key until WorkOS login is added"
          >
            Local only
          </span>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
