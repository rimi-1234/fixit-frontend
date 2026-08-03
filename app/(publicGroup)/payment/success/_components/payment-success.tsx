"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Home,
  Loader2,
  Wrench,
} from "lucide-react";
import { motion } from "motion/react";

import { BookingStatusBadge } from "@/components/booking-status-badge";
import { Button } from "@/components/ui/button";
import { useBooking } from "@/hooks/use-bookings";
import { queryKeys } from "@/lib/query-keys";
import type { BookingStatus } from "@/lib/types";
import { formatCurrency } from "@/utils/format-currency";
import { formatDateTime } from "@/utils/format-date";
import { displayNameFromEmail } from "@/utils/display-name";

const CONFIRMED: BookingStatus[] = ["PAID", "IN_PROGRESS", "COMPLETED"];
const POLL_MS = 2000;
const MAX_POLLS = 6;

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-[70vh] flex-1 flex-col overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,oklch(0.94_0.05_145)_0%,transparent_55%),radial-gradient(ellipse_at_bottom_right,oklch(0.95_0.03_264)_0%,transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top,oklch(0.28_0.05_145)_0%,transparent_55%),radial-gradient(ellipse_at_bottom_right,oklch(0.24_0.04_264)_0%,transparent_50%)]"
      />
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-16 sm:px-6">
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-2 self-center text-sm font-semibold tracking-tight text-primary"
        >
          <Wrench aria-hidden="true" className="size-4" />
          FixItNow
        </Link>
        {children}
      </div>
    </div>
  );
}

