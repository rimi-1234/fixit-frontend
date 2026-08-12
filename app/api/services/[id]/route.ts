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
  if (process.env.NODE_ENV !== "development" || local === remote) {
    return [remote];
  }
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
  return { ok: response.ok, status: response.status, payload };
}

function isMissingRoute(status: number, payload: { message?: string } | null) {
  if (status === 405) return true;
  const message = payload?.message?.toLowerCase() ?? "";
  return message.includes("api not found") || message.includes("cannot get");
}

async function assembleFromList(base: string, id: string) {
  const listRes = await fetchJson(`${base}/services`);
  const list = Array.isArray(listRes.payload?.data) ? listRes.payload.data : [];
  const service = list.find((item: { id?: string }) => item.id === id) as
    | {
        id: string;
        technicianId: string;
        categoryId: string;
        technician?: { id?: string };
      }
    | undefined;
  if (!service) return null;

  const technicianId = service.technician?.id || service.technicianId;
  let reviews: unknown[] = [];
  let averageRating = service.technician && "averageRating" in service.technician
    ? (service.technician as { averageRating?: number }).averageRating ?? 0
    : 0;
  let reviewCount = 0;
  let technician = service.technician ?? null;

  if (technicianId) {
    try {
      const techRes = await fetchJson(`${base}/technicians/${technicianId}`);
      if (techRes.ok && techRes.payload?.success && techRes.payload.data) {
        const detail = techRes.payload.data as {
          reviews?: unknown[];
          averageRating?: number;
          reviewCount?: number;
          email?: string;
          name?: string | null;
          technicianProfile?: unknown;
          id?: string;
        };
        reviews = Array.isArray(detail.reviews) ? detail.reviews : [];
        averageRating = detail.averageRating ?? averageRating;
        reviewCount = detail.reviewCount ?? reviews.length;
        technician = {
          ...((typeof technician === "object" && technician) || {}),
          id: detail.id ?? technicianId,
          email: detail.email,
          name: detail.name,
          technicianProfile: detail.technicianProfile,
          averageRating,
          reviewCount,
          reviews,
        };
      }
    } catch {
      /* keep list data */
    }
  }

  const related = list
    .filter(
      (item: { id?: string; technicianId?: string; categoryId?: string }) =>
        item.id !== id &&
        (item.technicianId === service.technicianId || item.categoryId === service.categoryId)
    )
    .slice(0, 4);

  return {
    ...service,
    technician,
    related,
  };
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json(
      { success: false, message: "Service id is required", errorDetails: {} },
      { status: 400 }
    );
  }

  let lastMessage = "Service not found";

  for (const base of apiBases()) {
    try {
      const direct = await fetchJson(`${base}/services/${id}`);
      if (direct.ok && direct.payload?.success && direct.payload.data) {
        return NextResponse.json({
          success: true,
          message: "Service retrieved successfully",
          data: direct.payload.data,
        });
      }

      if (!isMissingRoute(direct.status, direct.payload)) {
        lastMessage = direct.payload?.message || lastMessage;
      }

      const assembled = await assembleFromList(base, id);
      if (assembled) {
        return NextResponse.json({
          success: true,
          message: "Service retrieved successfully",
          data: assembled,
        });
      }
    } catch {
      continue;
    }
  }

  return NextResponse.json(
    { success: false, message: lastMessage, errorDetails: {} },
    { status: 404 }
  );
}
