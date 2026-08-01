"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";

import { BookingStatusBadge } from "@/components/booking-status-badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminBookings } from "@/hooks/use-admin";
import type { BookingStatus } from "@/lib/types";
import { formatCurrency } from "@/utils/format-currency";
import { formatDateTime } from "@/utils/format-date";

const STATUS_OPTIONS: { value: "" | BookingStatus; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "REQUESTED", label: "Requested" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "DECLINED", label: "Declined" },
  { value: "PAID", label: "Paid" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export function AdminBookingsTable() {
  const [status, setStatus] = useState<"" | BookingStatus>("");
  const filters = useMemo(
    () => (status ? { status } : undefined),
    [status]
  );

  const { data, isLoading, isError, isFetching, refetch } =
    useAdminBookings(filters);

  const bookings = useMemo(() => {
    const list = data ?? [];
    return list
      .slice()
      .sort(
        (a, b) =>
          new Date(b.scheduledTime).getTime() -
          new Date(a.scheduledTime).getTime()
      );
  }, [data]);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Bookings
          </h1>
          <p className="text-sm text-muted-foreground">
            Platform-wide booking activity with customer, technician, and payment.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href="/dashboard/admin" />}
        >
          Overview
        </Button>
      </div>

      <div className="max-w-xs space-y-1.5">
        <Label htmlFor="booking-status">Status</Label>
        <select
          id="booking-status"
          value={status}
          onChange={(e) => setStatus(e.target.value as "" | BookingStatus)}
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value || "all"} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          title="Couldn't load bookings"
          description="Check that you're signed in as admin and the API is running."
          action={
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          }
        />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title={status ? "No bookings in this status" : "No bookings yet"}
          description={
            status
              ? "Try another status filter."
              : "Bookings will appear here as customers request services."
          }
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {bookings.length} booking{bookings.length === 1 ? "" : "s"}
            {isFetching ? " · refreshing…" : ""}
          </p>

          <ul className="divide-y divide-border/60 md:hidden">
            {bookings.map((booking) => (
              <li key={booking.id} className="space-y-2 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium tracking-tight">
                    {booking.service?.name ?? "Service"}
                  </p>
                  <BookingStatusBadge status={booking.status} />
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatDateTime(booking.scheduledTime)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {booking.customer?.email ?? "Customer"} →{" "}
                  {booking.technician?.email ?? "Technician"}
                </p>
                <p className="text-sm">
                  {typeof booking.service?.price === "number"
                    ? formatCurrency(booking.service.price)
                    : "—"}
                  {booking.payment
                    ? ` · payment ${booking.payment.status.toLowerCase()}`
                    : " · no payment"}
                </p>
              </li>
            ))}
          </ul>

          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Technician</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">
                      {booking.service?.name ?? "Service"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {booking.customer?.email ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {booking.technician?.email ?? "—"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatDateTime(booking.scheduledTime)}
                    </TableCell>
                    <TableCell>
                      <BookingStatusBadge status={booking.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {booking.payment
                        ? `${booking.payment.status}${
                            booking.payment.status === "COMPLETED"
                              ? ` · ${formatCurrency(booking.payment.amount)}`
                              : ""
                          }`
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {typeof booking.service?.price === "number"
                        ? formatCurrency(booking.service.price)
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
