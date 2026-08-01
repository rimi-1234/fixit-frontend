/**
 * Cookie / localStorage keys for the JWT session.
 * Auth store (Checkpoint 5) and middleware will write/read these same keys.
 */
export const AUTH_TOKEN_COOKIE = "fixitnow_token";
export const AUTH_ROLE_COOKIE = "fixitnow_role";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  if (!match) return null;
  return decodeURIComponent(match.split("=").slice(1).join("="));
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