export function PaymentSuccessView() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId")?.trim() || undefined;
  const sessionId =
    searchParams.get("session_id")?.trim() ||
    searchParams.get("sessionId")?.trim() ||
    undefined;

  const queryClient = useQueryClient();
  const [polls, setPolls] = useState(0);

  const { data: booking, isLoading, isError, isFetching, refetch } =
    useBooking(bookingId);

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

  const pollStep = Math.min(polls + 1, MAX_POLLS);
  const pollTotal = MAX_POLLS;

  if (!bookingId) {
    return (
      <Shell>
        <StatusBlock
          tone="warning"
          icon={AlertCircle}
          title="Missing booking reference"
          description={
            sessionId
              ? "Checkout returned a Stripe session, but no booking id. Check your bookings — payment may still have gone through."
              : "We couldn’t find a booking id in the URL. Open your dashboard to confirm payment status."
          }
          meta={
            sessionId ? (
              <p className="rounded-full bg-muted/80 px-4 py-1.5 font-mono text-xs text-muted-foreground">
                Session {sessionId.slice(0, 14)}…
              </p>
            ) : null
          }
          actions={
            <Button
              className="rounded-full"
              nativeButton={false}
              render={<Link href="/dashboard/customer/bookings" />}
            >
              My bookings
            </Button>
          }
        />
      </Shell>
    );
  }

  if ((isLoading && !booking) || (!confirmed && !timedOut && !isError)) {
    return (
      <Shell>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-5 text-center"
        >
          <div className="inline-flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Loader2 className="size-8 animate-spin" aria-hidden="true" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Confirming your payment…
            </h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              Syncing checkout with FixItNow
              {isFetching || pollStep > 1
                ? ` (${pollStep}/${pollTotal})`
                : "…"}
            </p>
          </div>
          {sessionId ? (
            <p className="rounded-full bg-muted/80 px-4 py-1.5 font-mono text-xs text-muted-foreground">
              Session {sessionId.slice(0, 14)}…
            </p>
          ) : null}
        </motion.div>
      </Shell>
    );
  }

  if (isError && !booking) {
    return (
      <Shell>
        <StatusBlock
          tone="warning"
          icon={AlertCircle}
          title="Couldn't load booking"
          description="Your payment may still have gone through. Check your bookings list or try again."
          actions={
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => void refetch()}
              >
                Retry
              </Button>
              <Button
                className="rounded-full"
                nativeButton={false}
                render={<Link href="/dashboard/customer/bookings" />}
              >
                My bookings
              </Button>
            </div>
          }
        />
      </Shell>
    );
  }

  if (timedOut && !confirmed) {
    return (
      <Shell>
        <StatusBlock
          tone="warning"
          icon={AlertCircle}
          title="Still confirming"
          description="The payment gateway may still be notifying us. Your booking should flip to Paid shortly."
          meta={
            booking ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Current status</span>
                <BookingStatusBadge status={booking.status} />
              </div>
            ) : null
          }
          actions={
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => void refetch()}
              >
                Check again
              </Button>
              <Button
                className="rounded-full"
                nativeButton={false}
                render={
                  <Link href={`/dashboard/customer/bookings/${bookingId}`} />
                }
              >
                View booking
              </Button>
            </div>
          }
        />
      </Shell>
    );
  }

  return (
    <Shell>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-8 text-center"
      >
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.05 }}
          className="inline-flex size-20 items-center justify-center rounded-full bg-success/15 text-success"
        >
          <CheckCircle2 className="size-10" aria-hidden="true" />
        </motion.div>

        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Payment successful
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            {booking?.service?.name
              ? `You’re booked for ${booking.service.name}. We’ll keep you updated as your technician prepares.`
              : "Your booking is marked as paid. You’re all set."}
          </p>
        </div>

        <dl className="w-full divide-y divide-border/60 border-y border-border/60 text-left text-sm">
          {booking?.service?.name ? (
            <div className="flex justify-between gap-4 py-3.5">
              <dt className="text-muted-foreground">Service</dt>
              <dd className="text-right font-medium">{booking.service.name}</dd>
            </div>
          ) : null}
          {booking?.technician?.email ? (
            <div className="flex justify-between gap-4 py-3.5">
              <dt className="text-muted-foreground">Technician</dt>
              <dd className="text-right font-medium">
                {displayNameFromEmail(booking.technician.email)}
              </dd>
            </div>
          ) : null}
          {booking?.scheduledTime ? (
            <div className="flex justify-between gap-4 py-3.5">
              <dt className="text-muted-foreground">Scheduled</dt>
              <dd className="text-right font-medium">
                {formatDateTime(booking.scheduledTime)}
              </dd>
            </div>
          ) : null}
          {booking?.payment?.amount != null ? (
            <div className="flex justify-between gap-4 py-3.5">
              <dt className="text-muted-foreground">Paid</dt>
              <dd className="text-right font-semibold">
                {formatCurrency(booking.payment.amount)}
                {booking.payment.provider
                  ? ` · ${booking.payment.provider}`
                  : ""}
              </dd>
            </div>
          ) : null}
          <div className="flex items-center justify-between gap-4 py-3.5">
            <dt className="text-muted-foreground">Status</dt>
            <dd>
              <BookingStatusBadge status={booking?.status ?? "PAID"} />
            </dd>
          </div>
          {sessionId ? (
            <div className="flex justify-between gap-4 py-3.5">
              <dt className="text-muted-foreground">Session</dt>
              <dd className="truncate font-mono text-xs text-muted-foreground">
                {sessionId.slice(0, 18)}…
              </dd>
            </div>
          ) : null}
        </dl>

        <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
          <Button
            size="lg"
            className="rounded-full"
            nativeButton={false}
            render={
              <Link href={`/dashboard/customer/bookings/${bookingId}`} />
            }
          >
            View booking
            <ArrowRight aria-hidden="true" className="size-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="rounded-full"
            nativeButton={false}
            render={<Link href="/dashboard/customer" />}
          >
            <Home aria-hidden="true" className="size-4" />
            Dashboard
          </Button>
        </div>
      </motion.div>
    </Shell>
  );
}

function StatusBlock({
  icon: Icon,
  title,
  description,
  actions,
  meta,
  tone,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  description: string;
  actions: React.ReactNode;
  meta?: React.ReactNode;
  tone: "warning" | "danger";
}) {
  const toneClass =
    tone === "danger"
      ? "bg-destructive/10 text-destructive"
      : "bg-warning/15 text-warning";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-6 text-center"
    >
      <div
        className={`inline-flex size-16 items-center justify-center rounded-full ${toneClass}`}
      >
        <Icon className="size-8" aria-hidden={true} />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h1>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
          {description}
        </p>
      </div>
      {meta}
      {actions}
    </motion.div>
  );
}
