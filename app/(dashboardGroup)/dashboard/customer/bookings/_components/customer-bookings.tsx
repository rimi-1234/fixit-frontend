"use client";

import Link from "next/link";

import { BookingStatusBadge } from "@/components/booking-status-badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyBookings } from "@/hooks/use-bookings";
import type { Booking } from "@/lib/types";
import { formatCurrency } from "@/utils/format-currency";
import { formatDateTime } from "@/utils/format-date";

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
  const list = data ?? [];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Reveal className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Your bookings
          </h2>
          <p className="text-sm text-muted-foreground">
            Track requests, payments, and reviews in one place.
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
          <RevealGroup as="ul" className="divide-y divide-border/60">
            {list.map((booking) => {
              const action = bookingAction(booking);
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
                        ? ` · ${booking.technician.email}`
                        : ""}
                    </p>
                    {typeof booking.service?.price === "number" ? (
                      <p className="text-sm font-medium">
                        {formatCurrency(booking.service.price)}
                      </p>
                    ) : null}
                  </div>
                  <Button
                    variant={booking.status === "ACCEPTED" ? "default" : "outline"}
                    size="sm"
                    className="rounded-full"
                    nativeButton={false}
                    render={<Link href={action.href} />}
                  >
                    {action.label}
                  </Button>
                </RevealItem>
              );
            })}
          </RevealGroup>
        )}
      </Reveal>
    </div>
  );
}
