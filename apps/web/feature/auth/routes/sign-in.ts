import { getSignInUrl } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

/** Local path to come back to after signing in; anything else falls back to "/". */
function safeReturnPath(value: string | null): string {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/";
}

// GET /sign-in[?returnTo=/tests/abc]: starts sign-in on the WorkOS page.
// Linked with a plain <a> (not next/link) so prefetching never starts it.
export async function GET(request: NextRequest) {
  const returnTo = safeReturnPath(request.nextUrl.searchParams.get("returnTo"));
  redirect(await getSignInUrl({ returnTo }));
}
