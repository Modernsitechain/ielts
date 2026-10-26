import "server-only";

import { withAuth } from "@workos-inc/authkit-nextjs";

import { getEnv } from "@/core/config/env";

// apps/api is only called from the server (Server Components and Server
// Actions), with the signed-in user's WorkOS access token as a bearer token.
// The API decides what their role (editor/admin) may do.

const REQUEST_TIMEOUT_MS = 5_000;

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string; errors: string[] };

type ErrorBody = {
  message?: string | string[];
  // 422 from publish: a list; 400 from validation: Zod's flattened errors.
  errors?: string[] | { formErrors?: string[]; fieldErrors?: Record<string, string[] | undefined> };
};

function readErrors(body: ErrorBody): string[] {
  const { errors } = body;
  if (!errors) return [];
  if (Array.isArray(errors)) return errors;
  return [
    ...(errors.formErrors ?? []),
    ...Object.entries(errors.fieldErrors ?? {}).flatMap(([field, messages]) =>
      (messages ?? []).map((message) => `${field}: ${message}`),
    ),
  ];
}

function describeStatus(status: number): string {
  if (status === 401) return "Your session has expired. Reload the page to sign in again.";
  if (status === 403) return "Your account isn't allowed to do this.";
  return `The API responded with ${status}.`;
}

/**
 * Calls apps/api as the signed-in user. API errors come back as `ok: false`
 * with readable messages; network errors throw.
 */
export async function apiRequest<T>(
  path: string,
  init?: { method?: string; body?: unknown },
): Promise<ApiResult<T>> {
  const hasBody = init?.body !== undefined;
  const { accessToken } = await withAuth();
  const headers: Record<string, string> = {};
  if (hasBody) headers["content-type"] = "application/json";
  if (accessToken) headers.authorization = `Bearer ${accessToken}`;
  const response = await fetch(`${getEnv().API_URL}${path}`, {
    method: init?.method ?? "GET",
    headers,
    body: hasBody ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (response.ok) {
    const data = response.status === 204 ? null : await response.json();
    return { ok: true, data: data as T };
  }

  const body = (await response.json().catch(() => ({}))) as ErrorBody;
  const message =
    response.status === 401 || response.status === 403 || !body.message
      ? describeStatus(response.status)
      : [body.message].flat().join(" ");
  return { ok: false, status: response.status, message, errors: readErrors(body) };
}

/** Calls an /admin endpoint of apps/api (see apiRequest). */
export function adminApi<T>(
  path: string,
  init?: { method?: string; body?: unknown },
): Promise<ApiResult<T>> {
  return apiRequest<T>(`/admin${path}`, init);
}

/** For pages: returns the data, null for 404, and throws on any other error. */
export async function adminApiOrThrow<T>(path: string): Promise<T | null> {
  const result = await adminApi<T>(path);
  if (result.ok) return result.data;
  if (result.status === 404) return null;
  throw new Error(result.message);
}
