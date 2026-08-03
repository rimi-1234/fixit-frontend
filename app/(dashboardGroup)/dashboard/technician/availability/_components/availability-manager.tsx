"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import {
  useTechnician,
  useUpdateAvailability,
} from "@/hooks/use-technicians";
import {
  WEEKDAYS,
  formatAvailabilitySlot,
  parseAvailabilityList,
  type Weekday,
} from "@/utils/parse-availability";

type DraftSlot = {
  id: string;
  raw: string;
  weekday?: Weekday;
  startMinutes?: number;
  endMinutes?: number;
  unstructured?: boolean;
};

function timeOptions(stepMinutes = 30) {
  const options: { label: string; minutes: number }[] = [];
  for (let minutes = 6 * 60; minutes <= 22 * 60; minutes += stepMinutes) {
    const h24 = Math.floor(minutes / 60);
    const m = minutes % 60;
    const meridiem = h24 >= 12 ? "PM" : "AM";
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    const label =
      m === 0
        ? `${h12}:00 ${meridiem}`
        : `${h12}:${m.toString().padStart(2, "0")} ${meridiem}`;
    options.push({ label, minutes });
  }
  return options;
}

const TIME_OPTIONS = timeOptions();

function slotsFromAvailability(availability: string[] | undefined | null): DraftSlot[] {
  const { parsed, unparsed } = parseAvailabilityList(availability);
  return [
    ...parsed.map((slot, index) => ({
      id: `parsed:${slot.raw}:${index}`,
      raw: slot.raw,
      weekday: slot.weekday,
      startMinutes: slot.startMinutes,
      endMinutes: slot.endMinutes,
    })),
    ...unparsed.map((raw, index) => ({
      id: `raw:${raw}:${index}`,
      raw,
      unstructured: true,
    })),
  ];
}

function weekdayOrder(day: Weekday) {
  return WEEKDAYS.indexOf(day);
}

function sortSlots(list: DraftSlot[]) {
  return [...list].sort((a, b) => {
    if (a.unstructured && !b.unstructured) return 1;
    if (!a.unstructured && b.unstructured) return -1;
    if (a.weekday && b.weekday) {
      const dayDiff = weekdayOrder(a.weekday) - weekdayOrder(b.weekday);
      if (dayDiff !== 0) return dayDiff;
    }
    return (a.startMinutes ?? 0) - (b.startMinutes ?? 0);
  });
}

