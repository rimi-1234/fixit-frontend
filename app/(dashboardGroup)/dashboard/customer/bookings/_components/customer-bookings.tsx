"use client";

import Link from "next/link";
import { useState } from "react";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Skeleton } from "@/components/ui/skeleton";
import { useCancelBooking, useMyBookings } from "@/hooks/use-bookings";
import type { Booking, BookingStatus } from "@/lib/types";
import { formatCurrency } from "@/utils/format-currency";
import { formatDateTime } from "@/utils/format-date";
import { displayNameFromEmail } from "@/utils/display-name";

const CANCELLABLE: BookingStatus[] = ["REQUESTED", "ACCEPTED", "PAID"];

function bookingAction(booking: Booking) {
  if (booking.status === "ACCEPTED") {
    return { href: `/dashboard/customer/bookings/${booking.id}/pay`, label: "Pay now" };
  }
  if (booking.status === "COMPLETED" && !booking.review) {
    return {
      href: `/dashboard/customer/bookings/${booking.id}#review`,
      label: "Leave review",
    };
  }
  return { href: `/dashboard/customer/bookings/${booking.id}`, label: "View" };
}

export function CustomerBookingsPage() {
  const { data, isLoading, isError, refetch } = useMyBookings();
  const cancelBooking = useCancelBooking();
  const list = data ?? [];
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [cancelling, setCancelling] = useState(false);

  async function handleCancel() {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await cancelBooking.mutateAsync(cancelTarget.id);
      setCancelTarget(null);
    } catch {
      // toast in mutation
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <ConfirmDialog
        open={Boolean(cancelTarget)}
        onOpenChange={(open) => {
          if (!open && !cancelling) setCancelTarget(null);
        }}
        title="Cancel this booking?"
        description={
          cancelTarget?.service?.name
            ? `“${cancelTarget.service.name}” will be cancelled. This can't be undone.`
            : "This booking will be cancelled. This can't be undone."
        }
        confirmLabel="Cancel booking"
        cancelLabel="Keep booking"
        tone="danger"
        loading={cancelling}
        onConfirm={handleCancel}
      />

      <Reveal className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Your bookings
          </h2>
          <p className="text-sm text-muted-foreground">
            Track requests, payments, and reviews. Cancel is available before a job starts.
          </p>
        </div>
        <Button
          className="rounded-full"
          nativeButton={false}
          render={<Link href="/services" />}
        >
          Book a service
        </Button>
      </Reveal>

      <Reveal className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm sm:p-6">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            title="Couldn't load bookings"
            description="Check that the API is running, then try again."
            action={
              <Button variant="outline" onClick={() => refetch()}>
                Retry
              </Button>
            }
          />
        ) : list.length === 0 ? (
          <EmptyState
            title="No bookings yet"
            description="Browse services and request a technician for a time slot."
            action={
              <Button nativeButton={false} render={<Link href="/services" />}>
                Browse services
              </Button>
            }
          />
        ) : (
          <RevealGroup as="ul" animate="visible" className="divide-y divide-border/60">
            {list.map((booking) => {
              const action = bookingAction(booking);
              const canCancel = CANCELLABLE.includes(booking.status);
              return (
                <RevealItem
                  key={booking.id}
                  as="li"
                  className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium tracking-tight">
                        {booking.service?.name ?? "Service"}
                      </p>
                      <BookingStatusBadge status={booking.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(booking.scheduledTime)}
                      {booking.technician?.email
                        ? ` · ${displayNameFromEmail(booking.technician.email)}`
                        : ""}
                    </p>
                    {typeof booking.service?.price === "number" ? (
                      <p className="text-sm font-medium">
                        {formatCurrency(booking.service.price)}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {canCancel ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        onClick={() => setCancelTarget(booking)}
                      >
                        Cancel
                      </Button>
                    ) : null}
                    <Button
                      variant={booking.status === "ACCEPTED" ? "default" : "outline"}
                      size="sm"
                      className="rounded-full"
                      nativeButton={false}
                      render={<Link href={action.href} />}
                    >
                      {action.label}
                    </Button>
                  </div>
                </RevealItem>
              );
            })}
          </RevealGroup>
        )}
      </Reveal>
    </div>
  );
}
