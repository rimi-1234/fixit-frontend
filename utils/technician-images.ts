import { avatarFromString } from "@/utils/get-initials";
import { isEphemeralUploadPath } from "@/utils/service-images";

/** Built-in portrait options for technician profiles. */
export const TECHNICIAN_AVATAR_PRESETS = [
  { id: "avatar-1", label: "Portrait 1", url: "/avatars/avatar-1.svg" },
  { id: "avatar-2", label: "Portrait 2", url: "/avatars/avatar-2.svg" },
  { id: "avatar-3", label: "Portrait 3", url: "/avatars/avatar-3.svg" },
  { id: "avatar-4", label: "Portrait 4", url: "/avatars/avatar-4.svg" },
  { id: "avatar-5", label: "Portrait 5", url: "/avatars/avatar-5.svg" },
  { id: "avatar-6", label: "Portrait 6", url: "/avatars/avatar-6.svg" },
] as const;

export function normalizeAvatarPath(url: string) {
  return url.replace(/\/avatars\/avatar-(\d+)\.png$/i, "/avatars/avatar-$1.svg");
}

export function technicianImageUrl(input: {
  id?: string | null;
  email?: string | null;
  technicianProfile?: { imageUrl?: string | null } | null;
}) {
  const custom = input.technicianProfile?.imageUrl?.trim();
  if (custom && !isEphemeralUploadPath(custom)) return normalizeAvatarPath(custom);
  return avatarFromString(input.id || input.email || "technician");
}
