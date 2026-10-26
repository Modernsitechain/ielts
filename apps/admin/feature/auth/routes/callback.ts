import { handleAuth } from "@workos-inc/authkit-nextjs";
import type { NextRequest } from "next/server";

import { getAppOrigin } from "@/core/config/env";

// WorkOS sends users here after sign-in (NEXT_PUBLIC_WORKOS_REDIRECT_URI).
// baseURL: inside Docker the request's own host isn't the public address.
// returnPathname keeps users in the admin: "/" is apps/web when deployed.
export function GET(request: NextRequest) {
  return handleAuth({ baseURL: getAppOrigin(), returnPathname: "/admin" })(request);
}
