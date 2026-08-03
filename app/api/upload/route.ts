import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_BYTES = 1_200_000; // ~1.2MB after client optimization
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function extFor(mime: string) {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "jpg";
}

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
    const name = `${randomUUID()}.${extFor(mime)}`;

    // Prefer a public URL when the filesystem is writable (local / persistent disk).
    try {
      const dir = path.join(process.cwd(), "public", "uploads");
      await mkdir(dir, { recursive: true });
      await writeFile(path.join(dir, name), bytes);
      return NextResponse.json({
        url: `/uploads/${name}`,
        bytes: bytes.length,
        storage: "disk",
      });
    } catch {
      // Serverless / read-only FS: store as a compact data URL on the record.
      const url = `data:${mime};base64,${bytes.toString("base64")}`;
      return NextResponse.json({
        url,
        bytes: bytes.length,
        storage: "inline",
      });
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected upload error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
