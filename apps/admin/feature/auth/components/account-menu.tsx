import { LogOut } from "lucide-react";

import { getCurrentUser } from "@/core/services/user.service";
import { signOutAction } from "@/feature/auth/actions";

const ROLE_LABEL = { student: "Student", editor: "Editor", admin: "Admin" } as const;

/** Header corner: who is signed in, their role, and "Sign out". */
export async function AccountMenu() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <form action={signOutAction} className="flex items-center gap-3 text-sm">
      <span className="hidden max-w-48 truncate text-slate-600 sm:inline">{user.name ?? user.email}</span>
      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
        {ROLE_LABEL[user.role]}
      </span>
      <button
        type="submit"
        className="inline-flex items-center gap-1.5 text-slate-600 transition-colors hover:text-slate-900"
      >
        <LogOut className="h-4 w-4" aria-hidden />
        Sign out
      </button>
    </form>
  );
}