export function AvailabilityManager() {
  const { user, isHydrated } = useAuth();
  const {
    data: technician,
    isLoading,
    isError,
    refetch,
  } = useTechnician(user?.id);
  const updateAvailability = useUpdateAvailability();

  const remoteAvailability = technician?.technicianProfile?.availability;
  const remoteKey = JSON.stringify(remoteAvailability ?? []);
  const remoteSlots = useMemo(
    () => slotsFromAvailability(remoteAvailability),
    // remoteKey captures content changes without depending on array identity
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [remoteKey]
  );

  const [draft, setDraft] = useState<DraftSlot[] | null>(null);
  const [day, setDay] = useState<Weekday>("Monday");
  const [startMinutes, setStartMinutes] = useState(9 * 60);
  const [endMinutes, setEndMinutes] = useState(17 * 60);

  const slots = draft ?? remoteSlots;
  const sortedSlots = useMemo(() => sortSlots(slots), [slots]);
  const isDirty =
    draft !== null && JSON.stringify(draft.map((s) => s.raw)) !== remoteKey;

  function withDraft(updater: (current: DraftSlot[]) => DraftSlot[]) {
    setDraft((prev) => updater(prev ?? remoteSlots));
  }

  function addSlot() {
    if (endMinutes <= startMinutes) {
      toast.error("End time must be after start time");
      return;
    }

    const raw = formatAvailabilitySlot(day, startMinutes, endMinutes);
    if (slots.some((slot) => slot.raw === raw)) {
      toast.error("That slot is already listed");
      return;
    }

    withDraft((current) => [
      ...current,
      {
        id: `local:${raw}:${Date.now()}`,
        raw,
        weekday: day,
        startMinutes,
        endMinutes,
      },
    ]);
  }

  function removeSlot(id: string) {
    withDraft((current) => current.filter((slot) => slot.id !== id));
  }

  async function handleSave() {
    try {
      const availability = slots.map((slot) => slot.raw);
      await updateAvailability.mutateAsync(availability);
      setDraft(null);
    } catch {
      // toast in mutation
    }
  }

  if (!isHydrated || (user?.id && isLoading && !technician)) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (!user?.id) {
    return (
      <EmptyState
        title="Session loading"
        description="Sign in again if this doesn't resolve."
        action={
          <Button nativeButton={false} render={<Link href="/login" />}>
            Sign in
          </Button>
        }
      />
    );
  }

  if (isError && !technician) {
    return (
      <EmptyState
        title="Couldn't load availability"
        description="Check that the API is running, then try again."
        action={
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        }
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Availability
        </h1>
        <p className="text-sm text-muted-foreground">
          Click a weekday below to select it, choose start/end times, then tap{" "}
          <span className="font-medium text-foreground">Add slot</span>. Days with
          blocks show in green. Book Now only offers times inside these windows.
        </p>
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {WEEKDAYS.map((weekday) => {
          const count = slots.filter((slot) => slot.weekday === weekday).length;
          const active = day === weekday;
          return (
            <button
              key={`chip-${weekday}`}
              type="button"
              onClick={() => setDay(weekday)}
              className={`rounded-xl px-1 py-2 text-center transition sm:px-2 ${
                active
                  ? "bg-primary text-primary-foreground"
                  : count > 0
                    ? "bg-success/15 text-success"
                    : "bg-muted/70 text-muted-foreground hover:text-foreground"
              }`}
              aria-pressed={active}
            >
              <span className="block text-[10px] font-semibold tracking-wide uppercase sm:text-xs">
                {weekday.slice(0, 3)}
              </span>
              <span className="mt-1 block text-[10px] sm:text-xs">
                {count > 0 ? `${count} slot${count === 1 ? "" : "s"}` : "—"}
              </span>
            </button>
          );
        })}
      </div>

      <section className="space-y-4 border-y border-border/60 py-6">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">Add a slot</h2>
          <p className="text-sm text-muted-foreground">
            Selected day: <span className="font-medium text-foreground">{day}</span>
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="avail-day">Day</Label>
            <select
              id="avail-day"
              value={day}
              onChange={(e) => setDay(e.target.value as Weekday)}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            >
              {WEEKDAYS.map((weekday) => (
                <option key={weekday} value={weekday}>
                  {weekday}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="avail-start">Start</Label>
            <select
              id="avail-start"
              value={startMinutes}
              onChange={(e) => setStartMinutes(Number(e.target.value))}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            >
              {TIME_OPTIONS.map((option) => (
                <option key={`start-${option.minutes}`} value={option.minutes}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="avail-end">End</Label>
            <select
              id="avail-end"
              value={endMinutes}
              onChange={(e) => setEndMinutes(Number(e.target.value))}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            >
              {TIME_OPTIONS.map((option) => (
                <option key={`end-${option.minutes}`} value={option.minutes}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button type="button" variant="outline" onClick={addSlot}>
          <Plus aria-hidden="true" />
          Add slot
        </Button>
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">Your slots</h2>
          <p className="text-sm text-muted-foreground">
            Remove anything outdated, then save to publish.
          </p>
        </div>

        {sortedSlots.length === 0 ? (
          <EmptyState
            title="No availability yet"
            description="Add at least one weekly slot so customers can pick a time."
          />
        ) : (
          <ul className="divide-y divide-border/60">
            {sortedSlots.map((slot) => (
              <li
                key={slot.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <p className="font-medium tracking-tight">{slot.raw}</p>
                  {slot.unstructured ? (
                    <p className="text-xs text-muted-foreground">
                      Custom format kept as-is
                    </p>
                  ) : null}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeSlot(slot.id)}
                  aria-label={`Remove ${slot.raw}`}
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={handleSave}
          disabled={updateAvailability.isPending || !isDirty}
        >
          {updateAvailability.isPending ? (
            <>
              <Loader2 className="animate-spin" aria-hidden="true" />
              Saving…
            </>
          ) : (
            "Save availability"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          nativeButton={false}
          render={<Link href="/dashboard/technician" />}
        >
          Back to overview
        </Button>
      </div>
    </div>
  );
}
