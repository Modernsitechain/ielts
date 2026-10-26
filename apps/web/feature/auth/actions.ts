"use server";

import { signOut } from "@workos-inc/authkit-nextjs";

import { getAppOrigin } from "@/core/config/auth";

/** Ends the WorkOS session and returns to the home page. */
export async function signOutAction(): Promise<void> {
  await signOut({ returnTo: `${getAppOrigin()}/` });
}
