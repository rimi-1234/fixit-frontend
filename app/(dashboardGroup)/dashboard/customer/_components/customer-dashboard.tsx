"use client";

import Link from "next/link";
import { CalendarClock, CheckCircle2, CreditCard, Clock3 } from "lucide-react";

import { StatTile } from "@/app/(dashboardGroup)/dashboard/_components/stat-tile";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyBookings } from "@/hooks/use-bookings";
import { useMyPayments } from "@/hooks/use-payments";
import type { Booking } from "@/lib/types";
import { formatCurrency } from "@/utils/format-currency";
import { formatDateTime } from "@/utils/format-date";

function bookingAction(booking: Booking) {
  if (booking.status === "ACCEPTED") {
    return { href: `/dashboard/customer/bookings/${booking.id}/pay`, label: "Pay now" };
  }
  if (booking.status === "COMPLETED" && !booking.review) {
    return { href: `/dashboard/customer/bookings/${booking.id}`, label: "Leave review" };
  }
  return { href: `/dashboard/customer/bookings/${booking.id}`, label: "View" };
}

export function CustomerDashboard() {
  const {
    data: bookings,
    isLoading: bookingsLoading,
    isError: bookingsError,
    refetch: refetchBookings,
  } = useMyBookings();
  const { data: payments, isLoading: paymentsLoading } = useMyPayments();

  const list = bookings ?? [];
  const paymentList = payments ?? [];

  const pending = list.filter((b) =>
    ["REQUESTED", "ACCEPTED", "PAID", "IN_PROGRESS"].includes(b.status)
  ).length;
  const completed = list.filter((b) => b.status === "COMPLETED").length;
  const awaitingPayment = list.filter((b) => b.status === "ACCEPTED").length;
  const spent = paymentList
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Customer dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Track booking status, payments, and next actions.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {bookingsLoading || paymentsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))
        ) : (
          <>
            <StatTile label="Active bookings" value={pending} icon={Clock3} />
            <StatTile label="Awaiting payment" value={awaitingPayment} icon={CreditCard} />
            <StatTile label="Completed" value={completed} icon={CheckCircle2} />
            <StatTile label="Total paid" value={formatCurrency(spent)} icon={CalendarClock} />
          </>
        )}
      </div>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">Your bookings</h2>
            <p className="text-sm text-muted-foreground">
              Newest first · open a booking for cancel, pay, or review actions.
            </p>
          </div>
          <Button nativeButton={false} render={<Link href="/services" />}>
            Book a service
          </Button>
        </div>

        {bookingsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : bookingsError ? (
          <EmptyState
            title="Couldn't load bookings"
            description="Check that the API is running, then try again."
            action={
              <Button variant="outline" onClick={() => refetchBookings()}>
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
          <ul className="divide-y divide-border/60">
            {list.map((booking) => {
              const action = bookingAction(booking);
              return (
                <li
                  key={booking.id}
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
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
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(booking.service.price)}
                      </p>
                    ) : null}
                  </div>
                  <Button
                    variant={booking.status === "ACCEPTED" ? "default" : "outline"}
                    size="sm"
                    nativeButton={false}
                    render={<Link href={action.href} />}
                  >
                    {action.label}
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
