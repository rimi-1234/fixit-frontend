import { NextResponse } from "next/server";

type ReviewItem = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  customer: {
    id: string;
    email: string;
    name: string | null;
  };
};

const FETCH_TIMEOUT_MS = 2500;

function apiBase() {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) {
    throw new Error("NEXT_PUBLIC_API_URL is not set");
  }
  return base.replace(/\/$/, "");
}

async function fetchJson(url: string) {
  const response = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  let payload: { success?: boolean; data?: unknown } | null = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }
  return { ok: response.ok, payload };
}

function normalizeReview(raw: {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  customer?: { id?: string; email?: string; name?: string | null };
}): ReviewItem {
  return {
    id: raw.id,
    rating: raw.rating,
    comment: raw.comment ?? null,
    createdAt: raw.createdAt,
    customer: {
      id: raw.customer?.id ?? "",
      email: raw.customer?.email ?? "Customer",
      name: raw.customer?.name ?? null,
    },
  };
}

async function aggregateFromTechnicians(
  base: string,
  technicians: Array<{ id: string; reviewCount?: number; averageRating?: number }>,
  limit: number
): Promise<ReviewItem[]> {
  const topTechnicians = technicians
    .filter((t) => (t.reviewCount ?? 0) > 0)
    .sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0))
    .slice(0, 3);

  const details = await Promise.all(
    topTechnicians.map(async (tech) => {
      try {
        const { ok, payload } = await fetchJson(`${base}/technicians/${tech.id}`);
        return ok && payload?.success ? payload.data : null;
      } catch {
        return null;
      }
    })
  );

  const aggregated: ReviewItem[] = [];
  for (const detail of details) {
    const reviews = (detail as { reviews?: unknown } | null)?.reviews;
    if (!Array.isArray(reviews)) continue;
    for (const review of reviews) {
      aggregated.push(normalizeReview(review as Parameters<typeof normalizeReview>[0]));
    }
  }

  aggregated.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return aggregated.slice(0, limit);
}

/**
 * Public reviews BFF:
 * 1) Prefer backend GET /reviews when deployed
 * 2) Fall back to aggregating reviews from public technician profiles
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limit = Math.min(24, Math.max(1, Number(url.searchParams.get("limit")) || 6));
    const base = apiBase();

    const [reviewsResult, techniciansResult] = await Promise.allSettled([
      fetchJson(`${base}/reviews?limit=${limit}`),
      fetchJson(`${base}/technicians`),
    ]);

    if (reviewsResult.status === "fulfilled") {
      const { ok, payload } = reviewsResult.value;
      if (ok && payload?.success && Array.isArray(payload.data)) {
        return NextResponse.json({
          success: true,
          message: "Reviews retrieved",
          data: payload.data.map((r: ReviewItem) => normalizeReview(r)),
        });
      }
    }

    const technicians =
      techniciansResult.status === "fulfilled" &&
      techniciansResult.value.ok &&
      techniciansResult.value.payload?.success &&
      Array.isArray(techniciansResult.value.payload.data)
        ? (techniciansResult.value.payload.data as Array<{
            id: string;
            reviewCount?: number;
            averageRating?: number;
          }>)
        : [];

    const aggregated = await aggregateFromTechnicians(base, technicians, limit);

    return NextResponse.json({
      success: true,
      message: "Reviews retrieved",
      data: aggregated,
    });
  } catch {
    return NextResponse.json({
      success: true,
      message: "No reviews available",
      data: [],
    });
  }
}
