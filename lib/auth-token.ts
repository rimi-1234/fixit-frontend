import type { Role } from "@/lib/types";

/**
 * Cookie / localStorage keys for the JWT session.
 * Auth store and middleware read/write these same keys.
 */
export const AUTH_TOKEN_COOKIE = "fixitnow_token";
export const AUTH_ROLE_COOKIE = "fixitnow_role";

/** JWT access token lifetime (~1 day from backend). */
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24;

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  if (!match) return null;
  return decodeURIComponent(match.split("=").slice(1).join("="));
}

function writeCookie(name: string, value: string, maxAge = SESSION_MAX_AGE_SECONDS) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

/** Returns the access token from cookie, or localStorage mirror (client only). */
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;

  const fromCookie = readCookie(AUTH_TOKEN_COOKIE);
  if (fromCookie) return fromCookie;

  try {
    return localStorage.getItem(AUTH_TOKEN_COOKIE);
  } catch {
    return null;
  }
}

export function getStoredRole(): Role | null {
  if (typeof window === "undefined") return null;
  const role = readCookie(AUTH_ROLE_COOKIE);
  if (role === "CUSTOMER" || role === "TECHNICIAN" || role === "ADMIN") {
    return role;
  }
  try {
    const fromStorage = localStorage.getItem(AUTH_ROLE_COOKIE);
    if (
      fromStorage === "CUSTOMER" ||
      fromStorage === "TECHNICIAN" ||
      fromStorage === "ADMIN"
    ) {
      return fromStorage;
    }
  } catch {
    /* ignore */
  }
  return null;
}

/** Persist token + role for middleware (cookie) and client reads (localStorage). */
export function persistSession(token: string, role: Role) {
  writeCookie(AUTH_TOKEN_COOKIE, token);
  writeCookie(AUTH_ROLE_COOKIE, role);
  try {
    localStorage.setItem(AUTH_TOKEN_COOKIE, token);
    localStorage.setItem(AUTH_ROLE_COOKIE, role);
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearSessionStorage() {
  deleteCookie(AUTH_TOKEN_COOKIE);
  deleteCookie(AUTH_ROLE_COOKIE);
  try {
    localStorage.removeItem(AUTH_TOKEN_COOKIE);
    localStorage.removeItem(AUTH_ROLE_COOKIE);
  } catch {
    /* ignore */
  }
}

export function dashboardPathForRole(role: Role): string {
  switch (role) {
    case "TECHNICIAN":
      return "/dashboard/technician";
    case "ADMIN":
      return "/dashboard/admin";
    case "CUSTOMER":
    default:
      return "/dashboard/customer";
  }
}
