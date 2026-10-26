import { authkitProxy } from "@workos-inc/authkit-nextjs";
import type { NextFetchEvent, NextRequest } from "next/server";

import { getEnv } from "@/core/config/env";

// Every admin page needs a WorkOS sign-in, except the callback WorkOS returns
// to. Roles (editor/admin) are checked by the API and shown by AccessGate.
// Paths here are without the /admin base path (Next.js strips it).
const authkit = authkitProxy({
  middlewareAuth: { enabled: true, unauthenticatedPaths: ["/callback"] },
});

export function proxy(request: NextRequest, event: NextFetchEvent) {
  getEnv(); // clear error if a variable is missing
  return authkit(request, event);
}

export const config = {
  // Everything except static files. "/" is listed on its own: with a base
  // path, the pattern below doesn't match the admin home (/admin).
  matcher: ["/", "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)"],
};
