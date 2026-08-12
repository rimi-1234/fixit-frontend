import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { NextResponse } from "next/server";

import type { Role } from "@/lib/types";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const NONCE_COOKIE = "google_oauth_nonce";

export type GoogleOAuthState = {
  role: Extract<Role, "CUSTOMER" | "TECHNICIAN">;
  nonce: string;
  from: "login" | "register";
  exp: number;
};

function parseEnvFile(filePath: string) {
  if (!existsSync(filePath)) return {} as Record<string, string>;
  const values: Record<string, string> = {};
  for (const raw of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    values[key] = value;
  }
  return values;
}

function fileEnv() {
  const files = [
    resolve(process.cwd(), ".env.local"),
    resolve(process.cwd(), ".env"),
    resolve(process.cwd(), "FixItNow-web-pro", ".env.local"),
  ];
  let values: Record<string, string> = {};
  for (const file of files) {
    values = { ...values, ...parseEnvFile(file) };
  }
  return values;
}

export function googleCredentials() {
  const fromFile = fileEnv();
  const clientId = String(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      process.env.GOOGLE_CLIENT_ID ||
      fromFile.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      fromFile.GOOGLE_CLIENT_ID ||
      ""
  ).trim();
  const clientSecret = String(
    process.env.GOOGLE_CLIENT_SECRET || fromFile.GOOGLE_CLIENT_SECRET || ""
  ).trim();
  return {
    clientId,
    clientSecret,
    configured: Boolean(clientId),
    canExchange: Boolean(clientId && clientSecret),
  };
}

export function googleAuthApiBases() {
  const remote = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  const local = (
    process.env.API_INTERNAL_URL || "http://localhost:5000/api"
  ).replace(/\/$/, "");
  if (!remote) throw new Error("NEXT_PUBLIC_API_URL is not set");
  if (process.env.NODE_ENV === "development") {
    return [local];
  }
  return [remote];
}

export function appOrigin(request: Request) {
  const requestOrigin = new URL(request.url).origin;
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (!configured) return requestOrigin;

  const configuredIsLocal =
    configured.includes("localhost") || configured.includes("127.0.0.1");
  const requestIsDeployed =
    !requestOrigin.includes("localhost") && !requestOrigin.includes("127.0.0.1");

  // Avoid sending production users to localhost when env was copied from local dev.
  if (configuredIsLocal && requestIsDeployed) return requestOrigin;

  return configured;
}

export function googleRedirectUri(request: Request) {
  return `${appOrigin(request)}/api/auth/google/callback`;
}

export function encodeGoogleState(state: Omit<GoogleOAuthState, "exp">) {
  const payload: GoogleOAuthState = {
    ...state,
    exp: Date.now() + 10 * 60 * 1000,
  };
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

export function decodeGoogleState(raw: string): GoogleOAuthState {
  const parsed = JSON.parse(
    Buffer.from(raw, "base64url").toString("utf8")
  ) as GoogleOAuthState;
  if (!parsed || Date.now() > parsed.exp) {
    throw new Error("Google sign-in state expired");
  }
  return parsed;
}

export function buildGoogleAuthUrl(redirectUri: string, state: string, clientId: string) {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
    access_type: "online",
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export async function exchangeGoogleCode(
  code: string,
  redirectUri: string,
  clientId: string,
  clientSecret: string
) {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  const payload = (await response.json()) as { id_token?: string; error?: string };
  if (!response.ok || !payload.id_token) {
    throw new Error(payload.error || "Failed to exchange Google authorization code");
  }
  return payload.id_token;
}

export function nonceCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 10,
  };
}

export { NONCE_COOKIE };

export function authErrorRedirect(request: Request, from: string, code: string) {
  const path = from === "register" ? "/register" : "/login";
  return NextResponse.redirect(
    new URL(`${path}?error=${encodeURIComponent(code)}`, appOrigin(request))
  );
}
