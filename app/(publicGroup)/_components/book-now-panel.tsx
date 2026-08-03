"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import {
  ArrowLeft,
  Check,
  Loader2,
} from "lucide-react";
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

type Step = 1 | 2 | 3;

const STEPS = [
  { id: 1 as const, label: "Select Service" },
  { id: 2 as const, label: "Choose Time" },
  { id: 3 as const, label: "Confirm" },
];

function BookingStepper({ step }: { step: Step }) {
  return (
    <ol className="flex items-center gap-0">
      {STEPS.map((item, index) => {
        const done = step > item.id;
        const active = step === item.id;
        return (
          <li key={item.id} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "inline-flex size-8 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                  done && "bg-success text-success-foreground",
                  active && "bg-primary text-primary-foreground",
                  !done && !active && "bg-muted text-muted-foreground"
                )}
              >
                {done ? <Check aria-hidden="true" className="size-4" /> : item.id}
              </span>
              <span
                className={cn(
                  "hidden text-[11px] font-medium sm:block",
                  active ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
            </div>
            {index < STEPS.length - 1 ? (
              <span
                aria-hidden="true"
                className={cn(
                  "mx-2 h-px flex-1 sm:mx-3",
                  step > item.id ? "bg-success/50" : "bg-border"
                )}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

function formatScheduleLabel(iso: string) {
  const date = parseISO(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return format(date, "EEEE, MMM d 'at' h:mm a");
}

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

  const [step, setStep] = useState<Step>(1);
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [date, setDate] = useState(todayInputValue());
  const [slotIso, setSlotIso] = useState("");

  const slots = useMemo(
    () => getTimeSlotsForDate(date, availability),
    [date, availability]
  );

  const selectedService = services.find((s) => s.id === serviceId);
  const weekday = weekdayNameFromIsoDate(date);
  const selectedSlot = slots.find((s) => s.iso === slotIso);

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
      setStep(1);
      router.push("/dashboard/customer");
    } catch {
      // toast handled in mutation
    }
  }

  function goNextFromService() {
    if (!serviceId) {
      toast.error("Select a service to continue");
      return;
    }
    setStep(2);
  }

  function goNextFromTime() {
    if (!slotIso) {
      toast.error("Choose a time slot to continue");
      return;
    }
    setStep(3);
  }

  if (services.length === 0) {
    return (
      <div className="space-y-2">
        <h2 className="text-lg font-semibold tracking-tight">
          Book this technician
        </h2>
        <p className="text-sm text-muted-foreground">
          This technician has not published any services yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">
          Book this technician
        </h2>
        <BookingStepper step={step} />
      </div>

      {step === 1 ? (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="book-service">Service</Label>
            <div className="space-y-2">
              {services.map((service) => {
                const selected = service.id === serviceId;
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => setServiceId(service.id)}
                    className={cn(
                      "w-full rounded-2xl border px-4 py-3 text-left transition-colors",
                      selected
                        ? "border-primary bg-accent/60"
                        : "border-border/70 bg-background hover:border-primary/40"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-0.5">
                        <p className="font-medium tracking-tight">{service.name}</p>
                        <p className="line-clamp-2 text-xs text-muted-foreground">
                          {service.description}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-semibold text-primary">
                        {formatCurrency(service.price)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <Button className="w-full rounded-full" size="lg" onClick={goNextFromService}>
            Continue
          </Button>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-4">
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
                "h-10 w-full rounded-xl border border-input bg-transparent px-3 text-sm outline-none",
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
                          : "bg-muted text-muted-foreground hover:bg-accent hover:text-primary"
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
                No structured availability yet. Pick any date and continue once a slot is set.
              </p>
            )}
          </div>

          {(parsed.length > 0 || unparsed.length > 0) && (
            <div className="space-y-1.5 rounded-2xl bg-muted/50 px-3 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Weekly availability
              </p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                {parsed.map((slot) => (
                  <li key={slot.raw}>{slot.raw}</li>
                ))}
                {unparsed.map((raw) => (
                  <li key={raw}>{raw}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setStep(1)}
            >
              <ArrowLeft aria-hidden="true" />
              Back
            </Button>
            <Button
              className="flex-1 rounded-full"
              size="lg"
              onClick={goNextFromTime}
              disabled={slots.length > 0 && !slotIso}
            >
              Continue
            </Button>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:p-5">
            <h3 className="mb-3 text-base font-semibold tracking-tight">
              Booking summary
            </h3>
            <dl className="space-y-3 rounded-xl bg-muted/50 px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <dt className="text-sm text-muted-foreground">Service</dt>
                <dd className="text-right text-sm font-medium">
                  {selectedService?.name ?? "—"}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-sm text-muted-foreground">Price</dt>
                <dd className="text-right text-sm font-semibold text-primary">
                  {selectedService
                    ? formatCurrency(selectedService.price)
                    : "—"}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-sm text-muted-foreground">Scheduled time</dt>
                <dd className="text-right text-sm font-medium">
                  {slotIso
                    ? formatScheduleLabel(slotIso)
                    : selectedSlot?.label ?? "—"}
                </dd>
              </div>
            </dl>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setStep(2)}
            >
              <ArrowLeft aria-hidden="true" />
              Back
            </Button>
            <Button
              className="flex-1 rounded-full"
              size="lg"
              disabled={createBooking.isPending}
              onClick={handleBook}
            >
              {createBooking.isPending ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden="true" />
                  Confirming…
                </>
              ) : !isAuthenticated ? (
                "Sign in to confirm"
              ) : (
                "Confirm Booking"
              )}
            </Button>
          </div>

          {!isAuthenticated ? (
            <p className="text-center text-xs text-muted-foreground">
              <Link
                href="/register"
                className="text-primary underline-offset-4 hover:underline"
              >
                Create a customer account
              </Link>{" "}
              to book this technician.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
