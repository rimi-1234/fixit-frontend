export type OptimizeImageOptions = {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  /** Prefer JPEG for widest browser support. */
  mimeType?: "image/webp" | "image/jpeg";
};

const DEFAULTS: Required<OptimizeImageOptions> = {
  maxWidth: 1280,
  maxHeight: 1280,
  quality: 0.78,
  mimeType: "image/jpeg",
};

const EXT_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  bmp: "image/bmp",
};

/** Some Windows pickers leave file.type empty — infer from the extension. */
export function resolveImageMime(file: File): string {
  if (file.type && file.type.startsWith("image/")) return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return EXT_MIME[ext] || "";
}

function loadImage(file: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that image. Try JPG or PNG."));
    };
    img.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Image compression failed"));
          return;
        }
        resolve(blob);
      },
      type,
      quality
    );
  });
}

function supportsWebp(): boolean {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL("image/webp").startsWith("data:image/webp");
  } catch {
    return false;
  }
}

function pickMime(preferred: "image/webp" | "image/jpeg"): "image/webp" | "image/jpeg" {
  if (preferred === "image/webp" && supportsWebp()) return "image/webp";
  return "image/jpeg";
}

/** Resize + compress a user-selected image in the browser before save. */
export async function optimizeImageFile(
  file: File,
  options: OptimizeImageOptions = {}
): Promise<{ blob: Blob; fileName: string; mimeType: string }> {
  const maxWidth = options.maxWidth ?? DEFAULTS.maxWidth;
  const maxHeight = options.maxHeight ?? DEFAULTS.maxHeight;
  const quality = options.quality ?? DEFAULTS.quality;
  const mimeType = pickMime(options.mimeType ?? DEFAULTS.mimeType);
  const sourceMime = resolveImageMime(file);

  if (!sourceMime.startsWith("image/")) {
    throw new Error("Please choose an image file (JPG, PNG, or WebP)");
  }

  const img = await loadImage(file);
  if (!img.width || !img.height) {
    throw new Error("Could not read that image. Try JPG or PNG.");
  }

  const scale = Math.min(1, maxWidth / img.width, maxHeight / img.height);
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Image compression is not supported in this browser");

  // White background so transparent PNGs look fine as JPEG
  if (mimeType === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }
  ctx.drawImage(img, 0, 0, width, height);

  let outputType: "image/webp" | "image/jpeg" = mimeType;
  let blob: Blob;
  try {
    blob = await canvasToBlob(canvas, outputType, quality);
  } catch {
    outputType = "image/jpeg";
    blob = await canvasToBlob(canvas, outputType, quality);
  }

  // Keep under API body limits after base64 expansion (~1.33x)
  let q = quality;
  while (blob.size > 700_000 && q > 0.45) {
    q = Math.max(0.45, q - 0.12);
    blob = await canvasToBlob(canvas, outputType, q);
  }

  if (blob.size > 900_000) {
    throw new Error("Image is still too large. Try a smaller photo.");
  }

  const ext = outputType === "image/webp" ? "webp" : "jpg";
  const base = file.name.replace(/\.[^.]+$/, "") || "image";
  const safeBase = base.replace(/[^a-zA-Z0-9-_]+/g, "-").slice(0, 40) || "image";

  return {
    blob: new Blob([blob], { type: outputType }),
    fileName: `${safeBase}.${ext}`,
    mimeType: outputType,
  };
}
