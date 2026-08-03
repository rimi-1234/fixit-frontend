"use client";

import Link from "next/link";
import { CreditCard, Loader2, Lock } from "lucide-react";

import { BookingStatusBadge } from "@/components/booking-status-badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useBooking } from "@/hooks/use-bookings";
import { useCreatePayment } from "@/hooks/use-payments";
import { formatCurrency } from "@/utils/format-currency";
import { formatDateTime } from "@/utils/format-date";

export function PayBookingView({ bookingId }: { bookingId: string }) {
  const { data: booking, isLoading, isError, refetch } = useBooking(bookingId);
  const createPayment = useCreatePayment();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-36 w-full rounded-xl" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <EmptyState
        title="Booking not found"
        description="We couldn't load this booking for payment."
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

  if (booking.status === "PAID" || booking.status === "IN_PROGRESS" || booking.status === "COMPLETED") {
    return (
      <EmptyState
        icon={CreditCard}
        title="Already paid"
        description="This booking has already been paid. You can view the details anytime."
        action={
          <Button
            nativeButton={false}
            render={
              <Link href={`/dashboard/customer/bookings/${booking.id}`} />
            }
          >
            View booking
          </Button>
        }
      />
    );
  }

  if (booking.status !== "ACCEPTED") {
    return (
      <EmptyState
        icon={Lock}
        title="Payment not available yet"
        description="The technician must accept your booking before you can pay."
        action={
          <Button
            nativeButton={false}
            render={
              <Link href={`/dashboard/customer/bookings/${booking.id}`} />
            }
          >
            Back to booking
          </Button>
        }
      />
    );
  }

  const price =
    typeof booking.service?.price === "number" ? booking.service.price : null;
  const hasPendingPayment = booking.payment?.status === "PENDING";
  const hasFailedPayment = booking.payment?.status === "FAILED";

  function handlePay() {
    createPayment.mutate({ bookingId, provider: "STRIPE" });
  }

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div className="space-y-3">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2"
          nativeButton={false}
          render={
            <Link href={`/dashboard/customer/bookings/${booking.id}`} />
          }
        >
          ← Back
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Pay for booking
          </h1>
          <BookingStatusBadge status={booking.status} />
        </div>
        <p className="text-sm text-muted-foreground">
          You&apos;ll be redirected to Stripe Checkout to complete payment securely.
        </p>
        {hasPendingPayment ? (
          <p className="rounded-xl border border-info/20 bg-info/10 px-3 py-2 text-sm text-info">
            A checkout was already started for this booking. Continue to open a fresh Stripe session.
          </p>
        ) : null}
        {hasFailedPayment ? (
          <p className="rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            The previous payment attempt failed. You can try again below.
          </p>
        ) : null}
      </div>

      <dl className="space-y-4 divide-y divide-border/60 border-y border-border/60">
        <div className="flex justify-between gap-4 py-4">
          <dt className="text-sm text-muted-foreground">Service</dt>
          <dd className="text-right text-sm font-medium">
            {booking.service?.name ?? "—"}
          </dd>
        </div>
        <div className="flex justify-between gap-4 py-4">
          <dt className="text-sm text-muted-foreground">Technician</dt>
          <dd className="text-right text-sm font-medium">
            {booking.technician?.email ?? "—"}
          </dd>
        </div>
        <div className="flex justify-between gap-4 py-4">
          <dt className="text-sm text-muted-foreground">Scheduled</dt>
          <dd className="text-right text-sm font-medium">
            {formatDateTime(booking.scheduledTime)}
          </dd>
        </div>
        <div className="flex justify-between gap-4 py-4">
          <dt className="text-sm text-muted-foreground">Amount</dt>
          <dd className="text-right text-base font-semibold tracking-tight">
            {price != null ? formatCurrency(price) : "—"}
          </dd>
        </div>
      </dl>

      <div className="space-y-3">
        <Button
          size="lg"
          className="w-full rounded-full"
          onClick={handlePay}
          disabled={createPayment.isPending}
        >
          {createPayment.isPending ? (
            <>
              <Loader2 className="animate-spin" aria-hidden="true" />
              Starting checkout…
            </>
          ) : (
            <>
              <CreditCard aria-hidden="true" />
              {hasPendingPayment ? "Continue to Stripe" : "Pay with Stripe"}
            </>
          )}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Card details are handled by Stripe. We never store your card number.
        </p>
      </div>
    </div>
  );
}
