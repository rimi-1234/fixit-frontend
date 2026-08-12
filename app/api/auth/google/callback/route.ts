import { NextResponse } from "next/server";

import type { LoginResult } from "@/lib/types";

import {
  NONCE_COOKIE,
  apiBases,
  appOrigin,
  authErrorRedirect,
  decodeGoogleState,
  exchangeGoogleCode,
  googleCredentials,
  googleRedirectUri,
} from "../helpers";

async function readApiJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  const code = url.searchParams.get("code");
  const stateRaw = url.searchParams.get("state");
  const cookieHeader = request.headers.get("cookie") ?? "";
  const nonce = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${NONCE_COOKIE}=`))
    ?.split("=")
    .slice(1)
    .join("=");

  let from: "login" | "register" = "login";

  try {
    if (error) {
      return authErrorRedirect(request, from, "google_denied");
    }
    if (!code || !stateRaw) {
      return authErrorRedirect(request, from, "google_failed");
    }

    const state = decodeGoogleState(stateRaw);
    from = state.from;
    if (!nonce || nonce !== state.nonce) {
      return authErrorRedirect(request, from, "google_failed");
    }

    const { clientId, clientSecret, configured } = googleCredentials();
    if (!configured) {
      return authErrorRedirect(request, from, "google_not_configured");
    }

    const idToken = await exchangeGoogleCode(
      code,
      googleRedirectUri(request),
      clientId,
      clientSecret
    );

    let lastMessage = "Google sign-in failed";
    for (const base of apiBases()) {
      try {
        const response = await fetch(`${base}/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken, role: state.role }),
          cache: "no-store",
          signal: AbortSignal.timeout(8000),
        });
        const payload = await readApiJson(response);
        if (response.ok && payload?.success && payload.data?.accessToken) {
          const data = payload.data as LoginResult;
          const callback = new URL("/auth/callback", appOrigin(request));
          callback.searchParams.set("accessToken", data.accessToken);
          const redirect = NextResponse.redirect(callback);
          redirect.cookies.set(NONCE_COOKIE, "", { path: "/", maxAge: 0 });
          return redirect;
        }
        if (typeof payload?.message === "string" && payload.message) {
          lastMessage = payload.message;
        }
        if (response.status === 404 || response.status >= 500) continue;
        break;
      } catch {
        continue;
      }
    }

    if (lastMessage.toLowerCase().includes("not configured")) {
      return authErrorRedirect(request, from, "google_not_configured");
    }
    return authErrorRedirect(request, from, "google_failed");
  } catch {
    return authErrorRedirect(request, from, "google_failed");
  }
}
