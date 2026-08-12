import { NextResponse } from "next/server";

function remoteApiBase() {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) throw new Error("NEXT_PUBLIC_API_URL is not set");
  return base.replace(/\/$/, "");
}

function localApiBase() {
  const local = process.env.API_INTERNAL_URL || "http://localhost:5000/api";
  return local.replace(/\/$/, "");
}

function apiBases(preferLocal: boolean) {
  const remote = remoteApiBase();
  const local = localApiBase();
  if (process.env.NODE_ENV !== "development" || local === remote) {
    return [remote];
  }
  return preferLocal ? [local, remote] : [remote, local];
}

async function readApiJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function isMissingRoute(status: number, payload: { message?: string } | null) {
  if (status === 404 || status === 405) return true;
  const message = payload?.message?.toLowerCase() ?? "";
  return message.includes("not found") || message.includes("cannot patch");
}

type ApiPayload = {
  success?: boolean;
  message?: string;
  data?: unknown;
  errorDetails?: unknown;
};

async function callAuthMe(
  base: string,
  method: "GET" | "PATCH",
  authorization: string,
  body?: string
) {
  const response = await fetch(`${base}/auth/me`, {
    method,
    headers: {
      Authorization: authorization,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body,
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });
  const payload = (await readApiJson(response)) as ApiPayload | null;
  return { status: response.status, payload };
}

async function proxyAuthMe(request: Request, method: "GET" | "PATCH") {
  const authorization = request.headers.get("authorization");
  if (!authorization) {
    return NextResponse.json(
      { success: false, message: "Authentication required", errorDetails: {} },
      { status: 401 }
    );
  }

  let body: string | undefined;
  if (method === "PATCH") {
    try {
      body = JSON.stringify(await request.json());
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON body", errorDetails: {} },
        { status: 400 }
      );
    }
  }

  let lastStatus = 502;
  let lastPayload: ApiPayload | null = null;

  for (const base of apiBases(method === "GET")) {
    try {
      const { status, payload } = await callAuthMe(base, method, authorization, body);
      lastStatus = status;
      lastPayload = payload;

      if (status >= 200 && status < 300 && payload?.success) {
        return NextResponse.json({
          success: true,
          message:
            payload.message ||
            (method === "PATCH"
              ? "Profile updated successfully"
              : "User profile retrieved successfully"),
          data: payload.data,
        });
      }

      if (isMissingRoute(status, payload)) continue;
      if (status >= 500) continue;
      break;
    } catch {
      continue;
    }
  }

  return NextResponse.json(
    {
      success: false,
      message: lastPayload?.message || "Failed to update profile",
      errorDetails: lastPayload?.errorDetails || {},
    },
    { status: lastStatus || 502 }
  );
}

export async function GET(request: Request) {
  return proxyAuthMe(request, "GET");
}

export async function PATCH(request: Request) {
  return proxyAuthMe(request, "PATCH");
}
