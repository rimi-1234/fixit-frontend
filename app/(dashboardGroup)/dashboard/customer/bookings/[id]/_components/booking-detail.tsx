"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  CheckCircle2,
  Circle,
  Clock,
  Loader2,
  MessageSquareText,
  Navigation,
  Star,
  XCircle,
} from "lucide-react";
import { LiveTrackingMap } from "@/components/live-tracking-map";

import { ReviewForm } from "@/app/(dashboardGroup)/dashboard/customer/_components/review-form";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useBooking, useCancelBooking } from "@/hooks/use-bookings";
import type { BookingEvent, BookingStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/format-currency";
import { formatDateTime } from "@/utils/format-date";
import { displayNameFromEmail } from "@/utils/display-name";

const CANCELLABLE: BookingStatus[] = ["REQUESTED", "ACCEPTED", "PAID"];

const EVENT_LABELS: Record<string, string> = {
  BOOKING_CREATED: "Booking requested",
  BOOKING_ACCEPTED: "Technician accepted",
  BOOKING_DECLINED: "Technician declined",
  BOOKING_CANCELLED: "Booking cancelled",
  BOOKING_PAID: "Payment completed",
  BOOKING_IN_PROGRESS: "Work started",
  BOOKING_COMPLETED: "Work completed",
};

function eventIcon(eventType: string) {
  if (eventType.includes("CANCELLED") || eventType.includes("DECLINED")) {
    return <XCircle className="size-4 text-destructive" />;
  }
  if (eventType.includes("COMPLETED")) {
    return <CheckCircle2 className="size-4 text-primary" />;
  }
  if (eventType.includes("PAID") || eventType.includes("PROGRESS")) {
    return <CheckCircle2 className="size-4 text-emerald-500" />;
  }
  return <Circle className="size-4 text-muted-foreground" />;
}

function BookingTimeline({ events }: { events: BookingEvent[] }) {
  if (events.length === 0) return null;
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold">Booking timeline</h2>
      <ol className="relative border-l border-border/60 pl-5 space-y-4">
        {events.map((event) => (
          <li key={event.id} className="relative">
            <span className="absolute -left-[22px] flex items-center justify-center">
              {eventIcon(event.eventType)}
            </span>
            <div>
              <p className="text-sm font-medium leading-snug">
                {EVENT_LABELS[event.eventType] ?? event.eventType.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="size-3" aria-hidden="true" />
                {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function BookingDetailView({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const { data: booking, isLoading, isError, refetch } = useBooking(bookingId, {
    // Auto-refresh so the tracking section appears as soon as the technician
    // updates the status — without requiring a manual page reload.
    refetchInterval: 20_000,
  });
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
        {booking.referenceNumber && (
          <p className="text-xs font-mono text-muted-foreground">
            Ref: {booking.referenceNumber}
          </p>
        )}
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
        {booking.notes ? (
          <div className="space-y-1.5 py-4">
            <dt className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MessageSquareText className="size-3.5 text-primary/70" aria-hidden="true" />
              Your notes to the technician
            </dt>
            <dd className="rounded-lg border border-border/60 bg-muted/50 px-3 py-2 text-sm leading-relaxed">
              {booking.notes}
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

      {/* Tracking teaser — unlocks after payment */}
      {booking.status === "ACCEPTED" && (
        <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border/60 bg-muted/20 px-5 py-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
            <Navigation className="size-4 text-muted-foreground/60" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Live tracking available after payment</p>
            <p className="text-xs text-muted-foreground">
              Once you pay, you can track your technician in real time on a live map.
            </p>
          </div>
        </div>
      )}

      {/* Live technician tracking — shown once paid and until completion */}
      {(booking.status === "PAID" || booking.status === "IN_PROGRESS") && (
        <div className="space-y-3 rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-full bg-primary/10">
                <Navigation className="size-3.5 text-primary" aria-hidden="true" />
              </div>
              <h2 className="text-sm font-semibold">Live technician tracking</h2>
            </div>
            <span className="text-xs text-muted-foreground">
              {booking.status === "PAID"
                ? "Waiting for technician to start"
                : "Technician is on the way"}
            </span>
          </div>
          <LiveTrackingMap bookingId={booking.id} />
        </div>
      )}

      {booking.events && booking.events.length > 0 && (
        <BookingTimeline events={booking.events} />
      )}

      {canReview ? (
        <ReviewForm
          bookingId={booking.id}
          technicianId={booking.technicianId}
        />
      ) : null}
    </div>
  );
}
