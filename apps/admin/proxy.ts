import { createHash, timingSafeEqual } from "node:crypto";

import { type NextRequest, NextResponse } from "next/server";

import { getEnv } from "@/core/config/env";

// TEMPORARY password gate (HTTP Basic Auth) for the deployed admin, until
// WorkOS login with admin/editor roles replaces it (Phase 3). Off locally.

function sha256(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

function matches(given: string, expected: string): boolean {
  return timingSafeEqual(sha256(given), sha256(expected));
}

export function proxy(request: NextRequest) {
  const env = getEnv();
  if (env.APP_ENV === "local") return NextResponse.next();

  const [scheme, encoded] = request.headers.get("authorization")?.split(" ") ?? [];
  if (scheme === "Basic" && encoded) {
    const decoded = Buffer.from(encoded, "base64").toString("utf8");
    const separator = decoded.indexOf(":");
    const user = decoded.slice(0, separator);
    const password = decoded.slice(separator + 1);
    // Both are checked so the response time doesn't reveal which one was wrong.
    const userOk = matches(user, env.ADMIN_BASIC_AUTH_USER ?? "");
    const passwordOk = matches(password, env.ADMIN_BASIC_AUTH_PASSWORD ?? "");
    if (separator > 0 && userOk && passwordOk) return NextResponse.next();
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="IELTS Mock Admin", charset="UTF-8"' },
  });
}
