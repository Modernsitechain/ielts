import { LogOut, ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";

import { ADMIN_APP_ROLES } from "@/core/models/user";
import { getCurrentUser } from "@/core/services/user.service";
import { signOutAction } from "@/feature/auth/actions";

/**
 * Shows the admin only to editors and admins. Convenience, not security: the
 * API rejects other users' requests anyway.
 */
export async function AccessGate({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (user && ADMIN_APP_ROLES.includes(user.role)) return children;

  return (
    <section className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-4 text-center">
      <ShieldAlert className="h-10 w-10 text-amber-500" aria-hidden />
      <h1 className="mt-4 text-xl font-semibold">No access</h1>
      <p className="mt-2 text-sm text-slate-600">
        {user
          ? `${user.email} is signed in, but only editors and admins can use this app. Ask an admin to give your account access.`
          : "We couldn't check your account. Try signing in again."}
      </p>
      <form action={signOutAction} className="mt-6">
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          Sign out
        </button>
      </form>
    </section>
  );
}
