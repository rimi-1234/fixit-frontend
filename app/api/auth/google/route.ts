import { NextResponse } from "next/server";

import {
  authErrorRedirect,
  buildGoogleAuthUrl,
  encodeGoogleState,
  googleCredentials,
  googleRedirectUri,
} from "./helpers";

export const runtime = "nodejs";

function parseRole(value: string | null) {
  return value === "TECHNICIAN" ? "TECHNICIAN" : "CUSTOMER";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const role = parseRole(url.searchParams.get("role"));
  const from = url.searchParams.get("from") === "register" ? "register" : "login";
  const { clientId, configured } = googleCredentials();
  if (!configured) {
    return authErrorRedirect(request, from, "google_not_configured");
  }

  const state = encodeGoogleState({
    role,
    nonce: crypto.randomUUID(),
    from,
  });

  return NextResponse.redirect(
    buildGoogleAuthUrl(googleRedirectUri(request), state, clientId)
  );
}
