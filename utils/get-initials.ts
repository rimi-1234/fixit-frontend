export function getInitials(value: string, max = 2): string {
  const parts = value
    .replace(/@.*/, "")
    .split(/[\s._-]+/)
    .filter(Boolean);

  if (parts.length === 0) return "?";
  return parts
    .slice(0, max)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Deterministic soft background from a string id/email. */
export function colorFromString(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `oklch(0.92 0.04 ${hue})`;
}

const AVATAR_COUNT = 6;

/** Deterministic illustrated avatar (public/avatars) for a string id/email. */
export function avatarFromString(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = (Math.abs(hash) % AVATAR_COUNT) + 1;
  return `/avatars/avatar-${index}.png`;
}
