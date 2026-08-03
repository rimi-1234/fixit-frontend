export type OptimizeImageOptions = {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  /** Prefer WebP when the browser supports it. */
  mimeType?: "image/webp" | "image/jpeg";
};

const DEFAULTS: Required<OptimizeImageOptions> = {
  maxWidth: 1280,
  maxHeight: 1280,
  quality: 0.82,
  mimeType: "image/webp",
};

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
      reject(new Error("Could not read that image"));
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

function pickMime(preferred: "image/webp" | "image/jpeg"): "image/webp" | "image/jpeg" {
  if (preferred === "image/jpeg") return "image/jpeg";
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL("image/webp").startsWith("data:image/webp")
      ? "image/webp"
      : "image/jpeg";
  } catch {
    return "image/jpeg";
  }
}

/** Resize + compress a user-selected image in the browser before upload. */
export async function optimizeImageFile(
  file: File,
  options: OptimizeImageOptions = {}
): Promise<{ blob: Blob; fileName: string; mimeType: string }> {
  const maxWidth = options.maxWidth ?? DEFAULTS.maxWidth;
  const maxHeight = options.maxHeight ?? DEFAULTS.maxHeight;
  const quality = options.quality ?? DEFAULTS.quality;
  const mimeType = pickMime(options.mimeType ?? DEFAULTS.mimeType);

  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file (JPG, PNG, or WebP)");
  }

  // Skip tiny files that are already small enough
  if (file.size < 80_000 && file.type === mimeType) {
    return { blob: file, fileName: file.name, mimeType: file.type };
  }

  const img = await loadImage(file);
  const scale = Math.min(1, maxWidth / img.width, maxHeight / img.height);
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Image compression is not supported in this browser");

  ctx.drawImage(img, 0, 0, width, height);

  let blob = await canvasToBlob(canvas, mimeType, quality);

  // If still large, step quality down once
  if (blob.size > 450_000 && quality > 0.6) {
    blob = await canvasToBlob(canvas, mimeType, Math.max(0.55, quality - 0.2));
  }

  const ext = mimeType === "image/webp" ? "webp" : "jpg";
  const base = file.name.replace(/\.[^.]+$/, "") || "image";
  const safeBase = base.replace(/[^a-zA-Z0-9-_]+/g, "-").slice(0, 40) || "image";

  return {
    blob,
    fileName: `${safeBase}.${ext}`,
    mimeType,
  };
}
