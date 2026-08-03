import { optimizeImageFile, type OptimizeImageOptions } from "@/lib/optimize-image";

export type UploadImageResult = {
  url: string;
  bytes: number;
  optimizedBytes: number;
};

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read optimized image"));
    reader.readAsDataURL(blob);
  });
}

function isLocalHost() {
  if (typeof window === "undefined") return true;
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1";
}

export async function uploadOptimizedImage(
  file: File,
  options: OptimizeImageOptions = {}
): Promise<UploadImageResult> {
  const originalBytes = file.size;
  const { blob, fileName, mimeType } = await optimizeImageFile(file, options);

  const form = new FormData();
  form.append("file", blob, fileName);
  form.append("mimeType", mimeType);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: form,
  });

  const data = (await response.json().catch(() => null)) as
    | { url?: string; error?: string; storage?: string }
    | null;

  if (!response.ok || !data?.url) {
    throw new Error(data?.error || "Upload failed. Try a smaller image.");
  }

  let url = data.url;

  // Guard: /uploads/* paths break on Vercel because runtime files are not served.
  if (url.startsWith("/uploads/") && !isLocalHost()) {
    url = await blobToDataUrl(blob);
  }

  return {
    url,
    bytes: originalBytes,
    optimizedBytes: blob.size,
  };
}
