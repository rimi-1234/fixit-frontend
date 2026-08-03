import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_BYTES = 1_200_000; // ~1.2MB after client optimization
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

/**
 * Always return an inline data URL.
 * Disk paths like /uploads/... only exist on the machine that uploaded them,
 * so they break after Vercel deploy (and when local UI talks to a remote API).
 */
export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    const mime = (file.type || String(form.get("mimeType") || "")).toLowerCase();
    if (!ALLOWED.has(mime)) {
      return NextResponse.json(
        { error: "Only JPG, PNG, WebP, or GIF images are allowed" },
        { status: 400 }
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Image is still too large after optimization. Try another photo." },
        { status: 400 }
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const url = `data:${mime};base64,${bytes.toString("base64")}`;

    return NextResponse.json({
      url,
      bytes: bytes.length,
      storage: "inline",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected upload error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
