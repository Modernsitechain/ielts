import "server-only";

import { withAuth } from "@workos-inc/authkit-nextjs";

/** Who is signed in, for display. Null for visitors. */
export type SignedInUser = { name: string | null; email: string };

/** The signed-in user from the WorkOS session cookie (refreshed by proxy.ts). */
export async function getSignedInUser(): Promise<SignedInUser | null> {
  const { user } = await withAuth();
  if (!user) return null;
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
  return { name: name || null, email: user.email };
}
