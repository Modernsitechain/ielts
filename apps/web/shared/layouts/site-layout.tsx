import Link from "next/link";
import type { ReactNode } from "react";

/** Layout halaman umum: header navigasi + footer disclaimer. */
export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white">
        <nav className="mx-auto flex max-w-4xl items-center gap-6 px-4 py-3">
          <Link href="/" className="font-semibold">
            IELTS Mock
          </Link>
          <Link href="/tests" className="text-sm text-slate-600 hover:text-slate-900">
            Katalog tes
          </Link>
          <Link href="/history" className="text-sm text-slate-600 hover:text-slate-900">
            Riwayat
          </Link>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">{children}</main>

      <footer className="border-t border-slate-200 px-4 py-4 text-center text-xs text-slate-500">
        IELTS adalah merek dagang milik pemiliknya. Produk ini tidak berafiliasi
        dengan IELTS, British Council, IDP, maupun Cambridge, dan tidak
        menggunakan soal resmi.
      </footer>
    </div>
  );
}
