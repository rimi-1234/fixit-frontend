"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarDays, Loader2 } from "lucide-react";

import { BookingStatusBadge } from "@/components/booking-status-badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useTechnicianBookings,
  useUpdateTechnicianBookingStatus,
} from "@/hooks/use-technicians";
import type { Booking, BookingStatus } from "@/lib/types";
import type { TechnicianBookingActionStatus } from "@/service/technician.service";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/format-currency";
import { formatDateTime } from "@/utils/format-date";

type StatusFilter = "ALL" | "REQUESTED" | "ACTIVE" | "DONE";

const FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "ALL", label: "All" },
  { id: "REQUESTED", label: "Pending" },
  { id: "ACTIVE", label: "Active" },
  { id: "DONE", label: "Closed" },
];

const ACTIVE: BookingStatus[] = ["ACCEPTED", "PAID", "IN_PROGRESS"];
const DONE: BookingStatus[] = ["COMPLETED", "DECLINED", "CANCELLED"];

function matchesFilter(booking: Booking, filter: StatusFilter) {
  if (filter === "ALL") return true;
  if (filter === "REQUESTED") return booking.status === "REQUESTED";
  if (filter === "ACTIVE") return ACTIVE.includes(booking.status);
  return DONE.includes(booking.status);
}

function actionsFor(status: BookingStatus): {
  status: TechnicianBookingActionStatus;
  label: string;
  variant?: "default" | "outline" | "destructive";
}[] {
  switch (status) {
    case "REQUESTED":
      return [
        { status: "ACCEPTED", label: "Accept" },
        { status: "DECLINED", label: "Decline", variant: "destructive" },
      ];
    case "PAID":
      return [{ status: "IN_PROGRESS", label: "Start job" }];
    case "IN_PROGRESS":
      return [{ status: "COMPLETED", label: "Mark completed" }];
    default:
      return [];
  }
}

export function TechnicianBookingsTable() {
  const {
    data: bookings,
    isLoading,
    isError,
    refetch,
  } = useTechnicianBookings();
  const updateStatus = useUpdateTechnicianBookingStatus();
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [pendingId, setPendingId] = useState<string | null>(null);

  const list = useMemo(() => {
    const all = bookings ?? [];
    return all
      .filter((booking) => matchesFilter(booking, filter))
      .slice()
      .sort(
        (a, b) =>
          new Date(b.scheduledTime).getTime() -
          new Date(a.scheduledTime).getTime()
      );
  }, [bookings, filter]);

  async function handleAction(
    bookingId: string,
    status: TechnicianBookingActionStatus
  ) {
    if (status === "DECLINED") {
      if (!confirm("Decline this booking request?")) return;
    }
    if (status === "COMPLETED") {
      if (!confirm("Mark this job as completed?")) return;
    }

    setPendingId(bookingId);
    try {
      await updateStatus.mutateAsync({ bookingId, status });
    } catch {
      // toast in mutation (surfaces backend transition errors)
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Bookings
          </h1>
          <p className="text-sm text-muted-foreground">
            Accept requests, start paid jobs, and mark work complete.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href="/dashboard/technician" />}
        >
          Overview
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              filter === item.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted/60 text-muted-foreground hover:text-foreground"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
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
          icon={CalendarDays}
          title={filter === "ALL" ? "No bookings yet" : "Nothing in this filter"}
          description={
            filter === "ALL"
              ? "When customers request your services, they'll show up here."
              : "Try another filter to see more bookings."
          }
        />
      ) : (
        <>
          {/* Mobile list */}
          <ul className="divide-y divide-border/60 md:hidden">
            {list.map((booking) => {
              const actions = actionsFor(booking.status);
              const busy = pendingId === booking.id;
              return (
                <li key={booking.id} className="space-y-3 py-4">
                  <div className="space-y-1">
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
                      {booking.customer?.email ?? "Customer"}
                      {typeof booking.service?.price === "number"
                        ? ` · ${formatCurrency(booking.service.price)}`
                        : ""}
                    </p>
                  </div>
                  {actions.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {actions.map((action) => (
                        <Button
                          key={action.status}
                          size="sm"
                          variant={action.variant ?? "default"}
                          disabled={busy}
                          onClick={() =>
                            handleAction(booking.id, action.status)
                          }
                        >
                          {busy ? (
                            <Loader2
                              className="animate-spin"
                              aria-hidden="true"
                            />
                          ) : null}
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  ) : booking.status === "ACCEPTED" ? (
                    <p className="text-sm text-muted-foreground">
                      Waiting for customer payment.
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>

          {/* Desktop table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((booking) => {
                  const actions = actionsFor(booking.status);
                  const busy = pendingId === booking.id;
                  return (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">
                        {booking.service?.name ?? "Service"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {booking.customer?.email ?? "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {formatDateTime(booking.scheduledTime)}
                      </TableCell>
                      <TableCell>
                        <BookingStatusBadge status={booking.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        {typeof booking.service?.price === "number"
                          ? formatCurrency(booking.service.price)
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {actions.length > 0 ? (
                          <div className="flex justify-end gap-2">
                            {actions.map((action) => (
                              <Button
                                key={action.status}
                                size="sm"
                                variant={action.variant ?? "default"}
                                disabled={busy}
                                onClick={() =>
                                  handleAction(booking.id, action.status)
                                }
                              >
                                {busy ? (
                                  <Loader2
                                    className="animate-spin"
                                    aria-hidden="true"
                                  />
                                ) : null}
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        ) : booking.status === "ACCEPTED" ? (
                          <span className="text-sm text-muted-foreground">
                            Awaiting payment
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
