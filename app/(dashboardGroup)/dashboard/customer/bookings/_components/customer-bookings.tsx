"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import {
  BOOKING_STATUS_FILTERS,
  FilterBar,
  FilterSearch,
  FilterSelect,
  filterBookings,
} from "@/app/(dashboardGroup)/dashboard/_components/dashboard-filters";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { PaginationBar } from "@/components/pagination-bar";
import { Reveal } from "@/components/motion/reveal";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCancelBooking, useMyBookings } from "@/hooks/use-bookings";
import { useBookingStatusToasts } from "@/hooks/use-booking-status-toasts";
import { usePagination } from "@/hooks/use-pagination";
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
  useBookingStatusToasts(true);
  const { data, isLoading, isError, refetch } = useMyBookings();
  const cancelBooking = useCancelBooking();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const list = useMemo(
    () =>
      filterBookings(data ?? [], { search, status }).sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [data, search, status]
  );
  const { page, setPage, totalPages, paged } = usePagination(list, 8);

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
    <div className="mx-auto max-w-6xl space-y-6">
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

      <FilterBar>
        <FilterSearch
          id="customer-bookings-search"
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Service or technician…"
        />
        <FilterSelect
          id="customer-bookings-status"
          label="Status"
          value={status}
          onChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
          options={BOOKING_STATUS_FILTERS}
        />
      </FilterBar>

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
        ) : (data ?? []).length === 0 ? (
          <EmptyState
            title="No bookings yet"
            description="Browse services and request a technician for a time slot."
            action={
              <Button nativeButton={false} render={<Link href="/services" />}>
                Browse services
              </Button>
            }
          />
        ) : list.length === 0 ? (
          <EmptyState
            title="No matching bookings"
            description="Try another search or status filter."
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Technician</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((booking) => {
                  const action = bookingAction(booking);
                  const canCancel = CANCELLABLE.includes(booking.status);
                  return (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">
                        {booking.service?.name ?? "Service"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {booking.technician?.email
                          ? displayNameFromEmail(booking.technician.email)
                          : "—"}
                      </TableCell>
                      <TableCell>{formatDateTime(booking.scheduledTime)}</TableCell>
                      <TableCell>
                        <BookingStatusBadge status={booking.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        {typeof booking.service?.price === "number"
                          ? formatCurrency(booking.service.price)
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
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
                            variant={
                              booking.status === "ACCEPTED" ? "default" : "outline"
                            }
                            size="sm"
                            className="rounded-full"
                            nativeButton={false}
                            render={<Link href={action.href} />}
                          >
                            {action.label}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <PaginationBar page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </Reveal>
    </div>
  );
}
