"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Clock3,
  CreditCard,
  Search,
} from "lucide-react";

import { StatTile } from "@/app/(dashboardGroup)/dashboard/_components/stat-tile";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import {
  Float,
  Reveal,
  RevealGroup,
  RevealItem,
} from "@/components/motion/reveal";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useMyBookings } from "@/hooks/use-bookings";
import { useBookingStatusToasts } from "@/hooks/use-booking-status-toasts";
import { useMyPayments } from "@/hooks/use-payments";
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

const ACTIVE_STATUSES = new Set(["REQUESTED", "ACCEPTED", "PAID", "IN_PROGRESS"]);

export function CustomerDashboard() {
  const { user } = useAuth();
  useBookingStatusToasts(true);
  const {
    data: bookings,
    isLoading: bookingsLoading,
    isError: bookingsError,
    refetch: refetchBookings,
  } = useMyBookings();
  const { data: payments, isLoading: paymentsLoading } = useMyPayments();

  const list = bookings ?? [];
  const paymentList = payments ?? [];
  const displayName =
    user?.email?.split("@")[0]?.replace(/[._-]/g, " ") ?? "Customer";

  const activeJobs = list.filter((b) => ACTIVE_STATUSES.has(b.status));
  const spent = paymentList
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const recent = list.slice(0, 4);
  const nextBooking = [...activeJobs].sort(
    (a, b) =>
      new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
  )[0];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Reveal className="relative overflow-hidden rounded-[1.5rem] border border-border/50 bg-gradient-to-br from-accent/50 via-card to-card shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5 p-6 sm:p-8 lg:p-10">
            <p className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] text-primary uppercase">
              <span className="size-1.5 rounded-full bg-primary" />
              Customer workspace
            </p>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight capitalize sm:text-3xl">
                Good to see you, {displayName}.
              </h2>
              <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
                Keep every home-service job organized in one place — from finding
                the right professional to tracking payment and completion.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                className="rounded-full"
                nativeButton={false}
                render={<Link href="/services" />}
              >
                <Search aria-hidden="true" />
                Browse services
              </Button>
              <Button
                variant="outline"
                className="rounded-full bg-background/70"
                nativeButton={false}
                render={<Link href="/dashboard/customer/bookings" />}
              >
                View bookings
                <ArrowRight aria-hidden="true" />
              </Button>
            </div>
          </div>

          <div className="relative hidden min-h-56 overflow-hidden lg:block">
            <Float distance={8} duration={7} className="absolute inset-0">
              <div className="absolute inset-[-5%]">
                <Image
                  src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80"
                  alt="Technician completing a home repair"
                  fill
                  sizes="40vw"
                  className="object-cover"
                />
              </div>
            </Float>
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-card/40" />
            <Link
              href="/dashboard/customer/bookings"
              className="absolute right-5 bottom-5 flex items-center gap-4 rounded-2xl bg-foreground/85 px-4 py-3 text-background backdrop-blur-sm transition-transform hover:-translate-y-0.5"
            >
              <div>
                <p className="text-xs text-background/70">Active bookings</p>
                <p className="text-2xl font-semibold tracking-tight">
                  {bookingsLoading ? "—" : activeJobs.length}
                </p>
              </div>
              <span className="inline-flex size-8 items-center justify-center rounded-full bg-background/15">
                <ArrowUpRight className="size-4" />
              </span>
            </Link>
          </div>
        </div>
      </Reveal>

      <RevealGroup className="grid gap-4 sm:grid-cols-3">
        {bookingsLoading || paymentsLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))
        ) : (
          <>
            <RevealItem>
              <StatTile
                label="Total bookings"
                value={list.length}
                hint="All service requests"
                icon={CalendarDays}
              />
            </RevealItem>
            <RevealItem>
              <StatTile
                label="Active jobs"
                value={activeJobs.length}
                hint="Requested or in progress"
                icon={Clock3}
                iconClassName="bg-info/15 text-info"
              />
            </RevealItem>
            <RevealItem>
              <StatTile
                label="Total spent"
                value={formatCurrency(spent)}
                hint="Completed payments"
                icon={CreditCard}
                iconClassName="bg-success/15 text-success"
              />
            </RevealItem>
          </>
        )}
      </RevealGroup>

      <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
        <Reveal className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                Activity
              </p>
              <h2 className="text-lg font-semibold tracking-tight">
                Recent bookings
              </h2>
              <p className="text-sm text-muted-foreground">
                The latest service requests and their current status.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full"
              nativeButton={false}
              render={<Link href="/dashboard/customer/bookings" />}
            >
              View all
              <ArrowRight aria-hidden="true" />
            </Button>
          </div>

          {bookingsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
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
          ) : recent.length === 0 ? (
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
              {recent.map((booking) => {
                const action = bookingAction(booking);
                return (
                  <li
                    key={booking.id}
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
                          ? ` · ${booking.technician.email.split("@")[0]}`
                          : ""}
                      </p>
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
                  </li>
                );
              })}
            </ul>
          )}
        </Reveal>

        <Reveal className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm sm:p-6">
          <div className="mb-5 space-y-1">
            <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              Next up
            </p>
            <h2 className="text-lg font-semibold tracking-tight">
              Your next booking
            </h2>
            <p className="text-sm text-muted-foreground">
              The most immediate job in your queue.
            </p>
          </div>

          {bookingsLoading ? (
            <Skeleton className="h-40 w-full rounded-xl" />
          ) : !nextBooking ? (
            <div className="rounded-xl bg-muted/50 px-4 py-6 text-sm text-muted-foreground">
              No active bookings right now. Browse services when you need help at home.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-base font-semibold tracking-tight">
                    {nextBooking.service?.name ?? "Service"}
                  </p>
                  <BookingStatusBadge status={nextBooking.status} />
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatDateTime(nextBooking.scheduledTime)}
                </p>
                {nextBooking.technician?.email ? (
                  <p className="text-sm text-muted-foreground">
                    With {nextBooking.technician.email.split("@")[0]}
                  </p>
                ) : null}
                {typeof nextBooking.service?.price === "number" ? (
                  <p className="text-sm font-semibold">
                    {formatCurrency(nextBooking.service.price)}
                  </p>
                ) : null}
              </div>
              <Button
                className="w-full rounded-full"
                nativeButton={false}
                render={
                  <Link href={bookingAction(nextBooking).href} />
                }
              >
                {bookingAction(nextBooking).label}
              </Button>
            </div>
          )}
        </Reveal>
      </div>
    </div>
  );
}
