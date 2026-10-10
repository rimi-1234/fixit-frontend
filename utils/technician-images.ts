import { avatarFromString } from "@/utils/get-initials";
import { isEphemeralUploadPath } from "@/utils/service-images";

/** Built-in portrait options for technician profiles. */
export const TECHNICIAN_AVATAR_PRESETS = [
  { id: "avatar-1", label: "Portrait 1", url: "/avatars/avatar-1.png" },
  { id: "avatar-2", label: "Portrait 2", url: "/avatars/avatar-2.png" },
  { id: "avatar-3", label: "Portrait 3", url: "/avatars/avatar-3.png" },
  { id: "avatar-4", label: "Portrait 4", url: "/avatars/avatar-4.png" },
  { id: "avatar-5", label: "Portrait 5", url: "/avatars/avatar-5.png" },
  { id: "avatar-6", label: "Portrait 6", url: "/avatars/avatar-6.png" },
] as const;

export function normalizeAvatarPath(url: string) {
  // Normalise both old .svg paths and new .png paths to always serve the .png
  return url.replace(/\/avatars\/avatar-(\d+)\.(svg|png)$/i, "/avatars/avatar-$1.png");
}

/**
 * Pick a deterministic avatar PNG from the preset pool based on a string seed.
 * This ensures every technician without a custom photo gets a consistent real face.
 */
function deterministicAvatar(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const index = (hash % TECHNICIAN_AVATAR_PRESETS.length) + 1;
  return `/avatars/avatar-${index}.png`;
}

export function technicianImageUrl(input: {
  id?: string | null;
  email?: string | null;
  technicianProfile?: { imageUrl?: string | null } | null;
}) {
  const custom = input.technicianProfile?.imageUrl?.trim();
  if (custom && !isEphemeralUploadPath(custom)) return normalizeAvatarPath(custom);
  // Fall back to a real portrait photo instead of a letter avatar
  return deterministicAvatar(input.id || input.email || "technician");
}
