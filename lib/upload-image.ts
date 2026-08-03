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

/**
 * Optimize in the browser, then persist as a data URL.
 * This works the same locally and on Vercel (no /uploads disk dependency).
 */
export async function uploadOptimizedImage(
  file: File,
  options: OptimizeImageOptions = {}
): Promise<UploadImageResult> {
  const originalBytes = file.size;
  const { blob, fileName, mimeType } = await optimizeImageFile(file, options);

  // Prefer client-side data URL so deploy never depends on local disk paths.
  try {
    const form = new FormData();
    form.append("file", blob, fileName);
    form.append("mimeType", mimeType);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: form,
    });

    const data = (await response.json().catch(() => null)) as
      | { url?: string; error?: string }
      | null;

    if (response.ok && data?.url?.startsWith("data:image/")) {
      return {
        url: data.url,
        bytes: originalBytes,
        optimizedBytes: blob.size,
      };
    }
  } catch {
    // fall through to local data URL
  }

  const url = await blobToDataUrl(blob);
  return {
    url,
    bytes: originalBytes,
    optimizedBytes: blob.size,
  };
}
