import { handleAuth } from "@workos-inc/authkit-nextjs";
import type { NextRequest } from "next/server";

import { getAppOrigin } from "@/core/config/auth";

// WorkOS sends users here after sign-in (NEXT_PUBLIC_WORKOS_REDIRECT_URI).
// baseURL: inside Docker the request's own host isn't the public address.
export function GET(request: NextRequest) {
  return handleAuth({ baseURL: getAppOrigin() })(request);
}
