import { optimizeImageFile, type OptimizeImageOptions } from "@/lib/optimize-image";

export type UploadImageResult = {
  url: string;
  bytes: number;
  optimizedBytes: number;
};

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      if (!result.startsWith("data:image/")) {
        reject(new Error("Could not convert image. Try JPG or PNG."));
        return;
      }
      resolve(result);
    };
    reader.onerror = () => reject(new Error("Could not read optimized image"));
    reader.readAsDataURL(blob);
  });
}

/**
 * Compress in the browser and return a data URL.
 * No server/disk step — works the same locally and on Vercel.
 */
export async function uploadOptimizedImage(
  file: File,
  options: OptimizeImageOptions = {}
): Promise<UploadImageResult> {
  if (!file) {
    throw new Error("No image selected");
  }

  const originalBytes = file.size;
  const { blob, mimeType } = await optimizeImageFile(file, {
    mimeType: "image/jpeg",
    ...options,
  });

  const url = await blobToDataUrl(blob);

  // Match backend max (~1.5MB string) with a little headroom
  if (url.length > 1_400_000) {
    throw new Error("Image is still too large after compression. Try a smaller photo.");
  }

  return {
    url,
    bytes: originalBytes,
    optimizedBytes: blob.size || Math.round((url.length * 3) / 4),
  };
}
