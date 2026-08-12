import { NextResponse } from "next/server";

import {
  NONCE_COOKIE,
  apiBases,
  authErrorRedirect,
  buildGoogleAuthUrl,
  encodeGoogleState,
  googleCredentials,
  googleRedirectUri,
  nonceCookieOptions,
} from "./helpers";

function parseRole(value: string | null) {
  return value === "TECHNICIAN" ? "TECHNICIAN" : "CUSTOMER";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const role = parseRole(url.searchParams.get("role"));
  const from = url.searchParams.get("from") === "register" ? "register" : "login";
  const { clientId, configured } = googleCredentials();

  if (configured) {
    const nonce = crypto.randomUUID();
    const state = encodeGoogleState({ role, nonce, from });
    const response = NextResponse.redirect(
      buildGoogleAuthUrl(googleRedirectUri(request), state, clientId)
    );
    response.cookies.set(NONCE_COOKIE, nonce, nonceCookieOptions());
    return response;
  }

  try {
    const backend = apiBases()[0];
    const start = new URL(`${backend}/auth/google`);
    start.searchParams.set("role", role);
    return NextResponse.redirect(start);
  } catch {
    return authErrorRedirect(request, from, "google_not_configured");
  }
}
