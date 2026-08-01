"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

import { BookingStatusBadge } from "@/components/booking-status-badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useBooking, useCancelBooking } from "@/hooks/use-bookings";
import { useCreateReview } from "@/hooks/use-reviews";
import type { BookingStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/format-currency";
import { formatDateTime } from "@/utils/format-date";

const CANCELLABLE: BookingStatus[] = ["REQUESTED", "ACCEPTED", "PAID"];

function ReviewForm({ bookingId }: { bookingId: string }) {
  const createReview = useCreateReview();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await createReview.mutateAsync({
      bookingId,
      rating,
      comment: comment.trim() || undefined,
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 border-t border-border/60 pt-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">Leave a review</h2>
        <p className="text-sm text-muted-foreground">
          Share how the job went so other customers can decide.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Rating</Label>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              className={cn(
                "size-9 rounded-full text-sm font-medium transition-colors",
                rating === value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="review-comment">Comment (optional)</Label>
        <Textarea
          id="review-comment"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Professional, on time, fixed the issue quickly…"
        />
      </div>

      <Button type="submit" disabled={createReview.isPending}>
        {createReview.isPending ? (
          <>
            <Loader2 className="animate-spin" aria-hidden="true" />
            Submitting…
          </>
        ) : (
          "Submit review"
        )}
      </Button>
    </form>
  );
}

export function BookingDetailView({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const { data: booking, isLoading, isError, refetch } = useBooking(bookingId);
  const cancelBooking = useCancelBooking();

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
    if (!confirm("Cancel this booking? This can't be undone.")) return;
    try {
      await cancelBooking.mutateAsync(booking.id);
      router.refresh();
    } catch {
      // toast in mutation
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
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
            {booking.technician?.email ?? "—"}
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
        <div className="space-y-2 rounded-xl bg-muted/40 px-4 py-4">
          <p className="text-sm font-medium">Your review · {booking.review.rating}/5</p>
          {booking.review.comment ? (
            <p className="text-sm text-muted-foreground">{booking.review.comment}</p>
          ) : (
            <p className="text-sm text-muted-foreground">No comment left.</p>
          )}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {canPay ? (
          <Button
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
            onClick={handleCancel}
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

      {canReview ? <ReviewForm bookingId={booking.id} /> : null}
    </div>
  );
}
