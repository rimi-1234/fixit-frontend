"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Star } from "lucide-react";

import { ReviewForm } from "@/app/(dashboardGroup)/dashboard/customer/_components/review-form";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useBooking, useCancelBooking } from "@/hooks/use-bookings";
import type { BookingStatus } from "@/lib/types";
import { formatCurrency } from "@/utils/format-currency";
import { formatDateTime } from "@/utils/format-date";
import { displayNameFromEmail } from "@/utils/display-name";

const CANCELLABLE: BookingStatus[] = ["REQUESTED", "ACCEPTED", "PAID"];

export function BookingDetailView({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const { data: booking, isLoading, isError, refetch } = useBooking(bookingId);
  const cancelBooking = useCancelBooking();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <EmptyState
        title="Booking not found"
        description="It may have been removed, or you don't have access."
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
            <Button
              nativeButton={false}
              render={<Link href="/dashboard/customer" />}
            >
              Back to dashboard
            </Button>
          </div>
        }
      />
    );
  }

  const canCancel = CANCELLABLE.includes(booking.status);
  const canPay = booking.status === "ACCEPTED";
  const canReview = booking.status === "COMPLETED" && !booking.review;

  async function handleCancel() {
    if (!booking) return;
    setCancelling(true);
    try {
      await cancelBooking.mutateAsync(booking.id);
      setCancelOpen(false);
      router.refresh();
    } catch {
      // toast in mutation
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={(open) => {
          if (!cancelling) setCancelOpen(open);
        }}
        title="Cancel this booking?"
        description="This can't be undone. Your technician will be notified that the booking was cancelled."
        confirmLabel="Cancel booking"
        cancelLabel="Keep booking"
        tone="danger"
        loading={cancelling}
        onConfirm={handleCancel}
      />

      <div className="space-y-3">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2"
          nativeButton={false}
          render={<Link href="/dashboard/customer" />}
        >
          ← Back
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {booking.service?.name ?? "Booking"}
          </h1>
          <BookingStatusBadge status={booking.status} />
        </div>
        <p className="text-sm text-muted-foreground">
          Scheduled {formatDateTime(booking.scheduledTime)}
        </p>
      </div>

      <dl className="space-y-4 divide-y divide-border/60 border-y border-border/60">
        <div className="flex justify-between gap-4 py-4">
          <dt className="text-sm text-muted-foreground">Technician</dt>
          <dd className="text-sm font-medium">
            {displayNameFromEmail(booking.technician?.email)}
          </dd>
        </div>
        <div className="flex justify-between gap-4 py-4">
          <dt className="text-sm text-muted-foreground">Price</dt>
          <dd className="text-sm font-medium">
            {typeof booking.service?.price === "number"
              ? formatCurrency(booking.service.price)
              : "—"}
          </dd>
        </div>
        <div className="flex justify-between gap-4 py-4">
          <dt className="text-sm text-muted-foreground">Category</dt>
          <dd className="text-sm font-medium">
            {booking.service?.category?.name ?? "—"}
          </dd>
        </div>
        <div className="flex justify-between gap-4 py-4">
          <dt className="text-sm text-muted-foreground">Payment</dt>
          <dd className="text-sm font-medium">
            {booking.payment
              ? `${booking.payment.status} · ${formatCurrency(booking.payment.amount)}`
              : "Not started"}
          </dd>
        </div>
        {booking.service?.description ? (
          <div className="space-y-1 py-4">
            <dt className="text-sm text-muted-foreground">Service details</dt>
            <dd className="text-sm leading-relaxed">
              {booking.service.description}
            </dd>
          </div>
        ) : null}
      </dl>

      {booking.review ? (
        <div className="space-y-2 border-t border-border/60 pt-6">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium">Your review</p>
            <span className="inline-flex items-center gap-1 text-sm text-amber-600 dark:text-amber-400">
              <Star className="size-3.5 fill-current" aria-hidden="true" />
              {booking.review.rating}/5
            </span>
          </div>
          {booking.review.comment ? (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {booking.review.comment}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">No comment left.</p>
          )}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {canPay ? (
          <Button
            className="rounded-full"
            nativeButton={false}
            render={
              <Link href={`/dashboard/customer/bookings/${booking.id}/pay`} />
            }
          >
            Pay now
          </Button>
        ) : null}

        {canCancel ? (
          <Button
            variant="destructive"
            className="rounded-full"
            onClick={() => setCancelOpen(true)}
            disabled={cancelBooking.isPending}
          >
            {cancelBooking.isPending ? (
              <>
                <Loader2 className="animate-spin" aria-hidden="true" />
                Cancelling…
              </>
            ) : (
              "Cancel booking"
            )}
          </Button>
        ) : null}

        {!canCancel &&
        !canPay &&
        booking.status !== "COMPLETED" &&
        booking.status !== "CANCELLED" &&
        booking.status !== "DECLINED" ? (
          <p className="text-sm text-muted-foreground">
            Cancellation is locked once the job is in progress.
          </p>
        ) : null}
      </div>

      {canReview ? (
        <ReviewForm
          bookingId={booking.id}
          technicianId={booking.technicianId}
        />
      ) : null}
    </div>
  );
}
