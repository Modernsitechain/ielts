import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { AccountMenu } from "@/feature/auth/components/account-menu";
import { Logo } from "@/shared/components/logo";

const FOOTER_LINKS = [
  { href: "/pricing", label: "Pricing" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/refund-policy", label: "Refunds" },
  { href: "/contact", label: "Contact" },
];

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
            <Link href="/pricing" className="transition-colors hover:text-slate-900">
              Pricing
            </Link>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <AccountMenu />
            <Link
              href="/tests"
              className="hidden items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 sm:inline-flex"
            >
              Start practising
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-4">
            <Logo />
            <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
              {FOOTER_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="hover:text-slate-900">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <p className="max-w-xl text-xs leading-relaxed text-slate-500">
            IELTS is a registered trademark of the British Council, IDP: IELTS
            Australia and Cambridge University Press &amp; Assessment. This product
            is independent, not affiliated with or endorsed by them, and does not
            use official test material.
          </p>
        </div>
      </footer>
    </div>
  );
}
