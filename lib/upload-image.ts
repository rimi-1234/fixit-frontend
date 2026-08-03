import { optimizeImageFile, type OptimizeImageOptions } from "@/lib/optimize-image";

export type UploadImageResult = {
  url: string;
  bytes: number;
  optimizedBytes: number;
};

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
    | { url?: string; error?: string }
    | null;

  if (!response.ok || !data?.url) {
    throw new Error(data?.error || "Upload failed. Try a smaller image.");
  }

  return {
    url: data.url,
    bytes: originalBytes,
    optimizedBytes: blob.size,
  };
}
