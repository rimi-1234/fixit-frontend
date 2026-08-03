/** Friendly display name from an email when the API has no name field. */
const KNOWN_NAMES: Record<string, string> = {
  "technician@fixitnow.com": "Karim Hossain",
  "customer@fixitnow.com": "Nadia Rahman",
  "admin@fixitnow.com": "Admin",
};

export function displayNameFromEmail(email?: string | null): string {
  if (!email) return "Member";

  const known = KNOWN_NAMES[email.toLowerCase()];
  if (known) return known;

  const local = email.split("@")[0] ?? email;
  const words = local
    .replace(/[0-9]+/g, " ")
    .split(/[._\-+]+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (words.length === 0) return "Member";

  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
