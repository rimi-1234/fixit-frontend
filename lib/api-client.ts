import { getAccessToken } from "@/lib/auth-token";
import type { ApiErrorDetails, ApiErrorResponse, ApiSuccessResponse } from "@/lib/types";

export class ApiError extends Error {
  status: number;
  errorDetails: ApiErrorDetails;

  constructor(message: string, status: number, errorDetails: ApiErrorDetails = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errorDetails = errorDetails;
  }
}

type ApiFetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  /** Skip attaching Authorization header (e.g. login/register). */
  skipAuth?: boolean;
  /** Optional token override (useful before cookie is written). */
  token?: string | null;
};

function getBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) {
    throw new ApiError(
      "NEXT_PUBLIC_API_URL is not set. Copy .env.example to .env.local.",
      500
    );
  }
  return base.replace(/\/$/, "");
}

function buildUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getBaseUrl()}${normalized}`;
}

/**
 * Typed fetch wrapper for FixItNowPro.
 * Unwraps `{ success, message, data }` and throws `ApiError` on failure.
 */
export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { body, skipAuth = false, token, headers: initHeaders, ...rest } = options;

  const headers = new Headers(initHeaders);
  if (body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (!skipAuth) {
    const accessToken = token === undefined ? getAccessToken() : token;
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
  }

  const response = await fetch(buildUrl(path), {
    ...rest,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  let payload: ApiSuccessResponse<T> | ApiErrorResponse | null = null;
  try {
    payload = (await response.json()) as ApiSuccessResponse<T> | ApiErrorResponse;
  } catch {
    throw new ApiError(
      response.ok
        ? "Invalid JSON response from API"
        : `Request failed with status ${response.status}`,
      response.status
    );
  }

  if (!response.ok || !payload || payload.success === false) {
    const message =
      payload && "message" in payload && payload.message
        ? payload.message
        : `Request failed with status ${response.status}`;
    const errorDetails =
      payload && "errorDetails" in payload && payload.errorDetails
        ? payload.errorDetails
        : {};
    throw new ApiError(message, response.status, errorDetails);
  }

  return payload.data;
}
