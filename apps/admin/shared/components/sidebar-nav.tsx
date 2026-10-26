"use client";

import { CreditCard, FileText, ImageIcon, LayoutDashboard, type LucideIcon, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string; icon: LucideIcon };

const MAIN: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tests", label: "Tests", icon: FileText },
];

/** Planned sections (docs/project-brief.md), shown so the menu's shape is clear. */
const COMING_SOON: Omit<NavItem, "href">[] = [
  { label: "Users & roles", icon: Users },
  { label: "Media library", icon: ImageIcon },
  { label: "Payments", icon: CreditCard },
];

function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/** Sidebar menu: vertical on large screens, a scrollable row on small ones. */
export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:pb-0">
      {MAIN.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {label}
          </Link>
        );
      })}

      <p className="mt-6 hidden px-3 pb-1 text-xs font-medium tracking-wide text-slate-400 uppercase lg:block">
        Coming soon
      </p>
      {COMING_SOON.map(({ label, icon: Icon }) => (
        <span
          key={label}
          aria-disabled="true"
          className="hidden cursor-not-allowed items-center gap-2.5 rounded-md px-3 py-2 text-sm text-slate-400 lg:flex"
        >
          <Icon className="h-4 w-4" aria-hidden />
          {label}
        </span>
      ))}
    </nav>
  );
}
