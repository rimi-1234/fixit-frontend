import { NextResponse } from "next/server";

import type { LoginResult, Role } from "@/lib/types";

/** Seeded demo accounts — server-only; never exposed to the browser. */
const DEMO_CREDENTIALS: Record<
  Role,
  { email: string; password: string }
> = {
  CUSTOMER: {
    email: "customer@fixitnow.com",
    password: "customer123",
  },
  TECHNICIAN: {
    email: "technician@fixitnow.com",
    password: "tech123",
  },
  ADMIN: {
    email: "admin@fixitnow.com",
    password: "Admin@1234",
  },
};

const ROLES = new Set<Role>(["CUSTOMER", "TECHNICIAN", "ADMIN"]);

function apiBases() {
  const remote = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  const local = (process.env.API_INTERNAL_URL || "http://localhost:5000/api").replace(/\/$/, "");
  if (!remote) throw new Error("NEXT_PUBLIC_API_URL is not set");
  if (process.env.NODE_ENV === "development" && local !== remote) {
    return [local, remote];
  }
  return [remote];
}

async function readApiJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Demo role login BFF:
 * 1) Prefer backend POST /auth/demo-login when deployed
 * 2) Fall back to POST /auth/login with server-side seeded credentials
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { role?: Role };
    const role = body.role;

    if (!role || !ROLES.has(role)) {
      return NextResponse.json(
        {
          success: false,
          message: "Role must be CUSTOMER, TECHNICIAN, or ADMIN",
          errorDetails: {},
        },
        { status: 400 }
      );
    }

    const credentials = DEMO_CREDENTIALS[role];

    for (const base of apiBases()) {
      try {
        const demoResponse = await fetch(`${base}/auth/demo-login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role }),
          cache: "no-store",
          signal: AbortSignal.timeout(5000),
        });
        const demoPayload = await readApiJson(demoResponse);

        if (demoResponse.ok && demoPayload?.success && demoPayload.data) {
          return NextResponse.json({
            success: true,
            message: "Demo user logged in successfully",
            data: demoPayload.data as LoginResult,
          });
        }

        const loginResponse = await fetch(`${base}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
          cache: "no-store",
          signal: AbortSignal.timeout(8000),
        });
        const loginPayload = await readApiJson(loginResponse);

        if (loginResponse.ok && loginPayload?.success && loginPayload.data) {
          return NextResponse.json({
            success: true,
            message: "Demo user logged in successfully",
            data: loginPayload.data as LoginResult,
          });
        }
      } catch {
        continue;
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: "Demo login failed. Ensure the API is running and seed accounts exist.",
        errorDetails: {},
      },
      { status: 502 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Demo login failed",
        errorDetails: {},
      },
      { status: 500 }
    );
  }
}
