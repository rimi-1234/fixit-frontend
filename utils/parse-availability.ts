const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export type Weekday = (typeof WEEKDAYS)[number];

export interface ParsedAvailabilitySlot {
  raw: string;
  weekday: Weekday;
  startMinutes: number;
  endMinutes: number;
}

const SLOT_RE =
  /^(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)\s+(\d{1,2})(?::(\d{2}))?\s*(AM|PM)\s*-\s*(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i;

function toMinutes(hour: number, minute: number, meridiem: string): number {
  let h = hour % 12;
  if (meridiem.toUpperCase() === "PM") h += 12;
  return h * 60 + minute;
}

function formatMinutes(total: number): string {
  const h24 = Math.floor(total / 60);
  const m = total % 60;
  const meridiem = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${meridiem}`;
}

export function parseAvailabilitySlot(raw: string): ParsedAvailabilitySlot | null {
  const match = raw.trim().match(SLOT_RE);
  if (!match) return null;

  const weekday = (match[1][0].toUpperCase() + match[1].slice(1).toLowerCase()) as Weekday;
  const startMinutes = toMinutes(
    Number(match[2]),
    Number(match[3] ?? "0"),
    match[4]
  );
  const endMinutes = toMinutes(
    Number(match[5]),
    Number(match[6] ?? "0"),
    match[7]
  );

  if (endMinutes <= startMinutes) return null;

  return { raw, weekday, startMinutes, endMinutes };
}

export function parseAvailabilityList(availability: string[] | undefined | null) {
  const parsed: ParsedAvailabilitySlot[] = [];
  const unparsed: string[] = [];

  for (const raw of availability ?? []) {
    const slot = parseAvailabilitySlot(raw);
    if (slot) parsed.push(slot);
    else if (raw.trim()) unparsed.push(raw.trim());
  }

  return { parsed, unparsed };
}

/** Hourly time labels for a given calendar date, based on availability strings. */
export function getTimeSlotsForDate(
  dateIso: string,
  availability: string[] | undefined | null,
  stepMinutes = 60
): { label: string; minutes: number; iso: string }[] {
  if (!dateIso) return [];

  const date = new Date(`${dateIso}T12:00:00`);
  if (Number.isNaN(date.getTime())) return [];

  const weekday = WEEKDAYS[date.getDay()];
  const { parsed } = parseAvailabilityList(availability);
  const daySlots = parsed.filter((slot) => slot.weekday === weekday);

  if (daySlots.length === 0) return [];

  const labels: { label: string; minutes: number; iso: string }[] = [];

  for (const slot of daySlots) {
    for (
      let minutes = slot.startMinutes;
      minutes < slot.endMinutes;
      minutes += stepMinutes
    ) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      const iso = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        hours,
        mins,
        0,
        0
      ).toISOString();

      labels.push({
        label: formatMinutes(minutes),
        minutes,
        iso,
      });
    }
  }

  return labels.sort((a, b) => a.minutes - b.minutes);
}

export function weekdayNameFromIsoDate(dateIso: string): string {
  const date = new Date(`${dateIso}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  return WEEKDAYS[date.getDay()];
}
