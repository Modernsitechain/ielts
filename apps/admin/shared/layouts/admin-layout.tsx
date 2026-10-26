import { GraduationCap } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { SidebarNav } from "@/shared/components/sidebar-nav";

/**
 * Admin shell: sidebar (brand, menu, account) on the left, page content on the
 * right. On small screens the sidebar becomes a top bar. Pages own their width.
 */
export function AdminLayout({ account, children }: { account: ReactNode; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <aside className="border-b border-slate-200 bg-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col lg:border-r lg:border-b-0">
        <div className="flex h-16 items-center justify-between gap-3 px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
              <GraduationCap className="h-4 w-4" aria-hidden />
            </span>
            <span>
              IELTS Mock
              <span className="block text-xs font-normal text-slate-500">Admin</span>
            </span>
          </Link>
        </div>

        <SidebarNav />

        <div className="hidden border-t border-slate-200 p-3 lg:mt-auto lg:block">{account}</div>
      </aside>

      <div className="min-w-0 flex-1">
        {/* Account on small screens, where the sidebar footer is hidden. */}
        <div className="flex justify-end border-b border-slate-200 bg-white px-4 py-2 lg:hidden">{account}</div>
        <main>{children}</main>
      </div>
    </div>
  );
}
