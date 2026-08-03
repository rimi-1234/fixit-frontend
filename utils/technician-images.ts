import { avatarFromString } from "@/utils/get-initials";

/** Built-in portrait options for technician profiles. */
export const TECHNICIAN_AVATAR_PRESETS = [
  { id: "avatar-1", label: "Portrait 1", url: "/avatars/avatar-1.png" },
  { id: "avatar-2", label: "Portrait 2", url: "/avatars/avatar-2.png" },
  { id: "avatar-3", label: "Portrait 3", url: "/avatars/avatar-3.png" },
  { id: "avatar-4", label: "Portrait 4", url: "/avatars/avatar-4.png" },
  { id: "avatar-5", label: "Portrait 5", url: "/avatars/avatar-5.png" },
  { id: "avatar-6", label: "Portrait 6", url: "/avatars/avatar-6.png" },
] as const;

export function technicianImageUrl(input: {
  id?: string | null;
  email?: string | null;
  technicianProfile?: { imageUrl?: string | null } | null;
}) {
  const custom = input.technicianProfile?.imageUrl?.trim();
  if (custom) return custom;
  return avatarFromString(input.id || input.email || "technician");
}
