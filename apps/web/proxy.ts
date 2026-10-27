import { authkitProxy } from "@workos-inc/authkit-nextjs";
import type { NextFetchEvent, NextRequest } from "next/server";

import { getAuthEnv } from "@/core/config/auth";

// WorkOS session on every page: refreshes the access token before it expires
// and sends signed-out visitors of private pages to sign in. Pages not listed
// here (history, exam sessions) need a signed-in user. The API checks the
// token again: this only decides where to send people.
const PUBLIC_PATHS = [
  "/",
  "/tests",
  "/tests/:path*",
  "/pricing",
  "/terms",
  "/privacy",
  "/refund-policy",
  "/contact",
  "/status",
  "/sign-in",
  "/callback",
];

const authkit = authkitProxy({
  middlewareAuth: { enabled: true, unauthenticatedPaths: PUBLIC_PATHS },
});

export function proxy(request: NextRequest, event: NextFetchEvent) {
  getAuthEnv(); // clear error if a WorkOS variable is missing
  return authkit(request, event);
}

export const config = {
  // Everything except static files.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)"],
};
