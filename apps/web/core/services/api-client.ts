import "server-only";

// Base URL of apps/api. Only used on the server (Server Components and
// Server Actions), so the browser never talks to the API directly.
const API_URL = process.env.API_URL ?? "http://localhost:4000";

const REQUEST_TIMEOUT_MS = 3_000;

export class ApiError extends Error {
  constructor(
    readonly status: number,
    path: string,
  ) {
    super(`API ${path} responded with ${status}`);
  }
}

/** Calls apps/api without caching. Throws on network errors and timeouts. */
export async function apiFetch(
  path: string,
  init?: { method?: string; body?: unknown },
): Promise<Response> {
  const hasBody = init?.body !== undefined;
  return fetch(`${API_URL}${path}`, {
    method: init?.method ?? "GET",
    headers: hasBody ? { "content-type": "application/json" } : undefined,
    body: hasBody ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
}

/**
 * Calls apps/api and parses the JSON response. Returns null for 404 so
 * callers can render "not found"; throws ApiError for other failures.
 */
export async function apiJson<T>(
  path: string,
  init?: { method?: string; body?: unknown },
): Promise<T | null> {
  const response = await apiFetch(path, init);
  if (response.status === 404) return null;
  if (!response.ok) throw new ApiError(response.status, path);
  return (await response.json()) as T;
}
