import { LogIn, LogOut } from "lucide-react";

import { getSignedInUser } from "@/core/services/auth.service";
import { signOutAction } from "@/feature/auth/actions";

/** Header corner: "Sign in" for visitors, name and "Sign out" for users. */
export async function AccountMenu() {
  const user = await getSignedInUser();

  if (!user) {
    return (
      // Plain <a>: sign-in is a route that redirects to WorkOS.
      <a
        href="/sign-in"
        className="inline-flex items-center gap-1.5 text-sm text-slate-600 transition-colors hover:text-slate-900"
      >
        <LogIn className="h-4 w-4" aria-hidden />
        Sign in
      </a>
    );
  }

  return (
    <form action={signOutAction} className="flex items-center gap-3 text-sm">
      <span className="hidden max-w-40 truncate text-slate-600 sm:inline-block">
        {user.name ?? user.email ?? "user"}
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
