"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Home, Wrench, XCircle } from "lucide-react";
import { motion } from "motion/react";

import { Button } from "@/components/ui/button";

export function PaymentCancelView() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  return (
    <div className="relative flex min-h-[70vh] flex-1 flex-col overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,oklch(0.95_0.04_40)_0%,transparent_55%),radial-gradient(ellipse_at_bottom_right,oklch(0.96_0.02_264)_0%,transparent_50%)]"
      />

      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-16 sm:px-6">
        <p className="mb-10 inline-flex items-center gap-2 self-center text-sm font-semibold tracking-tight text-primary">
          <Wrench aria-hidden="true" className="size-4" />
          FixItNow
        </p>

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
            className="inline-flex size-20 items-center justify-center rounded-full bg-warning/15 text-warning"
          >
            <XCircle className="size-10" aria-hidden="true" />
          </motion.div>

          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Payment cancelled
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
              No charge was made. You can retry checkout whenever you&apos;re
              ready, or return to your booking.
            </p>
          </div>

          {bookingId ? (
            <p className="rounded-full bg-muted/80 px-4 py-1.5 font-mono text-xs text-muted-foreground">
              Booking {bookingId.slice(0, 8)}…
            </p>
          ) : null}

          <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
            {bookingId ? (
              <Button
                size="lg"
                className="rounded-full"
                nativeButton={false}
                render={
                  <Link
                    href={`/dashboard/customer/bookings/${bookingId}/pay`}
                  />
                }
              >
                Try again
                <ArrowRight aria-hidden="true" className="size-4" />
              </Button>
            ) : null}
            <Button
              size="lg"
              variant="outline"
              className="rounded-full"
              nativeButton={false}
              render={
                bookingId ? (
                  <Link href={`/dashboard/customer/bookings/${bookingId}`} />
                ) : (
                  <Link href="/dashboard/customer" />
                )
              }
            >
              <Home aria-hidden="true" className="size-4" />
              {bookingId ? "View booking" : "Dashboard"}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
