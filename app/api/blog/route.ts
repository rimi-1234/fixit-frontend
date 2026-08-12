import { NextResponse } from "next/server";

function remoteApiBase() {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) throw new Error("NEXT_PUBLIC_API_URL is not set");
  return base.replace(/\/$/, "");
}

function localApiBase() {
  return (process.env.API_INTERNAL_URL || "http://localhost:5000/api").replace(/\/$/, "");
}

function apiBases() {
  const remote = remoteApiBase();
  const local = localApiBase();
  if (process.env.NODE_ENV !== "development" || local === remote) return [remote];
  return [local, remote];
}

async function fetchJson(url: string) {
  const response = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });
  let payload: { success?: boolean; message?: string; data?: unknown } | null = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }
  return { ok: response.ok, payload };
}

export async function GET(request: Request) {
  const { search } = new URL(request.url);

  for (const base of apiBases()) {
    try {
      const result = await fetchJson(`${base}/blog${search}`);
      if (result.ok && result.payload?.success && result.payload.data) {
        return NextResponse.json({
          success: true,
          message: result.payload.message || "Posts retrieved",
          data: result.payload.data,
        });
      }
    } catch {
      continue;
    }
  }

  return NextResponse.json({
    success: true,
    message: "No posts available",
    data: { posts: [], total: 0, page: 1, limit: 9, totalPages: 0 },
  });
}
