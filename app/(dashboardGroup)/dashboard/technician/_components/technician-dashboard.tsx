"use client";

import Link from "next/link";
import {
  Banknote,
  CalendarClock,
  ClipboardList,
  Clock3,
  Inbox,
  Settings2,
  Wrench,
} from "lucide-react";

import { StatTile } from "@/app/(dashboardGroup)/dashboard/_components/stat-tile";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useTechnician, useTechnicianBookings } from "@/hooks/use-technicians";
import type { Booking } from "@/lib/types";
import { formatCurrency } from "@/utils/format-currency";
import { formatDateTime } from "@/utils/format-date";

const ACTIVE_STATUSES = new Set(["ACCEPTED", "PAID", "IN_PROGRESS"]);

function sortBySchedule(a: Booking, b: Booking) {
  return new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime();
}

export function TechnicianDashboard() {
  const { user } = useAuth();
  const {
    data: bookings,
    isLoading: bookingsLoading,
    isError: bookingsError,
    refetch,
  } = useTechnicianBookings();
  const { data: profile, isLoading: profileLoading } = useTechnician(user?.id);

  const list = bookings ?? [];
  const pending = list.filter((b) => b.status === "REQUESTED");
  const upcoming = list
    .filter((b) => ACTIVE_STATUSES.has(b.status))
    .slice()
    .sort(sortBySchedule);
  const inProgress = list.filter((b) => b.status === "IN_PROGRESS").length;
  const completed = list.filter((b) => b.status === "COMPLETED");
  const earnings = list
    .filter((b) => b.payment?.status === "COMPLETED")
    .reduce((sum, b) => sum + (b.payment?.amount ?? 0), 0);

  const techProfile = profile?.technicianProfile;
  const serviceCount = profile?.services?.length ?? 0;
  const needsProfile = !techProfile?.skills?.length || !techProfile.location;
  const needsAvailability = !(techProfile?.availability?.length);
  const needsServices = serviceCount === 0;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Technician dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Incoming requests, upcoming jobs, and earnings at a glance.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {bookingsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))
        ) : (
          <>
            <StatTile label="Pending requests" value={pending.length} icon={Inbox} />
            <StatTile label="Upcoming jobs" value={upcoming.length} icon={CalendarClock} />
            <StatTile label="In progress" value={inProgress} icon={Clock3} />
            <StatTile
              label="Earnings"
              value={formatCurrency(earnings)}
              icon={Banknote}
            />
          </>
        )}
      </div>

      {(needsProfile || needsAvailability || needsServices) && !profileLoading ? (
        <section className="space-y-3 border-y border-border/60 py-5">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">Finish setup</h2>
            <p className="text-sm text-muted-foreground">
              Complete these so customers can find and book you.
            </p>
          </div>
          <ul className="space-y-2">
            {needsProfile ? (
              <li className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm">Add skills, rate, and location</p>
                <Button
                  size="sm"
                  variant="outline"
                  nativeButton={false}
                  render={<Link href="/dashboard/technician/profile" />}
                >
                  <Settings2 aria-hidden="true" />
                  Profile
                </Button>
              </li>
            ) : null}
            {needsAvailability ? (
              <li className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm">Publish weekly availability slots</p>
                <Button
                  size="sm"
                  variant="outline"
                  nativeButton={false}
                  render={<Link href="/dashboard/technician/availability" />}
                >
                  <CalendarClock aria-hidden="true" />
                  Availability
                </Button>
              </li>
            ) : null}
            {needsServices ? (
              <li className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm">List at least one service</p>
                <Button
                  size="sm"
                  variant="outline"
                  nativeButton={false}
                  render={<Link href="/dashboard/technician/services" />}
                >
                  <Wrench aria-hidden="true" />
                  Services
                </Button>
              </li>
            ) : null}
          </ul>
        </section>
      ) : null}

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">
              Pending requests
            </h2>
            <p className="text-sm text-muted-foreground">
              Accept or decline from the bookings page.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/dashboard/technician/bookings" />}
          >
            Manage bookings
          </Button>
        </div>

        {bookingsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : bookingsError ? (
          <EmptyState
            title="Couldn't load bookings"
            description="Check that the API is running, then try again."
            action={
              <Button variant="outline" onClick={() => refetch()}>
                Retry
              </Button>
            }
          />
        ) : pending.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No pending requests"
            description="New booking requests will show up here."
          />
        ) : (
          <ul className="divide-y divide-border/60">
            {pending.map((booking) => (
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
                    {booking.customer?.email
                      ? ` · ${booking.customer.email}`
                      : ""}
                  </p>
                  {typeof booking.service?.price === "number" ? (
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(booking.service.price)}
                    </p>
                  ) : null}
                </div>
                <Button
                  size="sm"
                  nativeButton={false}
                  render={<Link href="/dashboard/technician/bookings" />}
                >
                  Review
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">Upcoming jobs</h2>
          <p className="text-sm text-muted-foreground">
            Accepted, paid, and in-progress work sorted by schedule.
          </p>
        </div>

        {bookingsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : upcoming.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No upcoming jobs"
            description="Accepted bookings appear here once customers request work."
          />
        ) : (
          <ul className="divide-y divide-border/60">
            {upcoming.slice(0, 6).map((booking) => (
              <li
                key={booking.id}
                className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
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
                    {booking.customer?.email
                      ? ` · ${booking.customer.email}`
                      : ""}
                  </p>
                </div>
                {typeof booking.service?.price === "number" ? (
                  <p className="text-sm font-medium">
                    {formatCurrency(booking.service.price)}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      {!bookingsLoading && completed.length > 0 ? (
        <p className="text-sm text-muted-foreground">
          {completed.length} completed job{completed.length === 1 ? "" : "s"}
          {profile?.averageRating
            ? ` · ${profile.averageRating.toFixed(1)} average rating`
            : ""}
          {profile?.reviewCount
            ? ` · ${profile.reviewCount} review${profile.reviewCount === 1 ? "" : "s"}`
            : ""}
        </p>
      ) : null}
    </div>
  );
}
