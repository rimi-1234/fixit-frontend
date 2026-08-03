/** Whether next/image should skip the optimizer for this src. */
export function shouldUnoptimizeImage(src: string) {
  if (!src) return true;
  if (src.startsWith("data:")) return true;
  if (src.startsWith("/")) return false;
  try {
    const { hostname } = new URL(src);
    return hostname !== "images.unsplash.com";
  } catch {
    return true;
  }
}

export function isValidImageRef(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (trimmed.startsWith("/")) return true;
  if (trimmed.startsWith("data:image/")) return true;
  return /^https?:\/\//i.test(trimmed);
}
