import { LogOut } from "lucide-react";

import { getCurrentUser } from "@/core/services/user.service";
import { signOutAction } from "@/feature/auth/actions";

const ROLE_LABEL = { student: "Student", editor: "Editor", admin: "Admin" } as const;

/** Sidebar footer: who is signed in, their role, and a sign-out button. */
export async function AccountMenu() {
  const user = await getCurrentUser();
  if (!user) return null;
  const displayName = user.name ?? user.email;

  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700"
      >
        {displayName.charAt(0).toUpperCase()}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{displayName}</p>
        <p className="text-xs text-slate-500">{ROLE_LABEL[user.role]}</p>
      </div>
      <form action={signOutAction}>
        <button
          type="submit"
          aria-label="Sign out"
          title="Sign out"
          className="rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          <LogOut className="h-4 w-4" aria-hidden />
        </button>
      </form>
    </div>
  );
}
