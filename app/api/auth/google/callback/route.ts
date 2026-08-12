import { NextResponse } from "next/server";

import type { LoginResult } from "@/lib/types";

import {
  appOrigin,
  authErrorRedirect,
  decodeGoogleState,
  exchangeGoogleCode,
  googleAuthApiBases,
  googleCredentials,
  googleRedirectUri,
} from "../helpers";

export const runtime = "nodejs";

async function readApiJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const oauthError = url.searchParams.get("error");
  const code = url.searchParams.get("code");
  const stateRaw = url.searchParams.get("state");

  let from: "login" | "register" = "login";

  try {
    if (oauthError) {
      return authErrorRedirect(request, from, "google_denied");
    }
    if (!code || !stateRaw) {
      return authErrorRedirect(request, from, "google_failed");
    }

    const state = decodeGoogleState(stateRaw);
    from = state.from;

    const { clientId, clientSecret, canExchange } = googleCredentials();
    if (!canExchange) {
      return authErrorRedirect(request, from, "google_not_configured");
    }

    const redirectUri = googleRedirectUri(request);
    const idToken = await exchangeGoogleCode(code, redirectUri, clientId, clientSecret);

    let lastMessage = "Google sign-in failed";
    for (const base of googleAuthApiBases()) {
      try {
        const response = await fetch(`${base}/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idToken,
            role: state.role,
          }),
          cache: "no-store",
          signal: AbortSignal.timeout(15000),
        });
        const payload = await readApiJson(response);
        if (response.ok && payload?.success && payload.data?.accessToken) {
          const data = payload.data as LoginResult;
          const callback = new URL("/auth/callback", appOrigin(request));
          callback.searchParams.set("accessToken", data.accessToken);
          return NextResponse.redirect(callback);
        }
        if (typeof payload?.message === "string" && payload.message) {
          lastMessage = payload.message;
        }
        if (response.status === 404 || response.status >= 500) continue;
        break;
      } catch (err) {
        lastMessage =
          err instanceof Error ? err.message : "Could not reach FixItNow API";
        continue;
      }
    }

    console.error("[google-oauth] callback failed:", lastMessage);

    if (lastMessage.toLowerCase().includes("not configured")) {
      return authErrorRedirect(request, from, "google_not_configured");
    }
    if (lastMessage.toLowerCase().includes("banned")) {
      return authErrorRedirect(request, from, "google_banned");
    }
    return authErrorRedirect(request, from, "google_failed");
  } catch (err) {
    console.error("[google-oauth] callback error:", err);
    return authErrorRedirect(request, from, "google_failed");
  }
}
