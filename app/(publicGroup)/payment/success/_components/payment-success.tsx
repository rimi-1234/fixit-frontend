"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { useBooking } from "@/hooks/use-bookings";
import { queryKeys } from "@/lib/query-keys";
import type { BookingStatus } from "@/lib/types";

const MAX_POLLS = 5;
const POLL_MS = 2000;

const CONFIRMED: BookingStatus[] = ["PAID", "IN_PROGRESS", "COMPLETED"];

export function PaymentSuccessView() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId") ?? undefined;
  const queryClient = useQueryClient();
  const [polls, setPolls] = useState(0);

  const { data: booking, isLoading, isError, refetch } = useBooking(bookingId);

  const confirmed = booking ? CONFIRMED.includes(booking.status) : false;
  const timedOut = polls >= MAX_POLLS && !confirmed;

  useEffect(() => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
    void queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
  }, [queryClient]);

  useEffect(() => {
    if (!bookingId || confirmed || timedOut) return;

    const timer = window.setTimeout(() => {
      void refetch().finally(() => setPolls((n) => n + 1));
    }, POLL_MS);

    return () => window.clearTimeout(timer);
  }, [bookingId, confirmed, timedOut, polls, refetch]);

  if (!bookingId) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Missing booking reference"
        description="Stripe returned without a bookingId. Check your bookings list to confirm payment."
        action={
          <Button
            nativeButton={false}
            render={<Link href="/dashboard/customer" />}
          >
            My bookings
          </Button>
        }
      />
    );
  }

  if (isLoading && !booking) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-20 text-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
        <div className="space-y-1">
          <p className="text-sm font-medium">Confirming your payment…</p>
          <p className="text-sm text-muted-foreground">
            Waiting for Stripe to finish processing.
          </p>
        </div>
      </div>
    );
  }

  if (isError && !booking) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Couldn't load booking"
        description="Your payment may still have gone through. Check your bookings."
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
            <Button
              nativeButton={false}
              render={<Link href="/dashboard/customer" />}
            >
              My bookings
            </Button>
          </div>
        }
      />
    );
  }

  if (confirmed) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-20 text-center">
        <CheckCircle2
          className="size-12 text-success"
          aria-hidden="true"
        />
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Payment confirmed</h1>
          <p className="text-sm text-muted-foreground">
            {booking?.service?.name
              ? `You're all set for ${booking.service.name}.`
              : "Your booking is marked as paid."}
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2 pt-2">
          <Button
            nativeButton={false}
            render={
              <Link href={`/dashboard/customer/bookings/${bookingId}`} />
            }
          >
            View booking
          </Button>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/dashboard/customer" />}
          >
            Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (timedOut) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Still confirming payment"
        description="Stripe may still be notifying us. Your booking should update to Paid shortly — check your list in a moment."
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setPolls(0);
                void refetch();
              }}
            >
              Check again
            </Button>
            <Button
              nativeButton={false}
              render={<Link href="/dashboard/customer" />}
            >
              My bookings
            </Button>
          </div>
        }
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-20 text-center">
      <Loader2 className="size-8 animate-spin text-muted-foreground" />
      <div className="space-y-1">
        <p className="text-sm font-medium">Confirming your payment…</p>
        <p className="text-sm text-muted-foreground">
          Attempt {Math.min(polls + 1, MAX_POLLS)} of {MAX_POLLS}
        </p>
      </div>
    </div>
  );
}
