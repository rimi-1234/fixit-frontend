"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useCreateBooking } from "@/hooks/use-bookings";
import type { TechnicianDetail } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/format-currency";
import {
  getTimeSlotsForDate,
  parseAvailabilityList,
  weekdayNameFromIsoDate,
} from "@/utils/parse-availability";
import { todayInputValue } from "@/utils/format-date";

export function BookNowPanel({ technician }: { technician: TechnicianDetail }) {
  const router = useRouter();
  const { isAuthenticated, role } = useAuth();
  const createBooking = useCreateBooking();

  const services = technician.services ?? [];
  const availability = useMemo(
    () => technician.technicianProfile?.availability ?? [],
    [technician.technicianProfile?.availability]
  );
  const { parsed, unparsed } = useMemo(
    () => parseAvailabilityList(availability),
    [availability]
  );

  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [date, setDate] = useState(todayInputValue());
  const [slotIso, setSlotIso] = useState<string>("");

  const slots = useMemo(
    () => getTimeSlotsForDate(date, availability),
    [date, availability]
  );

  const selectedService = services.find((s) => s.id === serviceId);
  const weekday = weekdayNameFromIsoDate(date);

  async function handleBook() {
    if (!isAuthenticated) {
      router.push(`/login?next=/technicians/${technician.id}`);
      return;
    }
    if (role !== "CUSTOMER") {
      toast.error("Only customer accounts can request bookings");
      return;
    }
    if (!serviceId || !slotIso) {
      toast.error("Choose a service and time slot");
      return;
    }

    try {
      await createBooking.mutateAsync({
        technicianId: technician.id,
        serviceId,
        scheduledTime: slotIso,
      });
      setSlotIso("");
      router.push("/dashboard/customer");
    } catch {
      // toast handled in mutation
    }
  }

  if (services.length === 0) {
    return (
      <div className="space-y-2">
        <h2 className="text-lg font-semibold tracking-tight">Book now</h2>
        <p className="text-sm text-muted-foreground">
          This technician has not published any services yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">Book now</h2>
        <p className="text-sm text-muted-foreground">
          Pick a service and an open time. Payment happens after the technician accepts.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="book-service">Service</Label>
        <select
          id="book-service"
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
          className={cn(
            "h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          )}
        >
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name} · {formatCurrency(service.price)}
            </option>
          ))}
        </select>
        {selectedService ? (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {selectedService.description}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="book-date">Date</Label>
        <input
          id="book-date"
          type="date"
          min={todayInputValue()}
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setSlotIso("");
          }}
          className={cn(
            "h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          )}
        />
      </div>

      <div className="space-y-2">
        <Label>Time slot {weekday ? `· ${weekday}` : ""}</Label>
        {slots.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {slots.map((slot) => {
              const selected = slotIso === slot.iso;
              return (
                <button
                  key={slot.iso}
                  type="button"
                  onClick={() => setSlotIso(slot.iso)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                    selected
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  {slot.label}
                </button>
              );
            })}
          </div>
        ) : parsed.length > 0 ? (
          <p className="text-sm text-muted-foreground">
            No open slots on this day. Try another date that matches their schedule.
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            No structured availability yet. You can still message timing in a booking request once slots are set.
          </p>
        )}
      </div>

      {(parsed.length > 0 || unparsed.length > 0) && (
        <div className="space-y-1.5 border-t border-border/60 pt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Weekly availability
          </p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {parsed.map((slot) => (
              <li key={slot.raw}>{slot.raw}</li>
            ))}
            {unparsed.map((raw) => (
              <li key={raw}>{raw}</li>
            ))}
          </ul>
        </div>
      )}

      <Button
        className="w-full"
        size="lg"
        disabled={createBooking.isPending || (slots.length > 0 && !slotIso)}
        onClick={handleBook}
      >
        {createBooking.isPending ? (
          <>
            <Loader2 className="animate-spin" aria-hidden="true" />
            Requesting…
          </>
        ) : !isAuthenticated ? (
          "Sign in to book"
        ) : (
          "Request booking"
        )}
      </Button>

      {!isAuthenticated ? (
        <p className="text-center text-xs text-muted-foreground">
          <Link href="/register" className="underline-offset-4 hover:underline">
            Create a customer account
          </Link>{" "}
          to book this technician.
        </p>
      ) : null}
    </div>
  );
}
