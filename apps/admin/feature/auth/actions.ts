"use server";

import { signOut } from "@workos-inc/authkit-nextjs";

import { getAppOrigin } from "@/core/config/env";

/** Ends the WorkOS session; the admin then asks to sign in again. */
export async function signOutAction(): Promise<void> {
  await signOut({ returnTo: `${getAppOrigin()}/admin` });
}
